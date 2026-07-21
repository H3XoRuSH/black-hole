<template>
  <div class="flex flex-col items-center justify-start min-h-full bg-gray-100 dark:bg-slate-900 p-4 sm:py-12 select-none">
    <!-- Header Section -->
    <header class="text-center mb-4 sm:mb-6 max-w-md w-full">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {{ gameName }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Game Lobby</p>
    </header>

    <!-- Main Card -->
    <div class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200/80 dark:border-slate-700 p-5 sm:p-8 text-center">
      <div v-if="roomKey">
        <!-- Connection Status Banner -->
        <div
          v-if="connectionStatus"
           class="w-full mb-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 rounded-xl p-3 text-xs sm:text-sm font-medium flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ connectionStatus }}</span>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-3">
          Share this Room Code
        </p>

        <!-- Room Code & QR Code Button Container -->
        <div class="flex items-center gap-3 mb-6">
          <!-- Copy Room Code Button -->
          <button
            @click="copyRoomKey"
            class="relative group cursor-pointer flex-grow flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl px-6 transition-all duration-200 h-16"
          >
            <span class="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-indigo-600 dark:text-indigo-400">
              {{ roomKey }}
            </span>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 rounded-lg shadow-sm border border-indigo-50 dark:border-slate-600 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
              <!-- Copy Icon -->
              <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <!-- Check Icon -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <!-- Copy Tooltip -->
            <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200 whitespace-nowrap">
              {{ copied ? 'Copied!' : 'Click to copy' }}
            </span>
          </button>

          <!-- Show QR Code Button -->
          <button
            @click="openQRModal"
            class="cursor-pointer flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-2xl w-16 h-16 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-500 shadow-sm transition-all duration-200 flex-shrink-0"
            title="Show QR Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
        </div>

        <!-- Players List -->
        <div class="mt-5 border-t border-gray-100 dark:border-slate-700 pt-5 text-left">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Players ({{ players.length }}/{{ maxPlayers }})</h4>
          <div class="space-y-2.5 mb-6 max-h-72 overflow-y-auto">
            <!-- Dynamic Players List -->
            <div
              v-for="p in players"
              :key="p.player"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-xl"
            >
              <div class="flex items-center space-x-3 min-w-0 flex-shrink">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  :class="playerColorClasses(p.player)"
                >
                  P{{ p.player }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center space-x-1.5">
                    <template v-if="p.id === socket?.id && editingName">
                      <input
                        v-model="newName"
                        @keyup.enter="submitRename"
                        @blur="submitRename"
                        @keyup.escape="cancelRename"
                        ref="nameInput"
                        class="text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg px-2 py-1 w-28 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        maxlength="10"
                        autofocus
                      />
                    </template>
                    <template v-else-if="p.isAI">
                      <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                        Computer
                      </p>
                    </template>
                    <template v-else>
                      <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                        {{ p.name || (p.player === 1 ? 'Host' : `Player ${p.player}`) }}
                      </p>
                      <button
                        v-if="p.id === socket?.id"
                        @click="startEditing"
                        class="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                        title="Change name"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </template>
                    <span v-if="p.id === socket?.id" class="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex-shrink-0">(You)</span>
                  </div>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">Player {{ p.player }}</p>
                </div>
               </div>
               <div>
                 <template v-if="p.isAI">
                   <div v-if="isHost" class="flex items-center space-x-1.5">
                     <select
                       :value="p.difficulty || 'hard'"
                       @change="changeDifficulty($event)"
                       class="text-xs font-semibold py-1 px-2.5 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer dark:text-gray-200"
                     >
                       <option value="easy">Easy</option>
                       <option value="medium">Medium</option>
                       <option value="hard">Hard</option>
                     </select>
                     <button
                       @click="removeAIOpponent"
                       class="p-1 text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                       title="Remove computer"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                     </button>
                   </div>
                   <span
                     v-else
                     class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                     :class="{
                       'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200': p.difficulty === 'easy',
                       'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200': p.difficulty === 'medium',
                       'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200': p.difficulty === 'hard' || !p.difficulty
                     }"
                   >
                     {{ p.difficulty || 'hard' }}
                   </span>
                 </template>
                 <template v-else>
                   <span
                     v-if="p.ready"
                     class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200"
                   >
                     Ready
                   </span>
                   <span
                     v-else
                     class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200"
                   >
                     Not Ready
                   </span>
                 </template>
               </div>
             </div>

             <!-- Wait placeholder for available player slots -->
             <div
               v-for="i in Math.max(0, maxPlayers - players.length)"
               :key="'waiting-' + i"
               class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-600/50 border-dashed rounded-xl text-gray-400 dark:text-gray-500"
             >
               <div class="flex items-center space-x-3">
                 <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 border border-dashed border-gray-300 dark:border-slate-500 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                   ?
                 </div>
                 <div>
                    <p class="text-sm font-medium italic flex items-center space-x-1">Waiting for player<WaitingIndicator /></p>
                   <p class="text-[10px]">Player {{ players.length + i }}</p>
                 </div>
               </div>
               <div>
                 <button
                   v-if="isHost && players.length === 1 && supportsAI"
                   @click="addAIOpponent('hard')"
                   class="text-xs font-bold py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                     <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                   </svg>
                   Play vs AI
                 </button>
               </div>
             </div>
          </div>

          <!-- Trivia Options (host only) -->
          <div v-if="gameId === 'trivia' && isHost" class="pt-4 border-t border-gray-100 dark:border-slate-700">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Trivia Settings</h4>
            <div class="flex gap-2 mb-2">
              <div class="flex-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Category</label>
                <select
                  v-model="triviaCategory"
                  @change="updateTriviaOptions"
                  class="w-full text-xs font-semibold py-2 px-3 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer dark:text-gray-200"
                >
                  <option :value="null">Any Category</option>
                  <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">{{ cat.name }}</option>
                </select>
              </div>
              <div class="flex-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Difficulty</label>
                <select
                  v-model="triviaDifficulty"
                  @change="updateTriviaOptions"
                  class="w-full text-xs font-semibold py-2 px-3 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer dark:text-gray-200"
                >
                  <option value="">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Pictionary Options (host only) -->
          <div v-if="gameId === 'pictionary' && isHost" class="pt-4 border-t border-gray-100 dark:border-slate-700">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Game Settings</h4>
            <div class="flex gap-2 mb-2">
              <div class="flex-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Rounds Per Player</label>
                <select
                  v-model="pictionaryRounds"
                  @change="updatePictionaryOptions"
                  class="w-full text-xs font-semibold py-2 px-3 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer dark:text-gray-200"
                >
                  <option :value="1">1 round</option>
                  <option :value="2">2 rounds</option>
                  <option :value="3">3 rounds</option>
                  <option :value="4">4 rounds</option>
                  <option :value="5">5 rounds</option>
                </select>
              </div>
              <div class="flex-1">
                <label class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Round Duration</label>
                <select
                  v-model="pictionaryTimer"
                  @change="updatePictionaryOptions"
                  class="w-full text-xs font-semibold py-2 px-3 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer dark:text-gray-200"
                >
                  <option :value="30">30 seconds</option>
                  <option :value="60">60 seconds</option>
                  <option :value="90">90 seconds</option>
                  <option :value="120">120 seconds</option>
                  <option :value="180">180 seconds</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Escape Room Options (host only) -->
          <div v-if="gameId === 'escape-room' && isHost" class="pt-4 border-t border-gray-100 dark:border-slate-700">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Escape Room</h4>
            <label class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Select Room</label>
            <button
              @click="openEscapeRoomSelector"
              class="w-full flex items-center justify-between text-xs font-semibold py-2 px-3 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-xl shadow-sm cursor-pointer dark:text-gray-200 hover:border-gray-400 dark:hover:border-slate-400 transition-colors"
            >
              <span class="flex items-center gap-2">
                <span :class="starColor(selectedRoomDifficulty)" class="text-[18px] leading-none">{{ roomStars(selectedRoomDifficulty) }}</span>
                <span>{{ selectedRoomName || 'Choose a room...' }}</span>
              </span>
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 8v8m4-8v8m4-8v8m4-8v8" />
              </svg>
            </button>
          </div>

          <!-- Toggle Ready and Start Game buttons -->
          <div class="space-y-2.5 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button
              @click="toggleReady"
              class="w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm text-sm cursor-pointer border"
              :class="isReady
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'"
            >
              {{ isReady ? 'Mark as Not Ready' : 'Mark as Ready' }}
            </button>

            <button
              v-if="isHost"
              @click="startGame"
              :disabled="!canStartGame"
              class="w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm text-sm text-white"
              :class="canStartGame ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-md' : 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>

      <!-- If no room key (e.g. direct url navigation or player disconnected) -->
      <div v-else class="py-4">
        <div v-if="connectionStatus" class="mb-6">
          <div class="inline-flex p-3 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Connection Lost</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ connectionStatus }}</p>
        </div>
        <div v-else class="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">No active game room detected.</p>
        </div>
        <router-link to="/menu" class="inline-block bg-gray-800 hover:bg-gray-900 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 mt-2">
          Back to Main Menu
        </router-link>
      </div>

      <!-- Leave / Cancel Button (only shown if room exists) -->
      <div v-if="roomKey" class="mt-4 sm:mt-6 pt-3 border-t border-gray-100 dark:border-slate-700/50">
        <router-link
          to="/menu"
          class="inline-block w-full text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 text-xs font-semibold text-center py-2 rounded-lg transition-colors duration-200"
        >
          {{ isHost ? 'Cancel & Close Room' : 'Leave Room' }}
        </router-link>
      </div>
    </div>
  </div>

  <!-- Escape Room Selector Modal -->
  <EscapeRoomSelector
    :is-open="isEscapeRoomSelectorOpen"
    :available-rooms="availableEscapeRooms"
    :selected-room-id="selectedEscapeRoom"
    :theme="selectorTheme"
    @close="closeEscapeRoomSelector"
    @select-room="onSelectEscapeRoom"
  />

  <!-- QR Code Modal -->
  <BaseModal
    :is-open="isQRModalOpen"
    title="Scan to Join Game"
    :subtitle="'Room: ' + roomKey"
    max-width="max-w-sm"
    @close="closeQRModal"
  >
    <div class="flex flex-col items-center">
      <div class="bg-white p-3 rounded-2xl shadow-inner border border-slate-700/50 mb-4 flex items-center justify-center">
        <canvas ref="qrCanvas" class="w-48 h-48 sm:w-56 sm:h-56"></canvas>
      </div>
      <p class="text-xs text-slate-400 text-center leading-relaxed max-w-[260px]">
        Scan this QR code with a friend's phone camera to join this game room instantly.
      </p>
    </div>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Socket } from 'socket.io-client';
