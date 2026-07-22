You are an expert game designer. Generate a new, structurally sound text-based escape room TypeScript file adhering strictly to the following node-tree architecture.

---

## Escape Room Architecture

The escape room uses a **node-tree format**. Each location contains a tree of interactive objects (nodes). Players navigate by drilling into nodes one level at a time — each screen shows the current node's children as cards. A breadcrumb trail allows navigation back up.

**Reference template**: `abandoned-lab.ts` — the production-quality implementation.  
**Difficulty matching**: use the existing room with the same target difficulty as your structural reference:
  - `very-easy` → `cockroach-nest.ts` or `the-bloodline.ts`
  - `easy` → `abandoned-lab.ts` or `pharaohs-tomb.ts`
  - `medium` → `cinnabar-lab.ts` or `room-69420.ts`
  - `hard` → `house-that-draws-itself.ts` or `magician-alibi.ts`
  - `extreme` → `the-meridian-engine.ts`

## Interfaces

```ts
export type EscapeRoomNodeType = 'dialogue' | 'puzzle' | 'item' | 'locked';

export interface EscapeRoomNode {
  id: string;                              // descriptive: {location}-{object}
  locationId: string;                      // which location this node belongs to
  parentId: string | null;                 // null = root-level card for this location
  type: EscapeRoomNodeType;
  label: string;                           // short name shown on the card
  narrative: string;                       // text shown when opened (unlocked narrative for locked nodes)

  // puzzle nodes
  question?: string;
  answer?: string;
  hints?: string[];                        // 3 hints, progressively narrowing to answer
  sound?: SoundPuzzle;
  isMeta?: boolean;                        // exactly ONE per room; ⭐ styling; child of last puzzle

  // item nodes — ALWAYS a separate child node, never rewardItem on puzzle nodes
  rewardItem?: string;                     // item ID added to player's inventory on pickup

  // locked nodes
  lockedByItem?: string;                   // item ID required to unlock
  lockedNarrative?: string;                // narrative shown while node is locked
  // narrative field above = shown after unlocking

  children?: string[];                     // child node IDs; hidden until parent solved/unlocked
}

export interface EscapeRoomLocation {
  id: string;
  name: string;
  description: string;                     // shown at the location root
}

export interface EscapeRoomData {
  id: string;
  name: string;
  description: string;
  difficulty: 'very-easy' | 'easy' | 'medium' | 'hard' | 'extreme';
  intro: string;
  locations: EscapeRoomLocation[];
  nodes: EscapeRoomNode[];                 // NOT puzzles[] — this is a node tree
}
```

---

## Core Design Rules

### Distinct Root Objects (NOT one giant chain)
Each location has **multiple** `parentId: null` nodes representing real objects in the room (a desk, lockers, a door, a workbench, a filing cabinet). Root-level cards are always visible. Locked nodes are visible but blocked until the player finds the right item. This makes the room feel explorable, not railroaded.

### Sequential Sub-trees
Inside each root object, puzzles chain as parent→child. Children appear only when the parent is solved (puzzle) or unlocked (locked). Dialogue children appear immediately.

### Knowledge-Gated Puzzles
Puzzles at root are visible from the start but **unsolvable without a clue hidden elsewhere**. The first hint guides the player to the clue's location. The third hint gives the answer.

### Scattered Hints
Embed clues in dialogue nodes that appear **earlier** in the flow than the puzzle that needs them. Be creative — notebooks, reference charts, torn papers, terminal printouts, observation notes.

### Items as Child Nodes
Never put `rewardItem` on a puzzle node. Always create a separate `item` child that the player must navigate into and pick up.

### Locked Nodes are Navigable
Players can click locked nodes to read the `lockedNarrative`. Children hidden until unlocked. Unlock button appears when the player has the required item.

### Location Transitions
The child of the final door/puzzle should have the **destination location's ID** so navigating into it discovers the new location tab.

