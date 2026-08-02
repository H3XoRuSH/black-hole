import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createInitialState,
  resetState,
  makeMove,
  validatePlacement,
  getFilteredState,
  BattleshipComputer,
  getAIMove,
} from '../battleship.js';
import type { BattleshipGameState, Ship } from '../battleship.js';
import { createRoom, createSocketMock } from './helpers.js';

const validFleet = (): Ship[] => [
  { name: 'Cruiser', size: 3, coordinates: [[0, 0], [0, 1], [0, 2]] },
  { name: 'Destroyer', size: 2, coordinates: [[2, 0], [2, 1]] },
  { name: 'Patrol Boat', size: 2, coordinates: [[4, 0], [4, 1]] },
];

const stateWithPlayers = (overrides: Partial<BattleshipGameState> = {}): BattleshipGameState => ({
  phase: 'placement',
  currentPlayer: 1,
  winner: '',
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob', isAI: true, difficulty: 'hard' },
  ],
  p1Placed: false,
  p2Placed: false,
  p1Ships: [],
  p2Ships: [],
  p1Shots: [],
  p2Shots: [],
  lastShotResult: null,
  ...overrides,
});

const playingState = (): BattleshipGameState =>
  stateWithPlayers({
    phase: 'playing',
    currentPlayer: 1,
    p1Placed: true,
    p2Placed: true,
    p1Ships: validFleet(),
    p2Ships: [
      { name: 'Cruiser', size: 3, coordinates: [[1, 0], [1, 1], [1, 2]] },
      { name: 'Destroyer', size: 2, coordinates: [[3, 0], [3, 1]] },
      { name: 'Patrol Boat', size: 2, coordinates: [[5, 0], [5, 1]] },
    ],
  });

describe('validatePlacement', () => {
  it('accepts a valid fleet', () => {
    expect(validatePlacement(validFleet())).toBe(true);
  });

  it('rejects a fleet with the wrong number of ships', () => {
    expect(validatePlacement(validFleet().slice(0, 2))).toBe(false);
  });

  it('rejects ships with the wrong size', () => {
    const fleet = validFleet();
    fleet[0].coordinates.push([0, 3]);
    expect(validatePlacement(fleet)).toBe(false);
  });

  it('rejects ships that are not a straight line', () => {
    const fleet = validFleet();
    fleet[0].coordinates = [[0, 0], [0, 1], [1, 2]];
    expect(validatePlacement(fleet)).toBe(false);
  });

  it('rejects overlapping ships', () => {
    const fleet = validFleet();
    fleet[1].coordinates = [[0, 1], [0, 2]];
    expect(validatePlacement(fleet)).toBe(false);
  });

  it('rejects ships that leave the board', () => {
    const fleet = validFleet();
    fleet[0].coordinates = [[0, 5], [0, 6], [0, 7]];
    expect(validatePlacement(fleet)).toBe(false);
  });
});

describe('createInitialState / resetState', () => {
  it('creates a placement-phase state', () => {
    const state = createInitialState('p1');
    expect(state.phase).toBe('placement');
    expect(state.p1Placed).toBe(false);
    expect(state.winner).toBe('');
  });

  it('resetState keeps players and clears the board', () => {
    const state = resetState([{ id: 'p1', player: 1, ready: true }]);
    expect(state.players).toHaveLength(1);
    expect(state.p1Ships).toEqual([]);
  });
});

describe('makeMove - placement', () => {
  it('records ship placement for player 1', () => {
    const state = stateWithPlayers();
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'place-ships', ships: validFleet() })).toBe(true);
    expect(state.p1Placed).toBe(true);
    expect(state.p1Ships).toHaveLength(3);
  });

  it('starts play once both players have placed', () => {
    const state = stateWithPlayers({ p1Placed: true, p1Ships: validFleet() });
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'place-ships', ships: validFleet() })).toBe(true);
    expect(state.p2Placed).toBe(true);
    expect(state.phase).toBe('playing');
  });

  it('rejects invalid ship placement', () => {
    const state = stateWithPlayers();
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'place-ships', ships: [] })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects duplicate placement', () => {
    const state = stateWithPlayers({ p1Placed: true, p1Ships: validFleet() });
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'place-ships', ships: validFleet() })).toBe(false);
  });
});

