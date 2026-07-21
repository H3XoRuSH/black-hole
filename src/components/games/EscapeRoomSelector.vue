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
      <div class="sticky top-0 z-10 flex gap-2 mt-1" :class="theme === 'light' ? 'bg-white' : 'bg-slate-900'">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" :class="theme === 'light' ? 'text-gray-400' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search rooms..."
            class="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            :class="theme === 'light'
              ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
              : 'bg-slate-800 border border-slate-700 text-white placeholder-slate-500'"
          />
        </div>
        <select
          v-model="difficultyFilter"
          class="shrink-0 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          :class="theme === 'light'
            ? 'bg-white border border-gray-300 text-gray-900'
            : 'bg-slate-800 border border-slate-700 text-white'"
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
      <div v-if="sortedRooms.length === 0" class="text-center py-12 text-sm" :class="theme === 'light' ? 'text-gray-500' : 'text-slate-400'">
        No rooms match your search
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 custom-scroll">
        <button
          v-for="room in sortedRooms"
          :key="room.id"
          @click="selectRoom(room.id)"
          :disabled="!!roomImage(room.id) && !imagesLoaded[room.id]"
          class="group text-left rounded-xl border-2 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :class="[
            room.id === selectedRoomId
              ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
              : theme === 'light'
                ? 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                : 'border-slate-700 hover:border-slate-500 hover:shadow-md',
            !!roomImage(room.id) && !imagesLoaded[room.id]
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer',
          ]"
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
              <h3 class="font-bold text-sm truncate" :class="theme === 'light' ? 'text-gray-900' : 'text-white'">{{ room.name }}</h3>
              <span
                class="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                :class="difficultyBadgeClass(room.difficulty)"
              >
                {{ difficultyLabel(room.difficulty) }}
              </span>
            </div>
            <p class="text-xs leading-relaxed line-clamp-2" :class="theme === 'light' ? 'text-gray-500' : 'text-slate-400'">{{ room.description }}</p>
            <div :class="starColor(room.difficulty)" class="text-sm leading-none">
              {{ roomStars(room.difficulty) }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-xs" :class="theme === 'light' ? 'text-gray-400' : 'text-slate-500'">{{ sortedRooms.length }} room{{ sortedRooms.length !== 1 ? 's' : '' }}</span>
        <button
          @click="$emit('close')"
          class="text-sm font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          :class="theme === 'light'
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            : 'bg-slate-700 hover:bg-slate-600 text-white'"
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
      const dark: Record<string, string> = {
        'very-easy': 'text-emerald-400',
        'easy': 'text-cyan-400',
        'medium': 'text-amber-400',
        'hard': 'text-rose-400',
        'extreme': 'text-purple-400',
      };
      const light: Record<string, string> = {
        'very-easy': 'text-emerald-600',
        'easy': 'text-cyan-600',
        'medium': 'text-amber-600',
        'hard': 'text-rose-600',
        'extreme': 'text-purple-600',
      };
      const map = props.theme === 'light' ? light : dark;
      return map[difficulty] || (props.theme === 'light' ? 'text-gray-500' : 'text-gray-400');
    };

    const difficultyBadgeClass = (difficulty: string): string => {
      const dark: Record<string, string> = {
        'very-easy': 'bg-emerald-900/50 text-emerald-300',
        'easy': 'bg-cyan-900/50 text-cyan-300',
        'medium': 'bg-amber-900/50 text-amber-300',
        'hard': 'bg-rose-900/50 text-rose-300',
        'extreme': 'bg-purple-900/50 text-purple-300',
      };
      const light: Record<string, string> = {
        'very-easy': 'bg-emerald-100 text-emerald-700',
        'easy': 'bg-cyan-100 text-cyan-700',
        'medium': 'bg-amber-100 text-amber-700',
        'hard': 'bg-rose-100 text-rose-700',
        'extreme': 'bg-purple-100 text-purple-700',
      };
      const map = props.theme === 'light' ? light : dark;
      return map[difficulty] || (props.theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-slate-700 text-slate-300');
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

<style scoped>
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
