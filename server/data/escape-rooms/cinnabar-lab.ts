import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'cinnabar-lab',
  name: 'The Cinnabar Lab',
  description: 'Beneath the volcanic island of Cinnabar, a shrouded laboratory still hums with residual power. Someone tried to play creator here — and lost. Decrypt the geneticist\'s legacy and escape before the geothermal failsafes entomb you forever.',
  difficulty: 'medium',
  intro: 'The floor gave way six seconds ago.\n\nYou hit the grating shoulder-first, breath punched clean out of you. Above, through the hole you just made in the ceiling, volcanic rock glows a dull orange through twisted rebar. Below: a sprawling underground laboratory lit only by emergency strobes — every surface coated in fine grey ash that tastes of copper and scorched wiring.\n\nA synthetic voice gargles through a half-drowned speaker:\n\n"GEOTHERMAL PURGE ACTIVE. FIFTY-THREE MINUTES TO FACILITY SEAL."\n\nThe central chamber is dominated by a shattered stasis tube three times your height. Its armored glass is blown outward — not inward. Claw marks run the length of the floor like God dragged His fingernails through the concrete. You\'re not the first thing to fall through that ceiling.\n\nTo the south, a research wing hums with residual power, workstations still online. To the north, a vault door pulses red — and behind it, the master override console.\n\nFifty-three minutes. Move.',
  locations: [
    {
      id: 'research-wing',
      name: 'The Research Wing',
      description: 'A cavernous room lined with steel workbenches and humming machinery. Shattered stasis tubes drip pale blue fluid onto the tile floor. A massive type-effectiveness chart dominates the far wall, its colors faded but legible. A Poké Ball assembly rack stands against the eastern pillar — eight spheres sit in precise formation, their status lights pulsing in a steady rhythm. To the north, a formidable blast door bears the faded crimson "R" of Team Rocket, its keypad awaiting a numeric sequence.'
    },
    {
      id: 'containment-vault',
      name: 'The Containment Vault',
      description: 'The blast door parts with a tortured screech. You step into near-darkness — only a single crimson emergency beacon strobes overhead, painting the room in waves of blood-red light. A shattered central tank, easily fifteen feet tall, dominates the space. Whatever gestated here escaped violently. Along the walls, filing cabinets have been thrown aside like toys. At the rear of the chamber, a master terminal pulses with a faint green glow — the override console. Scattered around it lie Dr. Fuji\'s final research journals, their pages singed and water-damaged.'
    }
  ],
  puzzles: [
    {
      id: 'research-1',
      locationId: 'research-wing',
      narrative: 'You approach the Poké Ball rack bolted to the eastern pillar. Eight spheres rest in individual cradles numbered 1 through 8, left to right. Each sphere is either sealed tight with its indicator light dark, or split open with its light blazing. A brass plaque beneath the rack reads:\n\n"STORED ENERGY STATES — DORMANT SHELLS COUNT FOR NOTHING. ACTIVE BURSTS ARE EVERYTHING."\n\nA technician\'s notepad lies open beside the rack:\n\nBALL 1 — AWAKENED. BALL 2 — SLUMBERING. BALL 3 — SLUMBERING. BALL 4 — AWAKENED. BALL 5 — SLUMBERING. BALL 6 — AWAKENED. BALL 7 — AWAKENED. BALL 8 — SLUMBERING.',
      question: 'The north door\'s keypad has a sticker: "CONVERT THE EIGHT-ENERGY PATTERN TO DECIMAL."\n\nThe keypad blinks, waiting.',
      answer: '150',
      hints: [
        'Eight spheres, two possible states each — dormant or awakened. There\'s a classic counting system built on exactly two states.',
        'The plaque says dormant shells count for nothing, active bursts for everything. Think in two states — on and off, one and zero.',
        '1 0 0 1 0 1 1 0 in binary is 128 + 16 + 4 + 2 = 150.'
      ]
    },
    {
      id: 'research-2',
      locationId: 'research-wing',
      narrative: 'The giant type-effectiveness chart on the western wall catches your eye. It displays all eighteen known Pokémon types arranged in a strict grid — six columns, three rows — numbered sequentially from 1 to 18, reading left to right, top to bottom:\n\nROW 1: Normal(1) — Fire(2) — Water(3) — Electric(4) — Grass(5) — Ice(6)\nROW 2: Fighting(7) — Poison(8) — Ground(9) — Flying(10) — Psychic(11) — Bug(12)\nROW 3: Rock(13) — Ghost(14) — Dragon(15) — Dark(16) — Steel(17) — Fairy(18)\n\nA nearby security terminal displays an access log. Four type icons flash on the screen in sequence: a flame, a snowflake, a fissure, and a clenched fist.',
      question: 'The terminal demands a four-part passcode: "SPEAK THE GRID NUMBERS OF THE FOUR THAT OPENED THE GATE."\n\nThe cursor pulses. Four digits.',
      answer: '2697',
      hints: [
        'The security terminal flashed four type icons — flame, snowflake, fissure, fist. The type chart on the wall assigns every type a numbered grid coordinate.',
        'Match a flame to Fire, a snowflake to Ice, a fissure to Ground, and a fist to Fighting on the numbered grid.',
        'Fire = 2, Ice = 6, Ground = 9, Fighting = 7. Concatenated in order: 2697.'
      ]
    },
    {
      id: 'research-3',
      locationId: 'research-wing',
      narrative: 'A dusty laboratory PC squats in the corner of the research wing, its monitor cracked but still glowing a queasy green. The screen shows an archaic numeric keypad — the kind where each digit cycles through three or four letters, like the mobile phones buried in museums. A sticky note clings to the bezel, written in jagged, gleeful strokes:\n\n"ROTOM WAS HERE. >:)"\n\nBelow the note, the terminal logs four deliberate keypresses:\n\nKEY 2 — STRUCK THRICE\nKEY 2 — STRUCK ONCE\nKEY 5 — STRUCK THRICE\nKEY 5 — STRUCK THRICE',
      question: 'That four-letter word is the password to the encrypted directory.',
      answer: 'CALL',
      hints: [
        'That antique display uses a system where each digit hides multiple letters, and the number of presses selects which one. The log recorded four deliberate presses.',
        'The screen looks like an old mobile phone — the kind where you pressed a digit multiple times to cycle through letters. Key 2 cycles A-B-C, key 5 cycles J-K-L.',
        'Key 2 struck 3 times: A(1st), B(2nd), C(3rd) → C. Key 2 struck once → A. Key 5 struck 3 times: J(1st), K(2nd), L(3rd) → L. Key 5 struck 3 times → L. The word is CALL.'
      ]
    },
    {
      id: 'research-4',
      locationId: 'research-wing',
      narrative: 'The filing cabinet creaks open. Inside, a single manila folder is stamped "MITOSIS LOG — PROJECT GENESIS." It contains a graph with a curve that starts shallow, then rises steeply. A series of numbers is scrawled beneath it, as though someone was tracking a living culture\'s rate of division:\n\n4 — 9 — 19 — 39 — 79 — ??\n\nA note in red ink circles the final entry: "EVERY GENERATION DOUBLES ITSELF AND SPAWNS ONE MORE. PROJECT THE NEXT COUNT TO OVERRIDE THE VAULT\'S BIOMETRIC LATCH."',
      question: 'The vault\'s biometric latch expects that final number.',
      answer: '159',
      hints: [
        'The note says each generation doubles itself and spawns one more. That\'s a two-step operation applied to each number to get the next.',
        'A living culture doesn\'t just add — it splits and spawns. Each count doubles itself, then adds one more. Watch the pattern.',
        'The rule is n × 2 + 1. Apply it to 79: (79 × 2) + 1 = 159.'
      ]
    },
    {
      id: 'vault-1',
      locationId: 'containment-vault',
      narrative: 'The biometric latch clicks open. The vault yawns before you, thick with shadow and the smell of ozone. The shattered central stasis tube dominates the room — its armored glass blown outward from within.\n\nA sound spectrograph terminal on the adjacent wall has survived the chaos. Its screen displays the recorded battle cries of seven Pokémon whose genetic material was spliced into Subject 150. Each cry is annotated only by its duration, measured in tenths of a second:\n\nCRY 1 — 16\nCRY 2 — 19\nCRY 3 — 25\nCRY 4 —  3\nCRY 5 —  8\nCRY 6 —  9\nCRY 7 —  3\n\nA faded label beneath the screen reads:\n\n"EACH TENTH OF A SECOND REVEALS ONE RUNE OF THE ANCIENT SCRIPT."',
      question: 'The seven cries, laid end to end, sang a single word — a name shared by creator and creation alike.',
      answer: 'PSYCHIC',
      hints: [
        'The label mentions "runes of the ancient script" — one per tenth of a second. There are exactly twenty-six letters in the alphabet, and the durations are all twenty-six or below.',
        'Seven voices, each measured in tenths of a second. There are twenty-six runes in the ancient script — one for every letter of the alphabet. Each duration names a rune.',
        '16 = P, 19 = S, 25 = Y, 3 = C, 8 = H, 9 = I, 3 = C. The word is PSYCHIC — the type shared by Mew and Mewtwo.'
      ]
    },
    {
      id: 'vault-2',
      locationId: 'containment-vault',
      narrative: 'Dr. Fuji\'s personal journal lies open on a toppled filing cabinet, its pages warped by humidity. One entry catches your attention — intelligence reports on three trainers who breached the facility years ago:\n\n"The boy from Pallet Town brought a creature whose fur crackles with static. Water types scatter before him, yet he cannot part the sea himself. The electric type is his alone."\n\n"The girl from Cerulean commands the tide. Her creatures douse any flame, though the earth beneath her feet remains untouchable. Water answers only to her."\n\n"The man from Pewter commands living stone. Lightning breaks against his titans like waves on a cliff, but the skies will never obey his call. Rock is his dominion."\n\nEach trainer mastered one type — Electric, Water, or Rock — and no type was shared.',
      question: 'Beneath the trainer profiles, Fuji had scratched a note to himself — the combination to the specimen manifest:\n\n"Let their names decide the order. Let their arts decide the numbers. Three digits, no spaces."',
      answer: '845',
      hints: [
        'Three trainers, three hometowns, three types. Their names are well-known in Kanto — sort them alphabetically, then count the letters of their mastered types.',
        'The boy from Pallet is Ash (Electric), the girl from Cerulean is Misty (Water), the man from Pewter is Brock (Rock). Count the letters of each type, then order the three results by their trainer names alphabetically.',
        'Ash (Electric = 8 letters), Brock (Rock = 4 letters), Misty (Water = 5 letters). Concatenated in alphabetical order: 845.'
      ]
    },
    {
      id: 'vault-3',
      locationId: 'containment-vault',
      narrative: 'Against the vault\'s rear wall, seven specimen jars sit in a precise row, each filled with pale blue preservative fluid. Faded labels identify the tissue donors, but the Pokémon names have dissolved away — only Dr. Fuji\'s cryptic shorthand remains, scrawled beneath each jar in fading ink:\n\n"The turtle — its fifth armored plate."\n"The spear-beak — its third ruffled quill."\n"The bulb-carrier — its third unfurling leaf."\n"The pigeon — its fifth downy feather."\n"The electric mouse — its fourth scarlet cheek-pouch."\n"The flowering frog — its fifth blooming petal."\n"The evolution child — its very first breath."',
      question: 'Seven jars, seven clues. Left to right, they give up a single word — one letter each.',
      answer: 'RELEASE',
      hints: [
        'Each jar holds tissue from a distinct Pokémon. The riddles hint at both the species and a specific position within its name.',
        'Fuji spoke in riddles to protect his specimens. A turtle, a spear-beak, a bulb-carrier — each one hides a letter at the depth he specified. Seven jars, seven letters.',
        'Extract the letters by position: Squirtle 5th = R, Spearow 3rd = E, Bulbasaur 3rd = L, Pidgey 5th = E, Pikachu 4th = A, Venusaur 5th = S, Eevee 1st = E. The word is RELEASE.'
      ]
    },
    {
      id: 'vault-4',
      locationId: 'containment-vault',
      narrative: 'The master terminal hums to life as you approach. Seven Unown — the Symbol Pokémon — drift across the screen, each taking the shape of a different letter. One by one they arrange themselves into a sequence, then fade, leaving seven empty input boxes on the display.\n\nA final log entry from Dr. Fuji renders onscreen:\n\n"IF YOU HAVE TRULY FOLLOWED MY RESEARCH, YOU HOLD SEVEN KEYS. THE UNOWN WILL JUDGE WHETHER YOU ARE WORTHY OF THE EIGHTH. TYPE ALL SEVEN IN ORDER — NUMBERS AND LETTERS, NO SPACES BETWEEN THEM."\n\nBelow the entry, each input box bears a cryptic label:\n\n"THE BINARY EGG\'S FIRST SPARK."\n"THE TYPING GRID\'S FINAL EDGE."\n"THE POLTERGEIST\'S SECOND TAP."\n"THE DIVIDING CELL\'S THIRD BLOOM."\n"THE SUBJECT\'S PLEA — ITS SECOND PULSE."\n"THE TRAINERS\' OPENING COUNT."\n"THE CODED WORD\'S FINAL SOUND."',
      question: 'Seven input boxes await, one for each label. The terminal expects the seven characters typed as a single passcode — no spaces. What code opens the vault?',
      answer: '17A9S8E',
      hints: [
        'The Unown are testing your memory. Each cryptic label describes a specific character from one of your previous answers — listed in the order you solved them.',
        'The Unown speak in echoes. "The binary egg" points to the first door you unlocked. Each label is a map back to a puzzle you\'ve already solved — extract exactly the character they describe.',
        'Concatenate the seven extracted characters in order: 1 + 7 + A + 9 + S + 8 + E = 17A9S8E.'
      ]
    }
  ]
};

export default data;
