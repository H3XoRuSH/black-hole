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
  }

  return true;
};
