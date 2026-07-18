<template>
  <div class="relative w-full">
    <!-- Carousel viewport -->
    <div class="overflow-hidden rounded-2xl relative" @touchstart.passive="handleTouchStart" @touchend="handleTouchEnd">
      <div class="flex transition-transform duration-500 ease-in-out"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="game in games" :key="game.id" class="w-full flex-shrink-0 p-1">
          <GameCard :game="game" variant="carousel" @select-game="(id: string) => $emit('select-game', id)" />
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button @click="prevSlide"
      class="absolute -left-12 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800/70 dark:backdrop-blur hover:bg-gray-50 dark:hover:bg-slate-700/80 border border-gray-200 dark:border-slate-700/70 text-gray-600 dark:text-slate-300 dark:hover:text-neon-cyan dark:hover:border-neon-cyan/40 w-11 h-11 rounded-full hidden sm:flex items-center justify-center shadow-md transition-all duration-200 z-10 active:scale-95 cursor-pointer select-none"
      :class="{ 'opacity-30 pointer-events-none': currentIndex === 0 }">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button @click="nextSlide"
      class="absolute -right-12 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800/70 dark:backdrop-blur hover:bg-gray-50 dark:hover:bg-slate-700/80 border border-gray-200 dark:border-slate-700/70 text-gray-600 dark:text-slate-300 dark:hover:text-neon-cyan dark:hover:border-neon-cyan/40 w-11 h-11 rounded-full hidden sm:flex items-center justify-center shadow-md transition-all duration-200 z-10 active:scale-95 cursor-pointer select-none"
      :class="{
        'opacity-30 pointer-events-none': currentIndex === games.length - 1,
      }">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Pagination Dots -->
    <div class="flex justify-center space-x-2 mt-4">
      <button v-for="(game, index) in games" :key="`dot-${game.id}`" @click="goToSlide(index)"
        class="h-2 rounded-full transition-all duration-300 cursor-pointer"
        :class="index === currentIndex ? 'bg-gray-800 dark:bg-neon-cyan w-5 dark:shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'w-2 bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500'"></button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { MenuGame } from '../../types/shared.js';
import GameCard from './GameCard.vue';

export default defineComponent({
  name: 'CarouselView',
  components: { GameCard },
  props: {
    games: {
      type: Array as PropType<MenuGame[]>,
      required: true,
    },
  },
  data() {
    return {
      currentIndex: 0,
      touchStartX: 0,
      touchEndX: 0,
    };
  },
  watch: {
    games() {
      this.currentIndex = 0;
    },
  },
  methods: {
    nextSlide() {
      if (this.currentIndex < this.games.length - 1) {
        this.currentIndex++;
      }
    },
    prevSlide() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },
    goToSlide(index: number) {
      this.currentIndex = index;
    },
    handleTouchStart(event: TouchEvent) {
      this.touchStartX = event.changedTouches[0].screenX;
    },
    handleTouchEnd(event: TouchEvent) {
      this.touchEndX = event.changedTouches[0].screenX;
      this.handleSwipe();
    },
    handleSwipe() {
      const threshold = 50;
      const diff = this.touchStartX - this.touchEndX;
      if (diff > threshold) {
        this.nextSlide();
      } else if (diff < -threshold) {
        this.prevSlide();
      }
    },
  },
});
</script>
