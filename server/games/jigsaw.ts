import type { Player, Room } from '../../src/types/shared.js';
import type { Socket } from 'socket.io';
import type { JigsawGameState, JigsawPiece } from '../../src/types/shared.js';

const CURATED_IMAGES = [
  'fantasy-castle',
  'ocean-reef',
  'space-galaxy',
  'autumn-village',
  'tropical-jungle',
  'retro-arcade',
];

type EdgeType = 'flat' | 'tab' | 'blank';

function generatePieces(gridSize: number): JigsawPiece[] {
  // horizontal inner edges: hEdges[r][c] = edge between row r and r+1
  const hEdges: EdgeType[][] = [];
  for (let r = 0; r < gridSize - 1; r++) {
    hEdges[r] = [];
    for (let c = 0; c < gridSize; c++) {
      hEdges[r][c] = Math.random() < 0.5 ? 'tab' : 'blank';
    }
  }
  // vertical inner edges: vEdges[r][c] = edge between col c and c+1
  const vEdges: EdgeType[][] = [];
  for (let r = 0; r < gridSize; r++) {
    vEdges[r] = [];
    for (let c = 0; c < gridSize - 1; c++) {
      vEdges[r][c] = Math.random() < 0.5 ? 'tab' : 'blank';
    }
  }

  const pieces: JigsawPiece[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const id = r * gridSize + c;

      // top: piece above has bottom of opposite type
      const top: EdgeType = r === 0 ? 'flat' : hEdges[r - 1][c];
      // bottom: opposite of the inner edge below this piece
      const bottom: EdgeType = r === gridSize - 1 ? 'flat' : (hEdges[r][c] === 'tab' ? 'blank' : 'tab');
      // left: piece to the left has right of opposite type
      const left: EdgeType = c === 0 ? 'flat' : vEdges[r][c - 1];
      // right: opposite of inner edge to the right
      const right: EdgeType = c === gridSize - 1 ? 'flat' : (vEdges[r][c] === 'tab' ? 'blank' : 'tab');

      pieces.push({
        id,
        row: r,
        col: c,
        edges: { top, right, bottom, left },
        placed: false,
        lockedBy: null,
        trayIndex: id,
        boardRow: null,
        boardCol: null,
      });
    }
  }

  // Shuffle tray indices
  const order = pieces.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  order.forEach((pieceIdx, trayPos) => {
    pieces[pieceIdx].trayIndex = trayPos;
  });

  return pieces;
}

function pickRandomImage(): string {
  return CURATED_IMAGES[Math.floor(Math.random() * CURATED_IMAGES.length)];
}

export const createInitialState = (playerId: string): JigsawGameState => ({
  status: 'waiting',
  gridSize: 4,
  imageKey: pickRandomImage(),
  pieces: generatePieces(4),
  startTime: null,
  endTime: null,
  players: [{ id: playerId, player: 1, ready: false }],
  winner: '',
  totalMoves: 0,
});

export const resetState = (players: Player[]): JigsawGameState => ({
  status: 'waiting',
  gridSize: 4,
  imageKey: pickRandomImage(),
  pieces: generatePieces(4),
  startTime: null,
  endTime: null,
  players: players.map((p) => ({ ...p, ready: false })),
  winner: '',
  totalMoves: 0,
});

export const onGameStart = (room: Room): void => {
  const state: JigsawGameState = room.gameState;
  state.status = 'playing';
};

export const setGridSize = (room: Room, gridSize: 4 | 6 | 8): void => {
  const state: JigsawGameState = room.gameState;
  state.gridSize = gridSize;
  state.pieces = generatePieces(gridSize);
  state.imageKey = pickRandomImage();
};

export const makeMove = (room: Room, socket: Socket, data: any): boolean => {
  const state: JigsawGameState = room.gameState;
  if (state.status === 'finished') return false;

  const { action, pieceId, row, col } = data;
  const piece = state.pieces.find((p) => p.id === pieceId);
  if (!piece) return false;

  if (action === 'pickup') {
    if (piece.lockedBy || piece.placed) return false;
    piece.lockedBy = socket.id;
    // When picked up, it is temporarily lifted off the board
    piece.boardRow = null;
    piece.boardCol = null;
    if (!state.startTime) state.startTime = Date.now();
    return true;
  }

  if (action === 'cancel') {
    if (piece.lockedBy !== socket.id) return false;
    piece.lockedBy = null;
    piece.boardRow = null;
    piece.boardCol = null;
    return true;
  }

  if (action === 'drop') {
    if (piece.lockedBy !== socket.id) return false;
    piece.lockedBy = null;

    // Check if dropping on the grid
    if (row != null && col != null) {
      // Validate grid bounds
      if (row >= 0 && row < state.gridSize && col >= 0 && col < state.gridSize) {
        // Check if target slot is already occupied by a placed piece
        const isOccupied = state.pieces.some(
          (p) => p.boardRow === row && p.boardCol === col && p.id !== pieceId
        );
        if (!isOccupied) {
          piece.boardRow = row;
          piece.boardCol = col;
          // Only snap/lock if it is in the exact right cell
          if (row === piece.row && col === piece.col) {
            piece.placed = true;
          } else {
            piece.placed = false;
          }
          state.totalMoves++;

          const allPlaced = state.pieces.every((p) => p.placed);
          if (allPlaced) {
            state.endTime = Date.now();
            state.status = 'finished';
            state.winner = 'cooperative';
          }
          return true;
        }
      }
    }

    // Otherwise it returns to the tray
    piece.boardRow = null;
    piece.boardCol = null;
    return true;
  }

  return false;
};
