import type { Player, Room } from '../../src/types/shared.js';

export interface CheckersGameState {
  board: number[][];
  currentPlayer: number;
  winner: string;
  players: Player[];
  totalMoves: number;
  mustCapturePos: string | null;
  lastMoveFrom?: string;
  lastMoveTo?: string;
}

const ROWS = 8;
const COLS = 8;
const EMPTY = 0;
const P1 = 1;
const P2 = 2;
const K1 = 3;
const K2 = 4;

const createEmptyBoard = (): number[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));

const isDark = (r: number, c: number) => (r + c) % 2 === 1;

const opponent = (player: number) => (player === 1 ? 2 : 1);
const isOwn = (v: number, p: number) => v === p || v === p + 2;
const isKing = (v: number) => v === K1 || v === K2;
const owner = (v: number) => (v === P1 || v === K1 ? 1 : 2);

const initBoard = (): number[][] => {
  const board = createEmptyBoard();
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isDark(r, c)) board[r][c] = P2;
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isDark(r, c)) board[r][c] = P1;
    }
  }
  return board;
};

const directions = (v: number): [number, number][] => {
  if (isKing(v)) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  if (v === P1) return [[-1, -1], [-1, 1]];
  return [[1, -1], [1, 1]];
};

const inBounds = (r: number, c: number) =>
  r >= 0 && r < ROWS && c >= 0 && c < COLS;

const getCapturesForPiece = (
  board: number[][],
  r: number,
  c: number
): [number, number][] => {
  const v = board[r][c];
  if (v === EMPTY) return [];
  const p = owner(v);
  const opp = opponent(p);
  const results: [number, number][] = [];
  for (const [dr, dc] of directions(v)) {
    const mr = r + dr;
    const mc = c + dc;
    const tr = r + 2 * dr;
    const tc = c + 2 * dc;
    if (
      inBounds(tr, tc)
      && isOwn(board[mr]?.[mc], opp)
      && board[tr][tc] === EMPTY
    ) {
      results.push([tr, tc]);
    }
  }
  return results;
};

const hasAnyCapture = (
  board: number[][],
  player: number
): boolean => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isOwn(board[r][c], player) && getCapturesForPiece(board, r, c).length > 0) {
        return true;
      }
    }
  }
  return false;
};

const getSimpleMoves = (
  board: number[][],
  r: number,
  c: number
): [number, number][] => {
  const v = board[r][c];
  if (v === EMPTY) return [];
  const results: [number, number][] = [];
  for (const [dr, dc] of directions(v)) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc) && board[nr][nc] === EMPTY) {
      results.push([nr, nc]);
    }
  }
  return results;
};

const countPieces = (board: number[][], player: number): number => {
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isOwn(board[r][c], player)) count++;
    }
  }
  return count;
};

const hasLegalMoves = (board: number[][], player: number): boolean => {
  if (hasAnyCapture(board, player)) return true;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isOwn(board[r][c], player) && getSimpleMoves(board, r, c).length > 0) {
        return true;
      }
    }
  }
  return false;
};

export const createInitialState = (playerId: string): CheckersGameState => {
  return {
    board: initBoard(),
    currentPlayer: 1,
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
    totalMoves: 0,
    mustCapturePos: null,
  };
};

export const resetState = (players: Player[]): CheckersGameState => {
  return {
    board: initBoard(),
    currentPlayer: 1,
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
    totalMoves: 0,
    mustCapturePos: null,
  };
};

