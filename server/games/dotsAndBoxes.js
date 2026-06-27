export const createInitialState = (playerId) => {
  return {
    lines: {}, // 'h-r-c' or 'v-r-c' -> player number (1 or 2)
    boxes: {}, // 'r-c' -> player number (1 or 2)
    scores: { player1: 0, player2: 0 },
    currentPlayer: 1,
    totalMoves: 0,
    winner: '',
    players: [{ id: playerId, player: 1, ready: false }],
  };
};

export const resetState = (players) => {
  return {
    lines: {},
    boxes: {},
    scores: { player1: 0, player2: 0 },
    currentPlayer: 1,
    totalMoves: 0,
    winner: '',
    players: players.map(p => ({ ...p, ready: false })),
  };
};

export const makeMove = (room, socket, data) => {
  const { lineKey } = data; // e.g. 'h-0-0' or 'v-1-2'
  const gameState = room.gameState;

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
      socket.emit('invalid-move', { message: 'Invalid horizontal line coordinates.' });
      return false;
    }
  } else if (type === 'v') {
    if (r < 0 || r > 3 || c < 0 || c > 4) {
      socket.emit('invalid-move', { message: 'Invalid vertical line coordinates.' });
      return false;
    }
  } else {
    socket.emit('invalid-move', { message: 'Invalid line type.' });
    return false;
  }

  // Claim the line
  gameState.lines[lineKey] = gameState.currentPlayer;
  gameState.totalMoves++;

  let boxScored = false;

  const checkAndScoreBox = (br, bc) => {
    const boxKey = `${br}-${bc}`;
    if (gameState.boxes[boxKey]) return;

    const top = `h-${br}-${bc}`;
    const bottom = `h-${br + 1}-${bc}`;
    const left = `v-${br}-${bc}`;
    const right = `v-${br}-${bc + 1}`;

    if (
      gameState.lines[top] &&
      gameState.lines[bottom] &&
      gameState.lines[left] &&
      gameState.lines[right]
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

  // Check if game is over (16 boxes completed)
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

  // If no box was completed, switch player turn
  if (!boxScored) {
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  }

  gameState.players.forEach((p) => (p.ready = false));
  return true;
};
