<template>
  <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
    <GameCard v-for="game in games" :key="game.id" :game="game" variant="grid" @select-game="(id: string) => $emit('select-game', id)" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { MenuGame } from '../../types/shared.js';
import GameCard from './GameCard.vue';

export default defineComponent({
  name: 'GridView',
  components: { GameCard },
  props: {
    games: {
      type: Array as PropType<MenuGame[]>,
      required: true,
    },
  },
});
</script>
