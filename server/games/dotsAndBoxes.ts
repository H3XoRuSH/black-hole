import type { Player, Room } from '../../src/types/shared.js';

export interface DotsAndBoxesGameState {
  lines: Record<string, number>;
  boxes: Record<string, number>;
  scores: { player1: number; player2: number };
  currentPlayer: number;
  totalMoves: number;
  winner: string;
  players: Player[];
  lastMove?: { lineKey: string };
}

export const createInitialState = (playerId: string): DotsAndBoxesGameState => {
  return {
    lines: {},
    boxes: {},
    scores: { player1: 0, player2: 0 },
    currentPlayer: 1,
    totalMoves: 0,
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
  };
};

export const resetState = (players: Player[]): DotsAndBoxesGameState => {
  return {
    lines: {},
    boxes: {},
    scores: { player1: 0, player2: 0 },
    currentPlayer: 1,
    totalMoves: 0,
    winner: '',
    players: players.map((p) => ({ ...p, ready: false })),
  };
};

export const makeMove = (
  room: Room,
  socket: any,
  data: { lineKey: string }
): boolean => {
  const { lineKey } = data;
  const gameState = room.gameState as DotsAndBoxesGameState;

  if (gameState.winner) {
    socket.emit('invalid-move', { message: 'Game is over.' });
    return false;
  }

  if (gameState.lines[lineKey]) {
    socket.emit('invalid-move', { message: 'Line already drawn.' });
    return false;
  }

  const parts = lineKey.split('-');
  if (parts.length !== 3) {
    socket.emit('invalid-move', { message: 'Invalid line format.' });
    return false;
  }

  const [type, rStr, cStr] = parts;
  const r = parseInt(rStr, 10);
  const c = parseInt(cStr, 10);

  if (type === 'h') {
    if (r < 0 || r > 4 || c < 0 || c > 3) {
      socket.emit('invalid-move', {
        message: 'Invalid horizontal line coordinates.',
      });
      return false;
    }
  } else if (type === 'v') {
    if (r < 0 || r > 3 || c < 0 || c > 4) {
      socket.emit('invalid-move', {
        message: 'Invalid vertical line coordinates.',
      });
      return false;
    }
  } else {
    socket.emit('invalid-move', { message: 'Invalid line type.' });
    return false;
  }

  gameState.lines[lineKey] = gameState.currentPlayer;
  gameState.lastMove = { lineKey };
  gameState.totalMoves++;

  let boxScored = false;

  const checkAndScoreBox = (br: number, bc: number) => {
    const boxKey = `${br}-${bc}`;
    if (gameState.boxes[boxKey]) return;

    const top = `h-${br}-${bc}`;
    const bottom = `h-${br + 1}-${bc}`;
    const left = `v-${br}-${bc}`;
    const right = `v-${br}-${bc + 1}`;

    if (
      gameState.lines[top]
      && gameState.lines[bottom]
      && gameState.lines[left]
      && gameState.lines[right]
    ) {
      gameState.boxes[boxKey] = gameState.currentPlayer;
      if (gameState.currentPlayer === 1) {
        gameState.scores.player1++;
      } else {
        gameState.scores.player2++;
      }
      boxScored = true;
    }
  };

  if (type === 'h') {
    if (r > 0) checkAndScoreBox(r - 1, c);
    if (r < 4) checkAndScoreBox(r, c);
  } else {
    if (c > 0) checkAndScoreBox(r, c - 1);
    if (c < 4) checkAndScoreBox(r, c);
  }

  const completedBoxes = Object.keys(gameState.boxes).length;
  if (completedBoxes === 16) {
    if (gameState.scores.player1 > gameState.scores.player2) {
      gameState.winner = 'Player 1 wins!';
    } else if (gameState.scores.player2 > gameState.scores.player1) {
      gameState.winner = 'Player 2 wins!';
    } else {
      gameState.winner = 'Tie game!';
    }
  }

  if (!boxScored) {
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  }

  gameState.players.forEach((p) => (p.ready = false));
  return true;
};

export class DotsAndBoxesComputer {
  static async getAIMove(gameState: DotsAndBoxesGameState): Promise<{ lineKey: string }> {
    const aiPlayer = gameState.players.find((p) => p.isAI);
    const difficulty = aiPlayer?.difficulty || 'hard';

    let mistakeRate = 0;
    if (difficulty === 'easy') mistakeRate = 0.7;
    else if (difficulty === 'medium') mistakeRate = 0.4;

    if (Math.random() < mistakeRate) {
      const allLines: string[] = [];
      for (let r = 0; r <= 4; r++) {
        for (let c = 0; c <= 3; c++) allLines.push(`h-${r}-${c}`);
      }
      for (let r = 0; r <= 3; r++) {
        for (let c = 0; c <= 4; c++) allLines.push(`v-${r}-${c}`);
      }
      const unoccupiedLines = allLines.filter((line) => !gameState.lines[line]);
      if (unoccupiedLines.length > 0) {
        return { lineKey: unoccupiedLines[Math.floor(Math.random() * unoccupiedLines.length)] };
      }
    }

    return { lineKey: this.getHeuristicMove(gameState) };
  }

  private static getHeuristicMove(gameState: DotsAndBoxesGameState): string {
    const allLines: string[] = [];
    for (let r = 0; r <= 4; r++) {
      for (let c = 0; c <= 3; c++) allLines.push(`h-${r}-${c}`);
    }
    for (let r = 0; r <= 3; r++) {
      for (let c = 0; c <= 4; c++) allLines.push(`v-${r}-${c}`);
    }

    const unoccupiedLines = allLines.filter((line) => !gameState.lines[line]);
    if (unoccupiedLines.length === 0) return '';

    const getBoxLinesCount = (br: number, bc: number): { count: number; remaining: string[] } => {
      const lines = [
        `h-${br}-${bc}`,
        `h-${br + 1}-${bc}`,
        `v-${br}-${bc}`,
        `v-${br}-${bc + 1}`
      ];
      const drawn = lines.filter((l) => gameState.lines[l]);
      const undrawn = lines.filter((l) => !gameState.lines[l]);
      return { count: drawn.length, remaining: undrawn };
    };

    for (let r = 0; r <= 3; r++) {
      for (let c = 0; c <= 3; c++) {
        const { count, remaining } = getBoxLinesCount(r, c);
        if (count === 3 && remaining.length === 1) {
          return remaining[0];
        }
      }
    }

    const safeLines: string[] = [];
    const unsafeLines: string[] = [];

    for (const line of unoccupiedLines) {
      gameState.lines[line] = 2;
      let createsThree = false;

      const parts = line.split('-');
      const type = parts[0];
      const r = parseInt(parts[1], 10);
      const c = parseInt(parts[2], 10);

      const checkBox = (br: number, bc: number) => {
        const { count } = getBoxLinesCount(br, bc);
        if (count === 3) createsThree = true;
      };

      if (type === 'h') {
        if (r > 0) checkBox(r - 1, c);
        if (r < 4) checkBox(r, c);
      } else {
        if (c > 0) checkBox(r, c - 1);
        if (c < 4) checkBox(r, c);
      }

      delete gameState.lines[line];

      if (createsThree) {
        unsafeLines.push(line);
      } else {
        safeLines.push(line);
      }
    }

    if (safeLines.length > 0) {
      return safeLines[Math.floor(Math.random() * safeLines.length)];
    }

    return unsafeLines[Math.floor(Math.random() * unsafeLines.length)];
  }
}

export const getAIMove = (gameState: DotsAndBoxesGameState) => DotsAndBoxesComputer.getAIMove(gameState);
