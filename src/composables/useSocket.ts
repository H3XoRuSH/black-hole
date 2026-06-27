import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io, Socket } from 'socket.io-client';
import type { Player } from '../types/shared.js';

interface GameState {
  circles?: Record<string, { player: number; turn: number }>;
  currentPlayer: number;
  totalMoves: number;
  maxTurnsPerPlayer?: number;
  players: Player[];
  scores?: { player1: number; player2: number };
  winner: string;
  board?: (number | null)[][];
  lines?: Record<string, number>;
  boxes?: Record<string, number>;
}

export function useSocket(router: any) {
  const socket = ref<Socket | null>(null);
  const player = ref<number | null>(null);
  const roomKey = ref('');
  const gameId = ref('black-hole');
  const connectionStatus = ref('Connecting to server...');
  const gameState = ref<GameState>({
    circles: {},
    currentPlayer: 1,
    totalMoves: 0,
    maxTurnsPerPlayer: 10,
    players: [],
    scores: { player1: 0, player2: 0 },
    winner: '',
  });

  function saveRoomData(key: string, p: number, gId: string) {
    sessionStorage.setItem('roomData', JSON.stringify({ roomKey: key, player: p, gameId: gId }));
  }

  function clearRoomData() {
    sessionStorage.removeItem('roomData');
  }

  function resetGameState() {
    gameState.value = {
      circles: {},
      currentPlayer: 1,
      totalMoves: 0,
      maxTurnsPerPlayer: 10,
      players: [],
      scores: { player1: 0, player2: 0 },
      winner: '',
    };
  }

  onMounted(() => {
    socket.value = io();

    if (!socket.value) return;

    socket.value.on('connect', () => {
      connectionStatus.value = '';

      const saved = sessionStorage.getItem('roomData');
      if (saved) {
        try {
          const { roomKey: savedKey, player: savedPlayer } = JSON.parse(saved);
          socket.value?.emit('reconnect-room', { roomKey: savedKey, playerNumber: savedPlayer });
        } catch {
          clearRoomData();
        }
        return;
      }

      roomKey.value = '';
      player.value = null;
      const isLobby = router.currentRoute.value.path.endsWith('/lobby');
      if (router.currentRoute.value.path !== '/menu' && !isLobby) {
        router.isLeavingDueToDisconnect = true;
        router.push('/menu').finally(() => {
          router.isLeavingDueToDisconnect = false;
        });
      }
    });

    socket.value.on('waiting-for-player', ({ roomKey: rk, player: p, gameId: gId }: { roomKey: string; player: number; gameId: string }) => {
      roomKey.value = rk;
      player.value = p;
      gameId.value = gId || 'black-hole';
      connectionStatus.value = 'Waiting for another player...';
      saveRoomData(rk, p, gameId.value);
      router.isLeavingDueToDisconnect = true;
      router.push(`/${gameId.value}/lobby`).finally(() => {
        router.isLeavingDueToDisconnect = false;
      });
    });

    socket.value.on('room-started', ({ roomKey: rk, player: p, gameId: gId, gameState: gs }: { roomKey: string; player: number; gameId: string; gameState: any }) => {
      roomKey.value = rk;
      player.value = p;
      gameId.value = gId || 'black-hole';
      gameState.value = gs;
      connectionStatus.value = '';
      saveRoomData(rk, p, gameId.value);
      router.push(`/${gameId.value}/game/${rk}`);
    });

    socket.value.on('reconnect-success', ({ roomKey: rk, player: p, gameId: gId, gameState: gs, gameStarted }: any) => {
      roomKey.value = rk;
      player.value = p;
      gameId.value = gId || 'black-hole';
      gameState.value = gs;
      connectionStatus.value = '';
      const route = gameStarted ? `/${gameId.value}/game/${rk}` : `/${gameId.value}/lobby`;
      router.push(route);
    });

    socket.value.on('reconnect-fail', ({ message }: { message: string }) => {
      clearRoomData();
      connectionStatus.value = message;
      roomKey.value = '';
      player.value = null;
      router.push('/menu');
    });

    socket.value.on('room-error', ({ message }: { message: string }) => {
      clearRoomData();
      connectionStatus.value = message;
      roomKey.value = '';
      player.value = null;
      resetGameState();
      router.isLeavingDueToDisconnect = true;
      router.push(`/${gameId.value}/lobby`).finally(() => {
        router.isLeavingDueToDisconnect = false;
      });
    });

    socket.value.on('player-disconnected', ({ message, gameId: gId, canReconnect }: { message: string; gameId: string; canReconnect?: boolean }) => {
      console.log(`Player disconnected: ${message}`);
      if (canReconnect) {
        connectionStatus.value = message;
        return;
      }
      clearRoomData();
      connectionStatus.value = message;
      roomKey.value = '';
      player.value = null;
      resetGameState();
      const targetGameId = gId || gameId.value || 'black-hole';
      router.isLeavingDueToDisconnect = true;
      router.push(`/${targetGameId}/lobby`).finally(() => {
        router.isLeavingDueToDisconnect = false;
      });
    });

    socket.value.on('player-reconnected', () => {
      connectionStatus.value = '';
    });

    socket.value.on('game-state', (gs: any) => {
      if (gs && gs.players) {
        const me = gs.players.find((p: any) => p.id === socket.value?.id);
        if (me && me.player !== player.value) {
          player.value = me.player;
          saveRoomData(roomKey.value, me.player, gameId.value);
        }
      }
    });

    socket.value.on('room-closed', ({ message }: { message: string }) => {
      clearRoomData();
      connectionStatus.value = message;
      roomKey.value = '';
      player.value = null;
      router.push('/menu');
    });

    socket.value.on('invalid-move', ({ message }: { message: string }) => {
      alert(message);
    });
  });

  onBeforeUnmount(() => {
    socket.value?.disconnect();
  });

  return {
    socket,
    player,
    roomKey,
    gameId,
    connectionStatus,
    gameState,
  };
}