export const makeMove = (
  room: Room,
  socket: any,
  data: { fromRow: number; fromCol: number; toRow: number; toCol: number }
): boolean => {
  const { fromRow, fromCol, toRow, toCol } = data;
  const gameState = room.gameState as CheckersGameState;
  const board = gameState.board;

  if (gameState.winner) {
    socket.emit('invalid-move', { message: 'Game is over.' });
    return false;
  }

  if (!inBounds(fromRow, fromCol) || !inBounds(toRow, toCol)) {
    socket.emit('invalid-move', { message: 'Out of bounds.' });
    return false;
  }

  const piece = board[fromRow][fromCol];
  if (piece === EMPTY || !isOwn(piece, gameState.currentPlayer)) {
    socket.emit('invalid-move', { message: 'No piece there or not your piece.' });
    return false;
  }

  if (board[toRow][toCol] !== EMPTY) {
    socket.emit('invalid-move', { message: 'Destination is occupied.' });
    return false;
  }

  const dr = toRow - fromRow;
  const dc = toCol - fromCol;
  const isDiagonal = Math.abs(dr) === Math.abs(dc);
  if (!isDiagonal || Math.abs(dr) < 1) {
    socket.emit('invalid-move', { message: 'Must move diagonally.' });
    return false;
  }

  const isCapture = Math.abs(dr) === 2;

  if (gameState.mustCapturePos) {
    const [mustR, mustC] = gameState.mustCapturePos.split(',').map(Number);
    if (fromRow !== mustR || fromCol !== mustC) {
      socket.emit('invalid-move', { message: 'You must continue capturing with the same piece.' });
      return false;
    }
  }

  if (isCapture) {
    const midR = fromRow + dr / 2;
    const midC = fromCol + dc / 2;
    const target = board[midR][midC];
    const opp = opponent(gameState.currentPlayer);
    if (!inBounds(midR, midC) || !isOwn(target, opp)) {
      socket.emit('invalid-move', { message: 'No piece to capture there.' });
      return false;
    }
  } else {
    const capturesExist = hasAnyCapture(board, gameState.currentPlayer);
    if (capturesExist || gameState.mustCapturePos) {
      socket.emit('invalid-move', { message: 'You must capture.' });
      return false;
    }

    const moves = getSimpleMoves(board, fromRow, fromCol);
    const valid = moves.some(([r, c]) => r === toRow && c === toCol);
    if (!valid) {
      socket.emit('invalid-move', { message: 'Invalid move.' });
      return false;
    }
  }

  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = EMPTY;

  if (isCapture) {
    const midR = fromRow + dr / 2;
    const midC = fromCol + dc / 2;
    board[midR][midC] = EMPTY;

    const newPiece = board[toRow][toCol];
    const promoteRow = newPiece === P1 || newPiece === K1 ? 0 : 7;
    if (!isKing(newPiece) && toRow === promoteRow) {
      board[toRow][toCol] = newPiece + 2;
    }

    const promoted = board[toRow][toCol] !== newPiece;
    if (!promoted) {
      const furtherCaptures = getCapturesForPiece(board, toRow, toCol);
      if (furtherCaptures.length > 0) {
        gameState.lastMoveFrom = `${fromRow},${fromCol}`;
        gameState.lastMoveTo = `${toRow},${toCol}`;
        gameState.mustCapturePos = `${toRow},${toCol}`;
        gameState.totalMoves++;
        gameState.players.forEach((p: any) => (p.ready = false));
        return true;
      }
    }
  } else {
    const newPiece = board[toRow][toCol];
    const promoteRow = newPiece === P1 || newPiece === K1 ? 0 : 7;
    if (!isKing(newPiece) && toRow === promoteRow) {
      board[toRow][toCol] = newPiece + 2;
    }
  }

  gameState.lastMoveFrom = `${fromRow},${fromCol}`;
  gameState.lastMoveTo = `${toRow},${toCol}`;
  gameState.mustCapturePos = null;
  gameState.currentPlayer = opponent(gameState.currentPlayer);
  gameState.totalMoves++;
  gameState.players.forEach((p: any) => (p.ready = false));

  const oppPieces = countPieces(board, gameState.currentPlayer);
  if (oppPieces === 0) {
    gameState.winner = `Player ${opponent(gameState.currentPlayer)} wins!`;
  } else if (!hasLegalMoves(board, gameState.currentPlayer)) {
    gameState.winner = `Player ${opponent(gameState.currentPlayer)} wins!`;
  } else {
    // Check if all remaining pieces on the board are kings
    let regularCount = 0;
    let p1Kings = 0;
    let p2Kings = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = board[r][c];
        if (val === P1 || val === P2) {
          regularCount++;
        } else if (val === K1) {
          p1Kings++;
        } else if (val === K2) {
          p2Kings++;
        }
      }
    }
    if (regularCount === 0 && (p1Kings > 0 || p2Kings > 0)) {
      if (p1Kings > p2Kings) {
        gameState.winner = 'Player 1 wins!';
      } else if (p2Kings > p1Kings) {
        gameState.winner = 'Player 2 wins!';
      } else {
        gameState.winner = 'Draw!';
      }
    }
  }

  return true;
};

