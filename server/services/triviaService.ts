import type { TriviaQuestion } from '../../src/types/shared.js';

const API_BASE = 'https://the-trivia-api.com/v2/questions';

const slugToReadable: Record<string, string> = {
  general_knowledge: 'General Knowledge',
  film_and_tv: 'Film & TV',
  music: 'Music',
  arts_and_literature: 'Arts & Literature',
  science: 'Science',
  geography: 'Geography',
  history: 'History',
  sport_and_leisure: 'Sports & Leisure',
  society_and_culture: 'Society & Culture',
  food_and_drink: 'Food & Drink',
};

const curatedQuestions: TriviaQuestion[] = [
  { category: 'General Knowledge', difficulty: 'easy', question: 'What is the capital of France?', correctAnswer: 'Paris' },
  { category: 'General Knowledge', difficulty: 'easy', question: 'How many continents are there on Earth?', correctAnswer: '7' },
  { category: 'General Knowledge', difficulty: 'easy', question: 'How many legs does a spider have?', correctAnswer: '8' },
  { category: 'General Knowledge', difficulty: 'medium', question: 'What is the largest ocean on Earth?', correctAnswer: 'Pacific' },
  { category: 'General Knowledge', difficulty: 'medium', question: 'What is the boiling point of water in degrees Celsius?', correctAnswer: '100' },
  { category: 'General Knowledge', difficulty: 'medium', question: 'Who painted the Mona Lisa?', correctAnswer: 'Leonardo da Vinci' },
  { category: 'General Knowledge', difficulty: 'hard', question: 'What year was the United Nations founded?', correctAnswer: '1945' },
  { category: 'General Knowledge', difficulty: 'hard', question: 'What element has the atomic number 1?', correctAnswer: 'Hydrogen' },
  { category: 'General Knowledge', difficulty: 'hard', question: 'Who developed the theory of general relativity?', correctAnswer: 'Albert Einstein' },
  { category: 'General Knowledge', difficulty: 'hard', question: 'What is the tallest mountain in the world?', correctAnswer: 'Mount Everest' },
  { category: 'Film & TV', difficulty: 'easy', question: 'What color is Shrek?', correctAnswer: 'Green' },
  { category: 'Film & TV', difficulty: 'easy', question: 'In "The Lion King", who is Simba\'s father?', correctAnswer: 'Mufasa' },
  { category: 'Film & TV', difficulty: 'easy', question: 'What is the name of the toy cowboy in "Toy Story"?', correctAnswer: 'Woody' },
  { category: 'Film & TV', difficulty: 'medium', question: 'Who directed "Jurassic Park"?', correctAnswer: 'Steven Spielberg' },
  { category: 'Film & TV', difficulty: 'medium', question: 'In "The Matrix", what color pill does Neo take?', correctAnswer: 'Red' },
  { category: 'Film & TV', difficulty: 'medium', question: 'Who played Jack Dawson in "Titanic"?', correctAnswer: 'Leonardo DiCaprio' },
  { category: 'Film & TV', difficulty: 'hard', question: 'Who directed "Pulp Fiction"?', correctAnswer: 'Quentin Tarantino' },
  { category: 'Film & TV', difficulty: 'hard', question: 'What year was "The Godfather" released?', correctAnswer: '1972' },
  { category: 'Film & TV', difficulty: 'hard', question: 'Who played the Joker in "The Dark Knight"?', correctAnswer: 'Heath Ledger' },
  { category: 'Music', difficulty: 'easy', question: 'What instrument has 88 keys?', correctAnswer: 'Piano' },
  { category: 'Music', difficulty: 'easy', question: 'Who is known as the King of Pop?', correctAnswer: 'Michael Jackson' },
  { category: 'Music', difficulty: 'easy', question: 'How many strings does a standard guitar have?', correctAnswer: '6' },
  { category: 'Music', difficulty: 'medium', question: 'Which band performed "Bohemian Rhapsody"?', correctAnswer: 'Queen' },
  { category: 'Music', difficulty: 'medium', question: 'What instrument does Yo-Yo Ma play?', correctAnswer: 'Cello' },
  { category: 'Music', difficulty: 'medium', question: 'Who sang "Rolling in the Deep"?', correctAnswer: 'Adele' },
  { category: 'Music', difficulty: 'medium', question: 'What is the best-selling album of all time?', correctAnswer: 'Thriller' },
  { category: 'Music', difficulty: 'hard', question: 'Who composed the "Moonlight Sonata"?', correctAnswer: 'Ludwig van Beethoven' },
  { category: 'Music', difficulty: 'hard', question: 'What year did the Beatles break up?', correctAnswer: '1970' },
  { category: 'Music', difficulty: 'hard', question: 'Who wrote the opera "The Marriage of Figaro"?', correctAnswer: 'Wolfgang Amadeus Mozart' },
  { category: 'Arts & Literature', difficulty: 'easy', question: 'Who wrote "Romeo and Juliet"?', correctAnswer: 'William Shakespeare' },
  { category: 'Arts & Literature', difficulty: 'easy', question: 'What is the first book of the Bible?', correctAnswer: 'Genesis' },
  { category: 'Arts & Literature', difficulty: 'medium', question: 'Who wrote "1984"?', correctAnswer: 'George Orwell' },
  { category: 'Arts & Literature', difficulty: 'medium', question: 'Who wrote "To Kill a Mockingbird"?', correctAnswer: 'Harper Lee' },
  { category: 'Arts & Literature', difficulty: 'medium', question: 'Who wrote "The Great Gatsby"?', correctAnswer: 'F. Scott Fitzgerald' },
  { category: 'Arts & Literature', difficulty: 'hard', question: 'Who wrote "One Hundred Years of Solitude"?', correctAnswer: 'Gabriel Garcia Marquez' },
  { category: 'Arts & Literature', difficulty: 'hard', question: 'In "Moby-Dick", what is the name of the captain?', correctAnswer: 'Ahab' },
  { category: 'Arts & Literature', difficulty: 'hard', question: 'Who wrote "The Catcher in the Rye"?', correctAnswer: 'J. D. Salinger' },
  { category: 'Science', difficulty: 'easy', question: 'What is the chemical symbol for water?', correctAnswer: 'H2O' },
  { category: 'Science', difficulty: 'easy', question: 'What planet is known as the Red Planet?', correctAnswer: 'Mars' },
  { category: 'Science', difficulty: 'easy', question: 'How many hearts does an octopus have?', correctAnswer: '3' },
  { category: 'Science', difficulty: 'medium', question: 'What gas do plants release during photosynthesis?', correctAnswer: 'Oxygen' },
  { category: 'Science', difficulty: 'medium', question: 'What is the largest organ in the human body?', correctAnswer: 'Skin' },
  { category: 'Science', difficulty: 'medium', question: 'How many chromosomes do humans have?', correctAnswer: '46' },
  { category: 'Science', difficulty: 'medium', question: 'What force keeps us grounded on Earth?', correctAnswer: 'Gravity' },
  { category: 'Science', difficulty: 'hard', question: 'What is the speed of light approximately in km per second?', correctAnswer: '299792' },
  { category: 'Science', difficulty: 'hard', question: 'What element is a diamond made of?', correctAnswer: 'Carbon' },
  { category: 'Science', difficulty: 'hard', question: 'What is the powerhouse of the cell?', correctAnswer: 'Mitochondria' },
  { category: 'Science', difficulty: 'easy', question: 'What does "CPU" stand for?', correctAnswer: 'Central Processing Unit' },
  { category: 'Science', difficulty: 'easy', question: 'What does "RAM" stand for?', correctAnswer: 'Random Access Memory' },
  { category: 'Science', difficulty: 'easy', question: 'What does "HTML" stand for?', correctAnswer: 'HyperText Markup Language' },
  { category: 'Science', difficulty: 'medium', question: 'What programming language is known as the language of the web?', correctAnswer: 'JavaScript' },
  { category: 'Science', difficulty: 'medium', question: 'What does "HTTP" stand for?', correctAnswer: 'HyperText Transfer Protocol' },
  { category: 'Science', difficulty: 'medium', question: 'Who is considered the father of computer science?', correctAnswer: 'Alan Turing' },
  { category: 'Science', difficulty: 'medium', question: 'What does "SQL" stand for?', correctAnswer: 'Structured Query Language' },
  { category: 'Science', difficulty: 'hard', question: 'What year was the World Wide Web invented?', correctAnswer: '1989' },
  { category: 'Science', difficulty: 'hard', question: 'What does "API" stand for?', correctAnswer: 'Application Programming Interface' },
  { category: 'Science', difficulty: 'hard', question: 'What is 2 to the power of 10?', correctAnswer: '1024' },
  { category: 'Science', difficulty: 'easy', question: 'How many sides does a triangle have?', correctAnswer: '3' },
  { category: 'Science', difficulty: 'easy', question: 'What is the square root of 64?', correctAnswer: '8' },
  { category: 'Science', difficulty: 'medium', question: 'What is the value of Pi rounded to two decimal places?', correctAnswer: '3.14' },
  { category: 'Science', difficulty: 'medium', question: 'How many degrees are in a right angle?', correctAnswer: '90' },
  { category: 'Science', difficulty: 'medium', question: 'What is the next prime number after 7?', correctAnswer: '11' },
  { category: 'Science', difficulty: 'medium', question: 'How many sides does a hexagon have?', correctAnswer: '6' },
  { category: 'Science', difficulty: 'hard', question: 'Who is known as the father of geometry?', correctAnswer: 'Euclid' },
  { category: 'Science', difficulty: 'hard', question: 'What is the only even prime number?', correctAnswer: '2' },
  { category: 'Society & Culture', difficulty: 'easy', question: 'Who is the king of the Greek gods?', correctAnswer: 'Zeus' },
  { category: 'Society & Culture', difficulty: 'easy', question: 'Who is the god of the sea in Greek mythology?', correctAnswer: 'Poseidon' },
  { category: 'Society & Culture', difficulty: 'easy', question: 'What is the name of the Greek goddess of love?', correctAnswer: 'Aphrodite' },
  { category: 'Society & Culture', difficulty: 'medium', question: 'Who was the one-eyed giant in Greek mythology?', correctAnswer: 'Cyclops' },
  { category: 'Society & Culture', difficulty: 'medium', question: 'Who was the messenger of the Greek gods?', correctAnswer: 'Hermes' },
  { category: 'Society & Culture', difficulty: 'medium', question: 'In Norse mythology, who is the father of Thor?', correctAnswer: 'Odin' },
  { category: 'Society & Culture', difficulty: 'medium', question: 'What is the Greek goddess of wisdom called?', correctAnswer: 'Athena' },
  { category: 'Society & Culture', difficulty: 'hard', question: 'Who was the Roman equivalent of the Greek god Zeus?', correctAnswer: 'Jupiter' },
  { category: 'Society & Culture', difficulty: 'hard', question: 'In Egyptian mythology, who is the god of the underworld?', correctAnswer: 'Osiris' },
  { category: 'Society & Culture', difficulty: 'hard', question: 'What creature has the head of a human and the body of a lion in Egyptian mythology?', correctAnswer: 'Sphinx' },
  { category: 'Sports & Leisure', difficulty: 'easy', question: 'How many players are on a soccer team on the field?', correctAnswer: '11' },
  { category: 'Sports & Leisure', difficulty: 'easy', question: 'What sport is played at Wimbledon?', correctAnswer: 'Tennis' },
  { category: 'Sports & Leisure', difficulty: 'easy', question: 'In basketball, how many points is a free throw worth?', correctAnswer: '1' },
  { category: 'Sports & Leisure', difficulty: 'medium', question: 'Who has won the most Grand Slam titles in men\'s tennis?', correctAnswer: 'Novak Djokovic' },
  { category: 'Sports & Leisure', difficulty: 'medium', question: 'How long is a marathon in miles?', correctAnswer: '26.2' },
  { category: 'Sports & Leisure', difficulty: 'medium', question: 'What is the diameter of a basketball hoop in inches?', correctAnswer: '18' },
  { category: 'Sports & Leisure', difficulty: 'hard', question: 'In what year were the first modern Olympic Games held?', correctAnswer: '1896' },
  { category: 'Sports & Leisure', difficulty: 'hard', question: 'Who holds the record for the most home runs in MLB history?', correctAnswer: 'Barry Bonds' },
  { category: 'Sports & Leisure', difficulty: 'hard', question: 'What country has won the most FIFA World Cups?', correctAnswer: 'Brazil' },
  { category: 'Geography', difficulty: 'easy', question: 'What is the largest continent by area?', correctAnswer: 'Asia' },
  { category: 'Geography', difficulty: 'easy', question: 'What river flows through London?', correctAnswer: 'Thames' },
  { category: 'Geography', difficulty: 'easy', question: 'What is the capital of Japan?', correctAnswer: 'Tokyo' },
  { category: 'Geography', difficulty: 'medium', question: 'What is the longest river in the world?', correctAnswer: 'Nile' },
  { category: 'Geography', difficulty: 'medium', question: 'What is the capital of Australia?', correctAnswer: 'Canberra' },
  { category: 'Geography', difficulty: 'medium', question: 'Which country has the most natural lakes?', correctAnswer: 'Canada' },
  { category: 'Geography', difficulty: 'medium', question: 'What is the largest desert in the world?', correctAnswer: 'Antarctica' },
  { category: 'Geography', difficulty: 'hard', question: 'What is the deepest point in the ocean?', correctAnswer: 'Mariana Trench' },
  { category: 'Geography', difficulty: 'hard', question: 'How many time zones does Russia span?', correctAnswer: '11' },
  { category: 'Geography', difficulty: 'hard', question: 'What country is both in Europe and Asia?', correctAnswer: 'Russia' },
  { category: 'History', difficulty: 'easy', question: 'Who was the first President of the United States?', correctAnswer: 'George Washington' },
  { category: 'History', difficulty: 'easy', question: 'In which year did World War II end?', correctAnswer: '1945' },
  { category: 'History', difficulty: 'easy', question: 'Who discovered America in 1492?', correctAnswer: 'Christopher Columbus' },
  { category: 'History', difficulty: 'medium', question: 'What ancient civilization built the pyramids of Giza?', correctAnswer: 'Egyptians' },
  { category: 'History', difficulty: 'medium', question: 'Who was the first woman to fly solo across the Atlantic?', correctAnswer: 'Amelia Earhart' },
  { category: 'History', difficulty: 'medium', question: 'In what year did the Titanic sink?', correctAnswer: '1912' },
  { category: 'History', difficulty: 'medium', question: 'Who gave the "I Have a Dream" speech?', correctAnswer: 'Martin Luther King Jr.' },
  { category: 'History', difficulty: 'hard', question: 'What year did the Berlin Wall fall?', correctAnswer: '1989' },
  { category: 'History', difficulty: 'hard', question: 'Who was the first Emperor of China?', correctAnswer: 'Qin Shi Huang' },
  { category: 'History', difficulty: 'hard', question: 'What treaty ended World War I?', correctAnswer: 'Treaty of Versailles' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface TriviaApiQuestion {
  category: string;
  id: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  question: { text: string };
  tags: string[];
  type: string;
  difficulty: string;
  regions: string[];
  isNiche: boolean;
}

function parseApiQuestion(q: TriviaApiQuestion): TriviaQuestion {
  return {
    category: slugToReadable[q.category] ?? q.category,
    difficulty: q.difficulty,
    question: q.question.text,
    correctAnswer: q.correctAnswer,
  };
}

function isNotWhichQuestion(text: string): boolean {
  return !text.trim().toLowerCase().startsWith('which');
}

async function fetchRaw(options?: { categorySlug?: string; difficulty?: string }): Promise<TriviaApiQuestion[]> {
  const params = new URLSearchParams();
  params.set('limit', '20');
  if (options?.categorySlug) params.set('categories', options.categorySlug);
  if (options?.difficulty) params.set('difficulties', options.difficulty);

  const response = await fetch(`${API_BASE}?${params.toString()}`);
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const data: TriviaApiQuestion[] = await response.json();
  if (!data || data.length === 0) throw new Error('No results');
  return data;
}

async function fetchFromApi(amount: number, options?: { categorySlug?: string; difficulty?: string }): Promise<TriviaQuestion[]> {
  const good: TriviaQuestion[] = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const batch = await fetchRaw(options);
    const filtered = batch
      .map(parseApiQuestion)
      .filter((q) => isNotWhichQuestion(q.question));
    good.push(...filtered);
    if (good.length >= amount) return good.slice(0, amount);
  }
  if (good.length > 0) return good;
  throw new Error('No valid questions after filtering');
}

export async function fetchQuestions(amount = 10, options?: { categorySlug?: string; categoryName?: string; difficulty?: string }): Promise<TriviaQuestion[]> {
  try {
    return await fetchFromApi(amount, { categorySlug: options?.categorySlug, difficulty: options?.difficulty });
  } catch (err) {
    console.warn('Trivia API fetch failed, using curated fallback:', err);
  }

  let pool = [...curatedQuestions];
  if (options?.categoryName) {
    pool = pool.filter((q) => q.category === options.categoryName);
  }
  if (options?.difficulty) {
    pool = pool.filter((q) => q.difficulty === options.difficulty);
  }

  if (pool.length === 0) return shuffleArray([...curatedQuestions]).slice(0, amount);
  if (pool.length <= amount) return shuffleArray(pool);
  return shuffleArray(pool).slice(0, amount);
}
