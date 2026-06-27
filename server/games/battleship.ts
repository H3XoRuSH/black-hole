import type { Player, Room, Ship, BattleshipGameState } from '../../src/types/shared.js';

export type { Ship, BattleshipGameState };

const FLEET_SPECS = [
  { name: 'Cruiser', size: 3 },
  { name: 'Destroyer', size: 2 },
  { name: 'Patrol Boat', size: 2 },
];

export const validatePlacement = (ships: Ship[]): boolean => {
  if (ships.length !== FLEET_SPECS.length) return false;
  const board = Array(6).fill(null).map(() => Array(6).fill(false));

  for (const spec of FLEET_SPECS) {
    const ship = ships.find((s) => s.name === spec.name);
    if (!ship) return false;
    if (ship.coordinates.length !== spec.size) return false;

    const coords = ship.coordinates;
    const isHorizontal = coords.every((c) => c[0] === coords[0][0]);
    const isVertical = coords.every((c) => c[1] === coords[0][1]);

    if (!isHorizontal && !isVertical) return false;

    if (isHorizontal) {
      coords.sort((a, b) => a[1] - b[1]);
      for (let i = 1; i < coords.length; i++) {
        if (coords[i][1] !== coords[i - 1][1] + 1) return false;
      }
    } else {
      coords.sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < coords.length; i++) {
        if (coords[i][0] !== coords[i - 1][0] + 1) return false;
      }
    }

    for (const [r, c] of coords) {
      if (r < 0 || r > 5 || c < 0 || c > 5) return false;
      if (board[r][c]) return false;
      board[r][c] = true;
    }
  }

  return true;
};

export const createInitialState = (playerId: string): BattleshipGameState => {
  return {
    phase: 'placement',
    currentPlayer: 1,
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
    p1Placed: false,
    p2Placed: false,
    p1Ships: [],
    p2Ships: [],
    p1Shots: [],
    p2Shots: [],
    lastShotResult: null,
  };
};

export const resetState = (players: Player[]): BattleshipGameState => {
  return {
    phase: 'placement',
    currentPlayer: 1,
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
    p1Placed: false,
    p2Placed: false,
    p1Ships: [],
    p2Ships: [],
    p1Shots: [],
    p2Shots: [],
    lastShotResult: null,
  };
};

export const makeMove = (
  room: Room,
  socket: any,
  data: any
): boolean => {
  const gameState = room.gameState as BattleshipGameState;
  const player = gameState.players.find((p) => p.id === socket.id);
  if (!player) {
    socket.emit('invalid-move', { message: 'You are not a player in this room.' });
    return false;
  }

  const playerNum = player.player;

  if (gameState.phase === 'placement') {
    if (data.action !== 'place-ships') {
      socket.emit('invalid-move', { message: 'Expected ship placements.' });
      return false;
    }

    if ((playerNum === 1 && gameState.p1Placed) || (playerNum === 2 && gameState.p2Placed)) {
      socket.emit('invalid-move', { message: 'You have already placed your ships.' });
      return false;
    }

    const ships = data.ships as Ship[];
    if (!validatePlacement(ships)) {
      socket.emit('invalid-move', { message: 'Invalid ship placement.' });
      return false;
    }

    if (playerNum === 1) {
      gameState.p1Ships = ships;
      gameState.p1Placed = true;
    } else {
      gameState.p2Ships = ships;
      gameState.p2Placed = true;
    }

    if (gameState.p1Placed && gameState.p2Placed) {
      gameState.phase = 'playing';
      gameState.currentPlayer = 1;
    }
    return true;
  }

  if (gameState.phase === 'playing') {
    if (data.action !== 'shoot') {
      socket.emit('invalid-move', { message: 'Expected shot action.' });
      return false;
    }

    if (playerNum !== gameState.currentPlayer) {
      socket.emit('invalid-move', { message: 'Not your turn.' });
      return false;
    }

    const { row, col } = data;
    if (row < 0 || row > 5 || col < 0 || col > 5) {
      socket.emit('invalid-move', { message: 'Shot out of bounds.' });
      return false;
    }

    const ownShots = playerNum === 1 ? gameState.p1Shots : gameState.p2Shots;
    const alreadyShot = ownShots.some((s) => s[0] === row && s[1] === col);
    if (alreadyShot) {
      socket.emit('invalid-move', { message: 'Already shot at this coordinate.' });
      return false;
    }

    ownShots.push([row, col]);

    const opponentShips = playerNum === 1 ? gameState.p2Ships : gameState.p1Ships;
    let hit = false;
    let hitShip: Ship | null = null;

    for (const ship of opponentShips) {
      if (ship.coordinates.some((c) => c[0] === row && c[1] === col)) {
        hit = true;
        hitShip = ship;
        break;
      }
    }

    let sunkShipName: string | null = null;
    if (hit && hitShip) {
      const allSunk = hitShip.coordinates.every((c) =>
        ownShots.some((s) => s[0] === c[0] && s[1] === c[1])
      );
      if (allSunk) {
        sunkShipName = hitShip.name;
      }
    }

    gameState.lastShotResult = {
      player: playerNum,
      row,
      col,
      hit,
      sunkShipName,
    };

    const allOpponentShipsSunk = opponentShips.every((ship) =>
      ship.coordinates.every((c) =>
        ownShots.some((s) => s[0] === c[0] && s[1] === c[1])
      )
    );

    if (allOpponentShipsSunk) {
      gameState.phase = 'game-over';
      gameState.winner = `Player ${playerNum} wins!`;
    } else {
      gameState.currentPlayer = playerNum === 1 ? 2 : 1;
    }

    gameState.players.forEach((p) => (p.ready = false));
    return true;
  }

  return false;
};

export const getFilteredState = (gameState: BattleshipGameState, playerNum: number): any => {
  return {
    ...gameState,
    p1Ships: playerNum === 1 || gameState.phase === 'game-over'
      ? gameState.p1Ships
      : gameState.p1Ships.map((s) => ({
          name: s.name,
          size: s.size,
          coordinates: [],
        })),
    p2Ships: playerNum === 2 || gameState.phase === 'game-over'
      ? gameState.p2Ships
      : gameState.p2Ships.map((s) => ({
          name: s.name,
          size: s.size,
          coordinates: [],
        })),
  };
};
