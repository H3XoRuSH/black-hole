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
      class="w-full bg-white dark:bg-neo-card-bg p-3 sm:p-4 neo-border neo-shadow-sm flex items-center justify-between text-sm sm:text-base mb-3 sm:mb-4.5 text-neo-text rounded-none"
    >
      <div
        class="flex items-center gap-2 rounded-none px-2 sm:px-3 py-1.5 transition-all duration-100 min-w-0 flex-shrink"
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

      <span class="text-neo-text/50 font-black text-xs mx-2 sm:mx-4 shrink-0">VS</span>

      <div
        class="flex items-center gap-2 rounded-none px-2 sm:px-3 py-1.5 transition-all duration-100 min-w-0 flex-shrink"
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
      v-if="gameOver && gameState"
      class="w-full mt-4 flex justify-center"
    >
      <button
        @click="openRecapModal"
        class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-md active:scale-95 flex items-center space-x-2"
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
    <BaseModal
      :is-open="showRecapModal"
      title="AI Match Recap"
      :subtitle="activeGameName"
      @close="closeRecapModal"
    >
      <template #header-icon>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
        </svg>
      </template>

      <div v-if="recapLoading" class="flex flex-col items-center py-8 space-y-3">
        <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs text-slate-400 animate-pulse">Analyzing key moves...</span>
      </div>

      <div
        v-else-if="!recapText"
        class="flex justify-center py-6"
      >
        <button
          @click="requestRecap"
          class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-md active:scale-95 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
          </svg>
          <span>Generate AI Recap</span>
        </button>
      </div>

      <div
        v-else
        class="flex flex-col flex-grow overflow-hidden"
      >
        <div v-html="formattedRecapHtml"></div>

        <div v-if="recapConversation.length > 0" class="border-t border-slate-700/50 pt-4 mt-4 space-y-3">
          <div
            v-for="(msg, idx) in recapConversation"
            :key="idx"
            class="flex"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed"
              :class="msg.role === 'user'
                ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/20'
                : 'bg-slate-800 text-slate-300 border border-slate-700/50'"
            >
              <p class="font-medium text-[10px] uppercase tracking-wider mb-1 opacity-60">
                {{ msg.role === 'user' ? 'You' : 'AI' }}
              </p>
              <p>{{ msg.content }}</p>
            </div>
          </div>
          <div v-if="recapAskLoading" class="flex justify-start">
            <div class="bg-slate-800 text-slate-400 rounded-xl px-3 py-2 text-xs border border-slate-700/50">
              <span class="animate-pulse">Thinking...</span>
            </div>
          </div>
        </div>

        <div v-if="!recapQuestionAsked" class="flex-shrink-0 mt-3 pt-3 border-t border-slate-700/50">
          <div class="flex items-center space-x-2">
            <input
              v-model="recapQuestion"
              type="text"
              placeholder="Ask a follow-up question about this match..."
              class="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              @keyup.enter="sendRecapQuestion"
              :disabled="recapAskLoading"
            />
            <button
              @click="sendRecapQuestion"
              :disabled="recapAskLoading || !recapQuestion.trim()"
              class="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-3 py-2 text-xs transition-all duration-150 cursor-pointer active:scale-95 flex-shrink-0"
            >
              <svg v-if="recapAskLoading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import gamesData from '../../assets/games.json';
import BaseModal from '../ui/BaseModal.vue';
import HowToPlayModal from '../modals/HowToPlayModal.vue';

export default defineComponent({
  name: 'GameHeader',
  components: { BaseModal, HowToPlayModal },
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
  data() {
    return {
      isModalOpen: false,
      showRecapModal: false,
      recapText: '',
      recapLoading: false,
      recapConversation: [] as Array<{ role: string; content: string }>,
      recapQuestion: '',
      recapAskLoading: false,
      recapQuestionAsked: false,
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
    formattedRecapHtml(): string {
      if (!this.recapText) return '';
      let html = this.recapText;

      // Escape HTML to prevent XSS
      html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Convert bold: **text** -> <strong>text</strong>
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Convert headings: ### text -> <h3 class="text-sm font-bold text-slate-100 mt-3 mb-1">text</h3>
      html = html.replace(/### (.*?)\n/g, '<h3 class="text-sm font-bold text-slate-100 mt-3 mb-1">$1</h3>');
      html = html.replace(/## (.*?)\n/g, '<h2 class="text-base font-bold text-slate-100 mt-4 mb-2">$1</h2>');

      // Convert list items: * item -> <li class="ml-4 list-disc text-slate-300">item</li>
      html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>');

      // Convert newlines to paragraphs
      html = html.split('\n\n').map((p) => {
        if (p.trim().startsWith('<li') || p.trim().startsWith('<h3') || p.trim().startsWith('<h2')) {
          return p;
        }
        return `<p class="mb-2 leading-relaxed text-slate-300">${p}</p>`;
      }).join('');

      return html;
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
  },
  watch: {
    gameOver(newVal) {
      if (!newVal) {
        this.recapText = '';
        this.recapLoading = false;
        this.showRecapModal = false;
        this.recapConversation = [];
        this.recapQuestion = '';
        this.recapAskLoading = false;
        this.recapQuestionAsked = false;
      }
    },
  },
  methods: {
    requestRecap() {
      if (this.socket && this.roomKey) {
        this.recapLoading = true;
        this.socket.emit('request-recap', { roomKey: this.roomKey });
      }
    },
    openRecapModal() {
      this.showRecapModal = true;
      document.addEventListener('keydown', this.handleRecapEscKey);
      if (this.recapLoading) return;
      if (!this.recapText && this.socket && this.roomKey) {
        this.recapLoading = true;
        this.socket.emit('request-recap', { roomKey: this.roomKey });
      }
    },
    closeRecapModal() {
      this.showRecapModal = false;
      document.removeEventListener('keydown', this.handleRecapEscKey);
    },
    handleRecapEscKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        this.closeRecapModal();
      }
    },
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
    sendRecapQuestion() {
      const q = this.recapQuestion.trim();
      if (!q || this.recapAskLoading || !this.socket || !this.roomKey) return;
      this.recapConversation.push({ role: 'user', content: q });
      this.recapAskLoading = true;
      this.recapQuestion = '';
      this.socket.emit('recap-question', { roomKey: this.roomKey, question: q });
    },
    setupRecapListeners() {
      if (!this.socket) return;
      this.socket.on('recap-loading', () => {
        this.recapLoading = true;
      });
      this.socket.on('recap-generated', ({ text }: { text: string }) => {
        this.recapText = text;
        this.recapLoading = false;
      });
      this.socket.on('recap-answering', () => {
        this.recapAskLoading = true;
      });
      this.socket.on('recap-answer', ({ answer, error }: { answer?: string; error?: string }) => {
        this.recapAskLoading = false;
        if (error) {
          this.recapConversation.push({ role: 'assistant', content: `Error: ${error}` });
          return;
        }
        this.recapConversation.push({ role: 'assistant', content: answer || '' });
        this.recapQuestionAsked = true;
      });
    },
    teardownRecapListeners() {
      if (!this.socket) return;
      this.socket.off('recap-loading');
      this.socket.off('recap-generated');
      this.socket.off('recap-answering');
      this.socket.off('recap-answer');
    },
  },
  mounted() {
    this.setupRecapListeners();
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
    this.teardownRecapListeners();
  },
});
</script>
