<template>
  <div v-if="isValidGame"
    class="flex-grow flex flex-col items-center h-full p-2 sm:p-4 md:p-6 select-none overflow-hidden"
  >
    <div class="w-full max-w-lg flex items-center justify-between mb-2 flex-shrink-0">
      <div class="text-xs text-gray-500 font-mono flex items-center space-x-2">
        <span>Drawn: {{ gameState.drawnNumbers.length }}/75</span>
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
      </div>
      <div v-if="!gameOver" class="flex items-center space-x-2">
        <span class="text-xs font-semibold" :class="isMyTurn ? 'text-green-600' : 'text-gray-400'">
          {{ gameState.currentPlayer === player ? 'You are drawing' : 'Host draws' }}
        </span>
      </div>
      <router-link to="/menu"
        class="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg cursor-pointer active:scale-95 flex-shrink-0"
        title="Leave Game"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </router-link>
    </div>

    <div v-if="gameOver" class="text-lg font-bold text-green-600 mb-1 flex-shrink-0">
      Game Over! {{ gameState.winner }}
    </div>

    <div
      v-if="gameOver"
      class="w-full max-w-lg flex justify-center mb-2 flex-shrink-0"
    >
      <button
        @click="openRecapModal"
        class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-md active:scale-95 flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd" />
        </svg>
        <span>AI Recap</span>
      </button>
    </div>

    <div class="flex-grow flex flex-col items-center justify-start w-full overflow-y-auto py-1">
      <div class="bg-slate-900 border border-slate-800 p-2 sm:p-3 rounded-2xl shadow-xl w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[400px]">
        <div class="grid grid-cols-5 gap-1 mb-1">
          <div
            v-for="letter in ['B', 'I', 'N', 'G', 'O']"
            :key="letter"
            class="text-center text-xs sm:text-sm font-black text-slate-400 uppercase"
          >{{ letter }}</div>
        </div>
        <div class="grid grid-cols-5 gap-1">
          <div
            v-for="(_, idx) in 25"
            :key="idx"
            class="aspect-square flex items-center justify-center rounded-lg text-sm sm:text-base font-bold transition-all duration-150 cursor-pointer"
            :class="getCellClass(idx)"
            @click="daubCell(idx)"
          >
            <span v-if="getCellNumber(idx) !== 0">{{ getCellNumber(idx) }}</span>
            <span v-else class="text-yellow-400 text-[10px] sm:text-xs font-black">FREE</span>
          </div>
        </div>

        <div class="mt-3 text-center">
          <div v-if="lastDrawnNumber !== null"
            class="inline-flex items-center justify-center bg-indigo-600 text-white rounded-xl px-4 py-1.5 shadow-md"
          >
            <span class="text-lg sm:text-xl font-black tracking-wider">{{ lastDrawnLetter }} {{ lastDrawnNumber }}</span>
          </div>
          <div v-else class="text-xs text-gray-500 italic">
            No number drawn yet
          </div>
        </div>

        <div class="mt-2 text-center">
          <button
            v-if="player === 1 && !gameOver"
            @click="drawNumber"
            class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-1.5 rounded-xl shadow-md transition-all duration-150 cursor-pointer active:scale-95 text-sm"
          >
            Draw Number
          </button>
        </div>

        <details class="text-xs text-gray-400 mt-2" open>
          <summary class="cursor-pointer font-semibold select-none text-center">
            Drawn Numbers ({{ gameState.drawnNumbers.length }}/75)
          </summary>
          <div class="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto justify-center">
            <span
              v-for="n in gameState.drawnNumbers"
              :key="n"
              class="inline-block px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-300"
            >{{ n }}</span>
            <span v-if="gameState.drawnNumbers.length === 0" class="text-slate-600 italic">No numbers drawn yet</span>
          </div>
        </details>
      </div>
    </div>

    <div class="flex-shrink-0 w-full max-w-lg flex justify-center py-2">
      <button
        v-if="!gameOver"
        @click="callBingo"
        class="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-md transition-all duration-150 cursor-pointer active:scale-95 text-sm tracking-wider"
      >
        BINGO!
      </button>
      <button
        v-else
        @click="handlePlayAgain"
        :disabled="waiting"
        class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="waiting">Waiting<WaitingIndicator /></span>
        <span v-else>Play Again</span>
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>

  <!-- Recap Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showRecapModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
        @click.self="closeRecapModal"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="showRecapModal"
            class="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full shadow-2xl p-6 flex flex-col relative max-h-[85vh] overflow-hidden"
          >
            <button
              @click="closeRecapModal"
              class="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800/80 p-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
              aria-label="Close Recap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="mb-5 flex items-center space-x-3 pr-8">
              <div class="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold tracking-tight">AI Match Recap</h2>
                <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">Bingo</p>
              </div>
            </div>

            <div v-if="recapLoading" class="flex flex-col items-center py-8 space-y-3">
              <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-xs text-slate-400 animate-pulse">Analyzing key moves...</span>
            </div>

            <div
              v-else-if="!recapText"
              class="flex justify-center py-6"
            >
              <button
                @click="requestRecap"
                class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-md active:scale-95 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd" />
                </svg>
                <span>Generate AI Recap</span>
              </button>
            </div>

            <div
              v-else
              class="overflow-y-auto pr-1 text-slate-300 text-sm space-y-4 focus:outline-none"
              v-html="formattedRecapHtml"
            ></div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, onBeforeUnmount } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../composables/useGame.js';
