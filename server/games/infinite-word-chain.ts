import type { Player, InfiniteWordChainGameState } from '../../src/types/shared.js';
import { generateCompoundPairs } from '../services/wordChainService.js';

export type { InfiniteWordChainGameState };

export const noTurns = true;

const BATCH_SIZE = 30;

function isHiddenChar(ch: string): boolean {
  return /[a-zA-Z0-9]/.test(ch);
}

function generateInitialDisplay(answer: string): string {
  return answer.split('').map((ch, i) => (i === 0 || !isHiddenChar(ch) ? ch : '_')).join('');
}

export const createInitialState = (playerId: string): InfiniteWordChainGameState => {
  return {
    pairs: [],
    currentPairIndex: 0,
    phase: 'playing',
    currentWord: '',
    answerWord: '',
    answerDisplay: '',
    totalLetters: 0,
    revealIndex: 0,
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
    currentPlayer: 1,
    totalMoves: 0,
    score: 0,
    mistakes: 0,
  };
};

export const resetState = (players: Player[]): InfiniteWordChainGameState => {
  return {
    pairs: [],
    currentPairIndex: 0,
    phase: 'playing',
    currentWord: '',
    answerWord: '',
    answerDisplay: '',
    totalLetters: 0,
    revealIndex: 0,
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
    currentPlayer: 1,
    totalMoves: 0,
    score: 0,
    mistakes: 0,
  };
};

function setupCurrentPair(gameState: InfiniteWordChainGameState): void {
  const pair = gameState.pairs[gameState.currentPairIndex];
  if (!pair) {
    gameState.phase = 'game-over';
    gameState.winner = `Final Score: ${gameState.score}`;
    return;
  }
  gameState.currentWord = pair[0];
  gameState.answerWord = pair[1];
  gameState.answerDisplay = generateInitialDisplay(pair[1]);
  gameState.totalLetters = pair[1].length;
  gameState.revealIndex = 0;
}

async function advanceToNextPair(gameState: InfiniteWordChainGameState): Promise<void> {
  gameState.currentPairIndex++;
  gameState.score++;

  if (gameState.currentPairIndex >= gameState.pairs.length) {
    const lastWord = gameState.pairs.length > 0
      ? gameState.pairs[gameState.pairs.length - 1][1]
      : undefined;
    try {
      const newPairs = await generateCompoundPairs(BATCH_SIZE, lastWord);
      gameState.pairs.push(...newPairs);
    } catch {
      gameState.phase = 'game-over';
      gameState.winner = `Final Score: ${gameState.score}`;
      return;
    }
  }

  setupCurrentPair(gameState);
}

export const onGameStart = async (room: any): Promise<void> => {
  const gameState = room.gameState as InfiniteWordChainGameState;
  const pairs = await generateCompoundPairs(BATCH_SIZE);
  gameState.pairs = pairs;
  gameState.currentPairIndex = 0;
  setupCurrentPair(gameState);
};

export const makeMove = async (
  room: any,
  socket: any,
  data: { action: string; guess?: string }
): Promise<boolean> => {
  const gameState = room.gameState as InfiniteWordChainGameState;

  if (gameState.phase === 'game-over') {
    socket.emit('invalid-move', { message: 'Game is over.' });
    return false;
  }

  if (data.action === 'submit-guess') {
    const guess = (data.guess || '').trim().toLowerCase();
    if (!guess || !/^[a-z]+$/.test(guess)) {
      socket.emit('invalid-move', { message: 'Please enter a valid single word (letters only).' });
      return false;
    }

    gameState.totalMoves++;

    if (guess === gameState.answerWord) {
      await advanceToNextPair(gameState);
      return true;
    }

    const answer = gameState.answerWord;
    const currentDisplay = gameState.answerDisplay.split('');
    let firstHidden = -1;
    for (let i = 1; i < answer.length; i++) {
      if (currentDisplay[i] === '_') {
        firstHidden = i;
        break;
      }
    }

    if (firstHidden !== -1) {
      currentDisplay[firstHidden] = answer[firstHidden];
    }

    gameState.answerDisplay = currentDisplay.join('');
    gameState.revealIndex++;
    gameState.mistakes++;
    return true;
  }

  if (data.action === 'finish') {
    gameState.phase = 'game-over';
    gameState.winner = `Final Score: ${gameState.score}`;
    return true;
  }

  socket.emit('invalid-move', { message: 'Unknown action.' });
  return false;
};
