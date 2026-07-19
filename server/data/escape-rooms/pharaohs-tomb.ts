import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'pharaohs-tomb',
  name: 'The Pharaoh\'s Tomb',
  description: 'An ancient Egyptian tomb sealed for millennia. Solve the pharaoh\'s riddles, pass the trials of the gods, and uncover the treasure within!',
  difficulty: 'easy',
  intro: 'The rope snapped two meters into the descent. By the time you finished falling, the shaft above had sealed — millennia-old counterweights, still faithful to their architect. You found the inscription while nursing a twisted ankle: Amenhotep\'s warning, half Greek, half hieroglyph, promising treasure to those who solve his riddles and a tomb to those who don\'t. Your flashlight catches a glint of gold down the eastern passage. Torch sconces along the walls ignite in sequence, one by one, as if the tomb itself has been waiting for company.',
  locations: [
    {
      id: 'entrance',
      name: 'The Entrance Chamber',
      description: 'A square antechamber lined with faded murals and cracked stone. Hieroglyphs cover every wall, telling the story of Pharaoh Amenhotep\'s reign. A stone pedestal in the center bears a ceremonial offering bowl, now dry. Four doorways lead deeper into the tomb, but only one is unlocked. A bronze plaque on the eastern wall reads: "The first trial awaits those who can read the language of the gods."'
    },
    {
      id: 'antechamber',
      name: 'The Antechamber of Offerings',
      description: 'A wide chamber filled with offerings left for the pharaoh\'s journey: piles of grain, alabaster jars of oils, and golden trinkets scattered across a marble floor. Four alabaster jars sit on a marble shelf, their colors faded with age. A sandstone tablet lies at the foot of an enormous statue of Anubis, its jackal head catching the torchlight. The statue\'s eyes seem to follow you.'
    },
    {
      id: 'hall',
      name: 'The Hall of Pillars',
      description: 'Massive pillars carved to resemble the gods line this long corridor. Their eyes are inlaid with lapis lazuli, glinting in the wavering torchlight. A sundial carved into the floor shows the passage of time, and a series of inscriptions between the pillars suggest they must be invoked in a specific order. The air is still, save for the distant drip of water echoing from somewhere ahead.'
    },
    {
      id: 'vault',
      name: 'The Burial Vault',
      description: 'A domed chamber of polished black granite, lit only by the soft glow of gold. The pharaoh\'s sarcophagus rests on a raised platform in the center, untouched for millennia. The ceiling is painted with stars in constellations long forgotten by modern astronomers. A single inscription on the wall reads: "The final seal is broken only by those who remember what they have learned."'
    }
  ],
  puzzles: [
    {
      id: 'entrance-1',
      locationId: 'entrance',
      narrative: 'You approach the eastern wall where the bronze plaque is mounted. Beside it, a sandstone slab is etched with letters that look almost Greek. A small inscription in hieroglyphs reads: "The language of the gods walks backwards and hides three steps from the truth."',
      question: 'The slab reads: "WRPE".\n\nWhat word is hidden?',
      answer: 'TOMB',
      hints: [
        'Beside the slab, a student scribe\'s practice tablet is chipped into the wall: A ↔ X, B ↔ Y, C ↔ Z. The lesson was never completed.',
        'W becomes T, R becomes O, P becomes M, E becomes B. The decoded word is TOMB.'
      ]
    },
    {
      id: 'entrance-2',
      locationId: 'entrance',
      narrative: 'Above the entrance to the next chamber, five paintings hang in a row, each labeled with a caption in faded ink. A small plaque beneath them reads: "The gods speak in patterns. Listen with your eyes."',
      question: 'The captions whisper a name when you look past the surface:\n\n1. "Hieroglyphs cover every surface."\n2. "Oarsmen once rowed boats down this corridor."\n3. "Ra\'s light guides the way."\n4. "Underneath the stone, gold waits in the dark."\n5. "Sphinx statues guard each corner."\n\nWhat message do they hide?',
      answer: 'HORUS',
      hints: [
        'Speak just the opening letter of each caption — the gods speak in initials.',
        'H, O, R, U, S — the name of the falcon-headed sky god.'
      ]
    },
    {
      id: 'entrance-3',
      locationId: 'entrance',
      narrative: 'Three stone cartouches lie on the offering pedestal, each etched with Egyptian numerals. A scroll beside them reads: "The pharaoh\'s name is hidden in the sum. Add the symbols, and the lock will yield."\n\nA reference table carved below the cartouches lists:\n☥ (Ankh) = 1000\n𓋹 (Scarab) = 100\n𓆼 (Lotus) = 10\n𓂀 (Eye of Horus) = 1',
      question: 'Cartouche 1: 1 Ankh, 4 Lotus, 5 Eyes\nCartouche 2: 3 Scarabs, 4 Lotus\nCartouche 3: 6 Lotus, 8 Eyes\n\nWhat is the SUM of all three cartouches?',
      answer: '1453',
      hints: [
        'Each symbol has a value carved into the reference below. Add up inside each cartouche first, then combine them.',
        'Cartouche 1: 1000 + 40 + 5 = 1045. Cartouche 2: 300 + 40 = 340. Cartouche 3: 60 + 8 = 68. Total: 1045 + 340 + 68 = 1453.'
      ]
    },
    {
      id: 'ante-1',
      locationId: 'antechamber',
      narrative: 'Four alabaster jars sit on a marble shelf — one GOLD, one GREEN, one BLUE, one RED. A scroll tied to the statue of Anubis lists four clues. "One jar contains the key to the next chamber. The others are traps."',
      question: 'A faded inscription beneath the scroll demands: "Speak the rank of the azure vessel."\n\nThe scroll is marked with four clues:\n\n1. The key is in the BLUE jar.\n2. The GREEN jar is immediately to the LEFT of the key\'s jar.\n3. The RED jar is immediately to the RIGHT of the BLUE jar.\n4. The GOLD jar is at the far left.',
      answer: '3',
      hints: [
        'The scroll says GOLD anchors the leftmost spot. From there, the remaining jars must obey the rules about who sits beside whom.',
        'Clues 2 and 3 mean GREEN-BLUE-RED occupy positions 2, 3, 4 in that order. BLUE is at position 3.'
      ]
    },
    {
      id: 'ante-2',
      locationId: 'antechamber',
      narrative: 'A sandstone tablet lies at the foot of the Anubis statue. The hieroglyphs on it are scratched and rearranged out of order. A footnote in ancient Greek reads: "The letters are scattered like dust in the wind. Gather them to find the ruler who sleeps here."',
      question: 'The tablet reads: "AHOPHAR — KING OF THE NILE"\n\nWhat title do these scattered letters reveal?',
      answer: 'PHARAOH',
      hints: [
        'The tablet holds the same letters as the ruler\'s title — they\'ve just been scattered out of order.',
        'PHARAOH uses the letters P, H, A, R, A, O, H — the exact same letters.'
      ]
    },
    {
      id: 'ante-3',
      locationId: 'antechamber',
      narrative: 'Three piles of grain offerings sit before the statue, each on a bronze scale. A papyrus scroll lists the weights of pairs of piles. "Find the weight of the second pile to balance the scales."',
      question: 'The scroll reads:\nPile A + Pile B = 15 stone\nPile B + Pile C = 20 stone\nPile A + Pile C = 13 stone\n\nHow many stone does Pile B contain?',
      answer: '11',
      hints: [
        'All three equations share the same three piles. Combine them to find how much all three weigh together.',
        'Pile B = 24 - (A + C) = 24 - 13 = 11.'
      ]
    },
    {
      id: 'pillar-1',
      locationId: 'hall',
      narrative: 'Four stone pillars stand along the corridor, each carved to represent a different god: Osiris, Isis, Ra, and Anubis. A scroll on a pedestal between them reads: "The gods must be invoked in the correct order to open the door."',
      question: 'Four clues are etched into the pillars:\n\n1. Osiris is NOT invoked first or last.\n2. Ra is invoked BEFORE Isis.\n3. Anubis is invoked LAST.\n4. Isis is NOT invoked second.\n\nWhich pillar is invoked SECOND?',
      answer: 'OSIRIS',
      hints: [
        'Anubis guards the rear — that much is certain. For the rest, Ra must walk before Isis. Work forward from the back.',
        'Since Ra must come BEFORE Isis, Isis cannot be at position 1. So Isis = 3, Osiris = 2, Ra = 1.'
      ]
    },
    {
      id: 'pillar-2',
      locationId: 'hall',
      narrative: 'A sundial is carved into the stone floor between the pillars. Its gnomon — a tall bronze obelisk — casts a shadow that moves as the torches flicker. An inscription reads: "The sun\'s shadow shrinks by half with each passing hour. Read the pattern."',
      question: 'The sundial marks:\n\nSunrise: 128 cubits\nHour 1: 64 cubits\nHour 2: 32 cubits\nHour 3: 16 cubits\nHour 4: ?\n\nThe stone beside the dial is engraved: "The priest who cannot name the fourth shadow shall not pass."',
      answer: '8',
      hints: [
        'The sun\'s light wanes as the day passes. Watch how each hour shrinks what came before it.',
        '64 ÷ 2 = 32. 32 ÷ 2 = 16. 16 ÷ 2 = 8.'
      ]
    },
    {
      id: 'pillar-3',
      locationId: 'hall',
      narrative: 'At the end of the Hall of Pillars, a final inscription is carved into the wall. The torchlight catches the letters as they pulse faintly. "I am the scribe of the gods. My quill wrote the Book of the Dead. What is my name?"',
      question: 'Riddle of the Egyptian god:\n\n"I am the divine scribe of the Egyptian pantheon.\nThe Greeks knew my counterpart as Hermes.\nMy head is that of an ibis.\nI measured the stars and recorded every deed.\nWho am I?"\n\nName me.',
      answer: 'THOTH',
      hints: [
        'The Egyptians carved their writing with the beak of a bird — a bird-headed god watches over all words and records.',
        'This is THOTH — the divine scribe, measurer of time, and inventor of writing.'
      ]
    },
    {
      id: 'vault-1',
      locationId: 'vault',
      narrative: 'The pharaoh\'s sarcophagus is engraved with a riddle on its lid. The gold inlay catches the torchlight, making the letters pulse. "The pharaoh\'s spirit must be judged. Answer this to proceed."',
      question: 'Riddle of the Afterlife:\n\n"I am the goddess whose hieroglyph is the throne.\nI am the wife of Osiris and mother of Horus.\nI am the protector of the dead and goddess of magic.\nWho am I?"\n\nName me.',
      answer: 'ISIS',
      hints: [
        'She wore a throne upon her head, and her name is woven into every story of Osiris and Horus.',
        'She is the wife of Osiris and mother of Horus — the goddess ISIS.'
      ]
    },
    {
      id: 'vault-2',
      locationId: 'vault',
      narrative: 'A secondary door at the back of the vault is sealed with eight rotating dials, each displaying a single digit. An inscription above the dials reads: "The number that follows is found in the difference between the numbers before it."',
      question: 'The dials currently display:\n\n1 — 1 — 2 — 4 — 7 — 11 — 16 — ?\n\nWhat number belongs on the FINAL dial?',
      answer: '22',
      hints: [
        'The spaces between the numbers tell their own story — each gap grows by the same small step.',
        'The gaps are 0, 1, 2, 3, 4, 5 — the next gap is 6. So 16 + 6 = 22.'
      ]
    },
    {
      id: 'vault-3',
      locationId: 'vault',
      narrative: 'The pharaoh\'s sarcophagus is sealed with a stone dial bearing four symbols. A final inscription glows faintly in the dark: "You have passed the trials. Now remember what you learned. The seal breaks for those who see."',
      question: 'The stone dial has four positions, each marked with an Egyptian symbol and a clue:\n\n☥ (Ankh) — The FIRST digit of the cartouche sum from the Entrance Chamber.\n𓂀 (Eye of Horus) — The number of LETTERS in the goddess\'s name from the riddle in this vault.\n𓆼 (Lotus) — The shadow length at the FOURTH hour on the sundial.\n𓋹 (Scarab) — The LAST digit of the missing number from the dial sequence.\n\nThe great door waits for four digits.',
      answer: '1482',
      hints: [
        'The stone remembers everything you\'ve proven. Each symbol asks for a piece of an answer you gave earlier in the tomb.',
        'First digit = 1. ISIS has 4 letters. Shadow at hour 4 = 8. Sequence ends with 22, last digit = 2. Code: 1-4-8-2.'
      ]
    }
  ]
};

export default data;
