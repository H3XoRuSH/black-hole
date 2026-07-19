# Escape Room Puzzle Catalog

## Abandoned Lab (8)
foyer-1: number code — reverse birthday digits 5/18/53 → 35815
foyer-2: logic puzzle — find person with most stars, combine name length + star count
foyer-3: system-of-equations — solve △+○=7, ○+□=9, □+△=8 for 3-digit code
lab-1: number sum — add atomic numbers of H, O, C, K, Fe
lab-2: letter-count sequence — count letters in number words (one=3, two=3, three=5…)
lab-3: riddle — "cities but no houses, mountains but no trees" = map
vault-1: number sequence — Fibonacci (0,1,1,2,3,5,8,13,21,?)
vault-2: meta-puzzle — pick digits from foyer-1, lab-1, lab-3, vault-1 answers

## Pharaoh's Tomb (12)
entrance-1: caesar cipher — shift WRPE back by 3 letters
entrance-2: acrostic — first letter of 5 sentences → HORUS
entrance-3: number sum — convert Egyptian symbols to numbers, add 3 cartouches
ante-1: logic grid — order 4 colored jars by clues (left/right relations)
ante-2: anagram — rearrange AHOPHAR → PHARAOH
ante-3: system-of-equations — grain piles: A+B=15, B+C=20, A+C=13 → B=11
pillar-1: logic grid — order 4 gods by positional clues
pillar-2: pattern recognition — halving sequence 128→64→32→16→?
pillar-3: riddle — "ibis-headed scribe of the gods" = Thoth
vault-1: riddle — "throne hieroglyph, wife of Osiris" = Isis
vault-2: number sequence — gaps increase by 1 each step (0,1,2,3,4,5→+6)
vault-3: meta-puzzle — pick digits from entrance-3, vault-1, pillar-2, vault-2

## Room 69420 (12)
threshold-1: steganography — oversized capitals in "tHe End of Lost Play" → HELP
threshold-2: anagram — letter blocks M,T,O,B → TOMB
threshold-3: letter-number mapping — A1Z26: 3=C, 18=R, 25=Y → CRY
threshold-4: roman numerals — MCMLXXIII(1973) to MCMLXXXVI(1986) = age 13
bedroom-1: vigenère cipher — NAVLKPUM decodes with key HAUNT via grid → GABYRIUS
bedroom-2: hidden word — adjacent capitals in "thiS INnocent" → SIN
bedroom-3: acrostic — first letter of each line in a poem → DEATH
bedroom-4: periodic table — "O is the breath I lost" = oxygen, atomic number 8
bedroom-5: atbash cipher — swap each letter with its opposite (A↔Z, B↔Y…) → KIZB = PRAY
heart-1: crossword clue — double definition: "tree" and "fire remains" = ASH
heart-2: word chain — one letter changes per step: MUST→MUSK→DUSK→DUST
heart-3: meta-puzzle — pick letters from bedroom-1, heart-1, threshold-2, heart-2, bedroom-3

## Magician's Alibi (15)
cell-17-1: word fragments — concatenate 4 crossword-style clues: V + AN + I + SH = VANISH
cell-17-2: vigenère cipher — EQCRGJ decodes with repeating key SILAS → MIRROR
cell-17-3: word ladder — fill the gap in CAGE→?→CAST→LAST→LOST (one letter change each step)
evidence-office-1: symbol mapping — symbols #%&*+=? map to first letter of item names → JUSTICE
evidence-office-2: system-of-equations — mask+mask+feather=17, feather+ring=11, mask+ring+ring=13 → solve (mask×ring)+feather
evidence-office-3: compound word fill-in — same word fits EYE___, STAR___, ___STAND = WITNESS
clockwork-workshop-1: logic grid — assign 4 colors + 4 objects to 4 drawers via clues
clockwork-workshop-2: hidden word — each misspelled word has 1 extra letter, collect extras → ALIBI
clockwork-workshop-3: rail fence zigzag — arrange LNRTAEN on 3 channels, read row-by-row → LANTERN
chapel-1: riddle — "borrows outline but no guilt, stretches at dusk" = shadow
chapel-2: number sequence — consecutive products 1×2, 2×3, 3×4; 5×6=30 → next 6×7=42
chapel-3: word manipulation — GRAVE - R + L = GAVEL
understage-1: morse code — decode ./.../-.-./.-/.--./. → ESCAPE
understage-2: magic square — 4×4 grid missing one number (each row/col/diag=34)
understage-3: meta-puzzle — pick letters from cell-17-1, cell-17-2, chapel-3, understage-2, evidence-office-1, understage-1

## Frequency
meta-puzzle: 4 | riddle: 4 | cipher (caesar/atbash/vigenère/rail): 5 | system-of-equations: 3 | logic-grid: 3 | number-sequence: 3 | acrostic: 2 | anagram: 2 | hidden-word: 2 | number-sum: 2 | word-manipulation: 2 | compound-word: 1 | crossword-fragment: 1 | double-definition: 1 | letter-count: 1 | letter-number: 1 | logic-puzzle: 1 | magic-square: 1 | morse-code: 1 | number-code: 1 | pattern-recognition: 1 | periodic-table: 1 | roman-numerals: 1 | steganography: 1 | symbol-mapping: 1 | word-chain: 1 | word-ladder: 1

## When generating new rooms
Meta-puzzles are always required as the final puzzle. For the rest, prefer types with count ≤ 1. Avoid repeating ciphers, riddles, system-of-equations, logic-grids, number-sequences, acrostics, anagrams, and hidden-word.
