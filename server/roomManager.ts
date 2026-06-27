import { Socket, Server as SocketIOServer } from 'socket.io';
import type { Room } from '../src/types/shared.js';

export interface GameModule {
  createInitialState: (playerId: string) => any;
  resetState: (players: any[]) => any;
  makeMove: (room: Room, socket: Socket, data: any) => boolean;
}

const generateRoomKey = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
};

const RECONNECT_TIMEOUT = 60000;

export function createRoomManager(gamesRegistry: Record<string, GameModule>) {
  const rooms = new Map<string, Room>();
  const socketRooms = new Map<string, { roomKey: string; playerNumber: number }>();
  const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

  function getFilteredState(room: Room, playerNum: number) {
    if (room.gameId === 'battleship') {
      const bs = gamesRegistry['battleship'] as any;
      return bs.getFilteredState(room.gameState, playerNum);
    }
    return room.gameState;
  }

  function broadcastGameState(roomKey: string, room: Room, io: SocketIOServer) {
    if (room.gameId === 'battleship') {
      room.gameState.players.forEach((p: any) => {
        io.to(p.id).emit('game-state', getFilteredState(room, p.player));
      });
    } else {
      io.to(roomKey).emit('game-state', room.gameState);
    }
  }

  return {
    createRoom(gameId: string, socket: Socket) {
      let roomKey = generateRoomKey();
      while (rooms.has(roomKey)) roomKey = generateRoomKey();

      const game = gamesRegistry[gameId] || gamesRegistry['black-hole'];
      const initialGameState = game.createInitialState(socket.id);

      rooms.set(roomKey, { gameId, gameState: initialGameState });
      socket.join(roomKey);
      socketRooms.set(socket.id, { roomKey, playerNumber: 1 });
      socket.emit('waiting-for-player', { roomKey, player: 1, gameId });
      return roomKey;
    },

    joinRoom(roomKey: string, gameId: string, socket: Socket, io: SocketIOServer) {
      if (!rooms.has(roomKey)) {
        socket.emit('room-error', { message: 'Room does not exist.' });
        return;
      }
      const room = rooms.get(roomKey)!;
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
      socketRooms.set(socket.id, { roomKey, playerNumber: 2 });
      room.gameState.players.forEach((player: any) => {
        io.to(player.id).emit('room-started', {
          roomKey,
          player: player.player,
          gameId: room.gameId,
          gameState: getFilteredState(room, player.player),
        });
      });
    },

    validateRoom(roomKey: string, socket: Socket) {
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
    },

    leaveRoom(roomKey: string, socket: Socket) {
      if (rooms.has(roomKey)) {
        const room = rooms.get(roomKey)!;
        const playerIndex = room.gameState.players.findIndex((p: any) => p.id === socket.id);
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
    },

    reconnectRoom(roomKey: string, playerNumber: number, socket: Socket) {
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

      const gameStarted = room.gameState.players.length >= 2;
      socket.emit('reconnect-success', {
        roomKey,
        player: playerNumber,
        gameId: room.gameId,
        gameState: getFilteredState(room, playerNumber),
        gameStarted,
      });
      socket.to(roomKey).emit('player-reconnected', {
        message: 'Your opponent has reconnected!',
        gameId: room.gameId,
      });
    },

    handleDisconnect(socketId: string, io: SocketIOServer) {
      const info = socketRooms.get(socketId);
      if (!info) return;
      const { roomKey, playerNumber } = info;
      socketRooms.delete(socketId);

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
          const otherPlayer = room.gameState.players.find((p: any) => p.player !== playerNumber);
          if (otherPlayer) {
            io.to(otherPlayer.id).emit('player-disconnected', {
              message: 'Your opponent disconnected. Waiting for reconnection...',
              gameId: room.gameId,
              canReconnect: true,
            });
          }
        }
      }
    },

    makeMove(data: any, socket: Socket, io: SocketIOServer) {
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
        if (success) broadcastGameState(roomKey, room, io);
      } else {
        socket.emit('invalid-move', { message: 'Unsupported game type.' });
      }
    },

    newGame(roomKey: string, socket: Socket, io: SocketIOServer) {
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
          // Swap P1 and P2 roles
          const p1 = room.gameState.players.find((p: any) => p.player === 1);
          const p2 = room.gameState.players.find((p: any) => p.player === 2);
          if (p1 && p2) {
            p1.player = 2;
            p2.player = 1;
            // Update the socketRooms mappings for both players
            socketRooms.set(p1.id, { roomKey, playerNumber: 2 });
            socketRooms.set(p2.id, { roomKey, playerNumber: 1 });
          }
          room.gameState = game.resetState(room.gameState.players);
          broadcastGameState(roomKey, room, io);
        }
      }
    },

    getSocketRoom(socketId: string) {
      return socketRooms.get(socketId);
    },
  };
}