import QRCode from 'qrcode';
import WaitingIndicator from './ui/WaitingIndicator.vue';
import BaseModal from './ui/BaseModal.vue';
import EscapeRoomSelector from './games/EscapeRoomSelector.vue';
import gamesData from '../assets/games.json';

export default defineComponent({
  components: { WaitingIndicator, BaseModal, EscapeRoomSelector },
  emits: ['update-connection-status', 'update-player', 'update-room-key'],
  props: {
    socket: {
      type: Object as PropType<Socket>,
      required: true,
    },
    connectionStatus: String,
    roomKey: String,
    player: Number,
    gameId: {
      type: String,
      default: 'black-hole',
    },
    gameName: {
      type: String,
      default: 'Black Hole',
    },
    initialGameState: {
      type: Object,
      default: () => ({ players: [] }),
    },
  },
  data() {
    return {
      copied: false,
      isQRModalOpen: false,
      editingName: false,
      newName: '',
      triviaCategory: null as string | null,
      triviaDifficulty: '',
      pictionaryTimer: 60,
      pictionaryRounds: 2,
      selectedEscapeRoom: 'abandoned-lab',
      isEscapeRoomSelectorOpen: false,
      pageDarkMode: document.documentElement.classList.contains('dark'),
      darkModeObserver: null as MutationObserver | null,
    };
  },
  computed: {
    isHost(): boolean {
      return this.player === 1;
    },
    supportsAI(): boolean {
      const game = gamesData.find((g) => g.id === this.gameId);
      return !!game?.supportsAI;
    },
    players(): any[] {
      return this.initialGameState?.players || [];
    },
    minPlayers(): number {
      return this.initialGameState?.minPlayers ?? 2;
    },
    maxPlayers(): number {
      return this.initialGameState?.maxPlayers ?? 2;
    },
    isReady(): boolean {
      const me = this.players.find((p: any) => p.id === this.socket?.id);
      return !!me?.ready;
    },
    canStartGame(): boolean {
      return this.players.length >= this.minPlayers && this.players.every((p: any) => p.ready);
    },
    categories(): Array<{ slug: string; name: string }> {
      return [
        { slug: 'general_knowledge', name: 'General Knowledge' },
        { slug: 'film_and_tv', name: 'Film & TV' },
        { slug: 'music', name: 'Music' },
        { slug: 'arts_and_literature', name: 'Arts & Literature' },
        { slug: 'science', name: 'Science' },
        { slug: 'geography', name: 'Geography' },
        { slug: 'history', name: 'History' },
        { slug: 'sport_and_leisure', name: 'Sports & Leisure' },
        { slug: 'society_and_culture', name: 'Society & Culture' },
        { slug: 'food_and_drink', name: 'Food & Drink' },
      ];
    },
    availableEscapeRooms(): Array<{ id: string; name: string; description: string; difficulty: string }> {
      return this.initialGameState?.availableRooms || [];
    },
    selectedRoomName(): string {
      const room = this.availableEscapeRooms.find((r) => r.id === this.selectedEscapeRoom);
      return room?.name || '';
    },
    selectedRoomDifficulty(): string {
      const room = this.availableEscapeRooms.find((r) => r.id === this.selectedEscapeRoom);
      return room?.difficulty || '';
    },
    selectorTheme(): string {
      return this.pageDarkMode ? 'dark' : 'light';
    },
  },
  watch: {
    'players.length'(newLength) {
      if (newLength >= this.maxPlayers && this.isQRModalOpen) {
        this.closeQRModal();
      }
    },
    'initialGameState.selectedRoomId'(newVal) {
      if (newVal) {
        this.selectedEscapeRoom = newVal;
      }
    },
  },
  methods: {
    generateQRCode() {
      if (!this.roomKey) return;
      this.$nextTick(() => {
        const canvas = this.$refs.qrCanvas as HTMLCanvasElement;
        if (canvas) {
          const relativePath = this.$router.resolve({ name: 'Menu', query: { join: this.roomKey } }).href;
          const joinUrl = relativePath.startsWith('#')
            ? window.location.origin + window.location.pathname + relativePath
            : window.location.origin + relativePath;
          QRCode.toCanvas(
            canvas,
            joinUrl,
            {
              width: 256,
              margin: 1.5,
              color: {
                dark: '#4f46e5', // indigo-600 color to match theme
                light: '#ffffff',
              },
            },
            (error) => {
              if (error) console.error('Failed to generate QR Code:', error);
            }
          );
        }
      });
    },
    async openQRModal() {
      this.isQRModalOpen = true;
      await this.$nextTick();
      this.generateQRCode();
    },
    closeQRModal() {
      this.isQRModalOpen = false;
    },
    async copyRoomKey() {
      if (!this.roomKey) return;
      try {
        await navigator.clipboard.writeText(this.roomKey);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    },
    updateTriviaOptions() {
      if (!this.socket || !this.roomKey) return;
      const cat = this.categories.find((c) => c.slug === this.triviaCategory);
      this.socket.emit('set-trivia-options', {
        roomKey: this.roomKey,
        categorySlug: this.triviaCategory || undefined,
        categoryName: cat?.name,
        difficulty: this.triviaDifficulty || undefined,
      });
    },
    updatePictionaryOptions() {
      if (!this.socket || !this.roomKey) return;
      this.socket.emit('set-pictionary-options', {
        roomKey: this.roomKey,
        timerDuration: this.pictionaryTimer,
        roundsPerPlayer: this.pictionaryRounds,
      });
    },
    openEscapeRoomSelector() {
      this.isEscapeRoomSelectorOpen = true;
    },
    closeEscapeRoomSelector() {
      this.isEscapeRoomSelectorOpen = false;
    },
    onSelectEscapeRoom(id: string) {
      this.selectedEscapeRoom = id;
      this.updateEscapeRoomOptions();
    },
    selectRoom(id: string) {
      this.selectedEscapeRoom = id;
      this.updateEscapeRoomOptions();
    },
    updateEscapeRoomOptions() {
      if (!this.socket || !this.roomKey) return;
      this.socket.emit('set-escape-room-options', {
        roomKey: this.roomKey,
        roomId: this.selectedEscapeRoom,
      });
    },
    toggleReady() {
      if (this.socket && this.roomKey) {
        this.socket.emit('toggle-ready', { roomKey: this.roomKey });
      }
    },
    addAIOpponent(difficulty: 'easy' | 'medium' | 'hard' = 'hard') {
      if (this.socket && this.roomKey) {
        this.socket.emit('add-ai', { roomKey: this.roomKey, difficulty });
      }
    },
    changeDifficulty(event: Event) {
      const select = event.target as HTMLSelectElement;
      const difficulty = select.value as 'easy' | 'medium' | 'hard';
      if (this.socket && this.roomKey) {
        this.socket.emit('change-difficulty', { roomKey: this.roomKey, difficulty });
      }
    },
    removeAIOpponent() {
      if (this.socket && this.roomKey) {
        this.socket.emit('remove-ai', { roomKey: this.roomKey });
      }
    },
    startGame() {
      if (this.socket && this.roomKey && this.canStartGame) {
        this.socket.emit('start-game', { roomKey: this.roomKey });
      }
    },
    startEditing() {
      const me = this.players.find((p: any) => p.id === this.socket?.id);
      this.newName = me?.name || '';
      this.editingName = true;
      this.$nextTick(() => {
        (this.$refs.nameInput as HTMLInputElement[])?.[0]?.focus();
      });
    },
    submitRename() {
      if (!this.editingName) return;
      this.editingName = false;
      const name = this.newName.trim().slice(0, 10);
      if (name && this.socket && this.roomKey) {
        this.socket.emit('rename-player', { roomKey: this.roomKey, name });
      }
    },
    cancelRename() {
      this.editingName = false;
    },
    difficultyLabel(difficulty: string): string {
      const labels: Record<string, string> = {
        'very-easy': 'Very Easy',
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
        'extreme': 'Extreme',
      };
      return labels[difficulty] || difficulty;
    },
    starColor(difficulty: string): string {
      const colors: Record<string, string> = {
        'very-easy': 'text-emerald-500 dark:text-emerald-400',
        'easy': 'text-cyan-500 dark:text-cyan-400',
        'medium': 'text-amber-500 dark:text-amber-400',
        'hard': 'text-rose-500 dark:text-rose-400',
        'extreme': 'text-purple-500 dark:text-purple-400',
      };
      return colors[difficulty] || 'text-gray-400';
    },
    roomStars(difficulty: string): string {
      const count: Record<string, number> = {
        'very-easy': 1,
        'easy': 2,
        'medium': 3,
        'hard': 4,
        'extreme': 5,
      };
      const n = count[difficulty] || 0;
      return '★'.repeat(n) + '☆'.repeat(5 - n);
    },
    playerColorClasses(playerNum: number) {
      const colors = [
        'bg-indigo-100 text-indigo-600',
        'bg-pink-100 text-pink-600',
        'bg-emerald-100 text-emerald-600',
        'bg-orange-100 text-orange-600',
        'bg-purple-100 text-purple-600',
        'bg-cyan-100 text-cyan-600',
        'bg-rose-100 text-rose-600',
        'bg-amber-100 text-amber-600',
      ];
      return colors[(playerNum - 1) % colors.length];
    },
  },
  beforeRouteLeave(to: any, from: any, next: any) {
    // Only tell the server to clear the room if we are NOT navigating to the game itself
    const gamePathPrefix = `/${this.gameId}/game`;
    if (this.roomKey && !to.path.startsWith(gamePathPrefix)) {
      this.socket.emit('leave-room', { roomKey: this.roomKey });
    }
    next();
  },
  mounted() {
    this.darkModeObserver = new MutationObserver(() => {
      this.pageDarkMode = document.documentElement.classList.contains('dark');
    });
    this.darkModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  },
  beforeUnmount() {
    this.darkModeObserver?.disconnect();
  },
});
</script>
