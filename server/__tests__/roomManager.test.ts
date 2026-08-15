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
});
