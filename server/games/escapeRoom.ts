import type { Player, EscapeRoomGameState, EscapeRoomPuzzle, EscapeRoomData, EscapeRoomLocation, Room } from '../../src/types/shared.js';

export type { Player, EscapeRoomGameState, EscapeRoomPuzzle, EscapeRoomData, EscapeRoomLocation, Room };

const escapeRooms: Record<string, EscapeRoomData> = {
  'abandoned-lab': {
    id: 'abandoned-lab',
    name: 'The Abandoned Lab',
    description: 'A mysterious laboratory abandoned decades ago. Solve the puzzles left behind by the missing scientists to escape!',
    intro: 'You push open the rusted metal door and step inside. Dust particles dance in the faint light filtering through cracked windows. A flickering terminal on the reception desk crackles to life, displaying a message:\n\n"IF YOU ARE READING THIS, I AM ALREADY GONE. THE LAB IS LOCKED DOWN. FIND MY RESEARCH, SOLVE THE PUZZLES I LEFT BEHIND, AND ESCAPE BEFORE THEY COME BACK.\n— DR. HARRISON"\n\nThe terminal flickers and dies. You are trapped. The only way out is forward.',
    locations: [
      {
        id: 'foyer',
        name: 'The Foyer',
        description: 'A cramped reception area with a dusty desk, a bulletin board of faded notices, and a row of employee lockers. A reinforced door to the east has a digital keypad.',
      },
      {
        id: 'lab',
        name: 'The Laboratory',
        description: 'A sprawling lab filled with beakers, bubbling vials, and strange glowing substances. Diagrams of molecular structures cover the walls. A massive centrifuge hums quietly in the corner.',
      },
      {
        id: 'vault',
        name: 'The Vault',
        description: 'A heavy steel door groans open to reveal a small, windowless room. Server racks line the walls, their indicator lights blinking red. In the center stands a podium with a terminal — this must be where Dr. Harrison sealed everything away.',
      },
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
          'Read 51853 backwards: 3, 5, 8, 1, 5 → 35815.',
        ],
      },
      {
        id: 'foyer-2',
        locationId: 'foyer',
        narrative: 'Inside the drawer you find an employee badge and a small notebook listing staff names with star ratings. A row of lockers stands against the wall, each with a 2-digit combination lock.',
        question: 'The notebook reads:\nAlice — ★★★\nBob — ★\nCarol — ★★★★\nDave — ★★\nEve — ★★★★★\n\n"Dr. Harrison\'s lab assistant has the MOST stars. Their locker combination is: the number of letters in their name, followed by their number of stars."',
        answer: '35',
        hints: [
          'The person with the most stars is Eve (5 stars).',
          'Eve has 3 letters in her name, and 5 stars. The combination is 35.',
        ],
      },
      {
        id: 'foyer-3',
        locationId: 'foyer',
        narrative: 'The locker creaks open, revealing a lab coat, safety goggles, and a torn scrap of paper with symbols. The reinforced door to the east blocks your path — its keypad expects a 3-digit code.',
        question: 'The torn paper shows three equations scratched in pen:\n△ + ○ = 7\n○ + □ = 9\n□ + △ = 8\n\nSolve for each symbol, then enter them in order: Triangle, Circle, Square.',
        answer: '345',
        hints: [
          'Add all three equations together: 2(△ + ○ + □) = 24, so △ + ○ + □ = 12.',
          'Since ○ + □ = 9, △ must be 3. Then ○ = 4 and □ = 5. Code: 345.',
        ],
      },
      {
        id: 'lab-1',
        locationId: 'lab',
        narrative: 'The reinforced door clicks open. You step into a vast laboratory. Beakers bubble on hot plates and a luminescent blue liquid drips from a cracked flask overhead. On the central workbench, a dusty tablet displays a chemical puzzle.',
        question: 'The tablet screen reads:\n"H (1) + O (8) + C (6) + K (19) + Fe (26) = LOCK"\n\n"What is the sum of the atomic numbers?"',
        answer: '60',
        hints: [
          'Add up all the numbers in parentheses: 1 + 8 + 6 + 19 + 26.',
          '1 + 8 = 9, then 9 + 6 = 15, then 15 + 19 = 34, then 34 + 26 = 60.',
        ],
      },
      {
        id: 'lab-2',
        locationId: 'lab',
        narrative: 'A microscope on the far counter has a slide inserted. Looking through the eyepiece, you see colored dots in rows. Underneath, a sequence of numbers is scratched into the metal workbench.',
        question: 'The metal bench reads:\n3 — 3 — 5 — 4 — 4 — 3 — 5 — 5 — 4 — ??\n\nA sticky note nearby says: "Count the letters. One, two, three..."',
        answer: '3',
        hints: [
          'Count letters in number words: one(3), two(3), three(5), four(4), five(4), six(3), seven(5), eight(5), nine(4)...',
          '"Ten" has 3 letters. The next number in the sequence is 3.',
        ],
      },
      {
        id: 'lab-3',
        locationId: 'lab',
        narrative: 'A filing cabinet in the corner is locked with a word dial — five rotating rings, each with letters A through Z. A clipboard hanging beside it has a riddle written in hasty handwriting.',
        question: '"I have cities, but no houses.\nI have mountains, but no trees.\nI have rivers, but no water.\nI have borders, but no walls.\n\nWhat am I?"',
        answer: 'map',
        hints: [
          'It shows you where things are, but can be folded and carried.',
          'Think of something flat that represents the world.',
        ],
      },
      {
        id: 'vault-1',
        locationId: 'vault',
        narrative: 'The filing cabinet swings open, revealing blueprints for a vault door and a keycard. You swipe it at the steel door at the end of the lab. With a deep grinding sound, the vault slides open.\n\nInside, servers hum and indicator lights blink. A terminal on the central podium displays a single sequence.',
        question: 'The terminal shows:\n0 — 1 — 1 — 2 — 3 — 5 — 8 — 13 — 21 — ??\n\nA note taped to the monitor reads: "Fibonacci knew the key."\n\nEnter the next number.',
        answer: '34',
        hints: [
          'Each number is the sum of the two before it.',
          '13 + 21 = 34.',
        ],
      },
      {
        id: 'vault-2',
        locationId: 'vault',
        narrative: 'The terminal flashes green. A final message from Dr. Harrison appears:\n\n"You\'ve come far. I\'m impressed. But one lock remains — the exit. I encoded it using clues from the puzzles you just solved. Think carefully."\n\nThe exit keypad glows with four empty digits.',
        question: 'A holographic display shows:\n\nDigit 1 — The MIDDLE digit from the foyer drawer code.\nDigit 2 — The FIRST digit of the laboratory atomic sum.\nDigit 3 — The number of LETTERS in the riddle\'s answer.\nDigit 4 — The LAST digit of the Fibonacci number.\n\nEnter the 4-digit exit code.',
        answer: '8634',
        hints: [
          'Foyer drawer code was 35815 — the middle digit (3rd of 5) is 8.',
          'Atomic sum was 60 — first digit is 6. Riddle answer "map" has 3 letters. Fibonacci was 34 — last digit is 4.',
        ],
      },
    ],
  },
  'pharaohs-tomb': {
    id: 'pharaohs-tomb',
    name: 'The Pharaoh\'s Tomb',
    description: 'An ancient Egyptian tomb sealed for millennia. Solve the pharaoh\'s riddles, pass the trials of the gods, and uncover the treasure within!',
    intro: 'Your footsteps echo against ancient stone as you descend into the tomb. The air grows thick and stale with the weight of millennia. Faint torchlight flickers ahead, illuminating hieroglyphs etched into the walls. A stone slab at the entrance bears an inscription in crumbling hieroglyphs and ancient Greek:\n\n"TO THOSE WHO SEEK THE TREASURE OF PHARAOH AMENHOTEP: FOUR CHAMBERS GUARD THE PRIZE. EACH ONE TESTS THE MIND AS THE PYRAMID TESTS THE BODY. SOLVE THE RIDDLES OF THE DEAD, AND THE PATH WILL OPEN. FAIL, AND YOU WILL REST HERE FOREVERMORE."\n\nThe slab crumbles to dust at your touch. The entrance behind you seals with a thunderous BOOM. You are trapped. The only way out is forward.',
    locations: [
      {
        id: 'entrance',
        name: 'The Entrance Chamber',
        description: 'A square antechamber lined with faded murals and cracked stone. Hieroglyphs cover every wall, telling the story of Pharaoh Amenhotep\'s reign. A stone pedestal in the center bears a ceremonial offering bowl, now dry. Four doorways lead deeper into the tomb, but only one is unlocked. A bronze plaque on the eastern wall reads: "The first trial awaits those who can read the language of the gods."',
      },
      {
        id: 'antechamber',
        name: 'The Antechamber of Offerings',
        description: 'A wide chamber filled with offerings left for the pharaoh\'s journey: piles of grain, alabaster jars of oils, and golden trinkets scattered across a marble floor. Four alabaster jars sit on a marble shelf, their colors faded with age. A sandstone tablet lies at the foot of an enormous statue of Anubis, its jackal head catching the torchlight. The statue\'s eyes seem to follow you.',
      },
      {
        id: 'hall',
        name: 'The Hall of Pillars',
        description: 'Massive pillars carved to resemble the gods line this long corridor. Their eyes are inlaid with lapis lazuli, glinting in the wavering torchlight. A sundial carved into the floor shows the passage of time, and a series of inscriptions between the pillars suggest they must be invoked in a specific order. The air is still, save for the distant drip of water echoing from somewhere ahead.',
      },
      {
        id: 'vault',
        name: 'The Burial Vault',
        description: 'A domed chamber of polished black granite, lit only by the soft glow of gold. The pharaoh\'s sarcophagus rests on a raised platform in the center, untouched for millennia. The ceiling is painted with stars in constellations long forgotten by modern astronomers. A single inscription on the wall reads: "The final seal is broken only by those who remember what they have learned."',
      },
    ],
    puzzles: [
      {
        id: 'entrance-1',
        locationId: 'entrance',
        narrative: 'You approach the eastern wall where the bronze plaque is mounted. Beside it, a sandstone slab is etched with letters that look almost Greek. A small inscription in hieroglyphs reads: "The language of the gods walks backwards and hides three steps from the truth."',
        question: 'The slab reads: "WRPE".\n\nWhat word is hidden?',
        answer: 'TOMB',
        hints: [
          'Each letter shifts backward by 3 positions in the alphabet (so W→T, R→O, P→M, E→B).',
          'W becomes T, R becomes O, P becomes M, E becomes B. The decoded word is TOMB.',
        ],
      },
      {
        id: 'entrance-2',
        locationId: 'entrance',
        narrative: 'Above the entrance to the next chamber, five paintings hang in a row, each labeled with a caption in faded ink. A small plaque beneath them reads: "The gods speak in patterns. Listen with your eyes."',
        question: 'The captions whisper a name when you look past the surface:\n\n1. "Hieroglyphs cover every surface."\n2. "Oarsmen once rowed boats down this corridor."\n3. "Ra\'s light guides the way."\n4. "Underneath the stone, gold waits in the dark."\n5. "Sphinx statues guard each corner."\n\nWhat message do they hide?',
        answer: 'HORUS',
        hints: [
          'Take the very first letter of each numbered caption, in order.',
          'H, O, R, U, S — the name of the falcon-headed sky god.',
        ],
      },
      {
        id: 'entrance-3',
        locationId: 'entrance',
        narrative: 'Three stone cartouches lie on the offering pedestal, each etched with Egyptian numerals. A scroll beside them reads: "The pharaoh\'s name is hidden in the sum. Add the symbols, and the lock will yield."\n\nA reference table carved below the cartouches lists:\n☥ (Ankh) = 1000\n𓋹 (Scarab) = 100\n𓆼 (Lotus) = 10\n𓂀 (Eye of Horus) = 1',
        question: 'Cartouche 1: 1 Ankh, 4 Lotus, 5 Eyes\nCartouche 2: 3 Scarabs, 4 Lotus\nCartouche 3: 6 Lotus, 8 Eyes\n\nWhat is the SUM of all three cartouches?',
        answer: '1453',
        hints: [
          'Add up each cartouche separately before combining the totals.',
          'Cartouche 1: 1000 + 40 + 5 = 1045. Cartouche 2: 300 + 40 = 340. Cartouche 3: 60 + 8 = 68. Total: 1045 + 340 + 68 = 1453.',
        ],
      },
      {
        id: 'ante-1',
        locationId: 'antechamber',
        narrative: 'Four alabaster jars sit on a marble shelf — one GOLD, one GREEN, one BLUE, one RED. A scroll tied to the statue of Anubis lists four clues. "One jar contains the key to the next chamber. The others are traps."',
        question: 'Read the clues:\n\n1. The key is in the BLUE jar.\n2. The GREEN jar is immediately to the LEFT of the key\'s jar.\n3. The RED jar is immediately to the RIGHT of the BLUE jar.\n4. The GOLD jar is at the far left.\n\nIn what POSITION (1st, 2nd, 3rd, or 4th) is the BLUE jar?',
        answer: '3',
        hints: [
          'Use clue 4 to place GOLD at position 1.',
          'Clues 2 and 3 mean GREEN-BLUE-RED occupy positions 2, 3, 4 in that order. BLUE is at position 3.',
        ],
      },
      {
        id: 'ante-2',
        locationId: 'antechamber',
        narrative: 'A sandstone tablet lies at the foot of the Anubis statue. The hieroglyphs on it are scratched and rearranged out of order. A footnote in ancient Greek reads: "The letters are scattered like dust in the wind. Gather them to find the ruler who sleeps here."',
        question: 'The tablet reads: "AHOPHAR — KING OF THE NILE"\n\nWhat title do these scattered letters reveal?',
        answer: 'PHARAOH',
        hints: [
          'Count the letters in AHOPHAR: A(2), H(2), O(1), P(1), R(1).',
          'PHARAOH uses the letters P, H, A, R, A, O, H — the exact same letters.',
        ],
      },
      {
        id: 'ante-3',
        locationId: 'antechamber',
        narrative: 'Three piles of grain offerings sit before the statue, each on a bronze scale. A papyrus scroll lists the weights of pairs of piles. "Find the weight of the second pile to balance the scales."',
        question: 'The scroll reads:\nPile A + Pile B = 15 stone\nPile B + Pile C = 20 stone\nPile A + Pile C = 13 stone\n\nHow many stone does Pile B contain?',
        answer: '11',
        hints: [
          'Add all three equations together: 2(A + B + C) = 48, so A + B + C = 24.',
          'Pile B = 24 - (A + C) = 24 - 13 = 11.',
        ],
      },
      {
        id: 'pillar-1',
        locationId: 'hall',
        narrative: 'Four stone pillars stand along the corridor, each carved to represent a different god: Osiris, Isis, Ra, and Anubis. A scroll on a pedestal between them reads: "The gods must be invoked in the correct order to open the door."',
        question: 'Four clues are etched into the pillars:\n\n1. Osiris is NOT invoked first or last.\n2. Ra is invoked BEFORE Isis.\n3. Anubis is invoked LAST.\n4. Isis is NOT invoked second.\n\nWhich pillar is invoked SECOND?',
        answer: 'OSIRIS',
        hints: [
          'Anubis is fixed at position 4. Isis is not at position 2, so Isis is at position 1 or 3.',
          'Since Ra must come BEFORE Isis, Isis cannot be at position 1. So Isis = 3, Osiris = 2, Ra = 1.',
        ],
      },
      {
        id: 'pillar-2',
        locationId: 'hall',
        narrative: 'A sundial is carved into the stone floor between the pillars. Its gnomon — a tall bronze obelisk — casts a shadow that moves as the torches flicker. An inscription reads: "The sun\'s shadow shrinks by half with each passing hour. Read the pattern."',
        question: 'The sundial marks:\n\nSunrise: 128 cubits\nHour 1: 64 cubits\nHour 2: 32 cubits\nHour 3: 16 cubits\nHour 4: ?\n\nWhat is the shadow length at the FOURTH hour?',
        answer: '8',
        hints: [
          'Each hour, the shadow length is divided by 2.',
          '64 ÷ 2 = 32. 32 ÷ 2 = 16. 16 ÷ 2 = 8.',
        ],
      },
      {
        id: 'pillar-3',
        locationId: 'hall',
        narrative: 'At the end of the Hall of Pillars, a final inscription is carved into the wall. The torchlight catches the letters as they pulse faintly. "I am the scribe of the gods. My quill wrote the Book of the Dead. What is my name?"',
        question: 'Riddle of the Egyptian god:\n\n"I am the divine scribe of the Egyptian pantheon.\nThe Greeks knew my counterpart as Hermes.\nMy head is that of an ibis.\nI measured the stars and recorded every deed.\nWho am I?"\n\nName me.',
        answer: 'THOTH',
        hints: [
          'The ibis-headed god is the patron of scribes and knowledge.',
          'This is THOTH — the divine scribe, measurer of time, and inventor of writing.',
        ],
      },
      {
        id: 'vault-1',
        locationId: 'vault',
        narrative: 'The pharaoh\'s sarcophagus is engraved with a riddle on its lid. The gold inlay catches the torchlight, making the letters pulse. "The pharaoh\'s spirit must be judged. Answer this to proceed."',
        question: 'Riddle of the Afterlife:\n\n"I am the goddess whose hieroglyph is the throne.\nI am the wife of Osiris and mother of Horus.\nI am the protector of the dead and goddess of magic.\nWho am I?"\n\nName me.',
        answer: 'ISIS',
        hints: [
          'The throne hieroglyph (𓊖) is the symbol of this goddess.',
          'She is the wife of Osiris and mother of Horus — the goddess ISIS.',
        ],
      },
      {
        id: 'vault-2',
        locationId: 'vault',
        narrative: 'A secondary door at the back of the vault is sealed with eight rotating dials, each displaying a single digit. An inscription above the dials reads: "The number that follows is found in the difference between the numbers before it."',
        question: 'The dials currently display:\n\n1 — 1 — 2 — 4 — 7 — 11 — 16 — ?\n\nWhat number belongs on the FINAL dial?',
        answer: '22',
        hints: [
          'Look at the gaps between consecutive terms.',
          'The gaps are 0, 1, 2, 3, 4, 5 — the next gap is 6. So 16 + 6 = 22.',
        ],
      },
      {
        id: 'vault-3',
        locationId: 'vault',
        narrative: 'The pharaoh\'s sarcophagus is sealed with a stone dial bearing four symbols. A final inscription glows faintly in the dark: "You have passed the trials. Now remember what you learned. The seal breaks for those who see."',
        question: 'The stone dial has four positions, each marked with an Egyptian symbol and a clue:\n\n☥ (Ankh) — The FIRST digit of the cartouche sum from the Entrance Chamber.\n𓂀 (Eye of Horus) — The number of LETTERS in the goddess\'s name from the riddle in this vault.\n𓆼 (Lotus) — The shadow length at the FOURTH hour on the sundial.\n𓋹 (Scarab) — The LAST digit of the missing number from the dial sequence.\n\nEnter the 4-digit code.',
        answer: '1482',
        hints: [
          'Look back at the puzzle answers you collected. The cartouche sum was 1453.',
          'First digit = 1. ISIS has 4 letters. Shadow at hour 4 = 8. Sequence ends with 22, last digit = 2. Code: 1-4-8-2.',
        ],
      },
    ],
  },
  'room-69420': {
    id: 'room-69420',
    name: 'Room 69420',
    description: 'A haunted room in the abandoned Greyfield Children\'s Home, stalked by the spirit of a boy named Gab who died within its walls. Decipher his final messages to free his soul.',
    intro: 'Room 69420 sits at the dead end of the Greyfield Children\'s Home, behind a door scarred with fingernail scratches. They say a boy named Gab died here — not quickly, and not kindly — and that some part of him never left.\n\nThe door swings open before you touch it. A cold breath carries a child\'s whisper: "...help me remember..." You step inside. The door slams shut, and the lock clicks home.\n\nTo free Gab, you must walk through his final night.',
    locations: [
      {
        id: 'threshold',
        name: 'The Threshold',
        description: 'A narrow entryway wallpapered in peeling lambs and faded stars. A child\'s drawings are pinned everywhere. The air smells of old crayons and something darker. Two doors lead deeper: one to the bedroom, one sealed shut.'
      },
      {
        id: 'bedroom',
        name: 'Gab\'s Bedroom',
        description: 'A small, cold bedroom frozen in time. A race-car bed, a half-built solar-system mobile, a music box, and walls covered in crayon. In the far corner, a door has been wallpapered over — someone wanted it forgotten.'
      },
      {
        id: 'heart',
        name: 'The Heart of the Room',
        description: 'The wallpaper has been torn away to reveal a second door, and beyond it a windowless chamber. A single bare bulb swings overhead. Here Gab\'s voice is loudest, and the truth of his last night waits to be spoken aloud.'
      }
    ],
    puzzles: [
      {
        id: 'threshold-1',
        locationId: 'threshold',
        narrative: 'You cross the threshold. Lambs and stars peel from the walls. Above the headboard, in a child\'s uneven hand, a single phrase has been gouged into the plaster with a fingernail — some letters pressed far deeper than the rest.',
        question: 'The gouged phrase reads:\n\n"tHe End of Lost Play."\n\nWhat was Gab trying to tell you?',
        answer: 'HELP',
        hints: [
          'Not every letter was cut with the same force. Some are larger and carved deeper into the plaster.',
          'The oversized letters, read in order, are H, E, L, P.'
        ]
      },
      {
        id: 'threshold-2',
        locationId: 'threshold',
        narrative: 'Beneath the drawings you find four wooden letter-blocks scattered across the floor, the kind a small child stacks. Each bears a single letter: M, T, O, B. Beside them lies a crayon drawing of a stone chamber sunk beneath the earth.',
        question: 'Four blocks: M, T, O, B.\nA drawing of a stone chamber beneath the earth.\n\nWhat word do they form?',
        answer: 'TOMB',
        hints: [
          'It is a structure built to hold the dead.',
          'M, T, O, B rearrange to T-O-M-B.'
        ]
      },
      {
        id: 'threshold-3',
        locationId: 'threshold',
        narrative: 'The door to the bedroom is barred by a latch shaped like a teardrop. Beside it, Gab scratched a note in red crayon: \'the alphabet knows my pain.\' Below the note, three numbers have been gouged into the wood.',
        question: '3 — 18 — 25\n\nWhat word does Gab want you to speak?',
        answer: 'CRY',
        hints: [
          'Each number points to a letter\'s position in the alphabet.',
          '3 = C, 18 = R, 25 = Y.'
        ]
      },
      {
        id: 'threshold-4',
        locationId: 'threshold',
        narrative: 'Pinned above the blocks is a child\'s drawing of two calendars. The first is labelled \'I arrived\' and marked MCMLXXIII. The second, smudged dark, is labelled \'I left\' and marked MCMLXXXVI. Below them, in red crayon: \'how old was I?\'',
        question: 'Two calendars:\n\n"I arrived" — MCMLXXIII\n"I left" — MCMLXXXVI\n\nHow old was Gab?',
        answer: '13',
        hints: [
          'The markings are Roman numerals.',
          'MCMLXXIII = 1973. MCMLXXXVI = 1986. 1986 − 1973 = 13.'
        ]
      },
      {
        id: 'bedroom-1',
        locationId: 'bedroom',
        narrative: 'The bedroom door clicks open. A music box on the dresser winds itself and begins to play a tuneless lullaby. Tucked inside are two slips of paper. The first, in a child\'s hand: \'I found this card in his desk. It shows how he hides words.\' The card displays a grid — the alphabet written out in twenty-six rows, each starting one letter later than the last. A note on the card reads: \'To find the true letter, go to the row of the key letter and find the cipher letter within it. The column it sits in gives you the true letter.\' The second slip, in an adult\'s rigid hand: \'His true name is locked here. The word the walls whisper is the key.\'',
        question: 'Ciphertext: NAVLKPUM\nKey: HAUNT\n\nWhat is the boy\'s full name?',
        answer: 'GABYRIUS',
        hints: [
          'Use the grid as the card instructs — key letter gives the row, cipher letter is found in that row, and the column reveals the true letter.',
          'N row H = G, A row A = A, V row U = B, L row N = Y, K row T = R, P row H = I, U row A = U, M row T = S → GABYRIUS.'
        ]
      },
      {
        id: 'bedroom-2',
        locationId: 'bedroom',
        narrative: 'Tucked under the pillow is a page torn from a diary, the writing shaky and small. An adult\'s red pen has circled one phrase and scribbled in the margin: \'a verdict, three letters.\'',
        question: 'The circled phrase reads:\n\n"...he calls thiS INnocent..."\n\nWhat is the three-letter word?',
        answer: 'SIN',
        hints: [
          'A verdict hidden where two words meet.',
          'thiS INnocent — S, I, N.'
        ]
      },
      {
        id: 'bedroom-3',
        locationId: 'bedroom',
        narrative: 'One wall is covered in a crayon poem, each line in a different color. Below it, a note in a woman\'s hand: \'my mother taught me acrostics. she said the first step is always the most important.\'',
        question: 'The poem reads:\n\nDarkness fills my little room,\nEvery shadow wears his face,\nAnd though I try not to be afraid,\nThe door still opens in the night,\nHush now — he is coming up the stairs.\n\nWhat word does Gab hide?',
        answer: 'DEATH',
        hints: [
          'An acrostic is formed from specific positions — often the starts of things.',
          'The first letter of each line: D, E, A, T, H.'
        ]
      },
      {
        id: 'bedroom-4',
        locationId: 'bedroom',
        narrative: 'A half-built solar-system mobile hangs crooked from the ceiling. Beside it lies a science workbook open to a periodic table; one element is circled in red crayon and labelled only \'O — the breath I lost.\' Underneath, Gab\'s hand: \'how many protons left me?\'',
        question: '"O — the breath I lost."\n\nHow many protons left me?',
        answer: '8',
        hints: [
          'O is the chemical symbol for an element on the periodic table.',
          'O is oxygen. Its atomic number — equal to its proton count — is 8.'
        ]
      },
      {
        id: 'bedroom-5',
        locationId: 'bedroom',
        narrative: 'The headboard of the race-car bed is carved with a strange chart — the alphabet written A through Z across the top, and beneath it the same alphabet written backward, Z through A, so that each letter sits directly below another. Below the chart, a single word has been scratched into the wood.',
        question: 'The chart pairs each letter with its opposite:\nA↔Z, B↔Y, C↔X, D↔W...\n\nThe scratched word: KIZB\n\nWhat does it spell?',
        answer: 'PRAY',
        hints: [
          'Each letter in the word swaps with the letter directly below it in the chart.',
          'K↔P, I↔R, Z↔A, B↔Y → PRAY.'
        ]
      },
      {
        id: 'heart-1',
        locationId: 'heart',
        narrative: 'You tear away the wallpaper hiding the second door and step through. The air here is thick and grey. On a pedestal rests a single charred page torn from a dictionary, one entry underlined in soot.',
        question: 'The underlined entry reads:\n\n"What\'s left of a burning tree — or the tree itself (3)."',
        answer: 'ASH',
        hints: [
          'It is a double definition: two meanings, one word.',
          'ASH — a kind of tree, and the grey powder left after fire.'
        ]
      },
      {
        id: 'heart-2',
        locationId: 'heart',
        narrative: 'On the floor, a chain of words has been scratched in crayon, each one almost the same as the last. The final word has been gouged out, as if the boy couldn\'t bear to finish it.',
        question: 'The scratched chain reads:\n\nMUST → MUSK → DUSK → ????\n\nComplete the final word.',
        answer: 'DUST',
        hints: [
          'Look closely at how each word differs from the one before it — only one letter changes each time.',
          'DUSK → DUST (the K becomes a T).'
        ]
      },
      {
        id: 'heart-3',
        locationId: 'heart',
        narrative: 'The bare bulb flares. At the back of the chamber stands a final door with no handle and no lock — only a slot, as if for a spoken word. Gab\'s voice surrounds you, fragile and tired: \'say what I became... take what you\'ve already found...\'',
        question: 'Gab whispers:\n\n"Take the first breath of the name locked in song,\nthe third of what fire leaves behind,\nthe second of the chamber of the dead,\nthe third of the ladder\'s ending,\nand the fourth of what the poem spells."\n\nSpeak the five-letter word.',
        answer: 'GHOST',
        hints: [
          'Each line points to an answer you have already found elsewhere in the room.',
          'GABYRIUS[1] = G, ASH[3] = H, TOMB[2] = O, DUST[3] = S, DEATH[4] = T → GHOST.'
        ]
      }
    ]
  }
};

