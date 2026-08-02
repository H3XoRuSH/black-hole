import { describe, expect, it, vi } from 'vitest';
import {
  createInitialState,
  resetState,
  onGameStart,
  makeMove,
} from '../bingo.js';
import type { BingoGameState } from '../bingo.js';
import { createRoom, createSocketMock } from './helpers.js';

const stateWithPlayers = (overrides: Partial<BingoGameState> = {}): BingoGameState => ({
  cards: {},
  daubed: {},
  drawnNumbers: [],
  phase: 'playing',
  winner: '',
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob' },
  ],
  currentPlayer: 1,
  totalMoves: 0,
  ...overrides,
});

describe('createInitialState / resetState / onGameStart', () => {
  it('creates an initial state without cards', () => {
    const state = createInitialState('p1');
    expect(Object.keys(state.cards)).toHaveLength(0);
    expect(state.drawnNumbers).toEqual([]);
  });

  it('resetState generates a valid bingo card for each player', () => {
    vi.spyOn(Math, 'random').mockRestore();
    const state = resetState([
      { id: 'p1', player: 1, ready: false },
      { id: 'p2', player: 2, ready: false },
    ]);
    for (const p of state.players) {
      const card = state.cards[p.player];
      expect(card).toHaveLength(5);
      for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 5; row++) {
          if (col === 2 && row === 2) {
            expect(card[row][col]).toBe(0);
          } else {
            const num = card[row][col];
            expect(num).toBeGreaterThanOrEqual(col * 15 + 1);
            expect(num).toBeLessThanOrEqual(col * 15 + 15);
          }
        }
      }
      expect(state.daubed[p.player]).toEqual(['2,2']);
    }
  });

  it('onGameStart only generates missing cards', () => {
    const state = stateWithPlayers({ cards: { 1: [[1]] } });
    const room = createRoom('bingo', state);
    onGameStart(room);
    expect(state.cards[1]).toEqual([[1]]);
    expect(state.cards[2]).toHaveLength(5);
  });
});

describe('makeMove - daub', () => {
  const card = [
    [1, 16, 31, 46, 61],
    [2, 17, 32, 47, 62],
    [3, 18, 0, 48, 63],
    [4, 19, 34, 49, 64],
    [5, 20, 35, 50, 65],
  ];

  it('daubs a drawn number', () => {
    const state = stateWithPlayers({
      cards: { 1: card },
      daubed: { 1: ['2,2'], 2: ['2,2'] },
      drawnNumbers: [17],
    });
    const room = createRoom('bingo', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'daub', row: 1, col: 1 })).toBe(true);
    expect(state.daubed[1]).toContain('1,1');
  });

  it('rejects daubing a number that has not been drawn', () => {
    const state = stateWithPlayers({
      cards: { 1: card },
      daubed: { 1: ['2,2'], 2: ['2,2'] },
      drawnNumbers: [17],
    });
    const room = createRoom('bingo', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'daub', row: 0, col: 0 })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects daubing the FREE space', () => {
    const state = stateWithPlayers({
      cards: { 1: card },
      daubed: { 1: ['2,2'], 2: ['2,2'] },
      drawnNumbers: [17],
    });
    const room = createRoom('bingo', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'daub', row: 2, col: 2 })).toBe(false);
  });

  it('rejects daubing an already daubed cell', () => {
    const state = stateWithPlayers({
      cards: { 1: card },
      daubed: { 1: ['2,2', '1,1'], 2: ['2,2'] },
      drawnNumbers: [17],
    });
    const room = createRoom('bingo', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'daub', row: 1, col: 1 })).toBe(false);
  });

  it('rejects daubing out of range', () => {
    const state = stateWithPlayers({
      cards: { 1: card },
      daubed: { 1: ['2,2'], 2: ['2,2'] },
      drawnNumbers: [17],
    });
    const room = createRoom('bingo', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'daub', row: 5, col: 0 })).toBe(false);
  });
});

describe('makeMove - call-bingo', () => {
  const completeCard = [
    [1, 16, 31, 46, 61],
    [2, 17, 32, 47, 62],
    [3, 18, 0, 48, 63],
    [4, 19, 34, 49, 64],
    [5, 20, 35, 50, 65],
  ];

  it('declares a winner when the player has a complete row', () => {
    const state = stateWithPlayers({
      cards: { 1: completeCard },
      daubed: { 1: ['2,2', '0,0', '0,1', '0,2', '0,3', '0,4'], 2: ['2,2'] },
    });
    const room = createRoom('bingo', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'call-bingo' })).toBe(true);
    expect(state.winner).toContain('Alice');
    expect(state.phase).toBe('game-over');
  });

  it('rejects a false bingo claim', () => {
    const state = stateWithPlayers({
      cards: { 1: completeCard },
      daubed: { 1: ['2,2', '0,0', '0,1', '0,2', '0,3'], 2: ['2,2'] },
    });
    const room = createRoom('bingo', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'call-bingo' })).toBe(false);
    expect(state.winner).toBe('');
  });

  it('rejects a call after the game is already over', () => {
    const state = stateWithPlayers({
      winner: 'Alice wins!',
      cards: { 1: completeCard },
      daubed: { 1: ['2,2', '0,0', '0,1', '0,2', '0,3', '0,4'], 2: ['2,2'] },
    });
    const room = createRoom('bingo', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'call-bingo' })).toBe(false);
  });
});
