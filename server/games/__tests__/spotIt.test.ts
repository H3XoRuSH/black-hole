import { describe, expect, it, vi } from 'vitest';
import {
  createInitialState,
  generateDeck,
  makeMove,
  onGameStart,
  resetState,
  SPOT_IT_CARD_COUNT,
  SPOT_IT_IMAGES_PER_CARD,
  WRONG_CLAIM_PENALTY_MS,
} from '../spotIt.js';
import type { SpotItGameState } from '../../../src/types/shared.js';
import { createRoom, createSocketMock } from './helpers.js';

const players = [
  { id: 'p1', player: 1, ready: false, name: 'Alice' },
  { id: 'p2', player: 2, ready: false, name: 'Bob' },
];

const claimState = (overrides: Partial<SpotItGameState> = {}): SpotItGameState => ({
  ...resetState(players),
  phase: 'playing',
  activeCards: {
    1: { id: 'active-1', imageIds: ['image-a', 'image-b'] },
    2: { id: 'active-2', imageIds: ['image-c', 'image-d'] },
  },
  centerCard: { id: 'center-1', imageIds: ['image-b', 'image-e'] },
  drawPile: [{ id: 'center-2', imageIds: ['image-f', 'image-g'] }],
  remainingCards: 1,
  scores: { 1: 0, 2: 0 },
  totalMoves: 0,
  winner: '',
  ...overrides,
});

describe('Spot It deck generation', () => {
  it('generates a complete deck with unique images on every card', () => {
    const deck = generateDeck();
    const ids = new Set(deck.map((card) => card.id));

    expect(deck).toHaveLength(SPOT_IT_CARD_COUNT);
    expect(ids.size).toBe(SPOT_IT_CARD_COUNT);
    deck.forEach((card) => {
      expect(card.imageIds).toHaveLength(SPOT_IT_IMAGES_PER_CARD);
      expect(new Set(card.imageIds).size).toBe(SPOT_IT_IMAGES_PER_CARD);
    });
  });

  it('gives every pair of cards exactly one shared image', () => {
    const deck = generateDeck();

    for (let first = 0; first < deck.length; first++) {
      for (let second = first + 1; second < deck.length; second++) {
        const shared = deck[first].imageIds.filter((imageId) => deck[second].imageIds.includes(imageId));
        expect(shared).toHaveLength(1);
      }
    }
  });
});

describe('Spot It state lifecycle', () => {
  it('waits for the game start before dealing cards', () => {
    const state = createInitialState('p1');
    expect(state.phase).toBe('lobby');
    expect(state.centerCard).toBeNull();

    state.players.push(players[1]);
    onGameStart(createRoom('spot-it', state));

    expect(state.phase).toBe('playing');
    expect(Object.keys(state.activeCards)).toHaveLength(2);
    expect(state.centerCard).not.toBeNull();
    expect(state.remainingCards).toBe(SPOT_IT_CARD_COUNT - 3);
  });

  it('creates a fresh dealt game on reset', () => {
    const state = resetState(players);
    expect(state.phase).toBe('playing');
    expect(state.totalMoves).toBe(0);
    expect(state.scores).toEqual({ 1: 0, 2: 0 });
    expect(state.remainingCards).toBe(SPOT_IT_CARD_COUNT - players.length - 1);
  });
});

describe('Spot It claims', () => {
  it('accepts a valid claim and deals the next center card', () => {
    const state = claimState();
    const socket = createSocketMock('p1');
    const room = createRoom('spot-it', state);

    expect(makeMove(room, socket, {
      action: 'claim',
      imageId: 'image-b',
      activeCardId: 'active-1',
      centerCardId: 'center-1',
    })).toBe(true);

    expect(state.scores[1]).toBe(1);
    expect(state.activeCards[1].id).toBe('center-1');
    expect(state.centerCard?.id).toBe('center-2');
    expect(state.remainingCards).toBe(0);
    expect(state.totalMoves).toBe(1);
  });

  it('rejects a non-matching image without changing state', () => {
    const state = claimState();
    const socket = createSocketMock('p1');
    const room = createRoom('spot-it', state);

    expect(makeMove(room, socket, {
      action: 'claim',
      imageId: 'image-a',
      activeCardId: 'active-1',
      centerCardId: 'center-1',
    })).toBe(false);

    expect(state.scores[1]).toBe(0);
    expect(state.centerCard?.id).toBe('center-1');
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('applies a three-second penalty after a wrong claim', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    try {
      const state = claimState();
      const socket = createSocketMock('p1');
      const room = createRoom('spot-it', state);
      const validClaim = {
        action: 'claim' as const,
        imageId: 'image-b',
        activeCardId: 'active-1',
        centerCardId: 'center-1',
      };

      expect(makeMove(room, socket, {
        ...validClaim,
        imageId: 'image-a',
      })).toBe(false);
      expect(state.penaltyUntil[1]).toBe(WRONG_CLAIM_PENALTY_MS);
      expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'penalty-applied' }));

      expect(makeMove(room, socket, validClaim)).toBe(false);
      vi.advanceTimersByTime(WRONG_CLAIM_PENALTY_MS - 1);
      expect(makeMove(room, socket, validClaim)).toBe(false);
      vi.advanceTimersByTime(1);
      expect(makeMove(room, socket, validClaim)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects a stale claim after another player takes the center card', () => {
    const state = claimState({ drawPile: [{ id: 'center-2', imageIds: ['image-f', 'image-g'] }] });
    const firstSocket = createSocketMock('p1');
    const secondSocket = createSocketMock('p2');
    const room = createRoom('spot-it', state);

    expect(makeMove(room, firstSocket, {
      action: 'claim',
      imageId: 'image-b',
      activeCardId: 'active-1',
      centerCardId: 'center-1',
    })).toBe(true);
    expect(makeMove(room, secondSocket, {
      action: 'claim',
      imageId: 'image-c',
      activeCardId: 'active-2',
      centerCardId: 'center-1',
    })).toBe(false);

    expect(state.scores).toEqual({ 1: 1, 2: 0 });
    expect(state.centerCard?.id).toBe('center-2');
  });

  it('finishes with a winner when the final center card is claimed', () => {
    const state = claimState({ drawPile: [], remainingCards: 0 });
    const room = createRoom('spot-it', state);
    const socket = createSocketMock('p1');

    expect(makeMove(room, socket, {
      action: 'claim',
      imageId: 'image-b',
      activeCardId: 'active-1',
      centerCardId: 'center-1',
    })).toBe(true);

    expect(state.phase).toBe('game-over');
    expect(state.centerCard).toBeNull();
    expect(state.winner).toContain('Alice');
  });

  it('reports a tie when the final claim equalizes scores', () => {
    const state = claimState({
      drawPile: [],
      remainingCards: 0,
      scores: { 1: 1, 2: 2 },
    });
    const room = createRoom('spot-it', state);
    const socket = createSocketMock('p1');

    expect(makeMove(room, socket, {
      action: 'claim',
      imageId: 'image-b',
      activeCardId: 'active-1',
      centerCardId: 'center-1',
    })).toBe(true);

    expect(state.winner).toContain('Tie');
    expect(state.winner).toContain('Alice');
    expect(state.winner).toContain('Bob');
  });
});
