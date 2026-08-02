import { describe, expect, it, vi } from 'vitest';
import {
  createInitialState,
  resetState,
  onGameStart,
  makeMove,
  revealNextLetter,
  timeUp,
} from '../pictionary.js';
import type { PictionaryGameState } from '../pictionary.js';
import { createRoom, createSocketMock } from './helpers.js';

const stateWithPlayers = (overrides: Partial<PictionaryGameState> = {}): PictionaryGameState => ({
  phase: 'lobby',
  currentDrawer: 1,
  currentWord: '',
  wordChoices: [],
  roundNumber: 0,
  totalRounds: 0,
  roundsPerPlayer: 2,
  scores: {},
  winner: '',
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob' },
  ],
  currentPlayer: 1,
  totalMoves: 0,
  wordHistory: [],
  guessesThisRound: [],
  drawerReady: false,
  timerDuration: 60,
  timeRemaining: 60,
  revealedLetters: [],
  revealPositions: [],
  ...overrides,
});

describe('createInitialState / resetState / onGameStart', () => {
  it('creates a lobby state', () => {
    const state = createInitialState('p1');
    expect(state.phase).toBe('lobby');
    expect(state.roundNumber).toBe(0);
  });

  it('resetState keeps players', () => {
    const state = resetState([
      { id: 'p1', player: 1, ready: true },
      { id: 'p2', player: 2, ready: true },
    ]);
    expect(state.players).toHaveLength(2);
    expect(state.scores).toEqual({});
  });

  it('onGameStart initializes scores and prepares the first round', () => {
    vi.spyOn(Math, 'random').mockRestore();
    const state = stateWithPlayers();
    const room = createRoom('pictionary', state);
    onGameStart(room);
    expect(state.scores).toEqual({ 1: 0, 2: 0 });
    expect(state.totalRounds).toBe(4);
    expect(state.phase).toBe('choosing');
    expect(state.wordChoices).toHaveLength(3);
  });
});

describe('makeMove - choose-word', () => {
  it('lets the drawer pick a word and start drawing', () => {
    const state = stateWithPlayers({ phase: 'choosing', wordChoices: ['cat', 'dog', 'bird'] });
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'choose-word', wordIndex: 1 })).toBe(true);
    expect(state.currentWord).toBe('dog');
    expect(state.phase).toBe('drawing');
    expect(state.drawerReady).toBe(true);
    expect(state.wordHistory).toContain('dog');
  });

  it('rejects word choice from a non-drawer', () => {
    const state = stateWithPlayers({ phase: 'choosing', wordChoices: ['cat', 'dog', 'bird'] });
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'choose-word', wordIndex: 0 })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects an out-of-range word index', () => {
    const state = stateWithPlayers({ phase: 'choosing', wordChoices: ['cat', 'dog', 'bird'] });
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'choose-word', wordIndex: 5 })).toBe(false);
  });
});

describe('makeMove - guess', () => {
  const drawingState = (): PictionaryGameState =>
    stateWithPlayers({ phase: 'drawing', currentWord: 'cat', drawerReady: true });

  it('rejects a guess from the drawer', () => {
    const state = drawingState();
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'guess', guess: 'cat' })).toBe(false);
  });

  it('rejects an empty guess', () => {
    const state = drawingState();
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'guess', guess: '   ' })).toBe(false);
  });

  it('awards a point for a correct guess and ends the round', () => {
    const state = drawingState();
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'guess', guess: 'CAT' })).toBe(true);
    expect(state.scores[2]).toBe(1);
    expect(state.scores[1]).toBe(1);
    expect(state.phase).toBe('reveal');
  });

  it('records a wrong guess without scoring', () => {
    const state = drawingState();
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'guess', guess: 'dog' })).toBe(true);
    expect(state.guessesThisRound).toContain('dog');
    expect(state.phase).toBe('drawing');
  });
});

describe('makeMove - next-round', () => {
  it('advances the drawer and prepares the next round', () => {
    const state = stateWithPlayers({ phase: 'reveal', roundNumber: 1, totalRounds: 4 });
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'next-round' })).toBe(true);
    expect(state.currentDrawer).toBe(2);
    expect(state.phase).toBe('choosing');
  });

  it('ends the game after the final round', () => {
    const state = stateWithPlayers({
      phase: 'reveal',
      roundNumber: 4,
      totalRounds: 4,
      scores: { 1: 2, 2: 1 },
    });
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'next-round' })).toBe(true);
    expect(state.phase).toBe('game-over');
    expect(state.winner).toContain('Alice');
  });

  it('rejects advancing from a non-drawer', () => {
    const state = stateWithPlayers({ phase: 'reveal', roundNumber: 1, totalRounds: 4 });
    const room = createRoom('pictionary', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'next-round' })).toBe(false);
  });
});

describe('revealNextLetter & timeUp', () => {
  it('reveals letters one at a time in order', () => {
    const state = stateWithPlayers({
      phase: 'drawing',
      currentWord: 'cat',
      revealPositions: [0, 1, 2],
      revealedLetters: [],
    });
    revealNextLetter(state);
    expect(state.revealedLetters).toEqual([0]);
    revealNextLetter(state);
    revealNextLetter(state);
    expect(state.revealedLetters).toEqual([0, 1, 2]);
    // No-op past the end.
    revealNextLetter(state);
    expect(state.revealedLetters).toEqual([0, 1, 2]);
  });

  it('timeUp moves a drawing round to reveal', () => {
    const state = stateWithPlayers({ phase: 'drawing' });
    const room = createRoom('pictionary', state);
    timeUp(room);
    expect(state.phase).toBe('reveal');
  });
});
