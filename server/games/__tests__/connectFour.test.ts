import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  checkConnectFourWinner,
  createInitialState,
  resetState,
  makeMove,
  ConnectFourComputer,
  getAIMove,
} from '../connectFour.js';
import type { ConnectFourGameState } from '../connectFour.js';
import { createRoom, createSocketMock } from './helpers.js';

const emptyBoard = (): (number | null)[][] =>
  Array.from({ length: 6 }, () => Array(7).fill(null));

const stateWithPlayers = (overrides: Partial<ConnectFourGameState> = {}): ConnectFourGameState => ({
  board: emptyBoard(),
  currentPlayer: 1,
  totalMoves: 0,
  winner: '',
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob', isAI: true, difficulty: 'hard' },
  ],
  ...overrides,
});

describe('checkConnectFourWinner', () => {
  it('detects a horizontal win for player 2', () => {
    const board = emptyBoard();
    for (let c = 0; c < 4; c++) board[5][c] = 2;
    expect(checkConnectFourWinner(board)).toBe(2);
  });

  it('detects a vertical win for player 1', () => {
    const board = emptyBoard();
    for (let r = 2; r < 6; r++) board[r][0] = 1;
    expect(checkConnectFourWinner(board)).toBe(1);
  });

  it('detects a diagonal (up-right) win', () => {
    const board = emptyBoard();
    board[5][0] = 1;
    board[4][1] = 1;
    board[3][2] = 1;
    board[2][3] = 1;
    expect(checkConnectFourWinner(board)).toBe(1);
  });

  it('detects a diagonal (down-right) win', () => {
    const board = emptyBoard();
    board[0][0] = 2;
    board[1][1] = 2;
    board[2][2] = 2;
    board[3][3] = 2;
    expect(checkConnectFourWinner(board)).toBe(2);
  });

  it('returns 0 for a board with no winner', () => {
    const board = emptyBoard();
    board[0][0] = 1;
    board[1][1] = 2;
    expect(checkConnectFourWinner(board)).toBe(0);
  });

  it('does not falsely report a win when interrupted by an empty cell', () => {
    const board = emptyBoard();
    board[5][0] = 1;
    board[5][1] = 1;
    board[5][2] = 1;
    board[5][4] = 1;
    expect(checkConnectFourWinner(board)).toBe(0);
  });
});

describe('createInitialState / resetState', () => {
  it('creates an empty 6x7 board with player 1 to move', () => {
    const state = createInitialState('p1');
    expect(state.board).toHaveLength(6);
    expect(state.board[0]).toHaveLength(7);
    expect(state.currentPlayer).toBe(1);
    expect(state.winner).toBe('');
  });

  it('resets the board but keeps the players', () => {
    const state = resetState([
      { id: 'p1', player: 1, ready: false },
      { id: 'p2', player: 2, ready: true },
    ]);
    expect(state.players).toHaveLength(2);
    expect(state.players.every((p) => !p.ready)).toBe(true);
    expect(state.totalMoves).toBe(0);
  });
});

