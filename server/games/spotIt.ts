import type { Player, Room, SpotItCard, SpotItGameState } from '../../src/types/shared.js';

export const noTurns = true;

const SPOT_IT_ORDER = 7;
export const SPOT_IT_CARD_COUNT = SPOT_IT_ORDER ** 2 + SPOT_IT_ORDER + 1;
export const SPOT_IT_IMAGES_PER_CARD = SPOT_IT_ORDER + 1;
export const WRONG_CLAIM_PENALTY_MS = 3000;

const AFFINE_IMAGE_COUNT = SPOT_IT_ORDER ** 2;
const SLOPE_IMAGE_START = AFFINE_IMAGE_COUNT;
const VERTICAL_IMAGE_ID = `image-${SPOT_IT_CARD_COUNT - 1}`;

const imageIdForPoint = (x: number, y: number): string => `image-${x * SPOT_IT_ORDER + y}`;
const imageIdForSlope = (slope: number): string => `image-${SLOPE_IMAGE_START + slope}`;

const mod = (value: number, divisor: number): number => ((value % divisor) + divisor) % divisor;

const shuffle = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

/**
 * Builds the complete order-7 projective-plane deck. The construction has
 * 57 cards and 57 images, with exactly one shared image for every card pair.
 */
export const generateDeck = (): SpotItCard[] => {
  const cards: SpotItCard[] = [];
  let cardIndex = 0;

  for (let slope = 0; slope < SPOT_IT_ORDER; slope++) {
    for (let intercept = 0; intercept < SPOT_IT_ORDER; intercept++) {
      const imageIds = [imageIdForSlope(slope)];
      for (let x = 0; x < SPOT_IT_ORDER; x++) {
        imageIds.push(imageIdForPoint(x, mod(slope * x + intercept, SPOT_IT_ORDER)));
      }
      cards.push({ id: `card-${cardIndex++}`, imageIds: shuffle(imageIds) });
    }
  }

  for (let x = 0; x < SPOT_IT_ORDER; x++) {
    const imageIds = [VERTICAL_IMAGE_ID];
    for (let y = 0; y < SPOT_IT_ORDER; y++) {
      imageIds.push(imageIdForPoint(x, y));
    }
    cards.push({ id: `card-${cardIndex++}`, imageIds: shuffle(imageIds) });
  }

  cards.push({
    id: `card-${cardIndex}`,
    imageIds: shuffle([VERTICAL_IMAGE_ID, ...Array.from({ length: SPOT_IT_ORDER }, (_, index) => imageIdForSlope(index))]),
  });

  return cards;
};

const emptyScores = (players: Player[]): Record<number, number> => {
  return Object.fromEntries(players.map((player) => [player.player, 0]));
};

const createPlayingState = (players: Player[]): SpotItGameState => {
  const drawPile = shuffle(generateDeck());
  const activeCards: Record<number, SpotItCard> = {};

  players.forEach((player) => {
    const card = drawPile.shift();
    if (card) activeCards[player.player] = card;
  });

  const centerCard = drawPile.shift() || null;

  return {
    phase: 'playing',
    activeCards,
    centerCard,
    drawPile,
    remainingCards: drawPile.length,
    penaltyUntil: Object.fromEntries(players.map((player) => [player.player, 0])),
    scores: emptyScores(players),
    winner: '',
    players: players.map((player) => ({ ...player, ready: false })),
    currentPlayer: 0,
    totalMoves: 0,
  };
};

export const createInitialState = (playerId: string): SpotItGameState => ({
  phase: 'lobby',
  activeCards: {},
  centerCard: null,
  drawPile: [],
  remainingCards: 0,
  penaltyUntil: {},
  scores: {},
  winner: '',
  players: [{ id: playerId, player: 1, ready: false }],
  currentPlayer: 0,
  totalMoves: 0,
});

export const resetState = (players: Player[]): SpotItGameState => createPlayingState(players);

export const onGameStart = (room: Room): void => {
  const nextState = createPlayingState((room.gameState as SpotItGameState).players);
  Object.assign(room.gameState, nextState);
};

const emitInvalidMove = (socket: any, message: string): false => {
  socket.emit('invalid-move', { message });
  return false;
};

const endGame = (gameState: SpotItGameState): void => {
  gameState.phase = 'game-over';
  gameState.centerCard = null;
  gameState.remainingCards = 0;
  gameState.currentPlayer = 0;
  gameState.players.forEach((player) => {
    player.ready = false;
  });

  if (gameState.players.length === 0) {
    gameState.winner = 'No players remain.';
    return;
  }

  const highestScore = Math.max(...gameState.players.map((player) => gameState.scores[player.player] || 0));
  const winners = gameState.players.filter((player) => (gameState.scores[player.player] || 0) === highestScore);
  const names = winners.map((player) => player.name || `Player ${player.player}`);

  gameState.winner = winners.length === 1
    ? `${names[0]} wins with ${highestScore} card${highestScore === 1 ? '' : 's'}!`
    : `Tie between ${names.join(' and ')} with ${highestScore} cards each!`;
};

export const makeMove = (
  room: Room,
  socket: any,
  data: {
    action?: string;
    imageId?: string;
    centerCardId?: string;
    activeCardId?: string;
  },
): boolean => {
  const gameState = room.gameState as SpotItGameState;
  const player = gameState.players.find((entry) => entry.id === socket.id);
  if (!player) return emitInvalidMove(socket, 'You are not in this game.');
  if (gameState.phase !== 'playing') {
    return emitInvalidMove(socket, gameState.phase === 'game-over' ? 'Game is already over.' : 'The game has not started.');
  }
  if (data.action !== 'claim') return emitInvalidMove(socket, 'Unknown action.');

  const activeCard = gameState.activeCards[player.player];
  const centerCard = gameState.centerCard;
  if (!activeCard || !centerCard) return emitInvalidMove(socket, 'The game has no active cards.');
  if (data.activeCardId !== activeCard.id || data.centerCardId !== centerCard.id) {
    return emitInvalidMove(socket, 'That card is no longer current.');
  }
  const now = Date.now();
  const penaltyUntil = gameState.penaltyUntil[player.player] || 0;
  if (penaltyUntil > now) {
    const seconds = Math.ceil((penaltyUntil - now) / 1000);
    return emitInvalidMove(socket, `Penalty active. Wait ${seconds} second${seconds === 1 ? '' : 's'}.`);
  }
  if (!data.imageId || !activeCard.imageIds.includes(data.imageId) || !centerCard.imageIds.includes(data.imageId)) {
    gameState.penaltyUntil[player.player] = now + WRONG_CLAIM_PENALTY_MS;
    socket.emit('penalty-applied', { durationMs: WRONG_CLAIM_PENALTY_MS });
    return emitInvalidMove(socket, 'That image is not the match.');
  }

  gameState.activeCards[player.player] = centerCard;
  gameState.scores[player.player] = (gameState.scores[player.player] || 0) + 1;
  gameState.totalMoves++;
  gameState.lastClaim = {
    player: player.player,
    imageId: data.imageId,
    cardId: centerCard.id,
    timestamp: Date.now(),
  };

  const nextCenterCard = gameState.drawPile.shift() || null;
  gameState.centerCard = nextCenterCard;
  gameState.remainingCards = gameState.drawPile.length;
  if (!nextCenterCard) endGame(gameState);

  return true;
};
