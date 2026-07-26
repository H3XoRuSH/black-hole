import type { Player, Room } from '../../src/types/shared.js';
import type { SnakesLaddersGameState } from '../../src/types/shared.js';

export const createInitialState = (playerId: string): SnakesLaddersGameState => {
  const state: SnakesLaddersGameState = {
    boardType: 'classic',
    gridSize: 10,
    snakesCount: 8,
    laddersCount: 8,
    snakes: {},
    ladders: {},
    players: [{ id: playerId, player: 1, ready: false }],
    currentPlayer: 1,
    positions: { 1: 1 },
    winner: '',
    totalMoves: 0,
    lastRoll: null,
    lastRollWasSix: false,
    lastMove: null,
  };
  recreateBoard(state);
  return state;
};

export const resetState = (players: Player[]): SnakesLaddersGameState => {
  // Extract configuration from previous state if available, otherwise defaults
  const state: SnakesLaddersGameState = {
    boardType: 'classic',
    gridSize: 10,
    snakesCount: 8,
    laddersCount: 8,
    snakes: {},
    ladders: {},
    players: players.map((p) => ({ ...p, ready: false })),
    currentPlayer: 1,
    positions: {},
    winner: '',
    totalMoves: 0,
    lastRoll: null,
    lastRollWasSix: false,
    lastMove: null,
  };

  // Initialize all player positions to cell 1
  players.forEach((p) => {
    state.positions[p.player] = 1;
  });

  recreateBoard(state);
  return state;
};

// Classic snakes & ladders layouts
const CLASSIC_LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
  80: 99,
};

const CLASSIC_SNAKES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 18,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 79,
};

export const recreateBoard = (state: SnakesLaddersGameState) => {
  if (state.boardType === 'classic') {
    state.gridSize = 10;
    state.snakes = { ...CLASSIC_SNAKES };
    state.ladders = { ...CLASSIC_LADDERS };
    state.snakesCount = Object.keys(CLASSIC_SNAKES).length;
    state.laddersCount = Object.keys(CLASSIC_LADDERS).length;
  } else {
    // Generate randomized snakes and ladders
    const size = state.gridSize;
    const maxCell = size * size;
    const snakes: Record<number, number> = {};
    const ladders: Record<number, number> = {};

    // We want to keep all start and end points disjoint to avoid complex chains
    const usedCells = new Set<number>([1, maxCell]); // Avoid start and end

    // Helper to get a random cell that hasn't been used
    const getRandomUnusedCell = (min: number, max: number): number => {
      let attempts = 0;
      while (attempts < 100) {
        const cell = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!usedCells.has(cell)) {
          return cell;
        }
        attempts++;
      }
      return -1;
    };

    // 1. Generate ladders (bottom -> top)
    let laddersPlaced = 0;
    const targetLadders = Math.min(state.laddersCount, Math.floor(maxCell / 4));
    for (let i = 0; i < targetLadders; i++) {
      // Find a bottom cell (should be in the lower half/mid-sections)
      const bottom = getRandomUnusedCell(2, maxCell - size);
      if (bottom === -1) break;

      // Find a top cell (must be higher than bottom)
      const top = getRandomUnusedCell(bottom + 1, maxCell - 1);
      if (top === -1) continue;

      ladders[bottom] = top;
      usedCells.add(bottom);
      usedCells.add(top);
      laddersPlaced++;
    }

    // 2. Generate snakes (head -> tail)
    let snakesPlaced = 0;
    const targetSnakes = Math.min(state.snakesCount, Math.floor(maxCell / 4));
    for (let i = 0; i < targetSnakes; i++) {
      // Find a head cell (must be in the upper/mid-sections, higher than size)
      const head = getRandomUnusedCell(size + 1, maxCell - 1);
      if (head === -1) break;

      // Find a tail cell (must be lower than head)
      const tail = getRandomUnusedCell(2, head - 1);
      if (tail === -1) continue;

      snakes[head] = tail;
      usedCells.add(head);
      usedCells.add(tail);
      snakesPlaced++;
    }

    state.snakes = snakes;
    state.ladders = ladders;
    state.snakesCount = laddersPlaced; // Adjust actual count to what succeeded
    state.laddersCount = snakesPlaced; // Adjust actual count to what succeeded
  }

  // Ensure all players are initialized in positions
  state.players.forEach((p) => {
    if (state.positions[p.player] === undefined) {
      state.positions[p.player] = 1;
    }
  });
};

export const makeMove = (
  room: Room,
  socket: any,
  data: any
): boolean => {
  const gameState = room.gameState as SnakesLaddersGameState;

  if (gameState.winner) {
    socket.emit('invalid-move', { message: 'Game is already over.' });
    return false;
  }

  // Find the player associated with this socket
  const playerInfo = gameState.players.find((p) => p.id === socket.id);
  if (!playerInfo) {
    socket.emit('invalid-move', { message: 'You are not in this game.' });
    return false;
  }

  if (gameState.currentPlayer !== playerInfo.player) {
    socket.emit('invalid-move', { message: 'It is not your turn.' });
    return false;
  }

  if (data.action !== 'roll') {
    socket.emit('invalid-move', { message: 'Invalid action.' });
    return false;
  }

  // Roll a 6-sided die
  const roll = Math.floor(Math.random() * 6) + 1;
  const currentPos = gameState.positions[playerInfo.player] || 1;
  const targetPos = currentPos + roll;
  const maxCell = gameState.gridSize * gameState.gridSize;

  let newPos = targetPos;

  // Bounce rule
  if (targetPos > maxCell) {
    const overshoot = targetPos - maxCell;
    newPos = maxCell - overshoot;
  }

  // Check for snakes or ladders landing
  let finalPos = newPos;
  let snakeOrLadder: 'snake' | 'ladder' | null = null;

  if (gameState.snakes[newPos]) {
    finalPos = gameState.snakes[newPos];
    snakeOrLadder = 'snake';
  } else if (gameState.ladders[newPos]) {
    finalPos = gameState.ladders[newPos];
    snakeOrLadder = 'ladder';
  }

  // Apply move to state
  gameState.positions[playerInfo.player] = finalPos;
  gameState.lastRoll = roll;
  gameState.lastRollWasSix = roll === 6;
  gameState.totalMoves++;

  gameState.lastMove = {
    player: playerInfo.player,
    from: currentPos,
    to: newPos,
    finalTo: finalPos,
    snakeOrLadder,
  };

  // Enrich data for roomManager moveHistory
  data.roll = roll;
  data.from = currentPos;
  data.to = newPos;
  data.finalTo = finalPos;
  data.snakeOrLadder = snakeOrLadder;

  // Check victory condition
  if (finalPos === maxCell) {
    gameState.winner = playerInfo.name || `Player ${playerInfo.player}`;
  } else {
    // If player rolled a 6, they get an extra turn
    if (roll !== 6) {
      // Find next player (turn goes: P1 -> P2 -> ... -> Pmax -> P1)
      const playerNumbers = gameState.players.map((p) => p.player).sort((a, b) => a - b);
      const currentIndex = playerNumbers.indexOf(gameState.currentPlayer);
      const nextIndex = (currentIndex + 1) % playerNumbers.length;
      gameState.currentPlayer = playerNumbers[nextIndex];
    }
  }

  return true;
};
