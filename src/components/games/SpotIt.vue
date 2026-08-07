<template>
  <div class="pattern-hunt-page flex flex-col select-none bg-transparent text-neo-text">
    <header class="pattern-header">
      <div class="pattern-topbar w-full flex items-center justify-between mb-2">
        <button
          type="button"
          @click="isHowToPlayOpen = true"
          class="text-neo-text/70 hover:text-neo-muted transition-colors p-1.5 rounded-none flex items-center justify-center cursor-pointer neo-border-2 flex-shrink-0 bg-white dark:bg-neo-card-bg shadow-sm"
          title="How to Play"
          aria-label="How to Play"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <div class="pattern-title-wrap flex items-center justify-center flex-grow space-x-2.5">
          <img src="/icons/pattern-hunt.svg" alt="" class="pattern-title-icon w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
          <h1 class="pattern-title text-2xl sm:text-3xl font-black uppercase text-neo-text tracking-tighter text-center">
            Pattern Hunt
          </h1>
        </div>

        <router-link
          to="/menu"
          class="text-neo-text/70 hover:text-neo-accent transition-colors p-1.5 rounded-none flex items-center justify-center cursor-pointer neo-border-2 flex-shrink-0 bg-white dark:bg-neo-card-bg shadow-sm"
          title="Leave Game"
          aria-label="Leave game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </router-link>
      </div>

      <div class="scoreboard" aria-label="Player scores">
        <div class="score-list">
          <div
            v-for="(entry, index) in leaderboard"
            :key="entry.player"
            class="score-card"
            :class="entry.player === player ? 'score-card-me' : index === 0 ? 'score-card-leading' : ''"
          >
            <span class="player-dot" :class="playerDotClass(entry.player)"></span>
            <span class="score-name">{{ entry.name }}</span>
            <span class="score-value">{{ entry.score }}</span>
          </div>
        </div>
        <div class="score-meta">
          <span>Stack {{ gameState.remainingCards ?? 0 }}</span>
          <span>Claims {{ gameState.totalMoves ?? 0 }}</span>
        </div>
      </div>
    </header>

    <main class="pattern-main">
      <div class="game-panel card-stage flex flex-col p-3 sm:p-5">
          <div class="mb-3 flex items-end justify-between gap-3 sm:mb-4">
            <div>
              <p class="eyebrow text-neo-accent">Shared target</p>
              <h2 class="panel-title">Global Card</h2>
            </div>
          </div>

          <div v-if="centerCard" class="pattern-card center-card relative">
            <transition name="fade">
              <div
                v-if="countdown > 0"
                class="absolute inset-0 z-30 flex items-center justify-center rounded-full bg-black/85 text-white backdrop-blur-sm p-4 text-center select-none"
              >
                <div class="text-6xl sm:text-8xl font-black text-neo-accent animate-pulse drop-shadow-md">
                  {{ countdown }}
                </div>
              </div>
            </transition>

            <div class="image-orbit" :class="countdown > 0 ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'">
              <button
                v-for="(imageId, index) in centerCard.imageIds"
                :key="`center-${imageId}`"
                type="button"
                class="image-button"
                :class="symbolButtonClass()"
                :style="symbolSlotStyle(index)"
                :disabled="!canClaim || countdown > 0"
                :aria-label="`Select ${imageFor(imageId).label} on the center card`"
                @click="claimImage(imageId)"
              >
                <PatternSymbol
                  :image="imageFor(imageId)"
                  :scale="symbolVariation(imageId, centerCard.id).scale"
                  :rotation-offset="symbolVariation(imageId, centerCard.id).rotationOffset"
                />
                <span class="sr-only">{{ imageFor(imageId).label }}</span>
              </button>
            </div>
          </div>
          <div v-else class="empty-card">
            <span class="text-4xl font-black text-neo-accent">+</span>
            <span class="mt-2 text-sm font-black uppercase tracking-wider">Stack empty</span>
            <span class="text-xs font-bold text-neo-text/55">The match is complete.</span>
          </div>

          <p v-if="penaltySeconds > 0" class="mt-3 text-center text-xs font-black uppercase tracking-wider text-neo-accent animate-pulse" aria-live="polite">
            Wrong image. Wait {{ penaltySeconds }}s
          </p>
        </div>

        <div class="game-panel card-stage flex flex-col p-3 sm:p-5">
          <div class="mb-3 flex items-end justify-between gap-3 sm:mb-4">
            <div>
              <p class="eyebrow text-neo-secondary">Current personal card</p>
              <h2 class="panel-title">{{ currentPlayerName }}</h2>
            </div>
          </div>

          <div v-if="myCard" class="pattern-card player-card">
            <div class="image-orbit">
              <button
                v-for="(imageId, index) in myCard.imageIds"
                :key="`mine-${imageId}`"
                type="button"
                class="image-button"
                :class="symbolButtonClass()"
                :style="symbolSlotStyle(index)"
                :disabled="!canClaim || countdown > 0"
                :aria-label="`Select ${imageFor(imageId).label} on your card`"
                @click="claimImage(imageId)"
              >
                <PatternSymbol
                  :image="imageFor(imageId)"
                  :scale="symbolVariation(imageId, myCard.id).scale"
                  :rotation-offset="symbolVariation(imageId, myCard.id).rotationOffset"
                />
                <span class="sr-only">{{ imageFor(imageId).label }}</span>
              </button>
            </div>
          </div>
          <div v-else class="empty-card">
            <span class="text-sm font-black uppercase tracking-wider">Waiting for cards</span>
            <span class="text-xs font-bold text-neo-text/55">Your next round will appear here.</span>
          </div>
        </div>
    </main>

    <transition name="fade">
      <div v-if="gameOver" class="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]">
        <div class="game-over-card w-full max-w-md p-5 text-center sm:p-8">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-4 border-black bg-neo-secondary text-4xl font-black text-black shadow-[5px_5px_0_0_var(--neo-shadow)]">!</div>
          <p class="eyebrow text-neo-accent">Match complete</p>
          <h2 class="mt-1 text-2xl font-black uppercase tracking-tight sm:text-3xl">Final Standings</h2>
          <p class="mt-3 text-sm font-bold leading-relaxed text-neo-text/70">{{ gameState.winner }}</p>

          <div class="mt-5 space-y-2 text-left">
            <div v-for="(entry, index) in leaderboard" :key="`final-${entry.player}`" class="leader-row" :class="entry.player === player ? 'leader-row-me' : ''">
              <span class="rank-number">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-black">{{ entry.name }}</p>
              </div>
              <strong class="text-lg font-black">{{ entry.score }}</strong>
            </div>
          </div>

          <div class="mt-6">
            <WaitingIndicator v-if="ready" />
            <p v-if="ready" class="mt-2 text-xs font-black uppercase tracking-wider text-neo-text/60">
              Waiting for the other players to ready up
            </p>
            <button
              v-else
              type="button"
              class="neo-btn w-full bg-neo-accent px-4 py-3 text-sm font-black uppercase tracking-wider text-white"
              @click="newGame"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </transition>

    <HowToPlayModal
      :is-open="isHowToPlayOpen"
      game-id="spot-it"
      @close="isHowToPlayOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, PropType, ref, watch } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../../composables/useGame.js';
