import * as Tone from 'tone';
import { ref, watch } from 'vue';
import type { SoundNote } from '../types/shared.js';

const LS_KEY = 'audio-tones-muted';
const muted = ref(localStorage.getItem(LS_KEY) === 'true');

watch(muted, (val) => {
  localStorage.setItem(LS_KEY, String(val));
});

const PITCH_MAP: Record<string, string> = {
  C4: 'C4',
  D4: 'D4',
  E4: 'E4',
  F4: 'F4',
  G4: 'G4',
  A4: 'A4',
  B4: 'B4',
  C5: 'C5',
  low: 'A3',
  medium: 'A4',
  high: 'A5',
};

let synth: Tone.Synth | null = null;
let polySynth: Tone.PolySynth | null = null;
let currentTimeout: ReturnType<typeof setTimeout> | null = null;

function getSynth(): Tone.Synth | null {
  if (!synth && typeof window !== 'undefined') {
    synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.015, decay: 0.1, sustain: 0.8, release: 0.02 },
    }).toDestination();
  }
  return synth;
}

function getPolySynth(): Tone.PolySynth | null {
  if (!polySynth && typeof window !== 'undefined') {
    polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.1 },
    }).toDestination();
  }
  return polySynth;
}

export function useAudioTones() {
  const isSoundPlaying = ref(false);

  async function ensureAudioStarted() {
    if (typeof window !== 'undefined' && Tone.getContext().state !== 'running') {
      await Tone.start();
    }
  }

  function stopSound() {
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
    isSoundPlaying.value = false;
  }

  async function playNotes(notes: SoundNote[]) {
    if (muted.value || !notes || notes.length === 0) return;
    await ensureAudioStarted();
    stopSound();

    const s = getSynth();
    if (!s) return;

    isSoundPlaying.value = true;
    let timeOffset = 0;
    const now = Tone.now();

    for (const note of notes) {
      const durationSeconds = note.dur / 1000;
      if (!note.rest && note.pitch) {
        const pitchNotation = PITCH_MAP[note.pitch];
        if (pitchNotation) {
          s.triggerAttackRelease(pitchNotation, durationSeconds, now + timeOffset);
        }
      }
      timeOffset += durationSeconds;
    }

    const totalMs = timeOffset * 1000 + 100;
    currentTimeout = setTimeout(() => {
      isSoundPlaying.value = false;
      currentTimeout = null;
    }, totalMs);
  }

  async function playClick() {
    if (muted.value) return;
    await ensureAudioStarted();
    const ps = getPolySynth();
    ps?.triggerAttackRelease('C6', '32n');
  }

  async function playSuccess() {
    if (muted.value) return;
    await ensureAudioStarted();
    const ps = getPolySynth();
    const now = Tone.now();
    ps?.triggerAttackRelease('C5', '16n', now);
    ps?.triggerAttackRelease('E5', '16n', now + 0.08);
    ps?.triggerAttackRelease('G5', '16n', now + 0.16);
    ps?.triggerAttackRelease('C6', '8n', now + 0.24);
  }

  async function playError() {
    if (muted.value) return;
    await ensureAudioStarted();
    const ps = getPolySynth();
    const now = Tone.now();
    ps?.triggerAttackRelease(['G2', 'C#3'], '8n', now);
  }

  function toggleMute() {
    muted.value = !muted.value;
  }

  return {
    muted,
    isSoundPlaying,
    playNotes,
    playClick,
    playSuccess,
    playError,
    stopSound,
    toggleMute,
  };
}