const MAX_GLOBAL_HINTS = 5;

export const getAvailableRooms = (): { id: string; name: string; description: string }[] => {
  return Object.values(escapeRooms).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
  }));
};

export const noTurns = true;

export const createInitialState = (playerId: string): EscapeRoomGameState => {
  return {
    phase: 'playing',
    selectedRoomId: 'abandoned-lab',
    currentPuzzleIndex: 0,
    puzzles: [],
    locations: [],
    availableRooms: getAvailableRooms(),
    players: [{ id: playerId, player: 1, ready: false }],
    winner: '',
    totalMoves: 0,
    attemptsThisPuzzle: 0,
    hintsUsed: 0,
    maxHints: MAX_GLOBAL_HINTS,
    solvedPuzzles: [],
    lastAction: null,
  };
};

export const resetState = (players: Player[]): EscapeRoomGameState => {
  return {
    phase: 'playing',
    selectedRoomId: 'abandoned-lab',
    currentPuzzleIndex: 0,
    puzzles: [],
    locations: [],
    availableRooms: getAvailableRooms(),
    players: players.map((p) => ({ ...p, ready: false })),
    winner: '',
    totalMoves: 0,
    attemptsThisPuzzle: 0,
    hintsUsed: 0,
    maxHints: MAX_GLOBAL_HINTS,
    solvedPuzzles: [],
    lastAction: null,
  };
};

