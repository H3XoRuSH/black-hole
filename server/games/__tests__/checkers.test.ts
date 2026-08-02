import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createInitialState,
  resetState,
  makeMove,
  CheckersComputer,
  getAIMove,
} from '../checkers.js';
import type { CheckersGameState } from '../checkers.js';
import { createRoom, createSocketMock } from './helpers.js';

const EMPTY = 0;
const P1 = 1;
const P2 = 2;
const K1 = 3;
const K2 = 4;

const emptyBoard = (): number[][] => Array.from({ length: 8 }, () => Array(8).fill(EMPTY));

const stateWithPlayers = (overrides: Partial<CheckersGameState> = {}): CheckersGameState => ({
  board: createInitialState('p1').board,
  currentPlayer: 1,
  winner: '',
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob', isAI: true, difficulty: 'hard' },
  ],
  totalMoves: 0,
  mustCapturePos: null,
  ...overrides,
});

describe('createInitialState / resetState', () => {
  it('lays out 12 pieces per side on the dark squares', () => {
    const state = createInitialState('p1');
    const count = (v: number) => state.board.flat().filter((x) => x === v).length;
    expect(count(P1)).toBe(12);
    expect(count(P2)).toBe(12);
    expect(state.currentPlayer).toBe(1);
    expect(state.winner).toBe('');
  });

  it('resetState keeps players and clears winner', () => {
    const state = resetState([
      { id: 'p1', player: 1, ready: false },
      { id: 'p2', player: 2, ready: true },
    ]);
    expect(state.players).toHaveLength(2);
    expect(state.board.flat().filter((x) => x !== EMPTY)).toHaveLength(24);
  });
});

describe('makeMove - simple moves', () => {
  it('moves a P1 piece diagonally forward', () => {
    const state = stateWithPlayers();
    const room = createRoom('checkers', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { fromRow: 5, fromCol: 0, toRow: 4, toCol: 1 })).toBe(true);
    expect(state.board[5][0]).toBe(EMPTY);
    expect(state.board[4][1]).toBe(P1);
    expect(state.currentPlayer).toBe(2);
  });

  it('rejects moving into an occupied square', () => {
    const state = stateWithPlayers();
    const room = createRoom('checkers', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { fromRow: 7, fromCol: 0, toRow: 6, toCol: 1 })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects moving a piece that is not yours', () => {
    const state = stateWithPlayers();
    const room = createRoom('checkers', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { fromRow: 0, fromCol: 1, toRow: 1, toCol: 0 })).toBe(false);
  });

  it('rejects an out-of-bounds destination', () => {
    const state = stateWithPlayers();
    const room = createRoom('checkers', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { fromRow: 5, fromCol: 0, toRow: 4, toCol: -1 })).toBe(false);
  });

  it('rejects a non-diagonal move', () => {
    const state = stateWithPlayers();
    const room = createRoom('checkers', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { fromRow: 5, fromCol: 0, toRow: 5, toCol: 2 })).toBe(false);
  });
});

