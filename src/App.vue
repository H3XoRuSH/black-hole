<template>
  <div class="h-dvh md:h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden flex flex-col min-h-0">
    <div class="flex-grow flex flex-col min-h-0 overflow-y-auto">
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
