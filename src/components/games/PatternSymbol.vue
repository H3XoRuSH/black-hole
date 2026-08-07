<template>
  <span
    class="pattern-symbol"
    :style="{
      '--symbol-rotation': `${image.rotation + rotationOffset}deg`,
      '--symbol-scale': scale,
    }"
    aria-hidden="true"
  >
    <img
      :src="currentSrc"
      :alt="image.label"
      class="pattern-symbol-img"
      loading="lazy"
      @error="handleError"
    />
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import type { SpotItImage } from '../../types/shared.js';

export default defineComponent({
  name: 'PatternSymbol',
  props: {
    image: {
      type: Object as PropType<SpotItImage>,
      required: true,
    },
    scale: {
      type: Number,
      default: 1,
    },
    rotationOffset: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const errorCount = ref(0);

    const filename = computed(() => {
      const shape = props.image.shape || props.image.id || 'image-1';
      if (/^\d+$/.test(shape)) return `image-${shape}`;
      return shape;
    });

    const currentSrc = computed(() => {
      const name = filename.value;
      const num = name.replace(/^image-/, '');

      // Try extensions: .png -> .webp -> .svg -> .jpg -> fallback to 1.png/webp
      switch (errorCount.value) {
        case 0:
          return `/images/spot-it/${name}.png`;
        case 1:
          return `/images/spot-it/${name}.webp`;
        case 2:
          return `/images/spot-it/${name}.svg`;
        case 3:
          return `/images/spot-it/${name}.jpg`;
        case 4:
          return `/images/spot-it/${num}.png`;
        case 5:
          return `/images/spot-it/${num}.webp`;
        case 6:
          return `/images/spot-it/${num}.svg`;
        default:
          return `/images/spot-it/${name}.png`;
      }
    });

    watch(
      () => props.image.id,
      () => {
        errorCount.value = 0;
      },
    );

    function handleError() {
      if (errorCount.value < 7) {
        errorCount.value++;
      }
    }

    return {
      currentSrc,
      handleError,
    };
  },
});
</script>

<style scoped>
.pattern-symbol {
  --symbol-rotation: 0deg;
  --symbol-scale: 1;
  display: flex;
  width: 100%;
  height: 100%;
  flex: none;
  align-items: center;
  justify-content: center;
  transform: rotate(var(--symbol-rotation)) scale(var(--symbol-scale));
  transform-origin: center center;
}

.pattern-symbol-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
  user-select: none;
  pointer-events: none;
}
</style>
