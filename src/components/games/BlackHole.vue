<template>
  <div
    v-if="isValidGame"
    class="flex-grow flex flex-col items-center justify-between h-full p-2 sm:p-3 select-none"
  >
    <GameHeader
      title="Black Hole"
      :connection-status="connectionStatus"
      :current-player="gameState.currentPlayer"
      :player="player"
      :game-over="gameOver"
      :winner="gameState.winner"
      :extra-info="`P1: ${player1Turns}/${gameState.maxTurnsPerPlayer} | P2: ${player2Turns}/${gameState.maxTurnsPerPlayer}`"
      :game-state="gameState"
      :socket="socket"
      :room-key="roomKey"
    />

    <!-- Content Area -->
    <div
      class="flex-grow flex flex-col items-center justify-center overflow-auto py-1 sm:py-2 w-full"
    >
      <!-- Cosmic Board Card -->
      <div
        class="bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow p-2 sm:p-3 transition-all duration-100 flex flex-col items-center rounded-none"
        :class="boardTurnClass"
      >
        <!-- Triangular Grid -->
        <div
          v-for="row in 6"
          :key="row"
          class="flex justify-center mb-1 sm:mb-1.5"
          :class="{ 'mb-0': row === 6 }"
        >
          <div
            v-for="col in row"
            :key="`${row}-${col}`"
            class="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-13 xl:h-13 rounded-full flex items-center justify-center font-black text-xs sm:text-sm md:text-base cursor-pointer mx-1 sm:mx-1.5 relative group"
            :class="[getCircleStyle(row, col), lastMoveClass(row, col), { 'animate-token-place': getCircleData(row, col) && gameState.lastMove?.row === row && gameState.lastMove?.col === col }]"
            @click="clickCircle(row, col)"
          >
            <!-- Slow spinning Vortex for Black Hole -->
            <img
              v-if="showBlackHoleIcon(row, col)"
              src="/icons/black-hole.svg"
              alt="Black Hole"
              class="w-[85%] h-[85%] object-contain p-0.5 animate-[spin_8s_linear_infinite]"
            />

            <!-- Placed token text -->
            <span v-else>{{ getCircleText(row, col) }}</span>

            <!-- Hover Turn Preview -->
            <div
              v-if="showHoverPreview(row, col)"
              class="absolute inset-0 rounded-full border-2 border-dashed flex items-center justify-center opacity-0 group-hover:opacity-60 pointer-events-none"
              :class="
                player === 1
                  ? 'border-blue-500 text-blue-500'
                  : 'border-rose-500 text-rose-500'
              "
            >
              {{ nextTurnNumber }}
            </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Scores & Actions -->
  <div
        v-if="gameOver"
        class="flex flex-col items-center mt-2.5 sm:mt-3.5 transition-all duration-300 animate-slide-up"
      >
        <div
          class="bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow-sm px-4 py-1.5 mb-2.5 text-center rounded-none flex items-center justify-center gap-x-6 text-xs sm:text-sm font-black uppercase"
        >
          <div class="flex items-center space-x-1.5">
            <span class="text-neo-accent">{{ p1Name }}:</span>
            <span class="font-mono">{{ gameState.scores?.player1 || 0 }}</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="text-neo-secondary">{{ p2Name }}:</span>
            <span class="font-mono">{{ gameState.scores?.player2 || 0 }}</span>
          </div>
        </div>
        <button
          @click="newGame"
          :disabled="ready"
          class="bg-neo-accent text-white font-black py-2.5 px-6 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider"
        >
          <span v-if="ready" class="flex items-center gap-1.5 justify-center">Waiting for opponent<WaitingIndicator /></span>
          <span v-else>Play Again</span>
        </button>
      </div>
  </div>
  <div
    v-else
    class="h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 animate-fade-in"
  >
    <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
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
import type { BlackHoleGameState as GameState } from '../../types/shared.js';

