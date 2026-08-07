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
    case 'snakes-ladders': return 'Snakes and Ladders';
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
  } else if (gameId === 'snakes-ladders') {
    history.forEach((move: any, index: number) => {
      let desc = `rolled a ${move.roll} and moved from ${move.from} to ${move.to}`;
      if (move.snakeOrLadder === 'snake') {
        desc += ` and slid down a snake to ${move.finalTo}`;
      } else if (move.snakeOrLadder === 'ladder') {
        desc += ` and climbed a ladder to ${move.finalTo}`;
      }
      logs.push(`Move ${index + 1}: ${playerRef(move.player)} ${desc}`);
    });
  }

  logs.push(`Outcome: ${gameState.winner}`);
  return logs.join('\n');
}

function generateMockRecap(gameId: string, gameState: any): string {
  const gameName = getGameName(gameId);
  const winner = gameState.winner || 'Tie game!';
  const totalMoves = gameState.totalMoves || 0;
  const p1Name = getPlayerName(gameState.players, 1);
  const p2Name = getPlayerName(gameState.players, 2);

  let mockParagraph = '';

  if (gameId === 'black-hole') {
    const p1Score = gameState.scores?.player1 || 0;
    const p2Score = gameState.scores?.player2 || 0;
    const diff = Math.abs(p1Score - p2Score);
    const vibe = diff <= 3 ? 'nail-biter thriller' : 'commanding tactical masterclass';
    mockParagraph = `What a ${vibe} in **${gameName}**! ${p1Name} and ${p2Name} traded blows across ${totalMoves} turns, carefully maneuvering high-numbered tiles away from danger while trying to nudge toxic numbers onto each other. The **devastating final tile placement** sealed the trap around the Black Hole, locking in a final score of ${p1Name}: ${p1Score} to ${p2Name}: ${p2Score}. **${winner}** takes the crown as 🏆 **Gravitational Mastermind**, while their rival gets the 💥 **Black Hole Casualty** title after getting swallowed in the end!`;
  } else if (gameId === 'connect-four') {
    mockParagraph = `Pure tactical suspense in **${gameName}**! Both players fought tooth and nail for central board dominance across ${totalMoves} rapid-fire turns. The turning point came during a **tense mid-game standoff** when **${winner}** laid a sneaky double-threat trap that was impossible to block. **${winner}** walks away with the 🧠 **Tactical Genius** badge, while their opponent takes home the 💥 **Trap-Victim** award!`;
  } else if (gameId === 'dots-and-boxes') {
    const p1Boxes = gameState.scores?.player1 || 0;
    const p2Boxes = gameState.scores?.player2 || 0;
    mockParagraph = `An absolute game of chicken in **${gameName}**! After turns of cautious setup and avoiding third-wall traps, a **catastrophic mid-game mistake** opened up a massive chain reaction. **${winner}** pounced on the opportunity, sweeping ${Math.max(p1Boxes, p2Boxes)} boxes to claim the 🏆 **Chain Reaction Combo King** title, leaving the runner-up holding the 💥 **Floodgate Opener** badge!`;
  } else if (gameId === 'battleship') {
    mockParagraph = `High-seas warfare in **${gameName}**! The cannons thundered over ${totalMoves} rounds of blind bombardments and desperate radar sweeps. The climax arrived during a **nail-biting final duel** where **${winner}** accurately predicted the opponent's hiding spot to sink their flagship. **${winner}** earns the 🎯 **Sharpshooter Admiral** title, while their rival takes home the ⚓ **Sunken Fleet** badge!`;
  } else if (gameId === 'checkers') {
    mockParagraph = `Absolute carnage on the board in **${gameName}**! Mandatory jumps forced both players into a **brutal exchange of sacrifices**, clearing the grid piece by piece. **${winner}** outmaneuvered the enemy to promote critical Kings in the endgame, earning the 👑 **Board Overlord** title while leaving their opponent with the 💥 **Mandatory Sacrifice** badge!`;
  } else if (gameId === 'pictionary') {
    const wordCount = gameState.wordHistory?.length || 0;
    const totalGuesses = (Object.values(gameState.scores || {}) as number[]).reduce((a, b) => a + b, 0);
    mockParagraph = `Non-stop hilarity in **${gameName}**! The squad powered through ${wordCount} frantic rounds of scribble art and wild guesses, correctly solving ${totalGuesses} mystery words. Through **clutch last-second guesses** and unhinged artistic masterpieces, the team earned the 🎨 **Picasso Squad** award for peak telepathic teamwork!`;
  } else if (gameId === 'bingo') {
    const totalDraws = gameState.drawnNumbers?.length || 0;
    mockParagraph = `Heart-pounding card tension in **${gameName}**! As ${totalDraws} numbers were drawn from the wheel, players watched their grid rows light up, waiting on single-number near-misses. In a **dramatic race to the line**, **${winner}** shouted BINGO first to claim the 🎲 **RNG God** title, leaving the rest of the lobby as 💥 **Heartbroken One-Away Victims**!`;
  } else if (gameId === 'snakes-ladders') {
    mockParagraph = `A chaotic roller-coaster in **${gameName}**! Players rocketed skyward on ladders only to suffer **catastrophic snake slides** that flipped the leaderboard upside down. In the thrilling final stretch, **${winner}** rolled the exact target number to cross the finish line, earning the 🎲 **Dice Roller MVP** award while leaving their opponent with the 🐍 **Snake Magnet** badge!`;
  } else {
    mockParagraph = `An unforgettable showdown in **${gameName}**! After ${totalMoves} turns of fierce back-and-forth competition, **${winner}** turned the tide during a **dramatic endgame play**, seizing victory and claiming the 🏆 **Match MVP** title!`;
  }

  return `### 🎮 ${gameName} Match Recap (Simulated AI)

${mockParagraph}

*Note: Set the \`DEEPSEEK_API_KEY\` environment variable to enable live AI-generated summaries from DeepSeek.*`;
}

