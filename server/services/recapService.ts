import { callDeepSeek, isDeepSeekConfigured } from './deepseek.js';
import { getSystemPrompt, getRecapPrompt, getRecapConversationPrompt } from './prompts.js';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const RECAP_SUPPORTED_GAMES = ['black-hole', 'connect-four', 'dots-and-boxes', 'battleship', 'checkers'];

export function isRecapSupported(gameId: string): boolean {
  return RECAP_SUPPORTED_GAMES.includes(gameId);
}

function getGameName(gameId: string): string {
  switch (gameId) {
    case 'black-hole': return 'Black Hole';
    case 'connect-four': return 'Connect Four';
    case 'dots-and-boxes': return 'Dots and Boxes';
    case 'battleship': return 'Battleship';
    case 'checkers': return 'Checkers';
    default: return 'Tactical Game';
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
  } else {
    mockParagraph = `An unforgettable showdown in **${gameName}**! After ${totalMoves} turns of fierce back-and-forth competition, **${winner}** turned the tide during a **dramatic endgame play**, seizing victory and claiming the 🏆 **Match MVP** title!`;
  }

  return `### 🎮 ${gameName} Match Recap (Simulated AI)

${mockParagraph}

*Note: Set the \`DEEPSEEK_API_KEY\` environment variable to enable live AI-generated summaries from DeepSeek.*`;
}

