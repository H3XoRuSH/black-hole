import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  createInitialState,
  resetState,
  onGameStart,
  makeMove,
  setRoom,
  getAvailableRooms,
} from '../escapeRoom.js';
import type { EscapeRoomGameState, EscapeRoomData } from '../../../src/types/shared.js';
import { createRoom, createSocketMock } from './helpers.js';

const testRoomData: EscapeRoomData = {
  id: 'test-room',
  name: 'Test Room',
  description: 'A room for testing',
  difficulty: 'easy',
  intro: 'You wake up here.',
  locations: [
    { id: 'hall', name: 'Hall', description: 'The hall' },
    { id: 'cellar', name: 'Cellar', description: 'The cellar' },
  ],
  nodes: [
    {
      id: 'start',
      locationId: 'hall',
      parentId: null,
      type: 'dialogue',
      label: 'Start',
      narrative: 'You are here.',
      children: ['puzzle-1'],
    },
    {
      id: 'puzzle-1',
      locationId: 'hall',
      parentId: 'start',
      type: 'puzzle',
      label: 'The riddle',
      narrative: 'Answer me.',
      question: 'What is 2+2?',
      answer: '4',
      hints: ['It is even.'],
      children: ['item-1'],
    },
    {
      id: 'item-1',
      locationId: 'cellar',
      parentId: 'puzzle-1',
      type: 'item',
      label: 'A rusty key',
      narrative: 'A key glints.',
      rewardItem: 'rusty-key',
    },
    {
      id: 'locked-1',
      locationId: 'hall',
      parentId: 'start',
      type: 'locked',
      label: 'Locked door',
      narrative: 'Needs a key.',
      lockedByItem: 'rusty-key',
    },
    {
      id: 'puzzle-2',
      locationId: 'hall',
      parentId: 'start',
      type: 'puzzle',
      label: 'The second riddle',
      narrative: 'One more.',
      question: 'What is 3+3?',
      answer: '6',
      hints: [],
    },
    {
      id: 'after-lock',
      locationId: 'cellar',
      parentId: 'locked-1',
      type: 'dialogue',
      label: 'Past the door',
      narrative: 'Beyond the locked door.',
    },
  ],
};

const stateWithPlayers = (overrides: Partial<EscapeRoomGameState> = {}): EscapeRoomGameState => {
  const state = createInitialState('p1');
  state.players = [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob' },
  ];
  state.nodes = testRoomData.nodes.map((n) => ({ ...n }));
  state.locations = testRoomData.locations.map((l) => ({ ...l }));
  return { ...state, ...overrides };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('createInitialState / resetState', () => {
  it('creates an initial playing state', () => {
    const state = createInitialState('p1');
    expect(state.phase).toBe('playing');
    expect(state.selectedRoomId).toBe('abandoned-lab');
    expect(state.wrongAttempts).toBe(0);
  });

  it('resetState keeps players', () => {
    const state = resetState([{ id: 'p1', player: 1, ready: true }]);
    expect(state.players).toHaveLength(1);
    expect(state.solvedNodes).toEqual([]);
  });
});

describe('onGameStart', () => {
  it('loads room data and initializes player paths', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => testRoomData,
    })));
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    await onGameStart(room);
    expect(state.roomName).toBe('Test Room');
    expect(state.locations).toHaveLength(2);
    expect(state.visitedLocations).toEqual(['hall']);
    expect(state.playerNodePaths.p1).toEqual([]);
    expect(state.playerInventories.p2).toEqual([]);
  });
});

describe('makeMove - navigation', () => {
  it('acknowledges the intro with begin-game', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'begin-game' })).toBe(true);
    expect(state.introAcknowledged).toBe(true);
  });

  it('navigates to a child node', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    // Must walk the tree: root first, then its child.
    expect(makeMove(room, socket, { action: 'navigate-node', nodeId: 'start' })).toBe(true);
    expect(makeMove(room, socket, { action: 'navigate-node', nodeId: 'puzzle-1' })).toBe(true);
    expect(state.playerNodePaths.p1).toEqual(['start', 'puzzle-1']);
    expect(state.visitedLocations).toContain('hall');
  });

  it('rejects navigating to a non-child node', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'navigate-node', nodeId: 'locked-1' })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects navigating to an unknown node', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'navigate-node', nodeId: 'nope' })).toBe(false);
  });

  it('jump-to-node walks the full path from the root', () => {
    const state = stateWithPlayers();
    state.nodes.find((n) => n.id === 'puzzle-1')!.solved = true;
    state.solvedNodes = ['puzzle-1'];
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'jump-to-node', nodeId: 'item-1' })).toBe(true);
    expect(state.playerNodePaths.p1).toEqual(['start', 'puzzle-1', 'item-1']);
  });

  it('jump-to-node is blocked by an unsolved puzzle in the path', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'jump-to-node', nodeId: 'item-1' })).toBe(false);
    // Puzzle-1 is still unsolved, so the direct jump fails; walking works.
    expect(state.playerNodePaths.p1).toBeUndefined();
  });

  it('jump-to-node is blocked by a lock in the path', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'jump-to-node', nodeId: 'after-lock' })).toBe(false);
  });

  it('navigates back with a breadcrumb', () => {
    const state = stateWithPlayers({ playerNodePaths: { p1: ['start', 'puzzle-1'] } });
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'navigate-breadcrumb', nodeId: 'start' })).toBe(true);
    expect(state.playerNodePaths.p1).toEqual(['start']);
  });
});

