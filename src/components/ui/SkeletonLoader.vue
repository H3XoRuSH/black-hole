<template>
  <div class="animate-fade-in">
    <div v-if="variant === 'card'" class="bg-white dark:bg-neo-card-bg neo-border rounded-none p-4 sm:p-6 w-full">
      <div class="skeleton rounded-none h-5 w-3/4 mb-3"></div>
      <div class="skeleton rounded-none h-3 w-full mb-2"></div>
      <div class="skeleton rounded-none h-3 w-5/6 mb-2"></div>
      <div class="skeleton rounded-none h-3 w-2/3"></div>
      <div class="skeleton rounded-none h-10 w-full mt-4"></div>
    </div>

    <div v-else-if="variant === 'list-item'" class="flex items-center space-x-3 p-3 w-full">
      <div class="skeleton rounded-full w-8 h-8 flex-shrink-0"></div>
      <div class="flex-grow space-y-1.5">
        <div class="skeleton rounded-none h-3.5 w-2/3"></div>
        <div class="skeleton rounded-none h-2.5 w-1/2"></div>
      </div>
    </div>

    <div v-else-if="variant === 'game-card'" class="bg-white dark:bg-neo-card-bg neo-border rounded-none p-4 sm:p-6 w-full min-h-[230px] flex flex-col justify-between">
      <div>
        <div class="flex items-center space-x-2 mb-4">
          <div class="skeleton rounded-full w-8 h-8 flex-shrink-0"></div>
          <div class="skeleton rounded-none h-5 w-1/2"></div>
        </div>
        <div class="skeleton rounded-none h-3 w-full mb-2"></div>
        <div class="skeleton rounded-none h-3 w-5/6 mb-2"></div>
        <div class="skeleton rounded-none h-3 w-2/3"></div>
      </div>
      <div class="skeleton rounded-none h-12 w-full mt-3"></div>
    </div>

    <div v-else-if="variant === 'game-board'" class="flex flex-col items-center space-y-3 p-4 w-full">
      <div class="flex items-center justify-between w-full max-w-lg">
        <div class="skeleton rounded-none w-8 h-8"></div>
        <div class="skeleton rounded-none w-40 h-6"></div>
        <div class="skeleton rounded-none w-8 h-8"></div>
      </div>
      <div class="skeleton rounded-none w-3/4 h-8 max-w-sm"></div>
      <div class="skeleton rounded-none w-full max-w-[320px] aspect-square"></div>
    </div>

    <div v-else-if="variant === 'text'" class="space-y-2" :style="{ width: width || '100%' }">
      <div v-for="i in lines" :key="i" class="skeleton rounded-none" :style="{ height: lineHeight || '12px', width: i === lines && lastLineShort ? '60%' : '100%' }"></div>
    </div>

    <div v-else-if="variant === 'circle'" class="skeleton rounded-full" :style="{ width: size || '40px', height: size || '40px' }"></div>

    <div v-else class="skeleton rounded-none" :style="{ width: width || '100%', height: height || '16px' }"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'SkeletonLoader',
  props: {
    variant: {
      type: String as PropType<'card' | 'list-item' | 'game-card' | 'game-board' | 'text' | 'circle' | 'rect'>,
      default: 'rect',
    },
    lines: {
      type: Number,
      default: 3,
    },
    lineHeight: {
      type: String,
      default: '12px',
    },
    lastLineShort: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '16px',
    },
    size: {
      type: String,
      default: '40px',
    },
  },
});
</script>
