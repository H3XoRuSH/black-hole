import { ref } from 'vue';

export type ToastType = 'error' | 'warning' | 'info' | 'success';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  function showToast(message: string, type: ToastType = 'error', duration = 3000) {
    const id = nextId++;
    toasts.value.push({ id, message, type, duration, createdAt: Date.now() });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, showToast, removeToast };
}
