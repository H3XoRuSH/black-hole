const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export interface DeepSeekChatOptions {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  thinking?: { type: 'enabled' | 'disabled'; budget_tokens?: number };
}

export const isDeepSeekConfigured = !!DEEPSEEK_API_KEY;

async function deepSeekFetch(model: string, options: DeepSeekChatOptions): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is not configured.');
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      thinking: options.thinking ?? { type: 'disabled' },
      stream: false,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API returned error ${response.status}: ${errorText}`);
  }

  const data: any = await response.json();
  const message = data.choices?.[0]?.message;
  const content = message?.content || message?.reasoning_content;
  if (!content) {
    throw new Error('Invalid response structure from DeepSeek API.');
  }
  return content;
}

export async function callDeepSeek(options: DeepSeekChatOptions): Promise<string> {
  return deepSeekFetch('deepseek-v4-flash', options);
}

export async function callDeepSeekPro(options: DeepSeekChatOptions): Promise<string> {
  return deepSeekFetch('deepseek-v4-pro', options);
}
