<template>
  <div v-if="isValidGame"
    class="flex-grow flex flex-col items-center h-full p-2 sm:p-4 md:p-6 select-none overflow-hidden"
  >
    <div class="w-full max-w-lg flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-2 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <span class="text-xs text-gray-500 font-mono">Drawn: {{ gameState.drawnNumbers.length }}/75</span>
        <button
          @click="toggleMute"
          class="p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
          :title="muted ? 'Unmute announcements' : 'Mute announcements'"
        >
          <svg v-if="muted" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        <span v-if="!gameOver" class="text-xs text-gray-500 italic hidden xs:inline">Auto-drawing numbers...</span>
      </div>
      <div class="flex items-center space-x-1">
        <button
          @click="openHowToPlay"
          class="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 flex-shrink-0 border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50 transition-all duration-200"
          title="How to Play"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <router-link to="/menu"
          class="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg cursor-pointer active:scale-95 flex-shrink-0"
          title="Leave Game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </router-link>
      </div>
    </div>

    <div v-if="gameOver" class="text-lg font-bold text-green-600 mb-1 flex-shrink-0 animate-slide-up">
      Game Over! {{ gameState.winner }}
    </div>

    <div class="flex-grow flex flex-col items-center justify-start w-full overflow-y-auto py-1">
      <div class="bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow p-2 sm:p-3 rounded-none w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[400px]">
        <div class="grid grid-cols-5 gap-1 mb-1">
          <div
            v-for="letter in ['B', 'I', 'N', 'G', 'O']"
            :key="letter"
            class="text-center text-xs sm:text-sm font-black text-neo-text/70 uppercase"
          >{{ letter }}</div>
        </div>
        <div class="grid grid-cols-5 gap-1">
          <div
            v-for="(_, idx) in 25"
            :key="idx"
            class="aspect-square flex items-center justify-center rounded-none text-sm sm:text-base font-black transition-all duration-100 cursor-pointer"
            :class="getCellClass(idx)"
            @click="daubCell(idx)"
          >
            <span v-if="getCellNumber(idx) !== 0">{{ getCellNumber(idx) }}</span>
            <span v-else class="text-yellow-500 dark:text-yellow-400 text-[10px] sm:text-xs font-black">FREE</span>
          </div>
        </div>

        <div class="mt-3 text-center">
          <div v-if="lastDrawnNumber !== null"
            class="inline-flex items-center justify-center bg-neo-accent text-white rounded-none px-4 py-1.5 neo-border-2 neo-shadow-sm"
          >
            <span class="text-lg sm:text-xl font-black tracking-wider">{{ lastDrawnLetter }} {{ lastDrawnNumber }}</span>
          </div>
          <div v-else class="text-xs text-neo-text/50 italic">
            No number drawn yet
          </div>
        </div>

        <details class="text-xs text-neo-text/70 mt-2" open>
          <summary class="cursor-pointer font-bold select-none text-center hover:text-neo-accent">
            Drawn Numbers ({{ gameState.drawnNumbers.length }}/75)
          </summary>
          <div class="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto justify-center">
            <span
              v-for="n in gameState.drawnNumbers"
              :key="n"
              class="inline-block px-1.5 py-0.5 bg-neo-bg neo-border-2 rounded-none text-[10px] font-mono text-neo-text"
            >{{ n }}</span>
            <span v-if="gameState.drawnNumbers.length === 0" class="text-neo-text/40 italic">No numbers drawn yet</span>
          </div>
        </details>
      </div>
    </div>

    <div class="flex-shrink-0 w-full max-w-lg flex justify-center py-2 animate-slide-up">
      <button
        v-if="!gameOver"
        @click="callBingo"
        class="bg-neo-accent text-white font-black px-8 py-2.5 rounded-none neo-btn uppercase tracking-wider text-sm"
      >
        BINGO!
      </button>
      <button
        v-else
        @click="handlePlayAgain"
        :disabled="waiting"
        class="bg-neo-accent text-white font-black py-2.5 px-6 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider"
      >
        <span v-if="waiting" class="flex items-center gap-1.5 justify-center">Waiting<WaitingIndicator /></span>
        <span v-else>Play Again</span>
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>

  <HowToPlayModal
    :is-open="isHowToPlayOpen"
    game-id="bingo"
    @close="closeHowToPlay"
  />

</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../../composables/useGame.js';
import { useSpeech } from '../../composables/useSpeech.js';
import { useConfetti } from '../../composables/useConfetti.js';
import type { BingoGameState as GameState } from '../../types/shared.js';
import WaitingIndicator from '../ui/WaitingIndicator.vue';
import HowToPlayModal from '../modals/HowToPlayModal.vue';

