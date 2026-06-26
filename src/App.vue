<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-gray-100 overflow-hidden">
    <Sidebar :room-key="roomKey" />
    <div class="flex-grow flex flex-col min-h-screen overflow-auto">
      <router-view :socket="socket" :player="player" :room-key="roomKey" :connection-status="connectionStatus"
        :initial-game-state="gameState" @update-connection-status="connectionStatus = $event"
        @update-player="player = $event" @update-room-key="roomKey = $event"></router-view>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import router from './router';
import Sidebar from './components/Sidebar.vue';

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      socket: null,
      player: null,
      roomKey: '',
      gameId: 'black-hole',
      connectionStatus: 'Connecting to server...',
      gameState: {
        circles: {},
        currentPlayer: 1,
        totalMoves: 0,
        maxTurnsPerPlayer: 10,
        players: [],
        scores: { player1: 0, player2: 0 },
        winner: '',
      },
    };
  },
  watch: {
    $route(to) {
      // If we navigate to an unrelated route, clean up room and connection state
      const isLobby = to.path === `/${this.gameId}/lobby`;
      const isGame = this.roomKey && to.path === `/${this.gameId}/game/${this.roomKey}`;
      if (!isLobby && !isGame) {
        this.roomKey = '';
        this.player = null;
        this.connectionStatus = '';
      }
    }
  },
  mounted() {
    // Connect to Socket.IO server
    this.socket = io();

    this.socket.on('connect', () => {
      this.connectionStatus = '';
      this.roomKey = '';
      this.player = null;
      // Only redirect to menu on reconnect if we are not already on the menu or lobby pages
      const isLobby = router.currentRoute.value.path.endsWith('/lobby');
      if (router.currentRoute.value.path !== '/menu' && !isLobby) {
        router.isLeavingDueToDisconnect = true;
        router.push('/menu').finally(() => {
          router.isLeavingDueToDisconnect = false;
        });
      }
    });

    this.socket.on('waiting-for-player', ({ roomKey, player, gameId }) => {
      this.roomKey = roomKey;
      this.player = player;
      this.gameId = gameId || 'black-hole';
      this.connectionStatus = 'Waiting for another player...';
      router.isLeavingDueToDisconnect = true;
      router.push(`/${this.gameId}/lobby`).finally(() => {
        router.isLeavingDueToDisconnect = false;
      });
    });

    this.socket.on('room-started', ({ roomKey, player, gameId, gameState }) => {
      this.roomKey = roomKey;
      this.player = player;
      this.gameId = gameId || 'black-hole';
      this.gameState = gameState;
      this.connectionStatus = '';
      router.push(`/${this.gameId}/game/${roomKey}`);
    });

    this.socket.on('room-error', ({ message }) => {
      this.connectionStatus = message;
      this.roomKey = '';
      this.player = null;
      this.gameState = {
        circles: {},
        currentPlayer: 1,
        totalMoves: 0,
        maxTurnsPerPlayer: 10,
        players: [],
        scores: { player1: 0, player2: 0 },
        winner: '',
      };
      router.isLeavingDueToDisconnect = true;
      router.push(`/${this.gameId}/lobby`).finally(() => {
        router.isLeavingDueToDisconnect = false;
      });
    });

    this.socket.on('player-disconnected', ({ message, gameId }) => {
      console.log(`Player disconnected: ${message}`);
      this.connectionStatus = message;
      this.roomKey = '';
      this.player = null;
      this.gameState = {
        circles: {},
        currentPlayer: 1,
        totalMoves: 0,
        maxTurnsPerPlayer: 10,
        players: [],
        scores: { player1: 0, player2: 0 },
        winner: '',
      };
      const targetGameId = gameId || this.gameId || 'black-hole';
      router.isLeavingDueToDisconnect = true;
      router.push(`/${targetGameId}/lobby`).finally(() => {
        router.isLeavingDueToDisconnect = false;
      });
    });

    this.socket.on('invalid-move', ({ message }) => {
      alert(message);
    });
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>