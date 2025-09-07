<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <h1 class="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-800">Black Hole Lobby</h1>
    <div v-if="connectionStatus" class="mb-4 sm:mb-6 text-center text-red-600 text-sm sm:text-base">{{ connectionStatus
      }}</div>
    <div v-if="roomKey" class="mb-4 sm:mb-6 text-center text-gray-600 text-sm sm:text-base">
      Room Key: <span class="font-bold">{{ roomKey }}</span>
    </div>
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 sm:p-8">
      <div class="mb-6">
        <button @click="createRoom" :disabled="isCreateDisabled"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
          Create Room
        </button>
      </div>
      <div class="flex flex-col space-y-4">
        <input v-model="roomInput" type="text" placeholder="Enter Room Key"
          class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          :disabled="isJoinDisabled" />
        <button @click="joinRoom" :disabled="isJoinDisabled"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
          Join Room
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
};
</script>