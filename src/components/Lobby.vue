<template>
  <div class="flex flex-col items-center justify-center min-h-full bg-gray-100 p-4 select-none">
    <!-- Header Section -->
    <header class="text-center mb-4 sm:mb-8 max-w-md w-full">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
        {{ gameName }}
      </h1>
      <p class="text-gray-500 text-sm">Game Lobby</p>
    </header>

    <!-- Main Card -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 sm:p-8 text-center">
      <div v-if="roomKey">
        <p class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
          Share this Room Code with your friend
        </p>

        <!-- Large Room Code Display with Copy Ability -->
        <div
          @click="copyRoomKey"
          class="relative group cursor-pointer inline-flex items-center justify-center space-x-3 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 rounded-2xl py-4 sm:py-5 px-6 sm:px-8 transition-all duration-200 w-full mb-8"
        >
          <span class="text-4xl sm:text-5xl font-extrabold font-mono tracking-widest text-indigo-600">
            {{ roomKey }}
          </span>
          <div class="p-1.5 bg-white text-indigo-500 rounded-lg shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform duration-200">
            <!-- Copy Icon -->
            <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <!-- Check Icon -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <!-- Copy Tooltip -->
          <span class="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 group-hover:text-indigo-500 transition-colors duration-200">
            {{ copied ? 'Copied to Clipboard!' : 'Click code to copy' }}
          </span>
        </div>

        <!-- QR Code Section -->
        <div class="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
          <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-100/50">
            <canvas ref="qrCanvas" class="w-32 h-32"></canvas>
          </div>
          <p class="text-[11px] text-gray-500 mt-2 max-w-[240px] leading-normal">
            Scan this QR code with a friend's phone to join instantly
          </p>
        </div>

        <!-- Waiting Status -->
        <div class="flex flex-col items-center justify-center mt-4 sm:mt-6 space-y-3">
          <div class="flex space-x-2.5">
            <span class="w-3.5 h-3.5 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
            <span class="w-3.5 h-3.5 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            <span class="w-3.5 h-3.5 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
          </div>
          <p class="text-sm font-medium text-gray-600">
            {{ connectionStatus || 'Waiting for another player to join...' }}
          </p>
        </div>
      </div>

      <!-- If no room key (e.g. direct url navigation or player disconnected) -->
      <div v-else class="py-4">
        <div v-if="connectionStatus" class="mb-6">
          <div class="inline-flex p-3 bg-red-50 text-red-600 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">Connection Lost</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ connectionStatus }}</p>
        </div>
        <div v-else class="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-sm text-gray-500">No active game room detected.</p>
        </div>
        <router-link to="/menu" class="inline-block bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 mt-2">
          Back to Main Menu
        </router-link>
      </div>

      <!-- Leave / Cancel Button (only shown if room exists) -->
      <div v-if="roomKey" class="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
        <router-link
          to="/menu"
          class="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-200"
        >
          Cancel & Close Room
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Socket } from 'socket.io-client';
import QRCode from 'qrcode';

export default defineComponent({
  props: {
    socket: {
      type: Object as PropType<Socket>,
      required: true,
    },
    connectionStatus: String,
    roomKey: String,
    player: Number,
    gameId: {
      type: String,
      default: 'black-hole',
    },
    gameName: {
      type: String,
      default: 'Black Hole',
    },
  },
  data() {
    return {
      copied: false,
    };
  },
  watch: {
    roomKey() {
      this.generateQRCode();
    },
  },
  mounted() {
    this.generateQRCode();
  },
  methods: {
    generateQRCode() {
      if (!this.roomKey) return;
      this.$nextTick(() => {
        const canvas = this.$refs.qrCanvas as HTMLCanvasElement;
        if (canvas) {
          QRCode.toCanvas(
            canvas,
            this.roomKey,
            {
              width: 128,
              margin: 1,
              color: {
                dark: '#4f46e5', // indigo-600 to match theme
                light: '#ffffff',
              },
            },
            (error) => {
              if (error) console.error('Failed to generate QR Code:', error);
            }
          );
        }
      });
    },
    async copyRoomKey() {
      if (!this.roomKey) return;
      try {
        await navigator.clipboard.writeText(this.roomKey);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    },
  },
  beforeRouteLeave(to: any, from: any, next: any) {
    // Only tell the server to clear the room if we are NOT navigating to the game itself
    const gamePathPrefix = `/${this.gameId}/game`;
    if (this.roomKey && !to.path.startsWith(gamePathPrefix)) {
      this.socket.emit('leave-room', { roomKey: this.roomKey });
    }
    next();
  },
});
</script>
