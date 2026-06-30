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

const LINE_KEYS: string[] = [];
for (let r = 0; r <= 4; r++) {
  for (let c = 0; c <= 3; c++) LINE_KEYS.push(`h-${r}-${c}`);
}
for (let r = 0; r <= 3; r++) {
  for (let c = 0; c <= 4; c++) LINE_KEYS.push(`v-${r}-${c}`);
}

const KEY_TO_INDEX: Record<string, number> = {};
LINE_KEYS.forEach((key, index) => {
  KEY_TO_INDEX[key] = index;
});

const BOX_TO_LINES: number[][] = [];
const LINE_TO_BOXES: number[][] = Array.from({ length: 40 }, () => []);

for (let br = 0; br < 4; br++) {
  for (let bc = 0; bc < 4; bc++) {
    const boxIdx = br * 4 + bc;
    const top = KEY_TO_INDEX[`h-${br}-${bc}`];
    const bottom = KEY_TO_INDEX[`h-${br + 1}-${bc}`];
    const left = KEY_TO_INDEX[`v-${br}-${bc}`];
    const right = KEY_TO_INDEX[`v-${br}-${bc + 1}`];

    BOX_TO_LINES[boxIdx] = [top, bottom, left, right];

    LINE_TO_BOXES[top].push(boxIdx);
    LINE_TO_BOXES[bottom].push(boxIdx);
    LINE_TO_BOXES[left].push(boxIdx);
    LINE_TO_BOXES[right].push(boxIdx);
  }
}

/**
 * DotsAndBoxesComputer - AI Move Generator for Dots and Boxes.
 * Supports three difficulty levels:
 * - Easy: 70% mistake rate. Uses a basic static heuristic (completes boxes if possible, plays safe moves, blocks opponent).
 * - Medium: 40% mistake rate. Uses a 3-ply alpha-beta minimax search.
 * - Hard: 0% mistake rate. Uses a 4-ply minimax search in the early game and searches to the
 *         end of the game (full minimax) when 12 or fewer empty lines remain.
 *
 * Turn-Keeping Minimax Logic:
 * - Completing a box allows the player to keep their turn. This is handled by recursively calling
 *   minimax with the same maximizing/minimizing player active but with reduced depth.
 * - Alpha-beta pruning and move ordering (completing boxes first, safe moves next, unsafe moves last)
 *   ensure the search completes in a few milliseconds.
 */
export class DotsAndBoxesComputer {
  static async getAIMove(gameState: DotsAndBoxesGameState): Promise<{ lineKey: string }> {
    const aiPlayer = gameState.players.find((p) => p.isAI);
    const difficulty = aiPlayer?.difficulty || 'hard';

    let mistakeRate = 0;
    if (difficulty === 'easy') mistakeRate = 0.7;
    else if (difficulty === 'medium') mistakeRate = 0.4;

    if (Math.random() < mistakeRate) {
      const unoccupiedLines = LINE_KEYS.filter((line) => !gameState.lines[line]);
      if (unoccupiedLines.length > 0) {
        return { lineKey: unoccupiedLines[Math.floor(Math.random() * unoccupiedLines.length)] };
      }
    }

    if (difficulty === 'easy') {
      return { lineKey: this.getStaticHeuristicMove(gameState) };
    } else if (difficulty === 'medium') {
      return { lineKey: this.getBestMoveUsingMinimax(gameState, 3) };
    } else {
      const unoccupiedCount = LINE_KEYS.filter((line) => !gameState.lines[line]).length;
      const depth = unoccupiedCount <= 12 ? unoccupiedCount : 4;
      return { lineKey: this.getBestMoveUsingMinimax(gameState, depth) };
    }
  }

