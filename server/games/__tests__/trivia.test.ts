import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  createInitialState,
  resetState,
  onGameStart,
  prepareNextQuestion,
  makeMove,
} from '../trivia.js';
import type { TriviaGameState, TriviaQuestion } from '../../../src/types/shared.js';
import { createRoom, createSocketMock } from './helpers.js';
import { validateAndCleanQuestions } from '../../services/triviaService.js';

vi.mock('../../services/triviaService.js', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    fetchQuestions: vi.fn(async () => [
      { category: 'g', difficulty: 'easy', question: 'Q1', correctAnswer: 'apple' },
      { category: 'g', difficulty: 'easy', question: 'Q2', correctAnswer: 'banana' },
    ]),
  };
});

const stateWithPlayers = (overrides: Partial<TriviaGameState> = {}): TriviaGameState => ({
  questions: [
    { category: 'g', difficulty: 'easy', question: 'Q1', correctAnswer: 'apple' },
    { category: 'g', difficulty: 'easy', question: 'Q2', correctAnswer: 'banana' },
  ] as TriviaQuestion[],
  currentQuestionIndex: 0,
  phase: 'question-intro',
  scores: { 1: 0, 2: 0 },
  winner: '',
  players: [
    { id: 'p1', player: 1, ready: false, name: 'Alice' },
    { id: 'p2', player: 2, ready: false, name: 'Bob' },
  ],
  currentPlayer: 1,
  totalMoves: 0,
  answerDisplay: '_____',
  totalLetters: 5,
  revealIndex: 0,
  solvedBy: null,
  triviaOptions: {},
  ...overrides,
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('createInitialState / resetState / onGameStart', () => {
  it('creates a lobby state', () => {
    const state = createInitialState('p1');
    expect(state.phase).toBe('lobby');
    expect(state.questions).toEqual([]);
  });

  it('resetState keeps players', () => {
    const state = resetState([
      { id: 'p1', player: 1, ready: true },
      { id: 'p2', player: 2, ready: true },
    ]);
    expect(state.players).toHaveLength(2);
    expect(state.scores).toEqual({});
  });

  it('onGameStart fetches questions and prepares the first one', async () => {
    const state = stateWithPlayers();
    const room = createRoom('trivia', state);
    await onGameStart(room);
    expect(state.questions).toHaveLength(2);
    expect(state.scores).toEqual({ 1: 0, 2: 0 });
    expect(state.phase).toBe('question-intro');
    expect(state.answerDisplay).toBe('_____');
    expect(state.totalLetters).toBe(5);
  });

  it('onGameStart uses pre-generated aiQuestions when present', async () => {
    const aiQs = [
      { category: 'AI Custom', difficulty: 'medium', question: 'What is 2+2?', correctAnswer: 'four' },
    ];
    const state = stateWithPlayers({
      triviaOptions: { aiQuestions: aiQs as any, customTopic: 'Math' },
    });
    const room = createRoom('trivia', state);
    await onGameStart(room);
    expect(state.questions).toEqual(aiQs);
    expect(state.answerDisplay).toBe('____');
  });
});

describe('prepareNextQuestion', () => {
  it('advances to the next question', () => {
    const state = stateWithPlayers();
    const room = createRoom('trivia', state);
    prepareNextQuestion(room);
    expect(state.currentQuestionIndex).toBe(1);
    expect(state.answerDisplay).toBe('______');
    expect(state.solvedBy).toBeNull();
  });

  it('does nothing past the last question', () => {
    const state = stateWithPlayers({ currentQuestionIndex: 1 });
    const room = createRoom('trivia', state);
    prepareNextQuestion(room);
    expect(state.currentQuestionIndex).toBe(2);
  });
});

describe('makeMove - submit-answer', () => {
  it('awards a point for the correct answer', () => {
    const state = stateWithPlayers();
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'APPLE' })).toBe(true);
    expect(state.solvedBy).toBe(1);
    expect(state.scores[1]).toBe(1);
    expect(state.phase).toBe('solved');
    expect(state.answerDisplay).toBe('apple');
  });

  it('rejects a wrong answer', () => {
    const state = stateWithPlayers();
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'pear' })).toBe(false);
    expect(socket.emitted).toContainEqual(expect.objectContaining({ event: 'invalid-move' }));
  });

  it('rejects a second answer once solved', () => {
    const state = stateWithPlayers({ solvedBy: 1, phase: 'solved' });
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p2');
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'apple' })).toBe(false);
  });

  it('rejects answers outside the answering phases', () => {
    const state = stateWithPlayers({ phase: 'lobby' });
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'apple' })).toBe(false);
  });

  it('accepts answers with leading articles and punctuation stripped', () => {
    const state = stateWithPlayers({
      questions: [
        { category: 'Music', difficulty: 'easy', question: 'Who sang Yesterday?', correctAnswer: 'The Beatles' },
      ],
    });
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'beatles!' })).toBe(true);
    expect(state.solvedBy).toBe(1);
    expect(state.answerDisplay).toBe('The Beatles');
  });

  it('accepts answers matching acceptableAnswers alias', () => {
    const state = stateWithPlayers({
      questions: [
        {
          category: 'Art',
          difficulty: 'medium',
          question: 'Who painted Mona Lisa?',
          correctAnswer: 'Leonardo da Vinci',
          acceptableAnswers: ['da Vinci', 'Leonardo'],
        },
      ],
    });
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'da vinci' })).toBe(true);
    expect(state.solvedBy).toBe(1);
    expect(state.answerDisplay).toBe('Leonardo da Vinci');
  });

  it('tolerates single-character typos on answers of 5 or more characters', () => {
    const state = stateWithPlayers({
      questions: [
        { category: 'Science', difficulty: 'hard', question: 'Powerhouse of the cell?', correctAnswer: 'Mitochondria' },
      ],
    });
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p1');
    // "Mitochondra" has distance 1 from "Mitochondria"
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'mitochondra' })).toBe(true);
    expect(state.solvedBy).toBe(1);
  });

  it('rejects different words differing by 1 first letter (e.g. callback vs fallback)', () => {
    const state = stateWithPlayers({
      questions: [
        { category: 'Programming', difficulty: 'medium', question: 'Function passed as an argument?', correctAnswer: 'callback' },
      ],
    });
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'fallback' })).toBe(false);
    expect(state.solvedBy).toBeNull();
  });

  it('requires exact match for short words of length 4 or less', () => {
    const state = stateWithPlayers({
      questions: [
        { category: 'Animals', difficulty: 'easy', question: 'Feline pet?', correctAnswer: 'cat' },
      ],
    });
    const room = createRoom('trivia', state);
    const socket = createSocketMock('p1');
    expect(makeMove(room, socket, { action: 'submit-answer', answer: 'fat' })).toBe(false);
    expect(state.solvedBy).toBeNull();
  });
});