import { useConfetti } from '../../composables/useConfetti.js';
import type { SpotItCard, SpotItGameState, SpotItImage } from '../../types/shared.js';
import { SPOT_IT_IMAGE_BY_ID } from '../../assets/spotItImages.js';
import HowToPlayModal from '../modals/HowToPlayModal.vue';
import PatternSymbol from './PatternSymbol.vue';
import WaitingIndicator from '../ui/WaitingIndicator.vue';

const createEmptyState = (): SpotItGameState => ({
  phase: 'lobby',
  activeCards: {},
  centerCard: null,
  drawPile: [],
  remainingCards: 0,
  penaltyUntil: {},
  scores: {},
  winner: '',
  players: [],
  currentPlayer: 0,
  totalMoves: 0,
});

export default defineComponent({
  name: 'SpotIt',
  components: { HowToPlayModal, PatternSymbol, WaitingIndicator },
  emits: ['update-connection-status', 'update-player', 'update-room-key'],
  props: {
    socket: { type: Object as PropType<Socket>, required: true },
    player: { type: Number, required: true },
    roomKey: { type: String, required: true },
    initialGameState: { type: Object as PropType<SpotItGameState>, required: true },
    connectionStatus: String,
  },
  setup(props) {
    const gameState = ref<SpotItGameState>(props.initialGameState || createEmptyState());
    const isHowToPlayOpen = ref(false);
    const penaltyRemainingMs = ref(0);
    const countdown = ref(0);
    let penaltyTimer: ReturnType<typeof setInterval> | null = null;
    let countdownTimer: ReturnType<typeof setInterval> | null = null;
    let hasTriggeredInitialCountdown = false;

    function triggerCountdown(): void {
      if (countdownTimer) clearInterval(countdownTimer);
      countdown.value = 3;
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          if (countdownTimer) clearInterval(countdownTimer);
          countdownTimer = null;
        }
      }, 1000);
    }

    if (gameState.value.phase === 'playing' && (gameState.value.totalMoves ?? 0) === 0 && !hasTriggeredInitialCountdown) {
      hasTriggeredInitialCountdown = true;
      triggerCountdown();
    }

    function clearPenalty(): void {
      if (penaltyTimer) {
        clearInterval(penaltyTimer);
        penaltyTimer = null;
      }
      penaltyRemainingMs.value = 0;
    }

    function startPenalty(durationMs: number): void {
      clearPenalty();
      const penaltyEndsAt = Date.now() + Math.max(0, durationMs);
      const updatePenalty = () => {
        penaltyRemainingMs.value = Math.max(0, penaltyEndsAt - Date.now());
        if (penaltyRemainingMs.value === 0) clearPenalty();
      };
      updatePenalty();
      if (penaltyRemainingMs.value > 0) {
        penaltyTimer = setInterval(updatePenalty, 100);
      }
    }

    function handlePenaltyApplied({ durationMs }: { durationMs?: number }): void {
      startPenalty(durationMs || 3000);
    }

    props.socket.on('penalty-applied', handlePenaltyApplied);
    const initialPenaltyUntil = gameState.value.penaltyUntil?.[props.player] || 0;
    if (initialPenaltyUntil > Date.now()) startPenalty(initialPenaltyUntil - Date.now());

    const confetti = useConfetti();
    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => !!gameState.value?.winner,
      lobbyRoute: '/spot-it/lobby',
      onGameState: (newState: SpotItGameState, helpers) => {
        gameState.value = newState;
        if (newState.phase === 'playing' && newState.totalMoves === 0) {
          clearPenalty();
          helpers.setReady(false);
          helpers.setOtherReady(false);
          if (!hasTriggeredInitialCountdown) {
            hasTriggeredInitialCountdown = true;
            triggerCountdown();
          }
        } else if (newState.phase !== 'playing') {
          clearPenalty();
          hasTriggeredInitialCountdown = false;
        } else {
          const penaltyUntil = newState.penaltyUntil?.[props.player] || 0;
          if (penaltyUntil > Date.now()) startPenalty(penaltyUntil - Date.now());
        }
      },
    });

    const myCard = computed<SpotItCard | null>(() => gameState.value.activeCards?.[props.player] || null);
    const centerCard = computed<SpotItCard | null>(() => gameState.value.centerCard || null);
    const penaltySeconds = computed(() => Math.ceil(penaltyRemainingMs.value / 1000));
    const canClaim = computed(() => gameState.value.phase === 'playing' && penaltyRemainingMs.value === 0 && !!myCard.value && !!centerCard.value);
    const gameOver = computed(() => gameState.value.phase === 'game-over' || !!gameState.value.winner);
    const currentPlayerName = computed(() => {
      const player = gameState.value.players.find((entry) => entry.player === props.player);
      return player?.name || `Player ${props.player}`;
    });
    const leaderboard = computed(() => {
      return [...(gameState.value.players || [])]
        .map((player) => ({
          player: player.player,
          name: player.name || `Player ${player.player}`,
          score: gameState.value.scores?.[player.player] || 0,
        }));
    });

    function imageFor(imageId: string): SpotItImage {
      return SPOT_IT_IMAGE_BY_ID[imageId] || {
        id: imageId,
        label: 'Unknown pattern',
        shape: 'circle',
        color: '#64748b',
        rotation: 0,
      };
    }

    function symbolSlotStyle(index: number): Record<string, string> {
      if (index === 0) {
        return {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        };
      }
      const angle = (-90 + (index - 1) * (360 / 7)) * (Math.PI / 180);
      const radius = 32;
      return {
        left: `${50 + Math.cos(angle) * radius}%`,
        top: `${50 + Math.sin(angle) * radius}%`,
        transform: 'translate(-50%, -50%)',
      };
    }

    function symbolVariation(imageId: string, cardId: string): { scale: number; rotationOffset: number } {
      const seed = `${cardId}:${imageId}`;
      let hash = 0;
      for (let index = 0; index < seed.length; index++) {
        hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
      }
      return {
        scale: 0.75 + (hash % 31) / 100,
        rotationOffset: (Math.floor(hash / 31) % 41) - 20,
      };
    }

    function symbolButtonClass(): string {
      if (!canClaim.value) return 'image-button-disabled';
      return 'image-button-ready';
    }

    function playerDotClass(playerNumber: number): string {
      const classes = ['dot-coral', 'dot-yellow', 'dot-green', 'dot-blue', 'dot-purple', 'dot-pink', 'dot-orange', 'dot-teal'];
      return classes[(playerNumber - 1) % classes.length];
    }

    let lastClaimTime = 0;

    function claimImage(imageId: string): void {
      const now = Date.now();
      if (now - lastClaimTime < 250) return;
      if (!canClaim.value || !props.socket || !myCard.value || !centerCard.value) return;
      lastClaimTime = now;
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'claim',
        imageId,
        activeCardId: myCard.value.id,
        centerCardId: centerCard.value.id,
      });
    }

    watch(
      () => gameState.value.phase,
      (phase, previousPhase) => {
        if (phase === 'game-over' && previousPhase !== 'game-over') {
          confetti.fire();
        }
      },
    );

    onBeforeUnmount(() => {
      if (countdownTimer) clearInterval(countdownTimer);
      clearPenalty();
      props.socket.off('penalty-applied', handlePenaltyApplied);
    });

    return {
      ...game,
      gameState,
      isHowToPlayOpen,
      myCard,
      centerCard,
      canClaim,
      penaltySeconds,
      countdown,
      gameOver,
      currentPlayerName,
      leaderboard,
      imageFor,
      symbolSlotStyle,
      symbolVariation,
      symbolButtonClass,
      playerDotClass,
      claimImage,
    };
  },
});
</script>

