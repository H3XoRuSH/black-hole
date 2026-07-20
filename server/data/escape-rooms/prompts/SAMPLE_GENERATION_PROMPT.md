You are an expert game designer. Generate a new, structurally sound text-based escape room TypeScript file adhering strictly to the following interfaces:

export interface EscapeRoomData {
  id: string;
  name: string;
  description: string;
  difficulty: 'very-easy' | 'easy' | 'medium' | 'hard' | 'extreme';
  intro: string;
  locations: EscapeRoomLocation[];
  puzzles: EscapeRoomPuzzle[];
}

export interface SoundNote {
  pitch?: 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A4' | 'B4' | 'C5' | 'low' | 'medium' | 'high';
  dur: number;   // milliseconds
  rest: boolean; // true = silence/gap, false = play the note
}

export interface SoundPuzzle {
  type: 'rhythm' | 'melody' | 'pitch-sequence';
  notes: SoundNote[];
}

export interface EscapeRoomPuzzle {
  id: string;
  locationId: string;
  narrative: string;
  question: string;
  answer: string;
  hints: string[];
  solved?: boolean;
  sound?: SoundPuzzle;
}

export interface EscapeRoomLocation {
  id: string;
  name: string;
  description: string;
}

Here is a sample of the exact schema, layout, and logical cohesion required. Note that rooms are TypeScript files, not JSON:

