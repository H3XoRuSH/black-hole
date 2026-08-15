export interface Player {
  id: string;
  player: number;
  ready: boolean;
  name?: string;
  isAI?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface CircleData {
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

type SpotItImageShape = 'circle' | 'diamond' | 'triangle' | 'square' | 'hexagon' | 'star' | 'burst' | 'ring' | 'cross' | 'leaf' | 'bolt' | 'wave' | `image-${number}` | string;

export interface SpotItImage {
  id: string;
  label: string;
  shape: SpotItImageShape;
  color: string;
  rotation: number;
}

export interface SpotItCard {
  id: string;
  imageIds: string[];
}

export interface SpotItGameState {
  phase: 'lobby' | 'playing' | 'game-over';
  activeCards: Record<number, SpotItCard>;
  centerCard: SpotItCard | null;
  /** The draw pile is server-only and must be removed before broadcasting. */
  drawPile: SpotItCard[];
  remainingCards: number;
  penaltyUntil: Record<number, number>;
  scores: Record<number, number>;
  winner: string;
  players: Player[];
  currentPlayer: number;
  totalMoves: number;
  lastClaim?: {
    player: number;
    imageId: string;
    cardId: string;
    timestamp: number;
  };
  moveHistory?: any[];
  recap?: string;
  recapLoading?: boolean;
}

interface RecapEntry {
  text: string;
  loading: boolean;
}

interface RecapChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatMessage {
  player: number;
  playerName: string;
  text: string;
  timestamp: number;
}

export interface Room {
  gameId: string;
  gameState: any;
  gameStarted?: boolean;
  recaps?: Map<number, RecapEntry>;
  recapConversations?: Map<number, RecapChatMessage[]>;
  chatMessages?: ChatMessage[];
}

export interface MenuGame {
  id: string;
  name: string;
  description: string;
  route: string;
  status: string;
  color: string;
  tags?: string[];
  icon?: string;
}

export interface TriviaQuestion {
  category: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
}

export interface TriviaOptions {
  categorySlug?: string;
  categoryName?: string;
  difficulty?: string;
  customTopic?: string;
  aiQuestions?: TriviaQuestion[];
  isGeneratingAi?: boolean;
  aiGenerationError?: string;
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
  roundsPerPlayer: number;
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

export interface SoundNote {
  pitch?: 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A4' | 'B4' | 'C5' | 'low' | 'medium' | 'high';
  dur: number;
  rest: boolean;
}

interface SoundPuzzle {
  type: 'rhythm' | 'melody' | 'pitch-sequence';
  notes: SoundNote[];
}

type EscapeRoomNodeType = 'dialogue' | 'puzzle' | 'item' | 'locked';

export interface EscapeRoomNode {
  id: string;
  locationId: string;
  parentId: string | null;
  type: EscapeRoomNodeType;
  label: string;
  narrative: string;
  question?: string;
  answer?: string;
  hints?: string[];
  hintsRevealed?: number;
  solved?: boolean;
  sound?: SoundPuzzle;
  key?: string;
  isMeta?: boolean;
  rewardItem?: string;
  lockedByItem?: string;
  lockedNarrative?: string;
  children?: string[];
}

export interface EscapeRoomLocation {
  id: string;
  name: string;
  description: string;
}

export interface EscapeRoomData {
  id: string;
  name: string;
  description: string;
  difficulty: 'very-easy' | 'easy' | 'medium' | 'hard' | 'extreme';
  intro: string;
  locations: EscapeRoomLocation[];
  nodes: EscapeRoomNode[];
}

export interface EscapeRoomGameState {
  phase: 'playing' | 'escaped';
  selectedRoomId: string | null;
  roomName?: string;
  roomDescription?: string;
  roomIntro?: string;
  availableRooms?: { id: string; name: string; description: string; difficulty: string }[];
  nodes: EscapeRoomNode[];
  locations: EscapeRoomLocation[];
  players: Player[];
  winner: string;
  totalMoves: number;
  wrongAttempts: number;
  hintsUsed: number;
  playerNodePaths: Record<string, string[]>;
  playerInventories: Record<string, string[]>;
  unlockedNodes: string[];
  visitedLocations: string[];
  discoveredItems: string[];
  attemptsPerNode: Record<string, number>;
  solvedNodes: string[];
  lastAction: { playerNumber: number; action: string } | null;
  moveHistory?: any[];
  introAcknowledged?: boolean;
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

export interface JigsawPiece {
  id: number;
  row: number;
  col: number;
  edges: {
    top: 'flat' | 'tab' | 'blank';
    right: 'flat' | 'tab' | 'blank';
    bottom: 'flat' | 'tab' | 'blank';
    left: 'flat' | 'tab' | 'blank';
  };
  placed: boolean;
  lockedBy: string | null;
  trayIndex: number;
  boardRow: number | null;
  boardCol: number | null;
}

export interface JigsawGameState {
  status: 'waiting' | 'playing' | 'finished';
  gridSize: 4 | 6 | 8;
  imageKey: string;
  pieces: JigsawPiece[];
  startTime: number | null;
  endTime: number | null;
  players: Player[];
  winner: string;
  totalMoves: number;
}

export interface SnakesLaddersGameState {
  boardType: 'classic' | 'random';
  gridSize: number;
  snakesCount: number;
  laddersCount: number;
  snakes: Record<number, number>;
  ladders: Record<number, number>;
  players: Player[];
  currentPlayer: number;
  positions: Record<number, number>;
  winner: string;
  totalMoves: number;
  lastRoll: number | null;
  lastRollWasSix: boolean;
  lastMove?: {
    player: number;
    from: number;
    to: number;
    finalTo: number;
    snakeOrLadder: 'snake' | 'ladder' | null;
  } | null;
  moveHistory?: any[];
  recap?: string;
  recapLoading?: boolean;
}
