<template>
  <div
    class="w-full max-w-lg flex flex-col items-center justify-center px-4 py-3 sm:py-5 flex-shrink-0 select-none"
  >
    <!-- Game Title and Leave Button Row -->
    <div class="w-full flex items-center justify-between mb-3 sm:mb-4">
      <!-- How to Play / Instructions Button -->
      <button
        @click="openModal"
        class="text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 p-1.5 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 flex-shrink-0 border border-transparent hover:border-blue-200/50 transition-all duration-200"
        title="How to Play"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <h1
        class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent text-center flex-grow"
      >
        {{ title }}
      </h1>

      <!-- Exit / Leave Button -->
      <router-link
        to="/menu"
        class="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 flex-shrink-0"
        title="Leave Game"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </router-link>
    </div>

    <!-- Players VS Status Card -->
    <div
      class="w-full bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-gray-200 shadow-md flex items-center justify-between text-sm sm:text-base mb-3 sm:mb-4.5"
    >
      <div
        class="flex items-center space-x-2 rounded-lg px-2 sm:px-3 py-1.5 transition-all duration-300"
        :class="currentPlayer === 1 && !gameOver ? 'bg-blue-50 shadow-sm scale-105 font-bold' : currentPlayer === 1 ? 'scale-105 font-bold' : 'opacity-60'"
      >
        <span
          class="w-3.5 h-3.5 rounded-full bg-blue-500 ring-2"
          :class="currentPlayer === 1 && !gameOver ? 'ring-blue-300 animate-pulse' : 'ring-blue-200'"
        ></span>
        <span class="text-blue-700">Player 1 (Blue)</span>
        <span
          v-if="currentPlayer === 1 && !gameOver"
          class="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 leading-none"
        >TURN</span>
      </div>
      <span
        class="text-gray-400 font-mono text-xs uppercase tracking-widest mx-4 sm:mx-6 flex-shrink-0"
        >VS</span
      >
      <div
        class="flex items-center space-x-2 rounded-lg px-2 sm:px-3 py-1.5 transition-all duration-300"
        :class="currentPlayer === 2 && !gameOver ? 'bg-red-50 shadow-sm scale-105 font-bold' : currentPlayer === 2 ? 'scale-105 font-bold' : 'opacity-60'"
      >
        <span
          v-if="currentPlayer === 2 && !gameOver"
          class="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 rounded-full px-2 py-0.5 leading-none"
        >TURN</span>
        <span class="text-red-700">Player 2 (Red)</span>
        <span
          class="w-3.5 h-3.5 rounded-full bg-red-500 ring-2"
          :class="currentPlayer === 2 && !gameOver ? 'ring-red-300 animate-pulse' : 'ring-red-200'"
        ></span>
      </div>
    </div>

    <!-- Status & Info Indicator -->
    <div class="text-center">
      <div v-if="gameOver" class="text-lg font-bold" :class="winnerTextClass">
        Game Over! {{ winner }}
      </div>
      <div v-if="!gameOver" class="text-sm font-bold transition-all duration-300" :class="turnTextColor">
        {{ currentPlayer === player ? 'Your Turn' : "Opponent's Turn" }}
      </div>
      <div class="text-xs text-gray-400 mt-1.5 sm:mt-2">
        You are Player {{ player }} ({{ player === 1 ? 'Blue' : 'Red' }})
      </div>
    </div>

    <!-- Instructions Modal -->
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
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
          @click.self="closeModal"
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
              v-if="isModalOpen"
              class="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full shadow-2xl p-6 flex flex-col relative max-h-[85vh] overflow-hidden"
            >
              <!-- Close Button -->
              <button
                @click="closeModal"
                class="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800/80 p-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
                aria-label="Close Rules"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Modal Header -->
              <div class="mb-5 flex items-center space-x-3 pr-8">
                <div class="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-bold tracking-tight">How to Play</h2>
                  <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">{{ activeGameName }}</p>
                </div>
              </div>

              <!-- Rules Content (Scrollable) -->
              <div class="overflow-y-auto pr-1 text-slate-300 text-sm space-y-4 focus:outline-none">
                <div v-for="(rule, index) in rulesList" :key="index" class="flex items-start space-x-3.5 bg-slate-950/40 border border-slate-800/40 rounded-xl p-3.5 hover:border-slate-800 transition-colors">
                  <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/15 text-blue-400 font-bold text-xs border border-blue-500/25">
                    {{ index + 1 }}
                  </div>
                  <div class="flex-grow space-y-0.5">
                    <h4 class="font-bold text-slate-100 text-sm" v-if="rule.title">{{ rule.title }}</h4>
                    <p class="leading-relaxed text-slate-300 text-xs sm:text-sm">{{ rule.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  @click="closeModal"
                  class="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-95 animate-pulse"
                >
                  Got it, let's play!
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import gamesData from '../assets/games.json';

export default defineComponent({
  name: 'GameHeader',
  props: {
    title: {
      type: String,
      required: true,
    },
    currentPlayer: {
      type: Number,
      required: true,
    },
    player: {
      type: Number,
      required: true,
    },
    gameOver: {
      type: Boolean,
      required: true,
    },
    winner: {
      type: String,
      default: '',
    },
    extraInfo: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isModalOpen: false,
    };
  },
  computed: {
    turnTextColor(): string {
      if (this.currentPlayer === this.player) {
        return this.currentPlayer === 1 ? 'text-blue-600' : 'text-red-600';
      }
      return 'text-gray-400';
    },
    winnerTextClass(): string {
      if (!this.winner) return '';
      const winnerLower = this.winner.toLowerCase();
      if (winnerLower.includes('tie')) return 'text-gray-600';
      if (winnerLower.includes(`player ${this.player}`))
        return 'text-green-600';
      return 'text-red-600';
    },
    activeGameId(): string {
      const parts = this.$route.path.split('/');
      return parts[1] || '';
    },
    activeGame(): any {
      return gamesData.find((g) => g.id === this.activeGameId) || null;
    },
    activeGameName(): string {
      return this.activeGame ? this.activeGame.name : 'Board Game';
    },
    rulesList(): Array<{ title?: string; desc: string }> {
      return this.activeGame ? this.activeGame.rules || [] : [];
    },
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
      document.addEventListener('keydown', this.handleEscKey);
    },
    closeModal() {
      this.isModalOpen = false;
      document.removeEventListener('keydown', this.handleEscKey);
    },
    handleEscKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    },
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
  },
});
</script>
