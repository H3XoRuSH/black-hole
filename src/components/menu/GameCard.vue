<template>
  <!-- List variant -->
  <div v-if="variant === 'list'"
    class="card-3d card-3d--list bg-white dark:bg-neo-card-bg neo-border neo-shadow-sm p-5 flex items-center justify-between border-l-8 rounded-none text-neo-text"
    :style="{ borderLeftColor: game.color }">
    <div class="flex-grow pr-4">
      <div class="flex items-center space-x-2 mb-1 min-w-0">
        <div v-if="game.icon" class="w-7 h-7 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
        <h2 class="text-base sm:text-lg font-black uppercase text-neo-text truncate">{{ game.name }}</h2>
        <span v-if="game.supportsAI" class="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-neo-muted neo-border-2 text-black flex-shrink-0">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-neo-secondary neo-border-2 text-black flex-shrink-0">Single Player</span>
      </div>
      <p class="text-neo-text/70 text-xs sm:text-sm line-clamp-2 leading-relaxed font-bold">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      :disabled="isAnyGameHosting"
      class="flex-shrink-0 text-white font-black uppercase tracking-wider py-2 px-4 neo-btn rounded-none text-xs sm:text-sm transition-all duration-100 text-center block disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 touch-target"
      :style="{ backgroundColor: game.color }">
      <template v-if="isHosting">
        <span class="flex items-center justify-center gap-1.5">Hosting<WaitingIndicator /></span>
      </template>
      <template v-else>
        Host
      </template>
    </button>
  </div>

  <!-- Grid variant -->
  <div v-else-if="variant === 'grid'"
    class="card-3d card-3d--grid bg-white dark:bg-neo-card-bg neo-border neo-shadow-sm p-4 sm:p-5 flex flex-col justify-between h-[230px] border-t-8 rounded-none text-neo-text"
    :style="{ borderTopColor: game.color }">
    <div>
      <div class="flex items-center justify-between mb-2 min-w-0">
        <div class="flex items-center space-x-1.5 min-w-0">
          <div v-if="game.icon" class="w-5 h-5 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
          <h2 class="text-sm sm:text-base font-black uppercase text-neo-text line-clamp-1">{{ game.name }}</h2>
        </div>
        <span v-if="game.supportsAI" class="px-1.5 py-0.2 text-[8px] font-black uppercase rounded-full bg-neo-muted neo-border-2 text-black flex-shrink-0 ml-1">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-1.5 py-0.2 text-[8px] font-black uppercase rounded-full bg-neo-secondary neo-border-2 text-black flex-shrink-0 ml-1">Single Player</span>
      </div>
      <p class="text-neo-text/70 text-[11px] sm:text-xs leading-relaxed line-clamp-4 font-bold">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      :disabled="isAnyGameHosting"
      class="w-full text-white font-black uppercase tracking-wider py-2 px-3 neo-btn rounded-none text-xs sm:text-sm transition-all duration-100 text-center block mt-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 touch-target"
      :style="{ backgroundColor: game.color }">
      <template v-if="isHosting">
        <span class="flex items-center justify-center gap-1.5">Hosting<WaitingIndicator /></span>
      </template>
      <template v-else>
        Host
      </template>
    </button>
  </div>

  <!-- Carousel variant (default) -->
  <div v-else
    class="card-3d card-3d--carousel bg-white dark:bg-neo-card-bg neo-border neo-shadow p-6 sm:p-8 flex flex-col justify-between h-[360px] relative border-t-8 rounded-none text-neo-text"
    :style="{ borderTopColor: game.color }">
    <div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2.5 min-w-0">
          <div v-if="game.icon" class="w-8 h-8 flex-shrink-0" :style="{ color: game.color }" v-html="game.icon"></div>
          <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-neo-text truncate">{{ game.name }}</h2>
        </div>
        <span v-if="game.supportsAI" class="px-2.5 py-0.5 text-xs font-black uppercase rounded-full bg-neo-muted neo-border-2 text-black flex-shrink-0 ml-1">Play vs AI</span>
        <span v-if="game.singlePlayer" class="px-2.5 py-0.5 text-xs font-black uppercase rounded-full bg-neo-secondary neo-border-2 text-black flex-shrink-0 ml-1">Single Player</span>
      </div>
      <p class="text-neo-text/80 text-sm sm:text-base leading-relaxed font-bold">{{ game.description }}</p>
    </div>
    <button @click="$emit('select-game', game.id)"
      :disabled="isAnyGameHosting"
      class="w-full text-white font-black uppercase tracking-wider py-3.5 px-4 neo-btn rounded-none transition-all duration-100 text-center block disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 touch-target"
      :style="{ backgroundColor: game.color }">
      <template v-if="isHosting">
        <span class="flex items-center justify-center gap-1.5">Hosting<WaitingIndicator /></span>
      </template>
      <template v-else>
        Host Game
      </template>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { MenuGame } from '../../types/shared.js';
