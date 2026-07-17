import type { Player, Room } from '../../src/types/shared.js';
import { pickWords, shuffleArray } from './pictionaryWords.js';

export interface PictionaryGameState {
  phase: 'lobby' | 'choosing' | 'drawing' | 'reveal' | 'game-over';
  currentDrawer: number;
  currentWord: string;
  wordChoices: string[];
  roundNumber: number;
  totalRounds: number;
  scores: Record<number, number>;
  winner: string;
  players: Player[];
  currentPlayer: number;
  totalMoves: number;
  wordHistory: string[];
  guessesThisRound: string[];
  drawerReady: boolean;
  timerDuration: number;
  timeRemaining: number;
  revealedLetters: number[];
  revealPositions: number[];
}

const ROUNDS_PER_PLAYER = 2;
const DEFAULT_TIMER = 60;

function getNextDrawer(currentPlayer: number, players: Player[]): number {
  const playerNums = players.map((p) => p.player).sort();
  const idx = playerNums.indexOf(currentPlayer);
  return playerNums[(idx + 1) % playerNums.length];
}

export const createInitialState = (playerId: string): PictionaryGameState => {
  return {
    phase: 'lobby',
    currentDrawer: 1,
    currentWord: '',
    wordChoices: [],
    roundNumber: 0,
    totalRounds: 0,
    scores: {},
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
    currentPlayer: 1,
    totalMoves: 0,
    wordHistory: [],
    guessesThisRound: [],
    drawerReady: false,
    timerDuration: DEFAULT_TIMER,
    timeRemaining: DEFAULT_TIMER,
    revealedLetters: [],
    revealPositions: [],
  };
};

export const resetState = (players: Player[]): PictionaryGameState => {
  return {
    phase: 'lobby',
    currentDrawer: 1,
    currentWord: '',
    wordChoices: [],
    roundNumber: 0,
    totalRounds: 0,
    scores: {},
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
    currentPlayer: 1,
    totalMoves: 0,
    wordHistory: [],
    guessesThisRound: [],
    drawerReady: false,
    timerDuration: DEFAULT_TIMER,
    timeRemaining: DEFAULT_TIMER,
    revealedLetters: [],
    revealPositions: [],
  };
};

export const onGameStart = (room: Room): void => {
  const gameState = room.gameState as PictionaryGameState;
  gameState.players.forEach((p: any) => {
    gameState.scores[p.player] = 0;
  });
  gameState.totalRounds = gameState.players.length * ROUNDS_PER_PLAYER;
  prepareRound(gameState);
};

function prepareRound(gameState: PictionaryGameState): void {
  gameState.roundNumber++;
  gameState.wordChoices = pickWords(3, gameState.wordHistory);
  gameState.currentWord = '';
  gameState.guessesThisRound = [];
  gameState.drawerReady = false;
  gameState.phase = 'choosing';
  gameState.totalMoves = 0;
  gameState.timeRemaining = gameState.timerDuration;
  gameState.revealedLetters = [];
  gameState.revealPositions = [];
}

function startDrawing(gameState: PictionaryGameState): void {
  gameState.drawerReady = true;
  gameState.phase = 'drawing';
  gameState.timeRemaining = gameState.timerDuration;
  const letterPositions = gameState.currentWord.split('').map((ch, i) => ch !== ' ' ? i : -1).filter((i) => i !== -1);
  const numReveals = Math.max(1, letterPositions.length - 1);
  gameState.revealPositions = shuffleArray(letterPositions).slice(0, numReveals);
  gameState.revealedLetters = [];
}

export function revealNextLetter(gameState: PictionaryGameState): void {
  const nextIdx = gameState.revealedLetters.length;
  if (nextIdx >= gameState.revealPositions.length) return;
  gameState.revealedLetters.push(gameState.revealPositions[nextIdx]);
  gameState.revealedLetters.sort((a: number, b: number) => a - b);
}