describe('makeMove - items', () => {
  it('picks up an item into the inventory', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'interact-item', nodeId: 'item-1' })).toBe(true);
    expect(state.playerInventories.p1).toContain('rusty-key');
    expect(state.discoveredItems).toContain('item-1');
  });

  it('prevents picking up the same item twice', () => {
    const state = stateWithPlayers({ discoveredItems: ['item-1'] });
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'interact-item', nodeId: 'item-1' })).toBe(false);
  });

  it('rejects interacting with a non-item node', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'interact-item', nodeId: 'puzzle-1' })).toBe(false);
  });

  it('unlocks a locked node with the required item', () => {
    const state = stateWithPlayers({ playerInventories: { p1: ['rusty-key'] } });
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'use-item', nodeId: 'locked-1' })).toBe(true);
    expect(state.unlockedNodes).toContain('locked-1');
    expect(state.playerInventories.p1).not.toContain('rusty-key');
  });

  it('rejects unlocking without the required item', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'use-item', nodeId: 'locked-1' })).toBe(false);
  });

  it('rejects unlocking an already unlocked node', () => {
    const state = stateWithPlayers({ unlockedNodes: ['locked-1'] });
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'use-item', nodeId: 'locked-1' })).toBe(false);
  });

  it('rejects using an item on a non-locked node', () => {
    const state = stateWithPlayers({ playerInventories: { p1: ['rusty-key'] } });
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'use-item', nodeId: 'puzzle-1' })).toBe(false);
  });

  it('rejects submitting an empty answer', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', nodeId: 'puzzle-1', answer: '  ' })).toBe(false);
  });

  it('rejects moves after the game has been escaped', () => {
    const state = stateWithPlayers({ phase: 'escaped' });
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'begin-game' })).toBe(false);
  });
});

describe('makeMove - puzzles', () => {
  it('solves a puzzle with the correct answer', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', nodeId: 'puzzle-1', answer: '4' })).toBe(true);
    expect(state.solvedNodes).toContain('puzzle-1');
    expect(state.attemptsPerNode['puzzle-1']).toBe(1);
  });

  it('counts a wrong attempt', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', nodeId: 'puzzle-1', answer: '5' })).toBe(true);
    expect(state.wrongAttempts).toBe(1);
    expect(state.solvedNodes).not.toContain('puzzle-1');
  });

  it('declares everyone escaped when all puzzles are solved', () => {
    const state = stateWithPlayers();
    state.nodes = testRoomData.nodes.map((n) =>
      n.type === 'puzzle' && n.id === 'puzzle-2' ? { ...n, solved: true } : { ...n }
    );
    state.solvedNodes = ['puzzle-2'];
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    // Solving the last remaining puzzle triggers the escape.
    expect(makeMove(room, socket, { action: 'submit-answer', nodeId: 'puzzle-1', answer: '4' })).toBe(true);
    expect(state.phase).toBe('escaped');
    expect(state.winner).toBe('Everyone escapes!');
  });

  it('reveals a hint when requested', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'request-hint', nodeId: 'puzzle-1' })).toBe(true);
    expect(state.hintsUsed).toBe(1);
    expect(state.nodes.find((n) => n.id === 'puzzle-1')?.hintsRevealed).toBe(1);
  });

  it('rejects hint requests when no hints remain', () => {
    const state = stateWithPlayers();
    state.nodes.find((n) => n.id === 'puzzle-1')!.hintsRevealed = 1;
    const room = createRoom('escape-room', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'request-hint', nodeId: 'puzzle-1' })).toBe(false);
  });
});

describe('setRoom & getAvailableRooms', () => {
  it('getAvailableRooms falls back to local data', () => {
    const rooms = getAvailableRooms();
    expect(rooms.length).toBeGreaterThan(0);
    expect(rooms[0]).toHaveProperty('id');
  });

  it('setRoom changes the selected room when it exists', () => {
    const state = stateWithPlayers();
    const room = createRoom('escape-room', state);
    setRoom(room, 'cinnabar-lab');
    expect(state.selectedRoomId).toBe('cinnabar-lab');
  });

  it('setRoom ignores unknown rooms', () => {
    const state = stateWithPlayers({ selectedRoomId: 'abandoned-lab' });
    const room = createRoom('escape-room', state);
    setRoom(room, 'does-not-exist');
    expect(state.selectedRoomId).toBe('abandoned-lab');
  });
});
