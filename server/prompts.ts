export function getSystemPrompt(): string {
  return 'You output match recaps. No preamble, no meta-commentary.';
}

export function getRecapPrompt(gameName: string, formattedHistory: string): string {
  return `Game log for ${gameName}:
${formattedHistory}

Write ONE engaging paragraph recapping this match (40-60 words). Refer to "Player 1 (Blue)" and "Player 2 (Red)". Cover key moments and the outcome.

Recap:`;
}