describe('makeMove', () => {
  it('places a disc and flips the current player', () => {
    const state = stateWithPlayers();
    const room = createRoom('connect-four', state);
    const socket = createSocketMock('p1');
    const ok = makeMove(room, socket, { col: 3 });
    expect(ok).toBe(true);
    expect(state.board[5][3]).toBe(1);
    expect(state.currentPlayer).toBe(2);
    expect(state.totalMoves).toBe(1);
    expect(state.lastMove).toEqual({ row: 5, col: 3 });
  });

  it('rejects an out-of-range column', () => {
    const state = stateWithPlayers();
    const room = createRoom('connect-four', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { col: 7 })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects a move into a full column', () => {
    const board = emptyBoard();
    for (let r = 0; r < 6; r++) board[r][0] = 1;
    const state = stateWithPlayers({ board });
    const room = createRoom('connect-four', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { col: 0 })).toBe(false);
  });

  it('rejects moves after the game is over', () => {
    const state = stateWithPlayers({ winner: 'Alice wins!' });
    const room = createRoom('connect-four', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { col: 3 })).toBe(false);
  });

  it('declares a winner when a player connects four', () => {
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) board[5][c] = 1;
    const state = stateWithPlayers({ board, currentPlayer: 1 });
    const room = createRoom('connect-four', state);
    makeMove(room, createSocketMock('p1'), { col: 3 });
    expect(state.winner).toBe('Alice wins!');
  });

  it('declares a tie when the board fills up', () => {
    // 41 discs with no 4-in-a-row; only row 0 of column 1 is empty.
    const board = [
      [2, null, 1, 2, 2, 1, 2],
      [1, 1, 2, 1, 1, 2, 1],
      [2, 2, 1, 2, 2, 1, 2],
      [1, 1, 2, 1, 1, 2, 1],
      [2, 2, 1, 2, 2, 1, 2],
      [1, 1, 2, 1, 1, 2, 1],
    ];
    expect(checkConnectFourWinner(board)).toBe(0);
    const state = stateWithPlayers({ board, currentPlayer: 1, totalMoves: 41 });
    const room = createRoom('connect-four', state);
    expect(makeMove(room, createSocketMock('p1'), { col: 1 })).toBe(true);
    expect(state.winner).toBe('Tie game!');
  });
});

describe('ConnectFourComputer.getAIMove', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
  });

  it('returns a valid column from an empty board (hard)', async () => {
    const state = stateWithPlayers();
    const move = await ConnectFourComputer.getAIMove(state);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThanOrEqual(6);
  });

  it('takes a winning move when available (hard)', async () => {
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) board[5][c] = 2;
    // AI is player 2; dropping in col 3 completes a horizontal four.
    const state = stateWithPlayers({ board, currentPlayer: 2 });
    const move = await ConnectFourComputer.getAIMove(state);
    expect(move.col).toBe(3);
  });

  it('blocks the opponent from winning (hard)', async () => {
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) board[5][c] = 1;
    // Human (player 1) can win on col 3; the AI must block it.
    const state = stateWithPlayers({ board, currentPlayer: 2 });
    const move = await ConnectFourComputer.getAIMove(state);
    expect(move.col).toBe(3);
  });

  it('prefers the center column from an empty board (hard)', async () => {
    const state = stateWithPlayers();
    const move = await ConnectFourComputer.getAIMove(state);
    expect(move.col).toBe(3);
  });

  it('medium difficulty uses minimax and returns a legal column', async () => {
    const state = stateWithPlayers();
    state.players[1].difficulty = 'medium';
    const move = await ConnectFourComputer.getAIMove(state);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThanOrEqual(6);
  });

  it('easy difficulty returns a legal column', async () => {
    const state = stateWithPlayers();
    state.players[1].difficulty = 'easy';
    const move = await ConnectFourComputer.getAIMove(state);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThanOrEqual(6);
  });

  it('easy difficulty blocks an immediate opponent win via the static heuristic', async () => {
    const board = emptyBoard();
    for (let c = 0; c < 3; c++) board[5][c] = 1;
    const state = stateWithPlayers({ board, currentPlayer: 2 });
    state.players[1].difficulty = 'easy';
    const move = await ConnectFourComputer.getAIMove(state);
    expect(move.col).toBe(3);
  });

  it('falls back to a random column when a mistake is triggered', async () => {
    vi.mocked(Math.random).mockReturnValue(0.1); // below the easy mistake rate (0.7)
    const state = stateWithPlayers();
    state.players[1].difficulty = 'easy';
    const move = await ConnectFourComputer.getAIMove(state);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThanOrEqual(6);
  });

  it('the exported getAIMove returns a valid move', async () => {
    const state = stateWithPlayers();
    const move = await getAIMove(state);
    expect(typeof move.col).toBe('number');
  });
});
