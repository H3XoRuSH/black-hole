import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createInitialState,
  resetState,
  makeMove,
  DotsAndBoxesComputer,
  getAIMove,
} from '../dotsAndBoxes.js';
import type { DotsAndBoxesGameState } from '../dotsAndBoxes.js';
import { createRoom, createSocketMock } from './helpers.js';

const stateWithPlayers = (overrides: Partial<DotsAndBoxesGameState> = {}): DotsAndBoxesGameState => ({
  lines: {},
  boxes: {},
  scores: { player1: 0, player2: 0 },
  currentPlayer: 1,
  totalMoves: 0,
  winner: '',
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob', isAI: true, difficulty: 'hard' },
  ],
  ...overrides,
});

const addBoxLines = (state: DotsAndBoxesGameState, br: number, bc: number, player: number) => {
  state.lines[`h-${br}-${bc}`] = player;
  state.lines[`h-${br + 1}-${bc}`] = player;
  state.lines[`v-${br}-${bc}`] = player;
  state.lines[`v-${br}-${bc + 1}`] = player;
  state.boxes[`${br}-${bc}`] = player;
};

describe('createInitialState / resetState', () => {
  it('creates an empty 4x4 box grid', () => {
    const state = createInitialState('p1');
    expect(Object.keys(state.lines)).toHaveLength(0);
    expect(Object.keys(state.boxes)).toHaveLength(0);
    expect(state.currentPlayer).toBe(1);
  });

  it('resetState keeps players', () => {
    const state = resetState([
      { id: 'p1', player: 1, ready: true },
      { id: 'p2', player: 2, ready: true },
    ]);
    expect(state.players).toHaveLength(2);
    expect(state.scores).toEqual({ player1: 0, player2: 0 });
  });
});

describe('makeMove', () => {
  it('draws a line and flips the player when no box is completed', () => {
    const state = stateWithPlayers();
    const room = createRoom('dots-and-boxes', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { lineKey: 'h-0-0' })).toBe(true);
    expect(state.lines['h-0-0']).toBe(1);
    expect(state.currentPlayer).toBe(2);
    expect(state.totalMoves).toBe(1);
  });

  it('rejects a line that is already drawn', () => {
    const state = stateWithPlayers({ lines: { 'h-0-0': 1 } });
    const room = createRoom('dots-and-boxes', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { lineKey: 'h-0-0' })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects malformed line keys', () => {
    const state = stateWithPlayers();
    const room = createRoom('dots-and-boxes', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { lineKey: 'garbage' })).toBe(false);
  });

  it('rejects out-of-range coordinates', () => {
    const state = stateWithPlayers();
    const room = createRoom('dots-and-boxes', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { lineKey: 'h-5-0' })).toBe(false);
    expect(makeMove(room, socket, { lineKey: 'x-0-0' })).toBe(false);
  });

  it('awards the box and lets the same player keep their turn', () => {
    const state = stateWithPlayers();
    const room = createRoom('dots-and-boxes', state);
    // Pre-fill three sides of box (0,0).
    state.lines['h-0-0'] = 1;
    state.lines['h-1-0'] = 1;
    state.lines['v-0-0'] = 1;
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { lineKey: 'v-0-1' })).toBe(true);
    expect(state.boxes['0-0']).toBe(1);
    expect(state.scores.player1).toBe(1);
    expect(state.currentPlayer).toBe(1);
  });

  it('declares a winner when all 16 boxes are completed', () => {
    const state = stateWithPlayers();
    const room = createRoom('dots-and-boxes', state);
    for (let br = 0; br < 4; br++) {
      for (let bc = 0; bc < 4; bc++) {
        addBoxLines(state, br, bc, (br + bc) % 2 === 0 ? 1 : 2);
      }
    }
    state.scores.player1 = 9;
    state.scores.player2 = 7;
    expect(Object.keys(state.boxes)).toHaveLength(16);
    const socket = createSocketMock('p1');
    // A redundant move still runs the end-of-game check.
    state.lines = {};
    expect(makeMove(room, socket, { lineKey: 'h-0-0' })).toBe(true);
    expect(state.winner).toContain('Alice');
  });

  it('rejects moves after the game is over', () => {
    const state = stateWithPlayers({ winner: 'Alice wins!' });
    const room = createRoom('dots-and-boxes', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { lineKey: 'h-0-0' })).toBe(false);
  });
});

describe('DotsAndBoxesComputer.getAIMove', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
  });

  it('returns an unoccupied line (hard)', async () => {
    const state = stateWithPlayers();
    const move = await DotsAndBoxesComputer.getAIMove(state);
    expect(state.lines[move.lineKey]).toBeUndefined();
  });

  it('completes a box when only one side is missing (hard)', async () => {
    const state = stateWithPlayers();
    state.lines['h-0-0'] = 1;
    state.lines['h-1-0'] = 1;
    state.lines['v-0-0'] = 1;
    const move = await DotsAndBoxesComputer.getAIMove(state);
    expect(move.lineKey).toBe('v-0-1');
  });

  it('medium difficulty returns a legal line', async () => {
    const state = stateWithPlayers();
    state.players[1].difficulty = 'medium';
    const move = await DotsAndBoxesComputer.getAIMove(state);
    expect(state.lines[move.lineKey]).toBeUndefined();
  });

  it('easy difficulty returns a legal line', async () => {
    const state = stateWithPlayers();
    state.players[1].difficulty = 'easy';
    const move = await DotsAndBoxesComputer.getAIMove(state);
    expect(state.lines[move.lineKey]).toBeUndefined();
  });

  it('easy difficulty completes a box if possible', async () => {
    const state = stateWithPlayers();
    state.players[1].difficulty = 'easy';
    state.lines['h-0-0'] = 1;
    state.lines['h-1-0'] = 1;
    state.lines['v-0-0'] = 1;
    const move = await DotsAndBoxesComputer.getAIMove(state);
    expect(move.lineKey).toBe('v-0-1');
  });

  it('hard difficulty searches to the endgame when few lines remain', async () => {
    // Draw 32 of 40 lines so only 8 remain; the AI then runs a full search.
    const allLines: string[] = [];
    for (let r = 0; r <= 4; r++) {
      for (let c = 0; c <= 3; c++) allLines.push(`h-${r}-${c}`);
    }
    for (let r = 0; r <= 3; r++) {
      for (let c = 0; c <= 4; c++) allLines.push(`v-${r}-${c}`);
    }
    const leftOut = allLines.slice(0, 8);
    const state = stateWithPlayers();
    for (const line of allLines.slice(8)) {
      state.lines[line] = (state.lines[line] ? 2 : 1);
    }
    const move = await DotsAndBoxesComputer.getAIMove(state);
    expect(leftOut).toContain(move.lineKey);
  });

  it('the exported getAIMove returns a valid move', async () => {
    const state = stateWithPlayers();
    const move = await getAIMove(state);
    expect(typeof move.lineKey).toBe('string');
  });
});
