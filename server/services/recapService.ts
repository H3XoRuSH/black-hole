import { callDeepSeek, isDeepSeekConfigured } from './deepseek.js';
import { getSystemPrompt, getRecapPrompt, getRecapConversationPrompt } from './prompts.js';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function getGameName(gameId: string): string {
  switch (gameId) {
    case 'black-hole': return 'Black Hole';
    case 'connect-four': return 'Connect Four';
    case 'dots-and-boxes': return 'Dots and Boxes';
    case 'battleship': return 'Battleship';
    case 'checkers': return 'Checkers';
    case 'bingo': return 'Bingo';
    case 'pictionary': return 'Pictionary';
    default: return 'Arcade Game';
  }
}

function getPlayerName(players: any[], playerNum: number): string {
  const p = players?.find((p: any) => p.player === playerNum);
  return p?.name || `Player ${playerNum}`;
}

function formatMoveHistory(gameId: string, gameState: any): string {
  const history = gameState.moveHistory || [];
  if (history.length === 0) return 'No moves were recorded.';

  const logs: string[] = [];
  const p1Name = getPlayerName(gameState.players, 1);
  const p2Name = getPlayerName(gameState.players, 2);

  const playerRef = (playerNum: number) => {
    const name = getPlayerName(gameState.players, playerNum);
    if (gameId === 'bingo') {
      return name;
    }
    return `${name} (Player ${playerNum})`;
  };

  if (gameId === 'black-hole') {
    history.forEach((move: any, index: number) => {
      logs.push(`Move ${index + 1}: ${playerRef(move.player)} placed tile #${Math.floor(index / 2) + 1} at row ${move.row}, col ${move.col}`);
    });
    logs.push(`Final Scores: ${p1Name} (Blue): ${gameState.scores?.player1}, ${p2Name} (Red): ${gameState.scores?.player2}`);
  } else if (gameId === 'connect-four') {
    history.forEach((move: any, index: number) => {
      logs.push(`Move ${index + 1}: ${playerRef(move.player)} dropped a disc in column ${move.col + 1}`);
    });
  } else if (gameId === 'dots-and-boxes') {
    history.forEach((move: any, index: number) => {
      const parts = move.lineKey?.split('-');
      if (parts && parts.length === 3) {
        const [type, r, c] = parts;
        const typeStr = type === 'h' ? 'horizontal' : 'vertical';
        logs.push(`Move ${index + 1}: ${playerRef(move.player)} drew a ${typeStr} line at row ${r}, col ${c}`);
      }
    });
    logs.push(`Final Scores: ${p1Name} (Blue): ${gameState.scores?.player1}, ${p2Name} (Red): ${gameState.scores?.player2}`);
  } else if (gameId === 'battleship') {
    history.forEach((move: any, index: number) => {
      if (move.action === 'place-ships') {
        logs.push(`Move ${index + 1}: ${playerRef(move.player)} placed their fleet.`);
      } else if (move.action === 'shoot') {
        const result = move.hit ? 'Hit' : 'Miss';
        const sunk = move.sunkShipName ? ` (${move.sunkShipName} sunk!)` : '';
        logs.push(`Move ${index + 1}: ${playerRef(move.player)} shot at row ${move.row + 1}, col ${move.col + 1} -> ${result}${sunk}`);
      }
    });
  } else if (gameId === 'checkers') {
    history.forEach((move: any, index: number) => {
      const isCapture = Math.abs(move.toRow - move.fromRow) === 2;
      const isPromotion = (move.player === 1 && move.toRow === 0) || (move.player === 2 && move.toRow === 7);
      let desc = `moved from (${move.fromRow},${move.fromCol}) to (${move.toRow},${move.toCol})`;
      if (isCapture) desc += ' (capture)';
      if (isPromotion) desc += ' (king promotion)';
      logs.push(`Move ${index + 1}: ${playerRef(move.player)} ${desc}`);
    });
  } else if (gameId === 'pictionary') {
    history.forEach((move: any, index: number) => {
      if (move.action === 'guess') {
        logs.push(`Round ${Math.floor(index / gameState.players.length) + 1}: ${playerRef(move.player)} guessed "${move.guess}"`);
      }
    });
    const pScores = gameState.players?.map((p: any) => `${p.name || 'Player ' + p.player}: ${gameState.scores?.[p.player] || 0}`).join(', ');
    logs.push(`Final Scores: ${pScores}`);
  } else if (gameId === 'bingo') {
    let drawIdx = 0;
    history.forEach((move: any, index: number) => {
      if (move.action === 'draw') {
        const num = gameState.drawnNumbers?.[drawIdx++];
        const letter = num ? (num <= 15 ? 'B' : num <= 30 ? 'I' : num <= 45 ? 'N' : num <= 60 ? 'G' : 'O') : '?';
        logs.push(`Move ${index + 1}: Host drew ${letter} ${num}`);
      } else if (move.action === 'daub') {
        logs.push(`Move ${index + 1}: ${playerRef(move.player)} daubed row ${move.row}, col ${move.col}`);
      } else if (move.action === 'call-bingo') {
        logs.push(`Move ${index + 1}: ${playerRef(move.player)} called BINGO!`);
      }
    });
  }

  logs.push(`Outcome: ${gameState.winner}`);
  return logs.join('\n');
}