  private static getStaticHeuristicMove(gameState: DotsAndBoxesGameState): string {
    const unoccupiedLines = LINE_KEYS.filter((line) => !gameState.lines[line]);
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

  private static getBestMoveUsingMinimax(
    gameState: DotsAndBoxesGameState,
    depth: number
  ): string {
    const aiPlayer = gameState.currentPlayer;
    const opponentPlayer = aiPlayer === 1 ? 2 : 1;

    const linesState = new Array(40);
    for (let i = 0; i < 40; i++) {
      linesState[i] = !!gameState.lines[LINE_KEYS[i]];
    }

    const boxesState = new Uint8Array(16);
    let completedBoxesCount = 0;
    for (let br = 0; br < 4; br++) {
      for (let bc = 0; bc < 4; bc++) {
        const boxIdx = br * 4 + bc;
        const boxKey = `${br}-${bc}`;
        const owner = gameState.boxes[boxKey] || 0;
        boxesState[boxIdx] = owner;
        if (owner !== 0) {
          completedBoxesCount++;
        }
      }
    }

    const unoccupied: number[] = [];
    for (let i = 0; i < 40; i++) {
      if (!linesState[i]) unoccupied.push(i);
    }

    if (unoccupied.length === 0) return '';

    const priorities = new Int32Array(unoccupied.length);
    for (let k = 0; k < unoccupied.length; k++) {
      const lineIdx = unoccupied[k];
      let completesBox = false;
      let createsThree = false;
      const boxes = LINE_TO_BOXES[lineIdx];
      for (let b = 0; b < boxes.length; b++) {
        const boxIdx = boxes[b];
        const boxLines = BOX_TO_LINES[boxIdx];
        let drawnCount = 0;
        if (linesState[boxLines[0]]) drawnCount++;
        if (linesState[boxLines[1]]) drawnCount++;
        if (linesState[boxLines[2]]) drawnCount++;
        if (linesState[boxLines[3]]) drawnCount++;

        if (drawnCount === 3) completesBox = true;
        if (drawnCount === 2) createsThree = true;
      }
      if (completesBox) priorities[k] = 3;
      else if (createsThree) priorities[k] = 1;
      else priorities[k] = 2;
    }

    const pairs = unoccupied.map((lineIdx, k) => ({ lineIdx, priority: priorities[k] }));
    pairs.sort((a, b) => b.priority - a.priority);

    let bestMove = pairs[0].lineIdx;
    let bestVal = -Infinity;

    for (let k = 0; k < pairs.length; k++) {
      const lineIdx = pairs[k].lineIdx;
      linesState[lineIdx] = true;

      const boxes = LINE_TO_BOXES[lineIdx];
      let completedCount = 0;
      const completedBoxIndices: number[] = [];
      for (let b = 0; b < boxes.length; b++) {
        const boxIdx = boxes[b];
        const boxLines = BOX_TO_LINES[boxIdx];
        if (linesState[boxLines[0]] && linesState[boxLines[1]] && linesState[boxLines[2]] && linesState[boxLines[3]]) {
          boxesState[boxIdx] = aiPlayer;
          completedBoxIndices.push(boxIdx);
          completedCount++;
        }
      }

      const nextUnoccupied = new Array(unoccupied.length - 1);
      let index = 0;
      for (let u = 0; u < unoccupied.length; u++) {
        if (unoccupied[u] !== lineIdx) {
          nextUnoccupied[index++] = unoccupied[u];
        }
      }

      let val: number;
      if (completedCount > 0) {
        val = fastMinimax(
          linesState,
          boxesState,
          completedBoxesCount + completedCount,
          aiPlayer,
          depth - 1,
          true,
          -Infinity,
          Infinity,
          aiPlayer,
          opponentPlayer,
          nextUnoccupied
        );
      } else {
        val = fastMinimax(
          linesState,
          boxesState,
          completedBoxesCount,
          opponentPlayer,
          depth - 1,
          false,
          -Infinity,
          Infinity,
          aiPlayer,
          opponentPlayer,
          nextUnoccupied
        );
      }

      for (let b = 0; b < completedBoxIndices.length; b++) {
        boxesState[completedBoxIndices[b]] = 0;
      }
      linesState[lineIdx] = false;

      if (val > bestVal) {
        bestVal = val;
        bestMove = lineIdx;
      }
    }

    return LINE_KEYS[bestMove];
  }
}

const fastMinimax = (
  linesState: boolean[],
  boxesState: Uint8Array,
  completedBoxesCount: number,
  currentPlayer: number,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: number,
  opponentPlayer: number,
  unoccupied: number[]
): number => {
  if (completedBoxesCount === 16) {
    let score = 0;
    for (let j = 0; j < 16; j++) {
      if (boxesState[j] === aiPlayer) score++;
      else if (boxesState[j] === opponentPlayer) score--;
    }
    return score * 1000;
  }
  if (depth === 0 || unoccupied.length === 0) {
    let score = 0;
    for (let j = 0; j < 16; j++) {
      if (boxesState[j] === aiPlayer) score++;
      else if (boxesState[j] === opponentPlayer) score--;
    }
    return score;
  }

  const priorities = new Int32Array(unoccupied.length);
  for (let k = 0; k < unoccupied.length; k++) {
    const lineIdx = unoccupied[k];
    let completesBox = false;
    let createsThree = false;
    const boxes = LINE_TO_BOXES[lineIdx];
    for (let b = 0; b < boxes.length; b++) {
      const boxIdx = boxes[b];
      const boxLines = BOX_TO_LINES[boxIdx];
      let drawnCount = 0;
      if (linesState[boxLines[0]]) drawnCount++;
      if (linesState[boxLines[1]]) drawnCount++;
      if (linesState[boxLines[2]]) drawnCount++;
      if (linesState[boxLines[3]]) drawnCount++;

      if (drawnCount === 3) completesBox = true;
      if (drawnCount === 2) createsThree = true;
    }
    if (completesBox) priorities[k] = 3;
    else if (createsThree) priorities[k] = 1;
    else priorities[k] = 2;
  }

  const sortedUnoccupied = unoccupied.slice();
  const pairs = sortedUnoccupied.map((lineIdx, k) => ({ lineIdx, priority: priorities[k] }));
  pairs.sort((a, b) => b.priority - a.priority);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let k = 0; k < pairs.length; k++) {
      const lineIdx = pairs[k].lineIdx;
      linesState[lineIdx] = true;

      const boxes = LINE_TO_BOXES[lineIdx];
      let completedCount = 0;
      const completedBoxIndices: number[] = [];
      for (let b = 0; b < boxes.length; b++) {
        const boxIdx = boxes[b];
        const boxLines = BOX_TO_LINES[boxIdx];
        if (linesState[boxLines[0]] && linesState[boxLines[1]] && linesState[boxLines[2]] && linesState[boxLines[3]]) {
          boxesState[boxIdx] = aiPlayer;
          completedBoxIndices.push(boxIdx);
          completedCount++;
        }
      }

      const nextUnoccupied = new Array(unoccupied.length - 1);
      let index = 0;
      for (let u = 0; u < unoccupied.length; u++) {
        if (unoccupied[u] !== lineIdx) {
          nextUnoccupied[index++] = unoccupied[u];
        }
      }

      let val: number;
      if (completedCount > 0) {
        val = fastMinimax(
          linesState,
          boxesState,
          completedBoxesCount + completedCount,
          aiPlayer,
          depth - 1,
          true,
          alpha,
          beta,
          aiPlayer,
          opponentPlayer,
          nextUnoccupied
        );
      } else {
        val = fastMinimax(
          linesState,
          boxesState,
          completedBoxesCount,
          opponentPlayer,
          depth - 1,
          false,
          alpha,
          beta,
          aiPlayer,
          opponentPlayer,
          nextUnoccupied
        );
      }

      for (let b = 0; b < completedBoxIndices.length; b++) {
        boxesState[completedBoxIndices[b]] = 0;
      }
      linesState[lineIdx] = false;

      maxEval = Math.max(maxEval, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let k = 0; k < pairs.length; k++) {
      const lineIdx = pairs[k].lineIdx;
      linesState[lineIdx] = true;

      const boxes = LINE_TO_BOXES[lineIdx];
      let completedCount = 0;
      const completedBoxIndices: number[] = [];
      for (let b = 0; b < boxes.length; b++) {
        const boxIdx = boxes[b];
        const boxLines = BOX_TO_LINES[boxIdx];
        if (linesState[boxLines[0]] && linesState[boxLines[1]] && linesState[boxLines[2]] && linesState[boxLines[3]]) {
          boxesState[boxIdx] = opponentPlayer;
          completedBoxIndices.push(boxIdx);
          completedCount++;
        }
      }

      const nextUnoccupied = new Array(unoccupied.length - 1);
      let index = 0;
      for (let u = 0; u < unoccupied.length; u++) {
        if (unoccupied[u] !== lineIdx) {
          nextUnoccupied[index++] = unoccupied[u];
        }
      }

      let val: number;
      if (completedCount > 0) {
        val = fastMinimax(
          linesState,
          boxesState,
          completedBoxesCount + completedCount,
          opponentPlayer,
          depth - 1,
          false,
          alpha,
          beta,
          aiPlayer,
          opponentPlayer,
          nextUnoccupied
        );
      } else {
        val = fastMinimax(
          linesState,
          boxesState,
          completedBoxesCount,
          aiPlayer,
          depth - 1,
          true,
          alpha,
          beta,
          aiPlayer,
          opponentPlayer,
          nextUnoccupied
        );
      }

      for (let b = 0; b < completedBoxIndices.length; b++) {
        boxesState[completedBoxIndices[b]] = 0;
      }
      linesState[lineIdx] = false;

      minEval = Math.min(minEval, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getAIMove = (gameState: DotsAndBoxesGameState) => DotsAndBoxesComputer.getAIMove(gameState);
