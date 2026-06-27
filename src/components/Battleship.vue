<template>
  <div v-if="isValidGame" class="flex-grow flex flex-col items-center justify-between h-full p-3 sm:p-4 select-none bg-gray-100 text-gray-800">
    <!-- Tactical Command Header -->
    <GameHeader
      title="Battleship"
      :current-player="gameState.currentPlayer"
      :player="player"
      :game-over="gameOver"
      :winner="gameState.winner"
    />

    <!-- Game Log Alert Area -->
    <div class="w-full max-w-lg mt-1 flex-shrink-0 text-center">
      <div v-if="gameState.lastShotResult" class="inline-block bg-white border border-gray-200 rounded-full px-4 py-1.5 text-xs font-mono shadow-sm">
        <span class="text-gray-400">SALVO RADAR:</span>
        <span :class="gameState.lastShotResult.player === 1 ? 'text-blue-600' : 'text-rose-600'" class="font-bold ml-1">
          P{{ gameState.lastShotResult.player }}
        </span>
        <span class="text-gray-500"> fired at </span>
        <span class="text-amber-600 font-bold">
          {{ String.fromCharCode(65 + gameState.lastShotResult.col) }}{{ gameState.lastShotResult.row + 1 }}
        </span>
        <span :class="gameState.lastShotResult.hit ? 'text-rose-600 font-bold' : 'text-gray-400'">
          - {{ gameState.lastShotResult.hit ? 'HIT!' : 'MISS' }}
        </span>
        <span v-if="gameState.lastShotResult.sunkShipName" class="text-red-600 font-extrabold ml-1">
          ({{ gameState.lastShotResult.sunkShipName }} SUNK!)
        </span>
      </div>
    </div>

    <!-- MAIN INTERFACE -->
    <div class="flex-grow flex flex-col items-center justify-center py-2 w-full min-h-0 overflow-hidden">
      <!-- 1. FLEET PLACEMENT PHASE -->
      <div v-if="gameState.phase === 'placement'" class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full h-full max-w-5xl min-h-0 overflow-hidden p-2">
        <div v-if="hasPlaced" class="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl max-w-md text-center shadow-md">
          <svg class="w-16 h-16 text-emerald-500 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Fleet Deployed</h2>
          <p class="text-sm text-gray-500">Waiting for the enemy commander to finish positioning their ships...</p>
        </div>

        <template v-else>
          <!-- Grid Area -->
          <div class="bg-slate-950 border border-slate-900 p-3 rounded-2xl shadow-lg flex flex-col items-center flex-shrink-0">
            <h3 class="text-xs font-mono font-bold tracking-widest text-slate-400 mb-2">POSITIONING GRID</h3>
            <div class="grid grid-cols-7 gap-0.5 text-center font-mono text-[9px] sm:text-xs">
              <div class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-600"></div>
              <div v-for="col in 6" :key="`h-col-${col}`" class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 font-bold">
                {{ String.fromCharCode(64 + col) }}
              </div>
              <template v-for="row in 6" :key="`row-${row}`">
                <div class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 font-bold">
                  {{ row }}
                </div>
                <div
                  v-for="col in 6"
                  :key="`cell-${row-1}-${col-1}`"
                  class="w-7 h-7 sm:w-9 sm:h-9 rounded border transition-all duration-150 cursor-pointer relative"
                  :class="getPlacementCellClass(row-1, col-1)"
                  @mouseover="onPlacementCellHover(row-1, col-1)"
                  @mouseleave="onPlacementCellLeave"
                  @click="onPlacementCellClick(row-1, col-1)"
                ></div>
              </template>
            </div>
          </div>

          <!-- Placement Controls Panel -->
          <div class="bg-slate-950 border border-slate-900 p-3 sm:p-5 rounded-2xl shadow-lg w-full max-w-xs sm:max-w-sm flex flex-col">
            <h3 class="text-sm sm:text-md font-bold tracking-wide mb-1.5 sm:mb-3 text-cyan-400 hidden sm:block">TAC-COM FLEET SETUP</h3>
            <p class="hidden sm:block text-xs text-slate-400 mb-3 sm:mb-4">Select a ship and click the grid to place it. Press spacebar or toggle orientation to rotate.</p>

            <div class="flex items-center justify-between mb-2 sm:mb-3 bg-slate-900 p-1.5 sm:p-2 rounded-xl border border-slate-800">
              <span class="text-xs font-semibold text-slate-300">Orientation</span>
              <button
                @click="placementOrientation = placementOrientation === 'H' ? 'V' : 'H'"
                class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded-lg text-xs tracking-wider transition-all duration-150 cursor-pointer"
              >
                {{ placementOrientation === 'H' ? 'HORIZONTAL' : 'VERTICAL' }}
              </button>
            </div>

            <!-- Ships Fleet List -->
            <div class="flex flex-row sm:flex-col gap-1.5 sm:gap-2 mb-2 sm:mb-3 overflow-x-auto sm:overflow-y-auto">
              <div
                v-for="(ship, idx) in fleet"
                :key="ship.name"
                @click="selectShip(idx)"
                :class="[
                  ship.placed ? 'border-emerald-500/40 bg-emerald-950/10 text-emerald-400' : (selectedShipIndex === idx ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 font-bold' : 'border-slate-800 bg-slate-900/40 text-slate-300'),
                  'flex flex-col sm:flex-row items-center justify-between p-1.5 sm:p-2 rounded-xl border cursor-pointer hover:border-cyan-500/50 transition-all duration-150 flex-1 min-w-[75px] sm:min-w-[90px] text-center sm:text-left'
                ]"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2.5">
                  <span class="text-[10px] sm:text-xs font-semibold">{{ ship.name }}</span>
                  <span class="text-[8px] sm:text-[9px] font-mono bg-slate-800 px-1 sm:px-1.5 py-0.5 rounded text-slate-400">Size: {{ ship.size }}</span>
                </div>
                <div class="flex items-center space-x-1.5 mt-1 sm:mt-0">
                  <span v-if="ship.placed" class="text-emerald-400 text-[9px] sm:text-[10px] flex items-center">
                    Ready
                  </span>
                  <button v-if="ship.placed" @click.stop="removeShip(idx)" class="text-rose-400 hover:text-rose-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider px-1">
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <!-- Placement Action Buttons -->
            <div class="flex gap-2">
              <button @click="resetFleet" class="flex-1 border border-slate-700 hover:bg-slate-900 text-slate-300 text-xs font-bold py-1.5 sm:py-2 rounded-xl transition-all duration-150 cursor-pointer">
                Reset All
              </button>
              <button
                @click="confirmFleet"
                :disabled="!isFleetReady"
                class="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-slate-800 disabled:to-slate-800 text-white text-xs font-bold py-1.5 sm:py-2 rounded-xl shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Deploy Fleet
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- 2. PLAYING / BATTLE PHASE -->
      <div v-else-if="gameState.phase === 'playing' || gameState.phase === 'game-over'" class="flex flex-col items-center w-full h-full min-h-0">
        <!-- Mobile Tab Switcher -->
        <div class="flex md:hidden bg-white p-1 rounded-xl mb-3 space-x-1 w-full max-w-[280px] shadow-sm border border-gray-200 flex-shrink-0">
          <button
            @click="activeMobileTab = 'target'"
            :class="activeMobileTab === 'target' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'"
            class="flex-1 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer text-center"
          >
            Fire Control
          </button>
          <button
            @click="activeMobileTab = 'fleet'"
            :class="activeMobileTab === 'fleet' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'"
            class="flex-1 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer text-center"
          >
            Defensive Radar
          </button>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-center gap-6 w-full h-full max-w-5xl min-h-0 overflow-y-auto md:overflow-hidden p-1">
          <!-- TARGET BOARD (SHOTS GRID) -->
          <div
            v-show="activeMobileTab === 'target' || !isMobile"
            class="bg-slate-950 border p-3 rounded-2xl shadow-lg flex flex-col items-center flex-shrink-0 transition-colors duration-300"
            :class="isMyTurn() && !gameOver ? 'border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'border-slate-900'"
          >
            <div class="flex items-center space-x-1.5 mb-2">
              <div class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
              <h3 class="text-xs font-mono font-bold tracking-widest text-rose-400">FIRE CONTROL RADAR</h3>
            </div>

            <div class="grid grid-cols-7 gap-0.5 text-center font-mono text-[9px] sm:text-xs">
              <div class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-600"></div>
              <div v-for="col in 6" :key="`t-col-${col}`" class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 font-bold">
                {{ String.fromCharCode(64 + col) }}
              </div>
              <template v-for="row in 6" :key="`row-${row}`">
                <div class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 font-bold">
                  {{ row }}
                </div>
                <div
                  v-for="col in 6"
                  :key="`cell-${row-1}-${col-1}`"
                  class="w-7 h-7 sm:w-9 sm:h-9 rounded border transition-all duration-150 cursor-pointer relative flex items-center justify-center"
                  :class="getTargetCellClass(row-1, col-1)"
                  @click="shootCell(row-1, col-1)"
                >
                  <!-- Shot Marker -->
                  <div v-if="hasShot(row-1, col-1)" class="w-2 h-2 rounded-full" :class="isHit(row-1, col-1) ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]' : 'bg-gray-400'"></div>
                </div>
              </template>
            </div>
          </div>

          <!-- MY FLEET BOARD -->
          <div
            v-show="activeMobileTab === 'fleet' || !isMobile"
            class="bg-slate-950 border border-slate-900 p-3 rounded-2xl shadow-lg flex flex-col items-center flex-shrink-0"
          >
            <div class="flex items-center space-x-1.5 mb-2">
              <div class="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
              <h3 class="text-xs font-mono font-bold tracking-widest text-cyan-400">DEFENSIVE RADAR</h3>
            </div>

            <div class="grid grid-cols-7 gap-0.5 text-center font-mono text-[9px] sm:text-xs">
              <div class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-600"></div>
              <div v-for="col in 6" :key="`f-col-${col}`" class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 font-bold">
                {{ String.fromCharCode(64 + col) }}
              </div>
              <template v-for="row in 6" :key="`row-${row}`">
                <div class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 font-bold">
                  {{ row }}
                </div>
                <div
                  v-for="col in 6"
                  :key="`cell-${row-1}-${col-1}`"
                  class="w-7 h-7 sm:w-9 sm:h-9 rounded border transition-all duration-150 relative flex items-center justify-center"
                  :class="getMyFleetCellClass(row-1, col-1)"
                >
                  <!-- Enemy Shot Marker -->
                  <div v-if="hasEnemyShot(row-1, col-1)" class="w-2 h-2 rounded-full z-10" :class="isEnemyHit(row-1, col-1) ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]' : 'bg-gray-400'"></div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- GameOver Action Bar -->
    <div class="w-full max-w-lg flex flex-col items-center justify-center py-2 flex-shrink-0">
      <button
        v-if="gameOver"
        @click="newGame"
        :disabled="ready"
        class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {{ ready ? 'Waiting for opponent...' : 'Play Again' }}
      </button>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6 text-gray-600">
    <p class="text-lg font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { Socket } from 'socket.io-client';