describe('validateAndCleanQuestions anti-leak and deduplication', () => {
  it('filters out questions that leak the answer in the question string', () => {
    const raw = [
      { question: 'What term refers to the tradition of merienda?', correctAnswer: 'merienda', difficulty: 'easy' },
      { question: 'What afternoon snack is popular in the Philippines?', correctAnswer: 'Merienda', difficulty: 'easy' },
      { question: 'What is the capital city?', correctAnswer: 'Manila', difficulty: 'easy' },
      { question: 'What is the national flower?', correctAnswer: 'Sampaguita', difficulty: 'easy' },
      { question: 'What dish features pork stewed in vinegar?', correctAnswer: 'Adobo', difficulty: 'easy' },
      { question: 'What currency is used?', correctAnswer: 'Peso', difficulty: 'easy' },
    ];
    const cleaned = validateAndCleanQuestions(raw, 'Philippines');
    expect(cleaned).toHaveLength(5);
    expect(cleaned.some((q) => q.question.includes('tradition of merienda'))).toBe(false);
  });

  it('filters out questions with stem leaks (e.g. filtering vs filter)', () => {
    const raw = [
      { question: 'What JS function is used for filtering arrays?', correctAnswer: 'filter', difficulty: 'easy' },
      { question: 'Which Array method creates a new array with elements that pass a test?', correctAnswer: 'filter', difficulty: 'easy' },
    ];
    const cleaned = validateAndCleanQuestions(raw, 'JavaScript');
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].question).toContain('Which Array method creates a new array');
  });

  it('filters duplicates against existing questions and cleans acceptableAnswers', () => {
    const existing: TriviaQuestion[] = [
      { category: 'Anime', difficulty: 'easy', question: 'Who is Goku?', correctAnswer: 'Saiyan' },
    ];
    const raw = [
      { question: 'Who is Goku?', correctAnswer: 'Saiyan' },
      { question: 'What is Luffy searching for?', correctAnswer: 'One Piece', acceptableAnswers: ['The One Piece', 'One Piece'] },
    ];
    const cleaned = validateAndCleanQuestions(raw, 'Anime', existing);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].question).toBe('What is Luffy searching for?');
    expect(cleaned[0].acceptableAnswers).toEqual(['The One Piece']);
  });
});