export default defineComponent({
  name: 'Bingo',
  components: { WaitingIndicator, HowToPlayModal },
  emits: ['update-connection-status', 'update-player', 'update-room-key'],
  props: {
    socket: { type: Object as PropType<Socket>, required: true },
    player: { type: Number, required: true },
    roomKey: { type: String, required: true },
    initialGameState: { type: Object as PropType<GameState>, required: true },
    connectionStatus: String,
  },
  setup(props) {
    const gameState = ref<GameState>(
      props.initialGameState || {
        cards: {},
        daubed: {},
        drawnNumbers: [],
        phase: 'playing',
        winner: '',
        players: [],
        currentPlayer: 1,
        totalMoves: 0,
      }
    );

    const waiting = ref(false);
    const isHowToPlayOpen = ref(false);
    const openHowToPlay = () => {
      isHowToPlayOpen.value = true;
    };
    const closeHowToPlay = () => {
      isHowToPlayOpen.value = false;
    };

    const confetti = useConfetti();
    const { muted, speak, toggleMute } = useSpeech();

    let prevLen = gameState.value.drawnNumbers.length;
    watch(() => gameState.value.drawnNumbers.length, (len) => {
      if (len > prevLen) {
        const num = gameState.value.drawnNumbers[len - 1];
        let letter = '';
        if (num <= 15) letter = 'B';
        else if (num <= 30) letter = 'I';
        else if (num <= 45) letter = 'N';
        else if (num <= 60) letter = 'G';
        else letter = 'O';
        speak(`${letter} ${num}`);
      }
      prevLen = len;
    });

    watch(
      () => gameState.value?.winner,
      (winner) => {
        if (winner) {
          confetti.fire();
        }
      }
    );

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/bingo/lobby',
      onGameState: (newState: any) => {
        gameState.value = newState;
        if (newState.totalMoves === 0) {
          waiting.value = false;
        }
      },
    });

    return {
      ...game,
      gameState,
      waiting,
      isHowToPlayOpen,
      openHowToPlay,
      closeHowToPlay,
      muted,
      confetti,
      toggleMute,
    };
  },
  computed: {
    isValidGame() {
      return this.roomKey && this.player && this.gameState.players && this.gameState.players.length >= 1;
    },
    gameOver() {
      return !!this.gameState.winner;
    },
    myCard(): number[][] | null {
      return this.gameState.cards?.[this.player] || null;
    },
    myDaubed(): Set<string> {
      return new Set(this.gameState.daubed?.[this.player] || []);
    },
    lastDrawnNumber(): number | null {
      const nums = this.gameState.drawnNumbers;
      return nums.length > 0 ? nums[nums.length - 1] : null;
    },
    lastDrawnLetter(): string {
      if (this.lastDrawnNumber === null) return '';
      const n = this.lastDrawnNumber;
      if (n <= 15) return 'B';
      if (n <= 30) return 'I';
      if (n <= 45) return 'N';
      if (n <= 60) return 'G';
      return 'O';
    },
  },
  methods: {
    rowCol(idx: number) {
      return { r: Math.floor(idx / 5), c: idx % 5 };
    },
    getCellNumber(idx: number) {
      if (!this.myCard) return 0;
      const { r, c } = this.rowCol(idx);
      return this.myCard[r][c];
    },
    getCellClass(idx: number) {
      const { r, c } = this.rowCol(idx);
      const key = `${r},${c}`;
      const isDaubed = this.myDaubed.has(key);
      const isFree = r === 2 && c === 2;

      if (isFree && isDaubed) return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 neo-border-2 border-emerald-500';
      if (isFree) return 'bg-white dark:bg-neo-card-bg text-yellow-500 dark:text-yellow-400 neo-border-2';
      if (isDaubed) return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 line-through neo-border-2 border-emerald-500';
      return 'bg-white dark:bg-neo-card-bg text-neo-text neo-border-2 hover:bg-neo-secondary dark:hover:bg-neo-secondary';
    },
    daubCell(idx: number) {
      if (this.gameOver || !this.socket) return;
      const { r, c } = this.rowCol(idx);
      if (r === 2 && c === 2) return;
      if (this.myDaubed.has(`${r},${c}`)) return;
      this.socket.emit('make-move', { roomKey: this.roomKey, action: 'daub', row: r, col: c });
    },
    callBingo() {
      if (this.gameOver || !this.socket) return;
      this.socket.emit('make-move', { roomKey: this.roomKey, action: 'call-bingo' });
    },
    handlePlayAgain() {
      if (this.waiting || !this.socket) return;
      this.waiting = true;
      this.socket.emit('new-game', { roomKey: this.roomKey });
    },
  },
});
</script>
