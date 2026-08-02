import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  createInitialState,
  resetState,
  onGameStart,
  makeMove,
} from '../infinite-word-chain.js';
import type { InfiniteWordChainGameState } from '../../../src/types/shared.js';
import { createRoom, createSocketMock } from './helpers.js';

vi.mock('../../services/wordChainService.js', () => ({
  generateCompoundPairs: vi.fn(async () => [['coffee', 'cake'], ['cake', 'walk']]),
}));

const stateWithPlayers = (overrides: Partial<InfiniteWordChainGameState> = {}): InfiniteWordChainGameState => ({
  pairs: [['coffee', 'cake']],
  currentPairIndex: 0,
  phase: 'playing',
  currentWord: 'coffee',
  answerWord: 'cake',
  answerDisplay: 'c___',
  totalLetters: 4,
  revealIndex: 0,
  winner: '',
  players: [{ id: 'p1', player: 1, ready: false, name: 'Alice' }],
  currentPlayer: 1,
  totalMoves: 0,
  score: 0,
  mistakes: 0,
  ...overrides,
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('createInitialState / resetState / onGameStart', () => {
  it('creates an initial state', () => {
    const state = createInitialState('p1');
    expect(state.phase).toBe('playing');
    expect(state.pairs).toEqual([]);
    expect(state.score).toBe(0);
  });

  it('resetState keeps players', () => {
    const state = resetState([{ id: 'p1', player: 1, ready: true }]);
    expect(state.players).toHaveLength(1);
    expect(state.mistakes).toBe(0);
  });

  it('onGameStart fetches pairs and sets up the first one', async () => {
    const state = stateWithPlayers();
    const room = createRoom('infinite-word-chain', state);
    await onGameStart(room);
    expect(state.pairs).toEqual([['coffee', 'cake'], ['cake', 'walk']]);
    expect(state.currentWord).toBe('coffee');
    expect(state.answerWord).toBe('cake');
  });
});

describe('makeMove - submit-guess', () => {
  it('advances to the next pair on a correct guess', async () => {
    const state = stateWithPlayers();
    const room = createRoom('infinite-word-chain', state);
    const socket = createSocketMock('p1');
    expect(await makeMove(room, socket, { action: 'submit-guess', guess: 'cake' })).toBe(true);
    expect(state.score).toBe(1);
    expect(state.currentPairIndex).toBe(1);
  });

  it('reveals a letter on a wrong guess', async () => {
    const state = stateWithPlayers();
    const room = createRoom('infinite-word-chain', state);
    const socket = createSocketMock('p1');
    expect(await makeMove(room, socket, { action: 'submit-guess', guess: 'bake' })).toBe(true);
    expect(state.mistakes).toBe(1);
    expect(state.revealIndex).toBe(1);
    expect(state.answerDisplay).toBe('ca__');
  });

  it('rejects non-letter guesses', async () => {
    const state = stateWithPlayers();
    const room = createRoom('infinite-word-chain', state);
    const socket = createSocketMock('p1');
    expect(await makeMove(room, socket, { action: 'submit-guess', guess: 'c4ke' })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects moves after the game is over', async () => {
    const state = stateWithPlayers({ phase: 'game-over', winner: 'Final Score: 5' });
    const room = createRoom('infinite-word-chain', state);
    const socket = createSocketMock('p1');
    expect(await makeMove(room, socket, { action: 'submit-guess', guess: 'cake' })).toBe(false);
  });
});

describe('makeMove - finish', () => {
  it('ends the game with the current score', async () => {
    const state = stateWithPlayers({ score: 3 });
    const room = createRoom('infinite-word-chain', state);
    const socket = createSocketMock('p1');
    expect(await makeMove(room, socket, { action: 'finish' })).toBe(true);
    expect(state.phase).toBe('game-over');
    expect(state.winner).toBe('Final Score: 3');
  });
});
