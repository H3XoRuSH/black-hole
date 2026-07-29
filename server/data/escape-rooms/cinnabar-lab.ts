import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'cinnabar-lab',
  name: 'The Cinnabar Lab',
  description: 'Beneath the volcanic island of Cinnabar, a shrouded laboratory still hums with residual power. Someone tried to play creator here — and lost. Decrypt the geneticist\'s legacy and escape before the geothermal failsafes entomb you forever.',
  difficulty: 'medium',
  intro: 'The floor gave way six seconds ago.\n\nYou hit the grating shoulder-first, breath punched clean out of you. Above, through the hole you just made in the ceiling, volcanic rock glows a dull orange through twisted rebar. Below: the Research Wing of an underground genetics laboratory, lit only by emergency strobes — every surface coated in fine grey ash that tastes of copper and scorched wiring.\n\nA synthetic voice gargles through a half-drowned speaker:\n\n"GEOTHERMAL PURGE ACTIVE — TRIGGER: STRUCTURAL BREACH, SECTION 7. FIFTY-THREE MINUTES TO FACILITY SEAL."\n\nYou caused this. Your ceiling is the clock.\n\nWorkstations ring the room, most dark, a few still drawing power. A Poké Ball assembly rack stands against the eastern pillar. To the north, a formidable blast door pulses red — keycard required. Whatever is beyond it, you\'ll need credentials first.\n\nFifty-three minutes. Move.',
  locations: [
    {
      id: 'research-wing',
      name: 'The Research Wing',
      description: 'A cavernous room lined with steel workbenches and humming machinery. Shattered stasis tubes drip pale blue fluid onto the tile floor. A massive type-effectiveness chart dominates the far wall, its colors faded but legible. A Poké Ball assembly rack stands against the eastern pillar — eight spheres sit in precise formation, their status lights pulsing in a steady rhythm. To the north, a formidable blast door bears the faded crimson "R" of Team Rocket, its keypad awaiting a numeric sequence.'
    },
    {
      id: 'containment-vault',
      name: 'The Containment Vault',
      description: 'Near-darkness swallows you the moment you step through. A single crimson emergency beacon strobes overhead, painting the chamber in slow waves of blood-red light. The air is thick with ozone and the sharp bite of old preservative fluid. Filing cabinets line the walls, several thrown aside like toys. Something heavy was dragged across the floor toward the back wall — the trail is unmistakable.'
    }
  ],
  nodes: [
    // ===== RESEARCH WING =====
    // Mix of puzzle types: always-accessible puzzles, knowledge-gated puzzles
    // (visible but unsolvable without clues found elsewhere), and locked nodes.
    // The room shows 5 distinct objects — some are puzzles you can try immediately,
    // some are locked behind items, and some hide their clues behind other objects.

    {
      id: 'research-wing-pokeball-rack',
      locationId: 'research-wing',
      parentId: null,
      type: 'puzzle',
      label: 'Poké Ball Assembly Rack',
      narrative: 'You approach the Poké Ball rack bolted to the eastern pillar. Eight spheres rest in individual cradles numbered 1 through 8, left to right. Each sphere is either sealed tight with its indicator light dark, or split open with its light blazing. A brass plaque beneath the rack reads:\n\n"STORED ENERGY STATES — DORMANT SHELLS COUNT FOR NOTHING. ACTIVE BURSTS ARE EVERYTHING."\n\nA technician\'s notepad lies open beside the rack:\n\nBALL 1 — AWAKENED. BALL 2 — SLUMBERING. BALL 3 — SLUMBERING. BALL 4 — AWAKENED. BALL 5 — SLUMBERING. BALL 6 — AWAKENED. BALL 7 — AWAKENED. BALL 8 — SLUMBERING.',
      question: 'A security terminal next to the rack displays: "CONVERT THE EIGHT SPHERES INTO THE STORED ENERGY TOTAL." The keypad blinks, waiting.',
      answer: '150',
      hints: [
        'The plaque is worded strangely — read it aloud and look at the balls again.',
        'Dormant shells count for nothing, active bursts for everything. Treat awakened as 1 and slumbering as 0, then convert the binary pattern to decimal.',
        '1 0 0 1 0 1 1 0 in binary is 128 + 16 + 4 + 2 = 150.'
      ],
      children: ['research-wing-type-chart']
    },
    {
      id: 'research-wing-type-chart',
      locationId: 'research-wing',
      parentId: 'research-wing-pokeball-rack',
      type: 'dialogue',
      label: 'Type-Effectiveness Chart',
      narrative: 'The terminal logs the decoded value — 150. You recognise that number — Kanto #150. The massive chart on the western wall flickers to life. A grid of eighteen Pokémon types appears, numbered sequentially from 1 to 18, reading left to right, top to bottom:\n\nROW 1: Normal(1) — Fire(2) — Water(3) — Electric(4) — Grass(5) — Ice(6)\nROW 2: Fighting(7) — Poison(8) — Ground(9) — Flying(10) — Psychic(11) — Bug(12)\nROW 3: Rock(13) — Ghost(14) — Dragon(15) — Dark(16) — Steel(17) — Fairy(18)\n\nThe technician\'s log notes: "Energy calibration complete. The type grid is now online — use it to authenticate the operatives at the security terminal. Four contacts breached Gate 7 in total — three were later confirmed as external trainers, not Rocket staff."\n\nA scribbled margin note adds: "Ash from Pallet calibrated this. Kid\'s electric — nearly fried the whole board testing it."',
      children: []
    },

    {
      id: 'research-wing-grid-puzzle',
      locationId: 'research-wing',
      parentId: null,
      type: 'puzzle',
      label: 'Security Terminal',
      narrative: 'A security terminal hums quietly beside the western wall. Its screen displays an access log — four type icons flash in sequence: a flame, a snowflake, a fissure, and a clenched fist. Below them, a prompt blinks:\n\n"SPEAK THE GRID NUMBERS OF THE FOUR THAT OPENED THE GATE."\n\nThe terminal expects a four-digit passcode, but the grid it references is dark — you\'ll need to find a way to power it on. A margin note in the access log reads: "Fire fought first, Ice next, Ground rose, Fighting last."',
      question: 'Key in the four-digit sequence.',
      answer: '2697',
      hints: [
        'The terminal shows four type icons but the grid is dark. The type chart on the western wall needs power — check the Poké Ball rack on the eastern pillar.',
        'Match each icon: flame = Fire (2), snowflake = Ice (6), fissure = Ground (9), fist = Fighting (7). Concatenate in the order shown.',
        'Fire = 2, Ice = 6, Ground = 9, Fighting = 7. Concatenated: 2697.'
      ],
      children: ['research-wing-rotom-token']
    },
    {
      id: 'research-wing-rotom-token',
      locationId: 'research-wing',
      parentId: 'research-wing-grid-puzzle',
      type: 'item',
      label: 'Rotom Access Token',
      narrative: 'The terminal accepts the passcode and prints: "OPERATIVES AUTHENTICATED — 2697." A second line appears: "ROTOM ACCESS TOKEN GRANTED." A data card ejects from a slot, labeled "USE AT LABORATORY PC."',
      rewardItem: 'rotom-access-token'
    },

    {
      id: 'research-wing-lab-pc',
      locationId: 'research-wing',
      parentId: null,
      type: 'locked',
      label: 'Laboratory PC',
      narrative: 'The access token authenticates. The screen flickers past the lock screen and opens a directory with an archived keypress log — whoever was here last left a trail.',
      lockedNarrative: 'A dusty laboratory PC squats in the corner, its monitor cracked but still glowing a queasy green. The screen shows a lock screen — "ROTOM ACCESS TOKEN REQUIRED."',
      lockedByItem: 'rotom-access-token',
      children: ['research-wing-rotom-keypad-guide', 'research-wing-rotom-puzzle']
    },
    {
      id: 'research-wing-rotom-keypad-guide',
      locationId: 'research-wing',
      parentId: 'research-wing-lab-pc',
      type: 'dialogue',
      label: 'Keypad Reference Diagram',
      narrative: 'A faded reference diagram is taped to the monitor bezel, showing an old telephone-style keypad layout. Each number key cycles through three or four letters when pressed repeatedly:\n\nKEY 2 — ABC\nKEY 3 — DEF\nKEY 4 — GHI\nKEY 5 — JKL\nKEY 6 — MNO\nKEY 7 — PQRS\nKEY 8 — TUV\nKEY 9 — WXYZ\n\nA note beside the diagram reads: "Legacy texting interface — each digit toggles through its set. Count the presses to land on the right letter."',
      children: []
    },
    {
      id: 'research-wing-rotom-puzzle',
      locationId: 'research-wing',
      parentId: 'research-wing-lab-pc',
      type: 'puzzle',
      label: 'Rotom\'s Keypress Log',
      narrative: 'The screen shows an archaic numeric keypad — the kind where each digit cycles through three or four letters. A sticky note clings to the bezel, written in jagged, gleeful strokes:\n\n"ROTOM WAS HERE. >:)"\n\nBelow the note, the terminal logs four deliberate keypresses:\n\nKEY 2 — STRUCK THRICE\nKEY 2 — STRUCK ONCE\nKEY 5 — STRUCK THRICE\nKEY 5 — STRUCK THRICE',
      question: 'That four-letter word is the password to the encrypted directory.',
      answer: 'CALL',
      hints: [
        'Look at the reference diagram taped to the monitor — each key cycles through its assigned letters. The number of strikes tells you which letter to land on.',
        'Key 2 cycles A-B-C (struck 3 times = C, struck once = A). Key 5 cycles J-K-L (struck 3 times = L, struck 3 times = L).',
        'The word is CALL — type C-A-L-L.'
      ],
      children: ['research-wing-cabinet-code', 'research-wing-mitosis-note']
    },
    {
      id: 'research-wing-cabinet-code',
      locationId: 'research-wing',
      parentId: 'research-wing-rotom-puzzle',
      type: 'item',
      label: 'Filing Cabinet Access Code',
      narrative: 'The directory unlocks. A file labeled "FURNITURE OVERRIDES" opens automatically, displaying a 4-digit code. Beneath it: "FILING CABINET — PROJECT GENESIS FISSION LOG."',
      rewardItem: 'filing-cabinet-access-code'
    },
    {
      id: 'research-wing-mitosis-note',
      locationId: 'research-wing',
      parentId: 'research-wing-rotom-puzzle',
      type: 'dialogue',
      label: 'Research Memo',
      narrative: 'The directory also reveals a file: "PROJECT GENESIS — GROWTH PATTERN ANALYSIS."\n\nDr. Fuji\'s memo reads: "The culture exhibits predictable mitosis. Each generation DOUBLES ITSELF, then SPAWNS ONE MORE. The formula is N × 2 + 1. The raw sequence data is filed in the cabinet."\n\nA handwritten postscript adds: "P.S. — The vault spectrograph records the splice chorus of all seven donors using the Unown Forms Index. I\'ve left the index in my journal. Check it before using the terminal."\n\nSomeone else has scribbled in the margin: "Misty from Cerulean always said growth was like a current — double the flow, add one more tributary. She\'d have loved this formula."',
      children: []
    },

    {
      id: 'research-wing-filing-cabinet',
      locationId: 'research-wing',
      parentId: null,
      type: 'locked',
      label: 'Filing Cabinet',
      narrative: 'The code is accepted. The top drawer slides open, revealing a manila folder stamped "FISSION LOG — PROJECT GENESIS (asymmetric double-and-spawn model)."',
      lockedNarrative: 'A tall metal filing cabinet stands against the wall, its drawer secured by a digital lock. A small screen reads "ENTER OVERRIDE CODE."',
      lockedByItem: 'filing-cabinet-access-code',
      children: ['research-wing-mitosis-puzzle']
    },
    {
      id: 'research-wing-mitosis-puzzle',
      locationId: 'research-wing',
      parentId: 'research-wing-filing-cabinet',
      type: 'puzzle',
      label: 'Mitosis Sequence',
      narrative: 'The manila folder contains a graph with a curve that starts shallow, then rises steeply. A series of numbers is scrawled beneath it, as though someone was tracking a living culture\'s rate of division:\n\n4 — 9 — 19 — 39 — 79 — ??\n\nA note in red ink circles the final entry: "EVERY GENERATION DOUBLES ITSELF AND SPAWNS ONE MORE. PROJECT THE NEXT COUNT TO OVERRIDE THE VAULT\'S BIOMETRIC LATCH."',
      question: 'The vault\'s biometric latch expects that final number.',
      answer: '159',
      hints: [
        'The folder has the raw number sequence but the growth rule was torn out. Dr. Fuji\'s research memo — accessible from the lab PC — has the pattern formula.',
        'The memo says each generation doubles itself, then spawns one more. Apply N × 2 + 1 to each number to get the next.',
        'Apply n × 2 + 1 to 79: (79 × 2) + 1 = 159.'
      ],
      children: ['research-wing-vault-key']
    },
    {
      id: 'research-wing-vault-key',
      locationId: 'research-wing',
      parentId: 'research-wing-mitosis-puzzle',
      type: 'item',
      label: 'Vault Override Key',
      narrative: 'The cabinet terminal prints: "BIOMETRIC OVERRIDE ACTIVE — 159 CONFIRMED." A keycard slides from a slot beneath the folder, tagged "BLAST DOOR VAULT ACCESS."',
      rewardItem: 'vault-override-key'
    },

    {
      id: 'research-wing-blast-door',
      locationId: 'research-wing',
      parentId: null,
      type: 'locked',
      label: 'Blast Door',
      narrative: 'You swipe the override keycard. With a thunderous clank, the blast door\'s magnetic seals release and the heavy door grinds open.',
      lockedNarrative: 'A formidable blast door looms to the north, stamped with the faded crimson "R" of Team Rocket. A card reader blinks beside it — "VAULT ACCESS CREDENTIAL REQUIRED."',
      lockedByItem: 'vault-override-key',
      children: ['research-wing-to-vault']
    },
    {
      id: 'research-wing-to-vault',
      locationId: 'containment-vault',
      parentId: 'research-wing-blast-door',
      type: 'dialogue',
      label: 'Enter the Vault',
      narrative: 'You step through the blast door into near-darkness. The seal catches on twisted metal and the door grinds to a halt with a tortured screech.\n\nThen you see it.\n\nA stasis tube, easily fifteen feet tall, dominates the chamber — its armored glass blown outward from within. Pale blue fluid still drips from the ruptured seals, pooling on the cracked tile floor. Whatever gestated here escaped violently. Claw marks gouge the concrete in long, deliberate furrows, leading toward the far wall.\n\nYou\'re not the first thing to escape through a ceiling.\n\nA speaker crackles overhead: "GEOTHERMAL PURGE ACTIVE. THIRTY MINUTES TO FACILITY SEAL."\n\nThe floor shudders. The mountain is counting down.',
      children: []
    },

    // ===== CONTAINMENT VAULT =====
    // Max depth 3 from any root.
    // Journal forks into two knowledge-gated puzzles → each yields an item.
    // Two sequential locked nodes at root consume both items to reach jars → meta.

    {
      id: 'containment-vault-shattered-tank',
      locationId: 'containment-vault',
      parentId: null,
      type: 'dialogue',
      label: 'Shattered Stasis Tank',
      narrative: 'The central stasis tube dominates the room — easily fifteen feet tall, its armored glass blown outward from within. Pale blue fluid still drips from the ruptured seals, pooling on the tile floor. Whatever gestated here escaped violently. Claw marks gouge the concrete, leading toward a toppled filing cabinet where Dr. Fuji\'s journal lies open.\n\nA torn security card lies pinned beneath a chunk of debris — its photo shows a burly man with a crew cut, badge reading "BROCK — PEWTER GYM — ROCK DIVISION — FORMER LEADER." The card is stamped DECEASED.',
      children: ['containment-vault-journal']
    },

    {
      id: 'containment-vault-journal',
      locationId: 'containment-vault',
      parentId: 'containment-vault-shattered-tank',
      type: 'dialogue',
      label: 'Dr. Fuji\'s Journal',
      narrative: 'Dr. Fuji\'s personal journal lies open on the toppled cabinet, its pages warped by humidity. Unown glyphs are scratched compulsively into every margin — pencil, dried ink, some circled as though Fuji was trying to remember a shape. Two sections are bookmarked with faded ribbons.\n\n--- TRAINER INTELLIGENCE ---\n\nThree trainers breached the facility years ago. Fuji\'s notes identify them only by their hometowns and mastered types:\n\n"The boy from Pallet Town — Electric. Water scatters before him."\n"The girl from Cerulean — Water. Her creatures douse any flame."\n"The man from Pewter — Rock. Lightning breaks against his titans."\n\nEach trainer mastered one type — none was shared.\n\nA later entry, in a shakier hand: "The Pewter boy reached the vault. The Subject made an example of him. I locked the door and told myself it was the purge I feared."\n\n--- UNOWN FORMS INDEX ---\n\nA torn reference sheet is tucked into the spine:\n\n"SPECTROGRAPH DECODER — UNOWN FORMS INDEX"\nEach Unown form is catalogued by its position in the Kanto alphabet — a shape for every sound.\n1=A  2=B  3=C  4=D  5=E  6=F  7=G  8=H  9=I  10=J\n11=K 12=L 13=M 14=N 15=O 16=P 17=Q 18=R 19=S 20=T\n21=U 22=V 23=W 24=X 25=Y 26=Z',
      children: ['containment-vault-spectrograph', 'containment-vault-trainer-puzzle']
    },

    {
      id: 'containment-vault-spectrograph',
      locationId: 'containment-vault',
      parentId: 'containment-vault-journal',
      type: 'puzzle',
      label: 'Sound Spectrograph',
      narrative: 'A sound spectrograph terminal on the adjacent wall has survived the chaos. Its screen displays the recorded battle cries of seven Pokémon whose genetic material was spliced into Subject 150. Each cry is annotated only by its duration, measured in tenths of a second:\n\nCRY 1 — 16\nCRY 2 — 19\nCRY 3 — 25\nCRY 4 —  3\nCRY 5 —  8\nCRY 6 —  9\nCRY 7 —  3\n\nA faded label beneath the screen reads: "EACH TENTH OF A SECOND MAPS TO ONE UNOWN FORM." The Unown Forms Index has been torn away from the housing — you\'ll need to find it elsewhere.',
      question: 'The seven cries, laid end to end, sang a single word — a name shared by creator and creation alike.',
      answer: 'PSYCHIC',
      hints: [
        'The runic decoder key is missing from the terminal. Check Dr. Fuji\'s journal — it has a reference table mapping numbers to letters.',
        'The journal\'s Unown Forms Index maps each duration to a letter: 16 = P, 19 = S, 25 = Y, 3 = C, 8 = H, 9 = I, 3 = C.',
        'The word is PSYCHIC — the type shared by Mew and Mewtwo.'
      ],
      children: ['containment-vault-cryo-frequency']
    },
    {
      id: 'containment-vault-cryo-frequency',
      locationId: 'containment-vault',
      parentId: 'containment-vault-spectrograph',
      type: 'item',
      label: 'Cryo-Release Frequency',
      narrative: 'The spectrograph prints its analysis: "SUBJECT 150 VOCAL SIGNATURE: PSYCHIC."\n\nA frequency modulation code scrolls beneath: "CRYO-RELEASE FREQ = 150.3 MHz — USE AT REAR CONTAINMENT LOCK."\n\nA small note adds: "Logged for master override."',
      rewardItem: 'cryo-frequency'
    },

    {
      id: 'containment-vault-trainer-puzzle',
      locationId: 'containment-vault',
      parentId: 'containment-vault-journal',
      type: 'puzzle',
      label: 'Trainer Access Code',
      narrative: 'Beneath the trainer profiles, Fuji had scratched a note to himself — the combination to the specimen manifest:\n\n"Let their names decide the order. Let one letter of their arts — each name spoken once — decide each digit. Three digits, no spaces."',
      question: 'Key in the three-digit manifest code.',
      answer: '845',
      hints: [
        'The journal only gives hometowns — Pallet, Cerulean, Pewter. You need their actual names to sort alphabetically. A security dossier might identify them. Check the cryo-containment lock on the rear wall.',
        'The intruder file gives first letters: A___ (3 letters, Pallet), M_____ (5 letters, Cerulean), B____ (5 letters, Pewter). Sort alphabetically by name.',
        'Count the letters in each type name: Electric = 8 letters, Rock = 4 letters, Water = 5 letters. Alphabetical order (Ash, Brock, Misty) gives 8-4-5 = 845.'
      ],
      children: ['containment-vault-trainer-manifest']
    },
    {
      id: 'containment-vault-trainer-manifest',
      locationId: 'containment-vault',
      parentId: 'containment-vault-trainer-puzzle',
      type: 'item',
      label: 'Trainer Manifest Code',
      narrative: 'Beneath the solved code, Fuji had written: "845 — Electric, Rock, Water. The three who nearly breached this place."\n\nA second line prints: "TRAINER ACCESS CODE LOGGED. USE AT SPECIMEN MANIFEST TERMINAL."',
      rewardItem: 'trainer-manifest-code'
    },

    {
      id: 'containment-vault-cryo-lock',
      locationId: 'containment-vault',
      parentId: null,
      type: 'locked',
      label: 'Cryo-Containment Lock',
      narrative: 'The cryo-frequency is accepted. With a deep resonant hum, the magnetic seals disengage and the rear wall panel slides aside. Inside, a security dossier hangs from a clipboard beside a dormant specimen manifest terminal.',
      lockedNarrative: 'A heavy magnetic lock secures the rear wall of the vault. A small display reads: "CRYO-CONTAINMENT SEALED — INPUT SPECTROGRAPH RELEASE FREQUENCY."',
      lockedByItem: 'cryo-frequency',
      children: ['containment-vault-intruder-file', 'containment-vault-specimen-log', 'containment-vault-manifest-terminal']
    },
    {
      id: 'containment-vault-specimen-log',
      locationId: 'containment-vault',
      parentId: 'containment-vault-cryo-lock',
      type: 'dialogue',
      label: 'Specimen Donor Log',
      narrative: 'A faded logbook hangs beside the dossier, listing the seven Pokémon whose tissue samples were harvested for Project Genesis:\n\n• SQUIRTLE — Tiny Turtle Pokémon. Shell offers natural armor.\n• SPEAROW — Spear-Beak Pokémon. Aggressive, territorial flyer.\n• BULBASAUR — Seed Pokémon. Carries a plant bulb from birth.\n• PIDGEY — Tiny Bird Pokémon. Docile, common across Kanto.\n• PIKACHU — Mouse Pokémon. Stores electricity in its cheek pouches.\n• VENUSAUR — Seed Pokémon. Evolved form, flowers blooming on its back.\n• EEVEE — Evolution Pokémon. Unstable genetic code, adapts to any environment.\n\nA red stamp across the bottom reads: "SUBJECT 150 — GENETIC SPLICE OF ALL SEVEN DONORS. FINAL STAGE: COMPLETE."',
      children: []
    },
    {
      id: 'containment-vault-intruder-file',
      locationId: 'containment-vault',
      parentId: 'containment-vault-cryo-lock',
      type: 'dialogue',
      label: 'Intruder Identification File',
      narrative: 'The security dossier is stamped "INTRUDER PROFILES — DECLASSIFIED." Three partially redacted trainer cards are clipped inside:\n\n"A___ — The boy from Pallet Town — Electric Specialist"\n"M_____ — The Cerulean gym leader\'s youngest — Water Specialist"\n"B____ — The former Pewter Gym Leader — Rock Specialist"\n\nA handwritten note from Fuji reads: "Count the letters in each art\'s name. Alphabetical order of the trainers reveals the manifest code."',
      children: []
    },
    {
      id: 'containment-vault-manifest-terminal',
      locationId: 'containment-vault',
      parentId: 'containment-vault-cryo-lock',
      type: 'locked',
      label: 'Specimen Manifest Terminal',
      narrative: 'The trainer code is accepted. The terminal beeps twice and the specimen jar array along the rear wall hums to life — preservative fluid begins to glow pale blue.',
      lockedNarrative: 'A terminal sits beside the dossier. Its screen displays: "SPECIMEN MANIFEST LOCKED — ENTER TRAINER ACCESS CODE TO ACTIVATE."',
      lockedByItem: 'trainer-manifest-code',
      children: ['containment-vault-specimen-jars']
    },

    {
      id: 'containment-vault-specimen-jars',
      locationId: 'containment-vault',
      parentId: 'containment-vault-manifest-terminal',
      type: 'puzzle',
      label: 'Specimen Jars',
      narrative: 'Against the rear wall, seven specimen jars sit in a precise row, each filled with pale blue preservative fluid now glowing faintly. Faded labels identify the tissue donors, but the Pokémon names have dissolved away — only Dr. Fuji\'s cryptic shorthand remains, scrawled beneath each jar in fading ink:\n\n"The turtle — its fifth armored plate."\n"The spear-beak — its third ruffled quill."\n"The bulb-carrier — its third unfurling leaf."\n"The Tiny Bird — its fifth downy feather."\n"The electric mouse — its fourth scarlet cheek-pouch."\n"The Seed Pokémon — its fifth blooming petal."\n"The evolution child — its very first breath."',
      question: 'Seven jars, seven clues. Left to right, they give up a single word — one letter each.',
      answer: 'RELEASE',
      hints: [
        'Each jar describes a Pokémon with a riddle and points to a specific letter position in its name. Knowledge of Kanto Pokémon will help identify each one.',
        'The trickier ones: the Tiny Bird is Pidgey (5th letter = E), the Seed Pokémon is Venusaur (5th letter = S), and the evolution child is Eevee (1st letter = E). Work out the rest from the Specimen Donor Log.',
        'The seven letters spell RELEASE — type R-E-L-E-A-S-E.'
      ],
      children: ['containment-vault-master-terminal']
    },
    {
      id: 'containment-vault-master-terminal',
      locationId: 'containment-vault',
      parentId: 'containment-vault-specimen-jars',
      type: 'puzzle',
      label: 'Master Override Console',
      narrative: 'As the word RELEASE echoes from the specimen chambers, a speaker overhead crackles: "GEOTHERMAL PURGE ACTIVE. TEN MINUTES TO FACILITY SEAL." A panel slides open behind the jars — revealing the master override console. Seven Unown — the Symbol Pokémon — drift across the screen, each taking the shape of a different letter. One by one they arrange themselves into a sequence, then fade, leaving seven empty input boxes on the display.\n\nA final log entry from Dr. Fuji renders onscreen:\n\n"IF YOU HAVE TRULY FOLLOWED MY RESEARCH, YOU HOLD SEVEN KEYS. THE UNOWN WILL JUDGE WHETHER YOU ARE WORTHY OF THE EIGHTH. TYPE ALL SEVEN IN ORDER — NUMBERS AND LETTERS, NO SPACES BETWEEN THEM."\n\nBelow the entry, each input box bears a cryptic label:\n\n"THE BINARY EGG\'S FIRST SPARK."\n"THE TYPING GRID\'S FINAL EDGE."\n"THE POLTERGEIST\'S SECOND TAP."\n"THE DIVIDING CELL\'S THIRD BLOOM."\n"THE SUBJECT\'S PLEA — ITS SECOND PULSE."\n"THE TRAINERS\' OPENING COUNT."\n"THE CODED WORD\'S FINAL SOUND."',
      question: 'Seven input boxes await, one for each label. The terminal expects the seven characters typed as a single passcode — no spaces.',
      answer: '17A9S8E',
      hints: [
        'Each cryptic label describes one of your previous puzzles — and a specific character position within its answer. Trace each label back to the puzzle it references.',
        'Three of the harder labels: the Poltergeist is Rotom\'s PC (CALL, 2nd character = A). The Subject\'s plea is the spectrograph (PSYCHIC, 2nd character = S). The Coded word is the specimen jars (RELEASE, last character = E). Trace the other four labels back to their puzzles.',
        'Concatenate in order: 1 + 7 + A + 9 + S + 8 + E = 17A9S8E.'
      ],
      isMeta: true,
      children: ['containment-vault-epilogue']
    },

    // ===== EPILOGUE =====
    // Cross-location: parented to master terminal, located in research wing.
    // Engine note: makeMove blocks post-escape navigation; this node is correctly
    // structured for when engine support (e.g. an `outro` affordance) is added.

    {
      id: 'containment-vault-epilogue',
      locationId: 'research-wing',
      parentId: 'containment-vault-master-terminal',
      type: 'dialogue',
      label: 'The Way Out',
      narrative: 'The seven Unown dissolve into soft light. The klaxon cuts mid-whoop.\n\n"GEOTHERMAL PURGE SUSPENDED — OVERRIDE CODE ACCEPTED."\n\nA new sound: a low mechanical whirr from above. A maintenance ladder unspools from the ceiling — dropping through the hole you made when you fell in. The orange glow of volcanic sky bleeds through from above.\n\nClaw marks trace the concrete floor all the way to the base of the ladder.\n\nYou\'re not the first to leave this way. But unlike the last one, you were invited.\n\nDr. Fuji\'s voice, pre-recorded, clicks through a speaker one final time:\n\n"I sealed it from inside. You unsealed it. Run."',
      children: []
    },

    // ===== RESEARCH WING FLAVOR NODES =====
    // Non-puzzle environmental nodes. Seed the mystical register (Unown) and
    // pre-haunt the second act (vault preview) without touching the dependency graph.

    {
      id: 'research-wing-incident-report',
      locationId: 'research-wing',
      parentId: null,
      type: 'dialogue',
      label: 'Incident Report Board',
      narrative: 'A corkboard beside the door is still pinned with a laminated incident report — the only document in the room with a legible date:\n\n"INCIDENT REPORT #47 — GEOTHERMAL VENT 3\nSYMBOL POKÉMON SIGHTED IN THE LOWER THERMAL CORRIDOR. THIRD INCIDENT THIS MONTH. STAFF ADVISED NOT TO ENGAGE. FUJI HAS BEEN NOTIFIED.\n\nNOTE FROM DR. FUJI: They come up through the vents. They always have. I have taken samples. The shapes they make are not random."\n\nA second note, pinned beside it in different handwriting: "Fuji — you said the same thing about the mitosis curve. You were right then. Please be wrong now."',
      children: []
    },

    {
      id: 'research-wing-vault-grate',
      locationId: 'research-wing',
      parentId: null,
      type: 'dialogue',
      label: 'Grated Observation Window',
      narrative: 'Set into the blast door at eye height: a small steel grate, barely a hand\'s width. You press your face against it.\n\nBeyond the door, a crimson emergency beacon pulses in steady rhythm. Somewhere in the red-lit dark, something the size of a freight container juts upward at a broken angle — its surface catching the light in long, irregular lines. The floor around it glistens with fluid.\n\nWhatever that is, it used to be whole.',
      children: []
    }
  ]
};

export default data;
