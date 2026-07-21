import type { EscapeRoomData } from '../../../src/types/shared.js';
import abandonedLab from './abandoned-lab.js';
import pharaohsTomb from './pharaohs-tomb.js';
import room69420 from './room-69420.js';
import magicianAlibi from './magician-alibi.js';
import cinnabarLab from './cinnabar-lab.js';
import houseThatDrawsItself from './house-that-draws-itself.js';
import meridianEngine from './the-meridian-engine.js';
import theBloodline from './the-bloodline.js';

const rooms: Record<string, EscapeRoomData> = {
  'abandoned-lab': abandonedLab,
  'pharaohs-tomb': pharaohsTomb,
  'room-69420': room69420,
  'magician-alibi': magicianAlibi,
  'cinnabar-lab': cinnabarLab,
  'house-that-draws-itself': houseThatDrawsItself,
  'the-meridian-engine': meridianEngine,
  'the-bloodline': theBloodline,
};

export default rooms;
