<template>
  <div class="flex flex-col items-center justify-start min-h-full bg-gray-100 p-4 pt-10 sm:pt-16 pb-12 select-none">
    <!-- Header Section -->
    <header class="text-center mb-8 max-w-md w-full">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
        Gab's Arcade
      </h1>
      <p class="text-gray-600 text-sm sm:text-base">
        Select a game to start playing with your friends.
      </p>
    </header>

    <!-- Join via Room Code Card -->
    <div class="w-full max-w-md bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm mb-8 transition-all hover:shadow-md">
      <div class="flex items-center space-x-2.5 mb-4">
        <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <div>
          <h2 class="text-base font-bold text-gray-800">Join via Room Code</h2>
          <p class="text-xs text-gray-500">Enter a 6-digit code to jump directly into the game</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-grow">
          <input
            v-model="roomCode"
            @input="onRoomCodeInput"
            @keyup.enter="joinRoomByCode"
            type="text"
            placeholder="ENTER CODE"
            maxlength="6"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono tracking-widest text-lg placeholder:font-sans placeholder:tracking-normal placeholder:text-sm text-gray-800 uppercase bg-gray-50/50"
            :disabled="isValidating"
          />
        </div>
        <button
          @click="joinRoomByCode"
          :disabled="isValidating || roomCode.length !== 6"
          class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-95 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer flex items-center justify-center min-w-[120px]"
        >
          <span v-if="isValidating" class="flex items-center space-x-1.5">
            <svg class="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Joining...</span>
          </span>
          <span v-else>Join Room</span>
        </button>
      </div>

      <transition name="fade">
        <div v-if="validationError" class="mt-3 flex items-center space-x-2 text-red-600 text-xs bg-red-50 p-2.5 rounded-lg border border-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ validationError }}</span>
        </div>
      </transition>
    </div>

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
      <component :is="activeComponent" :games="games" @select-game="handleSelectGame" />
    </main>

    <!-- Footer -->
    <footer class="mt-12 pb-6 text-gray-500 text-xs text-center">
      <p>© 2026 Gab Samonte.</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Socket } from 'socket.io-client';
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
  props: {
    socket: {
      type: Object as PropType<Socket | null>,
      required: true,
    },
  },
  data() {
    return {
      games: gamesData,
      viewMode: localStorage.getItem('gamesViewMode') || 'carousel',
      roomCode: '',
      validationError: '',
      isValidating: false,
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
  mounted() {
    if (this.socket) {
      this.socket.on('room-validated', this.handleRoomValidated);
      this.socket.on('room-validation-error', this.handleRoomValidationError);
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.off('room-validated', this.handleRoomValidated);
      this.socket.off('room-validation-error', this.handleRoomValidationError);
    }
  },
  methods: {
    onRoomCodeInput() {
      this.roomCode = this.roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (this.validationError) {
        this.validationError = '';
      }
    },
    joinRoomByCode() {
      if (this.roomCode.length !== 6) {
        this.validationError = 'Room code must be exactly 6 characters.';
        return;
      }
      if (!this.socket) {
        this.validationError = 'Not connected to game server.';
        return;
      }
      this.isValidating = true;
      this.validationError = '';
      this.socket.emit('validate-room', { roomKey: this.roomCode });
    },
    handleSelectGame(gameId: string) {
      if (this.socket) {
        this.socket.emit('create-room', { gameId });
      }
    },
    handleRoomValidated({ roomKey, gameId }: { roomKey: string; gameId: string }) {
      this.isValidating = false;
      if (this.socket) {
        this.socket.emit('join-room', { roomKey, gameId });
      }
    },
    handleRoomValidationError({ message }: { message: string }) {
      this.isValidating = false;
      this.validationError = message;
    },
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