<style scoped>
.game-panel,
.game-over-card {
  border: 4px solid var(--neo-border);
  background: var(--neo-card-bg);
  box-shadow: 7px 7px 0 var(--neo-shadow);
}

.game-over-card {
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
}

.eyebrow {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.17em;
  line-height: 1;
  text-transform: uppercase;
}

.panel-title {
  margin-top: 0.35rem;
  font-size: clamp(1.1rem, 2.4vw, 1.55rem);
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: -0.03em;
}

.pattern-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 30rem);
  aspect-ratio: 1;
  min-height: 0;
  margin-inline: auto;
  overflow: hidden;
  border: 4px solid var(--neo-border);
  border-radius: 50%;
  background-color: var(--neo-card-bg);
  background-image: radial-gradient(var(--neo-text) 0.8px, transparent 0.8px);
  background-size: 17px 17px;
  box-shadow: inset 0 0 0 5px color-mix(in srgb, var(--neo-card-bg) 70%, transparent);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.pattern-card::before {
  position: absolute;
  inset: 0.45rem;
  border: 2px dashed color-mix(in srgb, var(--neo-text) 30%, transparent);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.center-card {
  width: min(100%, 31rem);
  background-color: #fff4d6;
}

.dark .center-card {
  background-color: #2b251a;
}

.player-card {
  width: min(100%, 25rem);
  background-color: #e8f7f0;
}

.dark .player-card {
  background-color: #1a2a23;
}

.image-orbit {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.image-button {
  position: absolute;
  display: flex;
  width: 26%;
  height: 26%;
  aspect-ratio: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  overflow: visible;
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), filter 0.15s ease;
}

.dark .image-button {
  background: transparent;
  border: none;
}

.image-button-ready:hover {
  background: transparent;
  box-shadow: none;
  transform: translate(-50%, -50%) scale(1.18);
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--neo-accent) 80%, white));
}

