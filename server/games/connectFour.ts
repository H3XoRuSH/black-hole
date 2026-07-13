import type { Player, Room } from '../../src/types/shared.js';

export interface ConnectFourGameState {
  board: (number | null)[][];
  currentPlayer: number;
  totalMoves: number;
  winner: string;
  players: Player[];
  lastMove?: { row: number; col: number };
}

export const checkConnectFourWinner = (board: (number | null)[][]): number => {
  const rows = 6;
  const cols = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (
        p
        && p === board[r][c + 1]
        && p === board[r][c + 2]
        && p === board[r][c + 3]
      ) {
        return p;
      }
    }
  }
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols; c++) {
      const p = board[r][c];
      if (
        p
        && p === board[r + 1][c]
        && p === board[r + 2][c]
        && p === board[r + 3][c]
      ) {
        return p;
      }
    }
  }
  for (let r = 3; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (
        p
        && p === board[r - 1][c + 1]
        && p === board[r - 2][c + 2]
        && p === board[r - 3][c + 3]
      ) {
        return p;
      }
    }
  }
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (
        p
        && p === board[r + 1][c + 1]
        && p === board[r + 2][c + 2]
        && p === board[r + 3][c + 3]
      ) {
        return p;
      }
    }
  }
  return 0;
};

export const createInitialState = (playerId: string): ConnectFourGameState => {
  return {
    board: Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
    currentPlayer: 1,
    totalMoves: 0,
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
  };
};

export const resetState = (players: Player[]): ConnectFourGameState => {
  return {
    board: Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
    currentPlayer: 1,
    totalMoves: 0,
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
  };
};

export const makeMove = (
  room: Room,
  socket: any,
  data: { col: number }
): boolean => {
  const { col } = data;
  const gameState = room.gameState as ConnectFourGameState;
  if (col < 0 || col > 6 || gameState.winner) {
    socket.emit('invalid-move', { message: 'Invalid move or game is over.' });
    return false;
  }
  let rowToPlace = -1;
  for (let r = 5; r >= 0; r--) {
    if (gameState.board[r][col] === null) {
      rowToPlace = r;
      break;
    }
  }
  if (rowToPlace === -1) {
    socket.emit('invalid-move', { message: 'Column is full.' });
    return false;
  }
  gameState.board[rowToPlace][col] = gameState.currentPlayer;
  gameState.lastMove = { row: rowToPlace, col };
  gameState.totalMoves++;

  const winnerPlayer = checkConnectFourWinner(gameState.board);
  if (winnerPlayer) {
    const winnerName = gameState.players.find((p) => p.player === winnerPlayer)?.name || `Player ${winnerPlayer}`;
    gameState.winner = `${winnerName} wins!`;
  } else if (gameState.totalMoves >= 42) {
    gameState.winner = 'Tie game!';
  }

  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  gameState.players.forEach((p) => (p.ready = false));
  return true;
};

/**
 * ConnectFourComputer - AI Move Generator for Connect Four.
 * Supports three difficulty levels:
 * - Easy: 70% mistake rate. Uses a basic 1-ply static heuristic (plays winning move or blocks opponent's win, else uses column preference).
 * - Medium: 40% mistake rate. Uses a 3-ply alpha-beta minimax search with strategic board evaluation.
 * - Hard: 0% mistake rate. Uses a 5-ply alpha-beta minimax search for deep look-ahead.
 *
 * Board Evaluation logic:
 * - Assigns scores to all potential 4-in-a-row paths (horizontal, vertical, diagonal).
 * - Paths with 4 of AI's pieces get a high win score (+10000), 3 pieces + 1 empty space get +100, 2 pieces + 2 empty get +10.
 *   Equivalent negative scores are given for opponent configurations, and control of the center column is slightly prioritized.
 */
