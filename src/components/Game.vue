<template>
  <div v-if="isValidGame" class="flex-grow flex flex-col items-center justify-between min-h-screen p-4 sm:p-6 md:p-8 select-none">
    <GameHeader
      title="Black Hole"
      :current-player="gameState.currentPlayer"
      :player="player"
      :game-over="gameOver"
      :winner="gameState.winner"
      :extra-info="`P1: ${player1Turns}/${gameState.maxTurnsPerPlayer} | P2: ${player2Turns}/${gameState.maxTurnsPerPlayer}`"
    />

    <!-- Content Area -->
    <div class="flex-grow flex flex-col items-center justify-center overflow-auto py-4">
      <div v-for="row in 6" :key="row" class="flex justify-center mb-2.5" :class="{ 'mb-0': row === 6 }">
        <div v-for="col in row" :key="`${row}-${col}`"
          class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full border-2 cursor-pointer transition-all duration-200 mx-1 sm:mx-2 flex items-center justify-center font-bold text-xs sm:text-sm md:text-base"
          :class="getCircleStyle(row, col)" @click="clickCircle(row, col)">
          <img v-if="showBlackHoleIcon(row, col)" src="/icon.png" alt="Black Hole"
            class="w-full h-full object-contain p-1">
          <span v-else>{{ getCircleText(row, col) }}</span>
        </div>
      </div>

      <!-- Scores & Actions -->
      <div v-if="gameOver" class="flex flex-col items-center mt-6 transition-all duration-300">
        <div class="text-sm text-gray-600 mb-4 text-center">
          <p>Player 1 Score: {{ gameState.scores?.player1 || 0 }}</p>
          <p>Player 2 Score: {{ gameState.scores?.player2 || 0 }}</p>
        </div>
        <button @click="newGame" :disabled="ready"
          class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ ready ? 'Waiting for opponent...' : 'Play Again' }}
        </button>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
    <p class="text-lg sm:text-xl text-gray-600">Invalid game state. Redirecting to lobby...</p>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import GameHeader from './GameHeader.vue';

export default {
  components: {
    GameHeader,
  },
  props: {
    socket: Object,
    player: Number,
    roomKey: String,
    initialGameState: Object,
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      ready: false,
      otherPlayerReady: false,
      isLeavingDueToDisconnect: false,
      gameState: this.initialGameState || {
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
  computed: {
    isValidGame() {
      return this.roomKey && this.player && this.gameState.players.length >= 1;
    },
    currentPlayerClass() {
      return this.gameState.currentPlayer === 1 ? 'text-blue-600' : 'text-red-600';
    },
    gameOver() {
      return this.gameState.totalMoves >= (this.gameState.maxTurnsPerPlayer * 2);
    },
    player1Turns() {
      return Object.values(this.gameState.circles).filter(circle => circle.player === 1).length;
    },
    player2Turns() {
      return Object.values(this.gameState.circles).filter(circle => circle.player === 2).length;
    },
    allPositions() {
      const positions = [];
      for (let row = 1; row <= 6; row++) {
        for (let col = 1; col <= row; col++) {
          positions.push(`${row}-${col}`);
        }
      }
      return positions;
    },
    remainingPositions() {
      const taken = Object.keys(this.gameState.circles);
      return this.allPositions.filter(pos => !taken.includes(pos));
    },
    winnerTextClass() {
      if (!this.gameOver) return '';
      const winnerText = this.gameState.winner.toLowerCase();
      if (winnerText.includes('tie')) {
        return 'text-gray-600';
      }
      if (winnerText.includes(`player ${this.player} wins`)) {
        return 'text-green-600';
      }
      return 'text-red-600';
    },
  },
  methods: {
    clickCircle(row, col) {
      if (this.gameOver || this.player !== this.gameState.currentPlayer || this.gameState.players.length < 2) {
        return;
      }
      this.socket.emit('make-move', { roomKey: this.roomKey, row, col });
    },
    getCircleData(row, col) {
      return this.gameState.circles[`${row}-${col}`] || null;
    },
    getCircleStyle(row, col) {
      const key = `${row}-${col}`;
      const data = this.getCircleData(row, col);

      if (this.gameOver && this.remainingPositions.includes(key)) {
        return 'bg-black border-black text-white';
      }

      if (this.gameOver && this.remainingPositions.length === 1) {
        const blackCircle = this.remainingPositions[0];
        const [blackRow, blackCol] = blackCircle.split('-').map(Number);
        const neighbors = this.getNeighbors(blackRow, blackCol);
        if (neighbors.includes(key)) {
          return data
            ? (data.player === 1
              ? 'bg-blue-500 border-black border-4 xs:border-2 text-white'
              : 'bg-red-500 border-black border-4 xs:border-2 text-white')
            : 'bg-white border-black border-4 text-gray-400';
        }
      }

      if (data) {
        return data.player === 1
          ? 'bg-blue-500 border-blue-600 text-white'
          : 'bg-red-500 border-red-600 text-white';
      }

      return 'bg-white border-gray-400 hover:bg-gray-50 text-gray-400';
    },
    getCircleText(row, col) {
      const data = this.getCircleData(row, col);
      return data?.turn || '';
    },
    showBlackHoleIcon(row, col) {
      const key = `${row}-${col}`;
      return this.gameOver && this.remainingPositions.includes(key);
    },
    getNeighbors(row, col) {
      const neighbors = [];
      if (col > 1) neighbors.push(`${row}-${col - 1}`);
      if (col < row) neighbors.push(`${row}-${col + 1}`);
      if (row > 1) {
        if (col <= row - 1) neighbors.push(`${row - 1}-${col}`);
        if (col > 1) neighbors.push(`${row - 1}-${col - 1}`);
      }
      if (row < 6) {
        neighbors.push(`${row + 1}-${col}`);
        if (col <= row) neighbors.push(`${row + 1}-${col + 1}`);
      }
      return neighbors.filter(pos => this.allPositions.includes(pos));
    },
    newGame() {
      this.ready = true;
      this.socket.emit('new-game', { roomKey: this.roomKey });
    },
    handleBeforeUnload(event) {
      if (!this.gameOver && this.gameState.players.length === 2) {
        event.preventDefault();
        event.returnValue = ''; // Standard browser exit prompt
      }
    },
  },
  mounted() {
    if (!this.isValidGame) {
      this.router.push('/black-hole/lobby');
      return;
    }

    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.socket.on('game-state', (newState) => {
      this.gameState = newState;
      if (this.gameState.players.length < 2 && !this.gameOver) {
        this.router.push('/black-hole/lobby');
      }
    });

    this.socket.on('player-ready', (player) => {
      if (player !== this.player) {
        this.otherPlayerReady = true;
      }
    });
  },
  beforeUnmount() {
    if (this.roomKey) {
      this.socket.emit('leave-room', { roomKey: this.roomKey });
    }
    this.socket.off('game-state');
    this.socket.off('player-ready');
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeRouteLeave(to, from, next) {
    if (this.isLeavingDueToDisconnect || this.router.isLeavingDueToDisconnect) {
      next();
      return;
    }
    if (!this.gameOver && this.gameState.players.length === 2) {
      const answer = window.confirm('Are you sure you want to leave the ongoing game? This will disconnect you and end the game.');
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
};
</script>