```ts
import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'abandoned-lab',
  name: 'The Abandoned Lab',
  description: 'A mysterious laboratory abandoned decades ago. Solve the puzzles left behind by the missing scientists to escape!',
  intro: 'You push open the rusted metal door and step inside. Dust particles dance in the faint light filtering through cracked windows. A flickering terminal on the reception desk crackles to life, displaying a message:\n\n"IF YOU ARE READING THIS, I AM ALREADY GONE. THE LAB IS LOCKED DOWN. FIND MY RESEARCH, SOLVE THE PUZZLES I LEFT BEHIND, AND ESCAPE BEFORE THEY COME BACK.\n— DR. HARRISON"\n\nThe terminal flickers and dies. You are trapped. The only way out is forward.',
  locations: [
    {
      id: 'foyer',
      name: 'The Foyer',
      description: 'A cramped reception area with a dusty desk, a bulletin board of faded notices, and a row of employee lockers. A reinforced door to the east has a digital keypad.'
    },
    {
      id: 'lab',
      name: 'The Laboratory',
      description: 'A sprawling lab filled with beakers, bubbling vials, and strange glowing substances. Diagrams of molecular structures cover the walls. A massive centrifuge hums quietly in the corner.'
    },
    {
      id: 'vault',
      name: 'The Vault',
      description: 'A heavy steel door groans open to reveal a small, windowless room. Server racks line the walls, their indicator lights blinking red. In the center stands a podium with a terminal — this must be where Dr. Harrison sealed everything away.'
    }
  ],
  puzzles: [
    {
      id: 'foyer-1',
      locationId: 'foyer',
      narrative: 'You approach the reception desk. Among scattered papers and a stone-cold coffee mug, you spot a keypad lock securing a drawer. The keys labeled 1, 3, 5, and 8 are worn smooth from repeated use.',
      question: 'A yellowed sticky note on the monitor reads: "The drawer code is my birthday, but backwards." The calendar on the wall has May 18th, 1953 circled in red — Dr. Harrison\'s birthday: 5/18/53.\n\nEnter the 5-digit code.',
      answer: '35815',
      hints: [
        'Write the birthday as digits: 5-18-53 → 51853. Now reverse it.',
        'Read 51853 backwards: 3, 5, 8, 1, 5 → 35815.'
      ]
    },
    {
      id: 'foyer-2',
      locationId: 'foyer',
      narrative: 'Inside the drawer you find an employee badge and a small notebook listing staff names with star ratings. A row of lockers stands against the wall, each with a 2-digit combination lock.',
      question: 'The notebook reads:\nAlice — ★★★\nBob — ★\nCarol — ★★★★\nDave — ★★\nEve — ★★★★★\n\n"Dr. Harrison\'s lab assistant has the MOST stars. Their locker combination is: the number of letters in their name, followed by their number of stars."',
      answer: '35',
      hints: [
        'The person with the most stars is Eve (5 stars).',
        'Eve has 3 letters in her name, and 5 stars. The combination is 35.'
      ]
    },
    {
      id: 'foyer-3',
      locationId: 'foyer',
      narrative: 'The locker creaks open, revealing a lab coat, safety goggles, and a torn scrap of paper with symbols. The reinforced door to the east blocks your path — its keypad expects a 3-digit code.',
      question: 'The torn paper shows three equations scratched in pen:\n△ + ○ = 7\n○ + □ = 9\n□ + △ = 8\n\nSolve for each symbol, then enter them in order: Triangle, Circle, Square.',
      answer: '345',
      hints: [
        'Add all three equations together: 2(△ + ○ + □) = 24, so △ + ○ + □ = 12.',
        'Since ○ + □ = 9, △ must be 3. Then ○ = 4 and □ = 5. Code: 345.'
      ]
    },
    {
      id: 'lab-1',
      locationId: 'lab',
      narrative: 'The reinforced door clicks open. You step into a vast laboratory. Beakers bubble on hot plates and a luminescent blue liquid drips from a cracked flask overhead. On the central workbench, a dusty tablet displays a chemical puzzle.',
      question: 'The tablet screen reads:\n"H (1) + O (8) + C (6) + K (19) + Fe (26) = LOCK"\n\n"What is the sum of the atomic numbers?"',
      answer: '60',
      hints: [
        'Add up all the numbers in parentheses: 1 + 8 + 6 + 19 + 26.',
        '1 + 8 = 9, then 9 + 6 = 15, then 15 + 19 = 34, then 34 + 26 = 60.'
      ]
    },
    {
      id: 'lab-2',
      locationId: 'lab',
      narrative: 'A microscope on the far counter has a slide inserted. Looking through the eyepiece, you see colored dots in rows. Underneath, a sequence of numbers is scratched into the metal workbench.',
      question: 'The metal bench reads:\n3 — 3 — 5 — 4 — 4 — 3 — 5 — 5 — 4 — ??\n\nA sticky note nearby says: "Count the letters. One, two, three..."',
      answer: '3',
      hints: [
        'Count letters in number words: one(3), two(3), three(5), four(4), five(4), six(3), seven(5), eight(5), nine(4)...',
        '"Ten" has 3 letters. The next number in the sequence is 3.'
      ]
    },
    {
      id: 'lab-3',
      locationId: 'lab',
      narrative: 'A filing cabinet in the corner is locked with a word dial — five rotating rings, each with letters A through Z. A clipboard hanging beside it has a riddle written in hasty handwriting.',
      question: '"I have cities, but no houses.\nI have mountains, but no trees.\nI have rivers, but no water.\nI have borders, but no walls.\n\nWhat am I?"',
      answer: 'map',
      hints: [
        'It shows you where things are, but can be folded and carried.',
        'Think of something flat that represents the world.'
      ]
    },
    {
      id: 'vault-1',
      locationId: 'vault',
      narrative: 'The filing cabinet swings open, revealing blueprints for a vault door and a keycard. You swipe it at the steel door at the end of the lab. With a deep grinding sound, the vault slides open.\n\nInside, servers hum and indicator lights blink. A terminal on the central podium displays a single sequence.',
      question: 'The terminal shows:\n0 — 1 — 1 — 2 — 3 — 5 — 8 — 13 — 21 — ??\n\nA note taped to the monitor reads: "Fibonacci knew the key."\n\nEnter the next number.',
      answer: '34',
      hints: [
        'Each number is the sum of the two before it.',
        '13 + 21 = 34.'
      ]
    },
    {
      id: 'vault-2',
      locationId: 'vault',
      narrative: 'The terminal flashes green. A final message from Dr. Harrison appears:\n\n"You\'ve come far. I\'m impressed. But one lock remains — the exit. I encoded it using clues from the puzzles you just solved. Think carefully."\n\nThe exit keypad glows with four empty digits.',
      question: 'A holographic display shows:\n\nDigit 1 — The MIDDLE digit from the foyer drawer code.\nDigit 2 — The FIRST digit of the laboratory atomic sum.\nDigit 3 — The number of LETTERS in the riddle\'s answer.\nDigit 4 — The LAST digit of the Fibonacci number.\n\nEnter the 4-digit exit code.',
      answer: '8634',
      hints: [
        'Foyer drawer code was 35815 — the middle digit (3rd of 5) is 8.',
        'Atomic sum was 60 — first digit is 6. Riddle answer "map" has 3 letters. Fibonacci was 34 — last digit is 4.'
      ]
    }
  ]
};

export default data;
```

---

PUZZLE_CATALOG_STATE: please see server\data\escape-rooms\prompts\PUZZLE_CATALOG.md

---

## Sound Puzzle Support (`sound` field)

Some puzzles can include a `sound` object that the client renders as a "Play Sound" button below the question. The player clicks to hear the audio, then types their answer. Sound is synthesized client-side via the Web Audio API — no files, no hosting.

