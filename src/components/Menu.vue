<template>
  <div class="flex flex-col items-center justify-center min-h-full bg-gray-100 p-4 select-none">
    <!-- Header Section -->
    <header class="text-center mb-10 max-w-md w-full">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
        Gab's Arcade
      </h1>
      <p class="text-gray-600 text-sm sm:text-base">
        Select a game to start playing with your friends.
      </p>
    </header>

    <!-- View Toggle Control -->
    <div
      class="flex bg-gray-200/80 backdrop-blur-sm p-1 rounded-xl mb-8 space-x-1 w-full max-w-[280px] justify-center shadow-inner">
      <button @click="viewMode = 'carousel'" :class="viewMode === 'carousel'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-800'
        " class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer text-center">
        Carousel
      </button>
      <button @click="viewMode = 'list'" :class="viewMode === 'list'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-800'
        " class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer text-center">
        List
      </button>
      <button @click="viewMode = 'grid'" :class="viewMode === 'grid'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-800'
        " class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer text-center">
        Grid
      </button>
    </div>

    <!-- Games Display Section -->
    <main class="w-full max-w-md relative px-4 sm:px-0">
      <component :is="activeComponent" :games="games" />
    </main>

    <!-- Footer -->
    <footer class="mt-12 text-gray-500 text-xs text-center">
      <p>© 2026 Gab Samonte.</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import gamesData from '../assets/games.json';
import CarouselView from './menu/CarouselView.vue';
import ListView from './menu/ListView.vue';
import GridView from './menu/GridView.vue';

export default defineComponent({
  name: 'Menu',
  components: {
    CarouselView,
    ListView,
    GridView,
  },
  data() {
    return {
      games: gamesData,
      viewMode: localStorage.getItem('gamesViewMode') || 'carousel',
    };
  },
  computed: {
    activeComponent() {
      if (this.viewMode === 'list') return 'ListView';
      if (this.viewMode === 'grid') return 'GridView';
      return 'CarouselView';
    },
  },
  watch: {
    viewMode(newMode) {
      localStorage.setItem('gamesViewMode', newMode);
    },
  },
});
</script>