export default defineComponent({
  name: 'BlackHole',
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
        circles: {},
        currentPlayer: 1,
        totalMoves: 0,
        maxTurnsPerPlayer: 10,
        players: [],
        scores: { player1: 0, player2: 0 },
        winner: '',
      }
    );

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => gameState.value && gameState.value.totalMoves >= gameState.value.maxTurnsPerPlayer * 2,
      lobbyRoute: '/black-hole/lobby',
    });

    const confetti = useConfetti();

    watch(() => gameState.value?.totalMoves >= (gameState.value?.maxTurnsPerPlayer || 10) * 2, (newVal, oldVal) => {
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
    p1Name(): string {
      const p = this.gameState.players.find((p: any) => p.player === 1);
      return p?.name || 'Player 1';
    },
    p2Name(): string {
      const p = this.gameState.players.find((p: any) => p.player === 2);
      return p?.name || 'Player 2';
    },
    isValidGame() {
      return this.roomKey && this.player && this.gameState.players.length >= 1;
    },
    currentPlayerClass() {
      return this.gameState.currentPlayer === 1
        ? 'text-blue-600'
        : 'text-red-600';
    },
    gameOver() {
      return this.gameState.totalMoves >= this.gameState.maxTurnsPerPlayer * 2;
    },
    player1Turns() {
      return Object.values(this.gameState.circles).filter(
        (circle) => circle.player === 1
      ).length;
    },
    player2Turns() {
      return Object.values(this.gameState.circles).filter(
        (circle) => circle.player === 2
      ).length;
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
      return this.allPositions.filter((pos) => !taken.includes(pos));
    },
    nextTurnNumber() {
      return Math.floor(this.gameState.totalMoves / 2) + 1;
    },
    boardTurnClass() {
      if (this.gameOver) return '';
      if (this.gameState.currentPlayer === 1) {
        return 'ring-4 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-slate-900';
      } else {
        return 'ring-4 ring-rose-500 dark:ring-rose-400 ring-offset-2 dark:ring-offset-slate-900';
      }
    },
    winnerTextClass() {
      if (!this.gameOver) return '';
      const winnerText = this.gameState.winner.toLowerCase();
      if (winnerText.includes('tie')) {
        return 'text-gray-600';
      }
      const me = this.gameState.players.find((p: any) => p.player === this.player);
      if (me && me.name && winnerText.includes(me.name.toLowerCase())) {
        return 'text-green-600';
      }
      if (winnerText.includes(`player ${this.player} wins`)) {
        return 'text-green-600';
      }
      return 'text-red-600';
    },
  },
  methods: {
    clickCircle(row: number, col: number) {
      if (
        this.gameOver
        || this.player !== this.gameState.currentPlayer
        || this.gameState.players.length < 2
      ) {
        return;
      }
      this.socket.emit('make-move', { roomKey: this.roomKey, row, col });
    },
    showHoverPreview(row: number, col: number) {
      if (
        this.gameOver
        || this.player !== this.gameState.currentPlayer
        || this.gameState.players.length < 2
      ) {
        return false;
      }
      return !this.getCircleData(row, col);
    },
    getCircleData(row: number, col: number) {
      return this.gameState.circles[`${row}-${col}`] || null;
    },
    getCircleStyle(row: number, col: number) {
      const key = `${row}-${col}`;
      const data = this.getCircleData(row, col);

      if (this.gameOver && this.remainingPositions.includes(key)) {
        return 'bg-purple-600 dark:bg-purple-800 neo-border-2 shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#FFFFFF] scale-105';
      }

      if (this.gameOver && this.remainingPositions.length === 1) {
        const blackCircle = this.remainingPositions[0];
        const [blackRow, blackCol] = blackCircle.split('-').map(Number);
        const neighbors = this.getNeighbors(blackRow, blackCol);
        if (neighbors.includes(key)) {
          return data
            ? data.player === 1
              ? 'bg-blue-500 dark:bg-blue-600 border-4 border-amber-400 dark:border-amber-300 text-white scale-105'
              : 'bg-rose-500 dark:bg-rose-600 border-4 border-amber-400 dark:border-amber-300 text-white scale-105'
            : 'bg-white dark:bg-neo-card-bg border-4 border-amber-400 dark:border-amber-300';
        }
      }

      if (data) {
        return data.player === 1
          ? 'bg-blue-500 dark:bg-blue-600 neo-border-2 text-white'
          : 'bg-rose-500 dark:bg-rose-600 neo-border-2 text-white';
      }

      return 'bg-white dark:bg-neo-card-bg neo-border-2 text-neo-text/40 hover:border-neo-accent hover:bg-neo-secondary/20';
    },
    getCircleText(row: number, col: number) {
      const data = this.getCircleData(row, col);
      return data?.turn || '';
    },
    lastMoveClass(row: number, col: number) {
      if (!this.gameState.lastMove) return '';
      return this.gameState.lastMove.row === row && this.gameState.lastMove.col === col
        ? 'ring-4 ring-yellow-400 dark:ring-yellow-300 ring-offset-2 dark:ring-offset-neo-card-bg z-10'
        : '';
    },
    showBlackHoleIcon(row: number, col: number) {
      const key = `${row}-${col}`;
      return this.gameOver && this.remainingPositions.includes(key);
    },
    getNeighbors(row: number, col: number) {
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
      return neighbors.filter((pos) => this.allPositions.includes(pos));
    },
  },
});
</script>
