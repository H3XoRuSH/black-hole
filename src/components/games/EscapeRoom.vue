<template>
  <div v-if="isValidGame"
    class="flex-grow flex flex-col items-center h-full p-2 sm:p-4 md:p-6 select-none overflow-hidden"
  >
    <div class="w-full max-w-xl flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-2 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-amber-400/80 font-mono tracking-wider">
          {{ solvedCount }}/{{ totalPuzzles }} solved
        </span>
        <span class="text-sm text-slate-600 font-mono">
          Hints: {{ gameState.hintsUsed }}
        </span>
      </div>
      <div class="flex items-center space-x-1">
        <button
          @click="openHowToPlay"
          class="text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 p-1.5 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 border border-transparent hover:border-blue-200/50 transition-all"
          title="How to Play"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <router-link to="/menu"
          class="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-1.5 rounded-lg cursor-pointer active:scale-95"
          title="Leave Game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </router-link>
      </div>
    </div>

    <div class="flex-grow flex flex-col items-center justify-start w-full overflow-y-auto py-1 custom-scroll">
      <div v-if="!escaped" class="w-full max-w-xl space-y-3">
        <div
          v-if="showIntro"
          class="bg-white/90 dark:bg-slate-900/90 border border-amber-300/40 dark:border-amber-700/30 rounded-2xl p-4 sm:p-6 shadow-xl"
        >
          <h2 class="text-lg font-bold text-amber-400 mb-2">{{ gameState.roomName || 'Escape Room' }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{{ gameState.roomDescription }}</p>
          <div class="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
            <p class="text-base text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{{ gameState.roomIntro }}</p>
          </div>
          <div class="flex justify-center mt-4">
            <button
              @click="beginGame"
              class="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-base"
            >
              Begin
            </button>
          </div>
        </div>

        <div v-if="!showIntro" class="space-y-3" :class="{ 'opacity-65 pointer-events-none transition-opacity duration-200': navigating }">
          <div class="flex items-center space-x-1.5 flex-wrap">
            <button
              v-for="(loc, idx) in gameState.locations"
              :key="loc.id"
              v-show="isLocationAccessible(idx)"
              @click="selectLocation(loc.id)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer border"
              :class="selectedLocationId === loc.id
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-400'
                : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-400'"
            >
              {{ loc.name }}
            </button>
          </div>

          <div v-if="currentLocation" class="flex items-center space-x-1 text-xs text-slate-500 flex-wrap">
            <button
              @click="navigateBreadcrumb(null)"
              class="hover:text-amber-400 transition-colors cursor-pointer"
            >
              {{ currentLocation.name }}
            </button>
            <template v-for="(nodeId, idx) in currentPath" :key="nodeId">
              <span class="text-slate-700">→</span>
              <button
                @click="navigateBreadcrumb(nodeId)"
                class="hover:text-amber-400 transition-colors cursor-pointer"
                :class="{ 'text-amber-400 font-semibold': idx === currentPath.length - 1 }"
              >
                {{ getNodeLabel(nodeId) }}
              </button>
            </template>
          </div>

          <div
            v-if="currentPath.length === 0 && currentLocation"
            class="bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-lg"
          >
            <div class="flex items-center space-x-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-base font-bold text-amber-400 uppercase tracking-wider">{{ currentLocation.name }}</span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-500 italic whitespace-pre-line">{{ currentLocation.description }}</p>
          </div>

          <div
            v-if="currentNode"
            class="bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl"
          >
            <h3 class="text-sm font-bold text-amber-500/70 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>
                {{ currentNode.label }}
                <span v-if="currentNode.isMeta" class="ml-1 text-amber-400">&#9733;</span>
              </span>
              <button
                @click="goBack"
                class="text-xs text-slate-500 hover:text-amber-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
            </h3>

            <div class="bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-3 sm:p-4 mb-4">
              <template v-for="(seg, i) in splitArtSegments(isNodeStillLocked(currentNode) ? (currentNode.lockedNarrative || currentNode.narrative) : currentNode.narrative)" :key="'nar-'+i">
                <pre v-if="seg.type === 'art'" class="text-sm text-slate-600 dark:text-slate-400 mb-2 font-mono leading-snug overflow-x-auto">{{ seg.content }}</pre>
                <p v-else class="text-sm text-slate-600 dark:text-slate-400 italic mb-2 leading-relaxed whitespace-pre-line">{{ seg.content }}</p>
              </template>
              <template v-if="currentNode.type === 'puzzle'">
                <div class="border-t border-slate-300/50 dark:border-slate-700/30 my-3"></div>
                <template v-for="(seg, i) in splitArtSegments(currentNode.question || '')" :key="'q-'+i">
                  <pre v-if="seg.type === 'art'" class="text-base text-slate-800 dark:text-slate-200 font-mono leading-snug overflow-x-auto">{{ seg.content }}</pre>
                  <p v-else class="text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">{{ seg.content }}</p>
                </template>
              </template>
            </div>

            <div v-if="currentNode.locationId !== selectedLocationId" class="flex justify-center mb-3">
              <button
                @click="selectLocation(currentNode.locationId)"
                class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all duration-150 cursor-pointer active:scale-95 text-sm"
              >
                Go to {{ getLocationName(currentNode.locationId) }}
              </button>
            </div>

            <div v-if="currentNode.sound && !currentNode.solved" class="flex justify-center mb-4">
              <button
                @click="playPuzzleSound(currentNode)"
                :disabled="isSoundPlaying"
                class="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-sm flex items-center space-x-1.5"
              >
                <svg v-if="!isSoundPlaying" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l4.7-3.5a.5.5 0 01.8.4v12.6a.5.5 0 01-.8.4l-4.7-3.5H4a1 1 0 01-1-1v-4a1 1 0 011-1h2.5z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l4.7-3.5a.5.5 0 01.8.4v12.6a.5.5 0 01-.8.4l-4.7-3.5H4a1 1 0 01-1-1v-4a1 1 0 011-1h2.5z" />
                </svg>
                <span>{{ isSoundPlaying ? 'Playing...' : 'Play Sound' }}</span>
              </button>
            </div>

            <div v-if="revealedHints.length > 0" class="mb-4 space-y-1.5">
              <div
                v-for="(hint, idx) in revealedHints"
                :key="idx"
                class="bg-amber-100/80 dark:bg-amber-900/15 border border-amber-300/40 dark:border-amber-700/20 rounded-lg px-3 py-2 flex items-start space-x-2"
              >
                <span class="text-amber-600 dark:text-amber-500 font-bold text-sm flex-shrink-0 mt-px">Hint {{ idx + 1 }}:</span>
                <span class="text-sm text-amber-700 dark:text-amber-300/90 leading-relaxed">{{ hint }}</span>
              </div>
            </div>

            <div v-if="currentNode.type === 'puzzle' && !currentNode.solved" class="flex items-center space-x-2 mb-3">
              <input
                v-model="answer"
                type="text"
                placeholder="Type your answer..."
                class="flex-grow bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-base text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                @keyup.enter="submitAnswer"
              />
              <button
                @click="submitAnswer"
                :disabled="!answer.trim()"
                class="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-base flex-shrink-0"
              >
                Submit
              </button>
            </div>

            <div v-if="currentNode.type === 'puzzle' && currentNode.solved" class="flex items-center space-x-2 mb-3 text-xs text-emerald-600 dark:text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Answer: {{ currentNode.answer }}</span>
            </div>

            <div v-if="currentNode.type === 'item' && currentNode.rewardItem && !hasItem(currentNode.rewardItem) && !isItemDiscovered(currentNode.id)" class="flex justify-center mb-3">
              <button
                @click="interactItem(currentNode.id)"
                class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-sm"
              >
                Pick Up
              </button>
            </div>

            <div v-if="isNodeStillLocked(currentNode) && hasItem(currentNode.lockedByItem || '')" class="flex justify-center mb-3">
              <button
                @click="useItem(currentNode.id)"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 text-sm"
              >
                Use {{ getItemLabel(currentNode.lockedByItem || '') }}
              </button>
            </div>

            <div v-if="currentNode.type === 'puzzle' && !currentNode.solved" class="flex justify-between items-center">
              <button
                @click="requestHint(currentNode.id)"
                :disabled="currentNodeHintsRemaining <= 0"
                class="text-sm text-amber-600/80 dark:text-amber-400/80 hover:text-amber-500 dark:hover:text-amber-300 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>{{ hintButtonText }}</span>
              </button>
              <span class="text-sm text-slate-500 dark:text-slate-600 font-mono">
                Attempts: {{ attemptsForNode(currentNode.id) }}
              </span>
            </div>
          </div>

          <div v-if="currentChildren.length > 0" class="space-y-2">
            <div
              v-for="child in visibleChildren"
              :key="child.id"
              @click="navigateToNode(child.id)"
              class="bg-white/80 dark:bg-slate-900/80 border rounded-xl px-4 py-3 shadow-sm cursor-pointer hover:shadow-md hover:border-amber-500/40 transition-all duration-150"
              :class="child.isMeta
                ? 'border-amber-400/40 hover:border-amber-400/60'
                : 'border-slate-300 dark:border-slate-800'"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 min-w-0">
                  <span
                    v-if="child.isMeta"
                    class="text-amber-400 text-lg flex-shrink-0"
                  >&#9733;</span>
                  <svg v-else-if="child.type === 'locked' && isNodeStillLocked(child)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <svg v-else-if="child.type === 'puzzle' && child.solved" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span v-else-if="child.type === 'item' && child.rewardItem && hasItem(child.rewardItem)" class="text-xs text-emerald-500 flex-shrink-0 font-bold">&#10003;</span>
                  <span v-else-if="child.type === 'item' && isItemDiscovered(child.id)" class="text-xs text-slate-500 flex-shrink-0 italic">Taken</span>
                  <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {{ child.label }}
                  </h4>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <button
                    v-if="child.type === 'item' && child.rewardItem && !hasItem(child.rewardItem) && !isItemDiscovered(child.id)"
                    @click.stop="interactItem(child.id)"
                    class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    Pick Up
                  </button>
                  <button
                    v-if="isNodeStillLocked(child) && hasItem(child.lockedByItem || '')"
                    @click.stop="useItem(child.id)"
                    class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    Unlock
                  </button>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <p v-if="isNodeStillLocked(child) && child.lockedNarrative" class="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-1 italic">
                {{ child.lockedNarrative }}
              </p>
              <p v-else class="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-1">
                {{ getNarrativeExcerpt(child) }}
              </p>
            </div>
          </div>

          <div v-if="currentChildren.length === 0 && !currentNode" class="text-center text-slate-600 dark:text-slate-500 py-8">
            <p class="text-sm">Nothing here to explore.</p>
          </div>

          <div v-if="playerInventory.length > 0" class="mt-3">
            <button
              @click="showInventory = !showInventory"
              class="w-full flex items-center justify-between bg-indigo-100/80 dark:bg-indigo-900/20 border border-indigo-300/40 dark:border-indigo-700/20 rounded-xl px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-colors cursor-pointer"
            >
              <span>Inventory ({{ playerInventory.length }})</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 transition-transform duration-200"
                :class="{ 'rotate-180': showInventory }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="showInventory" class="bg-indigo-50/80 dark:bg-indigo-900/10 border border-indigo-300/40 dark:border-indigo-700/20 rounded-xl mt-1 divide-y divide-indigo-200/50 dark:divide-indigo-800/30">
              <div
                v-for="item in playerInventory"
                :key="item"
                class="px-4 py-2 flex items-center space-x-2"
              >
                <span class="text-xs text-indigo-600 dark:text-indigo-400">&#9679;</span>
                <span class="text-sm text-indigo-700 dark:text-indigo-300">{{ getItemLabel(item) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="escaped" class="w-full max-w-xl">
        <div class="bg-white/90 dark:bg-slate-900/90 border border-amber-300/40 dark:border-amber-700/30 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
          <div class="text-6xl mb-4">&#x1F513;</div>
          <h2 class="text-2xl font-bold text-amber-400 mb-2">You Escaped!</h2>
          <p class="text-base text-slate-500 dark:text-slate-400 mb-6">The team solved all {{ totalPuzzles }} puzzles and escaped "{{ gameState.roomName }}"!</p>

          <div class="bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl p-4 mb-4 text-left space-y-1.5">
            <p class="text-sm text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-2">Puzzle Summary</p>
            <p
              v-for="n in gameState.nodes.filter((n: EscapeRoomNode) => n.type === 'puzzle')"
              :key="n.id"
              class="text-sm flex items-center space-x-2"
            >
              <span :class="n.solved ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">&#9679;</span>
              <span class="text-slate-700 dark:text-slate-300">{{ getNodeLocationName(n) }} — {{ n.label }}</span>
              <span class="text-slate-500 dark:text-slate-600">
                {{ n.solved ? 'Solved' : 'Unsolved' }}
              </span>
            </p>
          </div>

          <p class="text-sm text-slate-600 dark:text-slate-500 mb-4">
            Wrong answers: <span class="text-slate-700 dark:text-slate-300 font-bold">{{ gameState.wrongAttempts }}</span> |
            Hints used: <span class="text-slate-700 dark:text-slate-300 font-bold">{{ gameState.hintsUsed }}</span>
          </p>

          <router-link to="/menu"
            class="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition-all duration-200 cursor-pointer active:scale-95 text-base"
          >
            Back to Menu
          </router-link>
        </div>
      </div>
    </div>

    <!-- Floating Map Button -->
    <button
      v-if="!showIntro && !escaped"
      @click="showMap = true"
      class="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-full p-4 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-400/30 group"
      title="View Area Map & Chat"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <span v-if="isMultiplayer && unreadChatCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
        {{ unreadChatCount }}
      </span>
    </button>

    <!-- Map Modal Overlay -->
    <div
      v-if="showMap"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300"
      @click.self="showMap = false"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {{ currentLocation?.name }} {{ isMultiplayer ? 'Operations Desk' : 'Area Map' }}
            </h3>
          </div>
          <button
            @click="showMap = false"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tabs Header (Only in multiplayer) -->
        <div v-if="isMultiplayer" class="flex border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 px-4 flex-shrink-0">
          <button
            @click="activeTab = 'map'"
            :class="[
              activeTab === 'map'
                ? 'border-amber-500 text-amber-500 dark:text-amber-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-200 dark:hover:border-slate-750'
            ]"
            class="flex items-center space-x-2 px-4 py-3 border-b-2 text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Area Map</span>
          </button>
          <button
            @click="activeTab = 'chat'"
            :class="[
              activeTab === 'chat'
                ? 'border-amber-500 text-amber-500 dark:text-amber-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-200 dark:hover:border-slate-750'
            ]"
            class="flex items-center space-x-2 px-4 py-3 border-b-2 text-xs uppercase tracking-wider transition-all cursor-pointer relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Team Chat</span>
            <span v-if="unreadChatCount > 0" class="w-2 h-2 bg-rose-500 rounded-full animate-ping absolute top-3 right-2"></span>
          </button>
        </div>

        <!-- Tabs Body -->
        <div class="flex-grow flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
          <!-- Tab: Map -->
          <div v-if="!isMultiplayer || activeTab === 'map'" class="flex-grow p-4 sm:p-6 flex flex-col items-center justify-center min-h-[300px] overflow-y-auto custom-scroll">
            <div class="w-full max-w-2xl flex flex-col space-y-3">
              <div class="w-full aspect-[3/2] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden p-2">
                <!-- SVG Tree Map -->
                <svg viewBox="0 0 600 400" class="w-full h-full">
                  <!-- Grid background pattern -->
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-900" stroke-width="1.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  <!-- Connecting Paths -->
                  <path
                    v-for="link in mapLinks"
                    :key="link.id"
                    :d="`M ${link.x1} ${link.y1} C ${link.x1} ${(link.y1 + link.y2) / 2}, ${link.x2} ${(link.y1 + link.y2) / 2}, ${link.x2} ${link.y2}`"
                    fill="none"
                    class="stroke-slate-300 dark:stroke-slate-800"
                    stroke-width="3"
                    stroke-linecap="round"
                  />

                  <!-- Node Circles -->
                  <g
                    v-for="node in mapNodes"
                    :key="node.id"
                    class="cursor-pointer group"
                    @click="jumpToNode(node.id)"
                    @mouseenter="hoveredNode = node"
                    @mouseleave="hoveredNode = null"
                  >
                    <!-- Active pulsing ring outline -->
                    <circle
                      v-if="node.isCurrent"
                      :cx="node.x"
                      :cy="node.y"
                      r="30"
                      fill="none"
                      class="stroke-amber-500 stroke-[3px] animate-pulse"
                    />

                    <!-- Node Base Circle -->
                    <circle
                      :cx="node.x"
                      :cy="node.y"
                      r="22"
                      class="fill-slate-50 dark:fill-[#0b1329] stroke-2 transition-all duration-150 origin-center"
                      :class="[
                        node.isCurrent ? 'stroke-amber-500 dark:stroke-amber-400 stroke-2' : getNodeBorderClass(node)
                      ]"
                    />
                    <!-- SVG Icon Overlays -->
                    <g class="pointer-events-none select-none">
                      <!-- Dialogue Icon (Speech bubbles) -->
                      <path
                        v-if="node.type === 'dialogue'"
                        d="M -6 -5 h 12 a 3 3 0 0 1 3 3 v 5 a 3 3 0 0 1 -3 3 h -5 l -4 4 v -4 h -3 a 3 3 0 0 1 -3 -3 v -5 a 3 3 0 0 1 3 -3 z"
                        :transform="`translate(${node.x}, ${node.y})`"
                        class="fill-blue-400"
                      />
                      <!-- Puzzle Icon (Question mark) -->
                      <text
                        v-else-if="node.type === 'puzzle' && !node.solved"
                        :x="node.x"
                        :y="node.y"
                        text-anchor="middle"
                        dominant-baseline="central"
                        class="font-bold text-lg fill-amber-500 dark:fill-amber-400 select-none pointer-events-none"
                      >?</text>
                      <!-- Solved Checkmark Icon -->
                      <path
                        v-else-if="node.type === 'puzzle' && node.solved"
                        d="M -6 -1 L -2 3 L 6 -5"
                        fill="none"
                        class="stroke-emerald-500 dark:stroke-emerald-400"
                        stroke-width="3.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :transform="`translate(${node.x}, ${node.y})`"
                      />
                      <!-- Item Key Icon -->
                      <path
                        v-else-if="node.type === 'item'"
                        d="M -6 0 a 4 4 0 1 1 8 0 a 4 4 0 0 1 -8 0 M 0 0 h 8 v 3 h -2 v -3 h -2 v 3 h -2"
                        fill="none"
                        :class="isItemDiscovered(node.id) ? 'stroke-slate-500' : 'stroke-indigo-400'"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :transform="`translate(${node.x}, ${node.y})`"
                      />
                      <!-- Root Home Icon -->
                      <path
                        v-else-if="node.type === 'root'"
                        d="M 0 -9 L -9 1 h 3 v 9 h 12 v -9 h 3 z"
                        :transform="`translate(${node.x}, ${node.y}) scale(0.75)`"
                        class="fill-amber-500 dark:fill-amber-400"
                      />
                      <!-- Locked/Unlocked Lock Icon -->
                      <path
                        v-else-if="node.type === 'locked'"
                        d="M -6 -2 v -6 c 0 -3.3 2.7 -6 6 -6 s 6 2.7 6 6 v 6 h 2 v 14 h -16 v -14 z M -3 -2 h 6 v -6 c 0 -1.7 -1.3 -3 -3 -3 s -3 1.3 -3 3 z"
                        :transform="`translate(${node.x}, ${node.y}) scale(0.8)`"
                        :class="isNodeStillLocked(node) ? 'fill-rose-500' : 'fill-emerald-400'"
                      />
                    </g>
                  </g>
                </svg>
              </div>

              <!-- Hover Info Card -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 flex flex-col justify-center h-[104px] lg:h-[90px] w-full flex-shrink-0">
                <template v-if="hoveredNode">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] uppercase tracking-wider font-bold" :class="getNodeTypeColor(hoveredNode)">
                      {{ hoveredNode.type }}
                    </span>
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {{ getNodeStatusText(hoveredNode) }}
                    </span>
                  </div>
                  <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ hoveredNode.label }}
                  </h4>
                  <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-line line-clamp-3">
                    {{ hoveredNode.narrative }}
                  </p>
                </template>
                <template v-else>
                  <template v-if="currentNode">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-blue-400">
                        current location
                      </span>
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {{ getNodeStatusText(currentNode) }}
                      </span>
                    </div>
                    <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {{ currentNode.label }}
                    </h4>
                    <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-line line-clamp-3">
                      {{ isNodeStillLocked(currentNode) ? (currentNode.lockedNarrative || currentNode.narrative) : currentNode.narrative }}
                    </p>
                  </template>
                  <template v-else-if="currentLocation">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                        current location
                      </span>
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        Start
                      </span>
                    </div>
                    <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {{ currentLocation.name }}
                    </h4>
                    <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-line line-clamp-3">
                      {{ currentLocation.description }}
                    </p>
                  </template>
                </template>
              </div>
            </div>
          </div>

          <!-- Tab: Chat (Only shown in multiplayer) -->
          <div v-if="isMultiplayer && activeTab === 'chat'" class="flex-grow p-4 flex flex-col h-[380px] md:h-[450px] bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between flex-shrink-0">
              <span>Team Communications</span>
              <span class="font-mono text-[9px]">{{ chatMessages.length }} messages</span>
            </div>
            <div ref="chatMessagesRef" class="flex-grow overflow-y-auto p-2.5 space-y-3 rounded-xl bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 mb-3 custom-scroll">
              <div v-if="chatMessages.length === 0" class="flex items-center justify-center h-full text-xs text-slate-600 italic select-none">
                No messages yet. Coordinate here!
              </div>
              <div v-for="(msg, i) in chatMessages" :key="i" class="flex items-start space-x-2">
                <span class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" :class="getChatDotClass(msg.player)"></span>
                <div class="min-w-0">
                  <span class="text-xs font-semibold" :class="getChatNameColor(msg.player)">{{ getChatDisplayName(msg) }}</span>
                  <p class="text-xs text-slate-700 dark:text-slate-300 break-words mt-0.5">{{ msg.text }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0">
              <input
                v-model="chatInput"
                @keyup.enter="sendChatMessage"
                type="text"
                placeholder="Type a message to the team..."
                maxlength="200"
                class="flex-grow bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              <button
                @click="sendChatMessage"
                :disabled="!chatInput.trim()"
                class="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl p-2 transition-all duration-150 cursor-pointer active:scale-95 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 flex justify-end">
          <button
            @click="showMap = false"
            class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex flex-col items-center justify-center p-6">
    <p class="text-lg text-gray-500 font-medium">Invalid game state. Redirecting to lobby...</p>
  </div>

  <HowToPlayModal
    :is-open="isHowToPlayOpen"
    game-id="escape-room"
    @close="closeHowToPlay"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { Socket } from 'socket.io-client';
import { useGame } from '../../composables/useGame.js';
import { useToast } from '../../composables/useToast.js';
import type { EscapeRoomGameState as GameState, EscapeRoomNode, EscapeRoomLocation } from '../../types/shared.js';
import HowToPlayModal from '../modals/HowToPlayModal.vue';

export default defineComponent({
  name: 'EscapeRoom',
  components: { HowToPlayModal },
  emits: ['update-connection-status', 'update-player', 'update-room-key'],
  props: {
    socket: { type: Object as PropType<Socket>, required: true },
    player: { type: Number, required: true },
    roomKey: { type: String, required: true },
    initialGameState: { type: Object as PropType<GameState>, required: true },
    connectionStatus: String,
  },
  setup(props) {
    const gameState = ref<GameState>(
      props.initialGameState || {
        phase: 'playing',
        selectedRoomId: null,
        nodes: [],
        locations: [],
        players: [],
        winner: '',
        totalMoves: 0,
        hintsUsed: 0,
        playerNodePaths: {},
        playerInventories: {},
        unlockedNodes: [],
        visitedLocations: [],
        discoveredItems: [],
        attemptsPerNode: {},
        solvedNodes: [],
        lastAction: null,
      }
    );

    const answer = ref('');
    const { showToast } = useToast();
    const showIntro = computed(() => !gameState.value.introAcknowledged);
    const showInventory = ref(false);
    const showMap = ref(false);
    const hoveredNode = ref<any>(null);
    const selectedLocationId = ref('foyer');
    const prevSolvedCount = ref(0);
    const navigating = ref(false);
    let navigateTimeout: ReturnType<typeof setTimeout> | null = null;

    function startNavigating() {
      navigating.value = true;
      if (navigateTimeout) clearTimeout(navigateTimeout);
      navigateTimeout = setTimeout(() => {
        navigating.value = false;
      }, 3000);
    }

    const audioCtx = ref<AudioContext | null>(null);
    const isSoundPlaying = ref(false);
    const activeOscillators: OscillatorNode[] = [];

    const NOTE_FREQS: Record<string, number> = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
      G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
      low: 220, medium: 440, high: 880
    };

    const isHowToPlayOpen = ref(false);
    const openHowToPlay = () => {
      isHowToPlayOpen.value = true;
    };
    const closeHowToPlay = () => {
      isHowToPlayOpen.value = false;
    };

    function stopSound() {
      for (const osc of activeOscillators) {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      }
      activeOscillators.length = 0;
      isSoundPlaying.value = false;
    }

    async function playPuzzleSound(node: EscapeRoomNode) {
      if (!node?.sound) return;
      stopSound();

      if (!audioCtx.value) {
        audioCtx.value = new AudioContext();
      }
      if (audioCtx.value.state === 'suspended') {
        await audioCtx.value.resume();
      }

      const ctx = audioCtx.value;
      const { notes } = node.sound;
      let timeOffset = 0;

      for (const note of notes) {
        if (note.rest || !note.pitch) {
          timeOffset += note.dur / 1000;
          continue;
        }
        const freq = NOTE_FREQS[note.pitch];
        if (!freq) {
          timeOffset += note.dur / 1000;
          continue;
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + timeOffset;
        const endTime = startTime + note.dur / 1000;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.015);
        gain.gain.setValueAtTime(0.3, endTime - 0.015);
        gain.gain.linearRampToValueAtTime(0, endTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(endTime + 0.02);

        activeOscillators.push(osc);
        timeOffset += note.dur / 1000;
      }

      isSoundPlaying.value = true;
      const totalMs = timeOffset * 1000 + 100;
      setTimeout(() => {
        isSoundPlaying.value = false;
      }, totalMs);
    }

    function splitArtSegments(text: string): { type: 'text' | 'art'; content: string }[] {
      if (!text) return [{ type: 'text', content: '' }];

      const lines = text.split('\n');
      const isArt = lines.map((line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (trimmed.includes('|')) return true;
        const structural = (trimmed.match(/[\\/\-_.:*#@+~^\[\]{}()<>v^<>]/g) || []).length;
        const alphanum = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
        return structural > 0 && structural > alphanum * 2;
      });

      for (let j = 1; j < isArt.length - 1; j++) {
        if (!isArt[j] && isArt[j - 1] && isArt[j + 1]) {
          const alphanum = (lines[j].match(/[a-zA-Z0-9]/g) || []).length;
          if (alphanum <= 2) {
            isArt[j] = true;
          }
        }
      }

      const ranges: [number, number][] = [];
      let i = 0;
      while (i < isArt.length) {
        if (isArt[i]) {
          const start = i;
          while (i < isArt.length && (isArt[i] || lines[i].trim() === '')) i++;
          const artCount = isArt.slice(start, i).filter(Boolean).length;
          if (artCount >= 2) {
            ranges.push([start, i - 1]);
          }
        } else {
          i++;
        }
      }

      if (ranges.length === 0) return [{ type: 'text', content: text }];

      const segments: { type: 'text' | 'art'; content: string }[] = [];
      let lastEnd = -1;

      for (const [start, end] of ranges) {
        if (start > lastEnd + 1) {
          const textLines = lines.slice(lastEnd + 1, start).join('\n').trim();
          if (textLines) segments.push({ type: 'text', content: textLines });
        }
        const artLines = lines.slice(start, end + 1).join('\n');
        segments.push({ type: 'art', content: artLines });
        lastEnd = end;
      }

      if (lastEnd < lines.length - 1) {
        const textLines = lines.slice(lastEnd + 1).join('\n').trim();
        if (textLines) segments.push({ type: 'text', content: textLines });
      }

      return segments;
    }

    const playerId = computed(() => (props.socket as any)?.id || '');
    const currentPath = computed(() => gameState.value.playerNodePaths?.[playerId.value] || []);
    const playerInventory = computed(() => gameState.value.playerInventories?.[playerId.value] || []);
    const playerUnlockedNodes = computed(() => gameState.value.unlockedNodes || []);

    function findNode(nodeId: string): EscapeRoomNode | undefined {
      return gameState.value.nodes?.find((n: EscapeRoomNode) => n.id === nodeId);
    }

    function hasItem(itemId: string): boolean {
      return playerInventory.value.includes(itemId);
    }

    function isNodeStillLocked(node: EscapeRoomNode): boolean {
      if (!node.lockedByItem) return false;
      return !playerUnlockedNodes.value.includes(node.id);
    }

    function isItemDiscovered(nodeId: string): boolean {
      return (gameState.value.discoveredItems || []).includes(nodeId);
    }

    function getNarrativeExcerpt(node: EscapeRoomNode): string {
      const text = node.narrative || '';
      return text.length > 80 ? text.slice(0, 80) + '...' : text;
    }

    function getNodeLabel(nodeId: string): string {
      const node = findNode(nodeId);
      return node?.label || nodeId;
    }

    function getNodeLocationName(node: EscapeRoomNode): string {
      const loc = gameState.value.locations?.find((l: EscapeRoomLocation) => l.id === node.locationId);
      return loc?.name || node.locationId;
    }

    function getLocationName(locationId: string): string {
      const loc = gameState.value.locations?.find((l: EscapeRoomLocation) => l.id === locationId);
      return loc?.name || locationId;
    }

    const currentLocation = computed(() => {
      return gameState.value.locations?.find((l: EscapeRoomLocation) => l.id === selectedLocationId.value) || null;
    });

    const currentNode = computed(() => {
      const path = currentPath.value;
      if (path.length === 0) return null;
      return findNode(path[path.length - 1]) || null;
    });

    const currentChildren = computed(() => {
      const node = currentNode.value;
      if (node) {
        if (!node.children) return [];
        return node.children.map((cid) => findNode(cid)).filter(Boolean) as EscapeRoomNode[];
      }
      return gameState.value.nodes?.filter(
        (n: EscapeRoomNode) => n.locationId === selectedLocationId.value && n.parentId === null
      ) || [];
    });

    const visibleChildren = computed(() => {
      const parent = currentNode.value;
      return currentChildren.value.filter((_child) => {
        if (parent) {
          if (parent.type === 'puzzle' && !parent.solved) return false;
          if (parent.type === 'locked' && isNodeStillLocked(parent)) return false;
        }
        return true;
      });
    });

    const isMetaNode = (node: EscapeRoomNode) => node.isMeta || false;

    const playerVisitedLocs = computed(() =>
      gameState.value.visitedLocations || []
    );

    const solvedCount = computed(() => gameState.value.solvedNodes?.length || 0);

    function isLocationAccessible(locIdx: number): boolean {
      if (locIdx === 0) return true;
      const locId = gameState.value.locations?.[locIdx]?.id;
      return locId ? playerVisitedLocs.value.includes(locId) : false;
    }

    watch(playerVisitedLocs, (newLocs, oldLocs) => {
      if (!oldLocs) return;
      for (const locId of newLocs) {
        if (!oldLocs.includes(locId)) {
          const loc = gameState.value.locations?.find((l: EscapeRoomLocation) => l.id === locId);
          if (loc) {
            showToast(`Discovered: ${loc.name}`, 'success', 3000);
          }
        }
      }
    });

    watch(solvedCount, (newCount, oldCount) => {
      if (newCount > (oldCount || 0)) {
        const solvedNodeIds = gameState.value.solvedNodes || [];
        const lastSolvedId = solvedNodeIds[solvedNodeIds.length - 1];
        const lastSolved = lastSolvedId ? findNode(lastSolvedId) : null;
        if (lastSolved?.children) {
          const hasMetaChild = lastSolved.children.some((cid) => {
            const child = findNode(cid);
            return child?.isMeta;
          });
          if (hasMetaChild) {
            showToast('The final mechanism awakens...', 'success', 4000);
          }
        }
      }
    });

    function getItemLabel(rewardId: string): string {
      const node = gameState.value.nodes?.find(
        (n: EscapeRoomNode) => n.rewardItem === rewardId
      );
      return node?.label || rewardId;
    }

    function selectLocation(locId: string) {
      if (navigating.value) return;
      selectedLocationId.value = locId;
      if (props.socket) {
        startNavigating();
        props.socket.emit('make-move', {
          roomKey: props.roomKey,
          action: 'navigate-node',
          nodeId: null,
        });
      }
    }

    function navigateToNode(nodeId: string) {
      if (!props.socket || navigating.value) return;
      startNavigating();
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'navigate-node',
        nodeId,
      });
    }

    function navigateBreadcrumb(nodeId: string | null) {
      if (!props.socket || navigating.value) return;
      startNavigating();
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'navigate-breadcrumb',
        nodeId,
      });
    }

    function goBack() {
      const path = currentPath.value;
      if (path.length <= 1) {
        navigateBreadcrumb(null);
      } else {
        navigateBreadcrumb(path[path.length - 2]);
      }
    }

    function submitAnswer() {
      const node = currentNode.value;
      if (!props.socket || !node || !answer.value.trim() || node.type !== 'puzzle' || node.solved || navigating.value) return;
      startNavigating();
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'submit-answer',
        nodeId: node.id,
        answer: answer.value.trim(),
      });
      answer.value = '';
    }

    function requestHint(nodeId: string) {
      if (!props.socket || navigating.value) return;
      startNavigating();
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'request-hint',
        nodeId,
      });
    }

    function interactItem(nodeId: string) {
      if (!props.socket || navigating.value) return;
      startNavigating();
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'interact-item',
        nodeId,
      });
    }

    function useItem(nodeId: string) {
      if (!props.socket || navigating.value) return;
      startNavigating();
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'use-item',
        nodeId,
      });
    }

    function beginGame() {
      if (!props.socket || gameState.value.introAcknowledged || navigating.value) return;
      startNavigating();
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'begin-game',
      });
    }

    function attemptsForNode(nodeId: string): number {
      return gameState.value.attemptsPerNode?.[nodeId] || 0;
    }

    const activeTab = ref<'map' | 'chat'>('map');
    const unreadChatCount = ref(0);
    const chatMessages = ref<any[]>([]);
    const chatInput = ref('');
    const chatMessagesRef = ref<HTMLElement | null>(null);

    const PLAYER_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-blue-500'];
    const PLAYER_TEXT_COLORS = ['text-indigo-400', 'text-emerald-400', 'text-amber-400', 'text-rose-400', 'text-cyan-400', 'text-violet-400', 'text-pink-400', 'text-blue-400'];

    const isMultiplayer = computed(() => {
      const humanPlayers = gameState.value.players?.filter((p: any) => !p.isAI) || [];
      return humanPlayers.length >= 2;
    });

    function scrollChatToBottom() {
      nextTick(() => {
        if (chatMessagesRef.value) {
          chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
        }
      });
    }

    function sendChatMessage() {
      const text = chatInput.value.trim();
      if (!text || !props.socket || !props.roomKey) return;
      props.socket.emit('send-chat', { roomKey: props.roomKey, text });
      chatInput.value = '';
    }

    function getChatDotClass(playerNum: number): string {
      return PLAYER_COLORS[(playerNum - 1) % PLAYER_COLORS.length];
    }
    function getChatNameColor(playerNum: number): string {
      return PLAYER_TEXT_COLORS[(playerNum - 1) % PLAYER_TEXT_COLORS.length];
    }
    function getChatDisplayName(msg: any): string {
      const p = gameState.value.players?.find((pl: any) => pl.player === msg.player);
      return p?.name || msg.playerName || `Player ${msg.player}`;
    }

    const mapNodes = computed(() => {
      if (!selectedLocationId.value) return [];
      const locNodes = gameState.value.nodes.filter(
        (n: EscapeRoomNode) => n.locationId === selectedLocationId.value
      );
      const visibleNodes = locNodes.filter((n: EscapeRoomNode) => {
        if (!n.parentId) return true;
        const parent = findNode(n.parentId);
        if (!parent || parent.locationId !== selectedLocationId.value) return true;
        let curr: EscapeRoomNode | undefined = parent;
        while (curr && curr.locationId === selectedLocationId.value) {
          if (curr.type === 'puzzle' && !curr.solved) return false;
          if (curr.type === 'locked' && isNodeStillLocked(curr)) return false;
          curr = curr.parentId ? findNode(curr.parentId) : undefined;
        }
        return true;
      });
      const depthMap: Record<string, number> = {};
      const localRoots = visibleNodes.filter(
        (n: EscapeRoomNode) => !n.parentId || !visibleNodes.some((pn) => pn.id === n.parentId)
      );
      const hasVirtualRoot = localRoots.length > 1;
      const VIRTUAL_ROOT = '__root__';
      function computeDepth(nodeId: string, currentDepth: number) {
        depthMap[nodeId] = currentDepth;
        const children = visibleNodes.filter((n: EscapeRoomNode) => n.parentId === nodeId);
        for (const child of children) {
          computeDepth(child.id, currentDepth + 1);
        }
      }
      if (hasVirtualRoot) {
        depthMap[VIRTUAL_ROOT] = 0;
        for (const root of localRoots) {
          computeDepth(root.id, 1);
        }
      } else {
        for (const root of localRoots) {
          computeDepth(root.id, 0);
        }
      }
      const nodeIds = visibleNodes.map((n) => n.id);
      const allNodeIds = hasVirtualRoot ? [VIRTUAL_ROOT, ...nodeIds] : nodeIds;
      const maxDepth = allNodeIds.length > 0 ? Math.max(0, ...allNodeIds.map((id) => depthMap[id] ?? 0)) : 0;
      const levels: string[][] = Array.from({ length: maxDepth + 1 }, () => []);
      if (hasVirtualRoot) levels[0].push(VIRTUAL_ROOT);
      for (const node of visibleNodes) {
        const d = depthMap[node.id] ?? 0;
        levels[d].push(node.id);
      }
      const width = 600;
      const height = 400;
      const paddingX = 80;
      const paddingTop = 60;
      const paddingBottom = 60;
      const positions: Record<string, { x: number; y: number }> = {};
      const levelHeight = maxDepth > 0 ? (height - paddingTop - paddingBottom) / maxDepth : 0;
      for (let d = 0; d <= maxDepth; d++) {
        const ids = levels[d];
        const y = maxDepth > 0 ? paddingTop + d * levelHeight : height / 2;
        const count = ids.length;
        const stepX = count > 1 ? (width - 2 * paddingX) / (count - 1) : 0;
        const startX = count > 1 ? paddingX : width / 2;
        for (let i = 0; i < count; i++) {
          const id = ids[i];
          positions[id] = {
            x: startX + i * stepX,
            y,
          };
        }
      }
      const currentActiveId = currentPath.value[currentPath.value.length - 1];
      const result = visibleNodes.map((n: EscapeRoomNode) => {
        const isLocked = n.type === 'locked' && isNodeStillLocked(n);
        return {
          ...n,
          narrative: isLocked ? (n.lockedNarrative || n.narrative) : n.narrative,
          x: positions[n.id]?.x ?? 0,
          y: positions[n.id]?.y ?? 0,
          isCurrent: currentActiveId === n.id,
        };
      });
      if (hasVirtualRoot) {
        result.unshift({
          id: VIRTUAL_ROOT,
          type: 'root',
          label: currentLocation.value?.name || 'start here',
          isMeta: false,
          narrative: currentLocation.value?.description || '',
          lockedNarrative: '',
          parentId: null,
          locationId: selectedLocationId.value,
          children: localRoots.map((r) => r.id),
          x: positions[VIRTUAL_ROOT]?.x ?? width / 2,
          y: positions[VIRTUAL_ROOT]?.y ?? paddingTop,
          isCurrent: !currentActiveId,
          solved: false,
          question: '',
          answer: '',
          hints: [],
          attempts: 0,
          rewardItem: null,
          lockedByItem: null,
        } as any);
      }
      return result;
    });

    const mapLinks = computed(() => {
      const nodesList = mapNodes.value;
      const links: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
      const virtualRoot = nodesList.find((n) => n.id === '__root__');
      for (const node of nodesList) {
        if (node.id === '__root__') continue;
        if (node.parentId && node.parentId !== '__root__') {
          const parent = nodesList.find((n) => n.id === node.parentId);
          if (parent) {
            links.push({
              id: `${parent.id}-${node.id}`,
              x1: parent.x,
              y1: parent.y,
              x2: node.x,
              y2: node.y,
            });
          }
        } else if (virtualRoot) {
          links.push({
            id: `__root__-${node.id}`,
            x1: virtualRoot.x,
            y1: virtualRoot.y,
            x2: node.x,
            y2: node.y,
          });
        }
      }
      return links;
    });

    function getNodeBorderClass(node: EscapeRoomNode) {
      switch (node.type) {
        case 'puzzle':
          return node.solved ? 'stroke-emerald-500' : 'stroke-amber-500/80';
        case 'locked':
          return isNodeStillLocked(node) ? 'stroke-rose-500' : 'stroke-emerald-500';
        case 'item':
          return isItemDiscovered(node.id) ? 'stroke-slate-500' : 'stroke-indigo-500';
        default:
          return 'stroke-blue-500/80';
      }
    }

    function getNodeTypeColor(node: EscapeRoomNode) {
      switch (node.type) {
        case 'puzzle':
          return 'text-amber-600 dark:text-amber-400';
        case 'locked':
          return 'text-rose-600 dark:text-rose-400';
        case 'item':
          return 'text-indigo-600 dark:text-indigo-400';
        case 'root':
          return 'text-emerald-600 dark:text-emerald-400';
        default:
          return 'text-blue-600 dark:text-blue-400';
      }
    }

    function getNodeStatusText(node: EscapeRoomNode) {
      if ((node as any).isCurrent) {
        return 'Current Position';
      }
      if (node.id === '__root__') {
        return 'Start';
      }
      switch (node.type) {
        case 'puzzle':
          return node.solved ? 'Solved' : 'Unsolved';
        case 'locked':
          return isNodeStillLocked(node) ? 'Locked' : 'Unlocked';
        case 'item':
          return isItemDiscovered(node.id) ? 'Picked Up' : 'Available';
        default:
          return 'Visited';
      }
    }

    function jumpToNode(nodeId: string) {
      if (!props.socket || navigating.value) return;
      if (nodeId === '__root__') {
        startNavigating();
        props.socket.emit('make-move', {
          roomKey: props.roomKey,
          action: 'navigate-breadcrumb',
          nodeId: null,
        });
        showMap.value = false;
        return;
      }
      const targetNode = findNode(nodeId);
      if (!targetNode) return;
      const path: string[] = [];
      let current: EscapeRoomNode | undefined = targetNode;
      while (current) {
        path.unshift(current.id);
        current = current.parentId ? findNode(current.parentId) : undefined;
      }
      for (let i = 0; i < path.length - 1; i++) {
        const ancestor = findNode(path[i]);
        if (!ancestor) return;
        if (ancestor.type === 'puzzle' && !ancestor.solved) {
          showToast('Path is blocked by an unsolved puzzle.', 'error');
          return;
        }
        if (ancestor.type === 'locked' && isNodeStillLocked(ancestor)) {
          showToast('Path is blocked by a lock.', 'error');
          return;
        }
      }
      startNavigating();
      props.socket.emit('make-move', {
        roomKey: props.roomKey,
        action: 'jump-to-node',
        nodeId,
      });
      showMap.value = false;
    }

    watch(showMap, (isOpen) => {
      if (isOpen) {
        activeTab.value = 'map';
        unreadChatCount.value = 0;
      }
    });

    watch(activeTab, (newTab) => {
      if (newTab === 'chat') {
        unreadChatCount.value = 0;
        scrollChatToBottom();
      }
    });

    const onChatMessage = (msg: any) => {
      chatMessages.value = [...chatMessages.value, msg];
      if (isMultiplayer.value) {
        if (!showMap.value || activeTab.value === 'map') {
          unreadChatCount.value++;
        }
      }
      scrollChatToBottom();
    };

    const onWaitingForPlayer = (data: any) => {
      chatMessages.value = data.chatMessages || [];
      scrollChatToBottom();
    };

    const onReconnectSuccess = (data: any) => {
      chatMessages.value = data.chatMessages || [];
      scrollChatToBottom();
    };

    const onChatHistory = (history: any[]) => {
      chatMessages.value = history;
      scrollChatToBottom();
    };

    watch(() => props.socket, (newSocket, oldSocket) => {
      if (oldSocket) {
        oldSocket.off('chat-message', onChatMessage);
        oldSocket.off('waiting-for-player', onWaitingForPlayer);
        oldSocket.off('reconnect-success', onReconnectSuccess);
        oldSocket.off('chat-history', onChatHistory);
      }
      if (newSocket) {
        newSocket.on('chat-message', onChatMessage);
        newSocket.on('waiting-for-player', onWaitingForPlayer);
        newSocket.on('reconnect-success', onReconnectSuccess);
        newSocket.on('chat-history', onChatHistory);
        newSocket.emit('get-chat', { roomKey: props.roomKey });
      }
    }, { immediate: true });

    onMounted(() => {
      // no init needed
    });

    onUnmounted(() => {
      stopSound();
      if (audioCtx.value) {
        audioCtx.value.close();
        audioCtx.value = null;
      }
      if (props.socket) {
        props.socket.off('chat-message', onChatMessage);
        props.socket.off('waiting-for-player', onWaitingForPlayer);
        props.socket.off('reconnect-success', onReconnectSuccess);
        props.socket.off('chat-history', onChatHistory);
      }
    });

    const game = useGame({
      socket: props.socket as any,
      player: props.player,
      roomKey: props.roomKey,
      gameState,
      gameOver: () => gameState.value?.phase === 'escaped',
      lobbyRoute: '/escape-room/lobby',
      onGameState: (newState: any) => {
        navigating.value = false;
        gameState.value = newState;
        if (newState.totalMoves === 0 && !newState.nodes?.length) {
          stopSound();
          answer.value = '';
          showInventory.value = false;
          prevSolvedCount.value = 0;
        }
        if (newState.locations?.length > 0) {
          const locExists = newState.locations.some((l: any) => l.id === selectedLocationId.value);
          if (!locExists) {
            selectedLocationId.value = newState.locations[0].id;
          }
        }
        const newSolved = newState.solvedNodes?.length || 0;
        if (newSolved > prevSolvedCount.value) {
          stopSound();
        }
        prevSolvedCount.value = newSolved;
      },
    });

    return {
      ...game,
      navigating,
      gameState,
      answer,
      showIntro,
      showInventory,
      selectedLocationId,
      isHowToPlayOpen,
      openHowToPlay,
      closeHowToPlay,
      selectLocation,
      currentPath,
      currentNode,
      currentChildren,
      visibleChildren,
      currentLocation,
      playerInventory,
      navigateToNode,
      navigateBreadcrumb,
      goBack,
      submitAnswer,
      requestHint,
      interactItem,
      useItem,
      beginGame,
      findNode,
      getNodeLabel,
      getNodeLocationName,
      getLocationName,
      getNarrativeExcerpt,
      hasItem,
      isNodeStillLocked,
      isItemDiscovered,
      isMetaNode,
      isSoundPlaying,
      playPuzzleSound,
      splitArtSegments,
      solvedCount,
      attemptsForNode,
      getItemLabel,
      isLocationAccessible,
      playerVisitedLocs,
      showMap,
      hoveredNode,
      mapNodes,
      mapLinks,
      getNodeBorderClass,
      getNodeTypeColor,
      getNodeStatusText,
      jumpToNode,
      activeTab,
      isMultiplayer,
      unreadChatCount,
      chatMessages,
      chatInput,
      chatMessagesRef,
      sendChatMessage,
      getChatDotClass,
      getChatNameColor,
      getChatDisplayName,
    };
  },
  computed: {
    isValidGame(): boolean {
      return !!(this.roomKey && this.player && this.gameState.players && this.gameState.players.length >= 1);
    },
    escaped(): boolean {
      return this.gameState.phase === 'escaped';
    },
    totalPuzzles(): number {
      return (this.gameState.nodes || []).filter((n: EscapeRoomNode) => n.type === 'puzzle').length;
    },
    revealedHints(): string[] {
      const node = this.currentNode;
      if (!node || node.type !== 'puzzle') return [];
      return (node.hints || []).slice(0, node.hintsRevealed || 0);
    },
    currentNodeHintsRemaining(): number {
      const node = this.currentNode;
      if (!node || node.type !== 'puzzle') return 0;
      return Math.max(0, (node.hints?.length || 0) - (node.hintsRevealed || 0));
    },
    hintButtonText(): string {
      if (this.currentNodeHintsRemaining <= 0) return 'No more hints';
      return `Hint (${this.currentNodeHintsRemaining} remaining)`;
    },
  },
});
</script>

<style>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgb(100 116 139 / 0.3);
  border-radius: 999px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgb(100 116 139 / 0.5);
}

@media (hover: none) and (pointer: coarse) {
  .custom-scroll {
    scrollbar-width: none;
  }
}
</style>
