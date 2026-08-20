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

const QWERTY_NEIGHBORS: Record<string, string[]> = {
  q: ['w', 'a', 's', '1', '2'],
  w: ['q', 'e', 'a', 's', 'd', '2', '3'],
  e: ['w', 'r', 's', 'd', 'f', '3', '4'],
  r: ['e', 't', 'd', 'f', 'g', '4', '5'],
  t: ['r', 'y', 'f', 'g', 'h', '5', '6'],
  y: ['t', 'u', 'g', 'h', 'j', '6', '7'],
  u: ['y', 'i', 'h', 'j', 'k', '7', '8'],
  i: ['u', 'o', 'j', 'k', 'l', '8', '9'],
  o: ['i', 'p', 'k', 'l', '9', '0'],
  p: ['o', 'l', '0'],
  a: ['q', 'w', 's', 'z'],
  s: ['a', 'w', 'e', 'd', 'x', 'z'],
  d: ['s', 'e', 'r', 'f', 'c', 'x'],
  f: ['d', 'r', 't', 'g', 'v', 'c'],
  g: ['f', 't', 'y', 'h', 'b', 'v'],
  h: ['g', 'y', 'u', 'j', 'n', 'b'],
  j: ['h', 'u', 'i', 'k', 'm', 'n'],
  k: ['j', 'i', 'o', 'l', 'm'],
  l: ['k', 'o', 'p'],
  z: ['a', 's', 'x'],
  x: ['z', 's', 'd', 'c'],
  c: ['x', 'd', 'f', 'v'],
  v: ['c', 'f', 'g', 'b'],
  b: ['v', 'g', 'h', 'n'],
  n: ['b', 'h', 'j', 'm'],
  m: ['n', 'j', 'k'],
};

export function isQwertyNeighbor(a: string, b: string): boolean {
  if (a === b) return true;
  return QWERTY_NEIGHBORS[a]?.includes(b) || false;
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

  // Short words (length <= 4) require exact match to prevent collisions (e.g. cat/fat, dog/fog)
  if (normTarget.length <= 4) return false;

  // First letter must match to prevent guessing different words (e.g. callback vs fallback)
  if (normSubmitted[0] !== normTarget[0]) return false;

  const lenDiff = Math.abs(normSubmitted.length - normTarget.length);
  const dist = levenshteinDistance(normSubmitted, normTarget);

  // Length 5-7: Allow 1 typo (missing/extra letter, adjacent swap, or substitution)
  if (normTarget.length >= 5 && normTarget.length <= 7 && lenDiff <= 1 && dist <= 1) {
    return true;
  }

  // Length >= 8: Allow up to 1 typo, or 2 typos for longer answers (length >= 10)
  if (normTarget.length >= 8 && lenDiff <= 2) {
    if (dist <= 1) return true;
    if (dist === 2 && normTarget.length >= 10) return true;
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
