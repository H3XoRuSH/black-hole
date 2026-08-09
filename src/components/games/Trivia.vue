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
        class="flex items-center space-x-1.5 px-3 py-1.5 rounded-none text-xs transition-all duration-300 border-2 border-black"
        :class="getScoreCardClass(p.player)"
      >
        <span class="w-2.5 h-2.5 rounded-full border border-black" :class="getDotClass(p.player)"></span>
        <span>{{ p.name || playerLabel(p.player) }}</span>
        <span class="font-mono ml-1">{{ gameState.scores?.[p.player] || 0 }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col items-center justify-center w-full max-w-lg overflow-y-auto py-2">
      <!-- Game Over Summary Card -->
      <div v-if="gameOver" class="w-full bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow p-6 text-center space-y-6 flex flex-col items-center justify-center rounded-none my-4 animate-slide-up">
        <!-- Animated Trophy Icon -->
        <div class="w-20 h-20 bg-neo-secondary border-4 border-black text-black flex items-center justify-center rounded-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-10 w-10 text-black">
            <path d="M17 3H21C21.5523 3 22 3.44772 22 4V9C22 10.375 21.0503 11.5283 19.7824 11.8541C19.1417 14.1266 17.2995 15.8924 15 16.6343V19H18V21H6V19H9V16.6343C6.70054 15.8924 4.85834 14.1266 4.21762 11.8541C2.94974 11.5283 2 10.375 2 9V4C2 3.44772 2.44772 3 3 3H7V1H17V3ZM15 3H9V15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15V3ZM4 5V9C4 9.38793 4.2125 9.7262 4.54291 9.89141L5 10.12V5H4ZM20 5H19V10.12L19.4571 9.89141C19.7875 9.7262 20 9.38793 20 9V5Z"/>
          </svg>
        </div>

        <div>
          <h2 class="text-2xl font-black text-neo-text tracking-wide uppercase">Game Over</h2>
          <p class="text-sm text-neo-text/75 font-bold mt-1">Final Standings &amp; Scores</p>
        </div>

        <!-- Leaderboard -->
        <div class="w-full space-y-2.5 max-w-xs">
          <div
            v-for="(p, idx) in sortedPlayers"
            :key="p.player"
            class="flex items-center justify-between px-4 py-3 rounded-none border-2 border-black font-bold uppercase tracking-wide transition-all duration-100"
            :class="idx === 0 ? 'bg-neo-secondary text-black neo-shadow-sm' : 'bg-white dark:bg-neo-card-bg text-neo-text opacity-85'"
          >
            <div class="flex items-center space-x-2.5">
              <span class="font-mono text-sm font-black w-4 text-neo-text/50">#{{ idx + 1 }}</span>
              <span class="w-2.5 h-2.5 rounded-full border border-black" :class="getDotClass(p.player)"></span>
              <span class="font-bold text-sm text-neo-text">{{ p.name || playerLabel(p.player) }}</span>
            </div>
            <span class="font-mono font-black text-sm text-neo-text">{{ gameState.scores?.[p.player] || 0 }} pts</span>
          </div>
        </div>

        <button
          @click="handlePlayAgain"
          :disabled="waiting"
          class="bg-neo-accent text-white font-black py-2.5 px-8 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider w-full"
        >
          <span v-if="waiting" class="flex items-center gap-1.5 justify-center">Waiting<WaitingIndicator /></span>
          <span v-else>Play Again</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="!currentQuestion" class="flex flex-col items-center space-y-3 text-gray-400">
        <div class="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm animate-pulse">Loading questions...</span>
      </div>

      <!-- Question Card -->
      <div v-else class="w-full bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow p-4 sm:p-6 rounded-none">
        <!-- Category & Difficulty -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] font-black uppercase tracking-wider text-neo-text bg-neo-muted/30 border-2 border-black px-2.5 py-1 rounded-none">
            {{ currentQuestion.category }}
          </span>
          <span
            class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border-2 border-black rounded-none"
            :class="difficultyClass"
          >
            {{ currentQuestion.difficulty }}
          </span>
        </div>

        <!-- Question Text -->
        <p class="text-base sm:text-lg font-black text-neo-text leading-relaxed mb-4">
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
          <div v-if="phase === 'question-intro'" class="text-center text-xs text-neo-accent font-black animate-pulse uppercase">
            Letters Revealing Soon...
          </div>
          <div v-if="phase === 'revealing'" class="flex items-center justify-between text-xs text-neo-text/50 font-bold uppercase">
            <span>Revealed: {{ gameState.revealIndex }}/{{ gameState.totalLetters }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <input
              v-model="userAnswer"
              type="text"
              placeholder="Type your answer..."
              class="flex-grow px-4 py-2.5 text-sm placeholder:text-neo-text/50 neo-input"
              style="scroll-margin-top: 40vh"
              @keyup.enter="submitAnswer"
              :disabled="gameState.solvedBy !== null"
              ref="answerInput"
            />
            <button
              @click="submitAnswer"
              :disabled="gameState.solvedBy !== null || !userAnswer.trim()"
              class="bg-neo-accent text-white font-black px-5 py-2.5 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider text-sm flex items-center justify-center border-2 border-black"
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

    <div v-if="gameOver" class="flex-shrink-0 w-full max-w-lg flex flex-col items-center py-3 space-y-3 animate-slide-up">
      <div class="text-lg font-bold" :class="winnerTextClass">
        {{ gameState.winner }}
      </div>
      <button
        @click="handlePlayAgain"
        :disabled="waiting"
        class="bg-neo-accent text-white font-black py-2.5 px-8 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider"
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
import { useGame } from '../../composables/useGame.js';
import { useConfetti } from '../../composables/useConfetti.js';
import type { TriviaGameState as GameState } from '../../types/shared.js';
import WaitingIndicator from '../ui/WaitingIndicator.vue';
import HowToPlayModal from '../modals/HowToPlayModal.vue';

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

    const confetti = useConfetti();

    watch(
      () => gameState.value?.winner,
      (winner) => {
        if (winner) {
          confetti.fire();
        }
      }
    );

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
      confetti,
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
      if (d === 'easy') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20';
      if (d === 'medium') return 'text-amber-600 dark:text-amber-400 bg-amber-500/20';
      if (d === 'hard') return 'text-rose-600 dark:text-rose-400 bg-rose-500/20';
      return 'text-neo-text/75 bg-slate-100 dark:bg-slate-800';
    },
    winnerTextClass(): string {
      if (!this.gameState.winner) return '';
      if (this.gameState.winner.includes('Score')) return 'text-violet-400';
      const w = this.gameState.winner.toLowerCase();
      if (w.includes('tie')) return 'text-gray-400';
      const me = this.players.find((p: any) => p.player === this.player);
      if (me && me.name && w.includes(me.name.toLowerCase())) {
        return 'text-emerald-400';
      }
      if (w.includes(`player ${this.player}`)) return 'text-emerald-400';
      return 'text-rose-400';
    },
    sortedPlayers(): any[] {
      const list = [...this.players];
      return list.sort((a, b) => {
        const scoreA = this.gameState.scores?.[a.player] || 0;
        const scoreB = this.gameState.scores?.[b.player] || 0;
        return scoreB - scoreA;
      });
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
        return 'bg-emerald-500 text-black border-2 border-black font-black';
      }
      if (this.player === playerNum) {
        return 'bg-neo-secondary text-black border-2 border-black font-black';
      }
      return 'bg-white dark:bg-neo-card-bg text-neo-text border-2 border-black opacity-70 font-black';
    },
    displayCharClass(ch: string, _idx: number) {
      if (ch === '_') return 'text-slate-400 dark:text-slate-500 font-black opacity-80';
      if (this.phase === 'solved') {
        if (this.gameState.solvedBy === this.player) return 'text-emerald-600 dark:text-emerald-400 font-black';
        return 'text-amber-600 dark:text-amber-400 font-black';
      }
      return 'text-violet-600 dark:text-violet-400 font-black';
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