### Sound Types

| type | Use case | pitch values | Example clue |
|---|---|---|---|
| `rhythm` | A percussive tapping pattern. All notes use the same pitch. Rests mark gaps. | Any one pitch, e.g. all `"C4"` | "Listen to the knocking pattern on the wall..." |
| `melody` | A tune played across notes. The sequence of note names IS the clue. | `"C4"`–`"C5"` | "The music box plays a familiar lullaby..." |
| `pitch-sequence` | High/medium/low tones. Match the pitch order to a visual poster in the room description. | `"low"`, `"medium"`, `"high"` | "Three tones echo from the depths: low... high... medium..." |

### Sound Note Format

```ts
{ pitch: 'C4', dur: 400, rest: false }   // play C4 for 400ms
{ pitch: 'C4', dur: 300, rest: true }    // 300ms silence
{ pitch: 'low', dur: 500, rest: false }  // play low tone for 500ms
```

Keep total duration under 8 seconds. Keep notes in a comfortable range.
Never map pitch directly to letters (e.g. C=3, D=4) — that's a letter-number puzzle, not a sound puzzle.

### Example sound puzzle

```ts
{
  id: 'lab-sound-1',
  locationId: 'lab',
  narrative: 'A speaker crackles on the workbench. It seems to be broadcasting a looping signal from somewhere deeper in the facility.',
  question: 'A sticky note beneath the speaker reads: "The code is how many beats before the long pause."\n\nThe keypad blinks, expecting a single digit.',
  answer: '4',
  hints: [
    'Count the thumps carefully — tap your foot to the rhythm.',
    'There are four quick thumps, then a longer gap. The answer is 4.'
  ],
  sound: {
    type: 'rhythm',
    notes: [
      { pitch: 'C4', dur: 200, rest: false },
      { pitch: 'C4', dur: 200, rest: false },
      { pitch: 'C4', dur: 200, rest: false },
      { pitch: 'C4', dur: 200, rest: false },
      { pitch: 'C4', dur: 800, rest: true }
    ]
  }
}
```

---

## ASCII Art Support

You may embed ASCII art directly in the `question` field (or `narrative`). The client auto-detects art via heuristics and renders it in monospace. This replaces text-based questions — the visual IS the clue.

### Detection heuristic
The client checks each line. A line is "art" if it contains a `|` (pipe) OR if structural characters (`/\-_.:*#@+~^[]{}()<>`) outnumber letters/digits 2:1. If 2+ lines qualify, the entire block is rendered as monospace `<pre>`. Plain text is unaffected.

### When to use ASCII art
- Maps, floor plans, or room layouts drawn in characters
- Visual ciphers (e.g., a pigpen-like grid, a dot matrix)
- Diagrams showing relationships (arrows, boxes, trees)
- Any clue that benefits from spatial arrangement

### Example ASCII art puzzle

```ts
{
  id: 'foyer-map-1',
  locationId: 'foyer',
  narrative: 'A faded map of the facility is pinned to the bulletin board. Someone has drawn arrows connecting four rooms.',
  question: 'The map shows:\n\n+------+     +------+\n| LAB  |---->|VAULT |\n+------+     +------+\n    |           ^\n    |           |\n    v           |\n+------+     +------+\n|FOYER |---->| EXIT |\n+------+     +------+\n\nThe keypad blinks: "How many rooms have arrows pointing AWAY from them?"',
  answer: '3',
  hints: [
    'Trace each arrow — which rooms have outgoing arrows?',
    'LAB has one outgoing, FOYER has two outgoing — but EXIT has none. Count: LAB, FOYER, and... check VAULT.'
  ]
}
```

---

## Combined Sound + ASCII Art Example

A puzzle can use BOTH `sound` and ASCII art together. The most natural pairing is `pitch-sequence` with a matching visual diagram — the player hears the tones and reads the diagram to decode the answer.

