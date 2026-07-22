# Escape Room Puzzle Catalog

Tally of every puzzle across all 10 rooms. Use for generation: prioritize low-frequency or novel types; avoid saturated categories.

---

## Category Frequency Index

| Freq | Categories |
|------|-----------|
| **4** | system-of-equations, acrostic, logic-grid |
| **3** | number-sequence, classic-riddle, atbash, grid-coordinate |
| **2** | sound-pitch-sequence, word-ladder, vigenere, anagram, roman-numerals, simple-addition, domain-trivia, sound-rhythm |
| **1** | sound-melody, word-chain, binary-decimal, t9-keypad, graduated-sequence, morse, magic-square, text-error-detection, zigzag-reading, symbol-first-letter, spelling-concatenation, letter-overlap, nesting-diagram, rotating-shutter, floor-plan, boundary-capitals, mirror-reading, letter-frequency, shape-number, date-reversal, atomic-number, type-grid, area-calculation, modular-arithmetic, prime-factorization, shortest-path, median+gaps, combinatorics, gear-recurrence, inclusion-exclusion, modular-exponentiation, periodic-alignment, pigpen-cipher, letter-arithmetic, scytale, nonogram, latin-square, grille-cipher, dilution-math |
| **10** | meta (1 per room, mandatory) |

---

## Per-Room Breakdown

### The Abandoned Lab (easy · 8 puzzles)
1. date-reversal (birthday backwards) → 35815
2. letter-count+star-count → 35
3. system-of-equations (△○□) → 345
4. atomic-number-sum → 60
5. number-sequence (letter-count per digit) → 3
6. classic-riddle (cell) → cell
7. number-sequence (fibonacci) → 34
8. META digit-extraction → 8644

### The Cinnabar Lab (medium · 10 puzzles)
1. binary→decimal (awake=1) → 150
2. type-grid-lookup (pokemon chart) → 2697
3. t9-keypad → CALL
4. graduated-sequence (×2+1) → 159
5. duration→letter (1=A) → PSYCHIC
6. logic+type-numbers → 845
7. riddle-series (pokemon→letter pos) → RELEASE
8. META char-extraction → 17A9S8E

### The Cockroach Nest (very-easy · 8 puzzles)
1. simple-addition → 14
2. letter-frequency (E count) → 6
3. number-sequence (evens) → 10
4. simple-multiplication → 30
5. step-calculation (double+add) → 54
6. domain-trivia (insect legs) → 6
7. shape→number (∞=8,Δ=3,L=7) → 18
8. META digit-extraction → 4648

### The House That Draws Itself (hard · 12 puzzles)
1. sound-pitch-sequence + spelling → bellkeylamp
2. letter-overlap (shared threshold) → seams
3. floor-plan-reading → bell
4. word-chain (2-letter overlap) → yellow
5. acrostic (J+O+Y) → joy
6. pattern-deduction (refused items) → ghost
7. grid-coordinate-lookup (survey nails) → wing
8. sound-rhythm (knock count) → 213
9. nesting-diagram (room brackets) → cellar
10. rotating-shutter (4×4 overlay) → thehousewantsyou
11. logic-truth (2 of 4 true) → dust
12. META letter-position → beyond

### The Magician's Alibi (hard · 12 puzzles)
1. fragment-compilation (V+AN+I+SH) → vanish
2. vigenere (key: SILAS) → mirror
3. word-ladder (CAGE→CASE→CAST) → case
4. symbol→first-letter (ledger) → justice
5. spelling-error (WINTESS→WITNESS) → witness
6. logic-grid (4 colors × 4 objects) → green
7. extra-letter-detection (A,L,I,B,I) → alibi
8. zigzag-channel-reading (3 strips) → lantern
9. letter-deletion+insertion (GRAVE→GAVEL) → gavel
10. morse-code → escape
11. magic-square (4×4, const 34) → 5
12. META letter-extraction → magic

### The Pharaoh's Rest (easy · 12 puzzles)
1. atbash (-3 shift) → TOMB
2. egyptian-numeral-sum → 1453
3. acrostic (H+O+R+U+S) → HORUS
4. color-position-deduction → 3
5. anagram (AHOPHAR→PHARAOH) → PHARAOH
6. system-of-equations → 11
7. logic-grid (4 gods, 4 rules) → OSIRIS
8. domain-trivia (ibis scribe) → THOTH
9. halving-pattern (128→64→32→16→8) → 8
10. domain-trivia (goddess of magic) → ISIS
11. difference-sequence (+0,+1,+2,+3,+4,+5) → 22
12. META digit-extraction → 1482

