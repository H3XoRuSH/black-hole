<template>
  <div v-if="isValidGame"
    class="flex-grow flex flex-col items-center h-full p-2 sm:p-4 md:p-6 select-none overflow-hidden"
  >
    <div class="w-full max-w-xl flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-2 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <span class="text-xs text-amber-400/80 font-mono tracking-wider">
          {{ solvedCount }}/{{ totalPuzzles }} solved
        </span>
        <span class="text-xs text-slate-600 font-mono">
          Hints: {{ gameState.hintsUsed }}/{{ gameState.maxHints }}
        </span>
      </div>
      <div class="flex items-center space-x-1">
        <button
          @click="openHowToPlay"
          class="text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 p-1.5 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 border border-transparent hover:border-blue-200/50 transition-all"
          title="How to Play"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <router-link to="/menu"
          class="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg cursor-pointer active:scale-95"
          title="Leave Game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </router-link>
      </div>
    </div>

    <div class="flex-grow flex flex-col items-center justify-start w-full overflow-y-auto py-1 custom-scroll">
      <div v-if="!escaped" class="w-full max-w-xl space-y-3">
        <div
          v-if="showIntro"
          class="bg-slate-900/90 border border-amber-700/30 rounded-2xl p-4 sm:p-6 shadow-xl"
        >
          <h2 class="text-lg font-bold text-amber-400 mb-2">{{ gameState.roomName || 'Escape Room' }}</h2>
          <p class="text-xs text-slate-400 mb-4 leading-relaxed">{{ gameState.roomDescription }}</p>
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <p class="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{{ gameState.roomIntro }}</p>
          </div>
          <div class="flex justify-center mt-4">
            <button
              @click="showIntro = false"
              class="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-sm"
            >
              Begin
            </button>
          </div>
        </div>

        <div v-if="!showIntro && currentLocation" class="space-y-3">
          <div class="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 shadow-lg">
            <div class="flex items-center space-x-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm font-bold text-amber-400 uppercase tracking-wider">{{ currentLocation.name }}</span>
            </div>
            <p class="text-xs text-slate-500 italic whitespace-pre-line">{{ currentLocation.description }}</p>
          </div>

          <div class="flex items-center justify-center space-x-2">
            <div
              v-for="loc in sortedLocations"
              :key="loc.id"
              class="flex items-center space-x-1"
            >
              <div
                class="w-2.5 h-2.5 rounded-full transition-colors duration-500"
                :class="locationStatusClass(loc.id)"
              ></div>
              <span v-if="loc.id !== sortedLocations[sortedLocations.length - 1]?.id"
                class="block w-6 sm:w-10 h-px"
                :class="locationLineClass(loc.id)"
              ></span>
            </div>
          </div>

          <div v-if="currentPuzzle" class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold text-amber-500/70 uppercase tracking-widest">
                Puzzle {{ solvedCount + 1 }} of {{ totalPuzzles }}
              </h3>
              <span class="text-xs text-slate-600 font-mono">
                Attempts: {{ gameState.attemptsThisPuzzle }}
              </span>
            </div>

            <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 sm:p-4 mb-4">
              <p class="text-xs text-slate-400 italic mb-2 leading-relaxed whitespace-pre-line">{{ currentPuzzle.narrative }}</p>
              <div class="border-t border-slate-700/30 my-3"></div>
              <p class="text-sm text-slate-200 whitespace-pre-line leading-relaxed">{{ currentPuzzle.question }}</p>
            </div>

            <div v-if="revealedHints.length > 0" class="mb-4 space-y-1.5">
              <div
                v-for="(hint, idx) in revealedHints"
                :key="idx"
                class="bg-amber-900/15 border border-amber-700/20 rounded-lg px-3 py-2 flex items-start space-x-2"
              >
                <span class="text-amber-500 font-bold text-xs flex-shrink-0 mt-px">Hint {{ idx + 1 }}:</span>
                <span class="text-xs text-amber-300/90 leading-relaxed">{{ hint }}</span>
              </div>
            </div>

            <div v-if="!escaped" class="flex items-center space-x-2">
              <input
                v-model="answer"
                type="text"
                placeholder="Type your answer..."
                class="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                @keyup.enter="submitAnswer"
                :disabled="escaped"
              />
              <button
                @click="submitAnswer"
                :disabled="escaped || !answer.trim()"
                class="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-sm flex-shrink-0"
              >
                Submit
              </button>
            </div>

            <div class="flex justify-between items-center mt-3">
              <button
                @click="requestHint"
                :disabled="gameState.hintsUsed >= gameState.maxHints || currentPuzzleHintsRemaining === 0"
                class="text-xs text-amber-400/80 hover:text-amber-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>{{ hintButtonText }}</span>
              </button>
              <span class="text-xs text-slate-600 font-mono">
                Total attempts: {{ gameState.totalMoves }}
              </span>
            </div>
          </div>

          <div v-if="solvedPuzzlesList.length > 0" class="mt-3">
            <button
              @click="showSolvedPuzzles = !showSolvedPuzzles"
              class="w-full flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 hover:text-slate-300 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <span>Previously Solved ({{ solvedPuzzlesList.length }})</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 transition-transform duration-200"
                :class="{ 'rotate-180': showSolvedPuzzles }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="showSolvedPuzzles" class="bg-slate-900/50 border border-slate-800 rounded-xl mt-1 divide-y divide-slate-800/50">
              <div
                v-for="p in solvedPuzzlesList"
                :key="p.id"
                class="px-4 py-2.5"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-emerald-400">{{ getPuzzleLocationName(p) }} — Lock {{ gameState.puzzles.indexOf(p) + 1 }}</span>
                  <span class="text-[10px] text-slate-600 font-mono">Answer: {{ p.answer }}</span>
                </div>
                <p class="text-[11px] text-slate-500 line-clamp-2">{{ p.narrative }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!showIntro && !currentPuzzle && !escaped" class="text-center text-slate-500 py-12">
          <div class="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-sm">Loading puzzles...</p>
        </div>
      </div>

      <div v-if="escaped" class="w-full max-w-xl">
        <div class="bg-slate-900/90 border border-amber-700/30 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
          <div class="text-6xl mb-4">&#x1F513;</div>
          <h2 class="text-2xl font-bold text-amber-400 mb-2">You Escaped!</h2>
          <p class="text-sm text-slate-400 mb-6">The team solved all {{ totalPuzzles }} puzzles and escaped "{{ gameState.roomName }}"!</p>

          <div class="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-4 text-left space-y-1.5">
            <p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Puzzle Summary</p>
            <p
              v-for="(p, idx) in gameState.puzzles"
              :key="p.id"
              class="text-xs flex items-center space-x-2"
            >
              <span :class="p.solved ? 'text-emerald-400' : 'text-red-400'">&#9679;</span>
              <span class="text-slate-300">{{ getPuzzleLocationName(p) }} — Lock {{ idx + 1 }}</span>
              <span class="text-slate-600">
                {{ p.solved ? 'Solved' : 'Unsolved' }}
              </span>
            </p>
          </div>

          <p class="text-xs text-slate-500 mb-4">
            Total attempts: <span class="text-slate-300 font-bold">{{ gameState.totalMoves }}</span> |
            Hints used: <span class="text-slate-300 font-bold">{{ gameState.hintsUsed }}/{{ gameState.maxHints }}</span>
          </p>

          <router-link to="/menu"
            class="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition-all duration-200 cursor-pointer active:scale-95 text-sm"
          >
            Back to Menu
          </router-link>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>

  <HowToPlayModal
    :is-open="isHowToPlayOpen"
    game-id="escape-room"
    @close="closeHowToPlay"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../composables/useGame.js';
import { useToast } from '../composables/useToast.js';
import type { EscapeRoomGameState as GameState, EscapeRoomPuzzle, EscapeRoomLocation } from '../types/shared.js';
import HowToPlayModal from './HowToPlayModal.vue';

export default defineComponent({
  name: 'EscapeRoom',
  components: { HowToPlayModal },
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
        phase: 'playing',
        selectedRoomId: null,
        currentPuzzleIndex: 0,
        puzzles: [],
        locations: [],
        players: [],
        winner: '',
        totalMoves: 0,
        attemptsThisPuzzle: 0,
        hintsUsed: 0,
        maxHints: 5,
        solvedPuzzles: [],
        lastAction: null,
      }
    );

    const { showToast } = useToast();
    const answer = ref('');
    const showIntro = ref(true);
    const showSolvedPuzzles = ref(false);
    const prevSolvedCount = ref(0);
    const localHintCount = ref(0);

    const isHowToPlayOpen = ref(false);
    const openHowToPlay = () => {
      isHowToPlayOpen.value = true;
    };
    const closeHowToPlay = () => {
      isHowToPlayOpen.value = false;
    };

    const getPuzzleLocationName = (puzzle: EscapeRoomPuzzle): string => {
      const loc = gameState.value.locations?.find((l: EscapeRoomLocation) => l.id === puzzle.locationId);
      return loc?.name || puzzle.locationId;
    };

    watch(
      () => gameState.value.solvedPuzzles?.length || 0,
      (newCount) => {
        if (newCount > prevSolvedCount.value && newCount > 0) {
          localHintCount.value = 0;
          const justSolved = gameState.value.puzzles[gameState.value.solvedPuzzles[newCount - 1]];
          if (justSolved) {
            const currentLocId = justSolved.locationId;
            if (newCount > 1) {
              const prevSolved = gameState.value.puzzles[gameState.value.solvedPuzzles[newCount - 2]];
              if (prevSolved && prevSolved.locationId !== currentLocId) {
                const loc = gameState.value.locations?.find((l: EscapeRoomLocation) => l.id === currentLocId);
                const locName = loc?.name || currentLocId;
                showToast(`You entered: ${locName}`, 'success', 3500);
              }
            }
          }
        }
        prevSolvedCount.value = newCount;
      }
    );

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => gameState.value?.phase === 'escaped',
      lobbyRoute: '/escape-room/lobby',
      onGameState: (newState: any) => {
        gameState.value = newState;
        if (newState.totalMoves === 0 && !newState.puzzles?.length) {
          answer.value = '';
          showIntro.value = true;
          showSolvedPuzzles.value = false;
          prevSolvedCount.value = 0;
          localHintCount.value = 0;
        }
      },
    });

    function submitAnswer() {
      if (!props.socket || !answer.value.trim() || gameState.value?.phase === 'escaped') return;
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'submit-answer',
        answer: answer.value.trim(),
      });
      answer.value = '';
    }

    function requestHint() {
      if (!props.socket || gameState.value?.phase === 'escaped') return;
      if (gameState.value.hintsUsed >= gameState.value.maxHints) return;
      const current = gameState.value.puzzles?.find((p: EscapeRoomPuzzle) => !p.solved);
      if (!current) return;
      if (localHintCount.value >= current.hints.length) return;
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'request-hint',
      });
      localHintCount.value++;
    }

    const locationOrder = computed(() => {
      return (gameState.value.locations || []).map((l: EscapeRoomLocation) => l.id);
    });

    return {
      ...game,
      gameState,
      answer,
      showIntro,
      showSolvedPuzzles,
      isHowToPlayOpen,
      openHowToPlay,
      closeHowToPlay,
      submitAnswer,
      requestHint,
      getPuzzleLocationName,
      locationOrder,
      localHintCount,
    };
  },
  computed: {
    isValidGame(): boolean {
      return !!(this.roomKey && this.player && this.gameState.players && this.gameState.players.length >= 1);
    },
    escaped(): boolean {
      return this.gameState.phase === 'escaped';
    },
    currentPuzzle() {
      return this.gameState.puzzles?.find((p: EscapeRoomPuzzle) => !p.solved) || null;
    },
    totalPuzzles(): number {
      return this.gameState.puzzles?.length || 0;
    },
    solvedCount(): number {
      return this.gameState.solvedPuzzles?.length || 0;
    },
    solvedPuzzlesList(): EscapeRoomPuzzle[] {
      return this.gameState.puzzles?.filter((p: EscapeRoomPuzzle) => p.solved) || [];
    },
    currentLocation() {
      if (!this.currentPuzzle) return null;
      return this.gameState.locations?.find((l: EscapeRoomLocation) => l.id === (this.currentPuzzle as EscapeRoomPuzzle).locationId) || null;
    },
    sortedLocations(): EscapeRoomLocation[] {
      const locs = this.gameState.locations || [];
      return this.locationOrder
        .map((id) => locs.find((l: EscapeRoomLocation) => l.id === id))
        .filter(Boolean) as EscapeRoomLocation[];
    },
    revealedHints(): string[] {
      const current = this.currentPuzzle;
      if (!current) return [];
      return current.hints.slice(0, this.localHintCount);
    },
    currentPuzzleHintsRemaining(): number {
      const current = this.currentPuzzle;
      if (!current) return 0;
      return Math.max(0, current.hints.length - this.localHintCount);
    },
    hintButtonText(): string {
      const globalRemaining = (this.gameState.maxHints || 0) - (this.gameState.hintsUsed || 0);
      if (globalRemaining <= 0) return 'No hints left';
      if (this.currentPuzzleHintsRemaining <= 0) return 'No more hints for this puzzle';
      return `Hint (${globalRemaining} global, ${this.currentPuzzleHintsRemaining} here)`;
    },
    locationStatusClass() {
      return (locId: string) => {
        const locPuzzles = this.gameState.puzzles.filter((p: EscapeRoomPuzzle) => p.locationId === locId);
        if (locPuzzles.length === 0) return 'bg-slate-700';
        const allSolved = locPuzzles.every((p: EscapeRoomPuzzle) => p.solved);
        if (allSolved) return 'bg-emerald-500 shadow-md shadow-emerald-500/30';
        const anySolved = locPuzzles.some((p: EscapeRoomPuzzle) => p.solved);
        if (anySolved || (this.currentLocation && this.currentLocation.id === locId)) return 'bg-amber-500 animate-pulse';
        return 'bg-slate-700';
      };
    },
    locationLineClass() {
      return (locId: string) => {
        const idx = this.locationOrder.indexOf(locId);
        const nextId = this.locationOrder[idx + 1];
        if (!nextId) return 'bg-transparent';
        const nextPuzzles = this.gameState.puzzles.filter((p: EscapeRoomPuzzle) => p.locationId === nextId);
        const anyNextSolved = nextPuzzles.length > 0 && nextPuzzles.some((p: EscapeRoomPuzzle) => p.solved);
        if (anyNextSolved) return 'bg-emerald-500';
        const currPuzzles = this.gameState.puzzles.filter((p: EscapeRoomPuzzle) => p.locationId === locId);
        const anyCurrSolved = currPuzzles.length > 0 && currPuzzles.some((p: EscapeRoomPuzzle) => p.solved);
        if (anyCurrSolved) return 'bg-amber-500/50';
        return 'bg-slate-700';
      };
    },
  },
});
</script>

<style>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgb(100 116 139 / 0.3);
  border-radius: 999px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgb(100 116 139 / 0.5);
}

@media (hover: none) and (pointer: coarse) {
  .custom-scroll {
    scrollbar-width: none;
  }
}
</style>
