import type { Player, Room, TriviaGameState, TriviaQuestion } from '../../src/types/shared.js';
import { fetchQuestions } from '../services/triviaService.js';

export type { TriviaGameState };

export const noTurns = true;

function isHiddenChar(ch: string): boolean {
  return /[a-zA-Z0-9]/.test(ch);
}

function generateInitialAnswerDisplay(answer: string): string {
  return answer.split('').map((ch) => (isHiddenChar(ch) ? '_' : ch)).join('');
}

function countHiddenChars(answer: string): number {
  return answer.split('').filter((ch) => isHiddenChar(ch)).length;
}

export const createInitialState = (playerId: string): TriviaGameState => {
  return {
    questions: [],
    currentQuestionIndex: 0,
    phase: 'lobby',
    scores: {},
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
    currentPlayer: 1,
    totalMoves: 0,
    answerDisplay: '',
    totalLetters: 0,
    revealIndex: 0,
    solvedBy: null,
    triviaOptions: {},
  };
};

export const resetState = (players: Player[]): TriviaGameState => {
  return {
    questions: [],
    currentQuestionIndex: 0,
    phase: 'lobby',
    scores: {},
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
    currentPlayer: 1,
    totalMoves: 0,
    answerDisplay: '',
    totalLetters: 0,
    revealIndex: 0,
    solvedBy: null,
    triviaOptions: {},
  };
};

export const onGameStart = async (room: Room): Promise<void> => {
  const gameState = room.gameState as TriviaGameState;
  let questions: TriviaQuestion[] = [];

  if (gameState.triviaOptions?.aiQuestions && gameState.triviaOptions.aiQuestions.length > 0) {
    questions = gameState.triviaOptions.aiQuestions;
  } else {
    questions = await fetchQuestions(10, gameState.triviaOptions);
  }

  gameState.questions = questions;
  gameState.currentQuestionIndex = 0;
  gameState.players.forEach((p: any) => {
    gameState.scores[p.player] = 0;
  });
  const answer = questions[0].correctAnswer;
  gameState.answerDisplay = generateInitialAnswerDisplay(answer);
  gameState.totalLetters = countHiddenChars(answer);
  gameState.revealIndex = 0;
  gameState.solvedBy = null;
  gameState.phase = 'question-intro';
};

export const prepareNextQuestion = (room: Room): void => {
  const gameState = room.gameState as TriviaGameState;
  gameState.currentQuestionIndex++;
  if (gameState.currentQuestionIndex >= gameState.questions.length) return;
  const answer = gameState.questions[gameState.currentQuestionIndex].correctAnswer;
  gameState.answerDisplay = generateInitialAnswerDisplay(answer);
  gameState.totalLetters = countHiddenChars(answer);
  gameState.revealIndex = 0;
  gameState.solvedBy = null;
  gameState.phase = 'question-intro';
};

export function normalizeAnswer(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function isAnswerMatch(submittedText: string, targetAnswer: string): boolean {
  const normSubmitted = normalizeAnswer(submittedText);
  const normTarget = normalizeAnswer(targetAnswer);

  if (!normSubmitted || !normTarget) return false;
  if (normSubmitted === normTarget) return true;

  // Typo tolerance (Levenshtein distance <= 1) for target answers with length >= 5
  if (normTarget.length >= 5 && levenshteinDistance(normSubmitted, normTarget) <= 1) {
    return true;
  }

  return false;
}

export function checkTriviaAnswer(submitted: string, question: TriviaQuestion): boolean {
  if (isAnswerMatch(submitted, question.correctAnswer)) {
    return true;
  }
  if (question.acceptableAnswers && Array.isArray(question.acceptableAnswers)) {
    return question.acceptableAnswers.some((alias) => isAnswerMatch(submitted, alias));
  }
  return false;
}

export const makeMove = (
  room: Room,
  socket: any,
  data: { action: string; answer?: string }
): boolean => {
  const gameState = room.gameState as TriviaGameState;
  const player = gameState.players.find((p: any) => p.id === socket.id);
  if (!player) {
    socket.emit('invalid-move', { message: 'You are not in this game.' });
    return false;
  }

  if (gameState.phase === 'game-over') {
    socket.emit('invalid-move', { message: 'Game is over.' });
    return false;
  }

  if (data.action === 'submit-answer') {
    if (gameState.phase !== 'revealing' && gameState.phase !== 'question-intro') {
      socket.emit('invalid-move', { message: 'Not accepting answers right now.' });
      return false;
    }
    if (gameState.solvedBy !== null) {
      socket.emit('invalid-move', { message: 'Already answered!' });
      return false;
    }
    const currentQ = gameState.questions[gameState.currentQuestionIndex];
    if (!currentQ) {
      socket.emit('invalid-move', { message: 'No active question.' });
      return false;
    }
    const submitted = data.answer || '';
    if (checkTriviaAnswer(submitted, currentQ)) {
      gameState.solvedBy = player.player;
      gameState.scores[player.player] = (gameState.scores[player.player] || 0) + 1;
      gameState.phase = 'solved';
      gameState.answerDisplay = currentQ.correctAnswer;
      return true;
    } else {
      socket.emit('invalid-move', { message: 'Wrong answer!' });
      return false;
    }
  }

  socket.emit('invalid-move', { message: 'Unknown action.' });
  return false;
};