function analyzeTacticalHeuristics(gameId: string, gameState: any): string[] {
  if (!gameState) return [];
  const blunders: string[] = [];
  const history = gameState.moveHistory || [];

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
      const [blackR, blackC] = emptyCircle.split('-').map(Number);
      history.forEach((move: any, index: number) => {
        const tileVal = Math.floor(index / 2) + 1;
        const player = getPlayerName(gameState.players, move.player);
        const dr = Math.abs(move.row - blackR);
        const dc = Math.abs(move.col - blackC);
        const isNeighbor = (dr <= 1 && dc <= 1) && !(dr === 0 && dc === 0);

        if (isNeighbor && tileVal >= 8) {
          blunders.push(`CRITICAL BLUNDER (Move ${index + 1}): ${player} placed high Tile #${tileVal} adjacent to the Black Hole at Row ${move.row}, Col ${move.col}, getting swallowed for a severe penalty.`);
        } else if (!isNeighbor && tileVal <= 3 && (move.row === 1 || move.row === 6 || move.col === 1 || move.col === move.row)) {
          blunders.push(`TACTICAL MISPLACEMENT (Move ${index + 1}): ${player} placed low Tile #${tileVal} on an outer edge/corner (Row ${move.row}, Col ${move.col}) instead of placing it near the Black Hole.`);
        }
      });
    }
  } else if (gameId === 'connect-four') {
    let p1Center = 0;
    let p2Center = 0;
    history.forEach((m: any, idx: number) => {
      const colNum = m.col + 1;
      if (colNum === 4) {
        if (m.player === 1) p1Center++;
        else if (m.player === 2) p2Center++;
      }
      if (idx === 7 && p1Center === 0 && p2Center === 0) {
        blunders.push(`POSITIONAL BLUNDER (Early Game): Both players neglected Column 4 (Center Column) in the first 8 moves, abandoning central board control.`);
      }
    });

    if (history.length > 0) {
      const lastMove = history[history.length - 1];
      const winningPlayer = getPlayerName(gameState.players, lastMove.player);
      const losingPlayer = getPlayerName(gameState.players, lastMove.player === 1 ? 2 : 1);
      blunders.push(`DECISIVE CLINCH (Move ${history.length}): ${winningPlayer} dropped the winning disc in Column ${lastMove.col + 1} past ${losingPlayer}'s defense.`);
    }
  } else if (gameId === 'dots-and-boxes') {
    history.forEach((m: any, idx: number) => {
      if (m.boxesEarned && m.boxesEarned >= 2) {
        const sweeper = getPlayerName(gameState.players, m.player);
        const prevMove = history[idx - 1];
        const victim = prevMove ? getPlayerName(gameState.players, prevMove.player) : 'opponent';
        blunders.push(`3RD-WALL BLUNDER (Move ${idx}): ${victim} drew the 3rd wall, enabling ${sweeper} to launch a massive ${m.boxesEarned}-box chain sweep on Move ${idx + 1}.`);
      }
    });
  } else if (gameId === 'battleship') {
    let lastHitMove: { player: number; turn: number; row: number; col: number } | null = null;
    history.forEach((m: any, idx: number) => {
      if (m.action === 'shoot') {
        const shooter = getPlayerName(gameState.players, m.player);
        if (lastHitMove && lastHitMove.player === m.player && !m.sunkShipName) {
          const dr = Math.abs(m.row - lastHitMove.row);
          const dc = Math.abs(m.col - lastHitMove.col);
          const isAdjacent = (dr + dc === 1);
          if (!isAdjacent && !m.hit) {
            blunders.push(`TARGET ABANDONMENT (Move ${idx + 1}): ${shooter} hit a vessel on Move ${lastHitMove.turn}, but abandoned the target on Move ${idx + 1} to fire blindly elsewhere.`);
          }
        }
        if (m.hit && !m.sunkShipName) {
          lastHitMove = { player: m.player, turn: idx + 1, row: m.row, col: m.col };
        } else if (m.sunkShipName) {
          lastHitMove = null;
        }
      }
    });
  } else if (gameId === 'checkers') {
    history.forEach((m: any, idx: number) => {
      const isPromotion = (m.player === 1 && m.toRow === 0) || (m.player === 2 && m.toRow === 7);
      if (isPromotion) {
        const promoter = getPlayerName(gameState.players, m.player);
        const defender = getPlayerName(gameState.players, m.player === 1 ? 2 : 1);
        blunders.push(`DEFENSE BREAKDOWN (Move ${idx + 1}): ${defender}'s back-row defense broke down, allowing ${promoter} to promote a piece to King.`);
      }
    });
  }

  return blunders.slice(0, 3);
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
      stats.push(`Black Hole Location: Row ${r}, Col ${c}`);

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
      const p1Max = p1Tiles.length > 0 ? Math.max(...p1Tiles) : 0;
      const p2Max = p2Tiles.length > 0 ? Math.max(...p2Tiles) : 0;

      stats.push(`${p1Name} tiles swallowed by Black Hole: [${p1Tiles.join(', ') || 'None'}] (Total Penalty: ${p1Score} pts, Worst Penalty Tile: #${p1Max})`);
      stats.push(`${p2Name} tiles swallowed by Black Hole: [${p2Tiles.join(', ') || 'None'}] (Total Penalty: ${p2Score} pts, Worst Penalty Tile: #${p2Max})`);
    }

    const history = gameState.moveHistory || [];
    if (history.length > 0) {
      const lastMove = history[history.length - 1];
      const lastPlayerName = getPlayerName(gameState.players, lastMove.player);
      stats.push(`Clutch Final Tile (#10) placed by: ${lastPlayerName} at Row ${lastMove.row}, Col ${lastMove.col}`);
    }
  } else if (gameId === 'connect-four') {
    const history = gameState.moveHistory || [];
    const totalMoves = history.length;
    const storyVibe = totalMoves < 12 ? 'LIGHTNING QUICK KNOCKOUT' : totalMoves > 28 ? 'MARATHON WAR OF ATTRITION' : 'TACTICAL CHESS MATCH';
    stats.push(`[MATCH STORY VIBE: ${storyVibe}]`);
    stats.push(`Total Discs Dropped: ${totalMoves} turns.`);

    const colCounts: Record<number, { p1: number; p2: number }> = {
      1: { p1: 0, p2: 0 }, 2: { p1: 0, p2: 0 }, 3: { p1: 0, p2: 0 },
      4: { p1: 0, p2: 0 }, 5: { p1: 0, p2: 0 }, 6: { p1: 0, p2: 0 }, 7: { p1: 0, p2: 0 }
    };
    history.forEach((m: any) => {
      const colNum = m.col + 1;
      if (colCounts[colNum]) {
        if (m.player === 1) colCounts[colNum].p1++;
        else if (m.player === 2) colCounts[colNum].p2++;
      }
    });

    const c4P1 = colCounts[4].p1;
    const c4P2 = colCounts[4].p2;
    const c4Total = c4P1 + c4P2;
    const c4Dominance = c4Total > 0 ? (c4P1 > c4P2 ? p1Name : c4P2 > c4P1 ? p2Name : 'Even Standoff') : 'None';
    stats.push(`Center Column (Col 4) Control: ${p1Name}: ${c4P1} discs, ${p2Name}: ${c4P2} discs (Dominant Center Player: ${c4Dominance}).`);

    if (history.length > 0) {
      const lastMove = history[history.length - 1];
      const winningPlayer = getPlayerName(gameState.players, lastMove.player);
      stats.push(`Winning Final Disc dropped in Column ${lastMove.col + 1} by ${winningPlayer}.`);
    }
  } else if (gameId === 'dots-and-boxes') {
    const p1Boxes = gameState.scores?.player1 || 0;
    const p2Boxes = gameState.scores?.player2 || 0;
    const diff = Math.abs(p1Boxes - p2Boxes);
    const storyVibe = diff <= 2 ? 'EDGE-OF-SEAT CLOSE THRILLER' : 'CHAIN-COMBO DOMINATION';
    stats.push(`[MATCH STORY VIBE: ${storyVibe}]`);
    stats.push(`Final Box Score: ${p1Name}: ${p1Boxes} boxes vs ${p2Name}: ${p2Boxes} boxes.`);

    const history = gameState.moveHistory || [];
    let p1MaxChain = 0, p2MaxChain = 0;
    let currPlayer = 0, currChain = 0;
    let firstBoxTurn = 0;

    history.forEach((m: any, idx: number) => {
      if (m.boxesEarned && m.boxesEarned > 0) {
        if (!firstBoxTurn) firstBoxTurn = idx + 1;
        if (m.player === currPlayer) {
          currChain += m.boxesEarned;
        } else {
          currPlayer = m.player;
          currChain = m.boxesEarned;
        }
        if (currPlayer === 1 && currChain > p1MaxChain) p1MaxChain = currChain;
        if (currPlayer === 2 && currChain > p2MaxChain) p2MaxChain = currChain;
      } else {
        currPlayer = 0;
        currChain = 0;
      }
    });

    if (firstBoxTurn > 0) {
      stats.push(`First Box Claimed: Move ${firstBoxTurn}.`);
    }
    stats.push(`Max Chain Reaction Sweeps: ${p1Name}: ${p1MaxChain} boxes in 1 turn sequence, ${p2Name}: ${p2MaxChain} boxes in 1 turn sequence.`);
  } else if (gameId === 'battleship') {
    let p1Shots = 0, p1Hits = 0;
    let p2Shots = 0, p2Hits = 0;
    const sunkEvents: string[] = [];
    let firstHitPlayer: string | null = null;

    (gameState.moveHistory || []).forEach((m: any, index: number) => {
      if (m.action === 'shoot') {
        const shooter = getPlayerName(gameState.players, m.player);
        if (m.hit) {
          if (!firstHitPlayer) firstHitPlayer = shooter;
          if (m.player === 1) {
            p1Shots++;
            p1Hits++;
          } else if (m.player === 2) {
            p2Shots++;
            p2Hits++;
          }
          if (m.sunkShipName) {
            sunkEvents.push(`Move ${index + 1}: ${shooter} sank opponent's ${m.sunkShipName}`);
          }
        } else {
          if (m.player === 1) p1Shots++;
          else if (m.player === 2) p2Shots++;
        }
      }
    });

    const p1Acc = p1Shots > 0 ? Math.round((p1Hits / p1Shots) * 100) : 0;
    const p2Acc = p2Shots > 0 ? Math.round((p2Hits / p2Shots) * 100) : 0;

    stats.push(`[MATCH STORY VIBE: NAVAL BATTLE]`);
    stats.push(`Fleet Accuracy: ${p1Name}: ${p1Acc}% (${p1Hits}/${p1Shots} hits), ${p2Name}: ${p2Acc}% (${p2Hits}/${p2Shots} hits).`);
    if (firstHitPlayer) {
      stats.push(`First Blood (First Hit): ${firstHitPlayer}.`);
    }
    if (sunkEvents.length > 0) {
      stats.push(`Sunk Ships Timeline:\n  - ${sunkEvents.join('\n  - ')}`);
    }
  } else if (gameId === 'checkers') {
    const history = gameState.moveHistory || [];
    let capturesCount = 0;
    const promotions: string[] = [];

    history.forEach((m: any, idx: number) => {
      const isCapture = Math.abs(m.toRow - m.fromRow) === 2;
      const isPromotion = (m.player === 1 && m.toRow === 0) || (m.player === 2 && m.toRow === 7);
      if (isCapture) capturesCount++;
      if (isPromotion) {
        promotions.push(`Move ${idx + 1}: ${getPlayerName(gameState.players, m.player)} promoted piece to King`);
      }
    });

    stats.push(`[MATCH STORY VIBE: BOARD CARNAGE]`);
    stats.push(`Total Captures Made: ${capturesCount} total jumps executed across the board.`);
    if (promotions.length > 0) {
      stats.push(`King Promotions Timeline:\n  - ${promotions.join('\n  - ')}`);
    }

    if (gameState.board) {
      let p1Pieces = 0, p1Kings = 0;
      let p2Pieces = 0, p2Kings = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const v = gameState.board[r][c];
          if (v === 1) {
            p1Pieces++;
          } else if (v === 3) {
            p1Pieces++;
            p1Kings++;
          } else if (v === 2) {
            p2Pieces++;
          } else if (v === 4) {
            p2Pieces++;
            p2Kings++;
          }
        }
      }
      stats.push(`Endgame Board State: ${p1Name}: ${p1Pieces} pieces (${p1Kings} Kings), ${p2Name}: ${p2Pieces} pieces (${p2Kings} Kings).`);
    }
  }

  const heuristicAnalysis = analyzeTacticalHeuristics(gameId, gameState);
  if (heuristicAnalysis.length > 0) {
    stats.push(`\n[TACTICAL HEURISTIC & BLUNDER EVALUATION]:\n  - ${heuristicAnalysis.join('\n  - ')}`);
  }

  return stats.join('\n');
}