```ts
{
  id: 'tomb-pitch-1',
  locationId: 'chamber',
  narrative: 'Three stone statues line the wall — a kneeling servant, a standing guard, and a pharaoh on a raised dais. Below each statue, a pressure plate is marked with a hieroglyph. A bronze speaker grille, ancient but still humming, is embedded in the wall between them.',
  question: 'The grille emits three tones. A plaque reads:\n\n"Low bows to the earth. High touches the sky. The order of tones grants passage."\n\nThe keypad waits below three symbols:\n\n   (low)     (mid)     (high)\n  +-----+   +-----+   +-----+\n  |  ☥  |   |  ☀  |   |  ⊗  |\n  +-----+   +-----+   +-----+\n    Ankh      Sun     Cross\n\nThe keypad blinks, expecting a single word.',
  answer: 'ankhsuncross',
  hints: [
    'Match the pitch to the statue height. Low = kneeling, medium = standing, high = raised.',
    'The tones play Low, High, Medium. That is Ankh, Cross, Sun — listen closely to the ORDER.'
  ],
  sound: {
    type: 'pitch-sequence',
    notes: [
      { pitch: 'low', dur: 500, rest: false },
      { pitch: 'low', dur: 300, rest: true },
      { pitch: 'high', dur: 500, rest: false },
      { pitch: 'high', dur: 300, rest: true },
      { pitch: 'medium', dur: 500, rest: false }
    ]
  }
}
```
- Answer is `ankhsuncross` — the sequence goes low (Ankh), high (Cross), medium (Sun). The ASCII diagram shows which symbol matches which height.
- Sound conveys the ORDER. Art conveys the MAPPING. Neither works alone.

---

## Guidelines for the new room:
1. Theme: [e.g., "Strange Houses by Uketsu e.g., those with floor plans"]
2. Difficulty: Extreme (5 stars)
3. Total Locations: 4
4. Total Puzzles: 12 puzzles distributed across the locations.

5. Puzzle Selection, Randomization, and Innovation Rules:
   - **YOU ARE ENCOURAGED TO INVENT YOUR OWN PUZZLE MECHANICS FROM SCRATCH.** The categories below are mere inspiration — do not treat them as a cage. The best rooms introduce bespoke ciphers, custom symbol mappings, or novel deduction mechanics that have never appeared in any escape room before. If you can dream up a puzzle concept that fits the narrative and resolves to a clean text input, go for it.
   - Do NOT progress through the puzzle types in the order they are listed below. Avoid predictable patterns (e.g., do not make every location follow a strict sequence archetype). 
   - Dynamically select a random archetype for each puzzle, ensuring adjacent puzzles feel distinct in style and mechanics.
   - Be highly creative and diverse within each category. Do not repeat the exact same puzzle mechanic twice in one escape room.
    - NEVER create multiple choice puzzles. The player must deduce and type a free-text answer — never present a list of options to choose from.
    - Every puzzle must resolve into a clear, single text or numeric input string that the player can type into an input box based purely on text deduction.
   - When borrowing from existing archetypes, mix and match from this pool:
     * Ciphers & Cryptography: Do not rely solely on simple Caesar shifts. Innovate completely custom thematic symbol/substitution keys hidden in the environment text.
     * Wordplay & Linguistics: Anagrams of thematic terms, hidden acrostics, word-ladders, word associations, or cryptic crosswords.
     * Observation & Text-Searching: Spotting subtle text patterns, intentional misspellings, strategic capitalizations, or hidden words within a narrative segment.
     * Math & Science: Capped tightly at a maximum of 20-40% of total puzzles. Keep them thematic to the room's setting.

