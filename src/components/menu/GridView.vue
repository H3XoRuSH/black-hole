<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <div v-for="game in games" :key="game.id"
      class="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-5 flex flex-col justify-between h-[230px] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-t-4"
      :style="{ borderTopColor: game.color }">
      <div>
        <h2 class="text-sm sm:text-base font-bold text-gray-800 line-clamp-1 mb-2">
          {{ game.name }}
        </h2>
        <p class="text-gray-500 text-[11px] sm:text-xs leading-relaxed line-clamp-4">
          {{ game.description }}
        </p>
      </div>
      <router-link :to="game.route"
        class="w-full text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 text-center block shadow-sm hover:brightness-90 active:scale-95 mt-3"
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
  name: 'GridView',
  props: {
    games: {
      type: Array as PropType<Game[]>,
      required: true,
    },
  },
});
</script>
