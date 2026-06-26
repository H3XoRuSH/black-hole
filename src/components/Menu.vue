<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 select-none">
    <!-- Header Section -->
    <header class="text-center mb-10 max-w-md w-full">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Gab's Arcade</h1>
      <p class="text-gray-600 text-sm sm:text-base">
        Select a game to start playing with your friends.
      </p>
    </header>

    <!-- Games List -->
    <main class="w-full max-w-md flex flex-col space-y-6">
      <div v-for="game in games" :key="game.id"
        class="bg-white rounded-lg shadow-md border p-6 flex flex-col justify-between"
        :class="game.status === 'active' ? 'border-gray-200' : 'bg-white/60 border-gray-200 border-dashed opacity-70'">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xl font-bold" :class="game.status === 'active' ? 'text-gray-800' : 'text-gray-400'">
              {{ game.name }}
            </h2>
            <span class="px-2 py-0.5 text-xs font-semibold rounded"
              :class="game.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'">
              {{ game.status === 'active' ? 'Ready to Play' : 'Coming Soon' }}
            </span>
          </div>
          <p class="text-sm mb-6 leading-relaxed" :class="game.status === 'active' ? 'text-gray-600' : 'text-gray-400'">
            {{ game.description }}
          </p>
        </div>

        <router-link v-if="game.status === 'active'" :to="game.route"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-center block">
          Enter Game Lobby
        </router-link>
        <button v-else disabled
          class="w-full bg-gray-300 text-gray-500 font-bold py-3 px-4 rounded-lg cursor-not-allowed text-center">
          Locked
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-12 text-gray-500 text-xs text-center">
      <p>© 2026 Gab Samonte.</p>
    </footer>
  </div>
</template>

<script>
import gamesData from '../assets/games.json';

export default {
  name: 'Menu',
  data() {
    return {
      games: gamesData,
    };
  },
};
</script>