6. Meta-Puzzle Requirement: The final puzzle in the last location MUST logically combine clues or exact answers from earlier puzzles. Ensure the logic checks out perfectly.
7. Formatting: Export exclusively as a complete TypeScript file (with `import type { EscapeRoomData } from '../../../src/types/shared.js'` and `export default data;`) inside a standard ```ts code block. Do not write any explanatory text, introduction, or post-code commentary.
8. Logic Verification Step: Before outputting the final TypeScript file, double-check the exact values used in the final meta-puzzle. Ensure all word configurations and math strings match the earlier puzzle answers exactly.
9. Narrative Style: Keep the narrative descriptions atmospheric, immersive, and natural.
   - **BREAK THE INTRO FORMULA.** The most common failure in escape room design is a rigid, beat-for-beat intro structure: (a) physical entrance action, (b) sensory environment description, (c) a terminal/monitor that "crackles to life" displaying an ALL CAPS dramatic message from a named scientist, (d) the terminal dies, (e) "you are trapped / the only way out is forward." This template has been used in too many rooms — avoid it completely.
   - Instead, vary the framing device aggressively. Sample alternatives: start in-medias-res mid-fall or mid-chase; open with a countdown timer already running; use audio logs, radio transmissions, or fragmented journal pages found on a corpse; begin with the player already disoriented — waking up inside with no memory of entry; use environmental clues (graffiti, claw marks, a ticking Geiger counter) to imply the backstory rather than having a terminal spoon-feed it. A room's intro should feel like the opening of its own short story, not a fill-in-the-blanks template.
   - Two active rooms should never share the same narrative structure or framing device. Every intro must stand alone as a distinct opening sequence.
10. Cryptic Clue & Anti-Handholding Guardrails:
     - Cryptic and thematic flavor text is highly encouraged (e.g., "the alphabet knows my pain" or "the language of the gods is shifted by three" are EXCELLENT clues that fit the mood). Keep these in the narrative.
     - However, you must STRICTLY FORBID blunt, mechanical "how-to" explanations or explicit conversion instructions anywhere in the narrative or question fields. 
     - Never include tutorial-like hand-holding phrases such as: "A=1, B=2, and so on", "Apply a shift of 3", or "Convert the numbers back to letters to find the word".
     - **NEVER phrase questions as objective, instructional commands.** The `question` field must read as part of the story world, not as a puzzle-master's directive. Bad: "Convert each type icon to its grid position, then concatenate them in the order shown." Good: "The keypad blinks, awaiting four digits." Bad: "What four-letter word did the Ghost-type Pokémon type?" Good: "That four-letter word is the password to the encrypted directory." Bad: "Identify the three trainers. Alphabetically by name, count the letters..." Good: "Fuji's note reads: 'Let their names decide the order. Let their arts decide the numbers.'" The question should feel like an in-world prompt — a terminal demanding input, a note from a character, a keypad awaiting a code — never a disembodied voice telling the player what steps to perform.
     - Keep the problem fields raw and mysterious (e.g., just show the ciphertext or the raw numbers). Trust the player to connect the flavor text clue to the data string on their own. Explicit step-by-step explanations are ONLY allowed inside the `hints` array.

11. Catalog Inversion, Innovation & Dynamic Variety Intelligence:
    - Analyze the `PUZZLE_CATALOG_STATE` section provided above, looking closely at the "Frequency" tracker.
    - Meta-puzzles are always required as the final step. For all other puzzle slots, your primary objective is to invent and deploy COMPLETELY NEW puzzle types that do not appear anywhere in the catalog yet.
    - Challenge yourself to engineer unique textual mechanics (e.g., telephone keypad mappings, music notation translation, dictionary-guide word boundaries, flag semaphore descriptions, logic grids based on time zones, etc.) that still resolve into a clean, typable text string.
    - If you must utilize puzzle types that are already present in the catalog to fill out the required puzzle count, treat the "Frequency" list as an inverted priority queue:
      * Tier 1 (Highest Priority): Archetypes with a count of 0 or 1.
      * Tier 2 (Medium Priority): Archetypes with a count of 2 or 3.
      * Tier 3 (Strict Last Resort): Saturated archetypes with a count of 4 or higher (e.g., standard riddles, ciphers, or systems-of-equations). Use these only if a highly specific narrative bottleneck demands it.
    - Even when pulling from Tier 2 or Tier 3, you must apply a distinct thematic twist or combine it with another mechanic so it never feels like a direct copy of a puzzle already in the catalog.

12. Sound & ASCII Art Design Rules:
    - **Sound puzzles are NEVER gimmicks.** Only include a `sound` field when the audio itself conveys information that text alone cannot. Good: a rhythm pattern the player must count, a pitch sequence that maps to a visual poster described in the narrative, a melody the player recognizes. Bad: "Listen to this beep. The answer is BEEP." If the puzzle can be solved by reading the question field alone, remove the sound.
    - Each sound type fills a specific role:
      * `rhythm` — counting gaps, recognizing a knock pattern, Morse-like timing. All notes share one pitch.
      * `melody` — the sequence of notes IS the clue (e.g., a recognizable tune, a note-name cipher). Use `"C4"` through `"C5"`.
      * `pitch-sequence` — the pattern of low/medium/high tones corresponds to a visual reference described in the room (e.g., "three statues of different heights"). Always describe the visual reference in the `narrative` or the room's `description` so the player has the decoder.
    - Keep total note duration under 8 seconds. Rests (`rest: true`) still have a `dur` field. Every note must have both `dur` and `rest`.
    - Never map pitch to alphabet position directly (e.g., C=3, D=4). That's a letter-number cipher, not a sound puzzle.
    - **ASCII art must be the clue, not decoration.** If you can delete the art and the puzzle is still solvable, it shouldn't be art. The spatial arrangement, shape, or visual relationship must be essential to solving.
    - ASCII art lives in `question`. The narrative gives the in-world context for what the player is looking at (a map, a diagram, a carved tablet, graffiti on a wall).
    - Keep art compact — max 12 lines, max 40 characters wide. The client renders in a scrollable code block if needed. Use pipe-drawing characters (`|`, `-`, `+`), arrows (`<`, `>`, `^`, `v`), and boxes to convey structure.