<template>
  <div class="h-dvh md:h-screen bg-gray-100 dark:bg-transparent overflow-hidden flex flex-col min-h-0">
    <div v-if="isInitialLoading" class="flex-grow flex flex-col items-center justify-center select-none animate-[fade_0.3s_ease]">
      <div class="flex flex-col items-center space-y-5">
        <div class="relative w-24 h-24 flex items-center justify-center">
          <!-- Ambient neon halo -->
          <div class="absolute inset-0 rounded-full bg-neon-cyan/20 blur-2xl animate-[neon-pulse_2.4s_ease-in-out_infinite]"></div>
          <!-- Outer Spinning Ring -->
          <div class="absolute inset-0 rounded-full border-4 border-t-neon-cyan border-r-neon-cyan/30 border-b-transparent border-l-neon-purple/50 animate-spin"></div>
          <!-- Inner Pulsing Logo -->
          <img src="/icon-512x512.png" class="absolute w-16 h-16 object-contain animate-pulse rounded-full ring-1 ring-white/10" alt="Arcade Logo" />
        </div>
        <p class="text-gray-600 dark:text-slate-300 text-sm font-semibold tracking-[0.2em] uppercase">
          Connecting to server
        </p>
      </div>
    </div>
    <div v-else class="flex-grow flex flex-col min-h-0 overflow-y-auto">
      <router-view v-slot="{ Component }">
        <transition name="view" mode="out-in">
          <component
            :is="Component"
        :socket="socket"
        :player="player"
        :room-key="roomKey"
        :connection-status="connectionStatus"
        :initial-game-state="gameState"
            @update-connection-status="connectionStatus = $event"
            @update-player="player = $event"
            @update-room-key="roomKey = $event"
          ></component>
        </transition>
      </router-view>
    </div>
    <ToastContainer />
    <BugReportModal :socket="socket" />
    <ChatBox
      :socket="socket"
      :room-key="roomKey"
      :players="gameState?.players || []"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useSocket } from './composables/useSocket.js';
import ToastContainer from './components/ToastContainer.vue';
import BugReportModal from './components/BugReportModal.vue';
import ChatBox from './components/ChatBox.vue';
export default defineComponent({
  components: { ToastContainer, BugReportModal, ChatBox },
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

<style scoped>
.view-enter-active,
.view-leave-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.view-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.view-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
