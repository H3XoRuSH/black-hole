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
      <!-- Grid wrapper with clean dark plastic container look -->
      <div
        class="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl w-full max-w-[280px] xs:max-w-[340px] sm:max-w-[430px] md:max-w-[480px]"
      >
        <!-- Columns Grid -->
        <div class="grid grid-cols-7 gap-1.5 sm:gap-3">
          <!-- Hover & Interactive Columns -->
          <div
            v-for="colIndex in 7"
            :key="`col-${colIndex - 1}`"
            class="flex flex-col space-y-1.5 sm:space-y-3 cursor-pointer group rounded-lg p-1 hover:bg-slate-800/50 transition-colors duration-150 relative"
            @click="makeMove(colIndex - 1)"
          >
            <!-- Preview slot at the top (only on desktop/hover) -->
            <div
              class="absolute -top-10 left-1/2 -translate-x-1/2 hidden md:group-hover:block pointer-events-none"
            >
              <div
                v-if="canPlayColumn(colIndex - 1)"
                class="w-8 h-8 rounded-full shadow-inner animate-bounce opacity-50"
                :class="player === 1 ? 'bg-blue-400' : 'bg-red-400'"
              ></div>
            </div>

            <!-- Vertical grid slots in column -->
            <div
              v-for="rowIndex in 6"
              :key="`cell-${rowIndex - 1}-${colIndex - 1}`"
              class="aspect-square rounded-full flex items-center justify-center relative overflow-hidden bg-slate-950 shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)]"
            >
              <!-- Placed Disc -->
              <div
                v-if="gameState.board[rowIndex - 1][colIndex - 1]"
                class="w-[90%] h-[90%] rounded-full shadow-md transform transition-all duration-300 scale-100"
                :class="getDiscClass(rowIndex - 1, colIndex - 1)"
              >
                <!-- Inner detailing for realistic shiny disc look -->
                <div
                  class="w-full h-full rounded-full border-2 border-white/20 bg-gradient-to-tr from-black/20 via-transparent to-white/40"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="w-full max-w-lg flex flex-col items-center justify-center py-2 sm:py-4">
      <button
        v-if="gameOver"
        @click="newGame"
        :disabled="ready"
        class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="ready">Waiting for opponent<WaitingIndicator /></span>
        <span v-else>Play Again</span>
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">
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
import type { ConnectFourGameState as GameState } from '../types/shared.js';

export default defineComponent({
  name: 'ConnectFour',
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

    return { ...game, gameState };
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
        return 'bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.55)]';
      if (disc === 2)
        return 'bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.55)]';
      return '';
    },
  },
});
</script>
