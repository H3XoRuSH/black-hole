import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as blackHole from './server/games/blackHole.js';
import * as connectFour from './server/games/connectFour.js';
import * as dotsAndBoxes from './server/games/dotsAndBoxes.js';
import * as battleship from './server/games/battleship.js';
import * as checkers from './server/games/checkers.js';
import * as bingo from './server/games/bingo.js';
import * as trivia from './server/games/trivia.js';
import * as infiniteWordChain from './server/games/infinite-word-chain.js';
import * as pictionary from './server/games/pictionary.js';
import * as escapeRoom from './server/games/escapeRoom.js';
import { createRoomManager } from './server/roomManager.js';
import { evaluateBugReport, createGitHubIssue } from './server/services/bugReportService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

let cachedIndex: string | null = null;
try {
  cachedIndex = fs.readFileSync(indexPath, 'utf-8');
} catch {
  console.warn('dist/index.html not found, run `npm run build` first');
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use('/assets', express.static(path.join(distPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
}));

app.use(express.static(distPath, { index: false }));

const cleanupSw = `self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',(e)=>e.waitUntil((async()=>{(await caches.keys()).forEach(k=>caches.delete(k));(await self.registration.unregister())})()));`;

app.get(/^\/(sw|service-worker)\.js$/, (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.send(cleanupSw);
});

app.get('*', (req, res) => {
  if (cachedIndex) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(cachedIndex);
  } else {
    res.status(200).type('text/plain').send('Backend server is running.');
  }
});

const rooms = createRoomManager({
  'black-hole': blackHole as any,
  'connect-four': connectFour as any,
  'dots-and-boxes': dotsAndBoxes as any,
  'battleship': battleship as any,
  'checkers': checkers as any,
  'bingo': bingo as any,
  'trivia': trivia as any,
  'infinite-word-chain': infiniteWordChain as any,
  'pictionary': pictionary as any,
  'escape-room': escapeRoom as any,
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

  socket.on('recap-question', ({ roomKey, question }: { roomKey: string; question: string }) => {
    rooms.recapQuestion(roomKey, socket, { question });
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

  socket.on('rename-player', ({ roomKey, name }: { roomKey: string; name: string }) => {
    rooms.renamePlayer(roomKey, socket, name, io);
  });

  socket.on('start-game', ({ roomKey }: { roomKey: string }) => {
    rooms.startGame(roomKey, socket, io);
  });

  socket.on('add-ai', ({ roomKey, difficulty }: { roomKey: string; difficulty?: 'easy' | 'medium' | 'hard' }) => {
    rooms.addAI(roomKey, difficulty || 'hard', socket, io);
  });

  socket.on('change-difficulty', ({ roomKey, difficulty }: { roomKey: string; difficulty: 'easy' | 'medium' | 'hard' }) => {
    rooms.changeDifficulty(roomKey, difficulty, socket, io);
  });

  socket.on('remove-ai', ({ roomKey }: { roomKey: string }) => {
    rooms.removeAI(roomKey, socket, io);
  });

  socket.on('set-trivia-options', ({ roomKey, categorySlug, categoryName, difficulty }: { roomKey: string; categorySlug?: string; categoryName?: string; difficulty?: string }) => {
    rooms.setTriviaOptions(roomKey, socket, { categorySlug, categoryName, difficulty }, io);
  });

  socket.on('set-pictionary-options', ({ roomKey, timerDuration, roundsPerPlayer }: { roomKey: string; timerDuration: number; roundsPerPlayer?: number }) => {
    rooms.setPictionaryOptions(roomKey, socket, { timerDuration, roundsPerPlayer }, io);
  });

  socket.on('set-escape-room-options', ({ roomKey, roomId }: { roomKey: string; roomId: string }) => {
    rooms.setEscapeRoomOptions(roomKey, socket, { roomId }, io);
  });

  socket.on('send-chat', ({ roomKey, text }: { roomKey: string; text: string }) => {
    rooms.sendChat(roomKey, socket, { text }, io);
  });

  socket.on('get-chat', ({ roomKey }: { roomKey: string }) => {
    rooms.getChatMessages(roomKey, socket);
  });

  socket.on('draw-stroke', ({ roomKey, stroke }: { roomKey: string; stroke: any }) => {
    socket.to(roomKey).emit('draw-stroke', { stroke });
  });

  socket.on('clear-canvas', ({ roomKey }: { roomKey: string }) => {
    socket.to(roomKey).emit('clear-canvas');
  });

  socket.on('report-bug', async (data) => {
    try {
      const result = await evaluateBugReport(data);
      if (result.rejected) {
        socket.emit('bug-report-error', { message: result.reason || 'Bug report rejected as spam/invalid.' });
        return;
      }
      const issue = await createGitHubIssue({
        title: result.formattedTitle!,
        body: result.formattedBody!,
        labels: ['bug', data.category.toLowerCase().replace(/\s+/g, '-')]
      });
      socket.emit('bug-report-success', { issueUrl: issue.html_url });
    } catch (err: any) {
      console.error('Error reporting bug:', err);
      socket.emit('bug-report-error', { message: err.message || 'Failed to process bug report.' });
    }
  });

  socket.on('reconnect-room', ({ roomKey, playerNumber }: { roomKey: string; playerNumber: number }) => {
    rooms.reconnectRoom(roomKey, playerNumber, socket, io);
  });

  socket.on('disconnect', () => {
    rooms.handleDisconnect(socket.id, io);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
