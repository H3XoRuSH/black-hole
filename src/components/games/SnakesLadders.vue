<template>
  <div v-if="isValidGame"
    class="flex-grow flex flex-col items-center h-full p-2 sm:p-4 select-none overflow-hidden bg-transparent"
  >
    <!-- Custom Header section (like Bingo/Pictionary) -->
    <div class="w-full max-w-lg flex items-center justify-between gap-x-2 gap-y-1 mb-2 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <button
          @click="isHowToPlayOpen = true"
          class="text-neo-text/70 hover:text-neo-muted transition-colors p-1.5 rounded-none flex items-center justify-center cursor-pointer neo-border-2 bg-white dark:bg-neo-card-bg shadow-sm"
          title="How to Play"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <span class="text-xs text-neo-text/60 font-bold uppercase tracking-wider">
          {{ gameState.boardType }} Board ({{ gameState.gridSize }}x{{ gameState.gridSize }})
        </span>
      </div>

      <div class="flex items-center justify-center space-x-2">
        <h1 class="text-xl sm:text-2xl font-black uppercase text-neo-text tracking-tighter">
          Snakes & Ladders
        </h1>
      </div>

      <!-- Exit Button -->
      <router-link to="/menu"
        class="text-neo-text/70 hover:text-neo-accent transition-colors p-1.5 rounded-none flex items-center justify-center cursor-pointer neo-border-2 bg-white dark:bg-neo-card-bg shadow-sm"
        title="Leave Game"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </router-link>
    </div>

    <!-- Active Turn / Outcome Banner -->
    <div class="w-full max-w-lg mb-3 flex-shrink-0">
      <div v-if="gameOver" class="text-center bg-green-500/20 neo-border-2 p-3 text-neo-text font-black uppercase text-sm sm:text-base animate-pop-in">
        👑 Game Over! {{ gameState.winner }} Wins!
      </div>
      <div v-else class="flex justify-between items-center bg-white dark:bg-neo-card-bg p-2.5 neo-border neo-shadow-sm text-xs sm:text-sm text-neo-text">
        <div class="flex items-center space-x-2">
          <span class="w-2.5 h-2.5 rounded-full bg-neo-secondary animate-pulse"></span>
          <span class="font-extrabold uppercase">Turn: {{ activePlayerName }}</span>
        </div>
        <div class="font-bold text-neo-text/60">
          You are <span class="font-black" :style="{ color: getPlayerColor(player) }">Player {{ player }}</span>
        </div>
      </div>
    </div>

    <!-- Main Game Board Container -->
    <div class="flex-grow flex flex-col items-center justify-center w-full max-w-lg min-h-0 py-1">
      <div class="w-full aspect-square max-h-[460px] bg-white dark:bg-zinc-900 border-4 border-black neo-shadow relative select-none">

        <!-- Board Cells -->
        <div
          v-for="cell in cells"
          :key="cell"
          class="absolute border border-black/10 dark:border-white/10 flex flex-col justify-between p-1"
          :class="getCellBg(cell)"
          :style="getCellStyle(cell)"
        >
          <!-- Cell Number -->
          <span class="text-[10px] xs:text-xs font-black text-black/60 dark:text-white/60">
            {{ cell }}
          </span>

        </div>

        <!-- SVG overlay for Snakes and Ladders -->
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-50"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <!-- Ladders -->
          <g v-for="(ladder, index) in renderedLadders" :key="'ladder-' + index">
            <!-- Left rail -->
            <line
              :x1="ladder.rail1.x1" :y1="ladder.rail1.y1"
              :x2="ladder.rail1.x2" :y2="ladder.rail1.y2"
              stroke="var(--color-neo-border)" stroke-width="0.9" stroke-linecap="round"
            />
            <!-- Right rail -->
            <line
              :x1="ladder.rail2.x1" :y1="ladder.rail2.y1"
              :x2="ladder.rail2.x2" :y2="ladder.rail2.y2"
              stroke="var(--color-neo-border)" stroke-width="0.9" stroke-linecap="round"
            />
            <!-- Rungs -->
            <line
              v-for="(rung, rIdx) in ladder.rungs" :key="rIdx"
              :x1="rung.x1" :y1="rung.y1"
              :x2="rung.x2" :y2="rung.y2"
              stroke="var(--color-neo-border)" stroke-width="0.6" stroke-linecap="round"
            />
          </g>

          <!-- Snakes -->
          <g v-for="(snake, index) in renderedSnakes" :key="'snake-' + index">
            <!-- Snake tongue -->
            <path
              :d="snake.tongue"
              stroke="#ef4444" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"
              fill="none"
            />
            <!-- Snake body outline -->
            <path
              :d="snake.path"
              stroke="var(--color-neo-border)" stroke-width="1.8"
              fill="none" stroke-linecap="round" stroke-linejoin="round"
            />
            <!-- Snake body inner core -->
            <path
              :d="snake.path"
              stroke="#ef4444" stroke-width="0.8"
              fill="none" stroke-linecap="round" stroke-linejoin="round"
            />
            <!-- Snake head (minimalist, solid color with border) -->
            <circle
              :cx="snake.head.x" :cy="snake.head.y"
              r="0.7" fill="#ef4444" stroke="var(--color-neo-border)" stroke-width="0.5"
            />
          </g>
        </svg>

        <!-- Player Tokens -->
        <transition-group name="token-move">
          <div
            v-for="p in gameState.players"
            :key="'token-' + p.player"
            class="absolute w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black text-white shadow-md z-20 transition-all duration-300 ease-out"
            :class="[gameState.currentPlayer === p.player ? 'ring-2 ring-yellow-400 scale-110 z-30 animate-pulse' : '']"
            :style="getTokenStyle(p.player)"
          >
            P{{ p.player }}
          </div>
        </transition-group>

      </div>
    </div>

    <!-- Active Controls and Roll/Die Bar -->
    <div class="w-full max-w-lg mt-3 bg-white dark:bg-neo-card-bg neo-border neo-shadow-sm p-4 flex items-center justify-between gap-4 flex-shrink-0">

      <!-- Roll Button & Status -->
      <div class="flex-grow text-left">
        <button
          v-if="!gameOver"
          @click="rollDie"
          :disabled="!isMyTurn || isAnimating || rolling"
          class="w-full bg-neo-accent hover:bg-neo-accent/90 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-neo-text font-black py-3 px-5 border-3 border-black rounded-none shadow-[3px_3px_0px_#000] disabled:shadow-none hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-y-[3px] active:shadow-none transition-all duration-75 cursor-pointer text-sm sm:text-base uppercase flex items-center justify-center space-x-2"
          :class="{ 'animate-pulse': isMyTurn && !rolling && !isAnimating }"
        >
          <span v-if="rolling">Rolling...</span>
          <span v-else-if="isAnimating">Moving...</span>
          <span v-else-if="isMyTurn">🎲 Roll Die!</span>
          <span v-else>Waiting for Turn</span>
        </button>

        <button
          v-else
          @click="newGame"
          :disabled="ready"
          class="w-full bg-neo-secondary hover:bg-neo-secondary/90 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-neo-text font-black py-3 px-5 border-3 border-black rounded-none shadow-[3px_3px_0px_#000] disabled:shadow-none hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-y-[3px] active:shadow-none transition-all duration-75 cursor-pointer text-sm sm:text-base uppercase flex items-center justify-center space-x-2"
        >
          <WaitingIndicator v-if="ready" />
          <span v-else>🎮 Play Again</span>
        </button>

        <p class="text-[10px] text-neo-text/50 font-bold uppercase tracking-wider mt-2 text-center" v-if="gameState.lastRollWasSix && !gameOver">
          🔥 Rolled a 6! Extra turn granted!
        </p>
      </div>

      <!-- Die Visualizer -->
      <div
        class="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-zinc-800 border-4 border-black shadow-[4px_4px_0px_#000] rounded-none p-2 sm:p-3 relative flex items-center justify-center flex-shrink-0"
      >
        <div class="grid grid-cols-3 grid-rows-3 w-full h-full pointer-events-none">
          <!-- Top-left -->
          <div :class="[showDot(1) ? 'bg-black dark:bg-white' : '', 'rounded-full w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 justify-self-center self-center']"></div>
          <!-- Top-middle -->
          <div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"></div>
          <!-- Top-right -->
          <div :class="[showDot(2) ? 'bg-black dark:bg-white' : '', 'rounded-full w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 justify-self-center self-center']"></div>

          <!-- Mid-left -->
          <div :class="[showDot(3) ? 'bg-black dark:bg-white' : '', 'rounded-full w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 justify-self-center self-center']"></div>
          <!-- Mid-middle -->
          <div :class="[showDot(4) ? 'bg-black dark:bg-white' : '', 'rounded-full w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 justify-self-center self-center']"></div>
          <!-- Mid-right -->
          <div :class="[showDot(5) ? 'bg-black dark:bg-white' : '', 'rounded-full w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 justify-self-center self-center']"></div>

          <!-- Bot-left -->
          <div :class="[showDot(6) ? 'bg-black dark:bg-white' : '', 'rounded-full w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 justify-self-center self-center']"></div>
          <!-- Bot-middle -->
          <div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"></div>
          <!-- Bot-right -->
          <div :class="[showDot(7) ? 'bg-black dark:bg-white' : '', 'rounded-full w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 justify-self-center self-center']"></div>
        </div>
      </div>
    </div>

    <!-- How to Play Modal -->
    <HowToPlayModal :is-open="isHowToPlayOpen" game-id="snakes-ladders" @close="isHowToPlayOpen = false" />

  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../../composables/useGame.js';
