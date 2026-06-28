<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <div v-for="game in games" :key="game.id"
      class="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-5 flex flex-col justify-between h-[230px] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-t-4"
      :style="{ borderTopColor: game.color }">
      <div>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm sm:text-base font-bold text-gray-800 line-clamp-1">
            {{ game.name }}
          </h2>
          <span
            v-if="game.supportsAI"
            class="px-1.5 py-0.2 text-[8px] font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex-shrink-0 ml-1"
          >
            Play vs AI
          </span>
        </div>
        <p class="text-gray-500 text-[11px] sm:text-xs leading-relaxed line-clamp-4">
          {{ game.description }}
        </p>
      </div>
      <button @click="$emit('select-game', game.id)"
        class="w-full text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 text-center block shadow-sm hover:brightness-90 active:scale-95 mt-3 cursor-pointer border-none"
        :style="{
          backgroundColor: game.color,
          boxShadow: `0 2px 6px ${game.color}30`,
        }">
        Host
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { MenuGame } from '../../types/shared.js';

export default defineComponent({
  name: 'GridView',
  props: {
    games: {
      type: Array as PropType<MenuGame[]>,
      required: true,
    },
  },
});
</script>
