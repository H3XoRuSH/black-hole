<template>
  <div class="h-dvh md:h-screen bg-neo-bg bg-neo-grid text-neo-text overflow-hidden flex flex-col min-h-0 font-sans">
    <div v-if="isInitialLoading" class="flex-grow flex flex-col items-center justify-center select-none">
      <div class="flex flex-col items-center space-y-6 animate-scale-in">
        <div class="relative w-36 h-36 flex items-center justify-center">
          <div class="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-indigo-600/30 dark:border-t-indigo-400 dark:border-r-indigo-400/30 border-b-transparent border-l-transparent animate-spin"></div>
          <img src="/icon-512x512.png" class="absolute w-32 h-32 object-contain rounded-full animate-pulse" alt="Arcade Logo" />
        </div>
        <div class="flex flex-col items-center space-y-2">
          <p class="text-neo-text font-black text-lg uppercase tracking-wider">
            Gab's Arcade
          </p>
          <p class="text-neo-text/50 text-sm font-bold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-neo-accent animate-pulse"></span>
            Connecting to server...
          </p>
        </div>
      </div>
    </div>
    <div v-else ref="scrollContainer" class="flex-grow flex flex-col min-h-0 overflow-y-auto">
      <router-view
        v-slot="{ Component, route }"
        :socket="socket"
        :player="player"
        :room-key="roomKey"
        :connection-status="connectionStatus"
        :initial-game-state="gameState"
        @update-connection-status="connectionStatus = $event"
        @update-player="player = $event"
        @update-room-key="roomKey = $event"
      >
        <Transition name="page" mode="out-in">
          <div :key="route.path" class="flex-grow flex flex-col min-h-0">
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
            />
          </div>
        </Transition>
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
import ToastContainer from './components/ui/ToastContainer.vue';
import BugReportModal from './components/modals/BugReportModal.vue';
import ChatBox from './components/ui/ChatBox.vue';
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
      this.$nextTick(() => {
        if (this.$refs.scrollContainer) {
          (this.$refs.scrollContainer as HTMLElement).scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      });
    },
  },
});
</script>
