import { ref, watch } from 'vue';

const LS_KEY = 'bingo-speech-muted';

const muted = ref(localStorage.getItem(LS_KEY) === 'true');

watch(muted, (val) => {
  localStorage.setItem(LS_KEY, String(val));
  if (val) {
    window.speechSynthesis?.cancel();
  }
});

let ziraVoice: SpeechSynthesisVoice | null = null;

function loadZiraVoice() {
  const voices = window.speechSynthesis?.getVoices();
  if (voices) {
    ziraVoice = voices.find((v) => v.name.includes('Zira')) ?? null;
  }
}

loadZiraVoice();
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadZiraVoice;
}

export function useSpeech() {
  function speak(text: string) {
    if (muted.value || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (ziraVoice) utterance.voice = ziraVoice;
    utterance.rate = 0.8;
    utterance.volume = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function toggleMute() {
    muted.value = !muted.value;
  }

  return { muted, speak, toggleMute };
}