function calculateGameStats(gameId: string, gameState: any): string {
  if (!gameState) return '';
  const p1Name = getPlayerName(gameState.players, 1);
  const p2Name = getPlayerName(gameState.players, 2);
  const stats: string[] = [];

  if (gameId === 'black-hole') {
    const p1Score = gameState.scores?.player1 || 0;
    const p2Score = gameState.scores?.player2 || 0;
    const diff = Math.abs(p1Score - p2Score);
    const storyVibe = diff === 0 ? 'TIE GAME THRILLER' : diff <= 3 ? 'NAIL-BITER CLOSE FINISH' : 'COMMANDING BLOWOUT WIN';
    stats.push(`[MATCH STORY VIBE: ${storyVibe}]`);
    stats.push(`Final Scores: ${p1Name} (Blue): ${p1Score}, ${p2Name} (Red): ${p2Score} (Lower score wins).`);

    const taken = Object.keys(gameState.circles || {});
    const allPositions: string[] = [];
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= r; c++) {
        allPositions.push(`${r}-${c}`);
      }
    }
    const emptyCircle = allPositions.find((pos) => !taken.includes(pos));
    if (emptyCircle) {
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
      stats.push(`${p1Name} tiles swallowed by Black Hole: [${p1Tiles.join(', ') || 'None'}] (Sum: ${p1Tiles.reduce((a, b) => a + b, 0)})`);
      stats.push(`${p2Name} tiles swallowed by Black Hole: [${p2Tiles.join(', ') || 'None'}] (Sum: ${p2Tiles.reduce((a, b) => a + b, 0)})`);
    }
  } else if (gameId === 'connect-four') {
    const totalMoves = gameState.moveHistory?.length || 0;
    const storyVibe = totalMoves < 12 ? 'LIGHTNING QUICK KNOCKOUT' : totalMoves > 28 ? 'MARATHON WAR OF ATTRITION' : 'TACTICAL CHESS MATCH';
    stats.push(`[MATCH STORY VIBE: ${storyVibe}]`);
    stats.push(`Total Discs Dropped: ${totalMoves} turns.`);
  } else if (gameId === 'dots-and-boxes') {
    const p1Boxes = gameState.scores?.player1 || 0;
    const p2Boxes = gameState.scores?.player2 || 0;
    const diff = Math.abs(p1Boxes - p2Boxes);
    const storyVibe = diff <= 2 ? 'EDGE-OF-SEAT CLOSE THRILLER' : 'CHAIN-COMBO DOMINATION';
    stats.push(`[MATCH STORY VIBE: ${storyVibe}]`);
    stats.push(`Final Box Score: ${p1Name}: ${p1Boxes} boxes vs ${p2Name}: ${p2Boxes} boxes.`);
  } else if (gameId === 'battleship') {
    let p1Shots = 0, p1Hits = 0;
    let p2Shots = 0, p2Hits = 0;
    (gameState.moveHistory || []).forEach((m: any) => {
      if (m.action === 'shoot') {
        if (m.player === 1) {
          p1Shots++;
          if (m.hit) p1Hits++;
        } else if (m.player === 2) {
          p2Shots++;
          if (m.hit) p2Hits++;
        }
      }
    });
    const p1Acc = p1Shots > 0 ? Math.round((p1Hits / p1Shots) * 100) : 0;
    const p2Acc = p2Shots > 0 ? Math.round((p2Hits / p2Shots) * 100) : 0;
    stats.push(`[MATCH STORY VIBE: NAVAL BATTLE]`);
    stats.push(`Fleet Accuracy: ${p1Name}: ${p1Acc}% accuracy, ${p2Name}: ${p2Acc}% accuracy.`);
  } else if (gameId === 'checkers') {
    const history = gameState.moveHistory || [];
    const captures = history.filter((m: any) => Math.abs(m.toRow - m.fromRow) === 2).length;
    stats.push(`[MATCH STORY VIBE: BOARD CARNAGE]`);
    stats.push(`Total Captures Made: ${captures} total jumps executed across the board.`);
  } else if (gameId === 'pictionary') {
    const wordCount = gameState.wordHistory?.length || 0;
    const totalCorrect = (Object.values(gameState.scores || {}) as number[]).reduce((a, b) => a + b, 0);
    const rate = wordCount > 0 ? Math.round((totalCorrect / wordCount) * 100) : 0;
    stats.push(`[MATCH STORY VIBE: COOPERATIVE SQUAD GOALS]`);
    stats.push(`Drawing Accuracy: ${totalCorrect}/${wordCount} words guessed correctly (${rate}% success rate).`);
  } else if (gameId === 'bingo') {
    const totalDraws = gameState.drawnNumbers?.length || 0;
    stats.push(`[MATCH STORY VIBE: RNG RACE]`);
    stats.push(`Numbers Drawn: ${totalDraws} out of 75 numbers before winning BINGO was called.`);
  } else if (gameId === 'snakes-ladders') {
    const history = gameState.moveHistory || [];
    let ladderCount = 0, snakeCount = 0;
    history.forEach((m: any) => {
      if (m.snakeOrLadder === 'ladder') ladderCount++;
      else if (m.snakeOrLadder === 'snake') snakeCount++;
    });
    stats.push(`[MATCH STORY VIBE: ROLLERCOASTER RACE]`);
    stats.push(`Board Hazards & Boosts: ${ladderCount} ladders climbed, ${snakeCount} snakes slid down.`);
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
