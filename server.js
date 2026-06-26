import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Serve static files (Vue build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Generate a random 6-character room key
const generateRoomKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
};

// Store game states by room key
const rooms = new Map(); // roomKey -> { gameState, players }

// Helper functions
const getNeighbors = (row, col) => {
  const neighbors = [];
  if (col > 1) neighbors.push(`${row}-${col - 1}`);
  if (col < row) neighbors.push(`${row}-${col + 1}`);
  if (row > 1) {
    if (col <= row - 1) neighbors.push(`${row - 1}-${col}`);
    if (col > 1) neighbors.push(`${row - 1}-${col - 1}`);
  }
  if (row < 6) {
    neighbors.push(`${row + 1}-${col}`);
    if (col <= row) neighbors.push(`${row + 1}-${col + 1}`);
  }
  return neighbors.filter(pos => allPositions().includes(pos));
};

const allPositions = () => {
  const positions = [];
  for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= row; col++) {
      positions.push(`${row}-${col}`);
    }
  }
  return positions;
};

const calculateScores = (gameState) => {
  const taken = Object.keys(gameState.circles);
  const remaining = allPositions().filter(pos => !taken.includes(pos));
  if (remaining.length !== 1) {
    return { player1: 0, player2: 0 };
  }
  const blackCircle = remaining[0];
  const [blackRow, blackCol] = blackCircle.split('-').map(Number);
  const neighbors = getNeighbors(blackRow, blackCol);
  let player1Sum = 0, player2Sum = 0;
  neighbors.forEach(key => {
    const data = gameState.circles[key];
    if (data) {
      if (data.player === 1) player1Sum += data.turn;
      else if (data.player === 2) player2Sum += data.turn;
    }
  });
  return { player1: player1Sum, player2: player2Sum };
};

const getWinner = (gameState) => {
  if (gameState.totalMoves < gameState.maxTurnsPerPlayer * 2) return '';
  const { player1, player2 } = calculateScores(gameState);
  if (player1 < player2 || (player1 === 0 && player2 === 0)) {
    return 'Player 1 wins!';
  } else if (player2 < player1) {
    return 'Player 2 wins!';
  } else {
    return 'Tie game!';
  }
};

