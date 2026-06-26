<template>
  <!-- Mobile Header / Hamburger Toggle -->
  <div
    class="md:hidden flex items-center justify-between bg-white text-gray-800 p-4 border-b border-gray-200 z-30 flex-shrink-0"
    v-if="showSidebar">
    <span class="font-bold text-gray-800 tracking-wide text-sm">Gab's Arcade</span>
    <button @click="isOpen = !isOpen" class="p-1 focus:outline-none text-gray-600 hover:text-gray-900">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path v-if="isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>

  <!-- Sidebar Container -->
  <aside v-if="showSidebar"
    class="bg-gray-50 border-r border-gray-200 text-gray-800 flex flex-col justify-between transition-all duration-300 z-25 flex-shrink-0"
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      'fixed inset-y-0 left-0 w-60 md:relative md:flex md:w-60 pt-16 md:pt-0'
    ]">
    <div class="px-3 py-4">
      <!-- Title Logo (Desktop Only) -->
      <div class="hidden md:block px-3 mb-6">
        <span class="font-bold text-lg text-gray-800 tracking-wide">Gab's Arcade</span>
      </div>

      <!-- Navigation Links -->
      <nav class="space-y-1">
        <!-- Main Menu -->
        <router-link to="/menu" @click="isOpen = false"
          class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-gray-200"
          :class="isRouteActive('/menu') ? 'bg-gray-200 text-gray-950 font-semibold' : 'text-gray-600'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Main Menu</span>
        </router-link>

        <div class="pt-5 pb-1 px-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Games</div>

        <div v-for="game in games" :key="game.id">
          <router-link v-if="game.status === 'active'" :to="game.route" @click="isOpen = false"
            class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 hover:bg-gray-200"
            :class="isGameRouteActive(game.route) ? 'bg-gray-200 text-gray-950 font-semibold' : 'text-gray-600'">
            <div class="flex items-center space-x-3">
              <div class="w-2.5 h-2.5 rounded-full border border-gray-400 bg-gray-300"></div>
              <span>{{ game.name }}</span>
            </div>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </router-link>

          <div v-else
            class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed select-none">
            <div class="flex items-center space-x-3">
              <div class="w-2.5 h-2.5 rounded-full border border-gray-300 bg-gray-150 border-dashed"></div>
              <span>{{ game.name }}</span>
            </div>
            <span class="text-[9px] font-semibold text-gray-400">soon</span>
          </div>
        </div>
      </nav>
    </div>

    <!-- Bottom Section -->
    <div class="p-4 border-t border-gray-200 bg-gray-100/50">
      <div v-if="roomKey" class="px-3 py-2 rounded bg-white border border-gray-200 text-xs text-gray-600">
        <span class="block text-gray-400 text-[10px] uppercase font-bold tracking-wide mb-0.5">Active Room</span>
        <span class="font-mono font-semibold text-gray-700 tracking-wider">{{ roomKey }}</span>
      </div>
      <div v-else class="text-center text-xs text-gray-400 py-1">
        No active game
      </div>
    </div>
  </aside>

  <!-- Overlay to close menu on mobile -->
  <div v-if="showSidebar && isOpen" @click="isOpen = false" class="fixed inset-0 bg-black/30 z-10 md:hidden"></div>
</template>

<script>
import gamesData from '../assets/games.json';

export default {
  props: {
    roomKey: String,
  },
  data() {
    return {
      isOpen: false,
      games: gamesData,
    };
  },
  computed: {
    showSidebar() {
      return this.$route.path !== '/menu';
    },
  },
  methods: {
    isRouteActive(path) {
      return this.$route.path === path;
    },
    isGameRouteActive(route) {
      const prefix = route.split('/').slice(0, 2).join('/');
      return this.$route.path.startsWith(prefix);
    },
  },
};
</script>