function generateMockRecap(gameId: string, gameState: any): string {
  const gameName = getGameName(gameId);
  const winner = gameState.winner || 'Tie game!';
  const totalMoves = gameState.totalMoves;
  const p1Name = getPlayerName(gameState.players, 1);
  const p2Name = getPlayerName(gameState.players, 2);

  let analysis = '';
  if (gameId === 'black-hole') {
    analysis = `${p1Name} ended with a score of ${gameState.scores?.player1 || 0}, while ${p2Name} finished with ${gameState.scores?.player2 || 0}. Since the objective is to have the lower sum of tiles adjacent to the final empty circle (the Black Hole), the tactical placements near the end proved decisive. Both players carefully balanced high and low tiles, trying to push high numbers onto their opponent.`;
  } else if (gameId === 'connect-four') {
    analysis = `Discs were dropped in rapid succession across the columns. The critical struggle took place in the central columns, where both players fought for positional dominance. The game ended when a player found a critical path to connect four, or when the board became fully saturated.`;
  } else if (gameId === 'dots-and-boxes') {
    analysis = `The battle for boxes was intense, with ${p1Name} scoring ${gameState.scores?.player1 || 0} boxes and ${p2Name} scoring ${gameState.scores?.player2 || 0} boxes. The opening phase saw a cautious layout of lines, avoiding early double-contact setups. A chain of box completions near the mid-game shifted the momentum.`;
  } else if (gameId === 'battleship') {
    analysis = `Both fleets were deployed on the 6x6 grid. The artillery phase began with players trading blind shots. Hits were registered on crucial ships, and key coordinates were defended or systematically bombarded until the last of the opponent's ships were sent to the bottom.`;
  } else if (gameId === 'checkers') {
    const capCount = gameState.moveHistory?.filter((m: any) => Math.abs(m.toRow - m.fromRow) === 2).length || 0;
    const promoCount = gameState.moveHistory?.filter((m: any) => (m.player === 1 && m.toRow === 0) || (m.player === 2 && m.toRow === 7)).length || 0;
    analysis = `The board saw aggressive play from the opening moves.`;
    if (capCount > 0) analysis += ` A total of ${capCount} capture${capCount > 1 ? 's' : ''} were made, steadily thinning the opponent's ranks.`;
    if (promoCount > 0) analysis += ` ${promoCount} piece${promoCount > 1 ? 's were' : ' was'} promoted to king, adding powerful ranged threats.`;
    analysis += ` The endgame came down to piece advantage and positional control, where one player outmaneuvered the other to seal the victory.`;
  } else if (gameId === 'pictionary') {
    const totalRounds = gameState.roundNumber || 0;
    const wordCount = gameState.wordHistory?.length || 0;
    const totalGuesses = (Object.values(gameState.scores || {}) as number[]).reduce((a, b) => a + b, 0);
    analysis = `The team played ${totalRounds} rounds of cooperative Pictionary. Each player took turns drawing while the rest guessed. The team managed to correctly guess ${totalGuesses} words out of ${wordCount} total rounds.`;
  } else if (gameId === 'bingo') {
    const totalDraws = gameState.drawnNumbers?.length || 0;
    analysis = `The caller drew ${totalDraws} numbers out of 75 total. Players daubed their cards, watching their rows, columns, and diagonals fill up. The tension built with every call until one player finally completed a winning pattern and shouted BINGO!`;

    return `### 🎮 ${gameName} Match Recap (Simulated AI)

**Outcome:** **${winner}**

${analysis}

The match lasted for **${totalMoves}** total moves. Players tracked their cards closely as each number was called, celebrating every daub that brought them closer to victory.

*Note: Set the \`DEEPSEEK_API_KEY\` environment variable to enable live AI-generated summaries from DeepSeek.*`;
  }

  return `### 🎮 ${gameName} Match Recap (Simulated AI)

**Outcome:** **${winner}**

${analysis}

The match lasted for **${totalMoves}** total moves. In the early game, both players laid down solid foundations. The mid-game brought several tense moments as defensive blocks were forced. Ultimately, the endgame strategy separated the victor from the vanquished.

*Note: Set the \`DEEPSEEK_API_KEY\` environment variable to enable live AI-generated summaries from DeepSeek.*`;
}

