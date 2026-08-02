import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  createInitialState,
  resetState,
  onGameStart,
  setGridSize,
  makeMove,
} from '../jigsaw.js';
import type { JigsawGameState } from '../../../src/types/shared.js';
import { createRoom, createSocketMock } from './helpers.js';

const mkSocket = (id: string): any => createSocketMock(id);

const stateWithPlayers = (overrides: Partial<JigsawGameState> = {}): JigsawGameState => ({
  status: 'waiting',
  gridSize: 4,
  imageKey: 'space-galaxy',
  pieces: [],
  startTime: null,
  endTime: null,
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob' },
  ],
  winner: '',
  totalMoves: 0,
  ...overrides,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createInitialState / resetState / onGameStart / setGridSize', () => {
  it('generates gridSize x gridSize pieces', () => {
    const state = createInitialState('p1');
    expect(state.gridSize).toBe(4);
    expect(state.pieces).toHaveLength(16);
  });

  it('pieces have matching complementary edges', () => {
    const state = createInitialState('p1');
    const byId = new Map(state.pieces.map((p) => [p.id, p]));
    for (const piece of state.pieces) {
      const right = byId.get(piece.row * 4 + (piece.col + 1));
      const below = byId.get((piece.row + 1) * 4 + piece.col);
      if (right) {
        expect(right.edges.left).toBe(piece.edges.right === 'flat' ? 'flat' : piece.edges.right === 'tab' ? 'blank' : 'tab');
      }
      if (below) {
        expect(below.edges.top).toBe(piece.edges.bottom === 'flat' ? 'flat' : piece.edges.bottom === 'tab' ? 'blank' : 'tab');
      }
    }
  });

  it('resetState keeps players', () => {
    const state = resetState([
      { id: 'p1', player: 1, ready: true },
      { id: 'p2', player: 2, ready: true },
    ]);
    expect(state.players).toHaveLength(2);
  });

  it('onGameStart sets status to playing', () => {
    const state = stateWithPlayers();
    const room = createRoom('jigsaw', state);
    onGameStart(room);
    expect(state.status).toBe('playing');
  });

  it('setGridSize regenerates the pieces', () => {
    const state = stateWithPlayers();
    const room = createRoom('jigsaw', state);
    setGridSize(room, 6);
    expect(state.gridSize).toBe(6);
    expect(state.pieces).toHaveLength(36);
  });
});

describe('makeMove', () => {
  const withPieces = (): JigsawGameState => {
    const state = stateWithPlayers({ status: 'playing' });
    state.pieces = Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => ({
        id: r * 4 + c,
        row: r,
        col: c,
        edges: { top: 'flat', right: 'flat', bottom: 'flat', left: 'flat' } as const,
        placed: false,
        lockedBy: null,
        trayIndex: r * 4 + c,
        boardRow: null,
        boardCol: null,
      }))
    ).flat();
    return state;
  };

  it('locks a piece when picked up', () => {
    const state = withPieces();
    const room = createRoom('jigsaw', state);
    const socket = mkSocket('p1');
    expect(makeMove(room, socket, { action: 'pickup', pieceId: 0 })).toBe(true);
    expect(state.pieces[0].lockedBy).toBe('p1');
    expect(state.startTime).not.toBeNull();
  });

  it('rejects picking up a piece that is already placed', () => {
    const state = withPieces();
    state.pieces[0].placed = true;
    const room = createRoom('jigsaw', state);
    const socket = mkSocket('p1');
    expect(makeMove(room, socket, { action: 'pickup', pieceId: 0 })).toBe(false);
  });

  it('rejects dropping a piece the socket does not own', () => {
    const state = withPieces();
    state.pieces[0].lockedBy = 'p1';
    const room = createRoom('jigsaw', state);
    const socket = mkSocket('p2');
    expect(makeMove(room, socket, { action: 'drop', pieceId: 0, row: 0, col: 0 })).toBe(false);
  });

  it('snaps a piece when dropped on its correct cell', () => {
    const state = withPieces();
    const room = createRoom('jigsaw', state);
    const socket = mkSocket('p1');
    makeMove(room, socket, { action: 'pickup', pieceId: 0 });
    expect(makeMove(room, socket, { action: 'drop', pieceId: 0, row: 0, col: 0 })).toBe(true);
    expect(state.pieces[0].placed).toBe(true);
    expect(state.pieces[0].boardRow).toBe(0);
    expect(state.pieces[0].boardCol).toBe(0);
  });

  it('keeps a wrongly-placed piece on the grid without snapping it', () => {
    const state = withPieces();
    const room = createRoom('jigsaw', state);
    const socket = mkSocket('p1');
    makeMove(room, socket, { action: 'pickup', pieceId: 0 });
    expect(makeMove(room, socket, { action: 'drop', pieceId: 0, row: 2, col: 2 })).toBe(true);
    expect(state.pieces[0].placed).toBe(false);
    expect(state.pieces[0].boardRow).toBe(2);
    expect(state.pieces[0].boardCol).toBe(2);
  });

  it('returns a piece to the tray when dropping out of bounds', () => {
    const state = withPieces();
    const room = createRoom('jigsaw', state);
    const socket = mkSocket('p1');
    makeMove(room, socket, { action: 'pickup', pieceId: 0 });
    expect(makeMove(room, socket, { action: 'drop', pieceId: 0, row: 9, col: 9 })).toBe(true);
    expect(state.pieces[0].boardRow).toBeNull();
    expect(state.pieces[0].boardCol).toBeNull();
  });

  it('finishes the game when all pieces are placed', () => {
    const state = withPieces();
    const room = createRoom('jigsaw', state);
    const socket = mkSocket('p1');
    state.pieces.slice(0, 15).forEach((p) => {
      p.placed = true;
      p.boardRow = p.row;
      p.boardCol = p.col;
    });
    const last = state.pieces[15];
    makeMove(room, socket, { action: 'pickup', pieceId: last.id });
    expect(makeMove(room, socket, { action: 'drop', pieceId: last.id, row: last.row, col: last.col })).toBe(true);
    expect(state.status).toBe('finished');
    expect(state.winner).toBe('cooperative');
  });

  it('rejects moves when the game is finished', () => {
    const state = withPieces();
    state.status = 'finished';
    const room = createRoom('jigsaw', state);
    const socket = mkSocket('p1');
    expect(makeMove(room, socket, { action: 'pickup', pieceId: 0 })).toBe(false);
  });
});