function getPlayerMatchStatus(gameState: any, playerNum: number): 'WINNER' | 'LOST' | 'TIE' {
  if (!gameState || !gameState.winner) return 'LOST';
  const winnerStr = String(gameState.winner).toLowerCase();
  if (winnerStr.includes('tie') || winnerStr.includes('draw')) return 'TIE';
  const pName = getPlayerName(gameState.players, playerNum).toLowerCase();
  if (winnerStr.includes(pName) || winnerStr.includes(`player ${playerNum}`)) {
    return 'WINNER';
  }
  return 'LOST';
}

export async function recapConversation(
  gameId: string,
  gameState: any,
  originalRecap: string,
  conversationHistory: Array<{ role: string; content: string }>,
  question: string,
  askingPlayerNum: number = 1
): Promise<string> {
  if (!isRecapSupported(gameId)) {
    return 'AI Recap is not supported for this game.';
  }

  const askingPlayerName = getPlayerName(gameState.players, askingPlayerNum);
  const askingPlayerStatus = getPlayerMatchStatus(gameState, askingPlayerNum);
  const winnerName = gameState.winner || 'Tie game!';

  if (!isDeepSeekConfigured) {
    if (askingPlayerStatus === 'LOST') {
      return `[Simulated AI] As ${askingPlayerName} (Player ${askingPlayerNum}), you lost this ${getGameName(gameId)} match to ${winnerName}. Based on the match log, your opponent gained pivotal tactical control in the mid-game. Set the \`DEEPSEEK_API_KEY\` environment variable to enable live AI follow-up answers.`;
    } else if (askingPlayerStatus === 'WINNER') {
      return `[Simulated AI] Great question! As ${askingPlayerName} (Player ${askingPlayerNum}), you won this ${getGameName(gameId)} match by securing the decisive play. Set the \`DEEPSEEK_API_KEY\` environment variable to enable live AI follow-up answers.`;
    }
    return `[Simulated AI] That's an interesting question from ${askingPlayerName} about the ${getGameName(gameId)} match! Set the \`DEEPSEEK_API_KEY\` environment variable to enable live AI answers.`;
  }

  const formattedHistory = formatMoveHistory(gameId, gameState);
  const sortedPlayers = [...(gameState.players || [])].sort((a: any, b: any) => a.player - b.player);
  const playerNames = sortedPlayers.map((p: any) => p.name).filter(Boolean);
  const statsSummary = calculateGameStats(gameId, gameState);
  const conversationPrompt = getRecapConversationPrompt(
    getGameName(gameId),
    formattedHistory,
    originalRecap,
    question,
    gameId,
    playerNames,
    statsSummary,
    askingPlayerNum,
    askingPlayerName,
    askingPlayerStatus,
    winnerName
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
  if (!isRecapSupported(gameId)) {
    return '';
  }

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
