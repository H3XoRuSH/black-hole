import { callDeepSeek } from '../deepseek.js';

const FALLBACK_PAIRS: [string, string][] = [
  // Chain A: coffee → ... → mail → bag → lady → bug
  ['coffee', 'cake'], ['cake', 'walk'], ['walk', 'way'], ['way', 'out'],
  ['out', 'side'], ['side', 'dish'], ['dish', 'water'], ['water', 'fall'],
  ['fall', 'guy'], ['guy', 'wire'], ['wire', 'tap'], ['tap', 'dance'],
  ['dance', 'floor'], ['floor', 'plan'], ['plan', 'tree'], ['tree', 'house'],
  ['house', 'plant'], ['plant', 'food'], ['food', 'chain'], ['chain', 'mail'],
  ['mail', 'bag'], ['bag', 'lady'], ['lady', 'bug'],
  // Chain B: snow → ball → game → ... → front
  ['snow', 'ball'], ['ball', 'game'], ['game', 'plan'],
  ['plan', 'set'], ['set', 'piece'], ['piece', 'work'], ['work', 'shop'],
  ['shop', 'talk'], ['talk', 'show'], ['show', 'case'], ['case', 'study'],
  ['study', 'hall'], ['hall', 'pass'], ['pass', 'code'], ['code', 'red'],
  ['red', 'tape'], ['tape', 'worm'], ['worm', 'hole'], ['hole', 'punch'],
  ['punch', 'line'], ['line', 'back'], ['back', 'bone'], ['bone', 'dry'],
  ['dry', 'clean'], ['clean', 'cut'], ['cut', 'glass'], ['glass', 'work'],
  ['work', 'bench'],
  // Chain C: sun → flower → pot → ... → fold
  ['sun', 'flower'], ['flower', 'pot'], ['pot', 'luck'], ['luck', 'out'],
  ['out', 'field'], ['field', 'goal'], ['goal', 'post'], ['post', 'card'],
  ['card', 'sharp'], ['sharp', 'turn'], ['turn', 'key'], ['key', 'board'],
  ['board', 'walk'], ['way', 'bill'], ['bill', 'fold'],
  // Chain D: door → step → ladder → back → door → bell → hop
  ['door', 'step'], ['step', 'ladder'], ['ladder', 'back'], ['back', 'door'],
  ['door', 'bell'], ['bell', 'hop'],
  // Chain E: fire → fly → trap → door → mat → ... → mix
  ['fire', 'fly'], ['fly', 'trap'], ['trap', 'door'], ['door', 'mat'],
  ['mat', 'cut'], ['cut', 'out'], ['out', 'cry'], ['cry', 'baby'],
  ['baby', 'sit'], ['sit', 'down'], ['down', 'pour'], ['pour', 'out'],
  ['out', 'post'], ['post', 'mark'], ['mark', 'man'], ['man', 'hole'],
  ['hole', 'wall'], ['wall', 'paper'], ['paper', 'trail'], ['trail', 'mix'],
  // Chain F: head → room → mate → ... → maker
  ['head', 'room'], ['room', 'mate'], ['mate', 'ship'], ['ship', 'yard'],
  ['yard', 'bird'], ['bird', 'bath'], ['bath', 'room'], ['room', 'key'],
  ['key', 'ring'], ['ring', 'finger'], ['finger', 'nail'], ['nail', 'file'],
  ['file', 'cabinet'], ['cabinet', 'maker'],
  // Chain G: air → port → side → show → time → card → board
  ['air', 'port'], ['port', 'side'], ['side', 'show'], ['show', 'time'],
  ['time', 'card'], ['card', 'board'],
  // Chain H: life → time → warp → speed → trap
  ['life', 'time'], ['time', 'warp'], ['warp', 'speed'], ['speed', 'trap'],
  // Chain I: road → trip → wire → work
  ['road', 'trip'], ['trip', 'wire'], ['wire', 'work'],
  // Chain J: stone → wall → flower → bed → rock → pool
  ['stone', 'wall'], ['wall', 'flower'], ['flower', 'bed'], ['bed', 'rock'],
  ['rock', 'pool'],
  // Chain K: black → board → game → fish → bowl
  ['black', 'board'], ['board', 'game'], ['game', 'fish'], ['fish', 'bowl'],
  // Chain L: rain → bow → tie → dye → hard → ware → house → boat → yard
  ['rain', 'bow'], ['bow', 'tie'], ['tie', 'dye'], ['dye', 'hard'],
  ['hard', 'ware'], ['ware', 'house'], ['house', 'boat'], ['boat', 'yard'],
  // Chain M: moon → light → year → end → game → set → point → guard → rail
  ['moon', 'light'], ['light', 'year'], ['year', 'end'], ['end', 'game'],
  ['game', 'set'], ['set', 'point'], ['point', 'guard'], ['guard', 'rail'],
  // Chain N: spring → roll → call → back → track → ball → bear → trap → door
  ['spring', 'roll'], ['roll', 'call'], ['call', 'back'], ['back', 'track'],
  ['track', 'ball'], ['ball', 'bear'], ['bear', 'trap'],
  // Chain O: dog → wood → pile → driver → ant → farm
  ['dog', 'wood'], ['wood', 'pile'], ['pile', 'driver'], ['driver', 'ant'],
  ['ant', 'farm'],
  // Chain T: date → night → owl
  ['date', 'night'], ['night', 'owl'],
  // Chain U: key → note → book → store → front
  ['key', 'note'], ['note', 'book'], ['book', 'store'], ['store', 'front'],
  // Chain V: right → hand → book → worm
  ['right', 'hand'], ['hand', 'book'], ['book', 'worm'],
  // Chain P: wind → mill → stone → ground → hog → dog → house
  ['wind', 'mill'], ['mill', 'stone'], ['stone', 'ground'], ['ground', 'hog'],
  ['hog', 'dog'], ['dog', 'house'],
  // Chain Q: yard → sale → price → tag → line → drive
  ['yard', 'sale'], ['sale', 'price'], ['price', 'tag'], ['tag', 'line'],
  ['line', 'drive'],
  // Chain R: arm → chair → man → power → play → book
  ['arm', 'chair'], ['chair', 'man'], ['man', 'power'], ['power', 'play'],
  ['play', 'book'],
  // Chain S: town → hall → way → side → walk
  ['town', 'hall'], ['hall', 'way'], ['way', 'side'], ['side', 'walk'],
];

