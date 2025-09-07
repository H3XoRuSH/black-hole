<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <router-view :socket="socket" :player="player" :room-key="roomKey" :connection-status="connectionStatus"
      :initial-game-state="gameState" @update-connection-status="connectionStatus = $event"
      @update-player="player = $event" @update-room-key="roomKey = $event"></router-view>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import router from './router';

export default {
  data() {
    return {
      socket: null,
      player: null,
      roomKey: '',
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
  mounted() {
    // Connect to Socket.IO server
    this.socket = io();

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connectionStatus = '';
      this.roomKey = '';
      this.player = null;
      router.push('/lobby');
    });

    this.socket.on('waiting-for-player', ({ roomKey, player }) => {
      console.log(`Waiting for player: room=${roomKey}, player=${player}`);
      this.roomKey = roomKey;
      this.player = player;
      this.connectionStatus = `Room ${roomKey} created. Waiting for another player...`;
      router.push('/lobby');
    });

    this.socket.on('room-started', ({ roomKey, player, gameState }) => {
      console.log(`Room started: room=${roomKey}, player=${player}, gameState.players=${JSON.stringify(gameState.players)}`);
      this.roomKey = roomKey;
      this.player = player;
      this.gameState = gameState;
      this.connectionStatus = '';
      router.push(`/game/${roomKey}`);
    });

    this.socket.on('room-error', ({ message }) => {
      console.log(`Room error: ${message}`);
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
      router.push('/lobby');
    });

    this.socket.on('player-disconnected', ({ message }) => {
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
      router.push('/lobby');
    });

    this.socket.on('invalid-move', ({ message }) => {
      console.log(`Invalid move: ${message}`);
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