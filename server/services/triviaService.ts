import type { TriviaQuestion } from '../../src/types/shared.js';

function isNotWhichQuestion(q: TriviaQuestion): boolean {
  return !q.question.trim().toLowerCase().startsWith('which');
}

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, '\'')
    .replace(/&eacute;/g, 'é')
    .replace(/&rsquo;/g, '\'')
    .replace(/&lsquo;/g, '\'')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&shy;/g, '')
    .replace(/&deg;/g, '°')
    .replace(/&pi;/g, 'π')
    .replace(/&Delta;/g, 'Δ');
}

const fallbackQuestions: TriviaQuestion[] = [
  { category: 'General Knowledge', difficulty: 'easy', question: 'What is the capital of France?', correctAnswer: 'Paris' },
  { category: 'Science & Nature', difficulty: 'easy', question: 'What is the chemical symbol for water?', correctAnswer: 'H2O' },
  { category: 'History', difficulty: 'medium', question: 'In which year did World War II end?', correctAnswer: '1945' },
  { category: 'General Knowledge', difficulty: 'easy', question: 'How many continents are there on Earth?', correctAnswer: '7' },
  { category: 'Science & Nature', difficulty: 'medium', question: 'What planet is known as the Red Planet?', correctAnswer: 'Mars' },
  { category: 'Entertainment', difficulty: 'easy', question: 'What color is Shrek?', correctAnswer: 'Green' },
  { category: 'General Knowledge', difficulty: 'medium', question: 'What is the largest ocean on Earth?', correctAnswer: 'Pacific' },
  { category: 'History', difficulty: 'hard', question: 'Who was the first President of the United States?', correctAnswer: 'George Washington' },
  { category: 'General Knowledge', difficulty: 'easy', question: 'How many legs does a spider have?', correctAnswer: '8' },
  { category: 'Science & Nature', difficulty: 'hard', question: 'What is the speed of light approximately in km/s?', correctAnswer: '299792' },
];

const API_BASE = 'https://opentdb.com/api.php';

function parseResult(q: any): TriviaQuestion {
  return {
    category: decodeHtml(q.category),
    difficulty: q.difficulty,
    question: decodeHtml(q.question),
    correctAnswer: decodeHtml(q.correct_answer),
  };
}

async function fetchRaw(amount: number, options?: { category?: number; difficulty?: string }): Promise<TriviaQuestion[]> {
  let url = `${API_BASE}?amount=${amount}&type=multiple`;
  if (options?.category) url += `&category=${options.category}`;
  if (options?.difficulty) url += `&difficulty=${options.difficulty}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const data: any = await response.json();
  if (data.response_code !== 0 || !data.results || data.results.length === 0) {
    throw new Error('No results');
  }
  return data.results.map(parseResult);
}

export async function fetchQuestions(amount = 10, options?: { category?: number; difficulty?: string }): Promise<TriviaQuestion[]> {
  const good: TriviaQuestion[] = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const batch = await fetchRaw(20, options);
      const filtered = batch.filter(isNotWhichQuestion);
      good.push(...filtered);
      if (good.length >= amount) {
        return good.slice(0, amount);
      }
    } catch (err) {
      console.warn(`Trivia fetch attempt ${attempt + 1} failed:`, err);
      break;
    }
  }
  if (good.length > 0) return good;
  console.warn('All trivia fetch attempts failed, using fallback');
  return [...fallbackQuestions];
}
