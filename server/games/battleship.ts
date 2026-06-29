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
          coordinates: s.coordinates.filter(([r, c]) =>
            gameState.p2Shots.some(([sr, sc]) => sr === r && sc === c)
          ),
        })),
    p2Ships: playerNum === 2 || gameState.phase === 'game-over'
      ? gameState.p2Ships
      : gameState.p2Ships.map((s) => ({
          name: s.name,
          size: s.size,
          coordinates: s.coordinates.filter(([r, c]) =>
            gameState.p1Shots.some(([sr, sc]) => sr === r && sc === c)
          ),
        })),
  };
};

/**
 * BattleshipComputer - AI Move Generator for Battleship.
 * Supports three difficulty levels:
 * - Easy: 70% mistake rate. Shoots completely randomly.
 * - Medium: 40% mistake rate. Uses a hunt-and-target search targeting neighbors of any unsunk hits.
 * - Hard: 0% mistake rate. Uses horizontal/vertical alignment targeting when hits are connected,
 *         and probability density heatmap calculations with checkerboard parity filtering for hunt mode.
 */
export class BattleshipComputer {
  static async getAIMove(gameState: BattleshipGameState): Promise<any> {
    if (gameState.phase === 'placement') {
      return this.getBattleshipHeuristicPlacement();
    }

    const aiPlayer = gameState.players.find((p) => p.isAI);
    const difficulty = aiPlayer?.difficulty || 'hard';
    const aiPlayerNum = aiPlayer?.player || 2;

    let mistakeRate = 0;
    if (difficulty === 'easy') mistakeRate = 0.7;
    else if (difficulty === 'medium') mistakeRate = 0.4;

    if (Math.random() < mistakeRate) {
      const ownShots = aiPlayerNum === 1 ? gameState.p1Shots : gameState.p2Shots;
      const allShots: [number, number][] = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const alreadyShot = ownShots.some(([sr, sc]) => sr === r && sc === c);
          if (!alreadyShot) allShots.push([r, c]);
        }
      }
      if (allShots.length > 0) {
        const pick = allShots[Math.floor(Math.random() * allShots.length)];
        return { action: 'shoot', row: pick[0], col: pick[1] };
      }
    }

    let move: { row: number; col: number };
    if (difficulty === 'easy') {
      move = this.getEasyShot(gameState, aiPlayerNum);
    } else if (difficulty === 'medium') {
      move = this.getMediumShot(gameState, aiPlayerNum);
    } else {
      move = this.getHardShot(gameState, aiPlayerNum);
    }

    return { action: 'shoot', ...move };
  }

  private static getBattleshipHeuristicPlacement(): any {
    const ships = [
      { name: 'Cruiser', size: 3, coordinates: [] as [number, number][] },
      { name: 'Destroyer', size: 2, coordinates: [] as [number, number][] },
      { name: 'Patrol Boat', size: 2, coordinates: [] as [number, number][] }
    ];

    while (true) {
      const board = Array(6).fill(null).map(() => Array(6).fill(false));
      let success = true;

      for (const ship of ships) {
        let placed = false;
        for (let attempt = 0; attempt < 100; attempt++) {
          const isHorizontal = Math.random() < 0.5;
          const row = Math.floor(Math.random() * 6);
          const col = Math.floor(Math.random() * 6);
          const coords: [number, number][] = [];

          if (isHorizontal) {
            if (col + ship.size <= 6) {
              for (let i = 0; i < ship.size; i++) coords.push([row, col + i]);
            }
          } else {
            if (row + ship.size <= 6) {
              for (let i = 0; i < ship.size; i++) coords.push([row + i, col]);
            }
          }

          if (coords.length === ship.size && coords.every(([r, c]) => !board[r][c])) {
            for (const [r, c] of coords) board[r][c] = true;
            ship.coordinates = coords;
            placed = true;
            break;
          }
        }
        if (!placed) {
          success = false;
          break;
        }
      }

      if (success && validatePlacement(ships)) {
        return { action: 'place-ships', ships };
      }
    }
  }

  private static getEasyShot(gameState: BattleshipGameState, aiPlayerNum: number): { row: number; col: number } {
    const ownShots = aiPlayerNum === 1 ? gameState.p1Shots : gameState.p2Shots;
    const allShots: [number, number][] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const alreadyShot = ownShots.some(([sr, sc]) => sr === r && sc === c);
        if (!alreadyShot) allShots.push([r, c]);
      }
    }
    if (allShots.length > 0) {
      const pick = allShots[Math.floor(Math.random() * allShots.length)];
      return { row: pick[0], col: pick[1] };
    }
    return { row: 0, col: 0 };
  }

  private static getMediumShot(gameState: BattleshipGameState, aiPlayerNum: number): { row: number; col: number } {
    const ownShots = aiPlayerNum === 1 ? gameState.p1Shots : gameState.p2Shots;
    const opponentShips = aiPlayerNum === 1 ? gameState.p2Ships : gameState.p1Ships;

    const hitCoords: [number, number][] = [];
    for (const ship of opponentShips) {
      const shipShots = ship.coordinates.filter(([sr, sc]: [number, number]) =>
        ownShots.some(([r, c]) => r === sr && c === sc)
      );
      const isSunk = shipShots.length === ship.size;
      if (shipShots.length > 0 && !isSunk) {
        hitCoords.push(...shipShots);
      }
    }

    if (hitCoords.length > 0) {
      for (const [r, c] of hitCoords) {
        const neighbors = [
          [r - 1, c],
          [r + 1, c],
          [r, c - 1],
          [r, c + 1]
        ];
        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr <= 5 && nc >= 0 && nc <= 5) {
            const alreadyShot = ownShots.some(([sr, sc]) => sr === nr && sc === nc);
            if (!alreadyShot) {
              return { row: nr, col: nc };
            }
          }
        }
      }
    }

    const allShots: [number, number][] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const alreadyShot = ownShots.some(([sr, sc]) => sr === r && sc === c);
        if (!alreadyShot) allShots.push([r, c]);
      }
    }

    if (allShots.length > 0) {
      const pick = allShots[Math.floor(Math.random() * allShots.length)];
      return { row: pick[0], col: pick[1] };
    }

    return { row: 0, col: 0 };
  }

  private static getHardShot(gameState: BattleshipGameState, aiPlayerNum: number): { row: number; col: number } {
    const ownShots = aiPlayerNum === 1 ? gameState.p1Shots : gameState.p2Shots;
    const opponentShips = aiPlayerNum === 1 ? gameState.p2Ships : gameState.p1Ships;
    const isAlreadyShot = (r: number, c: number) => ownShots.some(([sr, sc]) => sr === r && sc === c);

    const unsunkShips = opponentShips.filter((ship) => {
      const shipShots = ship.coordinates.filter(([sr, sc]: [number, number]) =>
        ownShots.some(([r, c]) => r === sr && c === sc)
      );
      return shipShots.length > 0 && shipShots.length < ship.size;
    });

    if (unsunkShips.length > 0) {
      const ship = unsunkShips[0];
      const shipHits = ship.coordinates.filter(([sr, sc]) => ownShots.some(([r, c]) => r === sr && c === sc));

      if (shipHits.length === 1) {
        const [r, c] = shipHits[0];
        const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr <= 5 && nc >= 0 && nc <= 5 && !isAlreadyShot(nr, nc)) {
            return { row: nr, col: nc };
          }
        }
      } else {
        const isHorizontal = shipHits[0][0] === shipHits[1][0];
        const candidates: [number, number][] = [];
        if (isHorizontal) {
          const row = shipHits[0][0];
          const cols = shipHits.map((h) => h[1]);
          candidates.push([row, Math.min(...cols) - 1]);
          candidates.push([row, Math.max(...cols) + 1]);
        } else {
          const col = shipHits[0][1];
          const rows = shipHits.map((h) => h[0]);
          candidates.push([Math.min(...rows) - 1, col]);
          candidates.push([Math.max(...rows) + 1, col]);
        }
        for (const [nr, nc] of candidates) {
          if (nr >= 0 && nr <= 5 && nc >= 0 && nc <= 5 && !isAlreadyShot(nr, nc)) {
            return { row: nr, col: nc };
          }
        }
        for (const [r, c] of shipHits) {
          const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr <= 5 && nc >= 0 && nc <= 5 && !isAlreadyShot(nr, nc)) {
              return { row: nr, col: nc };
            }
          }
        }
      }
    }

    const untouchedShips = opponentShips.filter((ship) => {
      const shipShots = ship.coordinates.filter(([sr, sc]: [number, number]) =>
        ownShots.some(([r, c]) => r === sr && c === sc)
      );
      return shipShots.length === 0;
    });

    const remainingSizes = untouchedShips.map((s) => s.size);
    if (remainingSizes.length === 0) {
      const unoccupied: [number, number][] = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (!isAlreadyShot(r, c)) unoccupied.push([r, c]);
        }
      }
      if (unoccupied.length > 0) {
        const pick = unoccupied[Math.floor(Math.random() * unoccupied.length)];
        return { row: pick[0], col: pick[1] };
      }
      return { row: 0, col: 0 };
    }

    const density = Array(6).fill(null).map(() => Array(6).fill(0));
    for (const size of remainingSizes) {
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c <= 6 - size; c++) {
          let possible = true;
          for (let i = 0; i < size; i++) {
            if (isAlreadyShot(r, c + i)) {
              possible = false;
              break;
            }
          }
          if (possible) {
            for (let i = 0; i < size; i++) density[r][c + i]++;
          }
        }
      }
      for (let c = 0; c < 6; c++) {
        for (let r = 0; r <= 6 - size; r++) {
          let possible = true;
          for (let i = 0; i < size; i++) {
            if (isAlreadyShot(r + i, c)) {
              possible = false;
              break;
            }
          }
          if (possible) {
            for (let i = 0; i < size; i++) density[r + i][c]++;
          }
        }
      }
    }

    let maxDensity = -1;
    let bestCells: [number, number][] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (!isAlreadyShot(r, c)) {
          const val = density[r][c];
          if (val > maxDensity) {
            maxDensity = val;
            bestCells = [[r, c]];
          } else if (val === maxDensity) {
            bestCells.push([r, c]);
          }
        }
      }
    }

    if (bestCells.length > 0) {
      const parityCells = bestCells.filter(([r, c]) => (r + c) % 2 === 0);
      const candidates = parityCells.length > 0 ? parityCells : bestCells;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      return { row: pick[0], col: pick[1] };
    }
    return { row: 0, col: 0 };
  }
}

export const getAIMove = (gameState: BattleshipGameState) => BattleshipComputer.getAIMove(gameState);