### Meta Puzzle
Child of the last story puzzle. `isMeta: true`. Exactly one per room. References clues/answers from across the entire room.

---

> **Schema reference**: See `abandoned-lab.ts` for a complete production example.

PUZZLE_CATALOG_STATE: See `PUZZLE_CATALOG.md` in this directory — contains category frequency index and per-room puzzle breakdown.

---

## Sound Puzzle Support (`sound` field)

Some puzzles can include a `sound` object that the client renders as a "Play Sound" button below the question. The player clicks to hear the audio, then types their answer. Sound is synthesized client-side via the Web Audio API — no files, no hosting.

```ts
export interface SoundNote {
  pitch?: 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A4' | 'B4' | 'C5' | 'low' | 'medium' | 'high';
  dur: number;   // milliseconds
  rest: boolean; // true = silence/gap, false = play the note
}

export interface SoundPuzzle {
  type: 'rhythm' | 'melody' | 'pitch-sequence';
  notes: SoundNote[];
}
```

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
  parentId: 'lab-research-station',
  type: 'puzzle',
  label: 'Rhythm Lock',
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
  parentId: null,
  type: 'puzzle',
  label: 'Floor Plan Map',
  narrative: 'A faded map of the facility is pinned to the bulletin board. Someone has drawn arrows connecting four rooms.',
  question: 'The map shows:\n\n+------+     +------+\n| LAB  |---->|VAULT |\n+------+     +------+\n    |           ^\n    |           |\n    v           |\n+------+     +------+\n|FOYER |---->| EXIT |\n+------+     +------+\n\nThe keypad blinks: "How many rooms have arrows pointing AWAY from them?"',
  answer: '3',
  hints: [
    'Trace each arrow — which rooms have outgoing arrows?',
    'LAB has one outgoing, FOYER has two — but EXIT has none. Count: LAB, FOYER, and... check VAULT.'
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
  parentId: 'chamber-altar',
  type: 'puzzle',
  label: 'Pitch Puzzle',
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

---

## Guidelines for the new room:
1. Theme: [e.g., "Strange Houses by Uketsu e.g., those with floor plans"]
2. Difficulty: Extreme (5 stars)
3. Total Locations: 4
4. Total Puzzles: 12 puzzles distributed across the locations.
5. Total Node Count: approximately 20–30 nodes (not every node is a puzzle — include dialogue nodes for atmosphere, item nodes for pickups, locked nodes for gating, and transition nodes for location changes).

6. Node-Tree Design Rules:
   - **Distinct root objects**: each location must have multiple `parentId: null` nodes (not one giant chain). Every distinct object in the room gets its own root card.
   - **Gating via items**: locked nodes at root are visible but blocked until the player finds the right item.
   - **Gating via knowledge**: puzzles at root are visible and try-able, but unsolvable without a clue hidden elsewhere. First hint guides to the clue.
   - **Sequential sub-trees**: inside each root object, puzzles chain as parent→child, revealing the next step when solved.
   - **Scattered hints**: embed clues in dialogue nodes that appear EARLIER than the puzzle that needs them. Be creative.
   - **Items as child nodes**: never `rewardItem` on puzzle nodes. Always a separate `item` child.
   - **Locked nodes navigable**: players can click in to read `lockedNarrative` before unlocking.
   - **Transition nodes**: the child of a location-door should have the destination location's ID.
   - **Meta as final child**: the meta puzzle is a child of the room's last story puzzle, `isMeta: true`.
   - **Three hints per puzzle**, progressively narrowing to answer. First hint guides to the clue, third gives the answer.

7. Puzzle Selection, Randomization, and Innovation Rules:
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

8. Meta-Puzzle Requirement: The final puzzle in the last location MUST logically combine clues or exact answers from earlier puzzles. Ensure the logic checks out perfectly.
9. Formatting: Export exclusively as a complete TypeScript file (with `import type { EscapeRoomData } from '../../../src/types/shared.js'` and `export default data;`) inside a standard ```ts code block. Do not write any explanatory text, introduction, or post-code commentary.
10. Logic Verification Step: Before outputting the final TypeScript file, double-check the exact values used in the final meta-puzzle. Ensure all word configurations and math strings match the earlier puzzle answers exactly.

11. Narrative Style: Keep the narrative descriptions atmospheric, immersive, and natural.
   - **BREAK THE INTRO FORMULA.** The most common failure in escape room design is a rigid, beat-for-beat intro structure: (a) physical entrance action, (b) sensory environment description, (c) a terminal/monitor that "crackles to life" displaying an ALL CAPS dramatic message from a named scientist, (d) the terminal dies, (e) "you are trapped / the only way out is forward." This template has been used in too many rooms — avoid it completely.
   - Instead, vary the framing device aggressively. Sample alternatives: start in-medias-res mid-fall or mid-chase; open with a countdown timer already running; use audio logs, radio transmissions, or fragmented journal pages found on a corpse; begin with the player already disoriented — waking up inside with no memory of entry; use environmental clues (graffiti, claw marks, a ticking Geiger counter) to imply the backstory rather than having a terminal spoon-feed it. A room's intro should feel like the opening of its own short story, not a fill-in-the-blanks template.
   - Two active rooms should never share the same narrative structure or framing device. Every intro must stand alone as a distinct opening sequence.

12. Cryptic Clue & Anti-Handholding Guardrails:
    - Cryptic and thematic flavor text is highly encouraged (e.g., "the alphabet knows my pain" or "the language of the gods is shifted by three" are EXCELLENT clues that fit the mood). Keep these in the narrative.
    - However, you must STRICTLY FORBID blunt, mechanical "how-to" explanations or explicit conversion instructions anywhere in the narrative or question fields.
    - Never include tutorial-like hand-holding phrases such as: "A=1, B=2, and so on", "Apply a shift of 3", or "Convert the numbers back to letters to find the word".
    - **NEVER phrase questions as objective, instructional commands.** The `question` field must read as part of the story world, not as a puzzle-master's directive. Bad: "Convert each type icon to its grid position, then concatenate them in the order shown." Good: "The keypad blinks, awaiting four digits." The question should feel like an in-world prompt — a terminal demanding input, a note from a character, a keypad awaiting a code — never a disembodied voice telling the player what steps to perform.
    - Keep the problem fields raw and mysterious (e.g., just show the ciphertext or the raw numbers). Trust the player to connect the flavor text clue to the data string on their own. Explicit step-by-step explanations are ONLY allowed inside the `hints` array.

13. Catalog Inversion, Innovation & Dynamic Variety Intelligence:
    - Analyze the `PUZZLE_CATALOG_STATE` section provided above, looking closely at the "Frequency" tracker.
    - Meta-puzzles are always required as the final step. For all other puzzle slots, your primary objective is to invent and deploy COMPLETELY NEW puzzle types that do not appear anywhere in the catalog yet.
    - Challenge yourself to engineer unique textual mechanics (e.g., telephone keypad mappings, music notation translation, dictionary-guide word boundaries, flag semaphore descriptions, logic grids based on time zones, etc.) that still resolve into a clean, typable text string.
    - If you must utilize puzzle types that are already present in the catalog to fill out the required puzzle count, treat the "Frequency" list as an inverted priority queue:
      * Tier 1 (Highest Priority): Archetypes with a count of 0 or 1.
      * Tier 2 (Medium Priority): Archetypes with a count of 2 or 3.
      * Tier 3 (Strict Last Resort): Saturated archetypes with a count of 4 or higher (e.g., standard riddles, ciphers, or systems-of-equations). Use these only if a highly specific narrative bottleneck demands it.
    - Even when pulling from Tier 2 or Tier 3, you must apply a distinct thematic twist or combine it with another mechanic so it never feels like a direct copy of a puzzle already in the catalog.

14. Sound & ASCII Art Design Rules:
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
