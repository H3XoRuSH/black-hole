<template>
  <div class="flex flex-col items-center justify-start min-h-full bg-gray-100 p-4 sm:py-12 select-none">
    <!-- Header Section -->
    <header class="text-center mb-4 sm:mb-6 max-w-md w-full">
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

        <!-- Room Code & QR Code Button Container -->
        <div class="flex items-center gap-3 mb-8">
          <!-- Copy Room Code Button -->
          <button
            @click="copyRoomKey"
            class="relative group cursor-pointer flex-grow flex items-center justify-center bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 rounded-2xl px-6 transition-all duration-200 h-16"
          >
            <span class="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-indigo-600">
              {{ roomKey }}
            </span>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-white text-indigo-500 rounded-lg shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
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
            <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-indigo-500 transition-colors duration-200 whitespace-nowrap">
              {{ copied ? 'Copied to Clipboard!' : 'Click code to copy' }}
            </span>
          </button>

          <!-- Show QR Code Button -->
          <button
            @click="openQRModal"
            class="cursor-pointer flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl w-16 h-16 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all duration-200 flex-shrink-0"
            title="Show QR Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
        </div>

        <!-- Players List -->
        <div class="mt-6 border-t border-gray-100 pt-6 text-left">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Players ({{ players.length }}/{{ maxPlayers }})</h4>
          <div class="space-y-3 mb-6 max-h-64 overflow-y-auto">
            <!-- Dynamic Players List -->
            <div
              v-for="p in players"
              :key="p.player"
              class="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  :class="playerColorClasses(p.player)"
                >
                  P{{ p.player }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">
                    {{ p.player === 1 ? 'Host' : `Player ${p.player}` }}
                    {{ p.id === socket?.id ? '(You)' : '' }}
                  </p>
                  <p class="text-[10px] text-gray-500">Player {{ p.player }}</p>
                </div>
              </div>
              <div>
                <span
                  v-if="p.ready"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"
                >
                  Ready
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"
                >
                  Not Ready
                </span>
              </div>
            </div>

            <!-- Wait placeholder for available player slots -->
            <div
              v-for="i in Math.max(0, maxPlayers - players.length)"
              :key="'waiting-' + i"
              class="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 border-dashed rounded-xl text-gray-400"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                  ?
                </div>
                <div>
                  <p class="text-sm font-medium italic flex items-center">Waiting for player<WaitingIndicator /></p>
                  <p class="text-[10px]">Player {{ players.length + i }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Toggle Ready and Start Game buttons -->
          <div class="space-y-3 pt-4 border-t border-gray-100">
            <button
              @click="toggleReady"
              class="w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm text-sm text-white cursor-pointer"
              :class="isReady ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'"
            >
              {{ isReady ? 'Mark as Not Ready' : 'Mark as Ready' }}
            </button>

            <button
              v-if="isHost"
              @click="startGame"
              :disabled="!canStartGame"
              class="w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm text-sm text-white"
              :class="canStartGame ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            >
              Start Game
            </button>
          </div>
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
          {{ isHost ? 'Cancel & Close Room' : 'Leave Room' }}
        </router-link>
      </div>
    </div>
  </div>

  <!-- QR Code Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isQRModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
        @click.self="closeQRModal"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isQRModalOpen"
            class="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-sm w-full shadow-2xl p-6 flex flex-col items-center relative"
          >
            <!-- Close Button -->
            <button
              @click="closeQRModal"
              class="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800/80 p-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Header -->
            <div class="mb-4 text-center mt-2">
              <h3 class="text-lg font-bold tracking-tight">Scan to Join Game</h3>
              <p class="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">Room: {{ roomKey }}</p>
            </div>

            <!-- QR Code Canvas -->
            <div class="bg-white p-3 rounded-2xl shadow-inner border border-slate-700/50 mb-4 flex items-center justify-center">
              <canvas ref="qrCanvas" class="w-48 h-48 sm:w-56 sm:h-56"></canvas>
            </div>

            <!-- Footer Info -->
            <p class="text-xs text-slate-400 text-center leading-relaxed max-w-[260px]">
              Scan this QR code with a friend's phone camera to join this game room instantly.
            </p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Socket } from 'socket.io-client';
import QRCode from 'qrcode';
import WaitingIndicator from './WaitingIndicator.vue';

export default defineComponent({
  components: { WaitingIndicator },
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
    initialGameState: {
      type: Object,
      default: () => ({ players: [] }),
    },
  },
  data() {
    return {
      copied: false,
      isQRModalOpen: false,
    };
  },
  computed: {
    isHost(): boolean {
      return this.player === 1;
    },
    players(): any[] {
      return this.initialGameState?.players || [];
    },
    minPlayers(): number {
      return this.initialGameState?.minPlayers ?? 2;
    },
    maxPlayers(): number {
      return this.initialGameState?.maxPlayers ?? 2;
    },
    isReady(): boolean {
      const me = this.players.find((p: any) => p.id === this.socket?.id);
      return !!me?.ready;
    },
    canStartGame(): boolean {
      return this.players.length >= this.minPlayers && this.players.every((p: any) => p.ready);
    },
  },
  watch: {
    'players.length'(newLength) {
      if (newLength >= this.maxPlayers && this.isQRModalOpen) {
        this.closeQRModal();
      }
    },
  },
  methods: {
    generateQRCode() {
      if (!this.roomKey) return;
      this.$nextTick(() => {
        const canvas = this.$refs.qrCanvas as HTMLCanvasElement;
        if (canvas) {
          const joinUrl = `${window.location.origin}/menu?join=${this.roomKey}`;
          QRCode.toCanvas(
            canvas,
            joinUrl,
            {
              width: 256,
              margin: 1.5,
              color: {
                dark: '#4f46e5', // indigo-600 color to match theme
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
    async openQRModal() {
      this.isQRModalOpen = true;
      await this.$nextTick();
      this.generateQRCode();
    },
    closeQRModal() {
      this.isQRModalOpen = false;
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
    toggleReady() {
      if (this.socket && this.roomKey) {
        this.socket.emit('toggle-ready', { roomKey: this.roomKey });
      }
    },
    startGame() {
      if (this.socket && this.roomKey && this.canStartGame) {
        this.socket.emit('start-game', { roomKey: this.roomKey });
      }
    },
    playerColorClasses(playerNum: number) {
      const colors = [
        'bg-indigo-100 text-indigo-600',
        'bg-pink-100 text-pink-600',
        'bg-emerald-100 text-emerald-600',
        'bg-orange-100 text-orange-600',
        'bg-purple-100 text-purple-600',
        'bg-cyan-100 text-cyan-600',
        'bg-rose-100 text-rose-600',
        'bg-amber-100 text-amber-600',
      ];
      return colors[(playerNum - 1) % colors.length];
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