function endGame(gameState: PictionaryGameState): void {
  gameState.phase = 'game-over';
  const maxScore = Math.max(...Object.values(gameState.scores));
  const winners = Object.entries(gameState.scores)
    .filter(([, sc]) => sc === maxScore)
    .map(([p]) => parseInt(p));

  if (winners.length === 1) {
    const winnerPlayer = gameState.players.find((p) => p.player === winners[0]);
    const winnerName = winnerPlayer?.name || `Player ${winners[0]}`;
    gameState.winner = `${winnerName} wins!`;
  } else {
    const names = winners.map((p) => {
      const pl = gameState.players.find((pl) => pl.player === p);
      return pl?.name || `Player ${p}`;
    });
    gameState.winner = `Tie between ${names.join(' & ')}!`;
  }
}

export function timeUp(room: Room): void {
  const gameState = room.gameState as PictionaryGameState;
  if (gameState.phase !== 'drawing') return;
  gameState.phase = 'reveal';
}

export const makeMove = (
  room: Room,
  socket: any,
  data: { action: string; guess?: string; wordIndex?: number }
): boolean => {
  const gameState = room.gameState as PictionaryGameState;
  const player = gameState.players.find((p: any) => p.id === socket.id);
  if (!player) {
    socket.emit('invalid-move', { message: 'You are not in this game.' });
    return false;
  }

  if (gameState.phase === 'game-over') {
    socket.emit('invalid-move', { message: 'Game is over.' });
    return false;
  }

  if (data.action === 'choose-word') {
    if (player.player !== gameState.currentDrawer) {
      socket.emit('invalid-move', { message: 'Only the drawer can choose a word.' });
      return false;
    }
    if (gameState.phase !== 'choosing') {
      socket.emit('invalid-move', { message: 'Not choosing a word right now.' });
      return false;
    }
    const idx = data.wordIndex;
    if (idx === undefined || idx < 0 || idx >= gameState.wordChoices.length) {
      socket.emit('invalid-move', { message: 'Invalid word choice.' });
      return false;
    }
    gameState.currentWord = gameState.wordChoices[idx];
    gameState.wordHistory.push(gameState.currentWord);
    socket.emit('word-assigned', { word: gameState.currentWord });
    startDrawing(gameState);
    return true;
  }

  if (data.action === 'guess') {
    if (gameState.phase !== 'drawing' || !gameState.drawerReady) {
      socket.emit('invalid-move', { message: 'Not accepting guesses yet.' });
      return false;
    }
    if (player.player === gameState.currentDrawer) {
      socket.emit('invalid-move', { message: 'You cannot guess — you are drawing!' });
      return false;
    }
    const guess = (data.guess || '').trim().toLowerCase();
    if (!guess) {
      socket.emit('invalid-move', { message: 'Empty guess.' });
      return false;
    }
    if (gameState.guessesThisRound.includes(guess)) {
      socket.emit('invalid-move', { message: 'Already guessed that!' });
      return false;
    }
    gameState.guessesThisRound.push(guess);

    if (guess === gameState.currentWord.toLowerCase()) {
      gameState.phase = 'reveal';
      gameState.guessesThisRound = [];
      gameState.scores[player.player] = (gameState.scores[player.player] || 0) + 1;
      gameState.scores[gameState.currentDrawer] = (gameState.scores[gameState.currentDrawer] || 0) + 1;
      socket.emit('correct-guess', { player: player.player, name: player.name || `Player ${player.player}` });
      return true;
    }
    return true;
  }

  if (data.action === 'next-round') {
    if (player.player !== gameState.currentDrawer) {
      socket.emit('invalid-move', { message: 'Only the drawer can advance.' });
      return false;
    }
    if (gameState.roundNumber >= gameState.totalRounds) {
      endGame(gameState);
      return true;
    }
    gameState.currentDrawer = getNextDrawer(gameState.currentDrawer, gameState.players);
    prepareRound(gameState);
    return true;
  }

  socket.emit('invalid-move', { message: 'Unknown action.' });
  return false;
};
