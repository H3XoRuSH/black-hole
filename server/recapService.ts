import { callDeepSeek } from './deepseek.js';
import { getSystemPrompt, getRecapPrompt } from './prompts.js';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

function getGameName(gameId: string): string {
  switch (gameId) {
    case 'black-hole': return 'Black Hole';
    case 'connect-four': return 'Connect Four';
    case 'dots-and-boxes': return 'Dots and Boxes';
    case 'battleship': return 'Battleship';
    case 'checkers': return 'Checkers';
    case 'bingo': return 'Bingo';
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

export async function generateRecap(gameId: string, gameState: any): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    console.warn('DEEPSEEK_API_KEY is not configured. Using local mock generator.');
    return generateMockRecap(gameId, gameState);
  }

  const formattedHistory = formatMoveHistory(gameId, gameState);
  const playerNames = gameState.players?.map((p: any) => p.name).filter(Boolean) || [];
  const prompt = getRecapPrompt(getGameName(gameId), formattedHistory, gameId, playerNames);

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
