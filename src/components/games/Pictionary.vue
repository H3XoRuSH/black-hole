<template>
  <div v-if="isValidGame"
    class="flex-grow flex flex-col items-center h-full p-2 sm:p-4 md:p-6 select-none overflow-hidden"
  >
    <!-- Top Bar -->
    <div class="w-full max-w-2xl flex items-center justify-between mb-2 flex-shrink-0">
      <div class="text-xs text-gray-500 font-mono">
        Round {{ Math.min(gameState.roundNumber, gameState.totalRounds) }}/{{ gameState.totalRounds }}
        <span v-if="gameOver" class="ml-2 text-emerald-400 font-semibold">Game Over</span>
      </div>
      <div class="flex items-center space-x-1">
        <button
          @click="openHowToPlay"
          class="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 flex-shrink-0 border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50 transition-all duration-200"
          title="How to Play"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <router-link to="/menu"
          class="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg cursor-pointer active:scale-95 flex-shrink-0"
          title="Leave Game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Scoreboard -->
    <div class="w-full max-w-2xl flex flex-wrap items-center justify-center gap-2 mb-3 flex-shrink-0">
      <div
        v-for="p in players"
        :key="p.player"
        class="flex items-center space-x-1.5 px-3 py-1.5 rounded-none text-xs font-black transition-all duration-300 border-2 border-black text-neo-text"
        :class="p.player === gameState.currentDrawer ? 'bg-neo-secondary/30' : 'bg-white dark:bg-neo-card-bg opacity-75'"
      >
        <span class="w-2.5 h-2.5 rounded-full border border-black" :class="getDotClass(p.player)"></span>
        <span>{{ p.name || playerLabel(p.player) }}</span>
        <span v-if="p.player === gameState.currentDrawer && !gameOver" class="text-[10px] ml-1 uppercase tracking-wider text-neo-accent font-black">Drawing</span>
        <span class="font-mono ml-1">{{ gameState.scores?.[p.player] || 0 }}</span>
      </div>
    </div>

    <!-- Timer -->
    <div v-if="!gameOver && gameState.phase === 'drawing' && gameState.drawerReady" class="w-full max-w-2xl flex-shrink-0 mb-1.5">
      <div class="flex items-center justify-center space-x-2">
        <div class="flex-1 h-3 bg-white dark:bg-neo-card-bg border-2 border-black rounded-none overflow-hidden">
          <div
            class="h-full rounded-none transition-all duration-1000 ease-linear"
            :class="timerPercent > 50 ? 'bg-emerald-500' : timerPercent > 25 ? 'bg-neo-secondary' : 'bg-neo-accent'"
            :style="{ width: timerPercent + '%' }"
          />
        </div>
        <span class="text-xs font-mono font-black text-neo-text">
          {{ gameState.timeRemaining }}s
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col items-center w-full max-w-2xl overflow-hidden">
      <!-- Game Over -->

      <div v-if="gameOver" class="w-full max-w-md bg-white dark:bg-neo-card-bg neo-border neo-shadow p-6 text-center space-y-6 flex flex-col items-center justify-center rounded-none text-neo-text my-6 animate-slide-up">
        <div class="w-20 h-20 bg-neo-secondary border-4 border-black text-black flex items-center justify-center rounded-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-10 w-10 text-black">
            <path d="M17 3H21C21.5523 3 22 3.44772 22 4V9C22 10.375 21.0503 11.5283 19.7824 11.8541C19.1417 14.1266 17.2995 15.8924 15 16.6343V19H18V21H6V19H9V16.6343C6.70054 15.8924 4.85834 14.1266 4.21762 11.8541C2.94974 11.5283 2 10.375 2 9V4C2 3.44772 2.44772 3 3 3H7V1H17V3ZM15 3H9V15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15V3ZM4 5V9C4 9.38793 4.2125 9.7262 4.54291 9.89141L5 10.12V5H4ZM20 5H19V10.12L19.4571 9.89141C19.7875 9.7262 20 9.38793 20 9V5Z"/>
          </svg>
        </div>
        <div class="text-center">
          <h2 class="text-2xl font-black text-neo-text tracking-wide uppercase">Game Over</h2>
          <p class="text-sm text-neo-text/75 font-bold mt-1">Final Scores</p>
        </div>
        <div class="w-full max-w-xs space-y-2">
          <div
            v-for="(p, idx) in sortedPlayers"
            :key="p.player"
            class="flex items-center justify-between px-4 py-3 rounded-none border-2 border-black font-bold uppercase tracking-wide transition-all duration-100"
            :class="idx === 0 ? 'bg-neo-secondary text-black neo-shadow-sm' : 'bg-white dark:bg-neo-card-bg text-neo-text opacity-85'"
          >
            <div class="flex items-center space-x-2.5">
              <span class="font-mono text-sm font-black w-4 text-neo-text/50">#{{ idx + 1 }}</span>
              <span class="w-2.5 h-2.5 rounded-full border border-black" :class="getDotClass(p.player)"></span>
              <span class="font-bold text-sm text-neo-text">{{ p.name || playerLabel(p.player) }}</span>
            </div>
            <span class="font-mono font-black text-sm text-neo-text">{{ gameState.scores?.[p.player] || 0 }} pts</span>
          </div>
        </div>
        <button
          @click="handlePlayAgain"
          :disabled="waiting"
          class="bg-neo-accent text-white font-black py-2.5 px-8 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider w-full"
        >
          <span v-if="waiting" class="flex items-center gap-1.5 justify-center">Waiting<WaitingIndicator /></span>
          <span v-else>Play Again</span>
        </button>
      </div>
      <template v-else>
        <!-- Word Choice (Drawer Only) -->
        <div v-if="amDrawer && gameState.phase === 'choosing'" class="w-full flex flex-col items-center space-y-4 py-4 flex-shrink-0">
          <p class="text-sm text-neo-text/70 font-bold uppercase tracking-wide">Choose a word to draw:</p>
          <div class="flex flex-wrap gap-3 justify-center">
            <button
              v-for="(word, i) in gameState.wordChoices"
              :key="i"
              @click="chooseWord(i)"
              class="px-6 py-3 bg-white dark:bg-neo-card-bg hover:bg-neo-secondary dark:hover:bg-neo-secondary border-2 border-neo-border text-neo-text font-black text-lg rounded-none shadow-[4px_4px_0px_0px_var(--color-neo-shadow)] transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {{ word }}
            </button>
          </div>
        </div>

        <!-- Word Display -->
        <div v-if="gameState.drawerReady && gameState.phase === 'drawing'" class="w-full mb-2 flex-shrink-0">
          <div class="bg-white dark:bg-neo-card-bg text-neo-text neo-border-2 rounded-none px-4 py-2 text-center">
            <span class="text-xs text-neo-accent font-black uppercase tracking-wider">{{ amDrawer ? 'Your Word' : 'Word' }}</span>
            <p class="text-xl font-mono font-black mt-0.5 flex flex-wrap justify-center gap-x-0.5">
              <span v-for="(ch, i) in (amDrawer ? secretWord : gameState.currentWord)" :key="i" :class="ch === ' ' ? 'w-3' : ''">{{ ch }}</span>
            </p>
          </div>
        </div>

        <!-- Canvas -->
        <div class="w-full flex-shrink-0 rounded-none overflow-hidden border-4 border-black bg-white mb-2 relative" :class="{ 'cursor-crosshair': amDrawer && gameState.drawerReady }">
          <canvas
            ref="canvasRef"
            width="600"
            height="400"
            class="w-full h-auto touch-none"
            style="aspect-ratio: 600/400; display: block;"
            @mousedown="onCanvasMouseDown"
            @mousemove="onCanvasMouseMove"
            @mouseup="onCanvasMouseUp"
            @mouseleave="onCanvasMouseUp"
            @touchstart.prevent="onCanvasTouchStart"
            @touchmove.prevent="onCanvasTouchMove"
            @touchend.prevent="onCanvasTouchEnd"
          />
        </div>

        <!-- Waiting for drawer to choose/start -->
        <div v-if="gameState.phase === 'choosing' && !amDrawer" class="flex-shrink-0 py-4 text-center text-sm text-gray-500">
          Waiting for {{ drawerName }} to choose a word...
        </div>

        <!-- Drawing Tools (Drawer Only) -->
        <div v-if="amDrawer && gameState.drawerReady && gameState.phase === 'drawing'" class="w-full flex items-center justify-center gap-2 py-2 flex-shrink-0 flex-wrap">
          <!-- Color Picker Popup -->
          <div class="relative flex-shrink-0">
            <button
              @click="colorPickerOpen = !colorPickerOpen"
              class="w-8 h-8 rounded-none border-2 border-black hover:border-neo-accent transition-colors cursor-pointer shadow-[2px_2px_0px_0px_var(--color-neo-shadow)]"
              :style="{ backgroundColor: eraserMode ? '#ffffff' : selectedColor }"
              title="Pick a color"
            />
            <div v-if="colorPickerOpen" @click.stop class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-neo-card-bg border-2 border-black p-3 shadow-[4px_4px_0px_0px_var(--color-neo-shadow)] z-10 min-w-[200px]">
              <div class="flex flex-wrap gap-1.5 max-w-[200px]">
                <button
                  v-for="c in colors"
                  :key="c"
                  @click="selectPaletteColor(c)"
                  class="w-7 h-7 rounded-none border-2 transition-all cursor-pointer hover:scale-110"
                  :class="selectedColor === c && !eraserMode ? 'border-neo-border scale-110 z-10' : 'border-neo-border/20'"
                  :style="{ backgroundColor: c }"
                />
              </div>
              <div v-if="recentColors.length" class="mt-2 pt-2 border-t border-black">
                <span class="text-[10px] text-neo-text/50 font-black uppercase tracking-wider">Recent</span>
                <div class="flex flex-wrap gap-1.5 mt-1">
                  <button
                    v-for="c in recentColors"
                    :key="c"
                    @click="selectPaletteColor(c)"
                    class="w-6 h-6 rounded-none border transition-all cursor-pointer hover:scale-110 border-neo-border/20"
                    :style="{ backgroundColor: c }"
                  />
                </div>
              </div>
              <div class="mt-2 pt-2 border-t border-black flex items-center gap-2">
                <label class="relative w-8 h-8 rounded-none border-2 border-black hover:border-neo-accent transition-colors cursor-pointer overflow-hidden flex-shrink-0">
                  <input
                    type="color"
                    :value="selectedColor"
                    @input="onNativeColorInput"
                    class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div class="w-full h-full" :style="{ backgroundColor: selectedColor }" />
                </label>
                <span class="text-xs font-bold text-neo-text">Custom</span>
              </div>
            </div>
          </div>

          <div class="w-px h-6 bg-black dark:bg-white mx-1 animate-pulse" />

          <!-- Mode Indicator -->
          <div class="flex items-center gap-1">
            <button
              @click="fillMode = false; eraserMode = false"
              class="text-xs px-2.5 py-1.5 rounded-none border-2 border-black font-black transition-all cursor-pointer"
              :class="!fillMode && !eraserMode ? 'bg-neo-accent text-white' : 'bg-white dark:bg-neo-card-bg text-neo-text hover:bg-neo-secondary'"
              title="Brush"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              @click="fillMode = !fillMode; eraserMode = false"
              class="text-xs px-2.5 py-1.5 rounded-none border-2 border-black font-black transition-all cursor-pointer"
              :class="fillMode ? 'bg-neo-accent text-white' : 'bg-white dark:bg-neo-card-bg text-neo-text hover:bg-neo-secondary'"
              title="Fill"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </button>
            <button
              @click="eraserMode = !eraserMode; fillMode = false"
              class="text-xs px-2.5 py-1.5 rounded-none border-2 border-black font-black transition-all cursor-pointer"
              :class="eraserMode ? 'bg-neo-accent text-white' : 'bg-white dark:bg-neo-card-bg text-neo-text hover:bg-neo-secondary'"
              title="Eraser"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 11H4m16 0a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2m16 0V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4" />
              </svg>
            </button>
          </div>

          <div class="w-px h-6 bg-black dark:bg-white mx-1" />

          <!-- Brush Size Slider -->
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-neo-text/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
            </svg>
            <input
              type="range"
              min="1"
              max="40"
              :value="selectedSize"
              @input="selectedSize = parseInt(($event.target as HTMLInputElement).value)"
              class="w-20 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-none appearance-none cursor-pointer accent-neo-accent"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neo-text/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span class="text-xs font-mono font-black text-neo-text w-4 text-right">{{ selectedSize }}</span>
          </div>

          <div class="w-px h-6 bg-black dark:bg-white mx-1" />

          <button
            @click="clearCanvas"
            class="text-xs text-neo-text hover:bg-neo-secondary px-3 py-1.5 rounded-none transition-all cursor-pointer border-2 border-black font-black bg-white dark:bg-neo-card-bg"
          >
            Clear All
          </button>
        </div>

        <!-- Timer Expired / Reveal Phase -->
        <div v-if="gameState.phase === 'reveal'" class="flex-shrink-0 text-center py-2">
          <p class="text-emerald-600 dark:text-emerald-400 font-black text-lg uppercase tracking-wide">The word was:</p>
          <p class="text-2xl font-black mt-1 uppercase text-neo-text">{{ gameState.currentWord }}</p>
          <button
            v-if="amDrawer"
            @click="nextRound"
            class="mt-2 bg-neo-accent text-white font-black py-2.5 px-8 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider border-2 border-black"
          >
            <span v-if="gameState.roundNumber >= gameState.totalRounds">See Results</span>
            <span v-else>Next Round</span>
          </button>
        </div>

        <!-- Guess Input (Guessers Only) -->
        <div v-if="!amDrawer && gameState.drawerReady && gameState.phase === 'drawing'" class="w-full flex-shrink-0 flex items-center space-x-2 py-2">
          <input
            v-model="userGuess"
            type="text"
            placeholder="Type your guess..."
            class="flex-grow px-4 py-2.5 text-sm placeholder:text-neo-text/50 neo-input"
            @keyup.enter="submitGuess"
          />
          <button
            @click="submitGuess"
            :disabled="!userGuess.trim()"
            class="bg-neo-accent text-white font-black px-5 py-2.5 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider text-sm flex items-center justify-center border-2 border-black"
          >
            Guess
          </button>
        </div>

        <!-- Drawer hint during drawing -->
        <div v-if="!amDrawer && gameState.phase === 'drawing' && !gameState.drawerReady" class="flex-shrink-0 py-4 text-center text-sm text-gray-500">
          Waiting for {{ drawerName }} to start drawing...
        </div>
      </template>
    </div>

    <HowToPlayModal
      :is-open="isHowToPlayOpen"
      game-id="pictionary"
      @close="closeHowToPlay"
    />
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../../composables/useGame.js';
import { useConfetti } from '../../composables/useConfetti.js';
import type { PictionaryGameState as GameState } from '../../types/shared.js';
import WaitingIndicator from '../ui/WaitingIndicator.vue';
import HowToPlayModal from '../modals/HowToPlayModal.vue';

