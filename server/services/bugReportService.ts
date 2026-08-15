import { callDeepSeek, isDeepSeekConfigured } from './deepseek.js';

export const ALLOWED_CATEGORIES = [
  'Gameplay Bug',
  'Visual / UI Bug',
  'Audio / Sound Issue',
  'Feature Request / Suggestion',
  'Performance / Lag',
  'Other'
] as const;

export type BugReportCategory = typeof ALLOWED_CATEGORIES[number];

export interface BugReportInput {
  title: string;
  description: string;
  category: string;
  diagnostics?: {
    gameId?: string | null;
    roomKey?: string | null;
    userAgent?: string;
    screenResolution?: string;
    currentRoute?: string;
    deviceType?: string;
  };
}

export interface BugReportResult {
  rejected: boolean;
  reason?: string;
  formattedTitle?: string;
  formattedBody?: string;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function evaluateBugReport(data: BugReportInput): Promise<BugReportResult> {
  if (!data || typeof data !== 'object') {
    return { rejected: true, reason: 'Invalid report payload.' };
  }

  const rawTitle = typeof data.title === 'string' ? data.title.trim() : '';
  const rawDescription = typeof data.description === 'string' ? data.description.trim() : '';
  const category = ALLOWED_CATEGORIES.includes(data.category as any)
    ? data.category
    : 'Other';

  if (!rawTitle || rawTitle.length < 3) {
    return {
      rejected: true,
      reason: 'Bug report title is too short.'
    };
  }

  if (rawTitle.length > 200) {
    return {
      rejected: true,
      reason: 'Bug report title exceeds maximum length (200 characters).'
    };
  }

  if (!rawDescription || rawDescription.length < 5) {
    return {
      rejected: true,
      reason: 'Bug report description is too short.'
    };
  }

  if (rawDescription.length > 2500) {
    return {
      rejected: true,
      reason: 'Bug report description exceeds maximum length (2500 characters).'
    };
  }

  const safeTitle = escapeHtml(rawTitle);
  const safeDescription = escapeHtml(rawDescription);
  const userAgent = typeof data.diagnostics?.userAgent === 'string' ? escapeHtml(data.diagnostics.userAgent.slice(0, 300)) : 'Unknown';
  const screenResolution = typeof data.diagnostics?.screenResolution === 'string' ? escapeHtml(data.diagnostics.screenResolution.slice(0, 50)) : 'Unknown';

  if (!isDeepSeekConfigured) {
    const formattedBody = `
## Bug Report: ${safeTitle}
**Category**: ${category}

### Description
${safeDescription}

### Diagnostics
* **User Agent**: ${userAgent}
* **Screen Resolution**: ${screenResolution}
    `.trim();

    return {
      rejected: false,
      formattedTitle: `[${category}] ${safeTitle}`,
      formattedBody
    };
  }

  const systemPrompt = `You triage bug reports for "Gab's Arcade".
Task: Validate and format the user report into JSON.
If rejected (spam, keyboard mashing, test/chatter, empty, or too vague):
Return JSON: {"rejected": true, "reason": "Friendly limit 12-words reason"}
If valid:
Format description cleanly into a Summary and Details (only include "Steps to Reproduce" if explicitly provided by user). Append a clean diagnostics table (only User Agent and Screen Resolution).
Return JSON: {"rejected": false, "formattedTitle": "[Category] Title", "formattedBody": "Markdown body"}`;

  const userPrompt = JSON.stringify({
    title: safeTitle,
    description: safeDescription,
    category,
    diagnostics: {
      userAgent,
      screenResolution
    }
  }, null, 2);

  try {
    const apiResponse = await callDeepSeek({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      maxTokens: 1200
    });

    let cleanText = apiResponse.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    }

    const parsed: BugReportResult = JSON.parse(cleanText);
    if (parsed && typeof parsed.rejected === 'boolean') {
      return parsed;
    }
    throw new Error('Malformed AI response.');
  } catch (error) {
    console.error('DeepSeek bug evaluation fallback:', error);
    return {
      rejected: false,
      formattedTitle: `[${category}] ${safeTitle}`,
      formattedBody: `
## Bug Report: ${safeTitle}
**Category**: ${category}

### Description
${safeDescription}

### Diagnostics
* **User Agent**: ${userAgent}
* **Screen Resolution**: ${screenResolution}
      `.trim()
    };
  }
}

export async function createGitHubIssue(options: { title: string; body: string; labels: string[] }): Promise<any> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not configured.');
  }

  const safeLabels = options.labels
    .map((l) => l.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))
    .filter(Boolean);

  const response = await fetch('https://api.github.com/repos/H3XoRuSH/black-hole/issues', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Gabs-Arcade-Bug-Reporter'
    },
    body: JSON.stringify({
      title: options.title.slice(0, 250),
      body: options.body.slice(0, 6000),
      labels: safeLabels
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`GitHub API returned error ${response.status}: ${errorText}`);
    throw new Error('Failed to create issue on GitHub.');
  }

  return response.json();
}
