<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 text-center select-none animate-[fade_0.3s_ease]">
    <div class="w-full max-w-md bg-white dark:bg-neo-card-bg neo-border neo-shadow p-8 flex flex-col items-center relative overflow-hidden rounded-none text-neo-text">

      <!-- Animated Sleeping/Connecting Icon -->
      <div class="relative mb-6">
        <div class="w-20 h-20 bg-neo-secondary neo-border flex items-center justify-center text-black relative rounded-none">
          <!-- Server icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          <!-- Status dot -->
          <span class="absolute bottom-1 right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-neo-accent opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-neo-accent border-2 border-black"></span>
          </span>
        </div>
      </div>

      <!-- Headline -->
      <h1 class="text-2xl font-black text-neo-text mb-3 uppercase tracking-wide">
        Preparing the Arcade
      </h1>

      <!-- Description -->
      <p class="text-sm font-bold text-neo-text/85 mb-6 leading-relaxed">
        Our arcade tables take a quick nap when no one is playing. We are turning on the power and setting up the game rooms for you!
      </p>

      <!-- Status Box -->
      <div class="w-full bg-neo-secondary/15 neo-border-2 p-4 mb-6 flex flex-col items-center gap-2 rounded-none">
        <div class="flex items-center justify-center text-sm font-black uppercase text-neo-text">
          <span>Entering the lobby</span>
          <span class="inline-flex items-center gap-0.5 ml-1.5">
            <span v-for="i in 3" :key="i" class="w-1.5 h-1.5 rounded-full bg-current animate-bounce" :style="{ animationDelay: `${(i - 1) * 0.15}s` }"></span>
          </span>
        </div>
        <p class="text-xs font-bold text-neo-text/60">This usually takes about 30 to 45 seconds.</p>
      </div>

      <!-- Manual Retry Button -->
      <button
        @click="retryConnection"
        :disabled="isRetrying"
        class="w-full py-3 px-6 bg-neo-accent text-white font-black rounded-none neo-btn uppercase tracking-wider flex items-center justify-center min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
      >
        <span v-if="isRetrying" class="flex items-center justify-center space-x-1.5">
          <svg class="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Retrying...</span>
        </span>
        <span v-else>Try Connecting Again</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useToast } from '../../composables/useToast.js';

export default defineComponent({
  name: 'Offline',
  props: {
    socket: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isRetrying: false,
    };
  },
  mounted() {
    if (this.socket && this.socket.connected) {
      const saved = sessionStorage.getItem('roomData');
      if (!saved) {
        this.$router.push('/menu');
      }
    }
  },
  methods: {
    retryConnection() {
      if (this.isRetrying) return;
      this.isRetrying = true;
      if (this.socket) {
        this.socket.disconnect();
        this.socket.connect();
      }
      setTimeout(() => {
        this.isRetrying = false;
        if (this.socket && !this.socket.connected) {
          const { showToast } = useToast();
          showToast('Still connecting... the arcade tables might need a little more time to wake up!', 'warning');
        }
      }, 3000);
    },
  },
});
</script>
