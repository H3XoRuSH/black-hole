import type { Player, EscapeRoomGameState, EscapeRoomNode, EscapeRoomData, EscapeRoomLocation, Room } from '../../src/types/shared.js';
import escapeRooms from '../data/escape-rooms/rooms.js';

export type { Player, EscapeRoomGameState, EscapeRoomNode, EscapeRoomData, EscapeRoomLocation, Room };

export const getAvailableRooms = (): { id: string; name: string; description: string; difficulty: string }[] => {
  return Object.values(escapeRooms)
    .filter((r) => r.nodes.some((n) => n.isMeta))
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      difficulty: r.difficulty,
    }));
};

export const noTurns = true;

export const createInitialState = (playerId: string): EscapeRoomGameState => {
  return {
    phase: 'playing',
    selectedRoomId: 'abandoned-lab',
    nodes: [],
    locations: [],
    availableRooms: getAvailableRooms(),
    players: [{ id: playerId, player: 1, ready: false }],
    winner: '',
    totalMoves: 0,
    wrongAttempts: 0,
    hintsUsed: 0,
    playerNodePaths: {},
    playerInventories: {},
    unlockedNodes: [],
    visitedLocations: [],
    discoveredItems: [],
    attemptsPerNode: {},
    solvedNodes: [],
    lastAction: null,
    introAcknowledged: false,
  };
};

export const resetState = (players: Player[]): EscapeRoomGameState => {
  return {
    phase: 'playing',
    selectedRoomId: 'abandoned-lab',
    nodes: [],
    locations: [],
    availableRooms: getAvailableRooms(),
    players: players.map((p) => ({ ...p, ready: false })),
    winner: '',
    totalMoves: 0,
    wrongAttempts: 0,
    hintsUsed: 0,
    playerNodePaths: {},
    playerInventories: {},
    unlockedNodes: [],
    visitedLocations: [],
    discoveredItems: [],
    attemptsPerNode: {},
    solvedNodes: [],
    lastAction: null,
    introAcknowledged: false,
  };
};

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export const onGameStart = (room: Room): void => {
  const gameState = room.gameState as EscapeRoomGameState;
  const roomData = escapeRooms[gameState.selectedRoomId || 'abandoned-lab'];
  if (roomData) {
    gameState.roomName = roomData.name;
    gameState.roomDescription = roomData.description;
    gameState.roomIntro = roomData.intro;
    gameState.locations = roomData.locations.map((l) => ({ ...l }));
    gameState.nodes = roomData.nodes.map((n) => ({ ...n, solved: false, hintsRevealed: 0 }));

    for (const node of gameState.nodes) {
      if (node.children && node.children.length > 1) {
        shuffleArray(node.children);
      }
    }
    shuffleArray(gameState.nodes);
    const firstLocationId = roomData.locations[0]?.id;
    gameState.visitedLocations = firstLocationId ? [firstLocationId] : [];

    for (const player of gameState.players) {
      if (!gameState.playerNodePaths[player.id]) {
        gameState.playerNodePaths[player.id] = [];
      }
      if (!gameState.playerInventories[player.id]) {
        gameState.playerInventories[player.id] = [];
      }
    }
  }
};

function findNode(nodes: EscapeRoomNode[], nodeId: string): EscapeRoomNode | undefined {
  return nodes.find((n) => n.id === nodeId);
}

function isNodeUnlocked(node: EscapeRoomNode, unlockedNodes: string[]): boolean {
  if (!node.lockedByItem) return true;
  return unlockedNodes.includes(node.id);
}

