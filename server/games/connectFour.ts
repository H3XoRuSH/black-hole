import type { Player, Room } from '../../src/types/shared.js';

export interface ConnectFourGameState {
  board: (number | null)[][];
  currentPlayer: number;
  totalMoves: number;
  winner: string;
  players: Player[];
  lastMove?: { row: number; col: number };
}

export const checkConnectFourWinner = (board: (number | null)[][]): number => {
  const rows = 6;
  const cols = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (
        p
        && p === board[r][c + 1]
        && p === board[r][c + 2]
        && p === board[r][c + 3]
      ) {
        return p;
      }
    }
  }
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols; c++) {
      const p = board[r][c];
      if (
        p
        && p === board[r + 1][c]
        && p === board[r + 2][c]
        && p === board[r + 3][c]
      ) {
        return p;
      }
    }
  }
  for (let r = 3; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (
        p
        && p === board[r - 1][c + 1]
        && p === board[r - 2][c + 2]
        && p === board[r - 3][c + 3]
      ) {
        return p;
      }
    }
  }
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (
        p
        && p === board[r + 1][c + 1]
        && p === board[r + 2][c + 2]
        && p === board[r + 3][c + 3]
      ) {
        return p;
      }
    }
  }
  return 0;
};

export const createInitialState = (playerId: string): ConnectFourGameState => {
  return {
    board: Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
    currentPlayer: 1,
    totalMoves: 0,
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
  };
};

export const resetState = (players: Player[]): ConnectFourGameState => {
  return {
    board: Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
    currentPlayer: 1,
    totalMoves: 0,
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
  };
};

export const makeMove = (
  room: Room,
  socket: any,
  data: { col: number }
): boolean => {
  const { col } = data;
  const gameState = room.gameState as ConnectFourGameState;
  if (col < 0 || col > 6 || gameState.winner) {
    socket.emit('invalid-move', { message: 'Invalid move or game is over.' });
    return false;
  }
  let rowToPlace = -1;
  for (let r = 5; r >= 0; r--) {
    if (gameState.board[r][col] === null) {
      rowToPlace = r;
      break;
    }
  }
  if (rowToPlace === -1) {
    socket.emit('invalid-move', { message: 'Column is full.' });
    return false;
  }
  gameState.board[rowToPlace][col] = gameState.currentPlayer;
  gameState.lastMove = { row: rowToPlace, col };
  gameState.totalMoves++;

  const winnerPlayer = checkConnectFourWinner(gameState.board);
  if (winnerPlayer) {
    gameState.winner = `Player ${winnerPlayer} wins!`;
  } else if (gameState.totalMoves >= 42) {
    gameState.winner = 'Tie game!';
  }

  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  gameState.players.forEach((p) => (p.ready = false));
  return true;
};