const checkConnectFourWinner = (board) => {
  const rows = 6;
  const cols = 7;
  // Check horizontal
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (p && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3]) {
        return p;
      }
    }
  }
  // Check vertical
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c]) {
        return p;
      }
    }
  }
  // Check positive diagonal (bottom-left to top-right)
  for (let r = 3; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (p && p === board[r - 1][c + 1] && p === board[r - 2][c + 2] && p === board[r - 3][c + 3]) {
        return p;
      }
    }
  }
  // Check negative diagonal (top-left to bottom-right)
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols - 3; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c + 1] && p === board[r + 2][c + 2] && p === board[r + 3][c + 3]) {
        return p;
      }
    }
  }
  return 0; // No winner
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Handle room creation
  socket.on('create-room', ({ gameId } = { gameId: 'black-hole' }) => {
    let roomKey = generateRoomKey();
    while (rooms.has(roomKey)) {
      roomKey = generateRoomKey(); // Ensure unique key
    }
    const initialGameState = gameId === 'connect-four' ? {
      board: Array(6).fill(null).map(() => Array(7).fill(null)),
      currentPlayer: 1,
      totalMoves: 0,
      winner: '',
      players: [{ id: socket.id, player: 1, ready: false }],
    } : {
      circles: {},
      currentPlayer: 1,
      totalMoves: 0,
      maxTurnsPerPlayer: 10,
      players: [{ id: socket.id, player: 1, ready: false }],
    };

    rooms.set(roomKey, {
      gameId,
      gameState: initialGameState,
    });
    socket.join(roomKey);
    socket.emit('waiting-for-player', { roomKey, player: 1, gameId });
    console.log(`Room created: ${roomKey}, Player 1: ${socket.id}, Game: ${gameId}`);
  });

  // Handle room joining
  socket.on('join-room', ({ roomKey, gameId }) => {
    if (!rooms.has(roomKey)) {
      socket.emit('room-error', { message: 'Room does not exist.' });
      return;
    }
    const room = rooms.get(roomKey);
    if (gameId && room.gameId !== gameId) {
      socket.emit('room-error', { message: 'This room is for a different game.' });
      return;
    }
    if (room.gameState.players.length >= 2) {
      socket.emit('room-error', { message: 'Room is full.' });
      return;
    }
    room.gameState.players.push({ id: socket.id, player: 2, ready: false });
    socket.join(roomKey);
    // Notify both players to start the game
    room.gameState.players.forEach(player => {
      io.to(player.id).emit('room-started', { roomKey, player: player.player, gameId: room.gameId, gameState: room.gameState });
    });
  });

  // Handle player move
  socket.on('make-move', (data) => {
    const { roomKey } = data;
    if (!rooms.has(roomKey)) {
      socket.emit('invalid-move', { message: 'Room does not exist.' });
      return;
    }
    const room = rooms.get(roomKey);
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (!player || player.player !== room.gameState.currentPlayer) {
      socket.emit('invalid-move', { message: 'Not your turn.' });
      return;
    }

    if (room.gameId === 'connect-four') {
      const { col } = data;
      if (col < 0 || col > 6 || room.gameState.winner) {
        socket.emit('invalid-move', { message: 'Invalid move or game is over.' });
        return;
      }
      // Find lowest available row in this column
      let rowToPlace = -1;
      for (let r = 5; r >= 0; r--) {
        if (room.gameState.board[r][col] === null) {
          rowToPlace = r;
          break;
        }
      }
      if (rowToPlace === -1) {
        socket.emit('invalid-move', { message: 'Column is full.' });
        return;
      }
      // Place piece
      room.gameState.board[rowToPlace][col] = room.gameState.currentPlayer;
      room.gameState.totalMoves++;
      
      // Check winner
      const winnerPlayer = checkConnectFourWinner(room.gameState.board);
      if (winnerPlayer) {
        room.gameState.winner = `Player ${winnerPlayer} wins!`;
      } else if (room.gameState.totalMoves >= 42) {
        room.gameState.winner = 'Tie game!';
      }
      
      // Switch player
      room.gameState.currentPlayer = room.gameState.currentPlayer === 1 ? 2 : 1;
      room.gameState.players.forEach(p => (p.ready = false));
      io.to(roomKey).emit('game-state', room.gameState);
    } else {
      const { row, col } = data;
      if (room.gameState.totalMoves >= room.gameState.maxTurnsPerPlayer * 2) {
        socket.emit('invalid-move', { message: 'Game is over.' });
        return;
      }
      const key = `${row}-${col}`;
      if (room.gameState.circles[key]) {
        socket.emit('invalid-move', { message: 'Circle already taken.' });
        return;
      }

      const playerTurnNumber = Math.floor(room.gameState.totalMoves / 2) + 1;
      room.gameState.circles[key] = { player: room.gameState.currentPlayer, turn: playerTurnNumber };
      room.gameState.totalMoves++;
      room.gameState.currentPlayer = room.gameState.currentPlayer === 1 ? 2 : 1;

      // Reset ready flags when a move is made
      room.gameState.players.forEach(p => (p.ready = false));

      const scores = calculateScores(room.gameState);
      const winner = getWinner(room.gameState);
      io.to(roomKey).emit('game-state', { ...room.gameState, scores, winner });
    }
  });

  // Handle new game request
  socket.on('new-game', ({ roomKey }) => {
    if (!rooms.has(roomKey)) {
      socket.emit('room-error', { message: 'Room does not exist.' });
      return;
    }
    const room = rooms.get(roomKey);
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit('room-error', { message: 'You are not in this room.' });
      return;
    }

    player.ready = true;
    io.to(roomKey).emit('player-ready', { player: player.player });

    // Check if both players are ready
    const allReady = room.gameState.players.every(p => p.ready);
    if (allReady && room.gameState.players.length === 2) {
      if (room.gameId === 'connect-four') {
        room.gameState = {
          board: Array(6).fill(null).map(() => Array(7).fill(null)),
          currentPlayer: 1,
          totalMoves: 0,
          winner: '',
          players: room.gameState.players.map(p => ({ ...p, ready: false })),
        };
        io.to(roomKey).emit('game-state', room.gameState);
      } else {
        room.gameState = {
          circles: {},
          currentPlayer: 1,
          totalMoves: 0,
          maxTurnsPerPlayer: 10,
          players: room.gameState.players.map(p => ({ ...p, ready: false })), // Reset ready flags
        };
        io.to(roomKey).emit('game-state', { ...room.gameState, scores: { player1: 0, player2: 0 }, winner: '' });
      }
    }
  });

  // Handle leaving the room explicitly (component navigation)
  socket.on('leave-room', ({ roomKey }) => {
    if (rooms.has(roomKey)) {
      const room = rooms.get(roomKey);
      const playerIndex = room.gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        socket.to(roomKey).emit('player-disconnected', { message: 'A player has left the game. Returning to lobby.', gameId: room.gameId });
        socket.leave(roomKey);
        rooms.delete(roomKey);
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    for (const [roomKey, room] of rooms) {
      const playerIndex = room.gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        // Notify all clients (including disconnecting client) and delete the room
        io.in(roomKey).emit('player-disconnected', { message: 'A player has disconnected. Returning to lobby.', gameId: room.gameId });
        rooms.delete(roomKey);
        break;
      }
    }
  });
});

// Serve the Vue app for all unmatched routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});