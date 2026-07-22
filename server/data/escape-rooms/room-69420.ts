import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'room-69420',
  name: 'Room 69420',
  description: 'A haunted room in the abandoned Greyfield Children\'s Home, stalked by the spirit of a boy named Gab who died within its walls. Decipher his final messages to free his soul.',
  difficulty: 'medium',
  intro: 'Room 69420 sits at the dead end of the Greyfield Children\'s Home, behind a door scarred with fingernail scratches. They say a boy named Gab died here — not quickly, and not kindly — and that some part of him never left.\n\nThe door swings open before you touch it. A cold breath carries a child\'s whisper: "...help me remember..." You step inside. The door slams shut, and the lock clicks home.\n\nTo free Gab, you must walk through his final night.',
  locations: [
    {
      id: 'threshold',
      name: 'The Threshold',
      description: 'A narrow entryway wallpapered in peeling lambs and faded stars. A child\'s drawings are pinned everywhere. The air smells of old crayons and something darker. A tarnished brass number — 69420 — hangs from a single bent nail on the doorframe. Two doors lead deeper: one to the bedroom, one sealed shut.'
    },
    {
      id: 'bedroom',
      name: 'Gab\'s Bedroom',
      description: 'A small, cold bedroom frozen in time. A race-car bed, a half-built solar-system mobile, a music box, and walls covered in crayon. The number 69420 has been scratched into the floorboards beside the bed, over and over. In the far corner, a door has been wallpapered over — someone wanted it forgotten.'
    },
    {
      id: 'heart',
      name: 'The Heart of the Room',
      description: 'The wallpaper has been torn away to reveal a second door, and beyond it a windowless chamber. A single bare bulb swings overhead. A faded case file lies on the floor — "WARD 69420 — GAB" stamped in red across the cover. Here Gab\'s voice is loudest, and the truth of his last night waits to be spoken aloud.'
    }
  ],
  nodes: [
    // ===== THE THRESHOLD =====

    {
      id: 'th-wall-plaster',
      locationId: 'threshold',
      parentId: null,
      type: 'puzzle',
      label: 'Wall Plaster',
      narrative: 'You cross the threshold. Lambs and stars peel from the walls. In a child\'s uneven hand, a single phrase has been gouged into the plaster with a fingernail — some letters pressed far deeper than the rest.',
      question: 'The gouged phrase reads:\n\n"tHe End of Lost Play."\n\nWhat was Gab trying to tell you?',
      answer: 'HELP',
      hints: [
        'Not every letter was cut with the same force. Some are larger and carved deeper into the plaster.',
        'The oversized letters, read in order, are H, E, L, P.',
        '"tHe End of Lost Play" — the deeper capitals spell H-E-L-P.'
      ],
      children: ['th-alphabet-codex']
    },
    {
      id: 'th-alphabet-codex',
      locationId: 'threshold',
      parentId: 'th-wall-plaster',
      type: 'dialogue',
      label: 'Alphabet Codex',
      narrative: 'The plaster crumbles as Gab\'s message fades. In its place, a child\'s hand scratches the alphabet into the wall — each letter numbered beneath:\n\nA=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8  I=9  J=10\nK=11 L=12 M=13 N=14 O=15 P=16 Q=17 R=18 S=19 T=20\nU=21 V=22 W=23 X=24 Y=25 Z=26\n\nScrawled beneath in red crayon: "the alphabet knows my pain."',
      children: []
    },

    {
      id: 'th-letter-blocks',
      locationId: 'threshold',
      parentId: null,
      type: 'puzzle',
      label: 'Letter Blocks',
      narrative: 'Four wooden letter-blocks are scattered across the floor beneath the pinned drawings — the kind a small child stacks to spell their first words. Beside them, a crayon drawing is tacked low to the wall, too low for an adult\'s reach.',
      question: 'The blocks read: M, T, O, B.\nThe drawing shows a stone chamber sunk beneath the earth — a structure built to hold the dead.\n\nWhat word do they form?',
      answer: 'TOMB',
      hints: [
        'The crayon drawing shows a subterranean vault. The four letter blocks can be rearranged to name that burial chamber.',
        'M, T, O, B rearrange to T-O-M-B.',
        'The only four-letter word these blocks can form is TOMB.'
      ],
      children: ['th-floorboard-reveal']
    },
    {
      id: 'th-floorboard-reveal',
      locationId: 'threshold',
      parentId: 'th-letter-blocks',
      type: 'dialogue',
      label: 'Loose Floorboard',
      narrative: 'The blocks tumble into formation, clicking against the warped floor. One floorboard beneath them rattles loose — its nails rusted through. Peeling it back reveals a shallow recess.',
      children: ['th-brass-key']
    },
    {
      id: 'th-brass-key',
      locationId: 'threshold',
      parentId: 'th-floorboard-reveal',
      type: 'item',
      label: 'Small Brass Key',
      narrative: 'A tiny brass key rests in the dust, its bow shaped like a musical note. It looks like it belongs to a music box or a child\'s wind-up toy.',
      rewardItem: 'brass-key'
    },

    {
      id: 'th-number-carvings',
      locationId: 'threshold',
      parentId: null,
      type: 'puzzle',
      label: 'Number Carvings',
      narrative: 'Beside the bedroom door, three numbers have been gouged into the wooden frame with the same desperate force as the plaster scrawl. A fresh stroke of red crayon arrows toward the numbered alphabet scratched into the nearby wall.',
      question: '3 — 18 — 25\n\nWhat word does Gab want you to speak?',
      answer: 'CRY',
      hints: [
        'The alphabet has twenty-six letters. Gab scratched a numbered reference chart into the wall plaster — look for it elsewhere in this room.',
        '3 = C, 18 = R, 25 = Y.',
        '3 is the third letter (C), 18 is the eighteenth (R), 25 is the twenty-fifth (Y) — together they spell CRY.'
      ],
      children: ['th-teardrop-key']
    },
    {
      id: 'th-teardrop-key',
      locationId: 'threshold',
      parentId: 'th-number-carvings',
      type: 'item',
      label: 'Teardrop Latch Key',
      narrative: 'As you speak the word, the latch on the bedroom door shudders. A teardrop-shaped key falls from the mechanism into your palm, still cold.',
      rewardItem: 'teardrop-latch-key'
    },

    {
      id: 'th-crayon-wall',
      locationId: 'threshold',
      parentId: null,
      type: 'dialogue',
      label: 'Crayon Drawings Wall',
      narrative: 'The wall beside the doorframe is a gallery of Gab\'s childhood. Dozens of crayon drawings are pinned with rusted tacks — stick figures, a race car, a music box, a dark shape with red eyes. Two drawings stand out.\n\nOne shows two calendars side by side. "I ARRIVED" is written above the first, marked MCMLXXIII. "I LEFT" is written above the second, marked MCMLXXXVI.\n\nPinned beside the drawings is a faded educational poster from the children\'s home:\n"ROMAN NUMERALS — Learn to Count Like the Ancients!"\nI=1  V=5  X=10  L=50  C=100  D=500  M=1000\nExamples: IV=4  IX=9  XL=40  XC=90  CM=900\nMCMLXXIII = M(1000) + CM(900) + L(50) + X(10) + X(10) + III(3) = 1973',
      children: ['th-calendar-puzzle']
    },
    {
      id: 'th-calendar-puzzle',
      locationId: 'threshold',
      parentId: 'th-crayon-wall',
      type: 'puzzle',
      label: 'Calendar Drawing',
      narrative: 'Beneath the two calendar drawings, a line of red crayon has been pressed into the wallpaper so hard the wax is raised from the paper — a final question Gab never got to ask aloud.',
      question: 'How old was Gab when he died?',
      answer: '13',
      hints: [
        'The educational poster above the drawings shows how to read Roman numerals. Trace each symbol and add the values.',
        'MCMLXXIII = 1973. MCMLXXXVI = 1986. Subtract the earlier year from the later one.',
        'Gab was born in 1973 and died in 1986 — he was 13 years old.'
      ],
      children: ['th-calendar-back']
    },
    {
      id: 'th-calendar-back',
      locationId: 'threshold',
      parentId: 'th-calendar-puzzle',
      type: 'dialogue',
      label: 'Hidden Recess',
      narrative: 'The calendar drawing\'s backing peels away from the wall — a hidden recess behind the paper, black with years of dust. Something glints inside.',
      children: ['th-age-key']
    },
    {
      id: 'th-age-key',
      locationId: 'threshold',
      parentId: 'th-calendar-back',
      type: 'item',
      label: 'Numbered Key',
      narrative: 'A small metal key shaped like the number 13. The children\'s home must have assigned numbered keys to each ward — this one was Gab\'s.',
      rewardItem: 'age-key'
    },

    {
      id: 'th-doorframe-carving',
      locationId: 'threshold',
      parentId: null,
      type: 'puzzle',
      label: 'Doorframe Carving',
      narrative: 'The doorframe beside the bedroom entrance bears a scratched inscription — four letters dug into the wood with desperate force, deeper than any of Gab\'s drawings. Beneath them, in faded red crayon: "speak the truth backward."',
      question: 'The carved letters:\n\nK  I  Z  B\n\nWhat word was Gab trying to say?',
      answer: 'PRAY',
      hints: [
        'The message says "speak the truth backward." Gab\'s race-car bed headboard — in the bedroom beyond — has a chart pairing each letter with its mirror opposite.',
        'K pairs with P, I with R, Z with A, B with Y. Read the mirrored letters in order.',
        'K becomes P, I becomes R, Z becomes A, B becomes Y — the Atbash cipher gives you PRAY.'
      ],
      children: ['th-silver-locket']
    },
    {
      id: 'th-silver-locket',
      locationId: 'threshold',
      parentId: 'th-doorframe-carving',
      type: 'item',
      label: 'Silver Locket',
      narrative: 'From a crack in the doorframe, a small silver locket drops into your hand — warm, as if held moments ago. The clasp springs open. Inside, a child\'s faded photograph and a lock of dark hair.\n\nAs your fingers brush the silver surface, Gab\'s voice surrounds you — clearer now, almost alive:\n\n"They called my room HAUNTed. They were right. Say my name — please, say it for me."',
      rewardItem: 'silver-locket'
    },

    {
      id: 'th-bedroom-door',
      locationId: 'threshold',
      parentId: null,
      type: 'locked',
      label: 'Bedroom Door',
      narrative: 'The teardrop latch clicks open and the heavy door swings inward. A cold draft rushes out, carrying the smell of old crayons, dust, and something metallic.',
      lockedNarrative: 'A heavy door leads deeper into the children\'s home. It is barred by a latch shaped like a teardrop — the mechanism refuses to budge. A keyhole glints beneath the tear.',
      lockedByItem: 'teardrop-latch-key',
      children: ['th-to-bedroom']
    },
    {
      id: 'th-to-bedroom',
      locationId: 'bedroom',
      parentId: 'th-bedroom-door',
      type: 'dialogue',
      label: 'Enter the Bedroom',
      narrative: 'You step through the doorway into a small, cold bedroom frozen in time. The number 69420 has been scratched into the floorboards beside the bed, over and over — Gab marking his own existence.',
      children: []
    },

    // ===== GAB'S BEDROOM =====

    {
      id: 'bed-headboard',
      locationId: 'bedroom',
      parentId: null,
      type: 'dialogue',
      label: 'Race-Car Bed Headboard',
      narrative: 'The headboard of the race-car bed is carved with a strange chart, worn smooth by years of small fingers tracing its surface:\n\n|A B C D E F G H I J K L M\n|Z Y X W V U T S R Q P O N\n\nEach letter sits directly above or below another — the alphabet folded in half, every letter paired with its mirror opposite. A child\'s uneven carving reads: "spell your fears backward."',
      children: []
    },

    {
      id: 'bed-music-box',
      locationId: 'bedroom',
      parentId: null,
      type: 'locked',
      label: 'Music Box',
      narrative: 'The brass key fits perfectly. You wind the music box and it stutters to life — a fractured, tuneless lullaby that hangs in the cold air. The lid creaks open.',
      lockedNarrative: 'A small wooden music box sits on the dresser, its paint chipped and faded. A winding keyhole is visible on the side — the key is missing.',
      lockedByItem: 'brass-key',
      children: ['bed-music-box-interior']
    },
    {
      id: 'bed-music-box-interior',
      locationId: 'bedroom',
      parentId: 'bed-music-box',
      type: 'dialogue',
      label: 'Inside the Music Box',
      narrative: 'Two slips of paper rest inside the velvet-lined interior.\n\nThe first, in a child\'s careful hand, is a folded grid — the alphabet written out in twenty-six rows, each row starting one letter later than the last. A note on the grid reads: "To find the true letter, go to the row of the key letter and find the cipher letter within it. The column it sits in gives you the true letter."\n\nThe second slip, in an adult\'s rigid hand: "His true name is locked here. The word they whisper is the key." An eight-letter ciphertext is scribbled beneath.',
      children: ['bed-vigenere-teaching', 'bed-true-name']
    },
    {
      id: 'bed-vigenere-teaching',
      locationId: 'bedroom',
      parentId: 'bed-music-box-interior',
      type: 'dialogue',
      label: 'Vigenère Decoding Guide',
      narrative: 'You study the cipher card more closely. A worked example is scribbled in the margin in a child\'s hand — Gab must have practised this:\n\n"To decode, match each letter of the cipher to the key:\n\n      Key: B\n  Cipher: B C D\n\nFor the first letter: go to row B (the key letter), find B in that row, then look up to the top of its column. The column header is A.\n\nFor the second: row B again (key repeats), find C → column header is B.\n\nFor the third: row B, find D → column header is C.\n\nSo BCD with key B = ABC."\n\nBelow the example, Gab added: "8 letters. Key is 5 letters. Repeat the key."',
      children: []
    },
    {
      id: 'bed-true-name',
      locationId: 'bedroom',
      parentId: 'bed-music-box-interior',
      type: 'puzzle',
      label: 'The Hidden Name',
      narrative: 'The ciphertext slip is clutched beneath the grid — eight letters inscribed with a trembling hand. The adult\'s note is folded over it: "the word they whisper is the key."\n\nYou remember Gab\'s voice from the locket — the word he whispered.',
      question: 'Ciphertext: NAVLKPUM\nKey: HAUNT\n\nWhat is the boy\'s full name?',
      answer: 'GABYRIUS',
      hints: [
        'The Vigenère decoding guide — also inside the music box — walks through a full example. You also need the five-letter key: Gab whispered it when you opened the silver locket in the threshold.',
        'N in key row H = G, A in row A = A, V in row U = B, L in row N = Y, K in row T = R, P in row H = I, U in row A = U, M in row T = S.',
        'GABYRIUS — at last, the boy\'s full name.'
      ],
      children: ['bed-name-token']
    },
    {
      id: 'bed-name-token',
      locationId: 'bedroom',
      parentId: 'bed-true-name',
      type: 'item',
      label: 'Name Pendant',
      narrative: 'Beneath the solved cipher, a small wooden pendant slides from a hidden compartment in the music box lid. Gab\'s full name is burned into the wood in a child\'s careful script: GABYRIUS.',
      rewardItem: 'name-token'
    },

    {
      id: 'bed-poem-wall',
      locationId: 'bedroom',
      parentId: null,
      type: 'puzzle',
      label: 'Poem Wall',
      narrative: 'One wall is covered in a crayon poem, each line in a different colour. Below it, a note in a woman\'s hand has been pinned: "she said the first step is always the most important."',
      question: 'The poem reads:\n\nDarkness fills my little room,\nEvery shadow wears his face,\nAnd though I try not to be afraid,\nThe door still opens in the night,\nHush now — he is coming up the stairs.\n\nWhat word does Gab hide?',
      answer: 'DEATH',
      hints: [
        'The note says the first step is always the most important. Look at how each line of the poem begins.',
        'The first letter of each line: D, E, A, T, H.',
        'Darkness → D, Every → E, And → A, The → T, Hush → H. Together: DEATH.'
      ],
      children: ['bed-death-page']
    },
    {
      id: 'bed-death-page',
      locationId: 'bedroom',
      parentId: 'bed-poem-wall',
      type: 'item',
      label: 'Torn Poem Page',
      narrative: 'The corner of the poem wall peels away — a torn journal page hidden beneath. It matches the poem above, but the handwriting is older, heavier. An adult wrote these words first. Gab only copied them. The torn edge forms a distinct jagged pattern.',
      rewardItem: 'death-poem-page'
    },

    {
      id: 'bed-science-workbook',
      locationId: 'bedroom',
      parentId: null,
      type: 'puzzle',
      label: 'Science Workbook',
      narrative: 'A half-built solar-system mobile hangs crooked from the ceiling. Beside it lies a science workbook open to the periodic table. One element is circled in red crayon over and over, the paper nearly worn through. Beneath it Gab scratched a label: "O — the breath I lost."',
      question: 'How many protons left Gab when he lost his breath?',
      answer: '8',
      hints: [
        'The science workbook is open to the periodic table. Oxygen — the breath we breathe — has a number all its own on the chart.',
        'O is the chemical symbol for oxygen. Its atomic number — equal to its proton count — is 8.',
        'Oxygen is element 8 on the periodic table. Eight protons left Gab.'
      ],
      children: ['bed-element-scrap']
    },
    {
      id: 'bed-element-scrap',
      locationId: 'bedroom',
      parentId: 'bed-science-workbook',
      type: 'item',
      label: 'Periodic Table Card',
      narrative: 'The workbook\'s margin tears away — a stiff periodic table card with handwritten notations. Gab circled oxygen so many times the crayon wax is thick enough to feel. "8," he wrote beneath it. "8 protons. 8 years before I learned to count the silence."',
      rewardItem: 'element-scrap'
    },

    {
      id: 'bed-wardrobe',
      locationId: 'bedroom',
      parentId: null,
      type: 'locked',
      label: 'Wardrobe',
      narrative: 'The numbered key slots into the clock-face latch and it spins free. The wardrobe creaks open, releasing the smell of mothballs and forgotten clothes.',
      lockedNarrative: 'A tall wooden wardrobe stands against the wall, its latch frozen in the shape of a clock face. A child\'s number lock is built into the mechanism — it expects a two-digit number.',
      lockedByItem: 'age-key',
      children: ['bed-wardrobe-contents']
    },
    {
      id: 'bed-wardrobe-contents',
      locationId: 'bedroom',
      parentId: 'bed-wardrobe',
      type: 'dialogue',
      label: 'Wardrobe Contents',
      narrative: 'Small shirts and trousers hang in neat rows — all too small for anyone older than thirteen. Folded at the bottom is a diary page, creased soft as cloth. An adult\'s red pen has circled one phrase where two words press together. In the margin: "a verdict, three letters."',
      children: ['bed-sin-puzzle']
    },
    {
      id: 'bed-sin-puzzle',
      locationId: 'bedroom',
      parentId: 'bed-wardrobe-contents',
      type: 'puzzle',
      label: 'The Verdict',
      narrative: 'You unfold the diary page. The handwriting is Gab\'s — small and shaky, pressed so hard the letters have embossed the paper from the other side. The red circle encloses the spot where two words collide in the middle of a paragraph about what the staff called him.',
      question: 'The circled phrase reads:\n\n"...he calls thiS INnocent..."\n\nWhat is the three-letter word?',
      answer: 'SIN',
      hints: [
        'A verdict hidden where two words meet. Look at the capital letters at the boundary of the circled phrase.',
        'thiS INnocent — the capitals where the words touch are S, I, N.',
        'The capital letters at the boundary of "thiS" and "INnocent" spell SIN.'
      ],
      children: ['bed-guilt-token']
    },
    {
      id: 'bed-guilt-token',
      locationId: 'bedroom',
      parentId: 'bed-sin-puzzle',
      type: 'item',
      label: 'Guilt Token',
      narrative: 'A small iron token drops from the folded note — stamped with a single word on one side: "GUILTY." The other side bears the Greyfield Children\'s Home crest. This was used in some kind of disciplinary ritual.',
      rewardItem: 'guilt-token'
    },

    {
      id: 'bed-wallpaper-door',
      locationId: 'bedroom',
      parentId: null,
      type: 'locked',
      label: 'Wallpaper Door',
      narrative: 'You press the iron token against the wallpaper. It adheres to the surface like a magnet finding metal beneath. The wallpaper splits, revealing a heavy wooden door — but it does not open. Faded lines from Gab\'s poem are inscribed across its surface, and a second lock is cut into the wood: a narrow slot shaped like a torn page corner.',
      lockedNarrative: 'The far corner of the bedroom has been wallpapered over with the same lambs-and-stars pattern as the threshold. Faint scratch marks score the surface — someone tried to claw through from the other side. An indentation in the paper matches a small iron token.',
      lockedByItem: 'guilt-token',
      children: ['bed-poem-seal']
    },
    {
      id: 'bed-poem-seal',
      locationId: 'bedroom',
      parentId: 'bed-wallpaper-door',
      type: 'locked',
      label: 'Poem Seal',
      narrative: 'The torn poem page slides into the slot — the jagged edges match perfectly. The poem inscribed on the door glows faintly, then the first lock disengages with a soft click. Beneath it, a third lock emerges: a wooden faceplate carved with a child\'s nameplate, still blank.',
      lockedNarrative: 'Lines from Gab\'s poem are inscribed across the door\'s surface — Darkness... Every... And... The... Hush... A narrow slot beneath the final verse matches the torn edge of a page.',
      lockedByItem: 'death-poem-page',
      children: ['bed-name-seal']
    },
    {
      id: 'bed-name-seal',
      locationId: 'bedroom',
      parentId: 'bed-poem-seal',
      type: 'locked',
      label: 'Name Seal',
      narrative: 'The wooden name pendant slots into the blank faceplate. The letters G-A-B-Y-R-I-U-S burn themselves into the wood, one by one. With a deep resonant clank, the door unlocks and swings open into darkness.',
      lockedNarrative: 'A blank wooden faceplate is set into the door where a name should be — the shape of a small pendant is recessed into its centre.',
      lockedByItem: 'name-token',
      children: ['bed-to-heart']
    },
    {
      id: 'bed-to-heart',
      locationId: 'heart',
      parentId: 'bed-name-seal',
      type: 'dialogue',
      label: 'Enter the Heart',
      narrative: 'You step through the unlocked door into a windowless chamber. A single bare bulb swings overhead, casting jagged shadows. The air is thicker here — Gab\'s presence is almost solid.',
      children: []
    },

    // ===== THE HEART =====

    {
      id: 'heart-charred-dictionary',
      locationId: 'heart',
      parentId: null,
      type: 'puzzle',
      label: 'Charred Dictionary Page',
      narrative: 'On a pedestal at the centre of the chamber rests a single charred page torn from a dictionary. One entry has been underlined in soot — the paper around it is blackened and brittle.',
      question: 'The underlined entry reads:\n\n"What\'s left of a burning tree — or the tree itself (3)."',
      answer: 'ASH',
      hints: [
        'Some words wear two faces. Both a type of tree and what fire leaves behind share the same three-letter name.',
        'The word describes a kind of tree, and also the grey powder that remains after something burns.',
        'The three-letter word is ASH.'
      ],
      children: ['heart-ash-token']
    },
    {
      id: 'heart-ash-token',
      locationId: 'heart',
      parentId: 'heart-charred-dictionary',
      type: 'item',
      label: 'Ash Fragment',
      narrative: 'Gab\'s voice drifts through the chamber: "The tree... and what remains. Both of them, me." The charred page crumbles at its edge — a single blackened fragment, still warm, detaches in your hand.',
      rewardItem: 'ash-token'
    },

    {
      id: 'heart-word-chain',
      locationId: 'heart',
      parentId: null,
      type: 'puzzle',
      label: 'Word Chain',
      narrative: 'On the floor, a chain of words has been scratched into the wood in red crayon — each one almost identical to the last, changing by a single letter. The final word has been gouged out entirely, leaving splinters and a child\'s broken fingernail.',
      question: 'The scratched chain reads:\n\nMUST → MUSK → DUSK → ????\n\nGab\'s nail rests beneath the faded final link.',
      answer: 'DUST',
      hints: [
        'Each word is a single thread pulled from the one before it. The chain changes one letter at a time.',
        'DUSK becomes DUST — the K changes to a T.',
        'MUST → MUSK (T→K) → DUSK (M→D) → DUST (K→T).'
      ],
      children: ['heart-dust-token']
    },
    {
      id: 'heart-dust-token',
      locationId: 'heart',
      parentId: 'heart-word-chain',
      type: 'item',
      label: 'Dust Fragment',
      narrative: 'Gab\'s nail traces the floor one final time, sketching a ladder that fades at the bottom rung into a fine grey powder. "Everything ends the same way," he whispers. A small glass vial of grey powder rolls from beneath the floorboard — still sealed, still trembling.',
      rewardItem: 'dust-token'
    },

    {
      id: 'heart-case-file',
      locationId: 'heart',
      parentId: null,
      type: 'locked',
      label: 'Case File',
      narrative: 'The wax seal cracks as you wedge the stiff card beneath it. The folder springs open. Admission date: March 15, 1973. The intake form describes a frail boy with dark eyes who "refuses to speak his full name and responds only to Gab." Subsequent incident reports grow darker each year — a broken arm at seven, a locked closet at nine, a final entry stamped DECEASED: October 31, 1986. Cause of death: pending investigation.\n\nA final page has been added — not by Greyfield staff, but in a child\'s wobbly crayon:\n\n"They gave me a number. They took my name. They called me a verdict. The fire took what was left. The poem knew before I did. My name was locked in a song no one would play.\n\nSay what I became. Take the letters you\'ve already found."\n\nTucked behind the final page, two narrow slots are cut into the folder\'s backing — one blackened with soot, the other coated in fine grey powder.',
      lockedNarrative: 'A faded manila folder lies on the floor, stamped "WARD 69420 — GAB" in red ink across the cover. The file is sealed with a brittle wax stamp bearing the Greyfield Home crest — too thick to peel with bare fingers.',
      lockedByItem: 'element-scrap',
      children: ['heart-ash-barrier']
    },
    {
      id: 'heart-ash-barrier',
      locationId: 'heart',
      parentId: 'heart-case-file',
      type: 'locked',
      label: 'Ash Barrier',
      narrative: 'The blackened fragment slots into the soot-stained recess. The folder\'s backing shudders and a panel slides halfway aside — but a second slot remains sealed, its edges coated in pale grey.',
      lockedNarrative: 'Two narrow slots are cut into the backing of the case file folder. The first is blackened with soot, as if something burnt was meant to fit here. The second is coated in fine grey powder.',
      lockedByItem: 'ash-token',
      children: ['heart-dust-barrier']
    },
    {
      id: 'heart-dust-barrier',
      locationId: 'heart',
      parentId: 'heart-ash-barrier',
      type: 'locked',
      label: 'Dust Barrier',
      narrative: 'The glass vial crushes into the powder-coated slot. Pale grey dust fills the recess and the second panel slides away with a sigh. Behind the folder\'s backing, a final door is revealed — and at its centre, a narrow slot shaped like a child\'s locket.',
      lockedNarrative: 'The second slot is coated in fine grey powder. A glass vial would fit perfectly.',
      lockedByItem: 'dust-token',
      children: ['heart-final-door']
    },
    {
      id: 'heart-final-door',
      locationId: 'heart',
      parentId: 'heart-dust-barrier',
      type: 'locked',
      label: 'Final Door',
      narrative: 'The silver locket fits perfectly into the slot. The door glows softly — a warm, amber light — and swings open. Gab\'s voice surrounds you, fragile and tired, but no longer afraid: "say what I became... take what you\'ve already found..."',
      lockedNarrative: 'Behind the folder\'s backing, a small door is revealed — no handle, no lock, only a narrow slot the size and shape of a child\'s locket. The door hums faintly, waiting.',
      lockedByItem: 'silver-locket',
      children: ['heart-meta']
    },
    {
      id: 'heart-meta',
      locationId: 'heart',
      parentId: 'heart-final-door',
      type: 'puzzle',
      label: 'Speak What I Became',
      narrative: 'The bare bulb flares bright white, then settles to a warm, steady glow. A child\'s shadow stretches across the floor — your own — but for a moment, it looks smaller. Younger. At peace.\n\nThrough the open door, a stone tablet bears seven empty input boxes, each with a cryptic label.',
      question: 'Gab whispers:\n\n"Take the first breath of the name locked in song,\nthe third of what fire leaves behind,\nthe second of the chamber of the dead,\nthe third of the ladder\'s ending,\nand the fourth of what the poem spells."\n\nGab waits for you to speak.',
      answer: 'GHOST',
      hints: [
        'Gab scattered pieces of himself through every puzzle you solved. Each line points to a word you\'ve already spoken — take the letter at the position he asks for.',
        '"The name locked in song" is GABYRIUS (first letter: G). "What fire leaves behind" is ASH (third: H). "The chamber of the dead" is TOMB (second: O). "The ladder\'s ending" is DUST (third: S). "What the poem spells" is DEATH (fourth: T).',
        'GABYRIUS[1] = G, ASH[3] = H, TOMB[2] = O, DUST[3] = S, DEATH[4] = T. Together: GHOST.'
      ],
      isMeta: true,
      children: []
    }
  ]
};

export default data;
