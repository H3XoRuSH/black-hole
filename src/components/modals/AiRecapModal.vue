<template>
  <BaseModal
    :is-open="isOpen"
    title="AI Match Recap"
    :subtitle="gameName"
    @close="$emit('close')"
  >
    <template #header-icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
      </svg>
    </template>

    <div v-if="loading" class="flex flex-col items-center py-8 space-y-3">
      <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs text-neo-text/50 dark:text-slate-400 animate-pulse">Analyzing key moves...</span>
    </div>

    <div
      v-else-if="!recapText"
      class="flex justify-center py-6"
    >
      <button
        @click="$emit('request-recap')"
        class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-none transition-all duration-150 cursor-pointer shadow-md active:scale-95 flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
        </svg>
        <span>Generate AI Recap</span>
      </button>
    </div>

    <div
      v-else
      class="flex flex-col flex-grow overflow-hidden"
    >
      <div v-html="formattedRecap" class="text-sm"></div>

      <div v-if="conversation.length > 0" class="border-t border-neo-border/20 dark:border-slate-700/50 pt-4 mt-4 space-y-3">
        <div
          v-for="(msg, idx) in conversation"
          :key="idx"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[85%] rounded-none px-3 py-2 text-xs leading-relaxed"
            :class="msg.role === 'user'
              ? 'bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-200 border border-indigo-500/20'
              : 'bg-neo-card-bg dark:bg-slate-800 text-neo-text/80 dark:text-slate-300 border neo-border-2 dark:border-slate-700/50'"
          >
            <p class="font-medium text-[10px] uppercase tracking-wider mb-1 opacity-60">
              {{ msg.role === 'user' ? 'You' : 'AI' }}
            </p>
            <p>{{ msg.content }}</p>
          </div>
        </div>
        <div v-if="askLoading" class="flex justify-start">
          <div class="bg-neo-card-bg dark:bg-slate-800 text-neo-text/50 dark:text-slate-400 rounded-none px-3 py-2 text-xs border neo-border-2 dark:border-slate-700/50">
            <span class="animate-pulse">Thinking...</span>
          </div>
        </div>
      </div>

      <div v-if="!questionAsked" class="flex-shrink-0 mt-3 pt-3 border-t border-neo-border/20 dark:border-slate-700/50">
        <div class="flex items-center space-x-2">
          <input
            :value="question"
            @input="$emit('update:question', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Ask a follow-up question about this match..."
            class="flex-grow neo-input rounded-none px-3 py-2 text-xs placeholder:text-neo-text/30 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            @keyup.enter="$emit('send-question')"
            :disabled="askLoading"
          />
          <button
            @click="$emit('send-question')"
            :disabled="askLoading || !question.trim()"
            class="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-slate-500 text-white rounded-none px-3 py-2 text-xs transition-all duration-150 cursor-pointer active:scale-95 flex-shrink-0"
          >
            <svg v-if="askLoading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseModal from '../ui/BaseModal.vue';

function formatRecapHtml(text: string): string {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/### (.*?)\n/g, '<h3 class="text-sm font-bold text-neo-text dark:text-slate-100 mt-3 mb-1">$1</h3>');
  html = html.replace(/## (.*?)\n/g, '<h2 class="text-base font-bold text-neo-text dark:text-slate-100 mt-4 mb-2">$1</h2>');
  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-neo-text/80 dark:text-slate-300">$1</li>');
  html = html.split('\n\n').map((p) => {
    if (p.trim().startsWith('<li') || p.trim().startsWith('<h3') || p.trim().startsWith('<h2')) {
      return p;
    }
    return `<p class="mb-2 leading-relaxed text-neo-text/80 dark:text-slate-300">${p}</p>`;
  }).join('');
  return html;
}

export default defineComponent({
  name: 'AiRecapModal',
  components: { BaseModal },
  props: {
    isOpen: { type: Boolean, required: true },
    recapText: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    conversation: { type: Array, default: () => [] },
    question: { type: String, default: '' },
    askLoading: { type: Boolean, default: false },
    questionAsked: { type: Boolean, default: false },
    gameName: { type: String, default: '' },
  },
  emits: ['close', 'request-recap', 'send-question', 'update:question'],
  computed: {
    formattedRecap(): string {
      return formatRecapHtml(this.recapText);
    },
  },
});
</script>
