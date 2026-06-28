<template>
  <div
    v-if="isValidGame"
    class="flex-grow flex flex-col items-center justify-between h-full p-3 sm:p-4 md:p-6 select-none"
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
      class="flex-grow flex flex-col items-center justify-center overflow-auto py-2 sm:py-3 w-full"
    >
      <!-- Cosmic Board Card -->
      <div
        class="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl p-3 sm:p-4 transition-all duration-500 flex flex-col items-center"
        :class="boardTurnClass"
      >
        <!-- Triangular Grid -->
        <div
          v-for="row in 6"
          :key="row"
          class="flex justify-center mb-1.5 sm:mb-2"
          :class="{ 'mb-0': row === 6 }"
        >
          <div
            v-for="col in row"
            :key="`${row}-${col}`"
            class="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-13 lg:h-13 xl:w-14 xl:h-14 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-base cursor-pointer transition-all duration-200 mx-1 sm:mx-2 relative group"
            :class="getCircleStyle(row, col)"
            @click="clickCircle(row, col)"
          >
            <!-- Slow spinning Vortex for Black Hole -->
            <img
              v-if="showBlackHoleIcon(row, col)"
              src="/icon.png"
              alt="Black Hole"
              class="w-[85%] h-[85%] object-contain p-0.5 animate-[spin_8s_linear_infinite]"
            />

            <!-- Placed token text -->
            <span v-else>{{ getCircleText(row, col) }}</span>

            <!-- Hover Turn Preview -->
            <div
              v-if="showHoverPreview(row, col)"
              class="absolute inset-0 rounded-full border border-dashed flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity duration-200 pointer-events-none"
              :class="
                player === 1
                  ? 'border-blue-400 text-blue-400'
                  : 'border-red-400 text-red-400'
              "
            >
              {{ nextTurnNumber }}
            </div>
          </div>
        </div>
      </div>

      <!-- Scores & Actions -->
      <div
        v-if="gameOver"
        class="flex flex-col items-center mt-3.5 sm:mt-4.5 transition-all duration-300"
      >
        <div
          class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-2 shadow-sm mb-3 text-center"
        >
          <div class="text-sm font-semibold text-gray-700 space-y-1">
            <p class="flex items-center justify-between space-x-8">
              <span class="text-blue-600">Player 1 Score:</span>
              <span class="font-mono font-bold">{{
                gameState.scores?.player1 || 0
              }}</span>
            </p>
            <p class="flex items-center justify-between space-x-8">
              <span class="text-red-600">Player 2 Score:</span>
              <span class="font-mono font-bold">{{
                gameState.scores?.player2 || 0
              }}</span>
            </p>
          </div>
        </div>
        <button
          @click="newGame"
          :disabled="ready"
          class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="ready">Waiting for opponent<WaitingIndicator /></span>
          <span v-else>Play Again</span>
        </button>
      </div>
    </div>
  </div>
  <div
    v-else
    class="h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6"
  >
    <p class="text-lg sm:text-xl text-gray-600">
      Invalid game state. Redirecting to lobby...
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Socket } from 'socket.io-client';
import GameHeader from './GameHeader.vue';
import WaitingIndicator from './WaitingIndicator.vue';
import { useGame } from '../composables/useGame.js';
import type { BlackHoleGameState as GameState } from '../types/shared.js';

export default defineComponent({
  name: 'BlackHole',
  components: {
    GameHeader,
    WaitingIndicator,
  },
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

    return { ...game, gameState };
  },
  data() {
    return {};
  },
  computed: {
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
      if (this.gameOver) return 'border-slate-850 shadow-slate-900/50';
      if (this.gameState.currentPlayer === 1) {
        return 'border-blue-600/30 shadow-[0_0_35px_rgba(59,130,246,0.18)]';
      } else {
        return 'border-red-600/30 shadow-[0_0_35px_rgba(239,68,68,0.18)]';
      }
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
        return 'bg-slate-950 border-purple-500 border-2 shadow-[0_0_25px_rgba(147,51,234,0.75)]';
      }

      if (this.gameOver && this.remainingPositions.length === 1) {
        const blackCircle = this.remainingPositions[0];
        const [blackRow, blackCol] = blackCircle.split('-').map(Number);
        const neighbors = this.getNeighbors(blackRow, blackCol);
        if (neighbors.includes(key)) {
          return data
            ? data.player === 1
              ? 'bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 border-amber-400 border-[3px] shadow-[0_0_15px_rgba(251,191,36,0.85)] text-white scale-105'
              : 'bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 border-amber-400 border-[3px] shadow-[0_0_15px_rgba(251,191,36,0.85)] text-white scale-105'
            : 'bg-slate-950/40 border-amber-400/60 border-2';
        }
      }

      if (data) {
        return data.player === 1
          ? 'bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.55)] text-white'
          : 'bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.55)] text-white';
      }

      return 'bg-slate-950/40 border-2 border-slate-700/60 text-slate-500 hover:border-slate-500/80 hover:bg-slate-800/40';
    },
    getCircleText(row: number, col: number) {
      const data = this.getCircleData(row, col);
      return data?.turn || '';
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
