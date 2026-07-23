<template>
  <div v-if="visible" class="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
    <!-- Toggle Button -->
    <button
      v-if="!open"
      @click="open = true"
      class="relative w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:shadow-indigo-500/30"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">{{ unreadCount >= 10 ? '9+' : unreadCount }}</span>
    </button>

    <!-- Chat Panel -->
    <div
      v-else
      class="w-72 sm:w-80 h-96 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-[fade_0.15s_ease]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-700 flex-shrink-0">
        <span class="text-sm font-bold text-white flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>Chat</span>
        </span>
        <button
          @click="open = false"
          class="text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg p-1 transition-all cursor-pointer"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesRef" class="flex-grow overflow-y-auto p-3 space-y-2 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-slate-500">
        <div v-if="messages.length === 0" class="flex items-center justify-center h-full text-xs text-slate-500 select-none">
          No messages yet
        </div>
        <div v-for="(msg, i) in messages" :key="i" class="flex items-start space-x-2">
          <span class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" :class="dotClass(msg.player)"></span>
          <div class="min-w-0">
            <span class="text-xs font-semibold" :class="nameColor(msg.player)">{{ displayName(msg) }}</span>
            <p class="text-sm text-slate-200 break-words">{{ msg.text }}</p>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="p-3 border-t border-slate-700 flex-shrink-0">
        <div class="flex items-center space-x-2">
          <input
            v-model="inputText"
            @keyup.enter="send"
            type="text"
            placeholder="Type a message..."
            maxlength="200"
            class="flex-grow bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <button
            @click="send"
            :disabled="!inputText.trim()"
            class="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-3 py-2 transition-all duration-150 cursor-pointer active:scale-95 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import type { ChatMessage, Player } from '../../types/shared.js';

const PLAYER_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-blue-500'];
const PLAYER_TEXT_COLORS = ['text-indigo-400', 'text-emerald-400', 'text-amber-400', 'text-rose-400', 'text-cyan-400', 'text-violet-400', 'text-pink-400', 'text-blue-400'];

export default defineComponent({
  name: 'ChatBox',
  props: {
    socket: { type: Object as PropType<any>, default: null },
    roomKey: { type: String, default: '' },
    players: { type: Array as PropType<Player[]>, default: () => [] },
  },
  setup(props) {
    const route = useRoute();
    const open = ref(false);
    const inputText = ref('');
    const messages = ref<ChatMessage[]>([]);
    const unreadCount = ref(0);
    const messagesRef = ref<HTMLElement | null>(null);

    let previousSocket: Socket | null = null;

    const visible = computed(() => {
      if (!props.roomKey || !props.socket) return false;
      if (route && route.path.includes('/escape-room/game/')) return false;
      const humanPlayers = props.players.filter((p) => !p.isAI);
      return humanPlayers.length >= 2;
    });

    function scrollToBottom() {
      nextTick(() => {
        if (messagesRef.value) {
          messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
        }
      });
    }

    function send() {
      const text = inputText.value.trim();
      if (!text || !props.socket || !props.roomKey) return;
      props.socket.emit('send-chat', { roomKey: props.roomKey, text });
      inputText.value = '';
    }

    function dotClass(playerNum: number): string {
      return PLAYER_COLORS[(playerNum - 1) % PLAYER_COLORS.length];
    }

    function nameColor(playerNum: number): string {
      return PLAYER_TEXT_COLORS[(playerNum - 1) % PLAYER_TEXT_COLORS.length];
    }

    function displayName(msg: ChatMessage): string {
      const p = props.players.find((pl) => pl.player === msg.player);
      return p?.name || msg.playerName;
    }

    watch(open, (val) => {
      if (val) {
        unreadCount.value = 0;
        scrollToBottom();
      }
    });

    watch(() => messages.value.length, () => {
      if (open.value) scrollToBottom();
    });

    watch(() => props.roomKey, () => {
      if (!props.roomKey) {
        messages.value = [];
        unreadCount.value = 0;
        open.value = false;
      }
    });

    const onWaitingForPlayer = (data: any) => {
      messages.value = data.chatMessages || [];
      unreadCount.value = 0;
    };

    const onReconnectSuccess = (data: any) => {
      messages.value = data.chatMessages || [];
      unreadCount.value = 0;
    };

    const onChatMessage = (msg: ChatMessage) => {
      messages.value = [...messages.value, msg];
      if (!open.value) unreadCount.value++;
    };

    watch(() => props.socket, (newSocket) => {
      if (previousSocket && previousSocket !== newSocket) {
        previousSocket.off('waiting-for-player', onWaitingForPlayer);
        previousSocket.off('reconnect-success', onReconnectSuccess);
        previousSocket.off('chat-message', onChatMessage);
      }
      if (newSocket) {
        newSocket.on('waiting-for-player', onWaitingForPlayer);
        newSocket.on('reconnect-success', onReconnectSuccess);
        newSocket.on('chat-message', onChatMessage);
      }
      previousSocket = newSocket;
    }, { immediate: true });

    onBeforeUnmount(() => {
      if (props.socket) {
        props.socket.off('waiting-for-player', onWaitingForPlayer);
        props.socket.off('reconnect-success', onReconnectSuccess);
        props.socket.off('chat-message', onChatMessage);
      }
    });

    return {
      open,
      inputText,
      messages,
      unreadCount,
      messagesRef,
      visible,
      send,
      dotClass,
      nameColor,
      displayName,
    };
  },
});
</script>
