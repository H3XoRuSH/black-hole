<template>
  <!-- List variant -->
  <div v-if="variant === 'list'"
    class="bg-white dark:bg-slate-800 rounded-2xl card-3d border border-gray-200 dark:border-slate-700 p-5 flex items-center justify-between border-l-4"
    :style="{ borderLeftColor: game.color }">
    <div class="flex-grow pr-4">
      <div class="flex items-center space-x-2 mb-1">
        <div v-if="game.icon" class="w-7 h-7 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
        <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100">{{ game.name }}</h2>
        <span v-if="game.supportsAI" class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700 flex-shrink-0">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 flex-shrink-0">Single Player</span>
      </div>
      <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      class="flex-shrink-0 text-white font-bold py-2 px-4 rounded-lg text-xs sm:text-sm transition-all duration-200 text-center block shadow-sm hover:brightness-90 active:scale-95 cursor-pointer border-none"
      :style="{ backgroundColor: game.color, boxShadow: `0 2px 6px ${game.color}30` }">
      Host
    </button>
  </div>

  <!-- Grid variant -->
  <div v-else-if="variant === 'grid'"
    class="bg-white dark:bg-slate-800 rounded-2xl card-3d card-3d--grid border border-gray-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col justify-between h-[230px] border-t-4"
    :style="{ borderTopColor: game.color }">
    <div>
      <div class="flex items-center justify-between mb-2 min-w-0">
        <div class="flex items-center space-x-1.5 min-w-0">
          <div v-if="game.icon" class="w-5 h-5 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
          <h2 class="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{{ game.name }}</h2>
        </div>
        <span v-if="game.supportsAI" class="px-1.5 py-0.2 text-[8px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700 flex-shrink-0 ml-1">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-1.5 py-0.2 text-[8px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 flex-shrink-0 ml-1">Single Player</span>
      </div>
      <p class="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs leading-relaxed line-clamp-4">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      class="w-full text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 text-center block shadow-sm hover:brightness-90 active:scale-95 mt-3 cursor-pointer border-none"
      :style="{ backgroundColor: game.color, boxShadow: `0 2px 6px ${game.color}30` }">
      Host
    </button>
  </div>

  <!-- Carousel variant (default) -->
  <div v-else
    class="bg-white dark:bg-slate-800 rounded-2xl card-3d card-3d--carousel border border-gray-200 dark:border-slate-700 p-6 sm:p-8 flex flex-col justify-between h-[360px] relative border-t-4"
    :style="{ borderTopColor: game.color }">
    <div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2.5 min-w-0">
          <div v-if="game.icon" class="w-8 h-8 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">{{ game.name }}</h2>
        </div>
        <span v-if="game.supportsAI" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700 flex-shrink-0 ml-1">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 flex-shrink-0 ml-1">Single Player</span>
      </div>
      <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      class="w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 text-center block shadow-md hover:shadow-lg hover:brightness-90 active:scale-[0.98] cursor-pointer"
      :style="{ backgroundColor: game.color, boxShadow: `0 4px 12px ${game.color}40` }">
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
});
</script>

<style scoped>
.card-3d {
  box-shadow:
    6px 5px 0 rgba(0,0,0,0.08),
    11px 12px 0 rgba(0,0,0,0.05),
    17px 16px 0 rgba(0,0,0,0.03);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.card-3d:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    8px 7px 0 rgba(0,0,0,0.1),
    14px 15px 0 rgba(0,0,0,0.07),
    22px 21px 0 rgba(0,0,0,0.04);
}

.card-3d--grid {
  box-shadow:
    6px 6px 0 rgba(0,0,0,0.08),
    9px 9px 0 rgba(0,0,0,0.05),
    13px 13px 0 rgba(0,0,0,0.03);
}

.card-3d--grid:hover {
  transform: translateY(-4px);
  box-shadow:
    6px 6px 0 rgba(0,0,0,0.1),
    9px 9px 0 rgba(0,0,0,0.07),
    13px 13px 0 rgba(0,0,0,0.04);
}

.card-3d--carousel:hover {
  transform: none;
  animation: wiggle 0.7s ease;
}

.dark .card-3d {
  box-shadow:
    6px 5px 0 rgba(0,0,0,0.16),
    11px 12px 0 rgba(0,0,0,0.12),
    17px 16px 0 rgba(0,0,0,0.08);
}

.dark .card-3d:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    8px 7px 0 rgba(0,0,0,0.22),
    14px 15px 0 rgba(0,0,0,0.16),
    22px 21px 0 rgba(0,0,0,0.1);
}

.dark .card-3d--grid {
  box-shadow:
    6px 6px 0 rgba(0,0,0,0.16),
    9px 9px 0 rgba(0,0,0,0.12),
    13px 13px 0 rgba(0,0,0,0.08);
}

.dark .card-3d--carousel:hover {
  transform: none;
  animation: wiggle 0.7s ease;
}

.dark .card-3d--grid:hover {
  transform: translateY(-4px);
  box-shadow:
    6px 6px 0 rgba(0,0,0,0.22),
    9px 9px 0 rgba(0,0,0,0.16),
    13px 13px 0 rgba(0,0,0,0.1);
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-0.4deg); }
  60% { transform: rotate(0.4deg); }
}
</style>
