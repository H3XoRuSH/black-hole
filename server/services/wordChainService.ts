import { callDeepSeek } from '../deepseek.js';

const FALLBACK_PAIRS: [string, string][] = [
  ['apple', 'pie'], ['pie', 'chart'], ['chart', 'paper'], ['paper', 'towel'],
  ['towel', 'rack'], ['rack', 'space'], ['space', 'ship'], ['ship', 'yard'],
  ['yard', 'stick'], ['stick', 'shift'], ['shift', 'key'], ['key', 'board'],
  ['board', 'game'], ['game', 'plan'], ['plan', 'tree'], ['tree', 'house'],
  ['house', 'plant'], ['plant', 'food'], ['food', 'chain'], ['chain', 'link'],
  ['link', 'chain'], ['milk', 'shake'], ['shake', 'hands'], ['hand', 'book'],
  ['book', 'worm'], ['worm', 'hole'], ['hole', 'punch'], ['punch', 'line'],
  ['line', 'back'], ['back', 'door'], ['door', 'bell'], ['bell', 'hop'],
  ['hop', 'scotch'], ['scotch', 'tape'], ['tape', 'worm'], ['fire', 'fly'],
  ['fly', 'trap'], ['trap', 'door'], ['door', 'step'], ['step', 'ladder'],
];

async function callDeepSeekSafe(messages: { role: string; content: string }[]): Promise<string | null> {
  try {
    return await callDeepSeek({ messages, maxTokens: 2500, temperature: 0.5 });
  } catch (err) {
    console.warn('DeepSeek API call failed:', err);
    return null;
  }
}

function parsePairs(text: string): [string, string][] | null {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      const pairs: [string, string][] = [];
      for (const item of parsed) {
        if (Array.isArray(item) && item.length === 2 && typeof item[0] === 'string' && typeof item[1] === 'string') {
          pairs.push([item[0].toLowerCase(), item[1].toLowerCase()]);
        }
      }
      if (pairs.length > 0) return pairs;
    }
  } catch {
    const regex = /\["([a-z]+)","([a-z]+)"\]/gi;
    const matches = [...text.matchAll(regex)];
    if (matches.length > 0) {
      return matches.map((m) => [m[1].toLowerCase(), m[2].toLowerCase()]);
    }
  }
  return null;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const starters = ['time', 'coffee', 'snow', 'fire', 'river', 'stone', 'night', 'sun', 'star', 'beach', 'field', 'wind', 'rain', 'moon', 'gold', 'iron', 'candle', 'maple', 'oak', 'white', 'black', 'green', 'blue', 'red', 'bright', 'dark', 'sweet', 'deep', 'high', 'wild', 'cold', 'warm', 'soft', 'hard', 'round', 'sharp', 'silver', 'copper', 'steel', 'brick'];

const SUFFIX_WORDS = ['brighten', 'brightener', 'brighteners', 'brightness', 'brightside', 'brightsides', 'darken', 'darkener', 'darkness', 'soften', 'softener', 'softeners', 'sweeten', 'sweetener', 'sweeteners', 'sweetness', 'hardness', 'harder', 'hardest', 'coldness', 'warmer', 'warmest', 'warmth', 'whiteness', 'whiten', 'whitener', 'blackness', 'blacken', 'redness', 'redden', 'blueness', 'bluish', 'greenness', 'greenish', 'roundness', 'sharpen', 'sharpness', 'widen', 'width', 'height', 'depth', 'length', 'strong', 'stronger', 'strongest', 'weak', 'weaken', 'weakness', 'paribus', 'cetera', 'ceteris'];

function isValidPair(pair: [string, string]): boolean {
  if (pair[0].length < 2 || pair[1].length < 2) return false;
  // reject suffix-derivative pairs like bright→brighten
  if (pair[0] === pair[1] || pair[1].startsWith(pair[0]) || pair[0].startsWith(pair[1])) return false;
  // reject known bad words
  if (SUFFIX_WORDS.includes(pair[0]) || SUFFIX_WORDS.includes(pair[1])) return false;
  const joined = pair.join(' ');
  const bad = ['plan et', 'et cetera', 'cetera paribus', 'acean blue', 'blazer jacket', 'cropper share'];
  if (bad.includes(joined)) return false;
  return true;
}

function repairChain(pairs: [string, string][], count: number, startFrom?: string): [string, string][] {
  const result: [string, string][] = [];
  for (const p of pairs) {
    if (result.length === 0) {
      if (!startFrom || p[0] === startFrom) {
        result.push(p);
      } else {
        const fix = FALLBACK_PAIRS.find((f) => f[0] === startFrom);
        if (fix) result.push(fix);
        else result.push(p);
      }
    } else {
      const expected = result[result.length - 1][1];
      if (p[0] === expected) {
        result.push(p);
      } else {
        const fix = FALLBACK_PAIRS.find((f) => f[0] === expected);
        if (fix) result.push(fix);
      }
    }
    if (result.length >= count) break;
  }
  return result;
}

export async function generateCompoundPairs(count: number, startFrom?: string): Promise<[string, string][]> {
  const pickStarter = startFrom || starters[Math.floor(Math.random() * starters.length)];

  const userMsg = startFrom
    ? `Continue the chain from "${startFrom}". Generate exactly ${count} pairs chained as [["${startFrom}","b"],["b","c"],["c","d"]...] where each word2 is word1 of the next pair.`
    : `Generate exactly ${count} pairs chained as [["${pickStarter}","b"],["b","c"],["c","d"]...] where each word2 is word1 of the next pair.`;

  const response = await callDeepSeekSafe([
    {
      role: 'system',
      content: 'You output ONLY a valid JSON array of chained [word1, word2] pairs where word2 of each pair is exactly word1 of the next. Each pair is a real common English two-word phrase. Never split compound words.',
    },
    {
      role: 'user',
      content: userMsg,
    },
  ]);

  if (response) {
    const pairs = parsePairs(response);
    if (pairs && pairs.length > 0) {
      const clean = pairs.filter(isValidPair);
      let repaired = repairChain(clean, count, startFrom);
      if (repaired.length < count) {
        const lastWord = repaired.length > 0 ? repaired[repaired.length - 1][1] : startFrom;
        const more = await generateCompoundPairs(count - repaired.length, lastWord);
        repaired = [...repaired, ...more];
      }
      return repaired.slice(0, count);
    }
  }

  if (startFrom) {
    const match = FALLBACK_PAIRS.filter((p) => p[0] === startFrom);
    if (match.length > 0) return match.slice(0, count);
  }
  return shuffleArray(FALLBACK_PAIRS).slice(0, count);
}