### Room 69420 (medium · 12 puzzles)
1. hidden-capitals (tHe End...) → HELP
2. anagram (MTOB→TOMB) → TOMB
3. number→letter (3=C,18=R,25=Y) → CRY
4. roman-numerals (1973→1986) → 13
5. atbash (KIZB→PRAY) → PRAY
6. vigenere (key: HAUNT) → GABYRIUS
7. acrostic (D+E+A+T+H) → DEATH
8. atomic-number (O=8) → 8
9. boundary-capitals (SIN) → SIN
10. wordplay (tree+remains) → ASH
11. word-ladder (MUST→MUSK→DUSK→DUST) → DUST
12. META letter-position → GHOST

### The Bloodline (very-easy · 8 puzzles)
1. mirror-reading (ETAG→GATE) → gate
2. classic-riddle (what outlasts blood) → dust
3. sound-melody (D-E-A-D) → dead
4. grid-coordinate (21=F,12=A,23=N,34=G) → fang
5. acrostic+roman-sort (elders) → crypt
6. roman→digit (III,I,IV,II) → 3142
7. acrostic (B+L+O+O+D) → blood
8. META answer-lengths (4,5,1,4) → 4514

### The Meridian Engine (extreme · 13 puzzles)
1. area-calculation (rectangle minus pieces) → 54
2. modular-arithmetic (remainder counting) → 6
3. prime-factorization+divisor-count → 274
4. periodic-alignment (cycles 7,9,11) → 74
5. shortest-path (6-node graph) → 12
6. median+sum-of-gaps → 33
7. system-of-equations (4 vars) → 26
8. combinatorics (5 even × 7 odd) → 35
9. sum-of-tokens → 106
10. gear-recurrence (→2N+2, 5 rings) → 94
11. inclusion-exclusion (÷2/3/5, 1..360) → 99
12. modular-exponentiation (base 7 mod 1000) → 649
13. META last-digit-of-band-sums → 862

### The Blackwood Masquerade (extreme · 12 puzzles)
1. grid-coordinate (Charred Diary - MURDER cipher) → cellar
2. pigpen-cipher (Clock Face) → gallows
3. letter-arithmetic (Desk Ledger - cryptarithm) → 1451
4. atbash (Will and Testament - mirror script) → yevrah
5. scytale (Scytale Parchment) → diginthesoil
6. sound-rhythm (Dripping Basin - drops) → 324
7. nonogram (Pedestal Grid) → h
8. latin-square (Plant Layout) → oltr
9. grille-cipher (Winery Ledger - paper grille) → suspectisbutler
10. logic-grid (Suspect Lockers) → lbdcm
11. dilution-math (Poison Dilution) → 60
12. META dossiers-concatenation → butlerpoisoncellar1835

---

## Summary Stats

| Room | Difficulty | Puzzles | Sound | Locations |
|------|-----------|---------|-------|-----------|
| Abandoned Lab | easy | 8 | 0 | 3 |
| Cinnabar Lab | medium | 10 | 0 | 2 |
| Cockroach Nest | very-easy | 8 | 0 | 3 |
| House That Draws Itself | hard | 12 | 2 | 4 |
| Magician's Alibi | hard | 12 | 0 | 5 |
| Pharaoh's Rest | easy | 12 | 0 | 4 |
| Room 69420 | medium | 12 | 0 | 3 |
| The Bloodline | very-easy | 8 | 1 | 3 |
| Meridian Engine | extreme | 13 | 0 | 3 |
| The Blackwood Masquerade | extreme | 12 | 1 | 3 |
| **Total** | | **107** | **4** | **33** |

---

## Sound Puzzles (4 total)
- **House That Draws Itself**: pitch-sequence (high→medium→low→bellkeylamp), rhythm (2-1-3 knocks → 213)
- **The Bloodline**: melody (D4-E4-A4-D4 → dead)
- **The Blackwood Masquerade**: rhythm (3-2-4 quick drops → 324)

---

## Unused Categories (0 occurrences)

semaphore, flag codes, polybius square, barcode, clock-hand angles, calendar weekday math, book cipher, crossword, word search, sudoku, steganography, hex/base conversion, hashing, railroad ciphers, route ciphers, playfair, periodic-table-word-building, etymology, portmanteau, haiku construction, poetry meter, anagram chains, word squares, tautonyms, mathematical sequences (look-and-say, collatz, catalan), fractals, graph coloring, set theory puzzles, probability, bayes theorem.
