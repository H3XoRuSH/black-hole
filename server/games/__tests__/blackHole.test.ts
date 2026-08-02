import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createInitialState,
  resetState,
  makeMove,
  calculateScores,
  getWinner,
  BlackHoleComputer,
  getAIMove,
} from '../blackHole.js';
import type { BlackHoleGameState } from '../../../src/types/shared.js';
import { createRoom, createSocketMock } from './helpers.js';

const stateWithPlayers = (overrides: Partial<BlackHoleGameState> = {}): BlackHoleGameState => ({
  circles: {},
  currentPlayer: 1,
  totalMoves: 0,
  maxTurnsPerPlayer: 10,
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob', isAI: true, difficulty: 'hard' },
  ],
  scores: { player1: 0, player2: 0 },
  winner: '',
  ...overrides,
});

describe('createInitialState / resetState', () => {
  it('creates an empty board with player 1 to move', () => {
    const state = createInitialState('p1');
    expect(Object.keys(state.circles)).toHaveLength(0);
    expect(state.currentPlayer).toBe(1);
    expect(state.maxTurnsPerPlayer).toBe(10);
  });

  it('resetState keeps players and clears circles', () => {
    const state = resetState([
      { id: 'p1', player: 1, ready: true },
      { id: 'p2', player: 2, ready: true },
    ]);
    expect(state.players).toHaveLength(2);
    expect(state.players.every((p) => !p.ready)).toBe(true);
    expect(Object.keys(state.circles)).toHaveLength(0);
  });
});

describe('makeMove', () => {
  it('places a circle and flips the player', () => {
    const state = stateWithPlayers();
    const room = createRoom('black-hole', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { row: 1, col: 1 })).toBe(true);
    expect(state.circles['1-1']).toEqual({ player: 1, turn: 1 });
    expect(state.currentPlayer).toBe(2);
    expect(state.totalMoves).toBe(1);
  });

  it('assigns the turn number based on the number of moves', () => {
    // After 4 moves it is player 1's turn again; turn number = floor(4/2)+1 = 3.
    const state = stateWithPlayers({ totalMoves: 4, currentPlayer: 1 });
    const room = createRoom('black-hole', state);
    expect(makeMove(room, createSocketMock('p1'), { row: 1, col: 1 })).toBe(true);
    expect(state.circles['1-1']).toEqual({ player: 1, turn: 3 });
  });

  it('rejects a circle that is already taken', () => {
    const state = stateWithPlayers({ circles: { '1-1': { player: 1, turn: 1 } } });
    const room = createRoom('black-hole', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { row: 1, col: 1 })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects moves after the game is over', () => {
    const state = stateWithPlayers({ totalMoves: 20 });
    const room = createRoom('black-hole', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { row: 1, col: 1 })).toBe(false);
  });
});

describe('calculateScores & getWinner', () => {
  it('returns zero scores when more than one circle is empty', () => {
    const state = stateWithPlayers();
    expect(calculateScores(state)).toEqual({ player1: 0, player2: 0 });
  });

  it('sums the neighbor turn values around the black hole', () => {
    // Fill every circle except 6-6 (the black hole). Its neighbors are 5-5 and 6-5.
    const circles: Record<string, { player: number; turn: number }> = {};
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= row; col++) {
        if (row === 6 && col === 6) continue;
        circles[`${row}-${col}`] = { player: (row + col) % 2 === 0 ? 1 : 2, turn: 1 };
      }
    }
    circles['5-5'] = { player: 1, turn: 5 };
    circles['6-5'] = { player: 2, turn: 8 };
    const state = stateWithPlayers({ circles, totalMoves: 20 });
    expect(calculateScores(state)).toEqual({ player1: 5, player2: 8 });
  });

  it('declares the player with the lower neighbor sum the winner', () => {
    // Only the neighbors of the black hole (6-6) matter: 6-5 and 5-5.
    const circles = {
      '5-5': { player: 1, turn: 1 },
      '6-5': { player: 2, turn: 5 },
    };
    const state = stateWithPlayers({ circles, totalMoves: 20 });
    const winner = getWinner(state);
    expect(winner).toContain('Alice');
  });

  it('returns an empty winner before the game completes', () => {
    const state = stateWithPlayers({ totalMoves: 10 });
    expect(getWinner(state)).toBe('');
  });
});

describe('BlackHoleComputer.getAIMove', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
  });

  it('returns an unoccupied position on an empty board (hard)', async () => {
    const state = stateWithPlayers();
    const move = await BlackHoleComputer.getAIMove(state);
    expect(state.circles[`${move.row}-${move.col}`]).toBeUndefined();
  });

  it('easy difficulty picks the highest-neighbor cell for a low tile value', async () => {
    const state = stateWithPlayers();
    state.players[1].difficulty = 'easy';
    const move = await BlackHoleComputer.getAIMove(state);
    // With tile value 1, the static heuristic sorts by descending neighbor count.
    expect(move).toEqual({ row: 3, col: 2 });
  });

  it('medium difficulty returns an unoccupied position', async () => {
    const state = stateWithPlayers();
    state.players[1].difficulty = 'medium';
    const move = await BlackHoleComputer.getAIMove(state);
    expect(state.circles[`${move.row}-${move.col}`]).toBeUndefined();
  });

  it('hard difficulty searches to the endgame when few cells remain', async () => {
    const circles: Record<string, { player: number; turn: number }> = {};
    // Fill 13 of the 21 cells so that 8 remain for a full search.
    const positions = [
      '1-1', '2-1', '2-2', '3-1', '3-2', '3-3', '4-1', '4-2', '4-3', '5-1', '5-2', '5-3', '5-4',
    ];
    positions.forEach((pos, i) => {
      circles[pos] = { player: i % 2 === 0 ? 1 : 2, turn: Math.floor(i / 2) + 1 };
    });
    const state = stateWithPlayers({ circles, currentPlayer: 2, totalMoves: 13 });
    const move = await BlackHoleComputer.getAIMove(state);
    expect(state.circles[`${move.row}-${move.col}`]).toBeUndefined();
  });

  it('returns a corner cell when the board is full (no legal move)', async () => {
    const circles: Record<string, { player: number; turn: number }> = {};
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= row; col++) {
        circles[`${row}-${col}`] = { player: 1, turn: 1 };
      }
    }
    const state = stateWithPlayers({ circles, totalMoves: 20 });
    const move = await BlackHoleComputer.getAIMove(state);
    expect(move).toEqual({ row: 1, col: 1 });
  });

  it('easy difficulty returns an unoccupied position', async () => {
    const state = stateWithPlayers();
    state.players[1].difficulty = 'easy';
    const move = await BlackHoleComputer.getAIMove(state);
    expect(state.circles[`${move.row}-${move.col}`]).toBeUndefined();
  });

  it('the exported getAIMove returns a valid move', async () => {
    const state = stateWithPlayers();
    const move = await getAIMove(state);
    expect(typeof move.row).toBe('number');
    expect(typeof move.col).toBe('number');
  });
});
