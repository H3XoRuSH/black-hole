<template>
  <div class="h-dvh md:h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden flex flex-col min-h-0">
    <div v-if="isInitialLoading" class="flex-grow flex flex-col items-center justify-center select-none animate-[fade_0.3s_ease]">
      <div class="flex flex-col items-center space-y-4">
        <div class="relative w-20 h-20 flex items-center justify-center">
          <!-- Outer Spinning Ring -->
          <div class="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-indigo-600/30 dark:border-t-indigo-400 dark:border-r-indigo-400/30 border-b-transparent border-l-transparent animate-spin"></div>
          <!-- Inner Pulsing Logo -->
          <img src="/icon-512x512.png" class="absolute w-16 h-16 object-contain animate-pulse rounded-full" alt="Arcade Logo" />
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm font-semibold tracking-wide">
          Connecting to server...
        </p>
      </div>
    </div>
    <div v-else class="flex-grow flex flex-col min-h-0 overflow-y-auto">
      <router-view
        :socket="socket"
        :player="player"
        :room-key="roomKey"
        :connection-status="connectionStatus"
        :initial-game-state="gameState"
        @update-connection-status="connectionStatus = $event"
        @update-player="player = $event"
        @update-room-key="roomKey = $event"
      ></router-view>
    </div>
    <ToastContainer />
    <BugReportModal :socket="socket" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useSocket } from './composables/useSocket.js';
import ToastContainer from './components/ToastContainer.vue';
import BugReportModal from './components/BugReportModal.vue';
export default defineComponent({
  components: { ToastContainer, BugReportModal },
  setup() {
    const router = useRouter() as any;
    return { ...useSocket(router) };
  },
  watch: {
    $route(to: any) {
      const isLobby = to.path.endsWith('/lobby');
      const isGame = to.path.includes('/game/');
      if (!isLobby && !isGame) {
        sessionStorage.removeItem('roomData');
        this.roomKey = '';
        this.player = null;
        this.connectionStatus = '';
      }
    },
  },
});
</script>
