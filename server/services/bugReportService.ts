import { callDeepSeek, isDeepSeekConfigured } from './deepseek.js';

interface BugReportInput {
  title: string;
  description: string;
  category: string;
  diagnostics: {
    gameId: string | null;
    roomKey: string | null;
    userAgent: string;
    screenResolution: string;
    currentRoute: string;
  };
}

export interface BugReportResult {
  rejected: boolean;
  reason?: string;
  formattedTitle?: string;
  formattedBody?: string;
}

export async function evaluateBugReport(data: BugReportInput): Promise<BugReportResult> {
  if (!isDeepSeekConfigured) {
    if (!data.title.trim() || !data.description.trim()) {
      return {
        rejected: true,
        reason: 'Bug report title and description cannot be empty.'
      };
    }
    const formattedBody = `
## Bug Report: ${data.title}
**Category**: ${data.category}

### Description
${data.description}

### Diagnostics
* **User Agent**: ${data.diagnostics.userAgent}
* **Screen Resolution**: ${data.diagnostics.screenResolution}
    `.trim();

    return {
      rejected: false,
      formattedTitle: `[${data.category}] ${data.title}`,
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
    title: data.title,
    description: data.description,
    category: data.category,
    diagnostics: data.diagnostics
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
    return parsed;
  } catch (error) {
    console.error('DeepSeek bug evaluation failed, falling back to local formatting:', error);
    return {
      rejected: false,
      formattedTitle: `[${data.category}] ${data.title}`,
      formattedBody: `
## Bug Report: ${data.title}
**Category**: ${data.category}

### Description
${data.description}

### Diagnostics
* **User Agent**: ${data.diagnostics.userAgent}
* **Screen Resolution**: ${data.diagnostics.screenResolution}
      `.trim()
    };
  }
}

export async function createGitHubIssue(options: { title: string; body: string; labels: string[] }): Promise<any> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not configured.');
  }

  const response = await fetch('https://api.github.com/repos/H3XoRuSH/black-hole/issues', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Gab\'s Arcade Bug Reporter'
    },
    body: JSON.stringify({
      title: options.title,
      body: options.body,
      labels: options.labels
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API returned error ${response.status}: ${errorText}`);
  }

  return response.json();
}
