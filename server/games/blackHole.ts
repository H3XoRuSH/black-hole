import type { Player, BlackHoleGameState, Room } from '../../src/types/shared.js';

export type { Player, BlackHoleGameState, Room };

const allPositions = (): string[] => {
  const positions: string[] = [];
  for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= row; col++) {
      positions.push(`${row}-${col}`);
    }
  }
  return positions;
};

const getNeighbors = (row: number, col: number): string[] => {
  const neighbors: string[] = [];
  if (col > 1) neighbors.push(`${row}-${col - 1}`);
  if (col < row) neighbors.push(`${row}-${col + 1}`);
  if (row > 1) {
    if (col <= row - 1) neighbors.push(`${row - 1}-${col}`);
    if (col > 1) neighbors.push(`${row - 1}-${col - 1}`);
  }
  if (row < 6) {
    neighbors.push(`${row + 1}-${col}`);
    if (col <= row) neighbors.push(`${row + 1}-${col + 1}`);
  }
  return neighbors.filter((pos) => allPositions().includes(pos));
};

export const calculateScores = (
  gameState: BlackHoleGameState
): { player1: number; player2: number } => {
  const taken = Object.keys(gameState.circles);
  const remaining = allPositions().filter((pos) => !taken.includes(pos));
  if (remaining.length !== 1) {
    return { player1: 0, player2: 0 };
  }
  const blackCircle = remaining[0];
  const [blackRow, blackCol] = blackCircle.split('-').map(Number);
  const neighbors = getNeighbors(blackRow, blackCol);
  let player1Sum = 0,
    player2Sum = 0;
  neighbors.forEach((key) => {
    const data = gameState.circles[key];
    if (data) {
      if (data.player === 1) player1Sum += data.turn;
      else if (data.player === 2) player2Sum += data.turn;
    }
  });
  return { player1: player1Sum, player2: player2Sum };
};

export const getWinner = (gameState: BlackHoleGameState): string => {
  if (gameState.totalMoves < gameState.maxTurnsPerPlayer * 2) return '';
  const { player1, player2 } = calculateScores(gameState);
  if (player1 < player2 || (player1 === 0 && player2 === 0)) {
    return 'Player 1 wins!';
  } else if (player2 < player1) {
    return 'Player 2 wins!';
  } else {
    return 'Tie game!';
  }
};

export const createInitialState = (playerId: string): BlackHoleGameState => {
  return {
    circles: {},
    currentPlayer: 1,
    totalMoves: 0,
    maxTurnsPerPlayer: 10,
    players: [{ id: playerId, player: 1, ready: false }],
    scores: { player1: 0, player2: 0 },
    winner: '',
  };
};

export const resetState = (players: Player[]): BlackHoleGameState => {
  return {
    circles: {},
    currentPlayer: 1,
    totalMoves: 0,
    maxTurnsPerPlayer: 10,
    players: players.map((p) => ({ ...p, ready: false })),
    scores: { player1: 0, player2: 0 },
    winner: '',
  };
};

export const makeMove = (
  room: Room,
  socket: any,
  data: { row: number; col: number }
): boolean => {
  const { row, col } = data;
  const gameState = room.gameState as BlackHoleGameState;
  if (gameState.totalMoves >= gameState.maxTurnsPerPlayer * 2) {
    socket.emit('invalid-move', { message: 'Game is over.' });
    return false;
  }
  const key = `${row}-${col}`;
  if (gameState.circles[key]) {
    socket.emit('invalid-move', { message: 'Circle already taken.' });
    return false;
  }

  const playerTurnNumber = Math.floor(gameState.totalMoves / 2) + 1;
  gameState.circles[key] = {
    player: gameState.currentPlayer,
    turn: playerTurnNumber,
  };
  gameState.lastMove = { row, col };
  gameState.totalMoves++;
  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;

  gameState.players.forEach((p) => (p.ready = false));

  gameState.scores = calculateScores(gameState);
  gameState.winner = getWinner(gameState);
  return true;
};
