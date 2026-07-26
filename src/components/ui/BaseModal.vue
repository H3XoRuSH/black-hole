<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        ref="backdropRef"
        :class="['fixed inset-0 z-50 flex items-center justify-center p-4 select-none', backdropClass]"
        @click.self="onBackdropClick"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isOpen"
            ref="contentRef"
            :class="['w-full p-4 sm:p-6 flex flex-col relative max-h-[85vh] overflow-hidden', contentClass, maxWidthClass]"
            :role="role"
            :aria-modal="role === 'dialog' ? 'true' : undefined"
            :aria-label="role === 'dialog' && title ? title : undefined"
          >
            <button
              v-if="showCloseButton"
              @click="close"
              class="absolute top-4 right-4 p-1.5 rounded-none transition-colors cursor-pointer text-neo-text/75 hover:text-neo-text hover:bg-neo-muted/20 neo-border-2"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div v-if="$slots['header-icon'] || title || subtitle" class="mb-5 flex items-center space-x-3 pr-8 text-neo-text">
              <div v-if="$slots['header-icon']" class="p-2 rounded-none" :class="iconContainerClass">
                <slot name="header-icon" />
              </div>
              <div>
                <h2 v-if="title" class="text-xl font-black uppercase tracking-wide">{{ title }}</h2>
                <p v-if="subtitle" class="text-xs font-bold uppercase tracking-wider text-neo-text/70">{{ subtitle }}</p>
              </div>
            </div>

            <div class="overflow-y-auto pr-1 focus:outline-none flex-grow custom-scroll" ref="scrollRef">
              <slot />
            </div>

            <div v-if="$slots.footer" class="flex-shrink-0 mt-4 pt-4 border-t border-neo-border">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onBeforeUnmount, nextTick } from 'vue';

export default defineComponent({
  name: 'BaseModal',
  props: {
    isOpen: Boolean,
    title: String,
    subtitle: String,
    theme: {
      type: String,
      default: 'dark',
      validator: (v: string) => ['dark', 'light'].includes(v),
    },
    maxWidth: {
      type: String,
      default: 'max-w-lg',
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'dialog',
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const contentRef = ref<HTMLElement | null>(null);
    const scrollRef = ref<HTMLElement | null>(null);
    let previousFocus: HTMLElement | null = null;

    const close = () => {
      emit('close');
    };

    const onBackdropClick = () => {
      if (props.closeOnBackdrop) {
        close();
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'Tab' && contentRef.value) {
        const focusable = contentRef.value.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    watch(() => props.isOpen, async (open) => {
      if (open) {
        previousFocus = document.activeElement as HTMLElement | null;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeydown);
        await nextTick();
        if (contentRef.value) {
          const firstFocusable = contentRef.value.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }
        if (scrollRef.value) {
          scrollRef.value.scrollTop = 0;
        }
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeydown);
        previousFocus?.focus();
        previousFocus = null;
      }
    });

    onBeforeUnmount(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeydown);
    });

    return {
      contentRef,
      scrollRef,
      close,
      onBackdropClick,
    };
  },
  computed: {
    backdropClass(): string {
      return 'bg-black/80 backdrop-blur-xs';
    },
    contentClass(): string {
      return 'bg-white dark:bg-neo-card-bg neo-border neo-shadow-lg text-neo-text rounded-none';
    },
    maxWidthClass(): string {
      return this.maxWidth || 'max-w-lg';
    },
    iconContainerClass(): string {
      return 'bg-neo-muted neo-border-2 text-black rounded-none';
    },
  },
});
</script>
