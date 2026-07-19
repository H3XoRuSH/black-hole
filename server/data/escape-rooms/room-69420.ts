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
      narrative: 'One wall is covered in a crayon poem, each line in a different color. Below it, a note in a woman\'s hand: \'she said the first step is always the most important.\'',
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
      question: 'The chart pairs each letter with the one beneath it.\n\nThe scratched word: KIZB\n\nWhat does it spell?',
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
      question: 'The scratched chain reads:\n\nMUST → MUSK → DUSK → ????\n\nGab\'s nail rests beneath the faded final link.',
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
      question: 'Gab whispers:\n\n"Take the first breath of the name locked in song,\nthe third of what fire leaves behind,\nthe second of the chamber of the dead,\nthe third of the ladder\'s ending,\nand the fourth of what the poem spells."\n\nGab waits for you to speak.',
      answer: 'GHOST',
      hints: [
        'Each line points to an answer you have already found elsewhere in the room.',
        'GABYRIUS[1] = G, ASH[3] = H, TOMB[2] = O, DUST[3] = S, DEATH[4] = T → GHOST.'
      ]
    }
  ]
};

export default data;