export class ConnectFourComputer {
  static async getAIMove(gameState: ConnectFourGameState): Promise<{ col: number }> {
    const aiPlayer = gameState.players.find((p) => p.isAI);
    const difficulty = aiPlayer?.difficulty || 'hard';

    let mistakeRate = 0;
    if (difficulty === 'easy') mistakeRate = 0.7;
    else if (difficulty === 'medium') mistakeRate = 0.4;

    if (Math.random() < mistakeRate) {
      const validCols: number[] = [];
      for (let c = 0; c < 7; c++) {
        if (gameState.board[0][c] === null) validCols.push(c);
      }
      if (validCols.length > 0) {
        const randomCol = validCols[Math.floor(Math.random() * validCols.length)];
        return { col: randomCol };
      }
    }

    if (difficulty === 'easy') {
      return { col: this.getStaticHeuristicMove(gameState) };
    } else if (difficulty === 'medium') {
      return { col: this.getBestMoveUsingMinimax(gameState, 3) };
    } else {
      return { col: this.getBestMoveUsingMinimax(gameState, 5) };
    }
  }

  private static getStaticHeuristicMove(gameState: ConnectFourGameState): number {
    const board = gameState.board;
    const cols = 7;

    const checkWin = (r: number, c: number, p: number): boolean => {
      board[r][c] = p;
      const isWin = this.checkWinInline(board, p);
      board[r][c] = null;
      return isWin;
    };

    // Check if AI (player 2) can win
    for (let c = 0; c < cols; c++) {
      const r = getLowestEmptyRow(board, c);
      if (r !== -1 && checkWin(r, c, 2)) return c;
    }

    // Check if Player 1 can win, block them
    for (let c = 0; c < cols; c++) {
      const r = getLowestEmptyRow(board, c);
      if (r !== -1 && checkWin(r, c, 1)) return c;
    }

    const pref = [3, 2, 4, 1, 5, 0, 6];
    for (const c of pref) {
      if (getLowestEmptyRow(board, c) !== -1) return c;
    }

    return 0;
  }

  private static checkWinInline(board: (number | null)[][], p: number): boolean {
    const rows = 6;
    const cols = 7;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 3; c++) {
        if (board[r][c] === p && board[r][c + 1] === p && board[r][c + 2] === p && board[r][c + 3] === p) return true;
      }
    }
    for (let r = 0; r < rows - 3; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === p && board[r + 1][c] === p && board[r + 2][c] === p && board[r + 3][c] === p) return true;
      }
    }
    for (let r = 3; r < rows; r++) {
      for (let c = 0; c < cols - 3; c++) {
        if (board[r][c] === p && board[r - 1][c + 1] === p && board[r - 2][c + 2] === p && board[r - 3][c + 3] === p) return true;
      }
    }
    for (let r = 0; r < rows - 3; r++) {
      for (let c = 0; c < cols - 3; c++) {
        if (board[r][c] === p && board[r + 1][c + 1] === p && board[r + 2][c + 2] === p && board[r + 3][c + 3] === p) return true;
      }
    }
    return false;
  }

  private static getBestMoveUsingMinimax(gameState: ConnectFourGameState, depth: number): number {
    const board = gameState.board.map((row) => [...row]);
    const aiPlayer = gameState.currentPlayer;
    const opponentPlayer = aiPlayer === 1 ? 2 : 1;
    const pref = [3, 2, 4, 1, 5, 0, 6];

    let bestCol = 3;
    let bestVal = -Infinity;

    for (const c of pref) {
      const r = getLowestEmptyRow(board, c);
      if (r !== -1) {
        board[r][c] = aiPlayer;
        const val = minimax(board, depth - 1, false, -Infinity, Infinity, aiPlayer, opponentPlayer);
        board[r][c] = null;
        if (val > bestVal) {
          bestVal = val;
          bestCol = c;
        }
      }
    }

    if (getLowestEmptyRow(board, bestCol) === -1) {
      for (let c = 0; c < 7; c++) {
        if (getLowestEmptyRow(board, c) !== -1) return c;
      }
    }

    return bestCol;
  }
}

