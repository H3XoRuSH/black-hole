import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import * as blackHole from './server/games/blackHole.js';
import * as connectFour from './server/games/connectFour.js';
import * as dotsAndBoxes from './server/games/dotsAndBoxes.js';

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Handle room creation
  socket.on('create-room', ({ gameId } = { gameId: 'black-hole' }) => {
    let roomKey = generateRoomKey();
    while (rooms.has(roomKey)) {
      roomKey = generateRoomKey(); // Ensure unique key
    }
    const initialGameState = gameId === 'connect-four'
      ? connectFour.createInitialState(socket.id)
      : gameId === 'dots-and-boxes'
        ? dotsAndBoxes.createInitialState(socket.id)
        : blackHole.createInitialState(socket.id);

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
      const success = connectFour.makeMove(room, socket, data);
      if (success) {
        io.to(roomKey).emit('game-state', room.gameState);
      }
    } else if (room.gameId === 'dots-and-boxes') {
      const success = dotsAndBoxes.makeMove(room, socket, data);
      if (success) {
        io.to(roomKey).emit('game-state', room.gameState);
      }
    } else {
      const success = blackHole.makeMove(room, socket, data);
      if (success) {
        const scores = blackHole.calculateScores(room.gameState);
        const winner = blackHole.getWinner(room.gameState);
        io.to(roomKey).emit('game-state', { ...room.gameState, scores, winner });
      }
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

    const allReady = room.gameState.players.every(p => p.ready);
    if (allReady && room.gameState.players.length === 2) {
      if (room.gameId === 'connect-four') {
        room.gameState = connectFour.resetState(room.gameState.players);
        io.to(roomKey).emit('game-state', room.gameState);
      } else if (room.gameId === 'dots-and-boxes') {
        room.gameState = dotsAndBoxes.resetState(room.gameState.players);
        io.to(roomKey).emit('game-state', room.gameState);
      } else {
        room.gameState = blackHole.resetState(room.gameState.players);
        const scores = blackHole.calculateScores(room.gameState);
        const winner = blackHole.getWinner(room.gameState);
        io.to(roomKey).emit('game-state', { ...room.gameState, scores, winner });
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