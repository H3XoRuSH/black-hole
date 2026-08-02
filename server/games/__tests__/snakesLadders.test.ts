import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  createInitialState,
  resetState,
  recreateBoard,
  makeMove,
} from '../snakesLadders.js';
import type { SnakesLaddersGameState } from '../../../src/types/shared.js';
import { createRoom, createSocketMock } from './helpers.js';

const stateWithPlayers = (overrides: Partial<SnakesLaddersGameState> = {}): SnakesLaddersGameState => {
  const base = createInitialState('p1');
  base.players = [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob' },
  ];
  base.positions = { 1: 1, 2: 1 };
  return { ...base, ...overrides };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createInitialState / resetState / recreateBoard', () => {
  it('creates a classic 10x10 board', () => {
    const state = createInitialState('p1');
    expect(state.boardType).toBe('classic');
    expect(state.gridSize).toBe(10);
    expect(Object.keys(state.snakes)).toHaveLength(8);
    expect(Object.keys(state.ladders)).toHaveLength(9);
    expect(state.positions).toEqual({ 1: 1 });
  });

  it('includes the classic snakes and ladders', () => {
    const state = createInitialState('p1');
    expect(state.ladders[4]).toBe(14);
    expect(state.ladders[28]).toBe(84);
    expect(state.snakes[17]).toBe(7);
    expect(state.snakes[98]).toBe(79);
  });

  it('resetState initializes all players on cell 1', () => {
    const state = resetState([
      { id: 'p1', player: 1, ready: true },
      { id: 'p2', player: 2, ready: true },
    ]);
    expect(state.positions).toEqual({ 1: 1, 2: 1 });
  });

  it('recreateBoard generates a random board with disjoint cells', () => {
    vi.spyOn(Math, 'random').mockRestore();
    const state = stateWithPlayers({ boardType: 'random', gridSize: 8, snakesCount: 5, laddersCount: 5 });
    recreateBoard(state);
    const heads = Object.keys(state.snakes).map(Number);
    const bottoms = Object.keys(state.ladders).map(Number);
    // Every snake drops you down and every ladder brings you up.
    for (const [head, tail] of Object.entries(state.snakes)) {
      expect(tail).toBeLessThan(Number(head));
    }
    for (const [bottom, top] of Object.entries(state.ladders)) {
      expect(top).toBeGreaterThan(Number(bottom));
    }
    expect(heads.length + bottoms.length).toBeLessThanOrEqual(10);
  });
});

describe('makeMove', () => {
  it('moves the player forward by the roll', () => {
    const state = stateWithPlayers();
    state.positions[1] = 5;
    vi.spyOn(Math, 'random').mockReturnValue(0); // roll = 1
    const room = createRoom('snakes-ladders', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'roll' })).toBe(true);
    expect(state.positions[1]).toBe(6);
    expect(state.lastRoll).toBe(1);
  });

  it('moves up a ladder when landing on one', () => {
    const state = stateWithPlayers();
    state.positions[1] = 3;
    vi.spyOn(Math, 'random').mockReturnValue(0); // roll = 1 -> lands on 4 -> ladder to 14
    const room = createRoom('snakes-ladders', state);
    expect(makeMove(room, createSocketMock('p1'), { action: 'roll' })).toBe(true);
    expect(state.positions[1]).toBe(14);
    expect(state.lastMove?.snakeOrLadder).toBe('ladder');
  });

  it('slides down a snake when landing on one', () => {
    const state = stateWithPlayers();
    state.positions[1] = 16;
    vi.spyOn(Math, 'random').mockReturnValue(0); // roll = 1 -> lands on 17 -> snake to 7
    const room = createRoom('snakes-ladders', state);
    expect(makeMove(room, createSocketMock('p1'), { action: 'roll' })).toBe(true);
    expect(state.positions[1]).toBe(7);
    expect(state.lastMove?.snakeOrLadder).toBe('snake');
  });

  it('bounces back when the roll overshoots the final cell', () => {
    const state = stateWithPlayers();
    state.positions[1] = 99;
    vi.spyOn(Math, 'random').mockReturnValue(0.95); // roll = 6 -> overshoots 100 by 5 -> bounce to 95
    const room = createRoom('snakes-ladders', state);
    expect(makeMove(room, createSocketMock('p1'), { action: 'roll' })).toBe(true);
    // Bounces to 95, but 95 is a snake head that drops to 75.
    expect(state.lastMove?.to).toBe(95);
    expect(state.positions[1]).toBe(75);
    expect(state.lastMove?.snakeOrLadder).toBe('snake');
  });

  it('declares a winner on landing exactly on the final cell', () => {
    const state = stateWithPlayers();
    state.positions[1] = 96;
    vi.spyOn(Math, 'random').mockReturnValue(0.6); // roll = 4 -> 100
    const room = createRoom('snakes-ladders', state);
    expect(makeMove(room, createSocketMock('p1'), { action: 'roll' })).toBe(true);
    expect(state.winner).toContain('Alice');
  });

  it('gives the player another turn after rolling a six', () => {
    const state = stateWithPlayers();
    vi.spyOn(Math, 'random').mockReturnValue(0.95); // roll = 6
    const room = createRoom('snakes-ladders', state);
    expect(makeMove(room, createSocketMock('p1'), { action: 'roll' })).toBe(true);
    expect(state.currentPlayer).toBe(1);
    expect(state.lastRollWasSix).toBe(true);
  });

  it('passes the turn after a non-six roll', () => {
    const state = stateWithPlayers();
    vi.spyOn(Math, 'random').mockReturnValue(0.4); // roll = 4
    const room = createRoom('snakes-ladders', state);
    expect(makeMove(room, createSocketMock('p1'), { action: 'roll' })).toBe(true);
    expect(state.currentPlayer).toBe(2);
  });

  it('rejects a roll from the wrong player', () => {
    const state = stateWithPlayers();
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    const room = createRoom('snakes-ladders', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'roll' })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects moves after the game is over', () => {
    const state = stateWithPlayers({ winner: 'Alice' });
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    const room = createRoom('snakes-ladders', state);
    expect(makeMove(room, createSocketMock('p1'), { action: 'roll' })).toBe(false);
  });
});
