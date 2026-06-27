<template>
  <div class="space-y-4 w-full">
    <div v-for="game in games" :key="game.id"
      class="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-l-4"
      :style="{ borderLeftColor: game.color }">
      <div class="flex-grow pr-4">
        <div class="flex items-center space-x-2 mb-1">
          <h2 class="text-base sm:text-lg font-bold text-gray-800">
            {{ game.name }}
          </h2>
          <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full"
            :style="{ backgroundColor: game.color + '10', color: game.color }">
            Ready to Play
          </span>
        </div>
        <p class="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
          {{ game.description }}
        </p>
      </div>
      <router-link :to="game.route"
        class="flex-shrink-0 text-white font-bold py-2 px-4 rounded-lg text-xs sm:text-sm transition-all duration-200 text-center block shadow-sm hover:brightness-90 active:scale-95"
        :style="{
          backgroundColor: game.color,
          boxShadow: `0 2px 6px ${game.color}30`,
        }">
        Play
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Game {
  id: string;
  name: string;
  description: string;
  route: string;
  status: string;
  color: string;
}

export default defineComponent({
  name: 'ListView',
  props: {
    games: {
      type: Array as PropType<Game[]>,
      required: true,
    },
  },
});
</script>
