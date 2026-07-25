<template>
  <BaseModal
    :is-open="isOpen"
    title="Select Escape Room"
    subtitle="Choose your adventure"
    max-width="max-w-2xl"
    :theme="theme"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <!-- Search & Filter -->
      <div class="sticky top-0 z-10 flex gap-2 mt-1 bg-white dark:bg-neo-card-bg pb-2">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neo-text/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search rooms..."
            class="w-full pl-10 pr-4 py-2.5 text-sm neo-input rounded-none placeholder:text-neo-text/40"
          />
        </div>
        <select
          v-model="difficultyFilter"
          class="shrink-0 text-sm neo-input rounded-none px-3 py-2.5 cursor-pointer"
        >
          <option value="">All Difficulties</option>
          <option value="very-easy">Very Easy</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="extreme">Extreme</option>
        </select>
      </div>

      <!-- Room Grid -->
      <div v-if="sortedRooms.length === 0" class="text-center py-12 text-sm text-neo-text/60">
        No rooms match your search
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 custom-scroll">

        <button
          v-for="room in sortedRooms"
          :key="room.id"
          @click="selectRoom(room.id)"
          class="group text-left rounded-none neo-border bg-white dark:bg-neo-card-bg transition-all duration-100 focus:outline-none cursor-pointer p-0 text-neo-text"
          :class="room.id === selectedRoomId ? 'bg-neo-secondary/30 neo-shadow' : 'hover:neo-shadow-sm'"
        >
          <!-- Theme Image -->
          <div
            class="relative aspect-[16/9] flex items-center justify-center overflow-hidden"
            :class="themeGradient(room.id)"
          >
            <img
              v-if="roomImage(room.id)"
              :src="roomImage(room.id)"
              :alt="room.name"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              :class="imagesLoaded[room.id] ? 'opacity-100' : 'opacity-0'"
              @load="onImageLoad(room.id)"
            />
            <div
              v-if="roomImage(room.id) && !imagesLoaded[room.id]"
              class="absolute inset-0 flex items-center justify-center bg-black/40 z-10"
            >
              <span class="text-white text-3xl font-bold animate-pulse select-none">...</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div class="absolute bottom-2 right-2 z-10">
              <svg class="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          </div>

          <!-- Room Info -->
          <div class="p-3 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-black text-sm uppercase tracking-wide truncate text-neo-text">{{ room.name }}</h3>
              <span
                class="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                :class="difficultyBadgeClass(room.difficulty)"
              >
                {{ difficultyLabel(room.difficulty) }}
              </span>
            </div>
            <p class="text-xs leading-relaxed line-clamp-2 text-neo-text/80 font-bold">{{ room.description }}</p>
            <div :class="starColor(room.difficulty)" class="text-sm leading-none">
              {{ roomStars(room.difficulty) }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-neo-text/70">{{ sortedRooms.length }} room{{ sortedRooms.length !== 1 ? 's' : '' }}</span>
        <button
          @click="$emit('close')"
          class="text-sm font-black px-5 py-2 rounded-none transition-all duration-100 cursor-pointer bg-white dark:bg-neo-card-bg text-neo-text neo-btn uppercase tracking-wider"
        >
          Cancel
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import BaseModal from '../ui/BaseModal.vue';
import { getRoomImage } from '../../utils/escapeRoomImages.js';

export default defineComponent({
  components: { BaseModal },
  props: {
    isOpen: Boolean,
    availableRooms: {
      type: Array,
      default: () => [],
    },
    selectedRoomId: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      default: 'dark',
      validator: (v: string) => ['dark', 'light'].includes(v),
    },
  },
  emits: ['close', 'select-room'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const difficultyFilter = ref('');
    const imagesLoaded = ref<Record<string, boolean>>({});

    const onImageLoad = (id: string) => {
      imagesLoaded.value[id] = true;
    };

    const difficultyOrder: Record<string, number> = {
      'very-easy': 0,
      'easy': 1,
      'medium': 2,
      'hard': 3,
      'extreme': 4,
    };

    const sortedRooms = computed(() => {
      const rooms = (props.availableRooms as any[]) || [];
      const q = searchQuery.value.toLowerCase().trim();
      const df = difficultyFilter.value;
      return rooms
        .filter((r) => {
          if (df && r.difficulty !== df) return false;
          if (!q) return true;
          return (
            r.name.toLowerCase().includes(q)
            || r.description.toLowerCase().includes(q)
            || r.difficulty.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => {
          const diff = (difficultyOrder[a.difficulty] ?? 99) - (difficultyOrder[b.difficulty] ?? 99);
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        });
    });

    const selectRoom = (id: string) => {
      emit('select-room', id);
      emit('close');
    };

    const difficultyLabel = (difficulty: string): string => {
      const labels: Record<string, string> = {
        'very-easy': 'Very Easy',
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
        'extreme': 'Extreme',
      };
      return labels[difficulty] || difficulty;
    };

    const starColor = (difficulty: string): string => {
      const colors: Record<string, string> = {
        'very-easy': 'text-emerald-500 dark:text-emerald-400',
        'easy': 'text-cyan-500 dark:text-cyan-400',
        'medium': 'text-yellow-500 dark:text-yellow-400',
        'hard': 'text-red-500 dark:text-red-400',
        'extreme': 'text-purple-500 dark:text-purple-400',
      };
      return colors[difficulty] || 'text-neo-text';
    };

    const difficultyBadgeClass = (difficulty: string): string => {
      const badges: Record<string, string> = {
        'very-easy': 'bg-emerald-500 text-black border-2 border-black font-black',
        'easy': 'bg-cyan-400 text-black border-2 border-black font-black',
        'medium': 'bg-yellow-400 text-black border-2 border-black font-black',
        'hard': 'bg-red-400 text-white border-2 border-black font-black',
        'extreme': 'bg-purple-500 text-white border-2 border-black font-black',
      };
      return badges[difficulty] || 'bg-gray-500 text-white border-2 border-black font-black';
    };
    const roomStars = (difficulty: string): string => {
      const count: Record<string, number> = {
        'very-easy': 1,
        'easy': 2,
        'medium': 3,
        'hard': 4,
        'extreme': 5,
      };
      const n = count[difficulty] || 0;
      return '★'.repeat(n) + '☆'.repeat(5 - n);
    };

    const roomImage = (id: string): string | undefined => getRoomImage(id);

    const themeGradient = (id: string): string => {
      const gradients: Record<string, string> = {
        'abandoned-lab': 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900',
        'pharaohs-tomb': 'bg-gradient-to-br from-amber-700 via-yellow-800 to-stone-900',
        'room-69420': 'bg-gradient-to-br from-purple-800 via-violet-900 to-slate-900',
        'magician-alibi': 'bg-gradient-to-br from-indigo-800 via-blue-900 to-slate-900',
        'cinnabar-lab': 'bg-gradient-to-br from-red-800 via-orange-900 to-amber-900',
        'house-that-draws-itself': 'bg-gradient-to-br from-pink-700 via-rose-900 to-slate-900',
        'the-meridian-engine': 'bg-gradient-to-br from-cyan-800 via-blue-900 to-slate-900',
        'the-blackwood-masquerade': 'bg-gradient-to-br from-red-950 via-rose-900 to-stone-950',
      };
      return gradients[id] || 'bg-gradient-to-br from-slate-700 to-slate-900';
    };

    return {
      searchQuery,
      difficultyFilter,
      imagesLoaded,
      sortedRooms,
      selectRoom,
      onImageLoad,
      difficultyLabel,
      starColor,
      difficultyBadgeClass,
      roomStars,
      roomImage,
      themeGradient,
    };
  },
});
</script>