const getLowestEmptyRow = (board: (number | null)[][], c: number): number => {
  for (let r = 5; r >= 0; r--) {
    if (board[r][c] === null) return r;
  }
  return -1;
};

const evaluateWindow = (window: (number | null)[], player: number): number => {
  let score = 0;
  const oppPlayer = player === 1 ? 2 : 1;
  let playerCount = 0;
  let oppCount = 0;
  let emptyCount = 0;

  for (const val of window) {
    if (val === player) playerCount++;
    else if (val === oppPlayer) oppCount++;
    else emptyCount++;
  }

  if (playerCount === 4) score += 10000;
  else if (playerCount === 3 && emptyCount === 1) score += 100;
  else if (playerCount === 2 && emptyCount === 2) score += 10;

  if (oppCount === 4) score -= 10000;
  else if (oppCount === 3 && emptyCount === 1) score -= 100;
  else if (oppCount === 2 && emptyCount === 2) score -= 10;

  return score;
};

const evaluateBoard = (board: (number | null)[][], player: number): number => {
  let score = 0;
  const rows = 6;
  const cols = 7;

  // Prioritize center column control
  const centerCol = 3;
  let centerCount = 0;
  for (let r = 0; r < rows; r++) {
    if (board[r][centerCol] === player) centerCount++;
  }
  score += centerCount * 4;

  // Horizontal evaluation
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += evaluateWindow(window, player);
    }
  }

  // Vertical evaluation
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 3; r++) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(window, player);
    }
  }

  // Diagonal \ evaluation
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(window, player);
    }
  }

  // Diagonal / evaluation
  for (let r = 3; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += evaluateWindow(window, player);
    }
  }

  return score;
};

const checkWinSimple = (board: (number | null)[][], p: number): boolean => {
  const rows = 6;
  const cols = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      if (board[r][c] === p && board[r][c + 1] === p && board[r][c + 2] === p && board[r][c + 3] === p) return true;
    }
  }
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === p && board[r + 1][c] === p && board[r + 2][c] === p && board[r + 3][c] === p) return true;
    }
  }
  for (let r = 3; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      if (board[r][c] === p && board[r - 1][c + 1] === p && board[r - 2][c + 2] === p && board[r - 3][c + 3] === p) return true;
    }
  }
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols - 3; c++) {
      if (board[r][c] === p && board[r + 1][c + 1] === p && board[r + 2][c + 2] === p && board[r + 3][c + 3] === p) return true;
    }
  }
  return false;
};

const minimax = (
  board: (number | null)[][],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: number,
  opponentPlayer: number
): number => {
  if (checkWinSimple(board, aiPlayer)) return 1000000 + depth;
  if (checkWinSimple(board, opponentPlayer)) return -1000000 - depth;

  const validCols: number[] = [];
  for (let c = 0; c < 7; c++) {
    if (board[0][c] === null) validCols.push(c);
  }

  if (depth === 0 || validCols.length === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  const pref = [3, 2, 4, 1, 5, 0, 6];
  const orderedCols = pref.filter((c) => validCols.includes(c));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const c of orderedCols) {
      const r = getLowestEmptyRow(board, c);
      if (r !== -1) {
        board[r][c] = aiPlayer;
        const evaluation = minimax(board, depth - 1, false, alpha, beta, aiPlayer, opponentPlayer);
        board[r][c] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const c of orderedCols) {
      const r = getLowestEmptyRow(board, c);
      if (r !== -1) {
        board[r][c] = opponentPlayer;
        const evaluation = minimax(board, depth - 1, true, alpha, beta, aiPlayer, opponentPlayer);
        board[r][c] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
};

export const getAIMove = (gameState: ConnectFourGameState) => ConnectFourComputer.getAIMove(gameState);