async function callDeepSeekSafe(messages: { role: string; content: string }[]): Promise<string | null> {
  try {
    return await callDeepSeek({ messages, maxTokens: 2500, temperature: 0.85 });
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

const starters = ['time', 'coffee', 'snow', 'fire', 'river', 'stone', 'night', 'sun', 'star', 'beach', 'field', 'wind', 'rain', 'moon', 'gold', 'iron', 'candle', 'maple', 'oak', 'white', 'black', 'green', 'blue', 'red', 'bright', 'dark', 'sweet', 'deep', 'high', 'wild', 'cold', 'warm', 'soft', 'hard', 'round', 'sharp', 'silver', 'copper', 'steel', 'brick', 'apple', 'ocean', 'mountain', 'forest', 'desert', 'cloud', 'storm', 'thunder', 'lightning', 'crystal', 'diamond', 'emerald', 'ruby', 'pearl', 'ivory', 'pine', 'cedar', 'bamboo', 'rose', 'lily', 'tiger', 'wolf', 'eagle', 'hawk', 'fox', 'bear', 'deer', 'falcon', 'lake', 'garden', 'meadow', 'valley', 'canyon', 'summer', 'winter', 'spring', 'autumn', 'dawn', 'dusk', 'shadow', 'flame', 'ice', 'frost', 'moss', 'vine', 'clay', 'sand', 'dust', 'ash'];

const SUFFIX_WORDS = ['brighten', 'brightener', 'brighteners', 'brightness', 'brightside', 'brightsides', 'darken', 'darkener', 'darkness', 'soften', 'softener', 'softeners', 'sweeten', 'sweetener', 'sweeteners', 'sweetness', 'hardness', 'harder', 'hardest', 'coldness', 'warmer', 'warmest', 'warmth', 'whiteness', 'whiten', 'whitener', 'blackness', 'blacken', 'redness', 'redden', 'blueness', 'bluish', 'greenness', 'greenish', 'roundness', 'sharpen', 'sharpness', 'widen', 'width', 'height', 'depth', 'length', 'strong', 'stronger', 'strongest', 'weak', 'weaken', 'weakness'];

const BANNED_WORDS = new Set([
  'the', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'from',
  'as', 'is', 'it', 'be', 'or', 'and', 'not', 'no', 'so', 'if', 'but',
  'this', 'that', 'these', 'those', 'he', 'she', 'it', 'they', 'we', 'you',
  'his', 'her', 'its', 'our', 'their', 'my', 'your',
  'am', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'can', 'could', 'will', 'would', 'shall', 'should',
  'may', 'might', 'must', 'about', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'between', 'under', 'again', 'once',
  'up', 'off',
]);

function isValidPair(pair: [string, string]): boolean {
  if (pair[0].length < 3 || pair[1].length < 3) return false;
  if (BANNED_WORDS.has(pair[0]) || BANNED_WORDS.has(pair[1])) return false;
  if (pair[0] === pair[1] || pair[1].startsWith(pair[0]) || pair[0].startsWith(pair[1])) return false;
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
    ? `Continue the chain from "${startFrom}". Generate exactly ${count} pairs chained as [["${startFrom}","b"],["b","c"],["c","d"]...] where each word2 becomes word1 of the next pair.`
    : `Generate exactly ${count} pairs chained as [["${pickStarter}","b"],["b","c"],["c","d"]...] where each word2 becomes word1 of the next pair.`;

  const response = await callDeepSeekSafe([
    {
      role: 'system',
      content: 'You output ONLY a valid JSON array of chained [word1, word2] pairs. word2 of each pair is exactly word1 of the next. Each [word1, word2] must be a real standalone English two-word phrase or compound (e.g., ["coffee","cake"] for "coffee cake", ["snow","ball"] for "snowball"). CRITICAL: Do NOT split multi-word phrases into single-word chain links. For example, if a phrase is "light bulb moment", do NOT output ["bulb","moment"] — that is not a real two-word phrase. Never use articles, prepositions, or pronouns (the, a, of, in, it, etc.) as words. Every word must be a real English content word (noun, adjective, verb).',
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
