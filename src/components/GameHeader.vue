<template>
  <div
    class="w-full max-w-lg flex flex-col items-center justify-center px-4 py-2 sm:py-3 flex-shrink-0 select-none"
  >
    <!-- Game Title -->
    <h1
      class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-1.5 text-center"
    >
      {{ title }}
    </h1>

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
