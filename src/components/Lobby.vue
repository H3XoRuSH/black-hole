<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <h1 class="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-800">Black Hole</h1>
    
    <div v-if="connectionStatus" class="mb-4 text-center text-red-600 text-sm sm:text-base max-w-md bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">
      {{ connectionStatus }}
    </div>
    <div v-if="roomKey" class="mb-4 sm:mb-6 text-center text-gray-600 text-sm sm:text-base">
      Room Key: <span class="font-bold">{{ roomKey }}</span>
    </div>

    <div class="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8">
      <!-- Host Section -->
      <div class="text-center mb-4">
        <p class="text-xs text-gray-500 uppercase tracking-wider font-bold">Host a Game</p>
      </div>
      <div class="mb-6">
        <button @click="createRoom" :disabled="isCreateDisabled"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer">
          Create New Room
        </button>
      </div>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
        <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-3 text-gray-400 font-medium">Or</span></div>
      </div>

      <!-- Join Section -->
      <div class="text-center mb-4">
        <p class="text-xs text-gray-500 uppercase tracking-wider font-bold">Join an Existing Room</p>
      </div>
      <div class="flex flex-col space-y-3">
        <input v-model="roomInput" type="text" placeholder="ENTER 6-DIGIT CODE"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono tracking-widest text-lg placeholder:font-sans placeholder:tracking-normal placeholder:text-sm text-gray-700 uppercase"
          :disabled="isJoinDisabled" />
        <button @click="joinRoom" :disabled="isJoinDisabled"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer">
          Join Game
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    socket: Object,
    connectionStatus: String,
    roomKey: String,
    player: Number,
  },
  data() {
    return {
      roomInput: '',
    };
  },
  computed: {
    isCreateDisabled() {
      return !!this.roomKey && this.player === 1;
    },
    isJoinDisabled() {
      return !!this.roomKey && this.player === 1;
    },
  },
  methods: {
    createRoom() {
      console.log('Creating room, current roomKey:', this.roomKey, 'player:', this.player);
      this.socket.emit('create-room');
    },
    joinRoom() {
      console.log('Joining room, input:', this.roomInput, 'roomKey:', this.roomKey, 'player:', this.player);
      if (!this.roomInput) {
        this.$emit('update-connection-status', 'Please enter a room key.');
        return;
      }
      const roomKey = this.roomInput.toUpperCase();
      this.socket.emit('join-room', { roomKey });
      this.roomInput = ''; // Clear input after attempt
    },
  },
  beforeRouteLeave(to, from, next) {
    // Only tell the server to clear the room if we are NOT navigating to the game itself
    if (this.roomKey && !to.path.startsWith('/black-hole/game')) {
      this.socket.emit('leave-room', { roomKey: this.roomKey });
    }
    next();
  },
};
</script>