import { useSpeech } from '../composables/useSpeech.js';
import type { BingoGameState as GameState } from '../types/shared.js';
import WaitingIndicator from './WaitingIndicator.vue';

export default defineComponent({
  name: 'Bingo',
  components: { WaitingIndicator },
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

    const showRecapModal = ref(false);
    const recapText = ref('');
    const recapLoading = ref(false);

    function requestRecap() {
      if (props.socket && props.roomKey) {
        recapLoading.value = true;
        props.socket.emit('request-recap', { roomKey: props.roomKey });
      }
    }

    function openRecapModal() {
      showRecapModal.value = true;
      document.addEventListener('keydown', handleRecapEscKey);
      if (recapLoading.value) return;
      if (!recapText.value && props.socket && props.roomKey) {
        recapLoading.value = true;
        props.socket.emit('request-recap', { roomKey: props.roomKey });
      }
    }

    function closeRecapModal() {
      showRecapModal.value = false;
      document.removeEventListener('keydown', handleRecapEscKey);
    }

    function handleRecapEscKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeRecapModal();
      }
    }

    function setupRecapListeners() {
      if (!props.socket) return;
      props.socket.on('recap-loading', () => {
        recapLoading.value = true;
      });
      props.socket.on('recap-generated', ({ text }: { text: string }) => {
        recapText.value = text;
        recapLoading.value = false;
      });
    }

    function teardownRecapListeners() {
      if (!props.socket) return;
      props.socket.off('recap-loading');
      props.socket.off('recap-generated');
    }

    setupRecapListeners();

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
      () => gameState.value.phase,
      (newPhase) => {
        if (newPhase === 'playing') {
          recapText.value = '';
          recapLoading.value = false;
          showRecapModal.value = false;
        }
      }
    );

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleRecapEscKey);
      teardownRecapListeners();
    });

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
      showRecapModal,
      recapText,
      recapLoading,
      muted,
      requestRecap,
      openRecapModal,
      closeRecapModal,
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
    isMyTurn() {
      return this.player === 1 && !this.gameOver && this.gameState.players.length >= 2;
    },
    formattedRecapHtml(): string {
      if (!this.recapText) return '';
      let html = this.recapText;

      html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      html = html.replace(/### (.*?)\n/g, '<h3 class="text-sm font-bold text-slate-100 mt-3 mb-1">$1</h3>');
      html = html.replace(/## (.*?)\n/g, '<h2 class="text-base font-bold text-slate-100 mt-4 mb-2">$1</h2>');

      html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>');

      html = html.split('\n\n').map((p) => {
        if (p.trim().startsWith('<li') || p.trim().startsWith('<h3') || p.trim().startsWith('<h2')) {
          return p;
        }
        return `<p class="mb-2 leading-relaxed text-slate-300">${p}</p>`;
      }).join('');

      return html;
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

      if (isFree && isDaubed) return 'bg-emerald-700/60 text-yellow-300 ring-1 ring-emerald-500/50';
      if (isFree) return 'bg-slate-800 text-yellow-400 border border-slate-700';
      if (isDaubed) return 'bg-emerald-700/60 text-white line-through ring-1 ring-emerald-500/50';
      return 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700/80';
    },
    daubCell(idx: number) {
      if (this.gameOver || !this.socket) return;
      const { r, c } = this.rowCol(idx);
      if (r === 2 && c === 2) return;
      if (this.myDaubed.has(`${r},${c}`)) return;
      this.socket.emit('make-move', { roomKey: this.roomKey, action: 'daub', row: r, col: c });
    },
    drawNumber() {
      if (this.gameOver || !this.socket) return;
      this.socket.emit('make-move', { roomKey: this.roomKey, action: 'draw' });
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
