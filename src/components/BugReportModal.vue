<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none"
    >
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[scale_0.2s_ease-out]"
      >
        <!-- Header -->
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-800">Report a Bug</h3>
          </div>
          <button
            @click="close"
            :disabled="loading"
            class="text-slate-400 hover:text-slate-600 transition disabled:opacity-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitReport" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
            <select
              v-model="category"
              :disabled="loading"
              class="w-full text-sm py-2 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 cursor-pointer"
            >
              <option value="Gameplay Bug">Gameplay Bug</option>
              <option value="UI/Visual Issue">UI/Visual Issue</option>
              <option value="Lobby/Connection Issue">Lobby/Connection Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
            <input
              v-model="title"
              :disabled="loading"
              type="text"
              placeholder="e.g. Turn freezes on connection drop"
              maxlength="100"
              required
              class="w-full text-sm py-2.5 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              v-model="description"
              :disabled="loading"
              placeholder="Please provide steps to reproduce the issue..."
              rows="4"
              maxlength="1000"
              required
              class="w-full text-sm py-2.5 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 resize-none"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3 pt-2">
            <button
              type="button"
              @click="close"
              :disabled="loading"
              class="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition duration-150 active:scale-95 disabled:opacity-50 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || !title.trim() || !description.trim()"
              class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition duration-150 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm shadow-indigo-600/30"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Submitting...' : 'Submit' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Socket } from 'socket.io-client';
import { useToast } from '../composables/useToast.js';

export default defineComponent({
  name: 'BugReportModal',
  props: {
    socket: {
      type: Object as PropType<Socket | null>,
      default: null
    }
  },
  setup() {
    const { showToast } = useToast();
    return { showToast };
  },
  data() {
    return {
      isOpen: false,
      loading: false,
      title: '',
      category: 'Gameplay Bug',
      description: ''
    };
  },
  mounted() {
    window.addEventListener('open-bug-report', this.open);
    if (this.socket) {
      this.registerSocketListeners(this.socket);
    }
  },
  beforeUnmount() {
    window.removeEventListener('open-bug-report', this.open);
    if (this.socket) {
      this.unregisterSocketListeners(this.socket);
    }
  },
  watch: {
    socket(newSocket, oldSocket) {
      if (oldSocket) {
        this.unregisterSocketListeners(oldSocket);
      }
      if (newSocket) {
        this.registerSocketListeners(newSocket);
      }
    }
  },
  methods: {
    open() {
      this.title = '';
      this.category = 'Gameplay Bug';
      this.description = '';
      this.loading = false;
      this.isOpen = true;
    },
    close() {
      if (this.loading) return;
      this.isOpen = false;
    },
    registerSocketListeners(socket: Socket) {
      socket.on('bug-report-success', this.handleSuccess);
      socket.on('bug-report-error', this.handleError);
    },
    unregisterSocketListeners(socket: Socket) {
      socket.off('bug-report-success', this.handleSuccess);
      socket.off('bug-report-error', this.handleError);
    },
    handleSuccess(data: { issueUrl: string }) {
      this.loading = false;
      this.isOpen = false;
      this.showToast('Bug report submitted successfully! Thank you.', 'success');
      console.log('GitHub Issue created:', data.issueUrl);
    },
    handleError(data: { message: string }) {
      this.loading = false;
      this.showToast(data.message || 'Failed to submit bug report.', 'error');
    },
    submitReport() {
      if (!this.socket) {
        this.showToast('Not connected to game server.', 'error');
        return;
      }
      if (!this.title.trim() || !this.description.trim()) {
        this.showToast('Please fill out all fields.', 'warning');
        return;
      }

      this.loading = true;

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

      this.socket.emit('report-bug', {
        title: this.title,
        description: this.description,
        category: this.category,
        diagnostics: {
          userAgent: navigator.userAgent,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          deviceType: isMobile ? 'Mobile' : 'Desktop'
        }
      });
    }
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