export const makeMove = (
  room: Room,
  socket: any,
  data: { action: string; nodeId?: string; answer?: string }
): boolean => {
  const gameState = room.gameState as EscapeRoomGameState;

  if (gameState.phase === 'escaped') {
    socket.emit('invalid-move', { message: 'You have already escaped!' });
    return false;
  }

  const player = gameState.players.find((p) => p.id === socket.id);
  const playerNumber = player ? player.player : 0;
  const playerId = socket.id;
  const inventory = gameState.playerInventories[playerId] || [];

  if (data.action === 'begin-game') {
    gameState.introAcknowledged = true;
    gameState.lastAction = { playerNumber, action: 'begin-game' };
    return true;
  }

  if (data.action === 'navigate-node') {
    const nodeId = data.nodeId || null;
    const path = gameState.playerNodePaths[playerId] || [];

    if (nodeId === null) {
      gameState.playerNodePaths[playerId] = [];
      gameState.lastAction = { playerNumber, action: 'navigate-node' };
      return true;
    }

    const node = findNode(gameState.nodes, nodeId);
    if (!node) {
      socket.emit('invalid-move', { message: 'Node not found.' });
      return false;
    }

    const parentId = path.length > 0 ? path[path.length - 1] : null;
    const isChild = parentId
      ? node.parentId === parentId
      : node.parentId === null;

    if (!isChild) {
      socket.emit('invalid-move', { message: 'Cannot navigate to that node from here.' });
      return false;
    }

    gameState.playerNodePaths[playerId] = [...path, nodeId];

    if (!gameState.visitedLocations.includes(node.locationId)) {
      gameState.visitedLocations.push(node.locationId);
    }

    gameState.lastAction = { playerNumber, action: 'navigate-node' };
    return true;
  }

  if (data.action === 'navigate-breadcrumb') {
    const nodeId = data.nodeId || null;
    const path = gameState.playerNodePaths[playerId] || [];

    if (nodeId === null) {
      gameState.playerNodePaths[playerId] = [];
      gameState.lastAction = { playerNumber, action: 'navigate-breadcrumb' };
      return true;
    }

    const idx = path.indexOf(nodeId);
    if (idx === -1) {
      socket.emit('invalid-move', { message: 'Node not in your breadcrumb path.' });
      return false;
    }

    gameState.playerNodePaths[playerId] = path.slice(0, idx + 1);
    gameState.lastAction = { playerNumber, action: 'navigate-breadcrumb' };
    return true;
  }

  if (data.action === 'interact-item') {
    const nodeId = data.nodeId;
    if (!nodeId) {
      socket.emit('invalid-move', { message: 'No node specified.' });
      return false;
    }

    const node = findNode(gameState.nodes, nodeId);
    if (!node || node.type !== 'item') {
      socket.emit('invalid-move', { message: 'Not an item node.' });
      return false;
    }

    if (!node.rewardItem) {
      socket.emit('invalid-move', { message: 'This item has no reward.' });
      return false;
    }

    if (gameState.discoveredItems.includes(nodeId)) {
      socket.emit('invalid-move', { message: 'This item has already been picked up.' });
      return false;
    }

    inventory.push(node.rewardItem);
    gameState.playerInventories[playerId] = inventory;
    gameState.discoveredItems.push(nodeId);
    gameState.totalMoves++;
    gameState.lastAction = { playerNumber, action: 'interact-item' };
    return true;
  }

  if (data.action === 'use-item') {
    const nodeId = data.nodeId;
    if (!nodeId) {
      socket.emit('invalid-move', { message: 'No node specified.' });
      return false;
    }

    const node = findNode(gameState.nodes, nodeId);
    if (!node || node.type !== 'locked') {
      socket.emit('invalid-move', { message: 'Not a locked node.' });
      return false;
    }

    if (!node.lockedByItem) {
      socket.emit('invalid-move', { message: 'This node has no lock requirement.' });
      return false;
    }

    if (isNodeUnlocked(node, gameState.unlockedNodes)) {
      socket.emit('invalid-move', { message: 'This node is already unlocked.' });
      return false;
    }

    if (!inventory.includes(node.lockedByItem)) {
      socket.emit('invalid-move', { message: `You need ${node.lockedByItem} to unlock this.` });
      return false;
    }

    const idx = inventory.indexOf(node.lockedByItem);
    if (idx !== -1) {
      inventory.splice(idx, 1);
    }
    gameState.playerInventories[playerId] = inventory;

    gameState.unlockedNodes.push(nodeId);
    gameState.totalMoves++;
    gameState.lastAction = { playerNumber, action: 'use-item' };
    return true;
  }

  if (data.action === 'submit-answer') {
    const nodeId = data.nodeId;
    if (!nodeId) {
      socket.emit('invalid-move', { message: 'No node specified.' });
      return false;
    }

    const node = findNode(gameState.nodes, nodeId);
    if (!node || node.type !== 'puzzle') {
      socket.emit('invalid-move', { message: 'Not a puzzle node.' });
      return false;
    }

    if (node.solved) {
      socket.emit('invalid-move', { message: 'This puzzle is already solved.' });
      return false;
    }

    const answer = (data.answer || '').trim().toLowerCase();
    if (!answer) {
      socket.emit('invalid-move', { message: 'Please enter an answer.' });
      return false;
    }

    gameState.totalMoves++;
    gameState.attemptsPerNode[nodeId] = (gameState.attemptsPerNode[nodeId] || 0) + 1;

    if (answer === (node.answer || '').toLowerCase()) {
      node.solved = true;
      gameState.solvedNodes.push(nodeId);
      gameState.lastAction = { playerNumber, action: 'submit-answer' };

      const allPuzzleNodes = gameState.nodes.filter((n) => n.type === 'puzzle');
      const allSolved = allPuzzleNodes.every((n) => n.solved);
      if (allSolved) {
        gameState.phase = 'escaped';
        gameState.winner = 'Everyone escapes!';
      }
    } else {
      gameState.wrongAttempts++;
      socket.emit('invalid-move', { message: 'Incorrect answer. Try again!' });
    }
    return true;
  }

  if (data.action === 'request-hint') {
    const nodeId = data.nodeId;
    if (!nodeId) {
      socket.emit('invalid-move', { message: 'No node specified.' });
      return false;
    }

    const node = findNode(gameState.nodes, nodeId);
    if (!node || node.type !== 'puzzle') {
      socket.emit('invalid-move', { message: 'Not a puzzle node.' });
      return false;
    }

    if (node.solved) {
      socket.emit('invalid-move', { message: 'This puzzle is already solved.' });
      return false;
    }

    if ((node.hintsRevealed || 0) >= (node.hints?.length || 0)) {
      socket.emit('invalid-move', { message: 'No more hints for this puzzle.' });
      return false;
    }

    gameState.hintsUsed++;
    node.hintsRevealed = (node.hintsRevealed || 0) + 1;
    gameState.lastAction = { playerNumber, action: 'request-hint' };
    return true;
  }

  socket.emit('invalid-move', { message: 'Unknown action.' });
  return false;
};

export const setRoom = (room: Room, roomId: string): void => {
  const gameState = room.gameState as EscapeRoomGameState;
  if (escapeRooms[roomId]) {
    gameState.selectedRoomId = roomId;
  }
};
