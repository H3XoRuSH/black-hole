export function getSystemPrompt(): string {
  return 'You are a witty, lighthearted, and wildly entertaining arcade game show host. Your commentary is colorful, energetic, and story-driven — focusing on dramatic turning points, hilarious blunders, sneaky traps, and epic clutch moments. NEVER sound like a robot reading a spreadsheet or listing raw coordinates. Output ONLY the recap text without any preamble, meta-commentary, or conversational introductory filler.';
}

function getGamePrimer(gameId?: string): string {
  switch (gameId) {
    case 'black-hole':
      return 'GAME TACTICAL RULES: Black Hole is a numerical trap game where players place tiles 1-10 on a 21-circle pyramid grid. The 1 unplayed circle at the end becomes the Black Hole, swallowing all adjacent tiles. LOWEST sum score wins, so pushing high-numbered tiles into the hole while saving low tiles is essential.';
    case 'connect-four':
      return 'GAME TACTICAL RULES: Connect Four is a vertical gravity grid game. Controlling Column 4 (the center column) and building double-threat 7-column traps (wins in 2 directions simultaneously) are key to dominance.';
    case 'dots-and-boxes':
      return 'GAME TACTICAL RULES: Dots & Boxes is a spatial chicken game. Players draw lines, avoiding drawing the 3rd wall of a box. The first blunder opens a floodgate chain reaction sweep where a player claims many boxes in a single turn.';
    case 'battleship':
      return 'GAME TACTICAL RULES: Battleship is a naval radar duel. Finding hidden enemy ships and finishing off multi-cell vessels before your own fleet is sunk requires tactical target hunting.';
    case 'checkers':
      return 'GAME TACTICAL RULES: Checkers is a forced-capture sacrifice game. Players jump opponent pieces and race to the back row for King promotions to dominate the board.';
    default:
      return 'GAME TACTICAL RULES: A high-stakes 2-player turn-based strategy showdown.';
  }
}

export function getRecapConversationPrompt(
  gameName: string,
  formattedHistory: string,
  originalRecap: string,
  question: string,
  gameId?: string,
  playerNames?: string[],
  statsSummary?: string,
  askingPlayerNum: number = 1,
  askingPlayerName: string = 'Player 1',
  askingPlayerStatus: string = 'LOST',
  winnerName: string = ''
): string {
  const p1Name = playerNames?.[0] || 'Player 1';
  const p2Name = playerNames?.[1] || 'Player 2';
  const playerRef = `Refer to "${p1Name} (Blue)" and "${p2Name} (Red)"`;
  const askingColor = askingPlayerNum === 1 ? 'Blue' : 'Red';
  const primer = getGamePrimer(gameId);

  let statsSection = '';
  if (statsSummary) {
    statsSection = `Key Match Story Context & Tactical Analytics:
${statsSummary}

`;
  }

  return `${primer}

Game log for ${gameName}:
${formattedHistory}

${statsSection}Original recap:
${originalRecap}

CRITICAL USER IDENTITY MAPPING:
- The player asking this question is "${askingPlayerName}" (Player ${askingPlayerNum}, ${askingColor}).
- Official Match Result for ${askingPlayerName}: ${askingPlayerStatus} (Match Winner: ${winnerName || 'N/A'}).
- WHEN THE USER USES FIRST-PERSON PRONOUNS ("I", "MY", "ME", "MINE"), THEY ARE REFERRING TO ${askingPlayerName} (Player ${askingPlayerNum}, ${askingColor}).
- IF ${askingPlayerName} LOST (askingPlayerStatus === 'LOST'), NEVER claim "you didn't lose" or "you won". Explain precisely why ${askingPlayerName} lost based on the game stats and move log.
- IF ${askingPlayerName} WON (askingPlayerStatus === 'WINNER'), celebrate their victory.

Question asked by ${askingPlayerName}: "${question}"

Maintain your witty, lighthearted arcade host persona. ${playerRef}.
Guidelines:
1. Speak organically and vividly — DO NOT spit back raw numbers, grid coordinates (e.g. "Row 2 Col 1"), or JSON-like logs.
2. Use the tactical match analytics and move history above to answer directly to ${askingPlayerName}.
3. Keep the answer concise (2-4 sentences).

Answer:`;
}

export function getRecapPrompt(gameName: string, formattedHistory: string, gameId?: string, playerNames?: string[], statsSummary?: string): string {
  const p1Name = playerNames?.[0] || 'Player 1';
  const p2Name = playerNames?.[1] || 'Player 2';
  const playerRef = `Refer to "${p1Name} (Blue)" and "${p2Name} (Red)"`;
  const wordCountLimit = '60-100 words';
  const primer = getGamePrimer(gameId);

  let statsSection = '';
  if (statsSummary) {
    statsSection = `Key Match Story Context & Tactical Analytics:
${statsSummary}

`;
  }

  return `${primer}

Game log for ${gameName}:
${formattedHistory}

${statsSection}Write EXACTLY ONE punchy, highly entertaining paragraph (${wordCountLimit}) recapping this match as an witty arcade host. ${playerRef}.

CRITICAL CONTENT DIRECTIVES:
1. NO ROBOT JARGON: NEVER mention raw coordinate math (like "Row 3 Col 2", "Col 4", "Line h-1-2"). Instead, translate move data and tactical analytics into dramatic story beats (e.g., "setting a lethal double trap", "sacrificing a high tile to force a blunder", "executing a 5-box chain sweep").
2. USE THE TACTICAL ANALYTICS: Seamlessly weave the match facts above (e.g. center column control, largest swallowed tiles, sunk ship order, or King promotions) into the story.
3. 3-ACT NARRATIVE: Build a real story arc — set the match atmosphere, highlight the pivotal turning point or blunder, and celebrate the dramatic outcome.
4. INLINE HIGHLIGHTS & BADGES: Weave **bolded key moments** into the narrative and award fun inline title badges to both players (e.g. 🏆 **MVP**, 🧠 **Big Brain Play**, 💥 **Epic Blunder**, 🎯 **Sniper**).
5. Strictly ONE continuous paragraph without line breaks.

Recap:`;
}
