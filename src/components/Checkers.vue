<template>
  <div
    v-if="isValidGame"
    class="flex-grow flex flex-col items-center justify-between h-full p-2 sm:p-4 md:p-6 select-none"
  >
    <GameHeader
      title="Checkers"
      :connection-status="connectionStatus"
      :current-player="gameState.currentPlayer"
      :player="player"
      :game-over="gameOver"
      :winner="gameState.winner"
      :game-state="gameState"
      :socket="socket"
      :room-key="roomKey"
    />

    <div class="flex-grow flex items-center justify-center py-1 sm:py-2 w-full">
      <div
        class="bg-amber-900 p-1.5 sm:p-2 rounded-2xl shadow-xl w-full max-w-[320px] xs:max-w-[380px] sm:max-w-[460px] md:max-w-[520px]"
      >
        <div class="grid grid-cols-8 gap-0 aspect-square">
          <div
            v-for="(_, idx) in 64"
            :key="idx"
            class="aspect-square flex items-center justify-center relative"
            :class="getSquareClass(idx)"
            @click="handleClick(idx)"
          >
            <div
              v-if="getPiece(idx)"
              class="w-[80%] h-[80%] rounded-full flex items-center justify-center shadow-md transition-all duration-150"
              :class="getPieceClass(idx)"
            >
              <span v-if="isKingPiece(idx)" class="text-[10px] sm:text-xs font-black leading-none select-none">
                &#9818;
              </span>
            </div>
            <div
              v-if="isValidTarget(idx)"
              class="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-400/60 animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full max-w-lg flex flex-col items-center justify-center py-1 sm:py-2">
      <button
        v-if="gameOver"
        @click="newGame"
        :disabled="ready"
        class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ ready ? 'Waiting for opponent...' : 'Play Again' }}
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
import { useGame } from '../composables/useGame.js';
import type { CheckersGameState as GameState } from '../types/shared.js';

