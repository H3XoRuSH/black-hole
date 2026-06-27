<template>
  <div
    class="w-full max-w-lg flex flex-col items-center justify-center px-4 py-2 sm:py-3 flex-shrink-0 select-none"
  >
    <!-- Game Title and Leave Button Row -->
    <div class="w-full flex items-center justify-between mb-1.5">
      <!-- Left Spacer to balance the layout -->
      <div class="w-8 sm:w-10"></div>

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
      class="w-full bg-white/80 backdrop-blur-md rounded-xl p-3 border border-gray-200 shadow-sm flex items-center justify-between text-sm sm:text-base mb-1.5"
    >
      <div
        class="flex items-center space-x-2 transition-all duration-200"
        :class="currentPlayer === 1 ? 'scale-105 font-bold' : 'opacity-70'"
      >
        <span
          class="w-3.5 h-3.5 rounded-full bg-blue-500 ring-2 ring-blue-300"
        ></span>
        <span class="text-blue-700">Player 1 (Blue)</span>
      </div>
      <span
        class="text-gray-400 font-mono text-xs uppercase tracking-widest mx-2"
        >VS</span
      >
      <div
        class="flex items-center space-x-2 transition-all duration-200"
        :class="currentPlayer === 2 ? 'scale-105 font-bold' : 'opacity-70'"
      >
        <span class="text-red-700">Player 2 (Red)</span>
        <span
          class="w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-red-300"
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
      <div class="text-xs text-gray-500 mt-1">
        You are Player {{ player }} ({{ player === 1 ? 'Blue' : 'Red' }})
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
  },
});
</script>
