export function getSystemPrompt(): string {
  return 'You output match recaps. No preamble, no meta-commentary.';
}

export function getRecapPrompt(gameName: string, formattedHistory: string, gameId?: string): string {
  const playerRef = gameId === 'bingo'
    ? 'Refer to players by their player number (Player 1, Player 2, etc.)'
    : 'Refer to "Player 1 (Blue)" and "Player 2 (Red)"';
  return `Game log for ${gameName}:
${formattedHistory}

Write ONE engaging paragraph recapping this match (40-60 words). ${playerRef}. Cover key moments and the outcome.

Recap:`;
}
