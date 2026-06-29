import type { Player, BlackHoleGameState, Room } from '../../src/types/shared.js';

export type { Player, BlackHoleGameState, Room };

const ALL_POSITIONS: string[] = (() => {
  const positions: string[] = [];
  for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= row; col++) {
      positions.push(`${row}-${col}`);
    }
  }
  return positions;
})();

const NEIGHBORS_MAP: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  const calculateNeighbors = (row: number, col: number): string[] => {
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
    return neighbors.filter((pos) => ALL_POSITIONS.includes(pos));
  };
  for (const pos of ALL_POSITIONS) {
    const [row, col] = pos.split('-').map(Number);
    map[pos] = calculateNeighbors(row, col);
  }
  return map;
})();

const allPositions = (): string[] => ALL_POSITIONS;

const getNeighbors = (row: number, col: number): string[] => {
  return NEIGHBORS_MAP[`${row}-${col}`] || [];
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

/**
 * BlackHoleComputer - AI Move Generator for the Black Hole game.
 * Supports three difficulty levels:
 * - Easy: 70% mistake rate. Uses a basic static heuristic sorting moves by total neighbor counts
 *         (placing lower numbers on high-neighbor spaces and higher numbers on low-neighbor/edge spaces).
 * - Medium: 40% mistake rate. Uses a 2-ply deep alpha-beta minimax search with a dynamic board evaluation.
 * - Hard: 0% mistake rate. Uses a 3-ply minimax search in the early/mid game and searches to the
 *         end of the game (full minimax) when 8 or fewer empty cells remain.
 *
 * Board Evaluation logic:
 * - A dynamic evaluation function calculates the exposure of players' tiles to the final black hole
 *   by multiplying the tile values by their number of unoccupied neighbors. It aims to minimize
 *   this score for the AI player and maximize it for the opponent.
 */
export class BlackHoleComputer {
  static async getAIMove(gameState: BlackHoleGameState): Promise<{ row: number; col: number }> {
    const aiPlayer = gameState.players.find((p) => p.isAI);
    const difficulty = aiPlayer?.difficulty || 'hard';

    let mistakeRate = 0;
    if (difficulty === 'easy') mistakeRate = 0.7;
    else if (difficulty === 'medium') mistakeRate = 0.4;

    if (Math.random() < mistakeRate) {
      const allPos: { row: number; col: number }[] = [];
      for (let r = 1; r <= 6; r++) {
        for (let c = 1; c <= r; c++) {
          allPos.push({ row: r, col: c });
        }
      }
      const unoccupied = allPos.filter((pos) => !gameState.circles[`${pos.row}-${pos.col}`]);
      if (unoccupied.length > 0) {
        return unoccupied[Math.floor(Math.random() * unoccupied.length)];
      }
    }

    if (difficulty === 'easy') {
      return this.getStaticHeuristicMove(gameState);
    } else if (difficulty === 'medium') {
      return this.getMediumMove(gameState);
    } else {
      return this.getHardMove(gameState);
    }
  }

  private static getStaticHeuristicMove(gameState: BlackHoleGameState): { row: number; col: number } {
    const allPos: { row: number; col: number }[] = [];
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= r; c++) {
        allPos.push({ row: r, col: c });
      }
    }
    const unoccupied = allPos.filter((pos) => !gameState.circles[`${pos.row}-${pos.col}`]);
    if (unoccupied.length === 0) return { row: 1, col: 1 };

    const getNeighborsCount = (row: number, col: number): number => {
      let count = 0;
      const neighbors = [
        [row, col - 1],
        [row, col + 1],
        [row - 1, col],
        [row - 1, col - 1],
        [row + 1, col],
        [row + 1, col + 1]
      ];
      for (const [r, c] of neighbors) {
        if (c >= 1 && c <= r && r >= 1 && r <= 6) count++;
      }
      return count;
    };

    const tileVal = Math.floor(gameState.totalMoves / 2) + 1;

    if (tileVal <= 4) {
      unoccupied.sort((a, b) => getNeighborsCount(b.row, b.col) - getNeighborsCount(a.row, a.col));
    } else if (tileVal >= 7) {
      unoccupied.sort((a, b) => getNeighborsCount(a.row, a.col) - getNeighborsCount(b.row, b.col));
    } else {
      unoccupied.sort(() => Math.random() - 0.5);
    }

    return unoccupied[0];
  }

  private static getMediumMove(gameState: BlackHoleGameState): { row: number; col: number } {
    return this.getBestMoveUsingMinimax(gameState, 2);
  }

  private static getHardMove(gameState: BlackHoleGameState): { row: number; col: number } {
    const allPos: { row: number; col: number }[] = [];
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= r; c++) {
        allPos.push({ row: r, col: c });
      }
    }
    const unoccupiedCount = allPos.filter((pos) => !gameState.circles[`${pos.row}-${pos.col}`]).length;
    const depth = unoccupiedCount <= 8 ? unoccupiedCount : 3;
    return this.getBestMoveUsingMinimax(gameState, depth);
  }

  private static getBestMoveUsingMinimax(
    gameState: BlackHoleGameState,
    depth: number
  ): { row: number; col: number } {
    const allPos: { row: number; col: number }[] = [];
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= r; c++) {
        allPos.push({ row: r, col: c });
      }
    }
    const unoccupied = allPos.filter((pos) => !gameState.circles[`${pos.row}-${pos.col}`]);
    if (unoccupied.length === 0) return { row: 1, col: 1 };

    const circles = { ...gameState.circles };
    const currentPlayer = gameState.currentPlayer;
    const totalMoves = gameState.totalMoves;
    const tileVal = Math.floor(totalMoves / 2) + 1;

    let bestMove = unoccupied[0];
    if (currentPlayer === 1) {
      let bestVal = -Infinity;
      for (const pos of unoccupied) {
        const key = `${pos.row}-${pos.col}`;
        circles[key] = { player: 1, turn: tileVal };
        const val = minimax(circles, 2, totalMoves + 1, depth - 1, -Infinity, Infinity);
        delete circles[key];
        if (val > bestVal) {
          bestVal = val;
          bestMove = pos;
        }
      }
    } else {
      let bestVal = Infinity;
      for (const pos of unoccupied) {
        const key = `${pos.row}-${pos.col}`;
        circles[key] = { player: 2, turn: tileVal };
        const val = minimax(circles, 1, totalMoves + 1, depth - 1, -Infinity, Infinity);
        delete circles[key];
        if (val < bestVal) {
          bestVal = val;
          bestMove = pos;
        }
      }
    }

    return bestMove;
  }
}

