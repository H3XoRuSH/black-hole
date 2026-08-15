import { describe, expect, it, vi } from 'vitest';
import { createRoomManager } from '../roomManager.js';
import * as jigsaw from '../games/jigsaw.js';
import * as spotIt from '../games/spotIt.js';
import * as blackHole from '../games/blackHole.js';

describe('roomManager.makeMove turn checking', () => {
  const mockIo = {
    to: () => ({ emit: () => {} }),
    emit: () => {},
  } as any;

  const createMockSocket = (id: string) => {
    const fn = vi.fn();
    return {
      id,
      join: vi.fn(),
      emit: fn,
      to: vi.fn(() => ({ emit: vi.fn() })),
    } as any;
  };

  it('allows any player to make a move in noTurns games like Jigsaw', async () => {
    const rm = createRoomManager({
      jigsaw: jigsaw as any,
    });
    const socketP1 = createMockSocket('p1-socket-id');
    const socketP2 = createMockSocket('p2-socket-id');

    const roomKey = rm.createRoom('jigsaw', socketP1);
    rm.joinRoom(roomKey, 'jigsaw', socketP2, mockIo);
    rm.toggleReady(roomKey, socketP1, mockIo);
    rm.toggleReady(roomKey, socketP2, mockIo);
    rm.startGame(roomKey, socketP1, mockIo);

    // Clear previous mock calls
    socketP2.emit.mockClear();

    // Player 2 picks up a piece in Jigsaw (which has noTurns = true)
    await rm.makeMove(
      { roomKey, action: 'pickup', pieceId: 0 },
      socketP2,
      mockIo
    );

    // Player 2 should NOT receive 'invalid-move' with "Not your turn."
    const invalidMoveCalls = socketP2.emit.mock.calls.filter(
      (call: any[]) => call[0] === 'invalid-move'
    );
    expect(invalidMoveCalls).toHaveLength(0);
  });

  it('allows any player to make a move in noTurns games like Pattern Hunt (Spot-It)', async () => {
    const rm = createRoomManager({
      'spot-it': spotIt as any,
    });
    const socketP1 = createMockSocket('p1-socket-id');
    const socketP2 = createMockSocket('p2-socket-id');

    const roomKey = rm.createRoom('spot-it', socketP1);
    rm.joinRoom(roomKey, 'spot-it', socketP2, mockIo);
    rm.toggleReady(roomKey, socketP1, mockIo);
    rm.toggleReady(roomKey, socketP2, mockIo);
    rm.startGame(roomKey, socketP1, mockIo);

    // Clear previous mock calls
    socketP2.emit.mockClear();

    // Player 2 claims match in Pattern Hunt (using pieceId or invalid claim data to verify move reaches makeMove)
    await rm.makeMove(
      {
        roomKey,
        action: 'claim',
        imageId: 'dummy-image',
        activeCardId: 'dummy-card',
        centerCardId: 'dummy-center',
      },
      socketP2,
      mockIo
    );

    // Should NOT get "Not your turn." (might get invalid move for wrong image, but not turn failure)
    const turnErrorCalls = socketP2.emit.mock.calls.filter(
      (call: any[]) => call[0] === 'invalid-move' && call[1]?.message === 'Not your turn.'
    );
    expect(turnErrorCalls).toHaveLength(0);
  });

  it('blocks Player 2 in turn-based games like Black Hole when it is Player 1 turn', async () => {
    const rm = createRoomManager({
      'black-hole': blackHole as any,
    });
    const socketP1 = createMockSocket('p1-socket-id');
    const socketP2 = createMockSocket('p2-socket-id');

    const roomKey = rm.createRoom('black-hole', socketP1);
    rm.joinRoom(roomKey, 'black-hole', socketP2, mockIo);
    rm.toggleReady(roomKey, socketP1, mockIo);
    rm.toggleReady(roomKey, socketP2, mockIo);
    rm.startGame(roomKey, socketP1, mockIo);

    // Clear previous mock calls
    socketP2.emit.mockClear();

    // Player 2 attempts to move when currentPlayer is 1
    await rm.makeMove(
      { roomKey, index: 0 },
      socketP2,
      mockIo
    );

    expect(socketP2.emit).toHaveBeenCalledWith('invalid-move', {
      message: 'Not your turn.',
    });
  });

  it('issues sessionToken and prevents token leakage in gameState broadcasts', () => {
    const rm = createRoomManager({
      'black-hole': blackHole as any,
    });
    const socketP1 = createMockSocket('p1-socket-id');
    const socketP2 = createMockSocket('p2-socket-id');

    const roomKey = rm.createRoom('black-hole', socketP1);
    const p1Call = socketP1.emit.mock.calls.find((c: any[]) => c[0] === 'waiting-for-player');
    expect(p1Call).toBeDefined();
    const p1Token = p1Call[1].sessionToken;
    expect(p1Token).toBeDefined();
    expect(typeof p1Token).toBe('string');
    // Ensure gameState players list does not expose sessionToken
    expect(p1Call[1].gameState.players[0].sessionToken).toBeUndefined();

    rm.joinRoom(roomKey, 'black-hole', socketP2, mockIo);
    const p2Call = socketP2.emit.mock.calls.find((c: any[]) => c[0] === 'waiting-for-player');
    expect(p2Call).toBeDefined();
    const p2Token = p2Call[1].sessionToken;
    expect(p2Token).toBeDefined();
    expect(p2Token).not.toBe(p1Token);
  });

  it('rejects reconnection attempts with missing or invalid sessionToken', () => {
    const rm = createRoomManager({
      'black-hole': blackHole as any,
    });
    const socketP1 = createMockSocket('p1-socket-id');
    const roomKey = rm.createRoom('black-hole', socketP1);

    const reconnectorSocket = createMockSocket('p1-reconnect-id');
    // Attempt reconnect with bad token
    rm.reconnectRoom(roomKey, 1, reconnectorSocket, mockIo, 'invalid-token-123');

    expect(reconnectorSocket.emit).toHaveBeenCalledWith('reconnect-fail', {
      message: 'Authentication failed. Invalid session token.',
    });
  });

  it('allows reconnection with valid sessionToken', () => {
    const rm = createRoomManager({
      'black-hole': blackHole as any,
    });
    const socketP1 = createMockSocket('p1-socket-id');
    const roomKey = rm.createRoom('black-hole', socketP1);
    const p1Token = socketP1.emit.mock.calls.find((c: any[]) => c[0] === 'waiting-for-player')[1].sessionToken;

    const reconnectorSocket = createMockSocket('p1-reconnect-id');
    rm.reconnectRoom(roomKey, 1, reconnectorSocket, mockIo, p1Token);

    const successCall = reconnectorSocket.emit.mock.calls.find((c: any[]) => c[0] === 'reconnect-success');
    expect(successCall).toBeDefined();
    expect(successCall[1].player).toBe(1);
    expect(successCall[1].sessionToken).toBe(p1Token);
  });

  it('rejects reconnection attempts to AI player slots', () => {
    const rm = createRoomManager({
      'black-hole': blackHole as any,
    });
    const socketP1 = createMockSocket('p1-socket-id');
    const roomKey = rm.createRoom('black-hole', socketP1);
    rm.addAI(roomKey, 'medium', socketP1, mockIo);

    const reconnectorSocket = createMockSocket('ai-hijacker-id');
    // Attempt reconnect to player 2 (AI)
    rm.reconnectRoom(roomKey, 2, reconnectorSocket, mockIo, undefined);

    expect(reconnectorSocket.emit).toHaveBeenCalledWith('reconnect-fail', {
      message: 'Cannot reconnect to an AI player slot.',
    });
  });

  it('caps room.chatMessages at 100 entries', () => {
    const rm = createRoomManager({
      'black-hole': blackHole as any,
    });
    const socketP1 = createMockSocket('p1-socket-id');
    const roomKey = rm.createRoom('black-hole', socketP1);

    for (let i = 0; i < 110; i++) {
      rm.sendChat(roomKey, socketP1, { text: `Message ${i}` }, mockIo);
    }

    socketP1.emit.mockClear();
    rm.getChatMessages(roomKey, socketP1);
    const chatHistoryCall = socketP1.emit.mock.calls.find((c: any[]) => c[0] === 'chat-history');
    expect(chatHistoryCall).toBeDefined();
    expect(chatHistoryCall[1].length).toBe(100);
    expect(chatHistoryCall[1][0].text).toBe('Message 10');
    expect(chatHistoryCall[1][99].text).toBe('Message 109');
  });
});
