<template>
  <div
    v-if="isValidGame"
    class="flex-grow flex flex-col items-center justify-between h-full p-3 sm:p-6 md:p-8 select-none"
  >
    <!-- Game Header -->
    <GameHeader
      title="Connect Four"
      :connection-status="connectionStatus"
      :current-player="gameState.currentPlayer"
      :player="player"
      :game-over="gameOver"
      :winner="gameState.winner"
      :game-state="gameState"
      :socket="socket"
      :room-key="roomKey"
    />

    <!-- Connect Four Board -->
    <div class="flex-grow flex items-center justify-center py-2 sm:py-4 w-full">
      <!-- Grid wrapper with neo-brutalist container -->
      <div
        class="bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow p-2 sm:p-4 rounded-none w-full max-w-[260px] xs:max-w-[320px] sm:max-w-[430px] md:max-w-[480px]"
      >
        <!-- Mobile column selector (touch-friendly) -->
        <div class="flex justify-center gap-1 mb-2 md:hidden">
          <button
            v-for="colIndex in 7"
            :key="`mobile-col-${colIndex - 1}`"
            @click="makeMove(colIndex - 1)"
            :disabled="!canPlayColumn(colIndex - 1)"
            class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-100 touch-target disabled:opacity-30 disabled:cursor-not-allowed"
            :class="canPlayColumn(colIndex - 1) ? 'hover:scale-110 active:scale-95' : ''"
            :aria-label="`Drop disc in column ${colIndex}`"
          >
            <div
              v-if="canPlayColumn(colIndex - 1)"
              class="w-5 h-5 rounded-full border-2 border-black dark:border-white animate-bounce opacity-70"
              :class="player === 1 ? 'bg-blue-500' : 'bg-rose-500'"
            ></div>
            <div v-else class="w-5 h-5 rounded-full border-2 border-neo-border/30 bg-neo-bg"></div>
          </button>
        </div>

        <!-- Columns Grid -->
        <div class="grid grid-cols-7 gap-1 sm:gap-3">
          <!-- Hover & Interactive Columns -->
          <div
            v-for="colIndex in 7"
            :key="`col-${colIndex - 1}`"
            class="flex flex-col space-y-1.5 sm:space-y-3 cursor-pointer group rounded-none p-1 hover:bg-neo-secondary/20 dark:hover:bg-neo-secondary/10 transition-colors duration-100 relative"
            @click="makeMove(colIndex - 1)"
          >
            <!-- Preview slot at the top (desktop hover, mobile always shows) -->
            <div
              class="absolute -top-10 left-1/2 -translate-x-1/2 md:group-hover:block pointer-events-none hidden md:block"
            >
              <div
                v-if="canPlayColumn(colIndex - 1)"
                class="w-8 h-8 rounded-full animate-bounce opacity-60 neo-border-2"
                :class="player === 1 ? 'bg-blue-500' : 'bg-rose-500'"
              ></div>
            </div>

            <!-- Vertical grid slots in column -->
            <div
              v-for="rowIndex in 6"
              :key="`cell-${rowIndex - 1}-${colIndex - 1}`"
              class="aspect-square rounded-full flex items-center justify-center relative overflow-hidden bg-neo-bg neo-border-2"
            >
              <!-- Placed Disc -->
              <div
                v-if="gameState.board[rowIndex - 1][colIndex - 1]"
                class="w-[92%] h-[92%] rounded-full z-10"
                :class="[getDiscClass(rowIndex - 1, colIndex - 1), lastMoveClass(rowIndex - 1, colIndex - 1), { 'animate-disc-drop': gameState.lastMove?.row === rowIndex - 1 && gameState.lastMove?.col === colIndex - 1 }]"
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="w-full max-w-lg flex flex-col items-center justify-center py-2 sm:py-4 animate-slide-up">
      <button
        v-if="gameOver"
        @click="newGame"
        :disabled="ready"
        class="bg-neo-accent text-white font-black py-2.5 px-6 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider"
      >
        <span v-if="ready" class="flex items-center gap-1.5 justify-center">Waiting for opponent<WaitingIndicator /></span>
        <span v-else>Play Again</span>
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
    <p class="text-lg text-gray-500 dark:text-gray-400 font-medium">
      Invalid game state. Redirecting to lobby...
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { Socket } from 'socket.io-client';
import GameHeader from '../layout/GameHeader.vue';
import WaitingIndicator from '../ui/WaitingIndicator.vue';
import { useGame } from '../../composables/useGame.js';
import { useConfetti } from '../../composables/useConfetti.js';
import type { ConnectFourGameState as GameState } from '../../types/shared.js';

export default defineComponent({
  name: 'ConnectFour',
  components: {
    GameHeader,
    WaitingIndicator,
  },
  emits: ['update-connection-status', 'update-player', 'update-room-key'],
  props: {
    socket: {
      type: Object as PropType<Socket>,
      required: true,
    },
    player: {
      type: Number,
      required: true,
    },
    roomKey: {
      type: String,
      required: true,
    },
    initialGameState: {
      type: Object as PropType<GameState>,
      required: true,
    },
    connectionStatus: String,
  },
  setup(props) {
    const gameState = ref<GameState>(
      props.initialGameState || {
        board: Array(6)
          .fill(null)
          .map(() => Array(7).fill(null)),
        currentPlayer: 1,
        totalMoves: 0,
        players: [],
        winner: '',
      }
    );

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/connect-four/lobby',
    });

    const confetti = useConfetti();

    watch(() => gameState.value?.winner, (newVal, oldVal) => {
      if (newVal && !oldVal) {
        setTimeout(() => confetti.fire(), 300);
      }
    });

    return { ...game, gameState, confetti };
  },
  data() {
    return {};
  },
  computed: {
    isValidGame() {
      return (
        this.roomKey
        && this.player
        && this.gameState.players
        && this.gameState.players.length >= 1
      );
    },
    gameOver() {
      return !!this.gameState.winner;
    },
    winnerTextClass() {
      if (!this.gameState.winner) return '';
      if (this.gameState.winner.includes('Tie')) return 'text-gray-600';
      const me = this.gameState.players.find((p: any) => p.player === this.player);
      if (me && me.name && this.gameState.winner.toLowerCase().includes(me.name.toLowerCase())) {
        return 'text-green-600';
      }
      if (this.gameState.winner.includes(`Player ${this.player}`))
        return 'text-green-600';
      return 'text-red-600';
    },
  },
  methods: {
    canPlayColumn(colIndex: number) {
      if (
        this.gameOver
        || this.player !== this.gameState.currentPlayer
        || this.gameState.players.length < 2
      ) {
        return false;
      }
      return this.gameState.board && this.gameState.board[0][colIndex] === null;
    },
    makeMove(colIndex: number) {
      if (!this.canPlayColumn(colIndex)) return;
      this.socket.emit('make-move', { roomKey: this.roomKey, col: colIndex });
    },
    getDiscClass(row: number, col: number) {
      if (!this.gameState.board) return '';
      const disc = this.gameState.board[row][col];
      if (disc === 1)
        return 'bg-blue-500 dark:bg-blue-600 neo-border-2';
      if (disc === 2)
        return 'bg-rose-500 dark:bg-rose-600 neo-border-2';
      return '';
    },
    lastMoveClass(row: number, col: number) {
      if (!this.gameState.lastMove) return '';
      return this.gameState.lastMove.row === row && this.gameState.lastMove.col === col
        ? 'ring-4 ring-yellow-400 dark:ring-yellow-300 ring-offset-2 dark:ring-offset-neo-card-bg'
        : '';
    },
  },
});
</script>
