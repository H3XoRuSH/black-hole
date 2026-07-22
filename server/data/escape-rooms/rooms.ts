import type { EscapeRoomData } from '../../../src/types/shared.js';
import abandonedLab from './abandoned-lab.js';
import cinnabarLab from './cinnabar-lab.js';
import cockroachNest from './cockroach-nest.js';
import houseThatDrawsItself from './house-that-draws-itself.js';
import magicianAlibi from './magician-alibi.js';
import pharaohsTomb from './pharaohs-tomb.js';
import room69420 from './room-69420.js';
import theBloodline from './the-bloodline.js';
import theMeridianEngine from './the-meridian-engine.js';

const rooms: Record<string, EscapeRoomData> = {
  'abandoned-lab': abandonedLab,
  'cinnabar-lab': cinnabarLab,
  'cockroach-nest': cockroachNest,
  'house-that-draws-itself': houseThatDrawsItself,
  'magician-alibi': magicianAlibi,
  'pharaohs-tomb': pharaohsTomb,
  'room-69420': room69420,
  'the-bloodline': theBloodline,
  'the-meridian-engine': theMeridianEngine,
};

export default rooms;
