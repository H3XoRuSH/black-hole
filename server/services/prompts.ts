export function getSystemPrompt(): string {
  return 'You output match recaps. No preamble, no meta-commentary.';
}

export function getRecapConversationPrompt(gameName: string, formattedHistory: string, originalRecap: string, question: string, gameId?: string, playerNames?: string[]): string {
  let playerRef = '';
  if (gameId === 'pictionary') {
    const namesList = playerNames && playerNames.length > 0
      ? playerNames.map((name) => `"${name}"`).join(', ')
      : '"Player 1", "Player 2"';
    playerRef = `Refer to players by their names: ${namesList}. This was a cooperative game.`;
  } else if (gameId === 'bingo') {
    const namesList = playerNames && playerNames.length > 0
      ? playerNames.map((name) => `"${name}"`).join(', ')
      : '"Player 1" and "Player 2"';
    playerRef = `Refer to players by their names: ${namesList}`;
  } else {
    const p1Name = playerNames?.[0] || 'Player 1';
    const p2Name = playerNames?.[1] || 'Player 2';
    playerRef = `Refer to "${p1Name} (Blue)" and "${p2Name} (Red)"`;
  }
  return `Game log for ${gameName}:
${formattedHistory}

Original recap:
${originalRecap}

The user wants to ask a follow-up question about this match. ${playerRef}. Answer concisely based on the game log above.

Question: ${question}

Answer:`;
}

export function getRecapPrompt(gameName: string, formattedHistory: string, gameId?: string, playerNames?: string[]): string {
  let playerRef = '';
  let wordCountLimit = '40-60 words';

  if (gameId === 'pictionary') {
    const namesList = playerNames && playerNames.length > 0
      ? playerNames.map((name) => `"${name}"`).join(', ')
      : '"Player 1", "Player 2"';
    playerRef = `Refer to players by their names: ${namesList}. This was a cooperative game — all players worked together as a team.`;
    if (playerNames && playerNames.length > 2) {
      playerRef += `. Be sure to briefly mention each player who participated: ${namesList}`;
      wordCountLimit = '60-80 words';
    }
  } else if (gameId === 'bingo') {
    const namesList = playerNames && playerNames.length > 0
      ? playerNames.map((name) => `"${name}"`).join(', ')
      : '"Player 1" and "Player 2"';
    playerRef = `Refer to players by their names: ${namesList}`;
    if (playerNames && playerNames.length > 2) {
      playerRef += `. Be sure to briefly mention each player who participated: ${namesList}`;
      wordCountLimit = '60-80 words';
    }
  } else {
    const p1Name = playerNames?.[0] || 'Player 1';
    const p2Name = playerNames?.[1] || 'Player 2';
    playerRef = `Refer to "${p1Name} (Blue)" and "${p2Name} (Red)"`;
  }
  return `Game log for ${gameName}:
${formattedHistory}

Write ONE engaging paragraph recapping this match (${wordCountLimit}). ${playerRef}. Cover key moments and the outcome.

Recap:`;
}
