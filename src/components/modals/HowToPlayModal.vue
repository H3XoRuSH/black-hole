<template>
  <BaseModal
    :is-open="isOpen"
    title="How to Play"
    :subtitle="gameName"
    @close="$emit('close')"
  >
    <template #header-icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </template>

    <div class="text-slate-300 text-sm space-y-4">
      <div v-for="(rule, index) in rulesList" :key="index" class="flex items-start space-x-3.5 bg-slate-950/40 border border-slate-800/40 rounded-xl p-3.5 hover:border-slate-800 transition-colors">
        <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/15 text-blue-400 font-bold text-xs border border-blue-500/25">
          {{ index + 1 }}
        </div>
        <div class="flex-grow space-y-0.5">
          <h4 class="font-bold text-slate-100 text-sm" v-if="rule.title">{{ rule.title }}</h4>
          <p class="leading-relaxed text-slate-300 text-xs sm:text-sm">{{ rule.desc }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button
          @click="$emit('close')"
          class="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-95 animate-pulse"
        >
          Got it, let's play!
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseModal from '../ui/BaseModal.vue';
import gamesData from '../../assets/games.json';

export default defineComponent({
  name: 'HowToPlayModal',
  components: { BaseModal },
  props: {
    isOpen: { type: Boolean, required: true },
    gameId: { type: String, required: true },
  },
  emits: ['close'],
  computed: {
    gameData(): any {
      return gamesData.find((g) => g.id === this.gameId) || null;
    },
    gameName(): string {
      return this.gameData?.name || '';
    },
    rulesList(): Array<{ title?: string; desc: string }> {
      return this.gameData?.rules || [];
    },
  },
});
</script>