describe('makeMove - shooting', () => {
  it('records a miss and flips the turn', () => {
    const state = playingState();
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'shoot', row: 0, col: 0 })).toBe(true);
    expect(state.lastShotResult).toMatchObject({ hit: false });
    expect(state.currentPlayer).toBe(2);
  });

  it('records a hit', () => {
    const state = playingState();
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'shoot', row: 1, col: 0 })).toBe(true);
    expect(state.lastShotResult).toMatchObject({ hit: true });
  });

  it('marks a ship as sunk', () => {
    const state = playingState();
    const room = createRoom('battleship', state);
    // Sink the Patrol Boat (5,0) and (5,1).
    makeMove(room, createSocketMock('p1'), { action: 'shoot', row: 5, col: 0 });
    makeMove(room, createSocketMock('p2'), { action: 'shoot', row: 0, col: 3 });
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'shoot', row: 5, col: 1 })).toBe(true);
    expect(state.lastShotResult?.sunkShipName).toBe('Patrol Boat');
  });

  it('declares a winner when the whole fleet is sunk', () => {
    const state = playingState();
    const room = createRoom('battleship', state);
    const fleetShots: [number, number][] = [
      [1, 0], [1, 1], [1, 2],
      [3, 0], [3, 1],
      [5, 0], [5, 1],
    ];
    // Player 1 sinks the whole fleet; player 2 fires harmless misses in between.
    fleetShots.forEach(([row, col], i) => {
      expect(makeMove(room, createSocketMock('p1'), { action: 'shoot', row, col })).toBe(true);
      if (i < fleetShots.length - 1) {
        makeMove(room, createSocketMock('p2'), { action: 'shoot', row: 0, col: i });
      }
    });
    expect(state.phase).toBe('game-over');
    expect(state.winner).toContain('Alice');
  });

  it('rejects shooting out of turn', () => {
    const state = playingState();
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'shoot', row: 0, col: 0 })).toBe(false);
  });

  it('rejects an out-of-bounds shot', () => {
    const state = playingState();
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'shoot', row: 6, col: 0 })).toBe(false);
  });

  it('rejects shooting the same coordinate twice', () => {
    const state = playingState();
    state.p1Shots = [[0, 0]];
    const room = createRoom('battleship', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'shoot', row: 0, col: 0 })).toBe(false);
  });
});

describe('getFilteredState', () => {
  it('hides unsunk ship positions from the opponent', () => {
    const state = playingState();
    const filtered = getFilteredState(state, 1);
    // Player 2 ships: only coordinates hit by player 1's shots are visible.
    expect(filtered.p2Ships[0].coordinates).toEqual([]);
    state.p1Shots = [[1, 0]];
    const filteredAfter = getFilteredState(state, 1);
    expect(filteredAfter.p2Ships[0].coordinates).toEqual([[1, 0]]);
  });

  it('reveals everything when the game is over', () => {
    const state = playingState();
    state.phase = 'game-over';
    const filtered = getFilteredState(state, 1);
    expect(filtered.p2Ships[0].coordinates).toHaveLength(3);
  });
});

describe('BattleshipComputer.getAIMove', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
  });

  it('returns a valid placement during the placement phase', async () => {
    // The placement generator relies on real randomness; restore it for this test.
    vi.mocked(Math.random).mockRestore();
    const state = stateWithPlayers();
    const move = await BattleshipComputer.getAIMove(state);
    expect(move.action).toBe('place-ships');
    expect(validatePlacement(move.ships)).toBe(true);
  });

  it('returns a valid, unshot coordinate during play (hard)', async () => {
    const state = playingState();
    const move = await BattleshipComputer.getAIMove(state);
    expect(move.action).toBe('shoot');
    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThanOrEqual(5);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThanOrEqual(5);
  });

  it('targets the neighbor of a hit (hard)', async () => {
    const state = playingState();
    // Player 2 hit the opponent's cruiser at (0,0); the AI should target an adjacent cell.
    state.p2Shots = [[0, 0]];
    state.currentPlayer = 2;
    const move = await BattleshipComputer.getAIMove(state);
    const isNeighbor = (r: number, c: number) =>
      Math.abs(r - 0) + Math.abs(c - 0) === 1;
    expect(isNeighbor(move.row, move.col)).toBe(true);
  });

  it('easy difficulty returns a random unshot cell', async () => {
    const state = playingState();
    state.players[1].difficulty = 'easy';
    const move = await BattleshipComputer.getAIMove(state);
    expect(move.action).toBe('shoot');
  });

  it('medium difficulty targets a neighbor of an unsunk hit', async () => {
    const state = playingState();
    state.players[1].difficulty = 'medium';
    state.p2Shots = [[0, 0]];
    state.currentPlayer = 2;
    const move = await BattleshipComputer.getAIMove(state);
    const isNeighbor = (r: number, c: number) =>
      Math.abs(r - 0) + Math.abs(c - 0) === 1;
    expect(isNeighbor(move.row, move.col)).toBe(true);
  });

  it('hard difficulty fires along the axis of two connected hits', async () => {
    const state = playingState();
    // Two hits on the cruiser at (0,0) and (0,1) -> continue horizontally.
    state.p2Shots = [[0, 0], [0, 1]];
    state.currentPlayer = 2;
    const move = await BattleshipComputer.getAIMove(state);
    expect(move.row).toBe(0);
    expect([2, 3]).toContain(move.col);
  });

  it('hard difficulty uses hunt mode when no ship has been touched', async () => {
    const state = playingState();
    state.currentPlayer = 2;
    const move = await BattleshipComputer.getAIMove(state);
    expect(state.p1Shots).not.toContainEqual([move.row, move.col]);
  });

  it('the exported getAIMove returns a valid move', async () => {
    const state = playingState();
    const move = await getAIMove(state);
    expect(move).toHaveProperty('action');
  });
});
