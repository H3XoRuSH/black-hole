import type { Player, Room } from '../../src/types/shared.js';

export interface BingoGameState {
  cards: Record<number, number[][]>;
  daubed: Record<number, string[]>;
  drawnNumbers: number[];
  phase: string;
  winner: string;
  players: Player[];
  currentPlayer: number;
  totalMoves: number;
}

export const noTurns = true;

const generateCardArray = (): number[][] => {
  const card: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  const usedInCol: Record<number, Set<number>> = {};
  for (let i = 0; i < 5; i++) usedInCol[i] = new Set();

  for (let col = 0; col < 5; col++) {
    const min = col * 15 + 1;
    const max = col * 15 + 15;
    const pool: number[] = [];
    for (let n = min; n <= max; n++) pool.push(n);

    for (let row = 0; row < 5; row++) {
      if (col === 2 && row === 2) {
        card[row][col] = 0;
        continue;
      }
      const available = pool.filter((n) => !usedInCol[col].has(n));
      const pick = available[Math.floor(Math.random() * available.length)];
      card[row][col] = pick;
      usedInCol[col].add(pick);
    }
  }
  return card;
};

const generateCardsForPlayers = (players: Player[]): { cards: Record<number, number[][]>; daubed: Record<number, string[]> } => {
  const cards: Record<number, number[][]> = {};
  const daubed: Record<number, string[]> = {};
  players.forEach((p) => {
    cards[p.player] = generateCardArray();
    daubed[p.player] = ['2,2'];
  });
  return { cards, daubed };
};

const checkBingo = (card: number[][], daubedSet: Set<string>): boolean => {
  const isDaubed = (r: number, c: number) => daubedSet.has(`${r},${c}`) || (r === 2 && c === 2);

  for (let r = 0; r < 5; r++) {
    if ([0, 1, 2, 3, 4].every((c) => isDaubed(r, c))) return true;
  }
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every((r) => isDaubed(r, c))) return true;
  }
  if ([0, 1, 2, 3, 4].every((i) => isDaubed(i, i))) return true;
  if ([0, 1, 2, 3, 4].every((i) => isDaubed(i, 4 - i))) return true;

  return false;
};

export const createInitialState = (playerId: string): BingoGameState => {
  return {
    cards: {},
    daubed: {},
    drawnNumbers: [],
    phase: 'playing',
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
    currentPlayer: 1,
    totalMoves: 0,
  };
};

export const resetState = (players: Player[]): BingoGameState => {
  const { cards, daubed } = generateCardsForPlayers(players);
  return {
    cards,
    daubed,
    drawnNumbers: [],
    phase: 'playing',
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
    currentPlayer: 1,
    totalMoves: 0,
  };
};

export const onGameStart = (room: Room): void => {
  const gameState = room.gameState as BingoGameState;
  const needCards = gameState.players.filter((p) => !gameState.cards[p.player]);
  if (needCards.length > 0) {
    const { cards, daubed } = generateCardsForPlayers(needCards);
    Object.assign(gameState.cards, cards);
    Object.assign(gameState.daubed, daubed);
  }
};

export const makeMove = (
  room: Room,
  socket: any,
  data: { action: string; row?: number; col?: number }
): boolean => {
  const gameState = room.gameState as BingoGameState;
  const player = gameState.players.find((p: any) => p.id === socket.id);
  if (!player) {
    socket.emit('invalid-move', { message: 'You are not in this game.' });
    return false;
  }

  if (data.action === 'daub') {
    const { row, col } = data;
    if (row === undefined || col === undefined) {
      socket.emit('invalid-move', { message: 'Missing row/col.' });
      return false;
    }
    if (row < 0 || row > 4 || col < 0 || col > 4) {
      socket.emit('invalid-move', { message: 'Invalid cell.' });
      return false;
    }
    if (row === 2 && col === 2) {
      socket.emit('invalid-move', { message: 'FREE space is already daubed.' });
      return false;
    }
    const playerDaubed = gameState.daubed[player.player] || [];
    if (playerDaubed.includes(`${row},${col}`)) {
      socket.emit('invalid-move', { message: 'Cell already daubed.' });
      return false;
    }
    const card = gameState.cards[player.player];
    if (!card) {
      socket.emit('invalid-move', { message: 'No card found.' });
      return false;
    }
    const cellNum = card[row][col];
    if (!gameState.drawnNumbers.includes(cellNum)) {
      socket.emit('invalid-move', { message: 'That number has not been drawn yet.' });
      return false;
    }
    playerDaubed.push(`${row},${col}`);
    gameState.daubed[player.player] = playerDaubed;
    return true;
  }

  if (data.action === 'call-bingo') {
    if (gameState.winner) {
      socket.emit('invalid-move', { message: 'Game is already over.' });
      return false;
    }
    const card = gameState.cards[player.player];
    if (!card) {
      socket.emit('invalid-move', { message: 'No card found.' });
      return false;
    }
    const daubedSet = new Set(gameState.daubed[player.player] || []);
    if (checkBingo(card, daubedSet)) {
      const winnerName = player.name || `Player ${player.player}`;
      gameState.winner = `${winnerName} wins!`;
      gameState.phase = 'game-over';
      gameState.players.forEach((p: any) => (p.ready = false));
      return true;
    } else {
      socket.emit('invalid-move', { message: 'No Bingo! Check your card and try again.' });
      return false;
    }
  }

  socket.emit('invalid-move', { message: 'Unknown action.' });
  return false;
};
