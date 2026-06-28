import { callDeepSeek } from './deepseek.js';
import { getSystemPrompt, getRecapPrompt } from './prompts.js';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

function getGameName(gameId: string): string {
  switch (gameId) {
    case 'black-hole': return 'Black Hole';
    case 'connect-four': return 'Connect Four';
    case 'dots-and-boxes': return 'Dots and Boxes';
    case 'battleship': return 'Battleship';
    default: return 'Arcade Game';
  }
}

function formatMoveHistory(gameId: string, gameState: any): string {
  const history = gameState.moveHistory || [];
  if (history.length === 0) return 'No moves were recorded.';

  const logs: string[] = [];

  if (gameId === 'black-hole') {
    history.forEach((move: any, index: number) => {
      logs.push(`Move ${index + 1}: Player ${move.player} placed tile #${Math.floor(index / 2) + 1} at row ${move.row}, col ${move.col}`);
    });
    logs.push(`Final Scores: Player 1 (Blue): ${gameState.scores?.player1}, Player 2 (Red): ${gameState.scores?.player2}`);
  } else if (gameId === 'connect-four') {
    history.forEach((move: any, index: number) => {
      logs.push(`Move ${index + 1}: Player ${move.player} dropped a disc in column ${move.col + 1}`);
    });
  } else if (gameId === 'dots-and-boxes') {
    history.forEach((move: any, index: number) => {
      const parts = move.lineKey?.split('-');
      if (parts && parts.length === 3) {
        const [type, r, c] = parts;
        const typeStr = type === 'h' ? 'horizontal' : 'vertical';
        logs.push(`Move ${index + 1}: Player ${move.player} drew a ${typeStr} line at row ${r}, col ${c}`);
      }
    });
    logs.push(`Final Scores: Player 1 (Blue): ${gameState.scores?.player1}, Player 2 (Red): ${gameState.scores?.player2}`);
  } else if (gameId === 'battleship') {
    history.forEach((move: any, index: number) => {
      if (move.action === 'place-ships') {
        logs.push(`Move ${index + 1}: Player ${move.player} placed their fleet.`);
      } else if (move.action === 'shoot') {
        const result = move.hit ? 'Hit' : 'Miss';
        const sunk = move.sunkShipName ? ` (${move.sunkShipName} sunk!)` : '';
        logs.push(`Move ${index + 1}: Player ${move.player} shot at row ${move.row + 1}, col ${move.col + 1} -> ${result}${sunk}`);
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

  let analysis = '';
  if (gameId === 'black-hole') {
    analysis = `Player 1 ended with a score of ${gameState.scores?.player1 || 0}, while Player 2 finished with ${gameState.scores?.player2 || 0}. Since the objective is to have the lower sum of tiles adjacent to the final empty circle (the Black Hole), the tactical placements near the end proved decisive. Both players carefully balanced high and low tiles, trying to push high numbers onto their opponent.`;
  } else if (gameId === 'connect-four') {
    analysis = `Discs were dropped in rapid succession across the columns. The critical struggle took place in the central columns, where both players fought for positional dominance. The game ended when a player found a critical path to connect four, or when the board became fully saturated.`;
  } else if (gameId === 'dots-and-boxes') {
    analysis = `The battle for boxes was intense, with Player 1 scoring ${gameState.scores?.player1 || 0} boxes and Player 2 scoring ${gameState.scores?.player2 || 0} boxes. The opening phase saw a cautious layout of lines, avoiding early double-contact setups. A chain of box completions near the mid-game shifted the momentum.`;
  } else if (gameId === 'battleship') {
    analysis = `Both fleets were deployed on the 6x6 grid. The artillery phase began with players trading blind shots. Hits were registered on crucial ships, and key coordinates were defended or systematically bombarded until the last of the opponent's ships were sent to the bottom.`;
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
  const prompt = getRecapPrompt(getGameName(gameId), formattedHistory);

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