export default defineComponent({
  name: 'Pictionary',
  components: { WaitingIndicator, HowToPlayModal },
  emits: ['update-connection-status', 'update-player', 'update-room-key'],
  props: {
    socket: { type: Object as PropType<Socket>, required: true },
    player: { type: Number, required: true },
    roomKey: { type: String, required: true },
    initialGameState: { type: Object as PropType<GameState>, required: true },
    connectionStatus: String,
  },
  setup(props) {
    const gameState = ref<GameState>(
      props.initialGameState || {
        phase: 'lobby',
        currentDrawer: 1,
        currentWord: '',
        wordChoices: [],
        roundNumber: 0,
        totalRounds: 0,
        scores: {},
        winner: '',
        players: [],
        currentPlayer: 1,
        totalMoves: 0,
        wordHistory: [],
        guessesThisRound: [],
        drawerReady: false,
        timerDuration: 60,
        timeRemaining: 60,
      }
    );

    const waiting = ref(false);
    const isHowToPlayOpen = ref(false);
    const openHowToPlay = () => {
      isHowToPlayOpen.value = true;
    };
    const closeHowToPlay = () => {
      isHowToPlayOpen.value = false;
    };

    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const userGuess = ref('');
    const secretWord = ref('');
    const isDrawing = ref(false);
    const colorPickerOpen = ref(false);
    const eraserMode = ref(false);
    const fillMode = ref(false);
    const selectedColor = ref('#000000');
    const selectedSize = ref(4);
    const recentColors = ref<string[]>([]);
    const colors = ['#000000', '#ffffff', '#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

    const timerPercent = computed(() => {
      const dur = gameState.value.timerDuration || 60;
      const rem = gameState.value.timeRemaining ?? dur;
      return Math.max(0, Math.min(100, (rem / dur) * 100));
    });

    let drawStrokeHandler: any = null;
    let clearCanvasHandler: any = null;
    let wordAssignedHandler: any = null;

    const getCtx = () => {
      const canvas = canvasRef.value;
      if (!canvas) return null;
      return canvas.getContext('2d');
    };

    const getCanvasPos = (clientX: number, clientY: number): { x: number; y: number } => {
      const canvas = canvasRef.value;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const emitStroke = (points: { x: number; y: number }[], color: string, width: number) => {
      props.socket?.emit('draw-stroke', {
        roomKey: props.roomKey,
        stroke: { points, color, width },
      });
    };

    const drawStroke = (points: { x: number; y: number }[], color: string, width: number) => {
      const ctx = getCtx();
      if (!ctx || points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    };

    const startStroke = (clientX: number, clientY: number) => {
      if (!amDrawer.value || !gameState.value.drawerReady || gameState.value.phase !== 'drawing') return;
      if (fillMode.value) {
        floodFill(clientX, clientY);
        return;
      }
      isDrawing.value = true;
      lastEmitTime = Date.now();
      const pos = getCanvasPos(clientX, clientY);
      currentBatch = [pos];
      const ctx = getCtx();
      if (!ctx) return;
      ctx.beginPath();
      ctx.strokeStyle = eraserMode.value ? '#ffffff' : selectedColor.value;
      ctx.lineWidth = selectedSize.value;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(pos.x, pos.y);
    };

    const EMIT_THROTTLE_MS = 30;
    let currentBatch: { x: number; y: number }[] = [];
    let lastEmitTime = 0;

    const moveStroke = (clientX: number, clientY: number) => {
      if (!isDrawing.value) return;
      const ctx = getCtx();
      if (!ctx) return;
      const pos = getCanvasPos(clientX, clientY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      currentBatch.push(pos);
      const now = Date.now();
      if (now - lastEmitTime >= EMIT_THROTTLE_MS) {
        lastEmitTime = now;
        if (currentBatch.length >= 2) {
          const color = eraserMode.value ? '#ffffff' : selectedColor.value;
          emitStroke(currentBatch, color, selectedSize.value);
          currentBatch = [currentBatch[currentBatch.length - 1]];
        }
      }
    };

    const endStroke = () => {
      if (!isDrawing.value) return;
      isDrawing.value = false;
      if (currentBatch.length >= 2) {
        const color = eraserMode.value ? '#ffffff' : selectedColor.value;
        emitStroke(currentBatch, color, selectedSize.value);
      }
      currentBatch = [];
    };

    function floodFill(clientX: number, clientY: number) {
      const ctx = getCtx();
      const canvas = canvasRef.value;
      if (!ctx || !canvas) return;
      const pos = getCanvasPos(clientX, clientY);
      const x = Math.round(pos.x);
      const y = Math.round(pos.y);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;

      const targetIdx = (y * w + x) * 4;
      const targetR = data[targetIdx];
      const targetG = data[targetIdx + 1];
      const targetB = data[targetIdx + 2];
      const targetA = data[targetIdx + 3];

      const fillColor = eraserMode.value ? '#ffffff' : selectedColor.value;
      const fillR = parseInt(fillColor.slice(1, 3), 16);
      const fillG = parseInt(fillColor.slice(3, 5), 16);
      const fillB = parseInt(fillColor.slice(5, 7), 16);

      if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === 255) return;

      const tolerance = 40;
      const matchTarget = (pr: number, pg: number, pb: number, pa: number) => {
        return Math.abs(pr - targetR) <= tolerance
          && Math.abs(pg - targetG) <= tolerance
          && Math.abs(pb - targetB) <= tolerance
          && pa >= targetA - tolerance;
      };

      const visited = new Uint8Array(w * canvas.height);
      const queue: [number, number][] = [[x, y]];

      while (queue.length > 0) {
        const [cx, cy] = queue.pop()!;
        if (cx < 0 || cx >= w || cy < 0 || cy >= canvas.height) continue;
        const idx = cy * w + cx;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const pi = idx * 4;
        if (!matchTarget(data[pi], data[pi + 1], data[pi + 2], data[pi + 3])) continue;
        data[pi] = fillR;
        data[pi + 1] = fillG;
        data[pi + 2] = fillB;
        data[pi + 3] = 255;
        queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }

      ctx.putImageData(imageData, 0, 0);
      emitFill(fillColor);
    }

    const emitFill = (_color: string) => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL();
      props.socket?.emit('draw-stroke', {
        roomKey: props.roomKey,
        stroke: { action: 'fill', image: dataUrl },
      });
    };

    const onCanvasMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      startStroke(e.clientX, e.clientY);
    };
    const onCanvasMouseMove = (e: MouseEvent) => moveStroke(e.clientX, e.clientY);
    const onCanvasMouseUp = () => endStroke();

    const onCanvasTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startStroke(t.clientX, t.clientY);
    };
    const onCanvasTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      moveStroke(t.clientX, t.clientY);
    };
    const onCanvasTouchEnd = () => endStroke();

    const clearCanvas = () => {
      const ctx = getCtx();
      const canvas = canvasRef.value;
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      props.socket?.emit('clear-canvas', { roomKey: props.roomKey });
    };

    const chooseWord = (wordIndex: number) => {
      colorPickerOpen.value = false;
      props.socket?.emit('make-move', {
        roomKey: props.roomKey,
        action: 'choose-word',
        wordIndex,
      });
    };

    const submitGuess = () => {
      const guess = (userGuess.value || '').trim();
      if (!guess || gameState.value.winner || !props.socket) return;
      props.socket?.emit('make-move', {
        roomKey: props.roomKey,
        action: 'guess',
        guess,
      });
      userGuess.value = '';
    };

    const nextRound = () => {
      props.socket?.emit('make-move', {
        roomKey: props.roomKey,
        action: 'next-round',
      });
    };

    const handlePlayAgain = () => {
      if (waiting.value || !props.socket) return;
      waiting.value = true;
      props.socket.emit('new-game', { roomKey: props.roomKey });
    };

    const selectColor = (color: string) => {
      selectedColor.value = color;
      eraserMode.value = false;
      fillMode.value = false;
      if (!recentColors.value.includes(color)) {
        recentColors.value = [color, ...recentColors.value].slice(0, 8);
      }
    };

    const selectPaletteColor = (color: string) => {
      selectColor(color);
      colorPickerOpen.value = false;
    };

    let colorRecentTimer: ReturnType<typeof setTimeout> | null = null;
    const onNativeColorInput = (e: Event) => {
      const hex = (e.target as HTMLInputElement).value;
      if (hex === selectedColor.value) return;
      selectedColor.value = hex;
      eraserMode.value = false;
      fillMode.value = false;
      if (colorRecentTimer) clearTimeout(colorRecentTimer);
      colorRecentTimer = setTimeout(() => {
        if (!recentColors.value.includes(hex)) {
          recentColors.value = [hex, ...recentColors.value].slice(0, 8);
        }
      }, 2000);
    };

    const amDrawer = ref(false);

    const confetti = useConfetti();

    watch(() => gameState.value.currentDrawer, (drawer) => {
      amDrawer.value = drawer === props.player;
      if (!amDrawer.value) {
        secretWord.value = '';
      }
    }, { immediate: true });

    watch(() => gameState.value.phase, (phase) => {
      if (phase === 'reveal' || phase === 'choosing') {
        const stillDrawer = gameState.value.currentDrawer === props.player;
        if (!stillDrawer) {
          secretWord.value = '';
        }
      }
      colorPickerOpen.value = false;
      if (phase === 'choosing') {
        recentColors.value = [];
        eraserMode.value = false;
        fillMode.value = false;
        const ctx = getCtx();
        const canvas = canvasRef.value;
        if (ctx && canvas) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    });

    watch(
      () => gameState.value?.winner,
      (winner) => {
        if (winner) {
          confetti.fire();
        }
      }
    );

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/pictionary/lobby',
      onGameState: (newState: any) => {
        gameState.value = newState;
        if (newState.totalMoves === 0) {
          waiting.value = false;
        }
        amDrawer.value = newState.currentDrawer === props.player;
      },
    });

    onMounted(() => {
      const ctx = getCtx();
      if (ctx && canvasRef.value) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
      }

      drawStrokeHandler = (data: { stroke: { points?: { x: number; y: number }[]; color?: string; width?: number; action?: string; image?: string } }) => {
        if (data.stroke.action === 'fill' && data.stroke.image) {
          const img = new Image();
          img.onload = () => {
            const ctx2 = getCtx();
            const canvas2 = canvasRef.value;
            if (!ctx2 || !canvas2) return;
            ctx2.drawImage(img, 0, 0);
          };
          img.src = data.stroke.image;
          return;
        }
        if (data.stroke.points && data.stroke.color && data.stroke.width) {
          drawStroke(data.stroke.points, data.stroke.color, data.stroke.width);
        }
      };

      clearCanvasHandler = () => {
        const ctx = getCtx();
        const canvas = canvasRef.value;
        if (!ctx || !canvas) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      wordAssignedHandler = (data: { word: string }) => {
        secretWord.value = data.word;
      };

      props.socket?.on('draw-stroke', drawStrokeHandler);
      props.socket?.on('clear-canvas', clearCanvasHandler);
      props.socket?.on('word-assigned', wordAssignedHandler);
    });

    onBeforeUnmount(() => {
      if (drawStrokeHandler) props.socket?.off('draw-stroke', drawStrokeHandler);
      if (clearCanvasHandler) props.socket?.off('clear-canvas', clearCanvasHandler);
      if (wordAssignedHandler) props.socket?.off('word-assigned', wordAssignedHandler);
    });

    return {
      gameState,
      waiting,
      timerPercent,
      isHowToPlayOpen,
      openHowToPlay,
      closeHowToPlay,
      canvasRef,
      userGuess,
      secretWord,
      selectedColor,
      selectedSize,
      colorPickerOpen,
      eraserMode,
      fillMode,
      recentColors,
      colors,
      amDrawer,
      confetti,
      onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp,
      onCanvasTouchStart, onCanvasTouchMove, onCanvasTouchEnd,
      clearCanvas, chooseWord, submitGuess, nextRound, handlePlayAgain, selectColor, selectPaletteColor, onNativeColorInput,
      ...game,
    };
  },
  computed: {
    isValidGame() {
      return this.roomKey && this.player && this.gameState.players && this.gameState.players.length >= 1;
    },
    gameOver() {
      return !!this.gameState.winner;
    },
    players() {
      return this.gameState.players || [];
    },
    drawerName(): string {
      const d = this.players.find((p: any) => p.player === this.gameState.currentDrawer);
      return d?.name || `Player ${this.gameState.currentDrawer}`;
    },
    sortedPlayers(): any[] {
      const list = [...this.players];
      return list.sort((a, b) => {
        const scoreA = this.gameState.scores?.[a.player] || 0;
        const scoreB = this.gameState.scores?.[b.player] || 0;
        return scoreB - scoreA;
      });
    },

  },
  methods: {
    playerLabel(num: number) {
      return `Player ${num}`;
    },
    getDotClass(playerNum: number) {
      const dots = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-blue-500'];
      return dots[(playerNum - 1) % dots.length];
    },
  },
});
</script>