.dark .image-button-ready:hover {
  background: transparent;
  box-shadow: none;
  transform: translate(-50%, -50%) scale(1.18);
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--neo-accent) 80%, white));
}

.image-button-ready:active {
  box-shadow: none;
}

.image-button-disabled {
  cursor: default;
  opacity: 0.88;
}

.empty-card {
  display: flex;
  width: min(100%, 25rem);
  aspect-ratio: 1;
  min-height: 0;
  margin-inline: auto;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 4px dashed var(--neo-border);
  border-radius: 50%;
  background: color-mix(in srgb, var(--neo-muted) 12%, transparent);
}

.leader-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.55rem;
  border: 2px solid color-mix(in srgb, var(--neo-border) 30%, transparent);
  padding: 0.55rem 0.6rem;
}

.leader-row-me {
  border-color: var(--neo-accent);
  background: color-mix(in srgb, var(--neo-accent) 12%, transparent);
}

.rank-number {
  width: 1.5rem;
  color: color-mix(in srgb, var(--neo-text) 50%, transparent);
  font-family: monospace;
  font-size: 0.7rem;
  font-weight: 900;
}

.player-dot {
  height: 0.7rem;
  width: 0.7rem;
  flex: none;
  border: 1px solid #12201c;
  border-radius: 999px;
}

