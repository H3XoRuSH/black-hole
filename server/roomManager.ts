import { Socket, Server as SocketIOServer } from 'socket.io';
import type { Room, TriviaGameState as TGS, ChatMessage } from '../src/types/shared.js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRecap, recapConversation } from './recapService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gamesPath = path.join(__dirname, '..', 'src', 'assets', 'games.json');
let gamesConfig: any[] = [];
try {
  gamesConfig = JSON.parse(readFileSync(gamesPath, 'utf8'));
} catch (err) {
  console.error('Failed to load games config:', err);
}

export interface GameModule {
  createInitialState: (playerId: string) => any;
  resetState: (players: any[]) => any;
  makeMove: (room: Room, socket: Socket, data: any) => boolean;
  noTurns?: boolean;
  onGameStart?: (room: Room) => void | Promise<void>;
  getAIMove?: (gameState: any) => Promise<any>;
  revealNextLetter?: (gameState: any) => void;
}

const generateRoomKey = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
};

const RECONNECT_TIMEOUT = 60000;

export function createRoomManager(gamesRegistry: Record<string, GameModule>) {
  const rooms = new Map<string, Room>();
  const socketRooms = new Map<string, { roomKey: string; playerNumber: number }>();
  const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const bingoIntervals = new Map<string, ReturnType<typeof setInterval>>();
  const triviaTimers = new Map<string, ReturnType<typeof setTimeout>[]>();
  const pictionaryTimers = new Map<string, ReturnType<typeof setTimeout>>();

  function startBingoTimer(roomKey: string, room: Room, io: SocketIOServer) {
    stopBingoTimer(roomKey);
    if (room.gameId !== 'bingo') return;
    const interval = setInterval(() => {
      const currentRoom = rooms.get(roomKey);
      if (!currentRoom || !currentRoom.gameStarted || currentRoom.gameState.winner) {
        stopBingoTimer(roomKey);
        return;
      }
      const gameState = currentRoom.gameState;
      const remaining: number[] = [];
      for (let n = 1; n <= 75; n++) {
        if (!gameState.drawnNumbers.includes(n)) remaining.push(n);
      }
      if (remaining.length === 0) {
        stopBingoTimer(roomKey);
        return;
      }
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      gameState.drawnNumbers.push(pick);
      gameState.totalMoves++;
      gameState.players.forEach((p: any) => (p.ready = false));
      if (!gameState.moveHistory) {
        gameState.moveHistory = [];
      }
      gameState.moveHistory.push({
        player: 0,
        action: 'draw',
        timestamp: Date.now(),
        pick,
      });
      broadcastGameState(roomKey, currentRoom, io);
    }, 5000);
    bingoIntervals.set(roomKey, interval);
  }

  function stopBingoTimer(roomKey: string) {
    const interval = bingoIntervals.get(roomKey);
    if (interval) {
      clearInterval(interval);
      bingoIntervals.delete(roomKey);
    }
  }

  function addTriviaTimer(roomKey: string, timer: ReturnType<typeof setTimeout>) {
    const existing = triviaTimers.get(roomKey) || [];
    existing.push(timer);
    triviaTimers.set(roomKey, existing);
  }

  function stopTriviaTimers(roomKey: string) {
    const timers = triviaTimers.get(roomKey);
    if (timers) {
      timers.forEach(clearTimeout);
      triviaTimers.delete(roomKey);
    }
    stopPictionaryTimer(roomKey);
  }

  function startPictionaryTimer(roomKey: string, room: Room, io: SocketIOServer) {
    stopPictionaryTimer(roomKey);
    if (room.gameId !== 'pictionary') return;
    const gameState = room.gameState as any;
    if (gameState.phase !== 'drawing') return;
    const duration = (gameState.timerDuration || 60) * 1000;
    const mod = gamesRegistry['pictionary'] as any;
    const totalReveals = gameState.revealPositions?.length || 0;
    const revealInterval = totalReveals > 0 ? duration / totalReveals : Infinity;
    let nextRevealAt = revealInterval;
    const interval = setInterval(() => {
      const currentRoom = rooms.get(roomKey);
      if (!currentRoom || !currentRoom.gameStarted || currentRoom.gameState.winner || currentRoom.gameState.phase !== 'drawing') {
        clearInterval(interval);
        pictionaryTimers.delete(roomKey);
        return;
      }
      const gs = currentRoom.gameState as any;
      const elapsed = (gs.timerDuration || 60) * 1000 - gs.timeRemaining * 1000 + 1000;
      gs.timeRemaining = Math.max(0, gs.timeRemaining - 1);
      if (mod?.revealNextLetter && elapsed >= nextRevealAt && gs.revealedLetters?.length < totalReveals) {
        mod.revealNextLetter(gs);
        nextRevealAt += revealInterval;
      }
      broadcastGameState(roomKey, currentRoom, io);
    }, 1000);
    const timer = setTimeout(() => {
      clearInterval(interval);
      pictionaryTimers.delete(roomKey);
      const currentRoom = rooms.get(roomKey);
      if (!currentRoom || !currentRoom.gameStarted) return;
      const gs = currentRoom.gameState as any;
      if (gs.phase === 'drawing') {
        const mod = gamesRegistry['pictionary'];
        if (mod && (mod as any).timeUp) {
          (mod as any).timeUp(currentRoom);
          broadcastGameState(roomKey, currentRoom, io);
        }
      }
    }, duration);
    pictionaryTimers.set(roomKey, timer);
    pictionaryTimers.set(roomKey + '-interval', interval as any);
  }

  function stopPictionaryTimer(roomKey: string) {
    const timer = pictionaryTimers.get(roomKey);
    if (timer) {
      clearTimeout(timer);
      pictionaryTimers.delete(roomKey);
    }
    const interval = pictionaryTimers.get(roomKey + '-interval');
    if (interval) {
      clearInterval(interval as any);
      pictionaryTimers.delete(roomKey + '-interval');
    }
  }

  function isHiddenChar(ch: string): boolean {
    return /[a-zA-Z0-9]/.test(ch);
  }

  function generateBlankDisplay(answer: string): string {
    return answer.split('').map((ch) => (isHiddenChar(ch) ? '_' : ch)).join('');
  }

  function countHiddenChars(answer: string): number {
    return answer.split('').filter((ch) => isHiddenChar(ch)).length;
  }

  function advanceTriviaToNextOrEnd(roomKey: string, io: SocketIOServer) {
    const r = rooms.get(roomKey);
    if (!r) return;
    const s = r.gameState as TGS;
    s.currentQuestionIndex++;
    if (s.currentQuestionIndex >= s.questions.length) {
      const maxScore = Math.max(...Object.values(s.scores));
      const winners = Object.entries(s.scores)
        .filter(([, sc]) => sc === maxScore)
        .map(([p]) => parseInt(p));
      if (s.players.length <= 1) {
        s.winner = `Final Score: ${s.scores[1] || 0}/${s.questions.length}`;
      } else if (winners.length === 1) {
        const winningPlayer = s.players.find((p) => p.player === winners[0]);
        const winnerName = winningPlayer?.name || `Player ${winners[0]}`;
        s.winner = `${winnerName} wins!`;
      } else {
        s.winner = `Tie game!`;
      }
      s.phase = 'game-over';
      s.players.forEach((p: any) => (p.ready = false));
      broadcastGameState(roomKey, r, io);
    } else {
      const answer = s.questions[s.currentQuestionIndex].correctAnswer;
      s.answerDisplay = generateBlankDisplay(answer);
      s.totalLetters = countHiddenChars(answer);
      s.revealIndex = 0;
      s.solvedBy = null;
      s.phase = 'question-intro';
      broadcastGameState(roomKey, r, io);
      scheduleTriviaNextPhase(roomKey, io);
    }
  }

  function scheduleTriviaNextPhase(roomKey: string, io: SocketIOServer) {
    const room = rooms.get(roomKey);
    if (!room || room.gameId !== 'trivia') return;
    const gs = room.gameState as TGS;
    if (gs.phase === 'game-over') return;

    stopTriviaTimers(roomKey);

    if (gs.phase === 'question-intro') {
      addTriviaTimer(roomKey, setTimeout(() => {
        const r = rooms.get(roomKey);
        if (!r || (r.gameState as TGS).phase === 'game-over') return;
        const s = r.gameState as TGS;
        s.phase = 'revealing';
        broadcastGameState(roomKey, r, io);
        scheduleTriviaNextPhase(roomKey, io);
      }, 3000));
    } else if (gs.phase === 'revealing') {
      const s = gs;
      const q = s.questions[s.currentQuestionIndex];
      if (!q) {
        s.phase = 'game-over';
        broadcastGameState(roomKey, room, io);
        return;
      }
      const positions: number[] = [];
      for (let i = 0; i < s.answerDisplay.length; i++) {
        if (s.answerDisplay[i] === '_') positions.push(i);
      }
      if (positions.length === 0) {
        addTriviaTimer(roomKey, setTimeout(() => {
          advanceTriviaToNextOrEnd(roomKey, io);
        }, 4000));
      } else {
        const randIdx = positions[Math.floor(Math.random() * positions.length)];
        s.answerDisplay = s.answerDisplay.substring(0, randIdx) + q.correctAnswer[randIdx] + s.answerDisplay.substring(randIdx + 1);
        s.revealIndex++;
        broadcastGameState(roomKey, room, io);
        if (s.revealIndex >= s.totalLetters) {
          addTriviaTimer(roomKey, setTimeout(() => {
            advanceTriviaToNextOrEnd(roomKey, io);
          }, 4000));
        } else {
          addTriviaTimer(roomKey, setTimeout(() => {
            scheduleTriviaNextPhase(roomKey, io);
          }, 3000));
        }
      }
    } else if (gs.phase === 'solved') {
      addTriviaTimer(roomKey, setTimeout(() => {
        advanceTriviaToNextOrEnd(roomKey, io);
      }, 3000));
    }
  }

  function getFilteredState(room: Room, playerNum: number) {
    if (room.gameId === 'battleship') {
      const bs = gamesRegistry['battleship'] as any;
      return bs.getFilteredState(room.gameState, playerNum);
    }
    if (room.gameId === 'pictionary') {
      const gs = { ...room.gameState };
      const isDrawer = gs.currentDrawer === playerNum;
      const isOver = gs.phase === 'reveal' || gs.phase === 'game-over';
      if (!isDrawer && !isOver) {
        if (gs.phase === 'drawing' && gs.currentWord) {
          const revealed = (gs.revealedLetters || []) as number[];
          gs.currentWord = gs.currentWord.split('').map((ch: string, i: number) =>
            ch === ' ' ? ' ' : revealed.includes(i) ? ch : '_'
          ).join('');
        } else {
          gs.currentWord = '';
        }
        gs.wordChoices = [];
      }
      return gs;
    }
    return room.gameState;
  }

  function broadcastGameState(roomKey: string, room: Room, io: SocketIOServer) {
    if (room.gameId === 'battleship' || room.gameId === 'pictionary') {
      room.gameState.players.forEach((p: any) => {
        io.to(p.id).emit('game-state', getFilteredState(room, p.player));
      });
    } else {
      io.to(roomKey).emit('game-state', room.gameState);
    }
  }

  function triggerAIMoveIfActive(roomKey: string, room: Room, io: SocketIOServer) {
    if (!room.gameStarted || room.gameState.winner) return;

    const aiSupportedGames = ['black-hole', 'connect-four', 'dots-and-boxes', 'battleship', 'checkers'];
    if (!aiSupportedGames.includes(room.gameId)) return;

    const aiPlayer = room.gameState.players.find((p: any) => p.isAI);
    if (!aiPlayer) return;

    const isAITurn = (() => {
      if (room.gameId === 'battleship') {
        if (room.gameState.phase === 'placement') {
          const aiNum = aiPlayer.player;
          return aiNum === 1 ? !room.gameState.p1Placed : !room.gameState.p2Placed;
        }
        if (room.gameState.phase === 'playing') {
          const currPlayer = room.gameState.players.find((p: any) => p.player === room.gameState.currentPlayer);
          return currPlayer?.isAI;
        }
        return false;
      }
      const currPlayer = room.gameState.players.find((p: any) => p.player === room.gameState.currentPlayer);
      return currPlayer?.isAI;
    })();

    if (isAITurn) {
      setTimeout(() => {
        const currentRoom = rooms.get(roomKey);
        if (!currentRoom || !currentRoom.gameStarted || currentRoom.gameState.winner) return;

        const currentAI = currentRoom.gameState.players.find((p: any) => p.isAI);
        if (!currentAI) return;

        const stillAITurn = (() => {
          if (currentRoom.gameId === 'battleship') {
            if (currentRoom.gameState.phase === 'placement') {
              const aiNum = currentAI.player;
              return aiNum === 1 ? !currentRoom.gameState.p1Placed : !currentRoom.gameState.p2Placed;
            }
            if (currentRoom.gameState.phase === 'playing') {
              const currPlayer = currentRoom.gameState.players.find((p: any) => p.player === currentRoom.gameState.currentPlayer);
              return currPlayer?.isAI;
            }
            return false;
          }
          const currPlayer = currentRoom.gameState.players.find((p: any) => p.player === currentRoom.gameState.currentPlayer);
          return currPlayer?.isAI;
        })();

        if (!stillAITurn) return;

        const gameModule = gamesRegistry[currentRoom.gameId];
        if (!gameModule || !gameModule.getAIMove) return;

        gameModule.getAIMove(currentRoom.gameState)
          .then((moveData) => {
            const data = {
              roomKey,
              ...moveData
            };
            const mockSocket = {
              id: currentAI.id,
              emit: (event: string, payload: any) => {
                console.log(`[AI socket emit] event: ${event}`, payload);
              }
            } as any;
            manager.makeMove(data, mockSocket, io);
          })
          .catch((err) => {
            console.error('Error during AI move:', err);
          });
      }, 600);
    }
  }

  const manager = {
    createRoom(gameId: string, socket: Socket) {
      let roomKey = generateRoomKey();
      while (rooms.has(roomKey)) roomKey = generateRoomKey();

      const game = gamesRegistry[gameId] || gamesRegistry['black-hole'];
      const initialGameState = game.createInitialState(socket.id);
      initialGameState.moveHistory = [];
      initialGameState.recap = undefined;
      initialGameState.recapLoading = false;

      const gameConfig = gamesConfig.find((g: any) => g.id === gameId);
      initialGameState.minPlayers = gameConfig?.minPlayers ?? 2;
      initialGameState.maxPlayers = gameConfig?.maxPlayers ?? 2;

      initialGameState.players[0].name = initialGameState.players[0].name || 'Player 1';
      rooms.set(roomKey, { gameId, gameState: initialGameState, gameStarted: false, recaps: new Map(), recapConversations: new Map(), chatMessages: [] });
      socket.join(roomKey);
      socketRooms.set(socket.id, { roomKey, playerNumber: 1 });
      socket.emit('waiting-for-player', { roomKey, player: 1, gameId, gameState: initialGameState });
      return roomKey;
    },

    joinRoom(roomKey: string, gameId: string, socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) {
        socket.emit('room-error', { message: 'Room does not exist.' });
        return;
      }
      const room = rooms.get(roomKey)!;
      if (gameId && room.gameId !== gameId) {
        socket.emit('room-error', { message: 'This room is for a different game.' });
        return;
      }
      const gameConfig = gamesConfig.find((g: any) => g.id === room.gameId);
      const maxPlayers = gameConfig?.maxPlayers ?? 2;
      if (room.gameState.players.length >= maxPlayers) {
        socket.emit('room-error', { message: 'Room is full.' });
        return;
      }
      const playerNumber = room.gameState.players.length + 1;
      room.gameState.players.push({ id: socket.id, player: playerNumber, ready: false, name: `Player ${playerNumber}` });
      socket.join(roomKey);
      socketRooms.set(socket.id, { roomKey, playerNumber });

      socket.emit('waiting-for-player', { roomKey, player: playerNumber, gameId: room.gameId, gameState: getFilteredState(room, playerNumber), chatMessages: room.chatMessages || [] });
      broadcastGameState(roomKey, room, io);
    },

    toggleReady(roomKey: string, socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      const player = room.gameState.players.find((p: any) => p.id === socket.id);
      if (player) {
        player.ready = !player.ready;
        broadcastGameState(roomKey, room, io);
      }
    },

    renamePlayer(roomKey: string, socket: Socket, name: string, io: SocketIOServer) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      const player = room.gameState.players.find((p: any) => p.id === socket.id);
      if (player) {
        player.name = name.trim().slice(0, 10) || player.name;
        broadcastGameState(roomKey, room, io);
      }
    },

    startGame(roomKey: string, socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      const host = room.gameState.players.find((p: any) => p.id === socket.id);
      if (!host || host.player !== 1) {
        socket.emit('room-error', { message: 'Only the host can start the game.' });
        return;
      }
      const gameConfig = gamesConfig.find((g: any) => g.id === room.gameId);
      const minPlayers = gameConfig?.minPlayers ?? 2;
      if (room.gameState.players.length < minPlayers) {
        socket.emit('room-error', { message: `Waiting for at least ${minPlayers} players to join.` });
        return;
      }
      const allReady = room.gameState.players.every((p: any) => p.ready);
      if (!allReady) {
        socket.emit('room-error', { message: 'All players must be ready to start.' });
        return;
      }
      room.gameStarted = true;
      room.gameState.players.forEach((p: any) => p.ready = false);

      const gameModule = gamesRegistry[room.gameId];
      let startPromise: Promise<void> | undefined;
      if (gameModule?.onGameStart) {
        const result = gameModule.onGameStart(room);
        if (result) startPromise = Promise.resolve(result);
      }

      room.gameState.players.forEach((player: any) => {
        io.to(player.id).emit('room-started', {
          roomKey,
          player: player.player,
          gameId: room.gameId,
          gameState: getFilteredState(room, player.player),
        });
      });
      triggerAIMoveIfActive(roomKey, room, io);
      startBingoTimer(roomKey, room, io);

      if (room.gameId === 'trivia') {
        (startPromise || Promise.resolve()).then(() => {
          const r = rooms.get(roomKey);
          if (r) {
            broadcastGameState(roomKey, r, io);
            scheduleTriviaNextPhase(roomKey, io);
          }
        });
      }

      if (room.gameId === 'infinite-word-chain') {
        (startPromise || Promise.resolve()).then(() => {
          const r = rooms.get(roomKey);
          if (r) {
            broadcastGameState(roomKey, r, io);
          }
        });
      }
    },

    validateRoom(roomKey: string, socket: Socket) {
      const uppercaseKey = roomKey ? roomKey.toUpperCase() : '';
      if (!rooms.has(uppercaseKey)) {
        socket.emit('room-validation-error', { message: 'Room does not exist.' });
        return;
      }
      const room = rooms.get(uppercaseKey)!;
      const gameConfig = gamesConfig.find((g: any) => g.id === room.gameId);
      const maxPlayers = gameConfig?.maxPlayers ?? 2;
      if (room.gameState.players.length >= maxPlayers) {
        socket.emit('room-validation-error', { message: 'Room is full.' });
        return;
      }
      socket.emit('room-validated', { roomKey: uppercaseKey, gameId: room.gameId });
    },

    leaveRoom(roomKey: string, socket: Socket, io: SocketIOServer) {
      if (rooms.has(roomKey)) {
        const room = rooms.get(roomKey)!;
        const playerIndex = room.gameState.players.findIndex((p: any) => p.id === socket.id);
        if (playerIndex !== -1) {
          const leavingPlayer = room.gameState.players[playerIndex];
          if (room.gameStarted) {
            socket.to(roomKey).emit('player-disconnected', {
              message: 'A player has left the game. Returning to lobby.',
              gameId: room.gameId,
            });
            socket.leave(roomKey);
            rooms.delete(roomKey);
            stopBingoTimer(roomKey);
            stopTriviaTimers(roomKey);
            const timer = disconnectTimers.get(roomKey);
            if (timer) clearTimeout(timer);
            disconnectTimers.delete(roomKey);
          } else {
            if (leavingPlayer.player === 1) {
              socket.to(roomKey).emit('room-closed', {
                message: 'The host has closed the room.',
              });
              socket.leave(roomKey);
              rooms.delete(roomKey);
              stopBingoTimer(roomKey);
              stopTriviaTimers(roomKey);
              const timer = disconnectTimers.get(roomKey);
              if (timer) clearTimeout(timer);
              disconnectTimers.delete(roomKey);
            } else {
              room.gameState.players.splice(playerIndex, 1);
              room.gameState.players.forEach((p: any, idx: number) => {
                p.player = idx + 1;
                p.ready = false;
                socketRooms.set(p.id, { roomKey, playerNumber: p.player });
                io.to(p.id).emit('player-role', { player: p.player });
              });
              socket.leave(roomKey);
              broadcastGameState(roomKey, room, io);
            }
          }
        }
      }
      socketRooms.delete(socket.id);
    },

    reconnectRoom(roomKey: string, playerNumber: number, socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) {
        socket.emit('reconnect-fail', { message: 'That room is no longer available.' });
        return;
      }
      const room = rooms.get(roomKey)!;
      const player = room.gameState.players.find((p: any) => p.player === playerNumber);
      if (!player) {
        socket.emit('reconnect-fail', { message: 'Could not find your player slot.' });
        return;
      }
      const timer = disconnectTimers.get(roomKey);
      if (timer) {
        clearTimeout(timer);
        disconnectTimers.delete(roomKey);
      }
      player.id = socket.id;
      socket.join(roomKey);
      socketRooms.set(socket.id, { roomKey, playerNumber });

      const gameStarted = room.gameStarted || false;
      socket.emit('reconnect-success', {
        roomKey,
        player: playerNumber,
        gameId: room.gameId,
        gameState: getFilteredState(room, playerNumber),
        gameStarted,
        chatMessages: room.chatMessages || [],
      });
      socket.to(roomKey).emit('player-reconnected', {
        message: 'Your opponent has reconnected!',
        gameId: room.gameId,
      });
      broadcastGameState(roomKey, room, io);
    },

    handleDisconnect(socketId: string, io: SocketIOServer) {
      const info = socketRooms.get(socketId);
      if (!info) return;
      const { roomKey, playerNumber } = info;
      socketRooms.delete(socketId);

      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;

      if (!disconnectTimers.has(roomKey)) {
        const timer = setTimeout(() => {
          const r = rooms.get(roomKey);
          if (r) {
            if (!r.gameStarted) {
              if (playerNumber === 1) {
                io.in(roomKey).emit('room-closed', {
                  message: 'The host has disconnected.',
                });
                rooms.delete(roomKey);
                stopBingoTimer(roomKey);
                stopTriviaTimers(roomKey);
              } else {
                const idx = r.gameState.players.findIndex((p: any) => p.player === playerNumber);
                if (idx !== -1) {
                  r.gameState.players.splice(idx, 1);
                  r.gameState.players.forEach((p: any, i: number) => {
                    p.player = i + 1;
                    p.ready = false;
                    socketRooms.set(p.id, { roomKey, playerNumber: p.player });
                    io.to(p.id).emit('player-role', { player: p.player });
                  });
                  broadcastGameState(roomKey, r, io);
                }
              }
            } else {
              io.in(roomKey).emit('player-disconnected', {
                message: 'A player has disconnected. Returning to lobby.',
                gameId: r.gameId,
              });
              rooms.delete(roomKey);
              stopBingoTimer(roomKey);
              stopTriviaTimers(roomKey);
            }
          }
          disconnectTimers.delete(roomKey);
        }, RECONNECT_TIMEOUT);
        disconnectTimers.set(roomKey, timer);

        if (room.gameState.players.length >= 2) {
          const otherPlayer = room.gameState.players.find((p: any) => p.player !== playerNumber);
          if (otherPlayer) {
            const roleName = playerNumber === 1 ? 'host' : 'opponent';
            io.to(otherPlayer.id).emit('player-disconnected', {
              message: `The ${roleName} disconnected. Waiting for reconnection...`,
              gameId: room.gameId,
              canReconnect: true,
            });
          }
        }
      }
    },

    async makeMove(data: any, socket: Socket, io: SocketIOServer) {
      const { roomKey } = data;
      if (!rooms.has(roomKey)) {
        socket.emit('invalid-move', { message: 'Room does not exist.' });
        return;
      }
      const room = rooms.get(roomKey)!;
      const game = gamesRegistry[room.gameId];
      const player = room.gameState.players.find((p: any) => p.id === socket.id);
      const isPlayingPhase = !room.gameState.phase || room.gameState.phase === 'playing';
      if (!game?.noTurns && (!player || (isPlayingPhase && player.player !== room.gameState.currentPlayer))) {
        socket.emit('invalid-move', { message: 'Not your turn.' });
        return;
      }
      if (game) {
        const success = await game.makeMove(room, socket, data);
        if (success) {
          if (!room.gameState.moveHistory) {
            room.gameState.moveHistory = [];
          }
          const moveRecord: any = {
            player: player.player,
            timestamp: Date.now(),
            ...data,
          };
          if (room.gameId === 'battleship' && data.action === 'shoot' && room.gameState.lastShotResult) {
            moveRecord.hit = room.gameState.lastShotResult.hit;
            moveRecord.sunkShipName = room.gameState.lastShotResult.sunkShipName;
          }
          room.gameState.moveHistory.push(moveRecord);

          if (room.gameId === 'bingo' && room.gameState.winner) {
            stopBingoTimer(roomKey);
          }

          if (room.gameId === 'trivia') {
            stopTriviaTimers(roomKey);
          }

          if (room.gameId === 'pictionary') {
            if (room.gameState.phase !== 'drawing') {
              stopPictionaryTimer(roomKey);
            }
          }

          broadcastGameState(roomKey, room, io);

          if (room.gameId === 'trivia') {
            scheduleTriviaNextPhase(roomKey, io);
          }

          if (room.gameId === 'pictionary') {
            if (room.gameState.phase === 'drawing' && room.gameState.drawerReady) {
              startPictionaryTimer(roomKey, room, io);
            }
          }

          triggerAIMoveIfActive(roomKey, room, io);
        }
      } else {
        socket.emit('invalid-move', { message: 'Unsupported game type.' });
      }
    },

    requestRecap(roomKey: string, socket: Socket) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      if (!room.gameState.winner) return;

      const playerEntry = room.gameState.players.find((p: any) => p.id === socket.id);
      if (!playerEntry) return;
      const playerNum = playerEntry.player;

      const existing = room.recaps?.get(playerNum);
      if (existing?.text || existing?.loading) return;

      if (!room.recaps) room.recaps = new Map();
      room.recaps.set(playerNum, { text: '', loading: true });
      socket.emit('recap-loading');

      generateRecap(room.gameId, room.gameState)
        .then((recapText) => {
          room.recaps?.set(playerNum, { text: recapText, loading: false });
          socket.emit('recap-generated', { text: recapText });
        })
        .catch((err) => {
          console.error('Failed to generate recap:', err);
          room.recaps?.set(playerNum, { text: '', loading: false });
          socket.emit('recap-generated', { text: '' });
        });
    },

    recapQuestion(roomKey: string, socket: Socket, data: { question: string }) {
      if (!rooms.has(roomKey)) {
        socket.emit('recap-answer', { error: 'Room does not exist.' });
        return;
      }
      const room = rooms.get(roomKey)!;
      if (!room.gameState.winner) {
        socket.emit('recap-answer', { error: 'Game is not over yet.' });
        return;
      }

      const playerEntry = room.gameState.players.find((p: any) => p.id === socket.id);
      if (!playerEntry) return;
      const playerNum = playerEntry.player;

      const recap = room.recaps?.get(playerNum);
      if (!recap?.text) {
        socket.emit('recap-answer', { error: 'Generate a recap first before asking questions.' });
        return;
      }

      if (!room.recapConversations) room.recapConversations = new Map();
      if (!room.recapConversations.has(playerNum)) {
        room.recapConversations.set(playerNum, []);
      }
      const history = room.recapConversations.get(playerNum)!;

      socket.emit('recap-answering');
      recapConversation(room.gameId, room.gameState, recap.text, history, data.question)
        .then((answer) => {
          history.push({ role: 'user', content: data.question });
          history.push({ role: 'assistant', content: answer });
          socket.emit('recap-answer', { question: data.question, answer });
        })
        .catch((err) => {
          console.error('Failed to answer recap question:', err);
          socket.emit('recap-answer', { error: 'Failed to process your question.' });
        });
    },

    newGame(roomKey: string, socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) {
        socket.emit('room-error', { message: 'Room does not exist.' });
        return;
      }
      const room = rooms.get(roomKey)!;
      const player = room.gameState.players.find((p: any) => p.id === socket.id);
      if (!player) {
        socket.emit('room-error', { message: 'You are not in this room.' });
        return;
      }
      player.ready = true;
      io.to(roomKey).emit('player-ready', { player: player.player });

      // Auto-ready any AI players
      room.gameState.players.forEach((p: any) => {
        if (p.isAI) {
          p.ready = true;
          io.to(roomKey).emit('player-ready', { player: p.player });
        }
      });

      const allReady = room.gameState.players.every((p: any) => p.ready);
      const playerCount = room.gameState.players.length;
      const gameConfig = gamesConfig.find((g: any) => g.id === room.gameId);
      const minPlayers = gameConfig?.minPlayers ?? 2;
      if (allReady && playerCount >= minPlayers) {
        const game = gamesRegistry[room.gameId];
        if (game) {
          if (playerCount === 2) {
            const p1 = room.gameState.players.find((p: any) => p.player === 1);
            const p2 = room.gameState.players.find((p: any) => p.player === 2);
            if (p1 && p2) {
              p1.player = 2;
              p2.player = 1;
              socketRooms.set(p1.id, { roomKey, playerNumber: 2 });
              socketRooms.set(p2.id, { roomKey, playerNumber: 1 });
              io.to(p1.id).emit('player-role', { player: 2 });
              io.to(p2.id).emit('player-role', { player: 1 });
            }
          }
          room.gameState = game.resetState(room.gameState.players);
          room.gameState.moveHistory = [];
          if (room.recaps) room.recaps.clear();
          if (room.recapConversations) room.recapConversations.clear();
          broadcastGameState(roomKey, room, io);
          triggerAIMoveIfActive(roomKey, room, io);
          startBingoTimer(roomKey, room, io);

          if (room.gameId === 'trivia') {
            stopTriviaTimers(roomKey);
            const mod = gamesRegistry['trivia'];
            if (mod?.onGameStart) {
              const p = mod.onGameStart(room);
              const promise = p ? Promise.resolve(p) : Promise.resolve();
              promise.then(() => {
                const r = rooms.get(roomKey);
                if (r) {
                  broadcastGameState(roomKey, r, io);
                  scheduleTriviaNextPhase(roomKey, io);
                }
              });
            }
          }

          if (room.gameId === 'infinite-word-chain') {
            const mod = gamesRegistry['infinite-word-chain'];
            if (mod?.onGameStart) {
              const p = mod.onGameStart(room);
              const promise = p ? Promise.resolve(p) : Promise.resolve();
              promise.then(() => {
                const r = rooms.get(roomKey);
                if (r) {
                  broadcastGameState(roomKey, r, io);
                }
              });
            }
          }

          if (room.gameId === 'pictionary') {
            stopPictionaryTimer(roomKey);
            const mod = gamesRegistry['pictionary'];
            if (mod?.onGameStart) {
              const p = mod.onGameStart(room);
              const promise = p ? Promise.resolve(p) : Promise.resolve();
              promise.then(() => {
                const r = rooms.get(roomKey);
                if (r) {
                  broadcastGameState(roomKey, r, io);
                }
              });
            }
          }
        }
      }
    },

    addAI(roomKey: string, difficulty: 'easy' | 'medium' | 'hard', socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) {
        socket.emit('room-error', { message: 'Room does not exist.' });
        return;
      }
      const room = rooms.get(roomKey)!;
      const gameConfig = gamesConfig.find((g: any) => g.id === room.gameId);
      const maxPlayers = gameConfig?.maxPlayers ?? 2;
      if (room.gameState.players.length >= maxPlayers) {
        socket.emit('room-error', { message: 'Room is full.' });
        return;
      }
      const playerNumber = room.gameState.players.length + 1;
      const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      room.gameState.players.push({
        id: 'ai-opponent',
        player: playerNumber,
        ready: true,
        name: `Computer (${diffLabel})`,
        isAI: true,
        difficulty
      });
      broadcastGameState(roomKey, room, io);
    },

    changeDifficulty(roomKey: string, difficulty: 'easy' | 'medium' | 'hard', socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      const aiPlayer = room.gameState.players.find((p: any) => p.isAI);
      if (aiPlayer) {
        aiPlayer.difficulty = difficulty;
        const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        aiPlayer.name = `Computer (${diffLabel})`;
        broadcastGameState(roomKey, room, io);
      }
    },

    removeAI(roomKey: string, socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      const playerIndex = room.gameState.players.findIndex((p: any) => p.isAI);
      if (playerIndex !== -1) {
        room.gameState.players.splice(playerIndex, 1);
        room.gameState.players.forEach((p: any, idx: number) => {
          p.player = idx + 1;
          p.ready = false;
          if (p.id !== 'ai-opponent') {
            socketRooms.set(p.id, { roomKey, playerNumber: p.player });
            io.to(p.id).emit('player-role', { player: p.player });
          }
        });
        broadcastGameState(roomKey, room, io);
      }
    },

    setTriviaOptions(roomKey: string, socket: Socket, data: { categorySlug?: string; categoryName?: string; difficulty?: string }, io: SocketIOServer) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      if (room.gameId !== 'trivia') return;
      const host = room.gameState.players.find((p: any) => p.id === socket.id);
      if (!host || host.player !== 1) return;
      room.gameState.triviaOptions = {
        categorySlug: data.categorySlug,
        categoryName: data.categoryName,
        difficulty: data.difficulty,
      };
      broadcastGameState(roomKey, room, io);
    },

    setPictionaryOptions(roomKey: string, socket: Socket, data: { timerDuration: number }, io: SocketIOServer) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      if (room.gameId !== 'pictionary') return;
      const host = room.gameState.players.find((p: any) => p.id === socket.id);
      if (!host || host.player !== 1) return;
      const duration = Math.max(15, Math.min(180, data.timerDuration));
      room.gameState.timerDuration = duration;
      room.gameState.timeRemaining = duration;
      broadcastGameState(roomKey, room, io);
    },

    sendChat(roomKey: string, socket: Socket, data: { text: string }, io: SocketIOServer) {
      if (!rooms.has(roomKey)) return;
      const room = rooms.get(roomKey)!;
      const player = room.gameState.players.find((p: any) => p.id === socket.id);
      if (!player) return;
      const text = (data.text || '').trim().slice(0, 200);
      if (!text) return;
      const message: ChatMessage = {
        player: player.player,
        playerName: player.name || `Player ${player.player}`,
        text,
        timestamp: Date.now(),
      };
      if (!room.chatMessages) room.chatMessages = [];
      room.chatMessages.push(message);
      io.to(roomKey).emit('chat-message', message);
    },

    getSocketRoom(socketId: string) {
      return socketRooms.get(socketId);
    },
  };
  return manager;
}
