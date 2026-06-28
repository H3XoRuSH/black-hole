import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import * as blackHole from './server/games/blackHole.js';
import * as connectFour from './server/games/connectFour.js';
import * as dotsAndBoxes from './server/games/dotsAndBoxes.js';
import * as battleship from './server/games/battleship.js';
import * as checkers from './server/games/checkers.js';
import { createRoomManager } from './server/roomManager.js';

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

app.use(express.static(path.join(__dirname, 'dist')));

const rooms = createRoomManager({
  'black-hole': blackHole as any,
  'connect-four': connectFour as any,
  'dots-and-boxes': dotsAndBoxes as any,
  'battleship': battleship as any,
  'checkers': checkers as any,
});

io.on('connection', (socket: Socket) => {
  console.log('A player connected:', socket.id);

  socket.on('create-room', ({ gameId } = { gameId: 'black-hole' }) => {
    const roomKey = rooms.createRoom(gameId, socket);
    console.log(`Room created: ${roomKey}, Player 1: ${socket.id}, Game: ${gameId}`);
  });

  socket.on('join-room', ({ roomKey, gameId }: { roomKey: string; gameId: string }) => {
    rooms.joinRoom(roomKey, gameId, socket, io);
  });

  socket.on('validate-room', ({ roomKey }: { roomKey: string }) => {
    rooms.validateRoom(roomKey, socket);
  });

  socket.on('make-move', (data: any) => {
    rooms.makeMove(data, socket, io);
  });

  socket.on('request-recap', ({ roomKey }: { roomKey: string }) => {
    rooms.requestRecap(roomKey, socket);
  });

  socket.on('new-game', ({ roomKey }: { roomKey: string }) => {
    rooms.newGame(roomKey, socket, io);
  });

  socket.on('leave-room', ({ roomKey }: { roomKey: string }) => {
    rooms.leaveRoom(roomKey, socket, io);
  });

  socket.on('toggle-ready', ({ roomKey }: { roomKey: string }) => {
    rooms.toggleReady(roomKey, socket, io);
  });

  socket.on('start-game', ({ roomKey }: { roomKey: string }) => {
    rooms.startGame(roomKey, socket, io);
  });

  socket.on('reconnect-room', ({ roomKey, playerNumber }: { roomKey: string; playerNumber: number }) => {
    rooms.reconnectRoom(roomKey, playerNumber, socket);
  });

  socket.on('disconnect', () => {
    rooms.handleDisconnect(socket.id, io);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