import GameHeader from './GameHeader.vue';

interface Player {
  id: string;
  player: number;
  ready: boolean;
}

interface Ship {
  name: string;
  size: number;
  coordinates: [number, number][];
}

interface GameState {
  phase: 'placement' | 'playing' | 'game-over';
  currentPlayer: number;
  winner: string;
  players: Player[];
  p1Placed: boolean;
  p2Placed: boolean;
  p1Ships: Ship[];
  p2Ships: Ship[];
  p1Shots: [number, number][];
  p2Shots: [number, number][];
  lastShotResult: {
    player: number;
    row: number;
    col: number;
    hit: boolean;
    sunkShipName: string | null;
  } | null;
}

export default defineComponent({
  name: 'Battleship',
  components: {
    GameHeader,
  },
  props: {
    socket: {
      type: Object as PropType<Socket | null>,
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
    connectionStatus: {
      type: String,
      required: true,
    },
    initialGameState: {
      type: Object as PropType<GameState>,
      required: true,
    },
  },
  setup() {
    const router = useRouter() as any;
    return { router };
  },
  data() {
    return {
      isLeavingDueToDisconnect: false,
      gameState: this.initialGameState,
      fleet: [
        { name: 'Cruiser', size: 3, coordinates: [] as [number, number][], placed: false },
        { name: 'Destroyer', size: 2, coordinates: [] as [number, number][], placed: false },
        { name: 'Patrol Boat', size: 2, coordinates: [] as [number, number][], placed: false },
      ],
      selectedShipIndex: 0,
      placementOrientation: 'H' as 'H' | 'V',
      hoverCoords: [] as [number, number][],
      activeMobileTab: 'target' as 'target' | 'fleet',
      ready: false,
      isMobile: false,
    };
  },
  computed: {
    isValidGame(): boolean {
      return !!this.gameState && Array.isArray(this.gameState.players);
    },
    gameOver(): boolean {
      return this.gameState.phase === 'game-over';
    },
    hasPlaced(): boolean {
      if (!this.player) return false;
      return this.player === 1 ? this.gameState.p1Placed : this.gameState.p2Placed;
    },
    isFleetReady(): boolean {
      return this.fleet.every((s) => s.placed);
    },
  },
  watch: {
    initialGameState: {
      handler(newVal) {
        if (newVal) {
          this.gameState = newVal;
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    window.addEventListener('keydown', this.handleKeyDown);

    if (this.socket) {
      this.socket.on('game-state', (state: GameState) => {
        this.gameState = state;
        if (state.phase === 'placement') {
          this.ready = false;
        }
      });
      this.socket.on('player-ready', ({ player }: { player: number }) => {
        if (player === this.player) {
          this.ready = true;
        }
      });
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.socket) {
      this.socket.emit('leave-room', { roomKey: this.roomKey });
      this.socket.off('game-state');
      this.socket.off('player-ready');
    }
  },
  beforeRouteLeave(to: any, from: any, next: any) {
    if (this.isLeavingDueToDisconnect || this.router.isLeavingDueToDisconnect) {
      next();
      return;
    }
    if (this.gameState && (this.gameState.phase === 'placement' || this.gameState.phase === 'playing') && this.gameState.players.length === 2) {
      const answer = window.confirm(
        'Are you sure you want to leave the ongoing game? This will disconnect you and end the game.'
      );
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
    handleKeyDown(e: KeyboardEvent) {
      if (this.gameState.phase === 'placement' && e.code === 'Space') {
        e.preventDefault();
        this.placementOrientation = this.placementOrientation === 'H' ? 'V' : 'H';
        if (this.hoverCoords.length > 0) {
          const pivot = this.hoverCoords[0];
          this.onPlacementCellHover(pivot[0], pivot[1]);
        }
      }
    },
    isMyTurn(): boolean {
      return this.player === this.gameState.currentPlayer;
    },
    selectShip(idx: number) {
      this.selectedShipIndex = idx;
    },
    removeShip(idx: number) {
      this.fleet[idx].placed = false;
      this.fleet[idx].coordinates = [];
    },
    resetFleet() {
      this.fleet.forEach((s) => {
        s.placed = false;
        s.coordinates = [];
      });
      this.selectedShipIndex = 0;
    },
    confirmFleet() {
      if (!this.isFleetReady || !this.socket) return;
      this.socket.emit('make-move', {
        roomKey: this.roomKey,
        action: 'place-ships',
        ships: this.fleet.map((s) => ({
          name: s.name,
          size: s.size,
          coordinates: s.coordinates,
        })),
      });
    },
    shootCell(row: number, col: number) {
      if (this.gameOver || !this.isMyTurn() || !this.socket) return;
      if (this.hasShot(row, col)) return;

      this.socket.emit('make-move', {
        roomKey: this.roomKey,
        action: 'shoot',
        row,
        col,
      });
    },
    newGame() {
      if (this.socket) {
        this.socket.emit('new-game', { roomKey: this.roomKey });
      }
    },
    computeCoordinates(r: number, c: number, size: number, orientation: 'H' | 'V'): [number, number][] {
      const coords: [number, number][] = [];
      for (let i = 0; i < size; i++) {
        if (orientation === 'H') {
          coords.push([r, c + i]);
        } else {
          coords.push([r + i, c]);
        }
      }
      return coords;
    },
    onPlacementCellHover(row: number, col: number) {
      const ship = this.fleet[this.selectedShipIndex];
      if (!ship || ship.placed) return;
      this.hoverCoords = this.computeCoordinates(row, col, ship.size, this.placementOrientation);
    },
    onPlacementCellLeave() {
      this.hoverCoords = [];
    },
    isValidPlacement(coords: [number, number][]): boolean {
      const size = this.fleet[this.selectedShipIndex]?.size || 0;
      if (coords.length !== size) return false;
      return coords.every(([r, c]) => {
        if (r < 0 || r > 5 || c < 0 || c > 5) return false;
        // check overlap with other placed ships
        return !this.fleet.some((s) =>
          s.placed && s.coordinates.some(([sr, sc]) => sr === r && sc === c)
        );
      });
    },
    onPlacementCellClick(row: number, col: number) {
      const ship = this.fleet[this.selectedShipIndex];
      if (!ship || ship.placed) return;

      const coords = this.computeCoordinates(row, col, ship.size, this.placementOrientation);
      if (this.isValidPlacement(coords)) {
        ship.coordinates = coords;
        ship.placed = true;
        this.hoverCoords = [];
        // Auto select next unplaced ship
        const nextIdx = this.fleet.findIndex((s) => !s.placed);
        if (nextIdx !== -1) {
          this.selectedShipIndex = nextIdx;
        }
      }
    },
    getPlacementCellClass(row: number, col: number): string {
      const isHovered = this.hoverCoords.some(([r, c]) => r === row && c === col);
      const isOccupied = this.fleet.some((s) =>
        s.placed && s.coordinates.some(([sr, sc]) => sr === row && sc === col)
      );

      if (isOccupied) {
        return 'bg-cyan-700/80 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]';
      }

      if (isHovered) {
        const isValid = this.isValidPlacement(this.hoverCoords);
        return isValid
          ? 'bg-emerald-500/40 border-emerald-400'
          : 'bg-rose-500/40 border-rose-400';
      }

      return 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/30';
    },
    // PLAY PHASE METHODS
    hasShot(row: number, col: number): boolean {
      const shots = this.player === 1 ? this.gameState.p1Shots : this.gameState.p2Shots;
      return shots?.some(([r, c]) => r === row && c === col) || false;
    },
    isHit(row: number, col: number): boolean {
      const opponentShips = this.player === 1 ? this.gameState.p2Ships : this.gameState.p1Ships;
      return opponentShips?.some((s) =>
        s.coordinates.some(([sr, sc]) => sr === row && sc === col)
      ) || false;
    },
    hasEnemyShot(row: number, col: number): boolean {
      const shots = this.player === 1 ? this.gameState.p2Shots : this.gameState.p1Shots;
      return shots?.some(([r, c]) => r === row && c === col) || false;
    },
    isEnemyHit(row: number, col: number): boolean {
      const ownShips = this.player === 1 ? this.gameState.p1Ships : this.gameState.p2Ships;
      return ownShips?.some((s) =>
        s.coordinates.some(([sr, sc]) => sr === row && sc === col)
      ) || false;
    },
    getTargetCellClass(row: number, col: number): string {
      const shot = this.hasShot(row, col);
      if (shot) {
        return this.isHit(row, col)
          ? 'bg-rose-950/40 border-rose-700 shadow-[inset_0_0_12px_rgba(244,63,94,0.4)]'
          : 'bg-slate-900/30 border-slate-800';
      }
      if (this.isMyTurn() && !this.gameOver) {
        return 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-cyan-500/80';
      }
      return 'bg-slate-950/40 border-slate-800/60 cursor-not-allowed';
    },
    getMyFleetCellClass(row: number, col: number): string {
      const ownShips = this.player === 1 ? this.gameState.p1Ships : this.gameState.p2Ships;
      const isShip = ownShips?.some((s) =>
        s.coordinates.some(([sr, sc]) => sr === row && sc === col)
      );
      const enemyShot = this.hasEnemyShot(row, col);

      if (isShip) {
        return enemyShot
          ? 'bg-rose-950 border-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
          : 'bg-cyan-700/60 border-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.2)]';
      }

      if (enemyShot) {
        return 'bg-slate-900 border-slate-800';
      }

      return 'bg-slate-950/30 border-slate-800/60';
    },
  },
});
</script>
