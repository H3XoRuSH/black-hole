import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import * as blackHole from './server/games/blackHole.js';
import * as connectFour from './server/games/connectFour.js';
import * as dotsAndBoxes from './server/games/dotsAndBoxes.js';
import * as battleship from './server/games/battleship.js';
import { Room } from './server/games/blackHole.js';

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

const generateRoomKey = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
};

const rooms = new Map<string, Room>();

const socketRooms = new Map<string, { roomKey: string; playerNumber: number }>();
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
const RECONNECT_TIMEOUT = 60000;

interface GameModule {
  createInitialState: (playerId: string) => any;
  resetState: (players: any[]) => any;
  makeMove: (room: Room, socket: Socket, data: any) => boolean;
}

const gamesRegistry: Record<string, GameModule> = {
  'black-hole': blackHole as GameModule,
  'connect-four': connectFour as GameModule,
  'dots-and-boxes': dotsAndBoxes as GameModule,
  'battleship': battleship as GameModule,
};

io.on('connection', (socket: Socket) => {
  console.log('A player connected:', socket.id);

  socket.on('create-room', ({ gameId } = { gameId: 'black-hole' }) => {
    let roomKey = generateRoomKey();
    while (rooms.has(roomKey)) {
      roomKey = generateRoomKey();
    }
    const game = gamesRegistry[gameId] || blackHole;
    const initialGameState = game.createInitialState(socket.id);

    rooms.set(roomKey, {
      gameId,
      gameState: initialGameState,
    });
    socket.join(roomKey);
    socketRooms.set(socket.id, { roomKey, playerNumber: 1 });
    socket.emit('waiting-for-player', { roomKey, player: 1, gameId });
    console.log(
      `Room created: ${roomKey}, Player 1: ${socket.id}, Game: ${gameId}`
    );
  });

  socket.on(
    'join-room',
    ({ roomKey, gameId }: { roomKey: string; gameId: string }) => {
      if (!rooms.has(roomKey)) {
        socket.emit('room-error', { message: 'Room does not exist.' });
        return;
      }
      const room = rooms.get(roomKey)!;
      if (gameId && room.gameId !== gameId) {
        socket.emit('room-error', {
          message: 'This room is for a different game.',
        });
        return;
      }
      if (room.gameState.players.length >= 2) {
        socket.emit('room-error', { message: 'Room is full.' });
        return;
      }
      room.gameState.players.push({ id: socket.id, player: 2, ready: false });
      socket.join(roomKey);
      socketRooms.set(socket.id, { roomKey, playerNumber: 2 });
      room.gameState.players.forEach((player: any) => {
        let state = room.gameState;
        if (room.gameId === 'battleship') {
          const bs = gamesRegistry['battleship'] as any;
          state = bs.getFilteredState(room.gameState, player.player);
        }
        io.to(player.id).emit('room-started', {
          roomKey,
          player: player.player,
          gameId: room.gameId,
          gameState: state,
        });
      });
    }
  );

  socket.on('validate-room', ({ roomKey }: { roomKey: string }) => {
    const uppercaseKey = roomKey ? roomKey.toUpperCase() : '';
    if (!rooms.has(uppercaseKey)) {
      socket.emit('room-validation-error', { message: 'Room does not exist.' });
      return;
    }
    const room = rooms.get(uppercaseKey)!;
    if (room.gameState.players.length >= 2) {
      socket.emit('room-validation-error', { message: 'Room is full.' });
      return;
    }
    socket.emit('room-validated', { roomKey: uppercaseKey, gameId: room.gameId });
  });

  socket.on('make-move', (data: any) => {
    const { roomKey } = data;
    if (!rooms.has(roomKey)) {
      socket.emit('invalid-move', { message: 'Room does not exist.' });
      return;
    }
    const room = rooms.get(roomKey)!;
    const player = room.gameState.players.find((p: any) => p.id === socket.id);
    const isPlayingPhase = !room.gameState.phase || room.gameState.phase === 'playing';
    if (!player || (isPlayingPhase && player.player !== room.gameState.currentPlayer)) {
      socket.emit('invalid-move', { message: 'Not your turn.' });
      return;
    }

    const game = gamesRegistry[room.gameId];
    if (game) {
      const success = game.makeMove(room, socket, data);
      if (success) {
        if (room.gameId === 'battleship') {
          const bs = game as any;
          room.gameState.players.forEach((p: any) => {
            io.to(p.id).emit('game-state', bs.getFilteredState(room.gameState, p.player));
          });
        } else {
          io.to(roomKey).emit('game-state', room.gameState);
        }
      }
    } else {
      socket.emit('invalid-move', { message: 'Unsupported game type.' });
    }
  });

  socket.on('new-game', ({ roomKey }: { roomKey: string }) => {
    if (!rooms.has(roomKey)) {
      socket.emit('room-error', { message: 'Room does not exist.' });
      return;
    }
    const room = rooms.get(roomKey)!;
    const player = room.gameState.players.find((p: any) => p.id === socket.id);
    if (!player) {
      socket.emit('room-error', { message: 'You are not in this room.' });
      return;
    }

    player.ready = true;
    io.to(roomKey).emit('player-ready', { player: player.player });

    const allReady = room.gameState.players.every((p: any) => p.ready);
    if (allReady && room.gameState.players.length === 2) {
      const game = gamesRegistry[room.gameId];
      if (game) {
        room.gameState = game.resetState(room.gameState.players);
        if (room.gameId === 'battleship') {
          const bs = game as any;
          room.gameState.players.forEach((p: any) => {
            io.to(p.id).emit('game-state', bs.getFilteredState(room.gameState, p.player));
          });
        } else {
          io.to(roomKey).emit('game-state', room.gameState);
        }
      }
    }
  });

  socket.on('leave-room', ({ roomKey }: { roomKey: string }) => {
    if (rooms.has(roomKey)) {
      const room = rooms.get(roomKey)!;
      const playerIndex = room.gameState.players.findIndex(
        (p: any) => p.id === socket.id
      );
      if (playerIndex !== -1) {
        socket.to(roomKey).emit('player-disconnected', {
          message: 'A player has left the game. Returning to lobby.',
          gameId: room.gameId,
        });
        socket.leave(roomKey);
        rooms.delete(roomKey);
        const timer = disconnectTimers.get(roomKey);
        if (timer) clearTimeout(timer);
        disconnectTimers.delete(roomKey);
      }
    }
    socketRooms.delete(socket.id);
  });

  socket.on('reconnect-room', ({ roomKey, playerNumber }: { roomKey: string; playerNumber: number }) => {
    if (!rooms.has(roomKey)) {
      socket.emit('reconnect-fail', { message: 'That room is no longer available.' });
      return;
    }

    const room = rooms.get(roomKey)!;
    const player = room.gameState.players.find((p: any) => p.player === playerNumber);
    if (!player) {
      socket.emit('reconnect-fail', { message: 'Could not find your player slot.' });
      return;
    }

    const timer = disconnectTimers.get(roomKey);
    if (timer) {
      clearTimeout(timer);
      disconnectTimers.delete(roomKey);
    }

    player.id = socket.id;
    socket.join(roomKey);
    socketRooms.set(socket.id, { roomKey, playerNumber });

    let state = room.gameState;
    if (room.gameId === 'battleship') {
      const bs = gamesRegistry['battleship'] as any;
      state = bs.getFilteredState(room.gameState, playerNumber);
    }

    const gameStarted = room.gameState.players.length >= 2;

    socket.emit('reconnect-success', {
      roomKey,
      player: playerNumber,
      gameId: room.gameId,
      gameState: state,
      gameStarted,
    });

    socket.to(roomKey).emit('player-reconnected', {
      message: 'Your opponent has reconnected!',
      gameId: room.gameId,
    });
  });

  socket.on('disconnect', () => {
    const info = socketRooms.get(socket.id);
    if (!info) return;
    const { roomKey, playerNumber } = info;
    socketRooms.delete(socket.id);

    if (!disconnectTimers.has(roomKey) && rooms.has(roomKey)) {
      const timer = setTimeout(() => {
        const room = rooms.get(roomKey);
        if (room) {
          io.in(roomKey).emit('player-disconnected', {
            message: 'A player has disconnected. Returning to lobby.',
            gameId: room.gameId,
          });
          rooms.delete(roomKey);
        }
        disconnectTimers.delete(roomKey);
      }, RECONNECT_TIMEOUT);
      disconnectTimers.set(roomKey, timer);

      const room = rooms.get(roomKey);
      if (room && room.gameState.players.length >= 2) {
        const otherPlayer = room.gameState.players.find(
          (p: any) => p.player !== playerNumber
        );
        if (otherPlayer) {
          io.to(otherPlayer.id).emit('player-disconnected', {
            message: 'Your opponent disconnected. Waiting for reconnection...',
            gameId: room.gameId,
            canReconnect: true,
          });
        }
      }
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