export const onGameStart = (room: Room): void => {
  const gameState = room.gameState as EscapeRoomGameState;
  const roomData = escapeRooms[gameState.selectedRoomId || 'abandoned-lab'];
  if (roomData) {
    gameState.roomName = roomData.name;
    gameState.roomDescription = roomData.description;
    gameState.roomIntro = roomData.intro;
    gameState.puzzles = roomData.puzzles.map((p) => ({ ...p, solved: false }));
    gameState.locations = roomData.locations.map((l) => ({ ...l }));
  }
};

export const makeMove = (
  room: Room,
  socket: any,
  data: { action: string; answer?: string; hintIndex?: number }
): boolean => {
  const gameState = room.gameState as EscapeRoomGameState;

  if (gameState.phase === 'escaped') {
    socket.emit('invalid-move', { message: 'You have already escaped!' });
    return false;
  }

  const player = gameState.players.find((p) => p.id === socket.id);
  const playerNumber = player ? player.player : 0;

  if (data.action === 'submit-answer') {
    const answer = (data.answer || '').trim().toLowerCase();
    if (!answer) {
      socket.emit('invalid-move', { message: 'Please enter an answer.' });
      return false;
    }

    const currentPuzzle = gameState.puzzles.find((p) => !p.solved);
    if (!currentPuzzle) {
      socket.emit('invalid-move', { message: 'All puzzles are already solved!' });
      return false;
    }

    gameState.totalMoves++;
    gameState.attemptsThisPuzzle++;
    gameState.lastAction = { playerNumber, action: 'submit-answer', correct: false };

    if (answer === currentPuzzle.answer.toLowerCase()) {
      currentPuzzle.solved = true;
      gameState.solvedPuzzles.push(gameState.puzzles.indexOf(currentPuzzle));
      gameState.attemptsThisPuzzle = 0;
      gameState.lastAction = { playerNumber, action: 'submit-answer', correct: true };

      const allSolved = gameState.puzzles.every((p) => p.solved);
      if (allSolved) {
        gameState.phase = 'escaped';
        gameState.winner = 'Everyone escapes!';
      }
    } else {
      socket.emit('invalid-move', { message: 'Incorrect answer. Try again!' });
    }
    return true;
  }

  if (data.action === 'request-hint') {
    if (gameState.hintsUsed >= gameState.maxHints) {
      socket.emit('invalid-move', { message: 'No more hints remaining! You have used all your hints.' });
      return false;
    }

    const currentPuzzle = gameState.puzzles.find((p) => !p.solved);
    if (!currentPuzzle) {
      socket.emit('invalid-move', { message: 'No puzzle to give hints for.' });
      return false;
    }

    gameState.hintsUsed++;
    gameState.lastAction = { playerNumber, action: 'request-hint', correct: true };
    return true;
  }

  socket.emit('invalid-move', { message: 'Unknown action.' });
  return false;
};

export const setRoom = (room: Room, roomId: string): void => {
  const gameState = room.gameState as EscapeRoomGameState;
  if (escapeRooms[roomId]) {
    gameState.selectedRoomId = roomId;
  }
};
