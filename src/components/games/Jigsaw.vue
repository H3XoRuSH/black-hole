<template>
  <div class="flex flex-col h-full min-h-screen bg-transparent select-none" ref="rootEl">
    <!-- Custom Cooperative Header Bar -->
    <header class="w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 py-3 sm:py-5 flex-shrink-0">
      <!-- Top Title Bar -->
      <div class="w-full flex items-center justify-between mb-4">
        <!-- How To Play Button -->
        <button
          @click="isHowToPlayOpen = true"
          class="text-neo-text/75 hover:text-neo-text transition-colors p-2 rounded-none flex items-center justify-center cursor-pointer neo-border-2 bg-white dark:bg-neo-card-bg shadow-sm"
          title="How to Play"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Title -->
        <div class="flex items-center justify-center space-x-2.5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black uppercase text-neo-text tracking-tighter text-center">
            Jigsaw Puzzle
          </h1>
        </div>

        <!-- Exit Button -->
        <router-link
          to="/menu"
          class="text-neo-text/75 hover:text-neo-accent transition-colors p-2 rounded-none flex items-center justify-center cursor-pointer neo-border-2 bg-white dark:bg-neo-card-bg shadow-sm"
          title="Leave Game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </router-link>
      </div>

      <!-- Cooperative Players status card (Horizontal) -->
      <div class="w-full bg-white dark:bg-neo-card-bg p-3.5 neo-border neo-shadow-sm flex flex-wrap items-center justify-center gap-3 mb-4 text-neo-text rounded-none">
        <div class="text-xs font-black uppercase tracking-wider text-neo-text/60 mr-2 shrink-0">Team:</div>
        <div
          v-for="p in gameState.players"
          :key="p.player"
          class="flex items-center space-x-2 px-3 py-1.5 rounded-none text-xs font-black border-2 border-black bg-white dark:bg-slate-800"
        >
          <span
            class="w-2.5 h-2.5 rounded-full border border-black"
            :class="p.player === 1 ? 'bg-neo-secondary' : 'bg-neo-accent'"
          ></span>
          <span>{{ p.name || `Player ${p.player}` }}</span>
        </div>
      </div>

      <!-- Connection Status banner -->
      <div
        v-if="connectionStatus"
        class="w-full mb-4 bg-neo-secondary/20 neo-border-2 text-neo-text rounded-none p-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ connectionStatus }}</span>
      </div>

      <!-- Stats row -->
      <div class="w-full max-w-md flex items-center justify-between text-xs font-black uppercase tracking-widest text-neo-text/75 bg-neo-muted/5 p-2 px-3 border border-neo-border/20">
        <div>Progress: <span class="text-orange-500 font-extrabold">{{ placedCount }}/{{ totalCount }} ({{ Math.round(progressPct) }}%)</span></div>
        <div>Time: <span class="font-mono text-neo-text font-black">{{ dynamicTimeDisplay }}</span></div>
      </div>
    </header>

    <!-- Game Over Banner -->
    <transition name="fade">
      <div v-if="gameState?.status === 'finished'" class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div class="pointer-events-auto bg-white dark:bg-neo-card-bg neo-border neo-shadow px-8 py-6 text-center max-w-sm w-full mx-4 animate-pop-in">
          <div class="text-5xl mb-3">🎉</div>
          <h2 class="text-2xl font-black uppercase tracking-tight text-neo-text mb-1">Puzzle Complete!</h2>
          <p class="text-neo-text/70 font-bold text-sm mb-4">
            Finished in <span class="text-orange-500 font-black">{{ elapsedDisplay }}</span> with <span class="text-neo-text font-black">{{ gameState.totalMoves }} drops</span>
          </p>
          <WaitingIndicator v-if="ready" class="mb-3" />
          <button
            v-else
            @click="newGame"
            class="w-full neo-btn bg-neo-secondary text-black font-black uppercase py-3 text-sm tracking-wider"
          >
            Play Again
          </button>
        </div>
      </div>
    </transition>

    <!-- Main layout -->
    <div class="flex flex-col flex-1 gap-4 p-3 sm:p-4 overflow-hidden" style="min-height: 0;">
      <!-- Puzzle Board (relative layout) -->
      <div class="flex-grow flex items-center justify-center overflow-hidden" ref="boardWrapper">
        <div class="border-4 border-neo-border bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-inner">
          <div
            ref="boardContainer"
            class="relative"
            :style="boardContainerStyle"
            @dragover.prevent
            @drop.prevent="onBoardDrop"
            @mousemove="onBoardMouseMove"
          >
            <!-- Background grid cells (CSS Grid layout to prevent subpixel layout shifts) -->
            <div
              class="absolute inset-0 grid pointer-events-none"
              :style="{
                gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.gridSize}, 1fr)`
              }"
            >
              <div
                v-for="i in (gameState.gridSize * gameState.gridSize)"
                :key="'grid-' + i"
                class="border-r border-b border-black/10 dark:border-white/15 box-border"
              ></div>
            </div>

            <!-- Board snap target helper circle -->
            <div
              v-if="snapHint"
              class="absolute pointer-events-none border-2 border-orange-500 border-dashed rounded-full flex items-center justify-center bg-orange-500/10 transition-all duration-75"
              :style="{
                left: (snapHint.col * cellPx + cellPx * 0.1) + 'px',
                top: (snapHint.row * cellPx + cellPx * 0.1) + 'px',
                width: (cellPx * 0.8) + 'px',
                height: (cellPx * 0.8) + 'px',
              }"
            >
              <div class="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
            </div>

            <!-- Rendered pieces currently on the board (correctly locked or placed incorrectly) -->
            <div
              v-for="piece in boardPieces"
              :key="piece.id"
              class="absolute border transition-shadow duration-100 animate-pop-in"
              :class="{
                'cursor-grab active:cursor-grabbing border-orange-500/50 border-dashed z-20 hover:scale-[1.02]': !piece.placed,
                'cursor-default border-black/15 dark:border-white/20 z-10': piece.placed,
                'opacity-40 pointer-events-none': piece.lockedBy && piece.lockedBy !== mySocketId,
                'ring-2 ring-orange-500 z-30': piece.lockedBy === mySocketId
              }"
              :style="boardPieceStyle(piece)"
              :draggable="!piece.placed && (!piece.lockedBy || piece.lockedBy === mySocketId)"
              @dragstart="onPieceDragStart($event, piece)"
              @dragend="onPieceDragEnd($event, piece)"
              @touchstart.passive="onPieceTouchStart($event, piece)"
            >
              <!-- lock icon overlays on other players locks -->
              <div
                v-if="piece.lockedBy && piece.lockedBy !== mySocketId"
                class="w-full h-full flex items-center justify-center bg-black/35 font-bold text-xs"
              >
                🔒
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Piece Tray (Horizontal scrollable at bottom) -->
      <div class="w-full max-w-4xl mx-auto flex-shrink-0 flex flex-col gap-1.5 p-3 bg-white dark:bg-neo-card-bg neo-border shadow-sm">
        <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-neo-text/50 px-1">
          <span>{{ unplacedPieces.length }} piece{{ unplacedPieces.length !== 1 ? 's' : '' }} left</span>
          <div class="w-40 h-1.5 bg-neo-border rounded-full overflow-hidden">
            <div class="h-full bg-orange-400 transition-all duration-300" :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>

        <div
          class="w-full flex flex-row items-center gap-4 overflow-x-auto overflow-y-hidden py-3 px-1 border-t border-black/10 dark:border-white/15 scrollbar-thin"
          style="min-height: 104px;"
        >
          <div
            v-for="piece in sortedTrayPieces"
            :key="piece.id"
            class="border border-black/20 dark:border-white/25 cursor-grab active:cursor-grabbing flex-shrink-0 hover:scale-[1.03] transition-transform duration-100"
            :class="{
              'opacity-40 pointer-events-none': piece.lockedBy && piece.lockedBy !== mySocketId,
              'ring-2 ring-orange-500': piece.lockedBy === mySocketId
            }"
            :style="trayPieceStyle(piece)"
            :draggable="!piece.lockedBy || piece.lockedBy === mySocketId"
            @dragstart="onPieceDragStart($event, piece)"
            @dragend="onPieceDragEnd($event, piece)"
            @touchstart.passive="onPieceTouchStart($event, piece)"
          >
            <!-- Lock indicator overlay -->
            <div
              v-if="piece.lockedBy && piece.lockedBy !== mySocketId"
              class="w-full h-full flex items-center justify-center bg-black/25 text-[10px]"
            >
              🔒
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- How to Play Modal -->
    <HowToPlayModal
      :is-open="isHowToPlayOpen"
      game-id="jigsaw"
      @close="isHowToPlayOpen = false"
    />

    <!-- Floating drag ghost for mobile touch -->
    <div
      v-if="touchDragPiece"
      class="fixed pointer-events-none z-[9999] border-2 border-orange-500 shadow-lg scale-105"
      :style="touchGhostStyle"
    >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, onUnmounted, watch } from 'vue';
import type { Socket } from 'socket.io-client';
import type { JigsawGameState, JigsawPiece } from '@/types/shared';
import WaitingIndicator from '@/components/ui/WaitingIndicator.vue';
import HowToPlayModal from '@/components/modals/HowToPlayModal.vue';
import { useGame } from '@/composables/useGame';
import { useConfetti } from '@/composables/useConfetti';

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export default defineComponent({
  name: 'Jigsaw',
  components: { WaitingIndicator, HowToPlayModal },
  emits: ['update-connection-status', 'update-player', 'update-room-key'],
  props: {
    socket: { type: Object as PropType<Socket>, required: true },
    player: { type: Number, required: true },
    roomKey: { type: String, required: true },
    initialGameState: { type: Object as PropType<JigsawGameState>, required: true },
    connectionStatus: { type: String, default: '' },
  },

  setup(props) {
    const gameState = ref<JigsawGameState>(props.initialGameState || {
      status: 'waiting',
      gridSize: 4,
      imageKey: '',
      pieces: [],
      startTime: null,
      endTime: null,
      players: [],
      winner: '',
      totalMoves: 0,
    });

    const { ready, newGame } = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => gameState.value?.status === 'finished',
      lobbyRoute: '/jigsaw/lobby',
    });

    const { fire: fireConfetti } = useConfetti();

    watch(() => gameState.value?.status, (newVal) => {
      if (newVal === 'finished') setTimeout(fireConfetti, 300);
    });

    const boardWrapper = ref<HTMLElement | null>(null);
    const boardPx = ref(420);
    const trayPiecePx = ref(72);

    function updateSizes() {
      if (!boardWrapper.value) return;
      const rect = boardWrapper.value.getBoundingClientRect();
      const avail = Math.min(rect.width - 12, rect.height - 12, 540);
      boardPx.value = Math.max(200, avail);
      trayPiecePx.value = Math.min(80, Math.max(52, boardPx.value / 5.5));
    }

    let ro: ResizeObserver | null = null;
    onMounted(() => {
      updateSizes();
      ro = new ResizeObserver(updateSizes);
      if (boardWrapper.value) ro.observe(boardWrapper.value);
    });
    onUnmounted(() => ro?.disconnect());

    return { gameState, ready, newGame, boardWrapper, boardPx, trayPiecePx };
  },

  data() {
    return {
      imageLoaded: false,
      draggingPieceId: null as number | null,
      snapHint: null as { row: number; col: number } | null,
      touchDragPiece: null as JigsawPiece | null,
      touchX: 0,
      touchY: 0,
      isHowToPlayOpen: false,
      currentTime: Date.now(),
      timerInterval: null as any | null,
    };
  },

  computed: {
    mySocketId(): string {
      return (this.socket as any)?.id ?? '';
    },
    cellPx(): number {
      return this.boardPx / (this.gameState?.gridSize ?? 4);
    },
    boardContainerStyle(): object {
      return { width: this.boardPx + 'px', height: this.boardPx + 'px' };
    },
    imageUrl(): string {
      if (!this.gameState?.imageKey) return '';
      return new URL(`../../assets/images/jigsaw/${this.gameState.imageKey}.jpg`, import.meta.url).href;
    },
    placedPieces(): JigsawPiece[] {
      return this.gameState?.pieces?.filter((p) => p.placed) ?? [];
    },
    boardPieces(): JigsawPiece[] {
      return this.gameState?.pieces?.filter((p) => p.boardRow !== null && p.boardCol !== null) ?? [];
    },
    unplacedPieces(): JigsawPiece[] {
      return this.gameState?.pieces?.filter((p) => p.boardRow === null && p.boardCol === null) ?? [];
    },
    sortedTrayPieces(): JigsawPiece[] {
      return [...this.unplacedPieces].sort((a, b) => a.trayIndex - b.trayIndex);
    },
    placedCount(): number {
      return this.placedPieces.length;
    },
    totalCount(): number {
      return this.gameState?.pieces?.length ?? 16;
    },
    progressPct(): number {
      return this.totalCount ? (this.placedCount / this.totalCount) * 100 : 0;
    },
    elapsedDisplay(): string {
      if (!this.gameState?.startTime || !this.gameState?.endTime) return '0s';
      return formatDuration(this.gameState.endTime - this.gameState.startTime);
    },
    dynamicTimeDisplay(): string {
      if (this.gameState?.status === 'finished' && this.gameState?.endTime && this.gameState?.startTime) {
        return formatDuration(this.gameState.endTime - this.gameState.startTime);
      }
      if (!this.gameState?.startTime) return '0s';
      return formatDuration(this.currentTime - this.gameState.startTime);
    },
    touchGhostStyle(): object {
      const size = this.trayPiecePx * 1.25;
      return {
        left: (this.touchX - size / 2) + 'px',
        top: (this.touchY - size / 2) + 'px',
        width: size + 'px',
        height: size + 'px',
        backgroundImage: `url(${this.imageUrl})`,
        backgroundSize: `${size * this.gameState.gridSize}px ${size * this.gameState.gridSize}px`,
        backgroundPosition: `-${this.touchDragPiece!.col * size}px -${this.touchDragPiece!.row * size}px`
      };
    },
  },

  watch: {
    'imageUrl': {
      immediate: true,
      handler(url: string) {
        if (!url) return;
        this.imageLoaded = false;
        const img = new Image();
        img.onload = () => {
          this.imageLoaded = true;
        };
        img.src = url;
      },
    },
    'gameState.startTime': {
      immediate: true,
      handler(startTime) {
        if (startTime && !this.timerInterval) {
          this.timerInterval = setInterval(() => {
            this.currentTime = Date.now();
          }, 500);
        } else if (!startTime && this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      }
    }
  },

  mounted() {
    this.timerInterval = setInterval(() => {
      this.currentTime = Date.now();
    }, 500);
  },

  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },

  methods: {
    boardPieceStyle(piece: JigsawPiece): object {
      return {
        left: (piece.boardCol! * this.cellPx) + 'px',
        top: (piece.boardRow! * this.cellPx) + 'px',
        width: this.cellPx + 'px',
        height: this.cellPx + 'px',
        backgroundImage: this.imageLoaded ? `url(${this.imageUrl})` : 'none',
        backgroundSize: `${this.boardPx}px ${this.boardPx}px`,
        backgroundPosition: `-${piece.col * this.cellPx}px -${piece.row * this.cellPx}px`
      };
    },
    trayPieceStyle(piece: JigsawPiece): object {
      const gs = this.gameState?.gridSize ?? 4;
      return {
        width: this.trayPiecePx + 'px',
        height: this.trayPiecePx + 'px',
        backgroundImage: this.imageLoaded ? `url(${this.imageUrl})` : 'none',
        backgroundSize: `${this.trayPiecePx * gs}px ${this.trayPiecePx * gs}px`,
        backgroundPosition: `-${piece.col * this.trayPiecePx}px -${piece.row * this.trayPiecePx}px`
      };
    },
    getBoardCell(clientX: number, clientY: number): { row: number; col: number } | null {
      const boardContainer = this.$refs.boardContainer as HTMLElement | null;
      if (!boardContainer) return null;
      const containerRect = boardContainer.getBoundingClientRect();

      const x = clientX - containerRect.left;
      const y = clientY - containerRect.top;
      const col = Math.floor(x / this.cellPx);
      const row = Math.floor(y / this.cellPx);
      const gs = this.gameState?.gridSize ?? 4;

      if (col >= 0 && col < gs && row >= 0 && row < gs) return { row, col };
      return null;
    },

    // ---- HTML5 Drag/Drop ----
    onPieceDragStart(event: DragEvent, piece: JigsawPiece) {
      if (piece.placed || (piece.lockedBy && piece.lockedBy !== this.mySocketId)) {
        event.preventDefault();
        return;
      }
      this.draggingPieceId = piece.id;
      event.dataTransfer!.effectAllowed = 'move';
      event.dataTransfer!.setData('text/plain', String(piece.id));
      this.socket.emit('make-move', { roomKey: this.roomKey, action: 'pickup', pieceId: piece.id });
    },

    onPieceDragEnd(_event: DragEvent, piece: JigsawPiece) {
      if (this.draggingPieceId === piece.id) {
        this.draggingPieceId = null;
        this.snapHint = null;
      }
    },

    onBoardMouseMove(event: MouseEvent) {
      if (!this.draggingPieceId) {
        this.snapHint = null;
        return;
      }
      const cell = this.getBoardCell(event.clientX, event.clientY);
      if (cell) {
        const occupied = this.gameState.pieces.some(
          (p) => p.boardRow === cell.row && p.boardCol === cell.col && p.id !== this.draggingPieceId
        );
        this.snapHint = !occupied ? cell : null;
      } else {
        this.snapHint = null;
      }
    },

    onBoardDrop(event: DragEvent) {
      const pieceId = Number(event.dataTransfer!.getData('text/plain'));
      if (!isNaN(pieceId)) {
        this.commitDrop(pieceId, event.clientX, event.clientY);
      }
    },

    commitDrop(pieceId: number, clientX: number, clientY: number) {
      this.draggingPieceId = null;
      this.snapHint = null;
      const cell = this.getBoardCell(clientX, clientY);
      if (cell) {
        const occupied = this.gameState.pieces.some(
          (p) => p.boardRow === cell.row && p.boardCol === cell.col && p.id !== pieceId
        );
        if (!occupied) {
          this.socket.emit('make-move', {
            roomKey: this.roomKey,
            action: 'drop',
            pieceId,
            row: cell.row,
            col: cell.col,
          });
          return;
        }
      }
      // Otherwise, cancel drop (return to tray)
      this.socket.emit('make-move', { roomKey: this.roomKey, action: 'cancel', pieceId });
    },

    // ---- Touch Support ----
    onPieceTouchStart(event: TouchEvent, piece: JigsawPiece) {
      if (piece.placed || (piece.lockedBy && piece.lockedBy !== this.mySocketId)) return;
      this.touchDragPiece = piece;
      const t = event.touches[0];
      this.touchX = t.clientX;
      this.touchY = t.clientY;
      this.socket.emit('make-move', { roomKey: this.roomKey, action: 'pickup', pieceId: piece.id });

      const onMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
        const cell = this.getBoardCell(touch.clientX, touch.clientY);
        if (cell) {
          const occupied = this.gameState.pieces.some(
            (p) => p.boardRow === cell.row && p.boardCol === cell.col && p.id !== piece.id
          );
          this.snapHint = !occupied ? cell : null;
        } else {
          this.snapHint = null;
        }
      };

      const onEnd = (e: TouchEvent) => {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        const id = this.touchDragPiece?.id;
        this.touchDragPiece = null;
        this.snapHint = null;
        if (id == null) return;
        const lastTouch = e.changedTouches[0];
        this.commitDrop(id, lastTouch.clientX, lastTouch.clientY);
      };

      document.addEventListener('touchmove', onMove, { passive: true });
      document.addEventListener('touchend', onEnd);
    },
  },
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
