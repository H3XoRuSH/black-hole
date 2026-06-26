<template>
  <div v-if="isValidGame" class="flex-grow flex flex-col items-center justify-between min-h-screen p-4 sm:p-6 md:p-8 select-none">
    <!-- Game Header -->
    <GameHeader
      title="Connect Four"
      :current-player="gameState.currentPlayer"
      :player="player"
      :game-over="gameOver"
      :winner="gameState.winner"
    />

    <!-- Connect Four Board -->
    <div class="flex-grow flex items-center justify-center py-4 w-full">
      <!-- Grid wrapper with blue plastic container look -->
      <div class="bg-blue-800 p-3 sm:p-5 rounded-2xl shadow-xl border-4 border-blue-900 w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[480px] md:max-w-[540px]">
        <!-- Columns Grid -->
        <div class="grid grid-cols-7 gap-2 sm:gap-3">
          <!-- Hover & Interactive Columns -->
          <div v-for="colIndex in 7" :key="`col-${colIndex - 1}`"
            class="flex flex-col space-y-2 sm:space-y-3 cursor-pointer group rounded-lg p-1 hover:bg-blue-700/50 transition-colors duration-150 relative"
            @click="makeMove(colIndex - 1)">
            
            <!-- Preview slot at the top (only on desktop/hover) -->
            <div class="absolute -top-10 left-1/2 -translate-x-1/2 hidden md:group-hover:block pointer-events-none">
              <div v-if="canPlayColumn(colIndex - 1)" 
                class="w-8 h-8 rounded-full shadow-inner animate-bounce"
                :class="player === 1 ? 'bg-blue-400' : 'bg-red-400'">
              </div>
            </div>

            <!-- Vertical grid slots in column -->
            <div v-for="rowIndex in 6" :key="`cell-${rowIndex - 1}-${colIndex - 1}`"
              class="aspect-square rounded-full flex items-center justify-center relative overflow-hidden bg-blue-950 shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)]">
              <!-- Placed Disc -->
              <div v-if="gameState.board[rowIndex - 1][colIndex - 1]"
                class="w-[90%] h-[90%] rounded-full shadow-md transform transition-all duration-300 scale-100"
                :class="getDiscClass(rowIndex - 1, colIndex - 1)">
                <!-- Inner detailing for realistic shiny disc look -->
                <div class="w-full h-full rounded-full border-2 border-white/20 bg-gradient-to-tr from-black/20 via-transparent to-white/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="w-full max-w-lg flex flex-col items-center justify-center py-4">
      <button v-if="gameOver" @click="newGame" :disabled="ready"
        class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ ready ? 'Waiting for opponent...' : 'Play Again' }}
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import GameHeader from './GameHeader.vue';

export default {
  name: 'ConnectFour',
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
        board: Array(6).fill(null).map(() => Array(7).fill(null)),
        currentPlayer: 1,
        totalMoves: 0,
        players: [],
        winner: '',
      },
    };
  },
  computed: {
    isValidGame() {
      return this.roomKey && this.player && this.gameState.players && this.gameState.players.length >= 1;
    },
    gameOver() {
      return !!this.gameState.winner;
    },
    winnerTextClass() {
      if (!this.gameState.winner) return '';
      if (this.gameState.winner.includes('Tie')) return 'text-gray-600';
      if (this.gameState.winner.includes(`Player ${this.player}`)) return 'text-green-600';
      return 'text-red-600';
    },
  },
  methods: {
    canPlayColumn(colIndex) {
      if (this.gameOver || this.player !== this.gameState.currentPlayer || this.gameState.players.length < 2) {
        return false;
      }
      return this.gameState.board[0][colIndex] === null;
    },
    makeMove(colIndex) {
      if (!this.canPlayColumn(colIndex)) return;
      this.socket.emit('make-move', { roomKey: this.roomKey, col: colIndex });
    },
    getDiscClass(row, col) {
      const disc = this.gameState.board[row][col];
      if (disc === 1) return 'bg-gradient-to-b from-blue-400 to-blue-600';
      if (disc === 2) return 'bg-gradient-to-b from-red-400 to-red-600';
      return '';
    },
    newGame() {
      this.ready = true;
      this.socket.emit('new-game', { roomKey: this.roomKey });
    },
    handleBeforeUnload(event) {
      if (!this.gameOver && this.gameState.players.length === 2) {
        event.preventDefault();
        event.returnValue = '';
      }
    },
  },
  mounted() {
    if (!this.isValidGame) {
      this.router.push('/connect-four/lobby');
      return;
    }

    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.socket.on('game-state', (newState) => {
      this.gameState = newState;
      if (this.gameState.players.length < 2 && !this.gameOver) {
        this.router.push('/connect-four/lobby');
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
    if (this.socket) {
      this.socket.off('game-state');
      this.socket.off('player-ready');
    }
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
