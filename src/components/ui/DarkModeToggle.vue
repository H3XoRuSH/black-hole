<template>
  <button
    @click="toggle"
    class="w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-200 cursor-pointer active:scale-90 flex-shrink-0"
    :class="isDark
      ? 'bg-slate-800 border-slate-600 text-amber-400 hover:bg-slate-700'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
    :title="isDark ? 'Currently in dark mode' : 'Currently in light mode'"
    aria-label="Toggle dark mode"
  >
    <!-- Sun icon (light mode) -->
    <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
    </svg>
    <!-- Moon icon (dark mode) -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  </button>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'DarkModeToggle',
  setup() {
    const isDark = ref(false);

    const apply = (dark: boolean) => {
      isDark.value = dark;
      document.documentElement.classList.toggle('dark', dark);
      try {
        localStorage.setItem('darkMode', String(dark));
      } catch { /* noop */ }
    };

    const toggle = () => {
      apply(!isDark.value);
    };

    onMounted(() => {
      isDark.value = document.documentElement.classList.contains('dark');
    });

    return { isDark, toggle };
  },
});
</script>
