<template>
  <!-- List variant -->
  <div v-if="variant === 'list'"
    class="group glass-light dark:glass rounded-2xl p-5 flex items-center justify-between transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 border-l-4 relative overflow-hidden"
    :style="{ borderLeftColor: game.color }"
    @mouseenter="hovered = true" @mouseleave="hovered = false">
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      :style="{ boxShadow: `inset 0 0 40px -12px ${game.color}` }"></div>
    <div class="flex-grow pr-4 relative">
      <div class="flex items-center space-x-2 mb-1">
        <div v-if="game.icon" class="w-7 h-7 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
        <h2 class="font-display text-base sm:text-lg font-bold text-gray-800 dark:text-white">{{ game.name }}</h2>
        <span v-if="game.supportsAI" class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-neon-cyan/10 text-indigo-800 dark:text-neon-cyan border border-indigo-200 dark:border-neon-cyan/30 flex-shrink-0">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-neon-green/10 text-emerald-800 dark:text-neon-green border border-emerald-200 dark:border-neon-green/30 flex-shrink-0">Single Player</span>
      </div>
      <p class="text-gray-500 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      class="relative flex-shrink-0 text-white font-bold py-2 px-4 rounded-lg text-xs sm:text-sm transition-all duration-200 text-center block hover:brightness-110 active:scale-95 cursor-pointer border-none"
      :style="{ backgroundColor: game.color, boxShadow: `0 4px 16px -4px ${game.color}` }">
      Host
    </button>
  </div>

  <!-- Grid variant -->
  <div v-else-if="variant === 'grid'"
    class="group glass-light dark:glass rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-[230px] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 border-t-4 relative overflow-hidden"
    :style="{ borderTopColor: game.color }">
    <div class="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
      :style="{ backgroundColor: game.color }"></div>
    <div class="relative">
      <div class="flex items-center justify-between mb-2 min-w-0">
        <div class="flex items-center space-x-1.5 min-w-0">
          <div v-if="game.icon" class="w-5 h-5 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
          <h2 class="font-display text-sm sm:text-base font-bold text-gray-800 dark:text-white line-clamp-1">{{ game.name }}</h2>
        </div>
        <span v-if="game.supportsAI" class="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-indigo-100 dark:bg-neon-cyan/10 text-indigo-800 dark:text-neon-cyan border border-indigo-200 dark:border-neon-cyan/30 flex-shrink-0 ml-1">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-emerald-100 dark:bg-neon-green/10 text-emerald-800 dark:text-neon-green border border-emerald-200 dark:border-neon-green/30 flex-shrink-0 ml-1">Single Player</span>
      </div>
      <p class="text-gray-500 dark:text-slate-400 text-[11px] sm:text-xs leading-relaxed line-clamp-4">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      class="relative w-full text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 text-center block hover:brightness-110 active:scale-95 mt-3 cursor-pointer border-none"
      :style="{ backgroundColor: game.color, boxShadow: `0 4px 16px -4px ${game.color}` }">
      Host
    </button>
  </div>

  <!-- Carousel variant (default) -->
  <div v-else
    class="group glass-light dark:glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-[360px] relative overflow-hidden border-t-4"
    :style="{ borderTopColor: game.color }">
    <div class="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-25 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
      :style="{ backgroundColor: game.color }"></div>
    <div class="relative">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2.5 min-w-0">
          <div v-if="game.icon" class="w-8 h-8 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
          <h2 class="font-display text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">{{ game.name }}</h2>
        </div>
        <span v-if="game.supportsAI" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-neon-cyan/10 text-indigo-800 dark:text-neon-cyan border border-indigo-200 dark:border-neon-cyan/30 flex-shrink-0 ml-1">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-neon-green/10 text-emerald-800 dark:text-neon-green border border-emerald-200 dark:border-neon-green/30 flex-shrink-0 ml-1">Single Player</span>
      </div>
      <p class="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      class="relative w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 text-center block hover:brightness-110 active:scale-[0.98] cursor-pointer"
      :style="{ backgroundColor: game.color, boxShadow: `0 6px 24px -6px ${game.color}` }">
      Host Game
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { MenuGame } from '../../types/shared.js';

export default defineComponent({
  name: 'GameCard',
  props: {
    game: {
      type: Object as PropType<MenuGame>,
      required: true,
    },
    variant: {
      type: String as PropType<'carousel' | 'list' | 'grid'>,
      default: 'carousel',
    },
  },
  emits: ['select-game'],
  data() {
    return {
      hovered: false,
    };
  },
});
</script>
