import type { SpotItImage } from '../types/shared.js';

const TOTAL_SPOT_IT_SYMBOLS = 57;

const SPOT_IT_IMAGES: SpotItImage[] = Array.from({ length: TOTAL_SPOT_IT_SYMBOLS }, (_, index) => {
  const itemNum = index + 1;
  return {
    id: `image-${index}`,
    label: `Item ${itemNum}`,
    shape: `image-${itemNum}`,
    color: '#ffffff',
    rotation: (index * 29) % 360,
  };
});

export const SPOT_IT_IMAGE_BY_ID: Record<string, SpotItImage> = Object.fromEntries(
  SPOT_IT_IMAGES.map((image) => [image.id, image]),
);