const evaluateBoard = (board: number[][]): number => {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const val = board[r][c];
      if (val === EMPTY) continue;

      let pieceValue = 0;
      let positionalBonus = 0;

      // Center control (rows 3, 4, columns 2-5)
      const isCenter = r >= 3 && r <= 4 && c >= 2 && c <= 5;
      // Edge safety (columns 0 or 7)
      const isEdge = c === 0 || c === 7;

      if (val === P1) {
        pieceValue = 100;
        // Advancement bonus (closer to row 0)
        positionalBonus += (7 - r) * 5;
        // Back rank protection
        if (r === 7) positionalBonus += 20;
        if (isCenter) positionalBonus += 15;
        if (isEdge) positionalBonus += 10;
        score += pieceValue + positionalBonus;
      } else if (val === K1) {
        pieceValue = 175;
        if (isCenter) positionalBonus += 15;
        if (isEdge) positionalBonus += 10;
        score += pieceValue + positionalBonus;
      } else if (val === P2) {
        pieceValue = 100;
        // Advancement bonus (closer to row 7)
        positionalBonus += r * 5;
        // Back rank protection
        if (r === 0) positionalBonus += 20;
        if (isCenter) positionalBonus += 15;
        if (isEdge) positionalBonus += 10;
        score -= (pieceValue + positionalBonus);
      } else if (val === K2) {
        pieceValue = 175;
        if (isCenter) positionalBonus += 15;
        if (isEdge) positionalBonus += 10;
        score -= (pieceValue + positionalBonus);
      }
    }
  }
  return score;
};

const getAllLegalMoves = (
  board: number[][],
  currentPlayer: number,
  mustCapturePos: string | null
): { fromRow: number; fromCol: number; toRow: number; toCol: number }[] => {
  const moves: { fromRow: number; fromCol: number; toRow: number; toCol: number }[] = [];

  if (mustCapturePos) {
    const [fromRow, fromCol] = mustCapturePos.split(',').map(Number);
    const captures = getCapturesForPiece(board, fromRow, fromCol);
    for (const [toRow, toCol] of captures) {
      moves.push({ fromRow, fromCol, toRow, toCol });
    }
    return moves;
  }

  const capturesExist = hasAnyCapture(board, currentPlayer);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isOwn(board[r][c], currentPlayer)) {
        if (capturesExist) {
          const captures = getCapturesForPiece(board, r, c);
          for (const [toRow, toCol] of captures) {
            moves.push({ fromRow: r, fromCol: c, toRow, toCol });
          }
        } else {
          const simples = getSimpleMoves(board, r, c);
          for (const [toRow, toCol] of simples) {
            moves.push({ fromRow: r, fromCol: c, toRow, toCol });
          }
        }
      }
    }
  }
  return moves;
};

const simulateMove = (
  board: number[][],
  currentPlayer: number,
  move: { fromRow: number; fromCol: number; toRow: number; toCol: number }
): { nextBoard: number[][]; nextPlayer: number; nextMustCapturePos: string | null } => {
  const nextBoard = board.map((row) => [...row]);
  const { fromRow, fromCol, toRow, toCol } = move;
  const piece = nextBoard[fromRow][fromCol];

  nextBoard[toRow][toCol] = piece;
  nextBoard[fromRow][fromCol] = EMPTY;

  const dr = toRow - fromRow;
  const dc = toCol - fromCol;
  const isCapture = Math.abs(dr) === 2;

  if (isCapture) {
    const midR = fromRow + dr / 2;
    const midC = fromCol + dc / 2;
    nextBoard[midR][midC] = EMPTY;

    const promoteRow = piece === P1 || piece === K1 ? 0 : 7;
    let promoted = false;
    if (!isKing(piece) && toRow === promoteRow) {
      nextBoard[toRow][toCol] = piece + 2;
      promoted = true;
    }

    if (!promoted) {
      const furtherCaptures = getCapturesForPiece(nextBoard, toRow, toCol);
      if (furtherCaptures.length > 0) {
        return {
          nextBoard,
          nextPlayer: currentPlayer,
          nextMustCapturePos: `${toRow},${toCol}`,
        };
      }
    }
  } else {
    const promoteRow = piece === P1 || piece === K1 ? 0 : 7;
    if (!isKing(piece) && toRow === promoteRow) {
      nextBoard[toRow][toCol] = piece + 2;
    }
  }

  return {
    nextBoard,
    nextPlayer: opponent(currentPlayer),
    nextMustCapturePos: null,
  };
};