function calculateGameStats(gameId: string, gameState: any): string {
  if (!gameState) return '';
  const p1Name = getPlayerName(gameState.players, 1);
  const p2Name = getPlayerName(gameState.players, 2);
  const stats: string[] = [];

  if (gameId === 'black-hole') {
    const taken = Object.keys(gameState.circles || {});
    const allPositions: string[] = [];
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= r; c++) {
        allPositions.push(`${r}-${c}`);
      }
    }
    const emptyCircle = allPositions.find((pos) => !taken.includes(pos));
    if (emptyCircle) {
      stats.push(`Final Black Hole position: Row ${emptyCircle.split('-')[0]}, Col ${emptyCircle.split('-')[1]}`);

      const [r, c] = emptyCircle.split('-').map(Number);
      const neighbors: string[] = [];
      if (c > 1) neighbors.push(`${r}-${c - 1}`);
      if (c < r) neighbors.push(`${r}-${c + 1}`);
      if (r > 1) {
        if (c <= r - 1) neighbors.push(`${r - 1}-${c}`);
        if (c > 1) neighbors.push(`${r - 1}-${c - 1}`);
      }
      if (r < 6) {
        neighbors.push(`${r + 1}-${c}`);
        if (c <= r) neighbors.push(`${r + 1}-${c + 1}`);
      }

      const p1Tiles: number[] = [];
      const p2Tiles: number[] = [];
      neighbors.forEach((pos) => {
        const cell = gameState.circles?.[pos];
        if (cell) {
          if (cell.player === 1) p1Tiles.push(cell.turn);
          else if (cell.player === 2) p2Tiles.push(cell.turn);
        }
      });
      stats.push(`${p1Name} (Blue) tiles sucked into the Black Hole: [${p1Tiles.join(', ') || 'None'}] (Sum: ${p1Tiles.reduce((a, b) => a + b, 0)})`);
      stats.push(`${p2Name} (Red) tiles sucked into the Black Hole: [${p2Tiles.join(', ') || 'None'}] (Sum: ${p2Tiles.reduce((a, b) => a + b, 0)})`);
    }

    const history = gameState.moveHistory || [];
    if (history.length > 0) {
      const lastMove = history[history.length - 1];
      const lastPlayerName = getPlayerName(gameState.players, lastMove.player);
      stats.push(`Final move made by: ${lastPlayerName} placing tile #${Math.floor((history.length - 1) / 2) + 1} at Row ${lastMove.row}, Col ${lastMove.col}, leaving the remaining empty circle as the Black Hole.`);
    }
  } else if (gameId === 'connect-four') {
    const board = gameState.board || [];
    const rows = board.length;
    const cols = board[0]?.length || 0;

    let winType = '';
    let winLine = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = board[r][c];
        if (val === null) continue;
        if (c + 3 < cols && board[r][c + 1] === val && board[r][c + 2] === val && board[r][c + 3] === val) {
          winType = 'horizontal';
          winLine = `Row ${r + 1}, columns ${c + 1} through ${c + 4}`;
        }
        if (r + 3 < rows && board[r + 1][c] === val && board[r + 2][c] === val && board[r + 3][c] === val) {
          winType = 'vertical';
          winLine = `Column ${c + 1}, rows ${r + 1} through ${r + 4}`;
        }
        if (r + 3 < rows && c + 3 < cols && board[r + 1][c + 1] === val && board[r + 2][c + 2] === val && board[r + 3][c + 3] === val) {
          winType = 'diagonal down-right';
          winLine = `From Row ${r + 1},Col ${c + 1} down to Row ${r + 4},Col ${c + 4}`;
        }
        if (r - 3 >= 0 && c + 3 < cols && board[r - 1][c + 1] === val && board[r - 2][c + 2] === val && board[r - 3][c + 3] === val) {
          winType = 'diagonal up-right';
          winLine = `From Row ${r + 1},Col ${c + 1} up to Row ${r - 2},Col ${c + 4}`;
        }
      }
    }
    if (winType) {
      stats.push(`Winning combination: ${winType} line (${winLine})`);
    }

    let p1Mid = 0;
    let p2Mid = 0;
    for (let r = 0; r < rows; r++) {
      if (board[r]?.[3] === 1) p1Mid++;
      else if (board[r]?.[3] === 2) p2Mid++;
    }
    stats.push(`Middle Column Dominance (Col 4): ${p1Name} (Blue) has ${p1Mid} discs, ${p2Name} (Red) has ${p2Mid} discs.`);
  } else if (gameId === 'dots-and-boxes') {
    const history = gameState.moveHistory || [];
    const turns: { player: number; moves: number }[] = [];
    let curTurn: { player: number; moves: number } | null = null;
    for (const m of history) {
      if (!curTurn || curTurn.player !== m.player) {
        curTurn = { player: m.player, moves: 1 };
        turns.push(curTurn);
      } else {
        curTurn.moves++;
      }
    }
    let p1Longest = 0;
    let p2Longest = 0;
    turns.forEach((t) => {
      const chain = Math.max(0, t.moves - 1);
      if (t.player === 1) p1Longest = Math.max(p1Longest, chain);
      else if (t.player === 2) p2Longest = Math.max(p2Longest, chain);
    });
    stats.push(`Longest single-turn box completion chain: ${p1Name}: ${p1Longest} box(es), ${p2Name}: ${p2Longest} box(es).`);
    stats.push(`Total lines drawn: ${history.length} out of 40 lines.`);
    stats.push(`Final boxes completed score: ${p1Name}: ${gameState.scores?.player1 || 0}, ${p2Name}: ${gameState.scores?.player2 || 0}.`);
  } else if (gameId === 'battleship') {
    let p1Shots = 0, p1Hits = 0;
    let p2Shots = 0, p2Hits = 0;
    const sunkList: string[] = [];
    (gameState.moveHistory || []).forEach((m: any) => {
      if (m.action === 'shoot') {
        if (m.player === 1) {
          p1Shots++;
          if (m.hit) {
            p1Hits++;
          }
        } else if (m.player === 2) {
          p2Shots++;
          if (m.hit) {
            p2Hits++;
          }
        }
        if (m.sunkShipName) {
          const shooterName = getPlayerName(gameState.players, m.player);
          sunkList.push(`${shooterName} sunk the opponent's ${m.sunkShipName}`);
        }
      }
    });
    const p1Acc = p1Shots > 0 ? Math.round((p1Hits / p1Shots) * 100) : 0;
    const p2Acc = p2Shots > 0 ? Math.round((p2Hits / p2Shots) * 100) : 0;
    stats.push(`Artillery Accuracy: ${p1Name}: ${p1Acc}% (${p1Hits}/${p1Shots} hits), ${p2Name}: ${p2Acc}% (${p2Hits}/${p2Shots} hits).`);
    if (sunkList.length > 0) {
      stats.push(`Sunk Ships order: ${sunkList.join(', ')}`);
    }
  } else if (gameId === 'checkers') {
    let p1Count = 0;
    let p2Count = 0;
    let p1Kings = 0;
    let p2Kings = 0;
    const board = gameState.board || [];
    board.forEach((row: number[]) => {
      row.forEach((cell: number) => {
        if (cell === 1) {
          p1Count++;
        } else if (cell === 3) {
          p1Count++;
          p1Kings++;
        } else if (cell === 2) {
          p2Count++;
        } else if (cell === 4) {
          p2Count++;
          p2Kings++;
        }
      });
    });
    const p1Captured = 12 - p2Count;
    const p2Captured = 12 - p1Count;
    stats.push(`Material Balance: ${p1Name} has ${p1Count} pieces remaining (${p1Kings} kings), ${p2Name} has ${p2Count} pieces remaining (${p2Kings} kings).`);
    stats.push(`Captured pieces: ${p1Name} captured ${p1Captured} pieces, ${p2Name} captured ${p2Captured} pieces.`);
  }

  return stats.join('\n');
}

