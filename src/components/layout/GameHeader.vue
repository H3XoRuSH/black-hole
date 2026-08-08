<template>
  <div
    class="w-full max-w-lg flex flex-col items-center justify-center px-4 py-3 sm:py-5 flex-shrink-0 select-none"
  >
    <!-- Game Title and Leave Button Row -->
    <div class="w-full flex items-center justify-between mb-3 sm:mb-4">
      <!-- How to Play / Instructions Button -->
      <button
        @click="openModal"
        class="text-neo-text/70 hover:text-neo-muted transition-colors p-1.5 rounded-none flex items-center justify-center cursor-pointer neo-border-2 flex-shrink-0 bg-white dark:bg-neo-card-bg shadow-sm"
        title="How to Play"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <div class="flex items-center justify-center flex-grow space-x-2.5">
        <div v-if="activeGame?.icon" class="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" :style="{ color: activeGame.color }" v-html="activeGame.icon"></div>
        <h1
          class="text-2xl sm:text-3xl font-black uppercase text-neo-text tracking-tighter text-center"
        >
          {{ title }}
        </h1>
      </div>

      <!-- Exit / Leave Button -->
      <router-link
        to="/menu"
        class="text-neo-text/70 hover:text-neo-accent transition-colors p-1.5 rounded-none flex items-center justify-center cursor-pointer neo-border-2 flex-shrink-0 bg-white dark:bg-neo-card-bg shadow-sm"
        title="Leave Game"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </router-link>
    </div>

    <!-- Connection Status Banner -->
    <div
      v-if="connectionStatus"
       class="w-full mb-3 sm:mb-4 bg-neo-secondary/20 neo-border-2 text-neo-text rounded-none p-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{{ connectionStatus }}</span>
    </div>

    <!-- Players VS Status Card -->
    <div
      class="w-full bg-white dark:bg-neo-card-bg p-3 sm:p-4 neo-border neo-shadow-sm flex items-stretch justify-between text-sm sm:text-base mb-3 sm:mb-4.5 text-neo-text rounded-none"
    >
      <div
        class="flex items-center gap-2 rounded-none px-2 sm:px-3 py-1.5 transition-all duration-100 min-w-0 flex-1"
          :class="currentPlayer === 1 && !gameOver ? 'bg-neo-secondary/30 border-2 border-black' : 'opacity-60 border-2 border-transparent'"
        >
          <span
            class="w-3 h-3 rounded-full bg-blue-500 shrink-0 ring-2 ring-blue-200"
            :class="currentPlayer === 1 && !gameOver ? 'animate-pulse ring-blue-300' : ''"
          ></span>
          <span class="text-neo-text font-bold truncate">{{ p1Label }}</span>
          <span
            class="text-[10px] font-black uppercase tracking-wider text-black bg-neo-secondary rounded-full px-1.5 py-0.5 leading-none shrink-0 transition-opacity"
            :class="currentPlayer === 1 && !gameOver ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'"
          >TURN</span>
        </div>

        <span class="text-neo-text/50 font-black text-xs mx-2 sm:mx-4 shrink-0 self-center">VS</span>

        <div
          class="flex items-center gap-2 rounded-none px-2 sm:px-3 py-1.5 transition-all duration-100 min-w-0 flex-1"
        :class="currentPlayer === 2 && !gameOver ? 'bg-neo-secondary/30 border-2 border-black' : 'opacity-60 border-2 border-transparent'"
      >
        <span
          class="text-[10px] font-black uppercase tracking-wider text-black bg-neo-secondary rounded-full px-1.5 py-0.5 leading-none shrink-0 transition-opacity"
          :class="currentPlayer === 2 && !gameOver ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'"
        >TURN</span>
        <span class="text-neo-text font-bold truncate">{{ p2Label }}</span>
        <span
          class="w-3 h-3 rounded-full bg-red-500 shrink-0 ring-2 ring-red-200"
          :class="currentPlayer === 2 && !gameOver ? 'animate-pulse ring-red-300' : ''"
        ></span>
      </div>
    </div>

    <!-- Status & Info Indicator -->
    <div class="text-center min-h-[64px] flex flex-col justify-center">
      <div v-if="gameOver" class="text-lg font-black uppercase tracking-wide" :class="winnerTextClass">
        Game Over! {{ winner }}
      </div>
      <div v-if="!gameOver" class="text-sm font-black uppercase tracking-wider transition-all duration-300" :class="turnTextColor">
        {{ currentPlayer === player ? 'Your Turn' : "Opponent's Turn" }}
      </div>
      <div class="text-xs font-bold text-neo-text/60 mt-1.5">
        You are {{ youLabel }}
      </div>
    </div>

    <!-- AI Recap Button -->
    <div
      v-if="gameOver && gameState && isRecapSupported"
      class="w-full mt-4 flex justify-center"
    >
      <button
        @click="openRecapModal"
        class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-none transition-all duration-150 cursor-pointer shadow-md active:scale-95 flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd" />
        </svg>
        <span>AI Recap</span>
      </button>
    </div>

    <HowToPlayModal
      :is-open="isModalOpen"
      :game-id="activeGameId"
      @close="closeModal"
    />

    <!-- Recap Modal -->
    <AiRecapModal
      :is-open="showRecapModal"
      :recap-text="recapText"
      :loading="recapLoading"
      :conversation="recapConversation"
      :question="recapQuestion"
      :ask-loading="recapAskLoading"
      :question-asked="recapQuestionAsked"
      :game-name="activeGameName"
      @close="closeRecapModal"
      @request-recap="requestRecap"
      @send-question="sendRecapQuestion"
      @update:question="recapQuestion = $event"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef, watch, type Ref } from 'vue';