const minimax = (
  board: number[][],
  player: number,
  mustCapturePos: string | null,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number => {
  const hasMoves = hasLegalMoves(board, player);
  if (!hasMoves) {
    return isMaximizing ? -10000 - depth : 10000 + depth;
  }

  let regularCount = 0;
  let p1Kings = 0;
  let p2Kings = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = board[r][c];
      if (val === P1 || val === P2) regularCount++;
      else if (val === K1) p1Kings++;
      else if (val === K2) p2Kings++;
    }
  }
  if (regularCount === 0 && (p1Kings > 0 || p2Kings > 0)) {
    if (p1Kings > p2Kings) return 9000;
    if (p2Kings > p1Kings) return -9000;
    return 0;
  }

  if (depth === 0) {
    return evaluateBoard(board);
  }

  const moves = getAllLegalMoves(board, player, mustCapturePos);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const { nextBoard, nextPlayer, nextMustCapturePos } = simulateMove(board, player, move);
      const nextIsMaximizing = nextPlayer === 1;
      const evaluation = minimax(
        nextBoard,
        nextPlayer,
        nextMustCapturePos,
        depth - 1,
        alpha,
        beta,
        nextIsMaximizing
      );
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const { nextBoard, nextPlayer, nextMustCapturePos } = simulateMove(board, player, move);
      const nextIsMaximizing = nextPlayer === 1;
      const evaluation = minimax(
        nextBoard,
        nextPlayer,
        nextMustCapturePos,
        depth - 1,
        alpha,
        beta,
        nextIsMaximizing
      );
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

/**
 * CheckersComputer - AI Move Generator for Checkers.
 * Supports three difficulty levels:
 * - Easy: 70% mistake rate. Uses a basic 1-ply minimax look-ahead.
 * - Medium: 40% mistake rate. Uses a 3-ply alpha-beta minimax search.
 * - Hard: 0% mistake rate. Uses a 5-ply alpha-beta minimax search with dynamic depth
 *         scaling up to 7-ply in the late-game/endgame to optimize calculation speed.
 *
 * Board Evaluation logic:
 * - Piece values are scored based on standard checkers rules: normal piece is 100, king is 175.
 * - Positional factors are applied dynamically:
 *   - Center control: bonus for occupying center board (rows 3-4, columns 2-5) for higher mobility.
 *   - Edge safety: bonus for occupying safe edge squares (columns 0 or 7).
 *   - Back rank protection: bonus for keeping pieces on back rows to block promotions.
 *   - Promotion proximity: small advancement bonus for regular pieces based on distance from home row.
 */
export class CheckersComputer {
  static async getAIMove(gameState: CheckersGameState): Promise<{ fromRow: number; fromCol: number; toRow: number; toCol: number }> {
    const aiPlayer = gameState.players.find((p) => p.isAI);
    const difficulty = aiPlayer?.difficulty || 'hard';
    const aiPlayerNumber = aiPlayer?.player || 2;

    const moves = getAllLegalMoves(gameState.board, aiPlayerNumber, gameState.mustCapturePos);
    if (moves.length === 0) {
      return { fromRow: 0, fromCol: 0, toRow: 0, toCol: 0 };
    }

    let mistakeRate = 0;
    if (difficulty === 'easy') mistakeRate = 0.7;
    else if (difficulty === 'medium') mistakeRate = 0.4;

    if (Math.random() < mistakeRate) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    let depth = 5;
    if (difficulty === 'easy') {
      depth = 1;
    } else if (difficulty === 'medium') {
      depth = 3;
    } else {
      let totalPieces = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (gameState.board[r][c] !== EMPTY) totalPieces++;
        }
      }
      if (totalPieces <= 6) {
        depth = 7;
      } else if (totalPieces <= 12) {
        depth = 6;
      } else {
        depth = 5;
      }
    }

    let bestMove = moves[0];
    const isMaximizing = aiPlayerNumber === 1;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const { nextBoard, nextPlayer, nextMustCapturePos } = simulateMove(gameState.board, aiPlayerNumber, move);
        const nextIsMaximizing = nextPlayer === 1;
        const evaluation = minimax(
          nextBoard,
          nextPlayer,
          nextMustCapturePos,
          depth - 1,
          -Infinity,
          Infinity,
          nextIsMaximizing
        );
        if (evaluation > maxEval) {
          maxEval = evaluation;
          bestMove = move;
        }
      }
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const { nextBoard, nextPlayer, nextMustCapturePos } = simulateMove(gameState.board, aiPlayerNumber, move);
        const nextIsMaximizing = nextPlayer === 1;
        const evaluation = minimax(
          nextBoard,
          nextPlayer,
          nextMustCapturePos,
          depth - 1,
          -Infinity,
          Infinity,
          nextIsMaximizing
        );
        if (evaluation < minEval) {
          minEval = evaluation;
          bestMove = move;
        }
      }
    }

    return bestMove;
  }
}

export const getAIMove = (gameState: CheckersGameState) => CheckersComputer.getAIMove(gameState);
