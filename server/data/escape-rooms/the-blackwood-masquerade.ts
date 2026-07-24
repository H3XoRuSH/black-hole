import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'the-blackwood-masquerade',
  name: 'The Blackwood Masquerade',
  description: 'A locked-room murder mystery inside the gothic manor of the late Lord Blackwood. Cross-reference evidence across the estate to uncover the mastermind.',
  difficulty: 'extreme',
  intro: 'The grandfather clock in the foyer chimes thirteen times... then stops.\n\nLord Blackwood lies dead in his leather study chair, his eyes wide with terror and the faint, bitter scent of almonds hanging in the cold air. Poison.\n\nSuddenly, a heavy iron seal slides over the entrance. The estate\'s automated security grid has locked down the manor, trapping you inside with a killer\'s trail.\n\nTwo passages lie before you: the heavy oak door leading to the damp, misty Glass Conservatory, and a hidden servant\'s hatch descending into the shadows of the Wine Cellar.\n\nThe truth is scattered across these halls—but someone has gone to great lengths to falsify the clues and lead you astray. You must cross-reference the evidence, decipher the ancient codes, and backtrack through the manor to reveal the mastermind... before the poison claims its next victim.',
  locations: [
    {
      id: 'study',
      name: 'Lord Blackwood\'s Study',
      description: 'Gothic wood panels cover the walls. Lord Blackwood\'s body rests in the center chair. A grand fireplace, a grandfather clock, and his personal writing desk hold the initial keys to his death.'
    },
    {
      id: 'conservatory',
      name: 'The Glass Conservatory',
      description: 'A misty dome of glass filled with exotic plants, overgrown planters, and stone monuments. The humid air carries the sound of dripping water and the shadow of a stone sundial.'
    },
    {
      id: 'wine-cellar',
      name: 'The Wine Cellar & Vault',
      description: 'A cold, subterranean vault stacked with iron wine racks and heavy aging barrels. Locked cabinets and a high-security steel door shield the mastermind\'s final records.'
    }
  ],
  nodes: [
    // Lord Blackwood's Study Nodes
    {
      id: 'study-scrapbook',
      locationId: 'study',
      parentId: null,
      type: 'dialogue',
      label: 'Faded Scrapbook',
      narrative: 'A page from an old notebook lies open on Lord Blackwood\'s shelf. It explains a grid-coordinate code system:\n\n"To encode a message, construct a five-by-five letter grid. Start by writing your chosen keyword, skipping any duplicate letters. Since the alphabet has 26 letters and the grid has only 25 cells, combine the letters I and J into a single cell. Then, fill the rest of the grid with the remaining letters of the alphabet in order.\n\nFor example, if the keyword is BALLOON, the unique letters are B, A, L, O, N. The grid begins:\n\n|   1 2 3 4 5\n| 1 B A L O N\n| 2 C D E F G\n| 3 H I K M P  (with J combined in the I cell)\n| 4 Q R S T U\n| 5 V W X Y Z\n\nThe letter E is row 2, column 3, written as 23."',
      children: []
    },
    {
      id: 'study-blueprint',
      locationId: 'study',
      parentId: null,
      type: 'dialogue',
      label: 'Draftsman\'s Sketch',
      narrative: 'An architect\'s drawing of the clock tower has a small doodle in the corner showing how the diagonal cross quadrants map to the alphabet:\n\n|   A|B|C      J|K|L (with dots)\n|   -+-+-      -+-+-\n|   D|E|F      M|N|O\n|   -+-+-      -+-+-\n|   G|H|I      P|Q|R\n| \n|     \\ S /          \\ W /   (with dot)\n|      \\ /            \\./  \n|    T  o  U        X .o. Y\n|     /   \\          / . \\\n|    /  V  \\        /  Z  \\\n\nEach letter\'s shape is defined by its surrounding lines. For example, A is represented by the corner shape of its grid cell, and J is the same shape with a dot inside.',
      children: []
    },
    {
      id: 'study-fireplace',
      locationId: 'study',
      parentId: null,
      type: 'dialogue',
      label: 'Grand Fireplace',
      narrative: 'A massive brick fireplace dominates the east wall. The logs have burned to cold gray ash, but a charred notebook lies buried in the soot.',
      children: ['study-diary']
    },
    {
      id: 'study-diary',
      locationId: 'study',
      parentId: 'study-fireplace',
      type: 'puzzle',
      label: 'Charred Diary',
      narrative: 'A burnt journal is wedged in the grate. The outer edges are scorched, but a clean grid of numbers is etched at the bottom of the page.',
      question: 'The charred diary entry reads:\n\n"I hid the iron poker in the fireplace. The clock casing holds the key to the manor."\n\nBelow it, a grid of coordinates is etched:\n\n| 23 15 34 34 21 13\n\nAt the top of the page, a keyword is faintly visible: M U R D E R.',
      answer: 'cellar',
      hints: [
        'This is a grid-coordinate cipher using the keyword MURDER.',
        'Construct a 5x5 grid. Write MURDER first (omitting the duplicate R to get M U R D E), then fill the remaining alphabet (combining J with I): M U R D E / A B C F G / H I K L N / O P Q S T / V W X Y Z.',
        'Find the letter at row-column intersections: 23=C, 15=E, 34=L, 34=L, 21=A, 13=R. The code is cellar.'
      ],
      children: ['study-poker-node']
    },
    {
      id: 'study-poker-node',
      locationId: 'study',
      parentId: 'study-diary',
      type: 'item',
      label: 'Iron Poker',
      narrative: 'You reach into the secret brick compartment behind the grate and pull out a heavy iron poker.',
      rewardItem: 'study-poker',
      children: []
    },
    {
      id: 'study-clock-case',
      locationId: 'study',
      parentId: null,
      type: 'locked',
      label: 'Grandfather Clock',
      lockedByItem: 'study-poker',
      lockedNarrative: 'The grandfather clock\'s wooden casing is jammed shut, possibly containing something inside. The seam is narrow — you need a heavy metal tool to pry it open.',
      narrative: 'Using the iron poker, you leverage the clock\'s door open. The internal brass pendulum is missing, but the clock face is visible and covered in scratches.',
      children: ['study-clock-puzzle']
    },
    {
      id: 'study-clock-puzzle',
      locationId: 'study',
      parentId: 'study-clock-case',
      type: 'puzzle',
      label: 'Clock Face',
      narrative: 'The hands of the clock are broken off, but the face has been scratched with pigpen-like grids and dots.',
      question: 'The scratches on the dial show:\n\n|  _                      __    \\ . /   \\   /\n|   |   _|   |._   |._   |._     \\ /     \\ /\n\nA plaque below the dial blinks: "Where does the traitor swing?"',
      answer: 'gallows',
      hints: [
        'These symbols represent letters in a border-enclosure cipher.',
        'Match the shapes to the grid and diagonal cross structures shown in the Draftsman\'s Sketch.',
        'The shapes translate to G, A, L, L, O, W, S. Enter gallows.'
      ],
      children: ['study-cons-key-node', 'study-cellar-key-node']
    },
    {
      id: 'study-cons-key-node',
      locationId: 'study',
      parentId: 'study-clock-puzzle',
      type: 'item',
      label: 'Conservatory Key',
      narrative: 'You take a brass key labeled "Glass Conservatory" from the clock mechanism.',
      rewardItem: 'study-conservatory-key',
      children: []
    },
    {
      id: 'study-cellar-key-node',
      locationId: 'study',
      parentId: 'study-clock-puzzle',
      type: 'item',
      label: 'Cellar Key',
      narrative: 'You take a heavy iron key labeled "Wine Cellar" from the clock mechanism.',
      rewardItem: 'study-cellar-key',
      children: []
    },
    {
      id: 'study-door',
      locationId: 'study',
      parentId: null,
      type: 'locked',
      label: 'Large Oak Door',
      lockedByItem: 'study-conservatory-key',
      lockedNarrative: 'The heavy oak door leading to the Glass Conservatory is locked. It requires the Conservatory Key.',
      narrative: 'You insert the Conservatory Key and turn it. The heavy lock clicks open, revealing a path to the conservatory.',
      children: ['study-to-conservatory']
    },
    {
      id: 'study-to-conservatory',
      locationId: 'conservatory',
      parentId: 'study-door',
      type: 'dialogue',
      label: 'Enter the Conservatory',
      narrative: 'You step through the oak door into the misty Glass Conservatory. Plant tables and glass panels surround you.',
      children: []
    },
    {
      id: 'study-hatch',
      locationId: 'study',
      parentId: null,
      type: 'locked',
      label: 'Servant\'s Hatch',
      lockedByItem: 'study-cellar-key',
      lockedNarrative: 'An iron hatch in the floor leading down to the Wine Cellar is locked tight. It requires the Cellar Key.',
      narrative: 'You unlock the hatch using the Cellar Key and lift the heavy iron lid. A wooden ladder leads down into the dark basement.',
      children: ['study-to-cellar']
    },
    {
      id: 'study-to-cellar',
      locationId: 'wine-cellar',
      parentId: 'study-hatch',
      type: 'dialogue',
      label: 'Descent to Wine Cellar',
      narrative: 'You climb down the ladder into the cold, damp air of the Wine Cellar. Dusty bottles line the iron racks.',
      children: ['study-hatch-note']
    },
    {
      id: 'study-hatch-note',
      locationId: 'wine-cellar',
      parentId: 'study-to-cellar',
      type: 'dialogue',
      label: 'Scratched Hatch Slab',
      narrative: 'A stone block near the ladder is scratched with a simple mirror-writing guide:\n\n"A mirror matches A to Z, B to Y, and C to X. Read from both ends to find the center."',
      children: []
    },
    {
      id: 'study-desk',
      locationId: 'study',
      parentId: null,
      type: 'locked',
      label: 'Blackwood\'s Desk',
      lockedByItem: 'study-desk-key',
      lockedNarrative: 'Lord Blackwood\'s mahogany writing desk is locked. The lock is complex and requires the study desk key.',
      narrative: 'You unlock the desk drawer. It slides open smoothly, revealing a collection of private papers and a secret compartment.',
      children: ['study-desk-puzzle']
    },
    {
      id: 'study-desk-puzzle',
      locationId: 'study',
      parentId: 'study-desk',
      type: 'puzzle',
      label: 'Desk Ledger',
      narrative: 'A mathematical puzzle is scribbled on the desk ledger.',
      question: 'The ledger cover shows:\n\n|    A R T\n|  + E N D\n|  -------\n|  D I E D\n\nA small note reads: "Each letter is a unique digit (0-9). R times N equals 6. The safe code is the 4-digit sum of ART and END."',
      answer: '1451',
      hints: [
        'Since we add two 3-digit numbers to get a 4-digit number, the carry digit D must be 1.',
        'Since T + D ends in D (T + 1 = 1, since D = 1), T must be 0 (no carry from units).',
        'R times N = 6, so R=2 and N=3. R+N=E, so E=5. Then A+5=I+10 with remaining digits A=9, I=4. The sum is 920 + 531 = 1451.'
      ],
      children: ['study-desk-compartment']
    },
    {
      id: 'study-desk-compartment',
      locationId: 'study',
      parentId: 'study-desk-puzzle',
      type: 'dialogue',
      label: 'Flora Journal',
      narrative: 'A hidden compartment clicks open. Inside is a brass garden trowel and a notebook labeled "Flora Journal". The journal reads:\n\n"Each plant appears exactly once in every row and column of Blackwood\'s 4x4 display grid. Rose anchors the top-left corner. I know the rest of the pattern holds — fill the gaps."',
      children: ['study-trowel-node']
    },
    {
      id: 'study-trowel-node',
      locationId: 'study',
      parentId: 'study-desk-compartment',
      type: 'item',
      label: 'Garden Trowel',
      narrative: 'You take the brass trowel from the desk compartment.',
      rewardItem: 'cons-trowel',
      children: []
    },
    {
      id: 'study-will',
      locationId: 'study',
      parentId: null,
      type: 'puzzle',
      label: 'Will and Testament',
      narrative: 'A parchment document sits on the desk. A padlock secures the document, awaiting the sole heir\'s name.',
      question: 'The document reads:\n\n"To my dearest relative, I leave my entire estate. I have written their name in the mirror script of our family:\n\nS Z I E V B\n\nMay they govern my legacy well."',
      answer: 'yevrah',
      hints: [
        'Apply the Atbash cipher (mirror script) to the letters: S=H, Z=A, I=R, E=V, V=E, B=Y. This spells harvey.',
        'Try entering harvey. The lock refuses! There is a correction rule somewhere in the Wine Cellar.',
        'The Wine Cellar winery ledger tells you to reverse the heir\'s name. Reverse harvey to get yevrah.'
      ],
      children: ['study-will-cabinet']
    },
    {
      id: 'study-will-cabinet',
      locationId: 'study',
      parentId: 'study-will',
      type: 'dialogue',
      label: 'Will Compartment',
      narrative: 'The padlock clicks open. Beneath the will, you find a small drawer containing a key and a heavy brass seal. The solved diary page reads: "I know they are trying to kill me. They have been slipping POISON into my evening wine..."',
      children: ['study-cabinet-key-node', 'study-master-seal-node']
    },
    {
      id: 'study-cabinet-key-node',
      locationId: 'study',
      parentId: 'study-will-cabinet',
      type: 'item',
      label: 'Cabinet Key',
      narrative: 'You take the key labeled "Plant Cabinet Key".',
      rewardItem: 'study-cabinet-key',
      children: []
    },
    {
      id: 'study-master-seal-node',
      locationId: 'study',
      parentId: 'study-will-cabinet',
      type: 'item',
      label: 'Mastermind\'s Seal',
      narrative: 'You take the heavy brass Mastermind\'s Seal.',
      rewardItem: 'study-master-seal',
      children: []
    },

    // Glass Conservatory Nodes
    {
      id: 'cons-scytale-helper',
      locationId: 'conservatory',
      parentId: null,
      type: 'dialogue',
      label: 'Fallen Pillar',
      narrative: 'A mossy stone pillar has fallen near the path. A carving shows a strip of leather wrapped around a wooden staff. The text reads:\n\n"A staff of size N winds the leather, making letters align vertically every N steps. Read along the length of the staff to reveal the words."',
      children: []
    },
    {
      id: 'cons-plants',
      locationId: 'conservatory',
      parentId: null,
      type: 'locked',
      label: 'Exotic Cabinet',
      lockedByItem: 'study-cabinet-key',
      lockedNarrative: 'An exotic plant cabinet is locked behind a glass door. The keyway is leaf-shaped.',
      narrative: 'You unlock the display cabinet. Damp mist spills out, revealing a rolled strip of leather and a brass cylinder.',
      children: ['cons-scytale']
    },
    {
      id: 'cons-scytale',
      locationId: 'conservatory',
      parentId: 'cons-plants',
      type: 'puzzle',
      label: 'Scytale Parchment',
      narrative: 'The leather strip is covered in scrambled letters.',
      question: 'The letters read:\n\n| D N S X I T O X G H I X I E L X\n\nA small brass cylinder lies beside it. The inscription reads: "Wrap the leather around the rod of circumference 4."',
      answer: 'diginthesoil',
      hints: [
        'This is a Scytale cipher. Arrange the letters in columns of height 4 (the circumference).',
        'Grid:\nD I G I\nN T H E\nS O I L\nX X X X',
        'Read row by row: D-I-G-I-N-T-H-E-S-O-I-L. Enter diginthesoil.'
      ],
      children: ['cons-locker-key-node']
    },
    {
      id: 'cons-locker-key-node',
      locationId: 'conservatory',
      parentId: 'cons-scytale',
      type: 'item',
      label: 'Locker Key',
      narrative: 'A compartment under the cylinder opens, containing a key labeled "Locker Key".',
      rewardItem: 'cellar-locker-key',
      children: []
    },
    {
      id: 'cons-statue',
      locationId: 'conservatory',
      parentId: null,
      type: 'dialogue',
      label: 'Maiden Statue',
      narrative: 'A stone statue of a maiden holds a weeping vase over a circular pool of water.',
      children: ['cons-fountain']
    },
    {
      id: 'cons-fountain',
      locationId: 'conservatory',
      parentId: 'cons-statue',
      type: 'puzzle',
      label: 'Dripping Basin',
      narrative: 'Water drops from the maiden\'s vase into the pool below. Listen to the rhythmic pattern of the drips.',
      question: 'The stone basin is engraved with three number slots: _ _ _.\n\nListen to the dripping rhythm.',
      answer: '324',
      hints: [
        'Listen to the beats. Count how many times the water drips before each long pause.',
        'There are three quick drips, a pause, two quick drips, a pause, and four quick drips, followed by a long silence.',
        'The pattern is 3, 2, 4. Enter 324.'
      ],
      sound: {
        type: 'rhythm',
        notes: [
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 600, rest: true },
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 600, rest: true },
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 200, rest: false },
          { pitch: 'C4', dur: 1000, rest: true }
        ]
      },
      children: ['cons-fountain-plaque-node']
    },
    {
      id: 'cons-fountain-plaque-node',
      locationId: 'conservatory',
      parentId: 'cons-fountain',
      type: 'item',
      label: 'Stone Plaque',
      narrative: 'A stone plaque rises from the basin floor, engraved with the number 324. Below it reads: "Fountain Volume."',
      rewardItem: 'cons-fountain-plaque',
      children: []
    },
    {
      id: 'cons-sundial',
      locationId: 'conservatory',
      parentId: null,
      type: 'dialogue',
      label: 'Stone Sundial',
      narrative: 'A large stone sundial stands in the center of the conservatory.',
      children: ['cons-sundial-puzzle']
    },
    {
      id: 'cons-sundial-puzzle',
      locationId: 'conservatory',
      parentId: 'cons-sundial',
      type: 'puzzle',
      label: 'Pedestal Grid',
      narrative: 'The sundial\'s pedestal is marked with a grid of columns and rows.',
      question: 'The pedestal grid shows:\n\n|          5 1 1 1 5\n|        +-----------+\n|   1, 1 | . . . . . |\n|   1, 1 | . . . . . |\n|     5  | . . . . . |\n|   1, 1 | . . . . . |\n|   1, 1 | . . . . . |\n|        +-----------+\n\nShade the grid to reveal a single capital letter.',
      answer: 'h',
      hints: [
        'This is a 5x5 Nonogram. The column clues are at the top, row clues on the left.',
        'Col 1 is fully shaded (5). Col 5 is fully shaded (5). Row 3 is fully shaded (5). All other cells remain empty.',
        'This draws a giant letter H. Enter h.'
      ],
      children: ['cons-sundial-clue']
    },
    {
      id: 'cons-sundial-clue',
      locationId: 'conservatory',
      parentId: 'cons-sundial-puzzle',
      type: 'dialogue',
      label: 'Sundial Clue',
      narrative: 'The shadow aligns, revealing a symbol: "The shadow points to the letter H."',
      children: []
    },
    {
      id: 'cons-planter',
      locationId: 'conservatory',
      parentId: null,
      type: 'locked',
      label: 'Soil Planter',
      lockedByItem: 'cons-trowel',
      lockedNarrative: 'A raised soil planter is overgrown with thick weeds. A gardening tool is required to dig through it.',
      narrative: 'You dig through the soil with the brass trowel, uncovering a locked brass box.',
      children: ['cons-soilbox']
    },
    {
      id: 'cons-soilbox',
      locationId: 'conservatory',
      parentId: 'cons-planter',
      type: 'puzzle',
      label: 'Plant Layout',
      narrative: 'The brass box has a plant grid containing Rose (R), Orchid (O), Lily (L), and Tulip (T). Fill the gaps, then read the four unknown values in order (A, B, C, D) for the code.',
      question: 'The plant layout grid shows:\n\n+---+---+---+---\n| R | A |   | T |\n+---+---+---+---\n| B | T |   | O |\n+---+---+---+---\n| O | R | C |   |\n+---+---+---+---\n|   | L | O | D |\n+---+---+---+---',
      answer: 'oltr',
      hints: [
        'Each plant appears exactly once per row and column. Row 1 has R and T — A must be O.',
        'Row 2 has T and O, and column 1 already has R. So B must be L, and (2,3) becomes R.',
        'Continue row by row: fill the only missing plant in each row and column. A,B,C,D spells O,L,T,R — enter oltr.'
      ],
      children: ['cons-cellar-tap-node']
    },
    {
      id: 'cons-cellar-tap-node',
      locationId: 'conservatory',
      parentId: 'cons-soilbox',
      type: 'item',
      label: 'Brass Tap',
      narrative: 'The brass box opens, containing a heavy brass barrel tap.',
      rewardItem: 'cellar-tap',
      children: []
    },

    // Wine Cellar & Vault Nodes
    {
      id: 'cellar-racks',
      locationId: 'wine-cellar',
      parentId: null,
      type: 'dialogue',
      label: 'Dusty Wine Racks',
      narrative: 'Neat iron racks line the walls, filled with dusty, cobwebbed wine bottles.',
      children: ['cellar-ledger']
    },
    {
      id: 'cellar-ledger',
      locationId: 'wine-cellar',
      parentId: 'cellar-racks',
      type: 'puzzle',
      label: 'Winery Ledger',
      narrative: 'An old leather ledger lies open on the wine rack. A turning paper grille with cutouts lies on top of a letter matrix. A dark ink smudge covers the very last letter of the ledger, leaving it obscured.',
      question: 'The ledger shows a letter grid:\n\n| S L S E\n| C T B U\n| U S E R\n| S P I T\n\nThe grille is marked with cutouts at:\n\n| X . . .\n| . . . X\n| . X . .\n| . X . .\n\nThe code is revealed by rotating the grille 90 degrees clockwise after reading each word.',
      answer: 'suspectisbutler',
      hints: [
        'Read the letters through the cutouts in the default orientation (Orientation 0): (1,1)=S, (2,4)=U, (3,2)=S, (4,2)=P. Word 1 is susp.',
        'Rotate the grille 90 degrees clockwise. The new cutouts reveal (1,4)=E, (2,1)=C, (2,2)=T, (4,3)=I. Word 2 is ecti.',
        'Perform all 4 rotations to get: susp, ecti, sbut, lers. Concatenated, it spells suspectisbutlers. However, the last letter is smudged, so omit the final s. Enter suspectisbutler.'
      ],
      children: ['cellar-ledger-note']
    },
    {
      id: 'cellar-ledger-note',
      locationId: 'wine-cellar',
      parentId: 'cellar-ledger',
      type: 'dialogue',
      label: 'Ledger Note',
      narrative: 'A private letter from Lord Blackwood is slipped inside the ledger: "The Atbash key to my will is correct, but my paranoia forced me to reverse the final letters of the heir\'s name to baffle intruders."',
      children: []
    },
    {
      id: 'cellar-lockers',
      locationId: 'wine-cellar',
      parentId: null,
      type: 'locked',
      label: 'Suspect Lockers',
      lockedByItem: 'cellar-locker-key',
      lockedNarrative: 'A row of suspect lockers is locked by a heavy brass chain. It requires the locker key.',
      narrative: 'You unlock the chain, allowing you to examine the individual lockers.',
      children: ['cellar-lockers-puzzle']
    },
    {
      id: 'cellar-lockers-puzzle',
      locationId: 'wine-cellar',
      parentId: 'cellar-lockers',
      type: 'puzzle',
      label: 'Locker Code',
      narrative: 'Five lockers are labeled with letters: G, H, I, J, K.',
      question: 'A note states:\n\n"The Doctor is to the left of the Chef.\nThe Butler is not on either end.\nThe Maid is to the right of the Lawyer.\nThe Chef is in Locker J.\nLocker H is the shadow of the Sundial."\n\nThe keypad on the last locker (K) expects the first letter of each suspect\'s name from locker G to K.',
      answer: 'lbdcm',
      hints: [
        'Locker H corresponds to the shadow of the sundial, which is H.',
        'Chef is at J. The Doctor is to the left of Chef, so Doctor is at I. Butler is not on either end (not G or K), so Butler is at H. Since Maid is to the right of Lawyer, Lawyer must be at G, and Maid at K.',
        'The order G to K is: Lawyer (L), Butler (B), Doctor (D), Chef (C), Maid (M). The code is lbdcm.'
      ],
      children: ['cellar-desk-key-node']
    },
    {
      id: 'cellar-desk-key-node',
      locationId: 'wine-cellar',
      parentId: 'cellar-lockers-puzzle',
      type: 'item',
      label: 'Desk Key',
      narrative: 'Locker K swings open, revealing Lord Blackwood\'s desk key.',
      rewardItem: 'study-desk-key',
      children: []
    },
    {
      id: 'cellar-barrel',
      locationId: 'wine-cellar',
      parentId: null,
      type: 'locked',
      label: 'Heavy Oak Barrel',
      lockedByItem: 'cellar-tap',
      lockedNarrative: 'A massive wine barrel has a tap hole, but the tap is missing.',
      narrative: 'You fit the brass tap into the barrel, allowing you to draw a sample of the wine.',
      children: ['cellar-barrel-puzzle']
    },
    {
      id: 'cellar-barrel-puzzle',
      locationId: 'wine-cellar',
      parentId: 'cellar-barrel',
      type: 'puzzle',
      label: 'Poison Dilution',
      narrative: 'The sample cup contains dark wine with a heavy scent of bitter almonds (cyanide).',
      question: 'A chalk message on the barrel reads:\n\n"To neutralize the arsenic and safely retrieve the key, calculate the required dilution percentage.\n\nDilution % = (Fountain Volume * 100) / Barrel Capacity\n\nThe barrel capacity is exactly 540 liters."\n\nThe keypad awaits the percentage integer.',
      answer: '60',
      hints: [
        'Get the Fountain Volume from the Stone Plaque found in the Conservatory fountain: it is 324.',
        'Perform the math: (324 * 100) / 540 = 32400 / 540.',
        'The result is 60. Enter 60.'
      ],
      children: ['cellar-vault-key-node']
    },
    {
      id: 'cellar-vault-key-node',
      locationId: 'wine-cellar',
      parentId: 'cellar-barrel-puzzle',
      type: 'item',
      label: 'Vault Key',
      narrative: 'A secret valve in the barrel releases a small waterproof container. Inside is a heavy iron vault key.',
      rewardItem: 'cellar-vault-key',
      children: []
    },
    {
      id: 'cellar-vault-door',
      locationId: 'wine-cellar',
      parentId: null,
      type: 'locked',
      label: 'Secret Vault Door',
      lockedByItem: 'cellar-vault-key',
      lockedNarrative: 'The vault door is made of solid steel and requires the vault key.',
      narrative: 'You unlock the steel vault door, revealing a small, reinforced inner chamber.',
      children: ['cellar-inner-sanctum']
    },
    {
      id: 'cellar-inner-sanctum',
      locationId: 'wine-cellar',
      parentId: 'cellar-vault-door',
      type: 'locked',
      label: 'Inner Sanctum',
      lockedByItem: 'study-master-seal',
      lockedNarrative: 'A secondary gate inside the vault has an indentation shaped like a crest or seal. It requires the Mastermind\'s Seal.',
      narrative: 'You place the Mastermind\'s Seal into the indentation. The gate slides open.',
      children: ['cellar-console']
    },
    {
      id: 'cellar-console',
      locationId: 'wine-cellar',
      parentId: 'cellar-inner-sanctum',
      type: 'puzzle',
      label: 'Terminal Console',
      isMeta: true,
      narrative: 'The mastermind\'s terminal displays a glowing green prompt.',
      question: 'The prompt reads:\n\nCONFIRM DOSSIER DETAILS:\n1. SUSPECT ROLE (Ledger)\n2. WEAPON/METHOD (Will)\n3. CRIME LOCATION (Diary)\n4. DOSSIER KEY (Safe Code + Fountain Code + Barrel Code)\n\nEnter the full sequence concatenated (lowercase, no spaces).',
      answer: 'butlerpoisoncellar1835',
      hints: [
        'Mild poison is cyanide. Weapon/method is poison. Crime location is cellar.',
        'The dossier key is Safe Code (1451) + Fountain Code (324) + Barrel Code (60) = 1835.',
        'Concatenate the answers: butler + poison + cellar + 1835. Enter butlerpoisoncellar1835.'
      ],
      children: []
    }
  ]
};

export default data;
