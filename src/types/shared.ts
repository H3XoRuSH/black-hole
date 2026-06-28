export interface Player {
  id: string;
  player: number;
  ready: boolean;
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

export interface Room {
  gameId: string;
  gameState: any;
  gameStarted?: boolean;
  recaps?: Map<number, RecapEntry>;
}

export interface MenuGame {
  id: string;
  name: string;
  description: string;
  route: string;
  status: string;
  color: string;
}
