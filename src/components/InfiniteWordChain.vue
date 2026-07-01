<template>
  <div v-if="isValidGame"
    class="flex-grow flex flex-col items-center h-full p-2 sm:p-4 md:p-6 select-none overflow-hidden"
  >
    <!-- Top Bar -->
    <div class="w-full max-w-lg flex items-center justify-between mb-2 flex-shrink-0">
      <div class="text-xs text-gray-500 font-mono">
        <template v-if="!gameOver">
          Score: {{ gameState.score || 0 }}
          <span class="ml-2 text-indigo-400">Pair {{ gameState.currentPairIndex + 1 }}</span>
          <span class="ml-2 text-rose-400">Mistakes: {{ gameState.mistakes || 0 }}</span>
        </template>
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

    <!-- Main Content -->
    <div class="flex-grow flex flex-col items-center justify-center w-full max-w-lg overflow-y-auto py-2">
      <div v-if="!gameState.currentWord" class="flex flex-col items-center space-y-3 text-gray-400">
        <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm animate-pulse">Generating word pairs...</span>
      </div>

      <div v-else class="w-full">
        <!-- First Word -->
        <div class="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4">
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-2">Phrase</p>
          <p class="text-2xl sm:text-3xl font-bold text-white text-center">
            {{ gameState.currentWord }}
          </p>
        </div>

        <!-- Second Word (with blanks) -->
        <div class="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-4">
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-2">Guess the missing word</p>
          <div class="text-center">
            <div class="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
              <span
                v-for="(ch, idx) in displayChars"
                :key="idx"
                class="font-mono text-lg sm:text-xl font-black tracking-widest"
                :class="ch === '_' ? 'text-slate-600' : 'text-emerald-400'"
              >{{ ch }}</span>
            </div>
          </div>
          <div v-if="gameState.revealIndex > 0" class="text-center text-xs text-gray-500 mt-2 font-mono">
            {{ gameState.revealIndex }} wrong guess{{ gameState.revealIndex !== 1 ? 'es' : '' }}
          </div>
        </div>

        <!-- Input Area -->
        <div v-if="!gameOver" class="w-full space-y-3">
          <p class="text-xs text-gray-500 text-center">
            What word completes "<strong class="text-indigo-400">{{ gameState.currentWord }} _____</strong>"?
          </p>
          <div class="flex items-center space-x-2">
            <input
              v-model="playerGuess"
              type="text"
              placeholder="Type your guess..."
              class="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              @keyup.enter="submitGuess"
              :disabled="submitting"
              data-guess-input
              autocomplete="off"
            />
            <button
              @click="submitGuess"
              :disabled="submitting || !playerGuess.trim()"
              class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 disabled:cursor-not-allowed text-sm"
            >
              <span v-if="submitting" class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span v-else>Guess</span>
            </button>
          </div>
          <button
            @click="finishGame"
            class="w-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 py-2 rounded-lg transition-all cursor-pointer"
          >
            Finish Game
          </button>
        </div>
      </div>
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
          v-if="gameOver"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
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
              v-if="gameOver"
              class="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center max-h-[90vh] overflow-y-auto"
            >
              <p class="text-lg font-bold text-violet-400 mb-4">{{ gameState.winner }}</p>

              <div class="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
                <p class="text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-3">Recap</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Pairs completed</span>
                    <span class="text-white font-bold">{{ gameState.score || 0 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Mistakes</span>
                    <span class="text-rose-400 font-bold">{{ gameState.mistakes || 0 }}</span>
                  </div>
                </div>
              </div>

              <div v-if="solvedPairs.length > 0" class="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4 max-h-32 overflow-y-auto">
                <p class="text-xs text-gray-500 font-bold uppercase tracking-wider text-center mb-3">Your Chain</p>
                <div class="flex flex-wrap gap-1.5 justify-center">
                  <span
                    v-for="(word, idx) in solvedPairs"
                    :key="idx"
                    class="text-xs font-mono px-2 py-0.5 rounded"
                    :class="idx % 2 === 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'"
                  >
                    {{ word }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col w-full space-y-2">
                <button
                  @click="handlePlayAgain"
                  :disabled="waiting"
                  class="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="waiting">Waiting<WaitingIndicator /></span>
                  <span v-else>Play Again</span>
                </button>
                <router-link to="/menu"
                  class="w-full block text-center bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold py-2.5 px-8 rounded-xl transition-all duration-200"
                >
                  Main Menu
                </router-link>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../composables/useGame.js';
import type { InfiniteWordChainGameState as GameState } from '../types/shared.js';
import WaitingIndicator from './WaitingIndicator.vue';

export default defineComponent({
  name: 'InfiniteWordChain',
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
        pairs: [],
        currentPairIndex: 0,
        phase: 'playing',
        currentWord: '',
        answerWord: '',
        answerDisplay: '',
        totalLetters: 0,
        revealIndex: 0,
        winner: '',
        players: [],
        currentPlayer: 1,
        totalMoves: 0,
        score: 0,
        mistakes: 0,
      }
    );

    const waiting = ref(false);
    const playerGuess = ref('');
    const submitting = ref(false);

    const displayChars = computed(() => (gameState.value.answerDisplay || '').split(''));
    const gameOver = computed(() => !!gameState.value.winner);
    const solvedPairs = computed(() => {
      const pairs = gameState.value.pairs || [];
      const count = gameState.value.currentPairIndex || 0;
      if (count === 0 || pairs.length === 0) return [];
      const solved = pairs.slice(0, count);
      const chain: string[] = [];
      for (const p of solved) {
        if (chain.length === 0) chain.push(p[0]);
        chain.push(p[1]);
      }
      return chain;
    });

    watch(() => gameState.value.currentWord, () => {
      playerGuess.value = '';
      submitting.value = false;
    });

    watch(() => gameState.value.answerDisplay, () => {
      submitting.value = false;
    });

    watch(submitting, (val) => {
      if (!val) {
        nextTick(() => {
          const el = document.querySelector<HTMLInputElement>('[data-guess-input]');
          el?.focus();
        });
      }
    });

    function submitGuess() {
      const guess = (playerGuess.value || '').trim().toLowerCase();
      if (!guess || gameOver.value || submitting.value || !props.socket) return;
      if (!/^[a-z]+$/.test(guess)) return;

      playerGuess.value = '';
      submitting.value = true;
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'submit-guess',
        guess,
      });
    }

    function finishGame() {
      if (!props.socket || gameOver.value) return;
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'finish',
      });
    }

    function handlePlayAgain() {
      if (waiting.value || !props.socket) return;
      waiting.value = true;
      props.socket.emit('new-game', { roomKey: props.roomKey });
    }

    useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/infinite-word-chain/lobby',
      onGameState: (newState: any) => {
        gameState.value = newState;
        if (newState.totalMoves === 0) {
          waiting.value = false;
        }
      },
    });

    onBeforeUnmount(() => {
      // cleanup
    });

    return {
      gameState,
      waiting,
      playerGuess,
      submitting,
      displayChars,
      gameOver,
      solvedPairs,
      submitGuess,
      finishGame,
      handlePlayAgain,
    };
  },
  computed: {
    isValidGame() {
      return this.roomKey && this.player && this.gameState.players && this.gameState.players.length >= 1;
    },
  },
});
</script>