.dot-coral { background: #ef476f; }
.dot-yellow { background: #eab308; }
.dot-green { background: #22c55e; }
.dot-blue { background: #0ea5e9; }
.dot-purple { background: #6366f1; }
.dot-pink { background: #d946ef; }
.dot-orange { background: #f97316; }
.dot-teal { background: #14b8a6; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 479px) {
  .pattern-card {
    width: min(100%, 19rem);
  }

  .center-card {
    width: min(100%, 19rem);
  }

  .player-card {
    width: min(100%, 17rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .image-button {
    transition: none;
  }
}

/* Keep the live game on one viewport-sized vertical surface. */
.pattern-hunt-page {
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  padding-inline: clamp(0.5rem, 2vw, 1.5rem);
  padding-top: clamp(0.75rem, 2dvh, 1.5rem);
  padding-bottom: clamp(0.5rem, 1.5dvh, 1rem);
}

.pattern-header {
  display: flex;
  width: 100%;
  max-width: 32rem;
  min-height: 10dvh;
  margin-inline: auto;
  flex: 0 0 auto;
  flex-direction: column;
}

.pattern-topbar {
  display: flex;
  min-height: clamp(2.4rem, 5dvh, 3.25rem);
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  flex: 0 0 auto;
}

.topbar-button {
  display: flex;
  width: 1.75rem;
  height: 1.75rem;
  flex: none;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: color-mix(in srgb, var(--neo-text) 55%, transparent);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.topbar-button:hover {
  color: var(--neo-text);
  background: color-mix(in srgb, var(--neo-text) 10%, transparent);
}

.pattern-title-wrap {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.pattern-title-icon {
  width: 1.9rem;
  height: 1.9rem;
  flex: none;
}

.pattern-title {
  overflow: hidden;
  font-size: clamp(1rem, 3.6vw, 1.65rem);
  font-weight: 900;
  line-height: 1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.pattern-subtitle {
  overflow: hidden;
  max-width: 12rem;
  margin-top: 0.18rem;
  color: color-mix(in srgb, var(--neo-text) 55%, transparent);
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  line-height: 1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.scoreboard {
  display: flex;
  min-width: 0;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: stretch;
  gap: 0.2rem;
  overflow: visible;
  padding: 0.15rem 0.1rem 0.3rem;
}

.score-list {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  overflow-x: auto;
  padding-inline: 0.1rem;
  scrollbar-width: none;
}

.score-list::-webkit-scrollbar {
  display: none;
}

.score-card {
  display: flex;
  min-width: 0;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.35rem;
  border: 2px solid #000;
  background: var(--neo-card-bg);
  padding: 0.3rem 0.55rem;
  color: var(--neo-text);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
}

.score-card-me {
  background: var(--neo-accent);
  color: #000;
}

.score-card-leading:not(.score-card-me) {
  background: var(--neo-secondary);
  color: #000;
}

.score-name {
  max-width: 7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-value {
  margin-left: 0.15rem;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 900;
}

.score-meta {
  display: flex;
  flex: 0 0 auto;
  align-self: center;
  gap: 0.5rem;
  color: color-mix(in srgb, var(--neo-text) 55%, transparent);
  font-family: monospace;
  font-size: 0.58rem;
  font-weight: 900;
  white-space: nowrap;
}

.pattern-main {
  display: flex;
  width: 100%;
  max-width: 32rem;
  min-height: 0;
  margin-inline: auto;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 1dvh;
  overflow-x: hidden;
  overflow-y: auto;
  padding-block: 0.5dvh 1dvh;
}

.pattern-main .card-stage {
  display: flex;
  width: 100%;
  min-height: 0;
  flex: 1 1 0;
  align-items: center;
  justify-content: flex-start;
  gap: 0.3rem;
  container-type: size;
  overflow: hidden;
  border: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.card-stage > div:first-child {
  display: flex;
  width: 100%;
  max-width: min(100cqw - 0.5rem, 32rem);
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
}

.card-stage .panel-title {
  margin-top: 0.2rem;
  font-size: clamp(0.9rem, 2.6vw, 1.35rem);
}

.card-stage > .pattern-card,
.card-stage > .empty-card {
  width: min(37dvh, calc(100cqh - 3.5rem), calc(100cqw - 1rem), 42rem);
  height: min(37dvh, calc(100cqh - 3.5rem), calc(100cqw - 1rem), 42rem);
  max-width: 100%;
  max-height: 100%;
  min-height: 0;
  flex: 0 0 auto;
}

.card-stage > p {
  min-height: 1rem;
  margin: 0;
  font-size: 0.58rem;
  line-height: 1;
}

@media (max-width: 480px) {
  .pattern-hunt-page {
    padding-inline: 0.35rem;
  }

  .pattern-title-icon {
    width: 1.6rem;
    height: 1.6rem;
  }

  .topbar-button {
    width: 2rem;
    height: 2rem;
  }

  .score-card {
    padding-inline: 0.45rem;
    font-size: 0.6rem;
  }

  .score-list {
    justify-content: flex-start;
  }

  .score-name {
    max-width: 4.5rem;
  }

  .score-meta {
    font-size: 0.52rem;
  }
}
</style>
