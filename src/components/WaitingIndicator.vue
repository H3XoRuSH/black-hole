<template>
  <span class="inline-flex items-center gap-0.5 ml-0.5">
    <span
      v-for="i in 3"
      :key="i"
      class="w-1 h-1 rounded-full bg-current animate-bounce"
      :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
    ></span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WaitingIndicator',
});
</script>
