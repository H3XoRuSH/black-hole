<template>
  <div
    v-if="isValidGame"
    class="flex-grow flex flex-col items-center justify-between h-full p-2 sm:p-4 select-none"
  >
    <!-- Game Header -->
    <GameHeader
      title="Dots and Boxes"
      :connection-status="connectionStatus"
      :current-player="gameState.currentPlayer"
      :player="player"
      :game-over="gameOver"
      :winner="gameState.winner"
      :game-state="gameState"
      :socket="socket"
      :room-key="roomKey"
    />

    <!-- Score Info -->
    <div class="flex items-center justify-center gap-x-6 px-4 py-2 bg-white dark:bg-neo-card-bg text-neo-text neo-border-2 rounded-none mb-2.5 text-xs sm:text-sm font-black uppercase tracking-wide">
      <div class="flex items-center space-x-1.5">
        <div class="w-3 h-3 rounded-none bg-blue-500 border border-black shrink-0"></div>
        <span>{{ p1Name }}: {{ gameState.scores.player1 }}</span>
      </div>
      <div class="flex items-center space-x-1.5">
        <div class="w-3 h-3 rounded-none bg-rose-500 border border-black shrink-0"></div>
        <span>{{ p2Name }}: {{ gameState.scores.player2 }}</span>
      </div>
    </div>
    <!-- Dots & Boxes Board Container -->
    <div class="flex-grow flex items-center justify-center py-2 w-full">
      <div
        class="bg-white dark:bg-neo-card-bg text-neo-text neo-border neo-shadow p-4 sm:p-6 rounded-none w-full max-w-[240px] xs:max-w-[300px] sm:max-w-[360px] md:max-w-[380px] aspect-square relative"
      >
        <!-- Board Layout Area -->
        <div class="relative w-full h-full">
          <!-- Render Boxes -->
          <div
            v-for="box in boxes"
            :key="`box-${box.key}`"
            :id="`box-${box.key}`"
            class="absolute flex items-center justify-center transition-all duration-300"
            :style="{
              top: `${box.r * 25}%`,
              left: `${box.c * 25}%`,
              width: '25%',
              height: '25%',
              zIndex: 5,
            }"
          >
            <div
              v-if="gameState.boxes[box.key]"
              class="w-[calc(100%-4px)] h-[calc(100%-4px)] flex items-center justify-center rounded-none transition-all duration-300 transform scale-95 animate-box-fill"
              :class="getBoxClass(box.key)"
            >
              <span
                class="text-xs sm:text-sm font-black uppercase select-none opacity-80"
              >
                {{ gameState.boxes[box.key] === 1 ? 'P1' : 'P2' }}
              </span>
            </div>
          </div>

          <!-- Render Horizontal Lines -->
          <div
            v-for="line in horizontalLines"
            :key="`line-${line.key}`"
            :id="`line-${line.key}`"
            class="absolute group flex items-center justify-center"
            :class="{ 'cursor-pointer': isMyTurn() && !gameState.lines[line.key] }"
            :style="{
              top: `${line.r * 25}%`,
              left: `${line.c * 25}%`,
              width: '25%',
              height: '12px',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }"
            @click="makeMove(line.key)"
          >
            <div
              class="w-[calc(100%-8px)] h-1 rounded-none transition-all duration-200"
              :class="getLineClass(line.key, 'h')"
            ></div>
          </div>

          <!-- Render Vertical Lines -->
          <div
            v-for="line in verticalLines"
            :key="`line-${line.key}`"
            :id="`line-${line.key}`"
            class="absolute group flex items-center justify-center"
            :class="{ 'cursor-pointer': isMyTurn() && !gameState.lines[line.key] }"
            :style="{
              top: `${line.r * 25}%`,
              left: `${line.c * 25}%`,
              width: '12px',
              height: '25%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }"
            @click="makeMove(line.key)"
          >
            <div
              class="w-1 h-[calc(100%-8px)] rounded-none transition-all duration-200"
              :class="getLineClass(line.key, 'v')"
            ></div>
          </div>

          <!-- Render Dots -->
          <div
            v-for="dot in dots"
            :key="`dot-${dot.key}`"
            :id="`dot-${dot.key}`"
            class="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-none bg-neo-text neo-border-2 pointer-events-none"
            :style="{
              top: `${dot.r * 25}%`,
              left: `${dot.c * 25}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="w-full max-w-lg flex flex-col items-center justify-center py-4 animate-slide-up">
      <button
        v-if="gameOver"
        @click="newGame"
        :disabled="ready"
        id="play-again-btn"
        class="bg-neo-accent text-white font-black py-2.5 px-6 rounded-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 cursor-pointer neo-btn uppercase tracking-wider"
      >
        <span v-if="ready" class="flex items-center gap-1.5 justify-center">Waiting for opponent<WaitingIndicator /></span>
        <span v-else>Play Again</span>
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
    <p class="text-lg text-gray-500 dark:text-gray-400 font-medium">
      Invalid game state. Redirecting to lobby...
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { Socket } from 'socket.io-client';
import GameHeader from '../layout/GameHeader.vue';
import WaitingIndicator from '../ui/WaitingIndicator.vue';
import { useGame } from '../../composables/useGame.js';
import { useConfetti } from '../../composables/useConfetti.js';
import type { DotsAndBoxesGameState as GameState } from '../../types/shared.js';

export default defineComponent({
  name: 'DotsAndBoxes',
  components: {
    GameHeader,
    WaitingIndicator,
  },
  emits: ['update-connection-status', 'update-player', 'update-room-key'],
  props: {
    socket: {
      type: Object as PropType<Socket>,
      required: true,
    },
    player: {
      type: Number,
      required: true,
    },
    roomKey: {
      type: String,
      required: true,
    },
    initialGameState: {
      type: Object as PropType<GameState>,
      required: true,
    },
    connectionStatus: String,
  },
  setup(props) {
    const gameState = ref<GameState>(
      props.initialGameState || {
        lines: {},
        boxes: {},
        scores: { player1: 0, player2: 0 },
        currentPlayer: 1,
        totalMoves: 0,
        players: [],
        winner: '',
      }
    );

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/dots-and-boxes/lobby',
    });

    const confetti = useConfetti();

    watch(() => gameState.value?.winner, (newVal, oldVal) => {
      if (newVal && !oldVal) {
        setTimeout(() => confetti.fire(), 300);
      }
    });

    return { ...game, gameState, confetti };
  },
  data() {
    return {};
  },
  computed: {
    p1Name(): string {
      const p = this.gameState.players.find((p: any) => p.player === 1);
      return p?.name || 'Player 1';
    },
    p2Name(): string {
      const p = this.gameState.players.find((p: any) => p.player === 2);
      return p?.name || 'Player 2';
    },
    isValidGame() {
      return (
        this.roomKey
        && this.player
        && this.gameState.players
        && this.gameState.players.length >= 1
      );
    },
    gameOver() {
      return !!this.gameState.winner;
    },
    // Generate horizontal lines metadata (5 rows, 4 lines per row)
    horizontalLines() {
      const lines = [];
      for (let r = 0; r <= 4; r++) {
        for (let c = 0; c <= 3; c++) {
          lines.push({ r, c, key: `h-${r}-${c}` });
        }
      }
      return lines;
    },
    // Generate vertical lines metadata (4 rows, 5 lines per row)
    verticalLines() {
      const lines = [];
      for (let r = 0; r <= 3; r++) {
        for (let c = 0; c <= 4; c++) {
          lines.push({ r, c, key: `v-${r}-${c}` });
        }
      }
      return lines;
    },
    // Generate dots (5x5 grid)
    dots() {
      const dots = [];
      for (let r = 0; r <= 4; r++) {
        for (let c = 0; c <= 4; c++) {
          dots.push({ r, c, key: `${r}-${c}` });
        }
      }
      return dots;
    },
    // Generate boxes (4x4 grid)
    boxes() {
      const boxes = [];
      for (let r = 0; r <= 3; r++) {
        for (let c = 0; c <= 3; c++) {
          boxes.push({ r, c, key: `${r}-${c}` });
        }
      }
      return boxes;
    },
  },
  methods: {
    isMyTurn() {
      return (
        !this.gameOver
        && this.player === this.gameState.currentPlayer
        && this.gameState.players.length === 2
      );
    },
    makeMove(lineKey: string) {
      if (!this.isMyTurn()) return;
      if (this.gameState.lines[lineKey]) return; // already drawn
      this.socket.emit('make-move', { roomKey: this.roomKey, lineKey });
    },
    getLineClass(lineKey: string, direction: string) {
      const lineOwner = this.gameState.lines[lineKey];
      if (lineOwner === 1) {
        const base = 'bg-blue-500 neo-border-2 border-blue-500';
        const last = this.gameState.lastMove?.lineKey === lineKey ? ' ring-4 ring-yellow-400 dark:ring-yellow-300 ring-offset-2 dark:ring-offset-neo-card-bg z-10' : '';
        return base + last;
      }
      if (lineOwner === 2) {
        const base = 'bg-rose-500 neo-border-2 border-rose-500';
        const last = this.gameState.lastMove?.lineKey === lineKey ? ' ring-4 ring-yellow-400 dark:ring-yellow-300 ring-offset-2 dark:ring-offset-neo-card-bg z-10' : '';
        return base + last;
      }

      // Interactive/hover state
      if (this.isMyTurn()) {
        const hoverColorClass
          = this.player === 1
            ? 'bg-blue-500/10 group-hover:bg-blue-500'
            : 'bg-rose-500/10 group-hover:bg-rose-500';
        const scalingClass
          = direction === 'h'
            ? 'group-hover:scale-y-125'
            : 'group-hover:scale-x-125';
        return `${hoverColorClass} ${scalingClass}`;
      }

      return 'bg-slate-300/40 dark:bg-slate-700/40';
    },
    getBoxClass(boxKey: string) {
      const boxOwner = this.gameState.boxes[boxKey];
      if (boxOwner === 1) {
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 neo-border-2 border-blue-500';
      }
      if (boxOwner === 2) {
        return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 neo-border-2 border-rose-500';
      }
      return '';
    },
  },
});
</script>
