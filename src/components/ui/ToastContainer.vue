<template>
  <TransitionGroup
    name="toast"
    tag="div"
    class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[100] flex flex-col gap-2 pointer-events-none sm:max-w-sm pb-safe"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto flex flex-col rounded-none neo-border neo-shadow-sm text-sm font-black overflow-hidden uppercase tracking-wider animate-slide-up"
      :class="bgClass(toast.type)"
    >
      <div class="flex items-start gap-2 px-4 py-3">
        <span class="flex-1">{{ toast.message }}</span>
        <button
          @click="removeToast(toast.id)"
          class="text-neo-text/70 hover:text-neo-text transition-colors cursor-pointer flex-shrink-0 touch-target"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div
        class="toast-progress h-1.5 bg-current/30"
        :style="{ animationDuration: toast.duration + 'ms' }"
      />
    </div>
  </TransitionGroup>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useToast } from '../../composables/useToast.js';

export default defineComponent({
  name: 'ToastContainer',
  setup() {
    const { toasts, removeToast } = useToast();
    return { toasts, removeToast };
  },
  methods: {
    bgClass(type: string) {
      switch (type) {
        case 'error': return 'bg-neo-accent text-white';
        case 'warning': return 'bg-neo-secondary text-black border-2 border-black';
        case 'info': return 'bg-neo-muted text-black border-2 border-black';
        case 'success': return 'bg-emerald-500 text-black border-2 border-black';
        default: return 'bg-white dark:bg-neo-card-bg text-neo-text border-2 border-black';
      }
    },
  },
});
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-enter-active .toast-progress,
.toast-leave-active .toast-progress {
  animation: none;
  width: 100%;
}
.toast-progress {
  animation: toast-shrink linear forwards;
}
@keyframes toast-shrink {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
