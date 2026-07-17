export interface Player {
  id: string;
  player: number;
  ready: boolean;
  name?: string;
  isAI?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CircleData {
  player: number;
  turn: number;
}

export interface BlackHoleGameState {
  circles: Record<string, CircleData>;
  currentPlayer: number;
  totalMoves: number;
  maxTurnsPerPlayer: number;
  players: Player[];
  scores: { player1: number; player2: number };
  winner: string;
  moveHistory?: any[];
  recap?: string;
  recapLoading?: boolean;
  lastMove?: { row: number; col: number };
}

export interface ConnectFourGameState {
  board: (number | null)[][];
  currentPlayer: number;
  totalMoves: number;
  players: Player[];
  winner: string;
  moveHistory?: any[];
  recap?: string;
  recapLoading?: boolean;
  lastMove?: { row: number; col: number };
}

export interface DotsAndBoxesGameState {
  lines: Record<string, number>;
  boxes: Record<string, number>;
  scores: { player1: number; player2: number };
  currentPlayer: number;
  totalMoves: number;
  players: Player[];
  winner: string;
  moveHistory?: any[];
  recap?: string;
  recapLoading?: boolean;
  lastMove?: { lineKey: string };
}

export interface Ship {
  name: string;
  size: number;
  coordinates: [number, number][];
}

export interface BattleshipGameState {
  phase: 'placement' | 'playing' | 'game-over';
  currentPlayer: number;
  winner: string;
  players: Player[];
  p1Placed: boolean;
  p2Placed: boolean;
  p1Ships: Ship[];
  p2Ships: Ship[];
  p1Shots: [number, number][];
  p2Shots: [number, number][];
  lastShotResult: {
    player: number;
    row: number;
    col: number;
    hit: boolean;
    sunkShipName: string | null;
  } | null;
  moveHistory?: any[];
  recap?: string;
  recapLoading?: boolean;
}

export interface BingoGameState {
  cards: Record<number, number[][]>;
  daubed: Record<number, string[]>;
  drawnNumbers: number[];
  phase: string;
  winner: string;
  players: Player[];
  currentPlayer: number;
  totalMoves: number;
  moveHistory?: any[];
}

export interface CheckersGameState {
  board: number[][];
  currentPlayer: number;
  winner: string;
  players: Player[];
  totalMoves: number;
  mustCapturePos: string | null;
  moveHistory?: any[];
  lastMoveFrom?: string;
  lastMoveTo?: string;
}

export interface RecapEntry {
  text: string;
  loading: boolean;
}

export interface RecapChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Room {
  gameId: string;
  gameState: any;
  gameStarted?: boolean;
  recaps?: Map<number, RecapEntry>;
  recapConversations?: Map<number, RecapChatMessage[]>;
}

export interface MenuGame {
  id: string;
  name: string;
  description: string;
  route: string;
  status: string;
  color: string;
  supportsAI?: boolean;
  singlePlayer?: boolean;
  icon?: string;
}

export interface TriviaQuestion {
  category: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
}

export interface TriviaOptions {
  categorySlug?: string;
  categoryName?: string;
  difficulty?: string;
}

export interface TriviaGameState {
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  phase: 'lobby' | 'question-intro' | 'revealing' | 'solved' | 'game-over';
  scores: Record<number, number>;
  winner: string;
  players: Player[];
  currentPlayer: number;
  totalMoves: number;
  answerDisplay: string;
  totalLetters: number;
  revealIndex: number;
  solvedBy: number | null;
  triviaOptions: TriviaOptions;
  moveHistory?: any[];
}

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
  moveHistory?: any[];
}

export interface InfiniteWordChainGameState {
  pairs: [string, string][];
  currentPairIndex: number;
  phase: 'playing' | 'game-over';
  currentWord: string;
  answerWord: string;
  answerDisplay: string;
  totalLetters: number;
  revealIndex: number;
  winner: string;
  players: Player[];
  currentPlayer: number;
  totalMoves: number;
  score: number;
  mistakes: number;
  moveHistory?: any[];
}
