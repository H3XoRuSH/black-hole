<template>
  <div
    v-if="isValidGame"
    class="flex-grow flex flex-col items-center justify-between h-full p-4 sm:p-6 md:p-8 select-none"
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
    <div class="flex space-x-8 mb-4 text-sm font-bold text-gray-700">
      <div class="flex items-center space-x-2">
        <div class="w-3.5 h-3.5 rounded-full bg-blue-500 shadow"></div>
        <span>{{ p1Name }} (Blue): {{ gameState.scores.player1 }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3.5 h-3.5 rounded-full bg-rose-500 shadow"></div>
        <span>{{ p2Name }} (Red): {{ gameState.scores.player2 }}</span>
      </div>
    </div>

    <!-- Dots & Boxes Board Container -->
    <div class="flex-grow flex items-center justify-center py-4 w-full">
      <div
        class="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-[280px] xs:max-w-[340px] sm:max-w-[400px] md:max-w-[440px] aspect-square relative"
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
              class="w-[calc(100%-4px)] h-[calc(100%-4px)] flex items-center justify-center rounded-lg transition-all duration-300 transform scale-95"
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
              height: '16px',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }"
            @click="makeMove(line.key)"
          >
            <div
              class="w-[calc(100%-8px)] h-1 sm:h-1.5 rounded transition-all duration-200"
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
              width: '16px',
              height: '25%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }"
            @click="makeMove(line.key)"
          >
            <div
              class="w-1 sm:w-1.5 h-[calc(100%-8px)] rounded transition-all duration-200"
              :class="getLineClass(line.key, 'v')"
            ></div>
          </div>

          <!-- Render Dots -->
          <div
            v-for="dot in dots"
            :key="`dot-${dot.key}`"
            :id="`dot-${dot.key}`"
            class="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-600 border border-slate-700 shadow-sm pointer-events-none"
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
    <div class="w-full max-w-lg flex flex-col items-center justify-center py-4">
      <button
        v-if="gameOver"
        @click="newGame"
        :disabled="ready"
        id="play-again-btn"
        class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span v-if="ready">Waiting for opponent<WaitingIndicator /></span>
        <span v-else>Play Again</span>
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">
      Invalid game state. Redirecting to lobby...
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Socket } from 'socket.io-client';
import GameHeader from './GameHeader.vue';
import WaitingIndicator from './WaitingIndicator.vue';
import { useGame } from '../composables/useGame.js';
import type { DotsAndBoxesGameState as GameState } from '../types/shared.js';

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

    return { ...game, gameState };
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
        const base = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
        const last = this.gameState.lastMove?.lineKey === lineKey ? ' ring-2 ring-yellow-300/80' : '';
        return base + last;
      }
      if (lineOwner === 2) {
        const base = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
        const last = this.gameState.lastMove?.lineKey === lineKey ? ' ring-2 ring-yellow-300/80' : '';
        return base + last;
      }

      // Interactive/hover state
      if (this.isMyTurn()) {
        const hoverColorClass
          = this.player === 1
            ? 'bg-blue-500/10 group-hover:bg-blue-500/60'
            : 'bg-rose-500/10 group-hover:bg-rose-500/60';
        const scalingClass
          = direction === 'h'
            ? 'group-hover:scale-y-125'
            : 'group-hover:scale-x-125';
        return `${hoverColorClass} ${scalingClass}`;
      }

      return 'bg-slate-800/30';
    },
    getBoxClass(boxKey: string) {
      const boxOwner = this.gameState.boxes[boxKey];
      if (boxOwner === 1) {
        return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.15)]';
      }
      if (boxOwner === 2) {
        return 'bg-gradient-to-br from-rose-500/20 to-pink-500/10 text-rose-400 border border-rose-500/30 shadow-[inset_0_0_10px_rgba(244,63,94,0.15)]';
      }
      return '';
    },
  },
});
</script>
