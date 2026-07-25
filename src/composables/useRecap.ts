import { ref, onBeforeUnmount, type Ref } from 'vue';

interface RecapMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useRecap(socket: Ref<any>, roomKey: Ref<string>) {
  const showRecapModal = ref(false);
  const recapText = ref('');
  const recapLoading = ref(false);
  const recapConversation = ref<RecapMessage[]>([]);
  const recapQuestion = ref('');
  const recapAskLoading = ref(false);
  const recapQuestionAsked = ref(false);

  function requestRecap() {
    if (socket.value && roomKey.value) {
      recapLoading.value = true;
      socket.value.emit('request-recap', { roomKey: roomKey.value });
    }
  }

  function openRecapModal() {
    showRecapModal.value = true;
    if (recapLoading.value) return;
    if (!recapText.value && socket.value && roomKey.value) {
      recapLoading.value = true;
      socket.value.emit('request-recap', { roomKey: roomKey.value });
    }
  }

  function closeRecapModal() {
    showRecapModal.value = false;
  }

  function sendRecapQuestion() {
    const q = recapQuestion.value.trim();
    if (!q || recapAskLoading.value || !socket.value || !roomKey.value) return;
    recapConversation.value.push({ role: 'user', content: q });
    recapAskLoading.value = true;
    recapQuestion.value = '';
    socket.value.emit('recap-question', { roomKey: roomKey.value, question: q });
  }

  function resetRecap() {
    recapText.value = '';
    recapLoading.value = false;
    showRecapModal.value = false;
    recapConversation.value = [];
    recapQuestion.value = '';
    recapAskLoading.value = false;
    recapQuestionAsked.value = false;
  }

  function formattedRecapHtml(text: string): string {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/### (.*?)\n/g, '<h3 class="text-sm font-bold text-neo-text dark:text-slate-100 mt-3 mb-1">$1</h3>');
    html = html.replace(/## (.*?)\n/g, '<h2 class="text-base font-bold text-neo-text dark:text-slate-100 mt-4 mb-2">$1</h2>');
    html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-neo-text/80 dark:text-slate-300">$1</li>');
    html = html.split('\n\n').map((p) => {
      if (p.trim().startsWith('<li') || p.trim().startsWith('<h3') || p.trim().startsWith('<h2')) {
        return p;
      }
      return `<p class="mb-2 leading-relaxed text-neo-text/80 dark:text-slate-300">${p}</p>`;
    }).join('');
    return html;
  }

  function setupRecapListeners() {
    if (!socket.value) return;

    const onRecapLoading = () => {
      recapLoading.value = true;
    };
    const onRecapGenerated = ({ text }: { text: string }) => {
      recapText.value = text;
      recapLoading.value = false;
    };
    const onRecapAnswering = () => {
      recapAskLoading.value = true;
    };
    const onRecapAnswer = ({ answer, error }: { answer?: string; error?: string }) => {
      recapAskLoading.value = false;
      if (error) {
        recapConversation.value.push({ role: 'assistant', content: `Error: ${error}` });
        return;
      }
      recapConversation.value.push({ role: 'assistant', content: answer || '' });
      recapQuestionAsked.value = true;
    };

    socket.value.on('recap-loading', onRecapLoading);
    socket.value.on('recap-generated', onRecapGenerated);
    socket.value.on('recap-answering', onRecapAnswering);
    socket.value.on('recap-answer', onRecapAnswer);

    return () => {
      if (socket.value) {
        socket.value.off('recap-loading', onRecapLoading);
        socket.value.off('recap-generated', onRecapGenerated);
        socket.value.off('recap-answering', onRecapAnswering);
        socket.value.off('recap-answer', onRecapAnswer);
      }
    };
  }

  let teardown: (() => void) | undefined;

  function initRecap() {
    teardown = setupRecapListeners();
  }

  onBeforeUnmount(() => {
    teardown?.();
  });

  return {
    showRecapModal,
    recapText,
    recapLoading,
    recapConversation,
    recapQuestion,
    recapAskLoading,
    recapQuestionAsked,
    requestRecap,
    openRecapModal,
    closeRecapModal,
    sendRecapQuestion,
    resetRecap,
    formattedRecapHtml,
    initRecap,
  };
}
