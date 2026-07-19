import type { Player, EscapeRoomGameState, EscapeRoomPuzzle, EscapeRoomData, EscapeRoomLocation, Room } from '../../src/types/shared.js';
import escapeRooms from '../data/escape-rooms/rooms.js';

export type { Player, EscapeRoomGameState, EscapeRoomPuzzle, EscapeRoomData, EscapeRoomLocation, Room };

const MAX_GLOBAL_HINTS = 5;

export const getAvailableRooms = (): { id: string; name: string; description: string }[] => {
  return Object.values(escapeRooms).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
  }));
};

export const noTurns = true;

export const createInitialState = (playerId: string): EscapeRoomGameState => {
  return {
    phase: 'playing',
    selectedRoomId: 'abandoned-lab',
    currentPuzzleIndex: 0,
    puzzles: [],
    locations: [],
    availableRooms: getAvailableRooms(),
    players: [{ id: playerId, player: 1, ready: false }],
    winner: '',
    totalMoves: 0,
    attemptsThisPuzzle: 0,
    hintsUsed: 0,
    maxHints: MAX_GLOBAL_HINTS,
    solvedPuzzles: [],
    lastAction: null,
  };
};

export const resetState = (players: Player[]): EscapeRoomGameState => {
  return {
    phase: 'playing',
    selectedRoomId: 'abandoned-lab',
    currentPuzzleIndex: 0,
    puzzles: [],
    locations: [],
    availableRooms: getAvailableRooms(),
    players: players.map((p) => ({ ...p, ready: false })),
    winner: '',
    totalMoves: 0,
    attemptsThisPuzzle: 0,
    hintsUsed: 0,
    maxHints: MAX_GLOBAL_HINTS,
    solvedPuzzles: [],
    lastAction: null,
  };
};

export const onGameStart = (room: Room): void => {
  const gameState = room.gameState as EscapeRoomGameState;
  const roomData = escapeRooms[gameState.selectedRoomId || 'abandoned-lab'];
  if (roomData) {
    gameState.roomName = roomData.name;
    gameState.roomDescription = roomData.description;
    gameState.roomIntro = roomData.intro;
    gameState.puzzles = roomData.puzzles.map((p) => ({ ...p, solved: false }));
    gameState.locations = roomData.locations.map((l) => ({ ...l }));
  }
};

export const makeMove = (
  room: Room,
  socket: any,
  data: { action: string; answer?: string; hintIndex?: number }
): boolean => {
  const gameState = room.gameState as EscapeRoomGameState;

  if (gameState.phase === 'escaped') {
    socket.emit('invalid-move', { message: 'You have already escaped!' });
    return false;
  }

  const player = gameState.players.find((p) => p.id === socket.id);
  const playerNumber = player ? player.player : 0;

  if (data.action === 'submit-answer') {
    const answer = (data.answer || '').trim().toLowerCase();
    if (!answer) {
      socket.emit('invalid-move', { message: 'Please enter an answer.' });
      return false;
    }

    const currentPuzzle = gameState.puzzles.find((p) => !p.solved);
    if (!currentPuzzle) {
      socket.emit('invalid-move', { message: 'All puzzles are already solved!' });
      return false;
    }

    gameState.totalMoves++;
    gameState.attemptsThisPuzzle++;
    gameState.lastAction = { playerNumber, action: 'submit-answer', correct: false };

    if (answer === currentPuzzle.answer.toLowerCase()) {
      currentPuzzle.solved = true;
      gameState.solvedPuzzles.push(gameState.puzzles.indexOf(currentPuzzle));
      gameState.attemptsThisPuzzle = 0;
      gameState.lastAction = { playerNumber, action: 'submit-answer', correct: true };

      const allSolved = gameState.puzzles.every((p) => p.solved);
      if (allSolved) {
        gameState.phase = 'escaped';
        gameState.winner = 'Everyone escapes!';
      }
    } else {
      socket.emit('invalid-move', { message: 'Incorrect answer. Try again!' });
    }
    return true;
  }

  if (data.action === 'request-hint') {
    if (gameState.hintsUsed >= gameState.maxHints) {
      socket.emit('invalid-move', { message: 'No more hints remaining! You have used all your hints.' });
      return false;
    }

    const currentPuzzle = gameState.puzzles.find((p) => !p.solved);
    if (!currentPuzzle) {
      socket.emit('invalid-move', { message: 'No puzzle to give hints for.' });
      return false;
    }

    gameState.hintsUsed++;
    gameState.lastAction = { playerNumber, action: 'request-hint', correct: true };
    return true;
  }

  socket.emit('invalid-move', { message: 'Unknown action.' });
  return false;
};

export const setRoom = (room: Room, roomId: string): void => {
  const gameState = room.gameState as EscapeRoomGameState;
  if (escapeRooms[roomId]) {
    gameState.selectedRoomId = roomId;
  }
};