interface CircleMove {
  player: number;
  turn: number;
}

const getTerminalScore = (
  circles: Record<string, CircleMove>,
  blackCircle: string
): { player1: number; player2: number } => {
  const [blackRow, blackCol] = blackCircle.split('-').map(Number);
  const neighbors = getNeighbors(blackRow, blackCol);
  let player1Sum = 0;
  let player2Sum = 0;
  for (const key of neighbors) {
    const data = circles[key];
    if (data) {
      if (data.player === 1) player1Sum += data.turn;
      else if (data.player === 2) player2Sum += data.turn;
    }
  }
  return { player1: player1Sum, player2: player2Sum };
};

const evaluateBoard = (circles: Record<string, CircleMove>): number => {
  let p1Score = 0;
  let p2Score = 0;
  for (const key of Object.keys(circles)) {
    const data = circles[key];
    const [row, col] = key.split('-').map(Number);
    const unoccupiedNeighbors = getNeighbors(row, col).filter((n) => !circles[n]).length;
    if (data.player === 1) {
      p1Score += data.turn * unoccupiedNeighbors;
    } else {
      p2Score += data.turn * unoccupiedNeighbors;
    }
  }
  return p2Score - p1Score;
};

const minimax = (
  circles: Record<string, CircleMove>,
  currentPlayer: number,
  totalMoves: number,
  depth: number,
  alpha: number,
  beta: number
): number => {
  const unoccupied = ALL_POSITIONS.filter((pos) => !circles[pos]);

  if (unoccupied.length === 1) {
    const scores = getTerminalScore(circles, unoccupied[0]);
    return scores.player2 - scores.player1;
  }
  if (depth === 0) {
    return evaluateBoard(circles);
  }

  const tileVal = Math.floor(totalMoves / 2) + 1;

  if (currentPlayer === 1) {
    let maxEval = -Infinity;
    for (const pos of unoccupied) {
      circles[pos] = { player: 1, turn: tileVal };
      const evaluation = minimax(circles, 2, totalMoves + 1, depth - 1, alpha, beta);
      delete circles[pos];
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const pos of unoccupied) {
      circles[pos] = { player: 2, turn: tileVal };
      const evaluation = minimax(circles, 1, totalMoves + 1, depth - 1, alpha, beta);
      delete circles[pos];
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
};

export const getAIMove = (gameState: BlackHoleGameState) => BlackHoleComputer.getAIMove(gameState);
