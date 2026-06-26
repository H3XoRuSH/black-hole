<template>
  <div v-if="isValidGame">
    <!-- Fixed Header -->
    <div
      class="h-32 sm:h-40 md:h-48 flex-shrink-0 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
      <h1 class="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Black Hole</h1>
      <div class="text-sm sm:text-base md:text-lg text-center">
        <span :class="gameState.currentPlayer === 1 ? 'text-blue-600 font-bold' : 'text-blue-600'">Player 1
          (Blue)</span>
        <span class="mx-1 sm:mx-2">vs</span>
        <span :class="gameState.currentPlayer === 2 ? 'text-red-600 font-bold' : 'text-red-600'">Player 2 (Red)</span>
      </div>
      <div class="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center px-2">
        <span v-if="!gameOver">
          <span class="block sm:inline">Current Turn:
            <span class="font-bold" :class="currentPlayerClass">
              Player {{ gameState.currentPlayer }}
            </span>
          </span>
          <span class="block sm:inline mt-1 sm:mt-0 sm:ml-1">
            (P1: {{ player1Turns }}/{{ gameState.maxTurnsPerPlayer }} | P2: {{ player2Turns }}/{{
              gameState.maxTurnsPerPlayer }})
          </span>
        </span>
        <span v-else class="font-bold text-base sm:text-lg" :class="winnerTextClass">
          Game Over! {{ gameState.winner }}
        </span>
      </div>
      <div class="text-xs sm:text-sm text-gray-600 mt-1">
        You are Player {{ player }}
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-grow flex flex-col items-center justify-center overflow-auto">
      <div v-for="row in 6" :key="row" class="flex justify-center mb-4" :class="{ 'mb-0': row === 6 }">
        <div v-for="col in row" :key="`${row}-${col}`"
          class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full border-2 cursor-pointer transition-all duration-200 mx-1 sm:mx-2 flex items-center justify-center font-bold text-xs sm:text-sm md:text-base"
          :class="getCircleStyle(row, col)" @click="clickCircle(row, col)">
          <img v-if="showBlackHoleIcon(row, col)" src="/icon.png" alt="Black Hole"
            class="w-full h-full object-contain p-1">
          <span v-else>{{ getCircleText(row, col) }}</span>
        </div>
      </div>
    </div>

    <!-- Fixed Footer -->
    <div class="h-48 flex-shrink-0 flex flex-col items-center justify-center px-8 py-3 sm:py-4 md:py-6">
      <div v-if="gameOver" class="text-sm text-gray-600 mt-2 mb-4">
        <p>Player 1 Score: {{ gameState.scores?.player1 || 0 }}</p>
        <p>Player 2 Score: {{ gameState.scores?.player2 || 0 }}</p>
      </div>
      <button v-if="gameOver" @click="newGame" :disabled="ready"
        class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
        {{ ready ? 'Waiting for Other Player' : 'New Game' }}
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
    <p class="text-lg sm:text-xl text-gray-600">Invalid game state. Redirecting to lobby...</p>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
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

    this.socket.on('player-disconnected', () => {
      this.ready = false;
      this.otherPlayerReady = false;
      this.isLeavingDueToDisconnect = true;
      this.router.push('/black-hole/lobby');
    });
  },
  beforeUnmount() {
    if (this.roomKey) {
      this.socket.emit('leave-room', { roomKey: this.roomKey });
    }
    this.socket.off('game-state');
    this.socket.off('player-ready');
    this.socket.off('player-disconnected');
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