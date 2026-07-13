import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io, Socket } from 'socket.io-client';
import type { Player } from '../types/shared.js';
import { useToast } from './useToast.js';

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
  const isInitialLoading = ref(true);
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

  let offlineTimeout: any = null;

  onMounted(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    socket.value = io(backendUrl);

    if (!socket.value) return;

    // Start a 2-second timer to check if we connect. If not, redirect to /offline
    offlineTimeout = setTimeout(() => {
      if (socket.value && !socket.value.connected) {
        isInitialLoading.value = false;
        connectionStatus.value = 'offline';
        if (router.currentRoute.value.path !== '/offline') {
          router.push('/offline');
        }
      }
    }, 2000);

    socket.value.on('connect', () => {
      isInitialLoading.value = false;
      if (offlineTimeout) {
        clearTimeout(offlineTimeout);
      }
      connectionStatus.value = '';

      if (router.currentRoute.value.path === '/offline') {
        const { showToast } = useToast();
        showToast('Connected! Welcome back to the arcade.', 'success');
        router.push('/menu');
        return;
      }

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

    socket.value.on('connect_error', () => {
      isInitialLoading.value = false;
      connectionStatus.value = 'offline';
      if (router.currentRoute.value.path !== '/offline') {
        router.push('/offline');
      }
    });

    socket.value.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
        connectionStatus.value = 'offline';
        if (router.currentRoute.value.path !== '/offline') {
          const { showToast } = useToast();
          showToast('Connection lost! Trying to reconnect...', 'error');
          router.push('/offline');
        }
      }
    });

    socket.value.on('waiting-for-player', ({ roomKey: rk, player: p, gameId: gId, gameState: gs }: any) => {
      resetGameState();
      roomKey.value = rk;
      player.value = p;
      gameId.value = gId || 'black-hole';
      connectionStatus.value = '';
      if (gs) {
        gameState.value = gs;
      }
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
      gameState.value = gs;
      if (gs && gs.players) {
        const me = gs.players.find((p: any) => p.id === socket.value?.id);
        if (me && me.player !== player.value) {
          player.value = me.player;
          saveRoomData(roomKey.value, me.player, gameId.value);
        }
      }
    });

    socket.value.on('player-role', ({ player: p }: { player: number }) => {
      player.value = p;
      saveRoomData(roomKey.value, p, gameId.value);
    });

    socket.value.on('room-closed', ({ message }: { message: string }) => {
      clearRoomData();
      connectionStatus.value = message;
      roomKey.value = '';
      player.value = null;
      const targetGameId = gameId.value || 'black-hole';
      router.isLeavingDueToDisconnect = true;
      router.push(`/${targetGameId}/lobby`).finally(() => {
        router.isLeavingDueToDisconnect = false;
      });
    });

    socket.value.on('invalid-move', ({ message }: { message: string }) => {
      const { showToast } = useToast();
      showToast(message, 'error');
    });
  });

  onBeforeUnmount(() => {
    if (offlineTimeout) {
      clearTimeout(offlineTimeout);
    }
    socket.value?.disconnect();
  });

  return {
    socket,
    player,
    roomKey,
    gameId,
    connectionStatus,
    gameState,
    isInitialLoading,
  };
}