export async function recapConversation(
  gameId: string,
  gameState: any,
  originalRecap: string,
  conversationHistory: Array<{ role: string; content: string }>,
  question: string
): Promise<string> {
  if (!isDeepSeekConfigured) {
    return `[Simulated AI] That's an interesting question about the ${getGameName(gameId)} match! In a live AI scenario, I'd analyze the move data and original recap to give you a detailed answer. Set the \`DEEPSEEK_API_KEY\` environment variable to enable live AI answers.`;
  }

  const formattedHistory = formatMoveHistory(gameId, gameState);
  const sortedPlayers = [...(gameState.players || [])].sort((a: any, b: any) => a.player - b.player);
  const playerNames = sortedPlayers.map((p: any) => p.name).filter(Boolean);
  const statsSummary = calculateGameStats(gameId, gameState);
  const conversationPrompt = getRecapConversationPrompt(
    getGameName(gameId), formattedHistory, originalRecap, question, gameId, playerNames, statsSummary
  );

  try {
    const answer = await callDeepSeek({
      messages: [
        { role: 'system', content: getSystemPrompt() },
        ...conversationHistory,
        { role: 'user', content: conversationPrompt }
      ],
      temperature: 0.7,
      maxTokens: 800
    });
    return answer;
  } catch (error) {
    console.error('Error calling DeepSeek API for follow-up:', error);
    return `*Sorry, I couldn't process that question due to an API error.*`;
  }
}

export async function generateRecap(gameId: string, gameState: any): Promise<string> {
  if (!DEEPSEEK_API_KEY && !OPENROUTER_API_KEY) {
    console.warn('LLM API keys are not configured. Using local mock generator.');
    return generateMockRecap(gameId, gameState);
  }

  const formattedHistory = formatMoveHistory(gameId, gameState);
  const sortedPlayers = [...(gameState.players || [])].sort((a: any, b: any) => a.player - b.player);
  const playerNames = sortedPlayers.map((p: any) => p.name).filter(Boolean);
  const statsSummary = calculateGameStats(gameId, gameState);
  const prompt = getRecapPrompt(getGameName(gameId), formattedHistory, gameId, playerNames, statsSummary);

  try {
    const recap = await callDeepSeek({
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 500
    });
    return recap;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return `*Failed to generate AI recap due to an API error.* \n\n**Fallback Summary:** The game ended with: **${gameState.winner}** after ${gameState.totalMoves} moves.`;
  }
}