export default defineComponent({
  name: 'Checkers',
  components: { GameHeader },
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
        board: Array.from({ length: 8 }, () => Array(8).fill(0)),
        currentPlayer: 1,
        winner: '',
        players: [],
        totalMoves: 0,
        mustCapturePos: null,
      }
    );

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/checkers/lobby',
    });

    return { ...game, gameState };
  },
  data() {
    return {
      selectedIdx: null as number | null,
    };
  },
  computed: {
    isValidGame() {
      return this.roomKey && this.player && this.gameState.players && this.gameState.players.length >= 1;
    },
    gameOver() {
      return !!this.gameState.winner;
    },
  },
  methods: {
    rowCol(idx: number) {
      return { r: Math.floor(idx / 8), c: idx % 8 };
    },
    idx(r: number, c: number) {
      return r * 8 + c;
    },
    isDarkSquare(idx: number) {
      const { r, c } = this.rowCol(idx);
      return (r + c) % 2 === 1;
    },
    getSquareClass(idx: number) {
      const { r, c } = this.rowCol(idx);
      const isDark = (r + c) % 2 === 1;
      const selected = this.selectedIdx === idx;
      const lastMoveTarget = this.gameState.lastMoveTo === `${r},${c}`;
      const lastMoveFrom = this.gameState.lastMoveFrom === `${r},${c}`;

      let cls = isDark ? 'bg-amber-800/80' : 'bg-amber-200/80';
      if (selected) cls += ' ring-2 ring-yellow-400 ring-inset z-20';
      if (lastMoveTarget || lastMoveFrom) cls += ' ring-1 ring-yellow-300/60 ring-inset';
      return cls;
    },
    getPiece(idx: number) {
      const { r, c } = this.rowCol(idx);
      return this.gameState.board[r][c] || null;
    },
    isKingPiece(idx: number) {
      const v = this.getPiece(idx);
      return v === 3 || v === 4;
    },
    getCapturesForPiece(r: number, c: number): [number, number][] {
      const v = this.gameState.board[r][c];
      if (!v) return [];
      const opp = v % 2 === 1 ? 2 : 1;
      const dirs: [number, number][] = v === 3 || v === 4
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : v === 1 || v === 3
          ? [[-1, -1], [-1, 1]]
          : [[1, -1], [1, 1]];
      const results: [number, number][] = [];
      for (const [dr, dc] of dirs) {
        const mr = r + dr;
        const mc = c + dc;
        const tr = r + 2 * dr;
        const tc = c + 2 * dc;
        if (
          tr >= 0 && tr < 8 && tc >= 0 && tc < 8
          && this.gameState.board[mr]?.[mc]
          && (this.gameState.board[mr][mc] === opp || this.gameState.board[mr][mc] === opp + 2)
          && this.gameState.board[tr][tc] === 0
        ) {
          results.push([tr, tc]);
        }
      }
      return results;
    },
    hasAnyCapture(player: number): boolean {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const v = this.gameState.board[r][c];
          if (v && (v === player || v === player + 2) && this.getCapturesForPiece(r, c).length > 0) {
            return true;
          }
        }
      }
      return false;
    },
    getSimpleMoves(r: number, c: number): [number, number][] {
      const v = this.gameState.board[r][c];
      if (!v) return [];
      const dirs: [number, number][] = v === 3 || v === 4
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : v === 1 || v === 3
          ? [[-1, -1], [-1, 1]]
          : [[1, -1], [1, 1]];
      const results: [number, number][] = [];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && this.gameState.board[nr][nc] === 0) {
          results.push([nr, nc]);
        }
      }
      return results;
    },
    getValidTargets(r: number, c: number): [number, number][] {
      const v = this.gameState.board[r][c];
      if (!v) return [];
      const p = v <= 2 ? v : v - 2;
      if (p !== this.player) return [];

      if (this.gameState.mustCapturePos) {
        const [mustR, mustC] = this.gameState.mustCapturePos.split(',').map(Number);
        if (r !== mustR || c !== mustC) return [];
      }

      const captures = this.getCapturesForPiece(r, c);
      if (captures.length > 0) return captures;

      if (this.hasAnyCapture(this.player)) return [];

      return this.getSimpleMoves(r, c);
    },
    getPieceClass(idx: number) {
      const v = this.getPiece(idx);
      if (v === 1) return 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 border-2 border-blue-300 text-white';
      if (v === 2) return 'bg-gradient-to-br from-red-600 via-red-500 to-rose-400 border-2 border-red-300 text-white';
      if (v === 3) return 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 border-2 border-yellow-400 text-yellow-300';
      if (v === 4) return 'bg-gradient-to-br from-red-600 via-red-500 to-rose-400 border-2 border-yellow-400 text-yellow-300';
      return '';
    },
    isMyTurn() {
      return !this.gameOver && this.player === this.gameState.currentPlayer && this.gameState.players.length === 2;
    },
    isValidTarget(idx: number) {
      if (!this.selectedIdx) return false;
      const { r, c } = this.rowCol(idx);
      const { r: sr, c: sc } = this.rowCol(this.selectedIdx);
      const targets = this.getValidTargets(sr, sc);
      return targets.some(([tr, tc]) => tr === r && tc === c);
    },
    handleClick(idx: number) {
      if (!this.isMyTurn()) return;
      const { r, c } = this.rowCol(idx);
      const v = this.gameState.board[r][c];

      if (this.selectedIdx !== null) {
        const { r: sr, c: sc } = this.rowCol(this.selectedIdx);
        const targets = this.getValidTargets(sr, sc);
        const isTarget = targets.some(([tr, tc]) => tr === r && tc === c);
        if (isTarget) {
          this.selectedIdx = null;
          this.socket.emit('make-move', { roomKey: this.roomKey, fromRow: sr, fromCol: sc, toRow: r, toCol: c });
          return;
        }
      }

      if (v && (v === this.player || v === this.player + 2)) {
        const targets = this.getValidTargets(r, c);
        if (targets.length > 0) {
          this.selectedIdx = idx;
          return;
        }
      }

      this.selectedIdx = null;
    },
  },
  watch: {
    'gameState.currentPlayer'() {
      this.selectedIdx = null;
    },
    'gameState.winner'() {
      this.selectedIdx = null;
    },
  },
});
</script>
