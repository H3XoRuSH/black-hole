<template>
  <div v-if="isValidGame"
    class="flex-grow flex flex-col items-center h-full p-2 sm:p-4 md:p-6 select-none overflow-hidden"
  >
    <!-- Top Bar -->
    <div class="w-full max-w-lg flex items-center justify-between mb-2 flex-shrink-0">
      <div class="text-xs text-gray-500 font-mono">
        <template v-if="!gameOver">
          Question {{ Math.min(currentQuestionIndex + 1, totalQuestions) }}/{{ totalQuestions }}
          <span v-if="isSolo" class="ml-2 text-violet-400 font-semibold">(Solo Mode)</span>
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

    <!-- Scoreboard -->
    <div class="w-full max-w-lg flex flex-wrap items-center justify-center gap-2 mb-3 flex-shrink-0">
      <div
        v-for="p in players"
        :key="p.player"
        class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border"
        :class="getScoreCardClass(p.player)"
      >
        <span class="w-2.5 h-2.5 rounded-full" :class="getDotClass(p.player)"></span>
        <span>{{ p.name || playerLabel(p.player) }}</span>
        <span class="font-mono ml-1">{{ gameState.scores?.[p.player] || 0 }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col items-center justify-center w-full max-w-lg overflow-y-auto py-2">
      <!-- Loading State -->
      <div v-if="!currentQuestion" class="flex flex-col items-center space-y-3 text-gray-400">
        <div class="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm animate-pulse">Loading questions...</span>
      </div>

      <!-- Question Card -->
      <div v-else class="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 sm:p-6">
        <!-- Category & Difficulty -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full">
            {{ currentQuestion.category }}
          </span>
          <span
            class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            :class="difficultyClass"
          >
            {{ currentQuestion.difficulty }}
          </span>
        </div>

        <!-- Question Text -->
        <p class="text-base sm:text-lg font-semibold text-white leading-relaxed mb-4">
          {{ currentQuestion.question }}
        </p>

        <!-- Answer Display (Blanks) -->
        <div v-if="phase === 'question-intro' || phase === 'revealing' || phase === 'solved'"
          class="mb-4 text-center"
        >
          <div class="inline-flex flex-wrap items-center justify-center gap-y-1">
            <template v-for="(group, gIdx) in wordGroups" :key="gIdx">
              <span v-if="group.length === 1 && group[0] === ' '" class="inline-block w-4" />
              <span v-else class="whitespace-nowrap">
                <span
                  v-for="(ch, idx) in group"
                  :key="idx"
                  class="font-mono text-lg sm:text-xl font-black tracking-widest"
                  :class="displayCharClass(ch, idx)"
                >{{ ch }}</span>
              </span>
            </template>
          </div>
        </div>

        <!-- Phase-specific UI -->
        <!-- Answer Input (visible during intro and revealing) -->
        <div v-if="phase === 'question-intro' || phase === 'revealing'" class="space-y-3 py-2">
          <div v-if="phase === 'question-intro'" class="text-center text-xs text-violet-400 font-semibold animate-pulse">
            Letters Revealing Soon...
          </div>
          <div v-if="phase === 'revealing'" class="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Revealed: {{ gameState.revealIndex }}/{{ gameState.totalLetters }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <input
              v-model="userAnswer"
              type="text"
              placeholder="Type your answer..."
              class="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              style="scroll-margin-top: 40vh"
              @keyup.enter="submitAnswer"
              :disabled="gameState.solvedBy !== null"
              ref="answerInput"
            />
            <button
              @click="submitAnswer"
              :disabled="gameState.solvedBy !== null || !userAnswer.trim()"
              class="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 disabled:cursor-not-allowed text-sm"
            >
              Submit
            </button>
          </div>
          <div v-if="gameState.solvedBy !== null && gameState.solvedBy !== player" class="text-center text-sm text-gray-400 font-medium">
            <span class="text-emerald-400 font-bold">{{ solverName }}</span> got it first!
          </div>
        </div>

        <template v-if="phase === 'solved'">
          <div class="py-4 text-center">
            <div v-if="gameState.solvedBy === player" class="text-emerald-400 font-bold text-base">
              Correct! +1 point
            </div>
            <div v-else-if="gameState.solvedBy !== null" class="text-amber-400 font-bold text-base">
              {{ solverName }} answered correctly!
            </div>
            <div v-else class="text-gray-400 font-semibold text-base">
              No one got it — the answer is above
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Game Over -->
    <div v-if="gameOver" class="flex-shrink-0 w-full max-w-lg flex flex-col items-center py-3 space-y-3">
      <div class="text-lg font-bold" :class="winnerTextClass">
        {{ gameState.winner }}
      </div>
      <button
        @click="handlePlayAgain"
        :disabled="waiting"
        class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="waiting">Waiting<WaitingIndicator /></span>
        <span v-else>Play Again</span>
      </button>
    </div>

    <HowToPlayModal
      :is-open="isHowToPlayOpen"
      game-id="trivia"
      @close="closeHowToPlay"
    />
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../composables/useGame.js';
import type { TriviaGameState as GameState } from '../types/shared.js';
import WaitingIndicator from './WaitingIndicator.vue';
import HowToPlayModal from './HowToPlayModal.vue';

export default defineComponent({
  name: 'Trivia',
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
        questions: [],
        currentQuestionIndex: 0,
        phase: 'lobby',
        scores: {},
        winner: '',
        players: [],
        currentPlayer: 1,
        totalMoves: 0,
        answerDisplay: '',
        totalLetters: 0,
        revealIndex: 0,
        solvedBy: null,
        triviaOptions: {},
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
    const userAnswer = ref('');
    const answerInput = ref<HTMLInputElement | null>(null);

    watch(() => gameState.value.phase, (newPhase) => {
      if (newPhase === 'question-intro' || newPhase === 'revealing') {
        nextTick(() => {
          answerInput.value?.focus();
        });
      }
      if (newPhase === 'question-intro') {
        userAnswer.value = '';
      }
    });

    const handleInvalidMove = () => {
      userAnswer.value = '';
    };
    props.socket?.on('invalid-move', handleInvalidMove);
    onBeforeUnmount(() => {
      props.socket?.off('invalid-move', handleInvalidMove);
    });

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/trivia/lobby',
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
      userAnswer,
      answerInput,
    };
  },
  computed: {
    isValidGame() {
      return this.roomKey && this.player && this.gameState.players && this.gameState.players.length >= 1;
    },
    gameOver() {
      return !!this.gameState.winner;
    },
    phase() {
      return this.gameState.phase;
    },
    players() {
      return this.gameState.players || [];
    },
    currentQuestionIndex() {
      return this.gameState.currentQuestionIndex || 0;
    },
    totalQuestions() {
      return this.gameState.questions?.length || 0;
    },
    currentQuestion(): any {
      return this.gameState.questions?.[this.currentQuestionIndex] || null;
    },
    isSolo(): boolean {
      return this.players.length <= 1;
    },
    displayChars(): string[] {
      return (this.gameState.answerDisplay || '').split('');
    },
    wordGroups(): string[][] {
      const groups: string[][] = [];
      let word: string[] = [];
      for (const ch of this.displayChars) {
        if (ch === ' ') {
          if (word.length) {
            groups.push(word);
            word = [];
          }
          groups.push([' ']);
        } else {
          word.push(ch);
        }
      }
      if (word.length) groups.push(word);
      return groups;
    },
    solverName(): string {
      if (this.gameState.solvedBy === null) return '';
      const p = this.players.find((pl: any) => pl.player === this.gameState.solvedBy);
      return p?.name || `Player ${this.gameState.solvedBy}`;
    },
    difficultyClass(): string {
      const d = this.currentQuestion?.difficulty;
      if (d === 'easy') return 'text-emerald-400 bg-emerald-500/10';
      if (d === 'medium') return 'text-amber-400 bg-amber-500/10';
      if (d === 'hard') return 'text-rose-400 bg-rose-500/10';
      return 'text-gray-400 bg-gray-500/10';
    },
    winnerTextClass(): string {
      if (!this.gameState.winner) return '';
      if (this.gameState.winner.includes('Score')) return 'text-violet-400';
      const w = this.gameState.winner.toLowerCase();
      if (w.includes('tie')) return 'text-gray-400';
      if (w.includes(`player ${this.player}`)) return 'text-emerald-400';
      return 'text-rose-400';
    },
  },
  methods: {
    playerLabel(num: number) {
      return `Player ${num}`;
    },
    getDotClass(playerNum: number) {
      const dots = ['bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500', 'bg-orange-500', 'bg-blue-500'];
      return dots[(playerNum - 1) % dots.length];
    },
    getScoreCardClass(playerNum: number) {
      if (this.gameState.solvedBy === playerNum) {
        return 'bg-slate-800 border-emerald-400/70 text-emerald-300';
      }
      if (this.player === playerNum) return 'bg-slate-800 border-slate-700 text-slate-200';
      return 'bg-slate-800/50 border-slate-700/50 text-slate-400';
    },
    displayCharClass(ch: string, _idx: number) {
      if (ch === '_') return 'text-slate-600';
      if (this.phase === 'solved') {
        if (this.gameState.solvedBy === this.player) return 'text-emerald-400';
        return 'text-amber-400';
      }
      return 'text-white';
    },
    submitAnswer() {
      const answer = (this.userAnswer || '').trim();
      if (!answer || this.gameOver || !this.socket || this.gameState.solvedBy !== null) return;
      if (this.phase !== 'revealing' && this.phase !== 'question-intro') return;
      this.socket.emit('make-move', {
        roomKey: this.roomKey,
        action: 'submit-answer',
        answer,
      });
    },
    handlePlayAgain() {
      if (this.waiting || !this.socket) return;
      this.waiting = true;
      this.socket.emit('new-game', { roomKey: this.roomKey });
    },
  },
});
</script>
