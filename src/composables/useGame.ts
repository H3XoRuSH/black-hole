import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';

interface UseGameOptions {
  socket: any;
  player: number;
  roomKey: string;
  gameState: Ref<any>;
  gameOver: () => boolean;
  lobbyRoute: string;
  enableBeforeUnload?: boolean;
  enableRedirectOnInvalid?: boolean;
  registerLifecycle?: boolean;
  onGameState?: (state: any, helpers: { setReady: (v: boolean) => void; setOtherReady: (v: boolean) => void }) => void;
  onPlayerReady?: (data: any, helpers: { setReady: (v: boolean) => void; setOtherReady: (v: boolean) => void }) => void;
  onMounted?: () => void;
  onBeforeUnmount?: () => void;
}

export function useGame(options: UseGameOptions) {
  const ready = ref(false);
  const otherPlayerReady = ref(false);
  const isLeavingDueToDisconnect = ref(false);
  const router = useRouter() as any;

  function newGame() {
    ready.value = true;
    options.socket?.emit('new-game', { roomKey: options.roomKey });
  }

  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!options.gameOver() && options.gameState.value?.players?.length === 2) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  function isValid(): boolean {
    return !!(options.roomKey && options.player && options.gameState.value?.players?.length >= 1);
  }

  if (options.registerLifecycle !== false) {
    onMounted(() => {
      if (options.onMounted) {
        options.onMounted();
      }

      if (options.enableRedirectOnInvalid !== false && !isValid()) {
        router.push(options.lobbyRoute);
        return;
      }

      if (options.enableBeforeUnload !== false) {
        window.addEventListener('beforeunload', handleBeforeUnload);
      }

      options.socket?.on('game-state', (newState: any) => {
        if (options.onGameState) {
          options.onGameState(newState, {
            setReady: (v: boolean) => { ready.value = v; },
            setOtherReady: (v: boolean) => { otherPlayerReady.value = v; },
          });
        } else {
          options.gameState.value = newState;
          if (newState.totalMoves === 0) {
            ready.value = false;
            otherPlayerReady.value = false;
          }
          if (newState.players.length < 2 && !options.gameOver()) {
            router.push(options.lobbyRoute);
          }
        }
      });

      const getPlayerNumber = () => {
        const me = options.gameState.value?.players?.find((p: any) => p.id === options.socket?.id);
        return me ? me.player : options.player;
      };

      options.socket?.on('player-ready', (data: any) => {
        if (options.onPlayerReady) {
          options.onPlayerReady(data, {
            setReady: (v: boolean) => { ready.value = v; },
            setOtherReady: (v: boolean) => { otherPlayerReady.value = v; },
          });
        } else {
          const currentPlayerNum = getPlayerNumber();
          if (data !== currentPlayerNum) {
            otherPlayerReady.value = true;
          }
        }
      });
    });

    onBeforeUnmount(() => {
      if (options.onBeforeUnmount) {
        options.onBeforeUnmount();
      }

      if (options.enableBeforeUnload !== false) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      if (options.roomKey) {
        options.socket?.emit('leave-room', { roomKey: options.roomKey });
      }
      options.socket?.off('game-state');
      options.socket?.off('player-ready');
    });

    onBeforeRouteLeave((to: any, from: any, next: any) => {
      if (isLeavingDueToDisconnect.value || router.isLeavingDueToDisconnect) {
        next();
        return;
      }
      if (!options.gameOver() && options.gameState.value?.players?.length === 2) {
        const answer = window.confirm(
          'Are you sure you want to leave the ongoing game? This will disconnect you and end the game.'
        );
        if (answer) {
          next();
        } else {
          next(false);
        }
      } else {
        next();
      }
    });
  }

  return {
    ready,
    otherPlayerReady,
    isLeavingDueToDisconnect,
    newGame,
    router,
  };
}