describe('makeMove - captures', () => {
  it('captures an opponent piece', () => {
    const board = emptyBoard();
    board[5][0] = P1;
    board[4][1] = P2;
    const state = stateWithPlayers({ board });
    const room = createRoom('checkers', state);
    expect(makeMove(room, createSocketMock('p1'), { fromRow: 5, fromCol: 0, toRow: 3, toCol: 2 })).toBe(true);
    expect(state.board[4][1]).toBe(EMPTY);
    expect(state.board[3][2]).toBe(P1);
    expect(state.currentPlayer).toBe(2);
  });

  it('forces a capture when one is available', () => {
    const board = emptyBoard();
    board[5][0] = P1;
    board[4][1] = P2;
    const state = stateWithPlayers({ board });
    const room = createRoom('checkers', state);
    const socket = createSocketMock('p1');
    // Non-capture move is rejected because a capture exists.
    expect(makeMove(room, socket, { fromRow: 5, fromCol: 0, toRow: 4, toCol: 1 })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('keeps the same player when a multi-capture chain is possible', () => {
    const board = emptyBoard();
    board[5][0] = P1;
    board[4][1] = P2;
    board[2][1] = P2;
    const state = stateWithPlayers({ board });
    const room = createRoom('checkers', state);
    // P1 captures at 4,1 landing on 3,2, where another capture (2,1) is possible.
    expect(makeMove(room, createSocketMock('p1'), { fromRow: 5, fromCol: 0, toRow: 3, toCol: 2 })).toBe(true);
    expect(state.mustCapturePos).toBe('3,2');
    expect(state.currentPlayer).toBe(1);
  });

  it('requires the same piece to continue a forced capture chain', () => {
    const board = emptyBoard();
    board[5][0] = P1;
    board[4][1] = P2;
    board[2][1] = P2;
    const state = stateWithPlayers({ board });
    const room = createRoom('checkers', state);
    makeMove(room, createSocketMock('p1'), { fromRow: 5, fromCol: 0, toRow: 3, toCol: 2 });
    expect(state.mustCapturePos).toBe('3,2');
    const socket = createSocketMock('p1');
    // A different piece cannot be used to continue the chain.
    expect(makeMove(room, socket, { fromRow: 5, fromCol: 2, toRow: 4, toCol: 3 })).toBe(false);
  });
});

describe('makeMove - promotion & winning', () => {
  it('promotes a P1 piece to a king on reaching row 0', () => {
    const board = emptyBoard();
    board[1][0] = P1;
    const state = stateWithPlayers({ board });
    const room = createRoom('checkers', state);
    expect(makeMove(room, createSocketMock('p1'), { fromRow: 1, fromCol: 0, toRow: 0, toCol: 1 })).toBe(true);
    expect(state.board[0][1]).toBe(K1);
  });

  it('promotes a P2 piece to a king on reaching row 7', () => {
    const board = emptyBoard();
    board[6][1] = P2;
    const state = stateWithPlayers({ board, currentPlayer: 2 });
    const room = createRoom('checkers', state);
    expect(makeMove(room, createSocketMock('p2'), { fromRow: 6, fromCol: 1, toRow: 7, toCol: 0 })).toBe(true);
    expect(state.board[7][0]).toBe(K2);
  });

  it('declares a winner when the opponent has no pieces', () => {
    const board = emptyBoard();
    board[7][0] = P1;
    board[6][1] = P1;
    board[5][0] = P1;
    const state = stateWithPlayers({ board, currentPlayer: 1 });
    const room = createRoom('checkers', state);
    // P1 captures the last P2 piece.
    board[4][1] = P2;
    expect(makeMove(room, createSocketMock('p1'), { fromRow: 5, fromCol: 0, toRow: 3, toCol: 2 })).toBe(true);
    expect(state.winner).toContain('Alice');
  });

  it('declares a draw when only kings remain and the counts are equal', () => {
    const board = emptyBoard();
    board[2][1] = K1;
    board[5][2] = K2;
    const state = stateWithPlayers({ board, currentPlayer: 1 });
    const room = createRoom('checkers', state);
    expect(makeMove(room, createSocketMock('p1'), { fromRow: 2, fromCol: 1, toRow: 3, toCol: 2 })).toBe(true);
    expect(state.winner).toBe('Draw!');
  });

  it('rejects moves once the game is over', () => {
    const state = stateWithPlayers({ winner: 'Alice wins!' });
    const room = createRoom('checkers', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { fromRow: 5, fromCol: 0, toRow: 4, toCol: 1 })).toBe(false);
  });
});

describe('CheckersComputer.getAIMove', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
  });

  it('returns a legal simple move from the initial position', async () => {
    const state = stateWithPlayers({ currentPlayer: 2 });
    const move = await CheckersComputer.getAIMove(state);
    expect(state.board[move.fromRow][move.fromCol]).toBe(P2);
    expect(state.board[move.toRow][move.toCol]).toBe(EMPTY);
    expect(Math.abs(move.toRow - move.fromRow)).toBe(1);
    expect(Math.abs(move.toCol - move.fromCol)).toBe(1);
  });

  it('takes a capture when a capture is available', async () => {
    const board = emptyBoard();
    board[5][2] = P2;
    board[6][3] = P1;
    const state = stateWithPlayers({ board, currentPlayer: 2 });
    const move = await CheckersComputer.getAIMove(state);
    expect(Math.abs(move.toRow - move.fromRow)).toBe(2);
    expect(state.board[6][3]).toBe(P1);
  });

  it('easy difficulty returns a valid move', async () => {
    const state = stateWithPlayers({ currentPlayer: 2 });
    state.players[1].difficulty = 'easy';
    const move = await CheckersComputer.getAIMove(state);
    expect(move).toHaveProperty('fromRow');
    expect(move).toHaveProperty('toRow');
  });

  it('medium difficulty returns a valid move', async () => {
    const state = stateWithPlayers({ currentPlayer: 2 });
    state.players[1].difficulty = 'medium';
    const move = await CheckersComputer.getAIMove(state);
    expect(state.board[move.fromRow][move.fromCol]).toBe(P2);
  });

  it('the exported getAIMove returns a valid move', async () => {
    const state = stateWithPlayers({ currentPlayer: 2 });
    const move = await getAIMove(state);
    expect(typeof move.fromRow).toBe('number');
  });
});
