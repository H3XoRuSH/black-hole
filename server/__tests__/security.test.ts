import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, Server as HttpServer } from 'http';
import express from 'express';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocketIO, Socket as ClientSocket } from 'socket.io-client';
import { createRoomManager } from '../roomManager.js';
import * as blackHole from '../games/blackHole.js';
import { RateLimiter } from '../utils/rateLimiter.js';
import { evaluateBugReport } from '../services/bugReportService.js';

describe('Security & Vulnerability Defenses', () => {
  let server: HttpServer;
  let io: SocketIOServer;
  let port: number;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  let testRateLimiter: RateLimiter;

  beforeAll(async () => {
    const app = express();
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));

    app.get('/health', (req, res) => {
      res.status(200).send('OK');
    });

    server = createServer(app);
    io = new SocketIOServer(server);
    testRateLimiter = new RateLimiter(0);

    const rm = createRoomManager({
      'black-hole': blackHole as any,
    });

    io.on('connection', (socket) => {
      socket.on('create-room', ({ gameId } = { gameId: 'black-hole' }) => {
        const ip = socket.handshake.address || socket.id;
        if (!testRateLimiter.consume(`create:${ip}`, 2, 60000)) {
          socket.emit('room-error', { message: 'Creating rooms too quickly.' });
          return;
        }
        rm.createRoom(gameId, socket);
      });

      socket.on('join-room', ({ roomKey, gameId }) => {
        rm.joinRoom(roomKey, gameId, socket, io);
      });

      socket.on('add-ai', ({ roomKey, difficulty }) => {
        rm.addAI(roomKey, difficulty, socket, io);
      });

      socket.on('reconnect-room', ({ roomKey, playerNumber, sessionToken }) => {
        rm.reconnectRoom(roomKey, playerNumber, socket, io, sessionToken);
      });

      socket.on('send-chat', ({ roomKey, text }) => {
        if (!testRateLimiter.consume(`chat:${socket.id}`, 3, 10000)) {
          return;
        }
        rm.sendChat(roomKey, socket, { text }, io);
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr) {
          port = addr.port;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    testRateLimiter.destroy();
    if (clientSocket1) clientSocket1.disconnect();
    if (clientSocket2) clientSocket2.disconnect();
    io.close();
    server.close();
  });

  it('1. HTTP Security: Helmet sets standard security headers', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    expect(res.status).toBe(200);

    // Verify key security headers are present
    expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin');
  });

  it('2. Anti-Abuse: IP-based action rate limiter blocks spamming', async () => {
    testRateLimiter.cleanup(Date.now(), 0);
    const client = ClientSocketIO(`http://127.0.0.1:${port}`, { transports: ['websocket'] });
    await new Promise<void>((resolve) => client.on('connect', () => resolve()));

    const errors: string[] = [];
    client.on('room-error', (data) => errors.push(data.message));

    // Limit is 2 creations within 60s
    client.emit('create-room', { gameId: 'black-hole' });
    client.emit('create-room', { gameId: 'black-hole' });
    client.emit('create-room', { gameId: 'black-hole' }); // Should be blocked

    await new Promise((r) => setTimeout(r, 100));
    expect(errors).toContain('Creating rooms too quickly.');
    client.disconnect();
  });

  it('3. Anti-Hijacking: Reconnecting requires valid cryptographic sessionToken and blocks AI takeover', async () => {
    testRateLimiter.cleanup(Date.now(), 0);
    clientSocket1 = ClientSocketIO(`http://127.0.0.1:${port}`, { transports: ['websocket'] });
    clientSocket2 = ClientSocketIO(`http://127.0.0.1:${port}`, { transports: ['websocket'] });

    await Promise.all([
      new Promise<void>((resolve) => clientSocket1.on('connect', () => resolve())),
      new Promise<void>((resolve) => clientSocket2.on('connect', () => resolve())),
    ]);

    let player1RoomKey = '';
    let player1SessionToken = '';

    clientSocket1.on('waiting-for-player', (data) => {
      player1RoomKey = data.roomKey;
      player1SessionToken = data.sessionToken;
    });

    clientSocket1.emit('create-room', { gameId: 'black-hole' });

    await new Promise((r) => setTimeout(r, 100));
    expect(player1RoomKey).toBeTruthy();
    expect(player1SessionToken).toBeTruthy();

    // Attacker (clientSocket2) attempts to hijack player 1 slot with fake token
    const reconnectFailPromise = new Promise<string>((resolve) => {
      clientSocket2.on('reconnect-fail', (data) => resolve(data.message));
    });

    clientSocket2.emit('reconnect-room', {
      roomKey: player1RoomKey,
      playerNumber: 1,
      sessionToken: 'attacker-fake-token',
    });

    const failMsg = await reconnectFailPromise;
    expect(failMsg).toBe('Authentication failed. Invalid session token.');

    // Legit reconnect with correct token succeeds
    const reconnectSuccessPromise = new Promise<boolean>((resolve) => {
      clientSocket2.on('reconnect-success', () => resolve(true));
    });

    clientSocket2.emit('reconnect-room', {
      roomKey: player1RoomKey,
      playerNumber: 1,
      sessionToken: player1SessionToken,
    });

    const success = await reconnectSuccessPromise;
    expect(success).toBe(true);
  });

  it('4. Sanitization & Input Defense: Dangerous HTML/script payloads are safely escaped in bug reports', async () => {
    const report = await evaluateBugReport({
      title: '<script>alert("XSS")</script>UI button is broken',
      description: 'The restart button fails to trigger on mobile <img src=x onerror=alert(1)>',
      category: 'Gameplay Bug',
    });

    expect(report.rejected).toBe(false);
    expect(report.formattedTitle).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;UI button is broken');
    expect(report.formattedBody).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
