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

    <!-- Main Content -->
    <div class="flex-grow flex flex-col items-center justify-center w-full max-w-lg overflow-y-auto py-2">
      <div v-if="!gameState.currentWord" class="flex flex-col items-center space-y-3 text-gray-400">
        <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm animate-pulse">Generating word pairs...</span>
      </div>

      <div v-else class="w-full">
        <!-- First Word -->
        <div class="w-full bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow p-4 sm:p-6 mb-4 rounded-none">
          <p class="text-xs text-neo-text/60 font-black uppercase tracking-wider text-center mb-2">Phrase</p>
          <p class="text-2xl sm:text-3xl font-black text-center">
            {{ gameState.currentWord }}
          </p>
        </div>

        <!-- Second Word (with blanks) -->
        <div class="w-full bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow p-4 sm:p-6 mb-4 rounded-none">
          <p class="text-xs text-neo-text/60 font-black uppercase tracking-wider text-center mb-2">Guess the missing word</p>
          <div class="text-center">
            <div class="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
              <span
                v-for="(ch, idx) in displayChars"
                :key="idx"
                class="font-mono text-lg sm:text-xl font-black tracking-widest"
                :class="ch === '_' ? 'text-neo-text/40' : 'text-emerald-600 dark:text-emerald-400'"
              >{{ ch }}</span>
            </div>
          </div>
          <div v-if="gameState.revealIndex > 0" class="text-center text-xs text-neo-text/50 mt-2 font-mono font-bold">
            {{ gameState.revealIndex }} wrong guess{{ gameState.revealIndex !== 1 ? 'es' : '' }}
          </div>
        </div>

        <!-- Input Area -->
        <div v-if="!gameOver" class="w-full space-y-3">
          <p class="text-xs text-neo-text/70 text-center font-bold uppercase tracking-wide">
            What word completes "<strong class="text-neo-accent">{{ gameState.currentWord }} _____</strong>"?
          </p>
          <div class="flex items-center space-x-2">
            <input
              v-model="playerGuess"
              type="text"
              placeholder="Type your guess..."
              class="flex-grow px-4 py-3 text-sm placeholder:text-neo-text/50 neo-input"
              @keyup.enter="submitGuess"
              :disabled="submitting"
              data-guess-input
              autocomplete="off"
            />
            <button
              @click="submitGuess"
              :disabled="submitting || !playerGuess.trim()"
              class="bg-neo-accent text-white font-black px-6 py-3 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider text-sm flex items-center justify-center min-w-[90px] border-2 border-black"
            >
              <span v-if="submitting" class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span v-else>Guess</span>
            </button>
          </div>
          <button
            @click="finishGame"
            class="w-full text-xs font-black text-white bg-rose-600 hover:bg-rose-700 py-2 rounded-none transition-all cursor-pointer neo-btn uppercase tracking-wider border-2 border-black"
          >
            Finish Game
          </button>
        </div>
      </div>
    </div>

    <!-- Recap Modal -->
    <HowToPlayModal
      :is-open="isHowToPlayOpen"
      game-id="infinite-word-chain"
      @close="closeHowToPlay"
    />

    <BaseModal
      :is-open="gameOver"
      max-width="max-w-sm"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="() => {}"
    >
      <div class="flex flex-col items-center animate-slide-up">
        <p class="text-lg font-black uppercase tracking-wider text-neo-accent mb-4">{{ gameState.winner }}</p>

        <div class="w-full bg-white dark:bg-neo-card-bg text-neo-text neo-border-2 rounded-none p-4 mb-4">
          <p class="text-xs text-neo-text/70 font-black uppercase tracking-wider text-center mb-3">Recap</p>
          <div class="space-y-2 text-sm font-bold uppercase tracking-wide">
            <div class="flex justify-between">
              <span class="text-neo-text/60">Pairs completed</span>
              <span class="font-black">{{ gameState.score || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neo-text/60">Mistakes</span>
              <span class="text-neo-accent font-black">{{ gameState.mistakes || 0 }}</span>
            </div>
          </div>
        </div>

        <div v-if="solvedPairs.length > 0" class="w-full bg-white dark:bg-neo-card-bg text-neo-text neo-border-2 rounded-none p-4 mb-4 max-h-32 overflow-y-auto">
          <p class="text-xs text-neo-text/70 font-black uppercase tracking-wider text-center mb-3">Your Chain</p>
          <div class="flex flex-wrap gap-1.5 justify-center">
            <span
              v-for="(word, idx) in solvedPairs"
              :key="idx"
              class="text-xs font-mono px-2 py-0.5 border-2 border-neo-border font-bold"
              :class="idx % 2 === 0 ? 'bg-neo-secondary text-black' : 'bg-neo-accent text-white'"
            >
              {{ word }}
            </span>
          </div>
        </div>

        <div class="flex flex-col w-full space-y-2">
          <button
            @click="handlePlayAgain"
            :disabled="waiting"
            class="w-full bg-neo-accent text-white font-black py-2.5 px-8 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider"
          >
            <span v-if="waiting" class="flex items-center gap-1.5 justify-center">Waiting<WaitingIndicator /></span>
            <span v-else>Play Again</span>
          </button>
          <router-link to="/menu"
            class="w-full block text-center bg-white dark:bg-neo-card-bg text-neo-text font-black py-2.5 px-8 rounded-none transition-all duration-100 cursor-pointer neo-btn uppercase tracking-wider"
          >
            Main Menu
          </router-link>
        </div>
      </div>
    </BaseModal>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, toRef, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../../composables/useGame.js';
import { useConfetti } from '../../composables/useConfetti.js';
import { useRecap } from '../../composables/useRecap.js';
import type { InfiniteWordChainGameState as GameState } from '../../types/shared.js';
import WaitingIndicator from '../ui/WaitingIndicator.vue';
import BaseModal from '../ui/BaseModal.vue';
import HowToPlayModal from '../modals/HowToPlayModal.vue';

export default defineComponent({
  name: 'InfiniteWordChain',
  components: { WaitingIndicator, BaseModal, HowToPlayModal },
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
    const isHowToPlayOpen = ref(false);
    const openHowToPlay = () => {
      isHowToPlayOpen.value = true;
    };
    const closeHowToPlay = () => {
      isHowToPlayOpen.value = false;
    };
    const playerGuess = ref('');
    const submitting = ref(false);

    const confetti = useConfetti();
    const recap = useRecap(toRef(props, 'socket'), toRef(props, 'roomKey'));

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

    watch(
      () => gameState.value?.winner,
      (winner) => {
        if (winner) {
          confetti.fire();
        }
      }
    );

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
      isHowToPlayOpen,
      openHowToPlay,
      closeHowToPlay,
      playerGuess,
      submitting,
      displayChars,
      gameOver,
      solvedPairs,
      confetti,
      recap,
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
