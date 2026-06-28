export function getSystemPrompt(): string {
  return 'You output match recaps. No preamble, no meta-commentary.';
}

export function getRecapPrompt(gameName: string, formattedHistory: string, gameId?: string, playerNames?: string[]): string {
  const p1Name = playerNames?.[0] || 'Player 1';
  const p2Name = playerNames?.[1] || 'Player 2';
  const playerRef = gameId === 'bingo'
    ? `Refer to players as "${p1Name}" and "${p2Name}"`
    : `Refer to "${p1Name} (Blue)" and "${p2Name} (Red)"`;
  return `Game log for ${gameName}:
${formattedHistory}

Write ONE engaging paragraph recapping this match (40-60 words). ${playerRef}. Cover key moments and the outcome.

Recap:`;
}