import WaitingIndicator from '../ui/WaitingIndicator.vue';

export default defineComponent({
  name: 'GameCard',
  components: { WaitingIndicator },
  inject: {
    getHostingGameId: {
      from: 'getHostingGameId',
      default: () => () => '',
    },
  },
  props: {
    game: {
      type: Object as PropType<MenuGame>,
      required: true,
    },
    variant: {
      type: String as PropType<'carousel' | 'list' | 'grid'>,
      default: 'carousel',
    },
  },
  emits: ['select-game'],
  computed: {
    isHosting(): boolean {
      return this.getHostingGameId() === this.game.id;
    },
    isAnyGameHosting(): boolean {
      return this.getHostingGameId() !== '';
    },
  },
});
</script>

<style scoped>
.card-3d {
  box-shadow:
    6px 5px 0 rgba(0,0,0,0.08),
    11px 12px 0 rgba(0,0,0,0.05),
    17px 16px 0 rgba(0,0,0,0.03);
  transition: box-shadow 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-3d:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    8px 7px 0 rgba(0,0,0,0.1),
    14px 15px 0 rgba(0,0,0,0.07),
    22px 21px 0 rgba(0,0,0,0.04);
}

.card-3d--grid {
  box-shadow:
    6px 6px 0 rgba(0,0,0,0.08),
    9px 9px 0 rgba(0,0,0,0.05),
    13px 13px 0 rgba(0,0,0,0.03);
}

.card-3d--grid:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow:
    6px 6px 0 rgba(0,0,0,0.1),
    9px 9px 0 rgba(0,0,0,0.07),
    13px 13px 0 rgba(0,0,0,0.04);
}

.card-3d.card-3d--list:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow:
    8px 7px 0 rgba(0,0,0,0.1),
    14px 15px 0 rgba(0,0,0,0.07),
    22px 21px 0 rgba(0,0,0,0.04);
}

.card-3d--carousel:hover {
  transform: none;
  animation: wiggle 0.7s ease;
}

.dark .card-3d {
  box-shadow:
    6px 5px 0 rgba(0,0,0,0.16),
    11px 12px 0 rgba(0,0,0,0.12),
    17px 16px 0 rgba(0,0,0,0.08);
}

.dark .card-3d:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    8px 7px 0 rgba(0,0,0,0.22),
    14px 15px 0 rgba(0,0,0,0.16),
    22px 21px 0 rgba(0,0,0,0.1);
}

.dark .card-3d--grid {
  box-shadow:
    6px 6px 0 rgba(0,0,0,0.16),
    9px 9px 0 rgba(0,0,0,0.12),
    13px 13px 0 rgba(0,0,0,0.08);
}

.dark .card-3d--grid:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow:
    6px 6px 0 rgba(0,0,0,0.22),
    9px 9px 0 rgba(0,0,0,0.16),
    13px 13px 0 rgba(0,0,0,0.1);
}

.dark .card-3d.card-3d--list:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow:
    8px 7px 0 rgba(0,0,0,0.22),
    14px 15px 0 rgba(0,0,0,0.16),
    22px 21px 0 rgba(0,0,0,0.1);
}

.dark .card-3d--carousel:hover {
  transform: none;
  animation: wiggle 0.7s ease;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-0.4deg); }
  60% { transform: rotate(0.4deg); }
}
</style>