import { useConfetti } from '../../composables/useConfetti.js';
import type { SnakesLaddersGameState as GameState } from '../../types/shared.js';
import WaitingIndicator from '../ui/WaitingIndicator.vue';
import HowToPlayModal from '../modals/HowToPlayModal.vue';

export default defineComponent({
  name: 'SnakesLadders',
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
        boardType: 'classic',
        gridSize: 10,
        snakesCount: 8,
        laddersCount: 8,
        snakes: {},
        ladders: {},
        players: [],
        currentPlayer: 1,
        positions: {},
        winner: '',
        totalMoves: 0,
        lastRoll: null,
        lastRollWasSix: false,
        lastMove: null,
      }
    );

    const isHowToPlayOpen = ref(false);
    const rolling = ref(false);
    const activeDiceVal = ref<number | null>(null);
    const isAnimating = ref(false);
    const localPositions = ref<Record<number, number>>({});
    if (props.initialGameState && props.initialGameState.positions) {
      Object.keys(props.initialGameState.positions).forEach((pNum) => {
        localPositions.value[Number(pNum)] = props.initialGameState.positions[Number(pNum)];
      });
    }
    const waiting = ref(false);

    const confetti = useConfetti();

    // Step-by-step token movement animation
    async function animatePlayerMove(lastMove: any) {
      isAnimating.value = true;
      const { player: playerNum, from, finalTo, snakeOrLadder } = lastMove;

      const maxCell = gameState.value.gridSize * gameState.value.gridSize;
      const rollAmount = gameState.value.lastRoll || 1;

      // Compute path cells (supports bounce back)
      const path: number[] = [];
      const target = from + rollAmount;
      if (target > maxCell) {
        // Go forward to maxCell
        for (let cell = from + 1; cell <= maxCell; cell++) {
          path.push(cell);
        }
        // Go backward
        const overshoot = target - maxCell;
        for (let cell = maxCell - 1; cell >= maxCell - overshoot; cell--) {
          path.push(cell);
        }
      } else {
        for (let cell = from + 1; cell <= target; cell++) {
          path.push(cell);
        }
      }

      // Step-by-step walk
      for (const stepCell of path) {
        localPositions.value[playerNum] = stepCell;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Resolve snake head slide or ladder climb
      if (snakeOrLadder) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        localPositions.value[playerNum] = finalTo;
        // Wait for sliding transition to end
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      isAnimating.value = false;

      // Ensure local state matches server state completely
      if (gameState.value) {
        Object.keys(gameState.value.positions).forEach((pNum) => {
          localPositions.value[Number(pNum)] = gameState.value.positions[Number(pNum)];
        });
      }
    }

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/snakes-ladders/lobby',
      onGameState: (newState: any) => {
        const oldState = gameState.value;
        gameState.value = newState;

        if (newState.totalMoves === 0) {
          waiting.value = false;
          // Reset token positions instantly on game reset
          Object.keys(newState.positions).forEach((pNum) => {
            localPositions.value[Number(pNum)] = newState.positions[Number(pNum)];
          });
        }

        if (newState.winner) {
          setTimeout(() => confetti.fire(), 300);
        }

        // Handle dice roll animation and token stepping trigger
        if (oldState && newState.totalMoves > oldState.totalMoves && newState.lastMove) {
          // If the dice is not spinning yet, start it
          if (!rolling.value) {
            rolling.value = true;
          }

          let cycleCount = 0;
          const spinInterval = setInterval(() => {
            activeDiceVal.value = Math.floor(Math.random() * 6) + 1;
            cycleCount++;
            if (cycleCount > 6) {
              clearInterval(spinInterval);
              activeDiceVal.value = newState.lastRoll;
              rolling.value = false;
              // Trigger token steps
              animatePlayerMove(newState.lastMove);
            }
          }, 80);
        } else {
          // Force sync if no animations
          if (!isAnimating.value) {
            Object.keys(newState.positions).forEach((pNum) => {
              localPositions.value[Number(pNum)] = newState.positions[Number(pNum)];
            });
          }
          if (newState.lastRoll !== null) {
            activeDiceVal.value = newState.lastRoll;
          }
        }
      },
    });

    return {
      ...game,
      gameState,
      isHowToPlayOpen,
      rolling,
      activeDiceVal,
      isAnimating,
      localPositions,
      waiting,
    };
  },
  computed: {
    isValidGame(): boolean {
      return !!(this.gameState && this.gameState.players);
    },
    gameOver(): boolean {
      return !!this.gameState.winner;
    },
    maxCell(): number {
      return this.gameState.gridSize * this.gameState.gridSize;
    },
    cells(): number[] {
      // Return list of numbers from maxCell down to 1 so bottom is row 0
      const cellsArr: number[] = [];
      for (let i = this.maxCell; i >= 1; i--) {
        cellsArr.push(i);
      }
      return cellsArr;
    },
    isMyTurn(): boolean {
      return this.gameState.currentPlayer === this.player;
    },
    activePlayerName(): string {
      const activeP = this.gameState.players.find((p: any) => p.player === this.gameState.currentPlayer);
      return activeP?.name || `Player ${this.gameState.currentPlayer}`;
    },
    // Generate absolute rail lines and steps for SVG drawing
    renderedLadders(): any[] {
      const list: any[] = [];
      Object.entries(this.gameState.ladders || {}).forEach(([bStr, tStr]) => {
        const bottom = Number(bStr);
        const top = Number(tStr);

        const c1 = this.getCellCoords(bottom);
        const c2 = this.getCellCoords(top);

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;

        const px = -dy / len;
        const py = dx / len;
        const width = 1.3; // ladder width in SVG percentage units

        // Compute rails
        const rail1 = {
          x1: c1.x + px * width, y1: c1.y + py * width,
          x2: c2.x + px * width, y2: c2.y + py * width,
        };
        const rail2 = {
          x1: c1.x - px * width, y1: c1.y - py * width,
          x2: c2.x - px * width, y2: c2.y - py * width,
        };

        // Compute rungs
        const rungs: any[] = [];
        const numRungs = Math.max(3, Math.floor(len / 4.5));
        for (let j = 1; j < numRungs; j++) {
          const t = j / numRungs;
          const rx = c1.x + dx * t;
          const ry = c1.y + dy * t;
          rungs.push({
            x1: rx + px * width, y1: ry + py * width,
            x2: rx - px * width, y2: ry - py * width,
          });
        }

        list.push({ rail1, rail2, rungs });
      });
      return list;
    },
    renderedSnakes(): any[] {
      const list: any[] = [];
      Object.entries(this.gameState.snakes || {}).forEach(([hStr, tStr]) => {
        const head = Number(hStr);
        const tail = Number(tStr);

        const c1 = this.getCellCoords(head);
        const c2 = this.getCellCoords(tail);

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;

        const px = -dy / len;
        const py = dx / len;

        // Sample points to draw a sinusoidal wavy path
        const samplesCount = 18;
        let pathStr = `M ${c1.x} ${c1.y}`;
        for (let i = 1; i <= samplesCount; i++) {
          const t = i / samplesCount;
          const lx = c1.x + dx * t;
          const ly = c1.y + dy * t;

          // Wave offset
          const amplitude = Math.min(2.8, len * 0.08) * Math.sin(t * Math.PI);
          const offset = amplitude * Math.sin(t * Math.PI * 3.5);
          const wx = lx + px * offset;
          const wy = ly + py * offset;

          pathStr += ` L ${wx} ${wy}`;
        }

        // Direction vector for the head (pointing away from tail)
        const hx = -dx / len;
        const hy = -dy / len;
        const tx = -hy; // perpendicular vector
        const ty = hx;

        // Calculate minimalist forked tongue path
        const r = 0.7; // head radius
        const startX = c1.x + hx * r;
        const startY = c1.y + hy * r;
        const midX = c1.x + hx * (r + 0.8);
        const midY = c1.y + hy * (r + 0.8);
        const tip1X = c1.x + hx * (r + 1.2) + tx * 0.35;
        const tip1Y = c1.y + hy * (r + 1.2) + ty * 0.35;
        const tip2X = c1.x + hx * (r + 1.2) - tx * 0.35;
        const tip2Y = c1.y + hy * (r + 1.2) - ty * 0.35;
        const tonguePath = `M ${startX} ${startY} L ${midX} ${midY} M ${midX} ${midY} L ${tip1X} ${tip1Y} M ${midX} ${midY} L ${tip2X} ${tip2Y}`;

        list.push({
          path: pathStr,
          head: c1,
          tail: c2,
          tongue: tonguePath,
        });
      });
      return list;
    },
  },
  methods: {
    rollDie() {
      if (!this.isMyTurn || this.isAnimating || this.rolling || this.gameOver) return;
      this.rolling = true;

      // Play a quick local roll effect, but wait for game state update from socket
      let localCycle = 0;
      const interval = setInterval(() => {
        if (!this.rolling) {
          clearInterval(interval);
          return;
        }
        this.activeDiceVal = Math.floor(Math.random() * 6) + 1;
        localCycle++;
        // Limit local roll preview if network is slow
        if (localCycle > 20) {
          clearInterval(interval);
        }
      }, 70);

      this.socket.emit('make-move', {
        roomKey: this.roomKey,
        action: 'roll',
      });
    },
    getCellCoords(cell: number) {
      const N = this.gameState.gridSize;
      const r = Math.floor((cell - 1) / N);
      const isEvenRow = r % 2 === 0;
      const c = isEvenRow ? (cell - 1) % N : N - 1 - ((cell - 1) % N);

      // Coordinates in percentage (0 to 100)
      const x = ((c + 0.5) / N) * 100;
      const y = 100 - ((r + 0.5) / N) * 100;
      return { x, y, r, c };
    },
    getCellStyle(cell: number) {
      const N = this.gameState.gridSize;
      const r = Math.floor((cell - 1) / N);
      const isEvenRow = r % 2 === 0;
      const c = isEvenRow ? (cell - 1) % N : N - 1 - ((cell - 1) % N);

      return {
        width: `${100 / N}%`,
        height: `${100 / N}%`,
        left: `${(c / N) * 100}%`,
        bottom: `${(r / N) * 100}%`,
      };
    },
    getCellBg(cell: number): string {
      // Vibrant pastel shades alternated
      const colors = [
        'bg-[#fed7aa] dark:bg-amber-950/20', // Orange-100
        'bg-[#fef08a] dark:bg-yellow-950/20', // Yellow-100
        'bg-[#bbf7d0] dark:bg-emerald-950/20', // Green-100
        'bg-[#bfdbfe] dark:bg-blue-950/20', // Blue-100
        'bg-[#fbcfe8] dark:bg-pink-950/20', // Pink-100
        'bg-[#ddd6fe] dark:bg-violet-950/20', // Violet-100
      ];
      // Alternate row colors slightly to make rows stand out
      const N = this.gameState.gridSize;
      const r = Math.floor((cell - 1) / N);
      return colors[(cell + r) % colors.length];
    },
    showDot(dotIndex: number): boolean {
      const val = this.activeDiceVal || 1;
      if (dotIndex === 4) return val === 1 || val === 3 || val === 5;
      if (dotIndex === 1) return val === 4 || val === 5 || val === 6;
      if (dotIndex === 2) return val === 2 || val === 3 || val === 4 || val === 5 || val === 6;
      if (dotIndex === 3) return val === 6;
      if (dotIndex === 5) return val === 6;
      if (dotIndex === 6) return val === 2 || val === 3 || val === 4 || val === 5 || val === 6;
      if (dotIndex === 7) return val === 4 || val === 5 || val === 6;
      return false;
    },
    getPlayerColor(playerNum: number): string {
      const colors = [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#a855f7', // Purple
        '#f97316', // Orange
        '#ec4899', // Pink
        '#14b8a6', // Teal
      ];
      return colors[(playerNum - 1) % colors.length];
    },
    getTokenStyle(playerNum: number) {
      const currentCell = this.localPositions[playerNum] || 1;
      const coords = this.getCellCoords(currentCell);
      const N = this.gameState.gridSize;

      // Align token spacing offsets if multiple players land on the same square
      const playersOnSameCell = Object.entries(this.localPositions)
        .filter(([_, cellVal]) => cellVal === currentCell)
        .map(([pNum, _]) => Number(pNum))
        .sort((a, b) => a - b);

      const playerIdx = playersOnSameCell.indexOf(playerNum);

      let offsetX = 0;
      let offsetY = 0;

      if (playersOnSameCell.length > 1) {
        // Distribute offsets in a small grid pattern relative to center
        const total = playersOnSameCell.length;
        const angle = (playerIdx / total) * 2 * Math.PI;
        const radius = Math.min(2.5, 12 / N); // radius dynamically scaled by board size
        offsetX = Math.cos(angle) * radius;
        offsetY = Math.sin(angle) * radius;
      }

      return {
        left: `calc(${coords.x}% - 10px + ${offsetX}%)`,
        top: `calc(${coords.y}% - 10px + ${offsetY}%)`,
        backgroundColor: this.getPlayerColor(playerNum),
      };
    },
  },
});
</script>

<style scoped>
/* Token sliding transitions */
.token-move-move {
  transition: all 0.3s ease-in-out;
}
</style>