import gamesData from '../../assets/games.json';
import { useRecap } from '../../composables/useRecap.js';
import HowToPlayModal from '../modals/HowToPlayModal.vue';
import AiRecapModal from '../modals/AiRecapModal.vue';

export default defineComponent({
  name: 'GameHeader',
  components: { HowToPlayModal, AiRecapModal },
  props: {
    connectionStatus: String,
    title: {
      type: String,
      required: true,
    },
    currentPlayer: {
      type: Number,
      required: true,
    },
    player: {
      type: Number,
      required: true,
    },
    gameOver: {
      type: Boolean,
      required: true,
    },
    winner: {
      type: String,
      default: '',
    },
    extraInfo: {
      type: String,
      default: '',
    },
    gameState: {
      type: Object,
      default: null,
    },
    socket: {
      type: null as any,
      default: null,
    },
    roomKey: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const recap = useRecap(
      toRef(props, 'socket') as Ref<any>,
      toRef(props, 'roomKey') as Ref<string>,
    );

    function handleRecapEscKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        recap.closeRecapModal();
      }
    }

    watch(recap.showRecapModal, (val) => {
      if (val) {
        document.addEventListener('keydown', handleRecapEscKey);
      } else {
        document.removeEventListener('keydown', handleRecapEscKey);
      }
    });

    return {
      showRecapModal: recap.showRecapModal,
      recapText: recap.recapText,
      recapLoading: recap.recapLoading,
      recapConversation: recap.recapConversation,
      recapQuestion: recap.recapQuestion,
      recapAskLoading: recap.recapAskLoading,
      recapQuestionAsked: recap.recapQuestionAsked,
      requestRecap: recap.requestRecap,
      openRecapModal: recap.openRecapModal,
      closeRecapModal: recap.closeRecapModal,
      sendRecapQuestion: recap.sendRecapQuestion,
      resetRecap: recap.resetRecap,
      initRecap: recap.initRecap,
    };
  },
  data() {
    return {
      isModalOpen: false,
    };
  },
  computed: {
    players(): any[] {
      return this.gameState?.players || [];
    },
    p1Name(): string {
      const p = this.players.find((p: any) => p.player === 1);
      return p?.name || 'Player 1';
    },
    p2Name(): string {
      const p = this.players.find((p: any) => p.player === 2);
      return p?.name || 'Player 2';
    },
    p1Label(): string {
      return this.p1Name;
    },
    p2Label(): string {
      return this.p2Name;
    },
    youLabel(): string {
      const me = this.players.find((p: any) => p.player === this.player);
      const name = me?.name || `Player ${this.player}`;
      return name;
    },
    turnTextColor(): string {
      if (this.currentPlayer === this.player) {
        return this.currentPlayer === 1 ? 'text-blue-600' : 'text-red-600';
      }
      return 'text-gray-400';
    },
    winnerTextClass(): string {
      if (!this.winner) return '';
      const winnerLower = this.winner.toLowerCase();
      if (winnerLower.includes('tie') || winnerLower.includes('draw')) return 'text-gray-600';
      const me = this.players.find((p: any) => p.player === this.player);
      if (me && me.name && winnerLower.includes(me.name.toLowerCase())) {
        return 'text-green-600';
      }
      if (winnerLower.includes(`player ${this.player}`))
        return 'text-green-600';
      return 'text-red-600';
    },
    activeGameId(): string {
      const parts = this.$route.path.split('/');
      return parts[1] || '';
    },
    activeGame(): any {
      return gamesData.find((g) => g.id === this.activeGameId) || null;
    },
    activeGameName(): string {
      return this.activeGame ? this.activeGame.name : 'Board Game';
    },
    isRecapSupported(): boolean {
      const supported = ['black-hole', 'connect-four', 'dots-and-boxes', 'battleship', 'checkers'];
      return supported.includes(this.activeGameId);
    },
  },
  watch: {
    gameOver(newVal: boolean) {
      if (!newVal) {
        this.resetRecap();
      }
    },
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
      document.addEventListener('keydown', this.handleEscKey);
    },
    closeModal() {
      this.isModalOpen = false;
      document.removeEventListener('keydown', this.handleEscKey);
    },
    handleEscKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    },
  },
  mounted() {
    this.initRecap();
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
  },
});
</script>
