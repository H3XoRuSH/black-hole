import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'pharaohs-tomb',
  name: 'The Pharaoh\'s Rest',
  description:
    'An ancient Egyptian burial chamber sealed for millennia. Solve the pharaoh\'s riddles, pass the trials of the gods, and uncover the treasure within!',
  difficulty: 'easy',
  intro:
    'The rope snapped two meters into the descent. By the time you finished falling, the shaft above had sealed — millennia-old counterweights, still faithful to their architect. You found the inscription while nursing a twisted ankle: Amenhotep\'s warning, half Greek, half hieroglyph, promising treasure to those who solve his riddles and an eternal prison to those who don\'t. Your flashlight catches a glint of gold down the eastern passage. Torch sconces along the walls ignite in sequence, one by one, as if the burial site itself has been waiting for company.',
  locations: [
    {
      id: 'entrance',
      name: 'The Entrance Chamber',
      description:
        'A square antechamber lined with faded murals and cracked stone. Hieroglyphs cover every wall, telling the story of Pharaoh Amenhotep\'s reign. A stone pedestal in the center bears a ceremonial offering bowl, now dry. Four doorways lead deeper into the burial complex, but only the eastern passage shows signs of a mechanism.'
    },
    {
      id: 'antechamber',
      name: 'The Antechamber of Offerings',
      description:
        'A wide chamber filled with offerings left for the pharaoh\'s journey: piles of grain, alabaster jars of oils, and golden trinkets scattered across a marble floor. Four alabaster jars sit on a marble shelf, their colors faded with age. A sandstone tablet lies at the foot of an enormous statue of Anubis, its jackal head catching the torchlight. The statue\'s eyes seem to follow you.'
    },
    {
      id: 'hall',
      name: 'The Hall of Pillars',
      description:
        'Massive pillars carved to resemble the gods line this long corridor. Their eyes are inlaid with lapis lazuli, glinting in the wavering torchlight. A sundial carved into the floor shows the passage of time, and a series of inscriptions between the pillars suggest they must be invoked in a specific order. The air is still, save for the distant drip of water echoing from somewhere ahead.'
    },
    {
      id: 'vault',
      name: 'The Burial Vault',
      description:
        'A domed chamber of polished black granite, lit only by the soft glow of gold. The pharaoh\'s sarcophagus rests on a raised platform in the center, untouched for millennia. The ceiling is painted with stars in constellations long forgotten by modern astronomers. A single inscription on the wall reads: "The final seal is broken only by those who remember what they have learned."'
    }
  ],
  nodes: [
    // ===== ENTRANCE CHAMBER =====
    {
      id: 'ent-bronze-plaque',
      locationId: 'entrance',
      parentId: null,
      type: 'dialogue',
      label: 'Bronze Plaque',
      narrative:
        'A bronze plaque on the eastern wall reads: "The first trial awaits those who can read the language of the gods." Beneath it, a sandstone slab is covered in strange letters. A wall chart beside it appears to be a cipher reference, and five painted panels hang in a row further along the wall.',
      children: ['ent-cipher-chart', 'ent-stone-slab']
    },
    {
      id: 'ent-cipher-chart',
      locationId: 'entrance',
      parentId: 'ent-bronze-plaque',
      type: 'dialogue',
      label: 'Cipher Reference',
      narrative:
        'A student scribe\'s practice tablet is chipped into the wall beside the bronze plaque. It shows the Egyptian backwards-alphabet technique — three steps back for every letter:\n\nA ↔ X\nB ↔ Y\nC ↔ Z\nD ↔ A\nE ↔ B\nF ↔ C\n\nAnd so on. Each letter hides three steps from the truth. The scribes believed the language of the gods was written in reverse.\n\nAbove the tablet, a faded mural depicts an ibis-headed figure holding a reed brush and scribe\'s palette — the god Thoth, who legend says invented writing and recorded every deed of every soul.',
      children: []
    },
    {
      id: 'ent-stone-slab',
      locationId: 'entrance',
      parentId: 'ent-bronze-plaque',
      type: 'puzzle',
      label: 'Stone Slab',
      narrative:
        'You approach the sandstone slab mounted beside the bronze plaque. Letters that look almost Greek are etched into the stone. A small inscription in hieroglyphs beneath reads: "The language of the gods walks backwards and hides three steps from the truth."',
      question: 'The slab reads: "WRPE".\n\nWhat word is hidden?',
      answer: 'TOMB',
      hints: [
        'The bronze plaque mentions writing in reverse. Look for a cipher reference — a teaching chart carved on the wall beside the plaque shows the backwards-alphabet method.',
        'The cipher chart shows A↔X, B↔Y, C↔Z — shift each letter of WRPE three steps back through the alphabet.',
        'W → T, R → O, P → M, E → B. The decoded word is TOMB.'
      ],
      children: ['ent-scarab-amulet']
    },
    {
      id: 'ent-scarab-amulet',
      locationId: 'entrance',
      parentId: 'ent-stone-slab',
      type: 'item',
      label: 'Scarab Amulet',
      narrative:
        'As the slab\'s inscription rearranges itself to reveal the hidden word, a small stone panel slides open beneath it. Inside rests a carved scarab amulet, its wings etched with minute hieroglyphs. The beetle emblem matches the seal of the offering priests — it may prove useful beyond this chamber.',
      rewardItem: 'scarab-amulet'
    },
    {
      id: 'ent-offering-pedestal',
      locationId: 'entrance',
      parentId: null,
      type: 'dialogue',
      label: 'Offering Pedestal',
      narrative:
        'A stone pedestal in the center of the chamber bears a ceremonial offering bowl, now dry. Beneath the bowl, three stone cartouches are visible — each etched with Egyptian numerals. A reference table carved beside them lists the symbol values.',
      children: ['ent-numeral-reference', 'ent-cartouche-sum']
    },
    {
      id: 'ent-numeral-reference',
      locationId: 'entrance',
      parentId: 'ent-offering-pedestal',
      type: 'dialogue',
      label: 'Numeral Reference',
      narrative:
        'A reference table is carved into the pedestal beside the cartouches:\n☥ (Ankh) = 1000\n𓋹 (Scarab) = 100\n𓆼 (Lotus) = 10\n𓂀 (Eye of Horus) = 1\n\nA scroll tucked beneath the bowl reads: "The pharaoh\'s name is hidden in the sum. Add the symbols, and the lock will yield."',
      children: []
    },
    {
      id: 'ent-cartouche-sum',
      locationId: 'entrance',
      parentId: 'ent-offering-pedestal',
      type: 'puzzle',
      label: 'Cartouche Sum',
      narrative:
        'Three stone cartouches lie beneath the offering bowl, each etched with Egyptian numerals. Use the reference table beside them to decode the symbols.',
      question:
        'Cartouche 1: 1 Ankh, 4 Lotus, 5 Eyes\nCartouche 2: 3 Scarabs, 4 Lotus\nCartouche 3: 6 Lotus, 8 Eyes\n\nWhat is the SUM of all three cartouches?',
      answer: '1453',
      hints: [
        'The reference table beside the cartouches shows each symbol\'s value. Tally each cartouche\'s symbols using those values.',
        'Cartouche 1: 1 Ankh (1000) + 4 Lotus (40) + 5 Eyes (5) = 1045. Cartouche 2: 3 Scarabs (300) + 4 Lotus (40) = 340. Cartouche 3: 6 Lotus (60) + 8 Eyes (8) = 68.',
        'Add the subtotals: 1045 + 340 + 68 = 1453.'
      ],
      children: ['ent-ankh-relic']
    },
    {
      id: 'ent-ankh-relic',
      locationId: 'entrance',
      parentId: 'ent-cartouche-sum',
      type: 'item',
      label: 'Ankh Relic',
      narrative:
        'The cartouches click into alignment. A hidden drawer beneath the pedestal slides open, revealing a stone ankh carved from lapis lazuli. The shaft is warm to the touch — it radiates a faint energy.',
      rewardItem: 'ankh-relic'
    },
    {
      id: 'ent-wall-murals',
      locationId: 'entrance',
      parentId: null,
      type: 'locked',
      label: 'Chamber Murals',
      narrative:
        'The ankh relic glows as you hold it before the wall. Faded murals brighten, revealing five painted panels arranged in a row. Each is labeled with a caption in faded ink. Among the scenes, a recurring motif shows a falcon hovering over a woman in a throne-shaped crown — the goddess Isis watching over her son Horus, the sky god. The wall itself seems to exhale — dust swirls at your feet as torchlight catches the newly revealed images.',
      lockedNarrative:
        'The chamber walls are covered in murals so faded they are barely visible. A lapis-shaped indentation in the wall glints in the torchlight — it matches the shape of an ankh.',
      lockedByItem: 'ankh-relic',
      children: ['ent-five-paintings']
    },
    {
      id: 'ent-five-paintings',
      locationId: 'entrance',
      parentId: 'ent-wall-murals',
      type: 'puzzle',
      label: 'Five Paintings',
      narrative:
        'Five paintings hang in a row, each labeled with a caption in faded ink. A small plaque beneath them reads: "The gods speak in patterns. Listen with your eyes."',
      question:
        'The captions whisper a name when you look past the surface:\n\n1. "Hieroglyphs cover every surface."\n2. "Oarsmen once rowed boats down this corridor."\n3. "Ra\'s light guides the way."\n4. "Underneath the stone, gold waits in the dark."\n5. "Sphinx statues guard each corner."\n\nWhat message do they hide?',
      answer: 'HORUS',
      hints: [
        'The paintings flank the eastern wall. Look for a pattern in how they\'re captioned — each caption begins with a different letter.',
        'String together the first letter of each caption: the opening words form a single name.',
        'H (Hieroglyphs), O (Oarsmen), R (Ra\'s), U (Underneath), S (Sphinx) — the name is HORUS, the falcon-headed sky god.'
      ],
      children: ['ent-falcon-seal']
    },
    {
      id: 'ent-falcon-seal',
      locationId: 'entrance',
      parentId: 'ent-five-paintings',
      type: 'item',
      label: 'Falcon Seal',
      narrative:
        'The paintings shimmer and a small stone disk drops from a hidden recess beneath the last panel. It\'s a falcon-headed seal — warm, as if recently handled. The eastern doorway at the end of the chamber seems to respond, its stone door shifting slightly.',
      rewardItem: 'falcon-seal'
    },
    {
      id: 'ent-eastern-door',
      locationId: 'entrance',
      parentId: null,
      type: 'locked',
      label: 'Eastern Door',
      narrative:
        'You press the falcon seal into the door\'s central cartouche. Stone grinds against stone as the door swings inward. Torchlight spills into the darkness beyond — the Antechamber of Offerings awaits.',
      lockedNarrative:
        'A heavy stone door blocks the eastern passage. A cartouche-shaped recess is carved into its center, bordered by falcon wings. It waits for a seal.',
      lockedByItem: 'falcon-seal',
      children: ['ent-to-antechamber']
    },
    {
      id: 'ent-to-antechamber',
      locationId: 'antechamber',
      parentId: 'ent-eastern-door',
      type: 'dialogue',
      label: 'Enter the Antechamber',
      narrative:
        'The air grows warmer as you pass through. The chamber beyond is lit by oil lamps that flicker to life at your approach — the pharaoh\'s offerings, waiting for millennia.',
      children: []
    },

    // ===== ANTECHAMBER OF OFFERINGS =====
    {
      id: 'ante-alabaster-shelf',
      locationId: 'antechamber',
      parentId: null,
      type: 'dialogue',
      label: 'Alabaster Shelf',
      narrative:
        'Four alabaster jars sit on a marble shelf — one GOLD, one GREEN, one BLUE, one RED. A scroll tied to a hook beside the shelf lists four clues in precise, faded script. "One jar contains the key to the next chamber," it warns. "The others are traps."',
      children: ['ante-jar-clues', 'ante-jar-puzzle']
    },
    {
      id: 'ante-jar-clues',
      locationId: 'antechamber',
      parentId: 'ante-alabaster-shelf',
      type: 'dialogue',
      label: 'Jar Clues Scroll',
      narrative:
        'The scroll is marked with four clues:\n\n1. The key is in the BLUE jar.\n2. The GREEN jar is immediately to the LEFT of the key\'s jar.\n3. The RED jar is immediately to the RIGHT of the BLUE jar.\n4. The GOLD jar is at the far left.',
      children: []
    },
    {
      id: 'ante-jar-puzzle',
      locationId: 'antechamber',
      parentId: 'ante-alabaster-shelf',
      type: 'puzzle',
      label: 'Jar Puzzle',
      narrative:
        'A faded inscription beneath the shelf demands: "Speak the rank of the azure vessel." The four jars stand in a row — their order must be deduced from the scroll\'s clues.',
      question: 'What rank (1–4, from left to right) does the BLUE jar occupy?',
      answer: '3',
      hints: [
        'The scroll tied to the shelf lists four clues. Use them to determine the exact position of every jar from left to right.',
        'If GOLD is at the far left (position 1), and GREEN is immediately left of BLUE (clue 2), and RED is immediately right of BLUE (clue 3), then GREEN, BLUE, RED must occupy positions 2, 3, 4.',
        'The order is: GOLD (1), GREEN (2), BLUE (3), RED (4). The azure (BLUE) jar is at rank 3.'
      ],
      children: ['ante-lapis-key']
    },
    {
      id: 'ante-lapis-key',
      locationId: 'antechamber',
      parentId: 'ante-jar-puzzle',
      type: 'item',
      label: 'Lapis Key',
      narrative:
        'You lift the BLUE jar carefully — instead of a trap, a small lapis lazuli key slides out from beneath it. The key is shaped like a reed, etched with the cartouche of Pharaoh Amenhotep. The Statue of Anubis across the chamber glints — a keyhole is visible at its base.',
      rewardItem: 'lapis-key'
    },
    {
      id: 'ante-statue-anubis',
      locationId: 'antechamber',
      parentId: null,
      type: 'locked',
      label: 'Statue of Anubis',
      narrative:
        'The lapis key turns with a soft click. The statue\'s base opens — revealing two hidden compartments. The first holds a sandstone tablet covered in scrambled hieroglyphs. The second contains a set of bronze grain scales, three piles of grain beside them, and a papyrus scroll listing their paired weights.',
      lockedNarrative:
        'An enormous statue of Anubis looms at the far end of the chamber, its jackal head catching the torchlight. A keyhole shaped like a reed is set into the base. The statue\'s obsidian eyes seem to track your movements.',
      lockedByItem: 'lapis-key',
      children: ['ante-sandstone-tablet', 'ante-grain-scales']
    },
    {
      id: 'ante-sandstone-tablet',
      locationId: 'antechamber',
      parentId: 'ante-statue-anubis',
      type: 'puzzle',
      label: 'Sandstone Tablet',
      narrative:
        'A sandstone tablet lies in the first compartment, its hieroglyphs scratched and rearranged out of order. A footnote in ancient Greek reads: "The letters are scattered like dust in the wind. Gather them to find the ruler who rests here."',
      question: 'The tablet reads: "AHOPHAR — KING OF THE NILE"\n\nWhat title do these scattered letters reveal?',
      answer: 'PHARAOH',
      hints: [
        'The tablet holds the same letters as the ruler\'s title — they\'ve just been scattered out of order. An Egyptian ruler\'s title, not just a name.',
        'Rearrange the seven letters of "AHOPHAR" to form the title of an Egyptian ruler. It starts with P.',
        'PHARAOH uses the letters P, H, A, R, A, O, H — the exact same letters as AHOPHAR.'
      ],
      children: ['ante-copper-seal']
    },
    {
      id: 'ante-copper-seal',
      locationId: 'antechamber',
      parentId: 'ante-sandstone-tablet',
      type: 'item',
      label: 'Copper Seal',
      narrative:
        'As the letters realign on the tablet, a small copper seal drops from a hidden slot beneath it. The seal is stamped with the image of a grain stalk and a balance scale. On its reverse, a reed symbol is etched — matching the inner passage door beyond the western gate.',
      rewardItem: 'copper-seal'
    },
    {
      id: 'ante-grain-scales',
      locationId: 'antechamber',
      parentId: 'ante-statue-anubis',
      type: 'puzzle',
      label: 'Grain Scales',
      narrative:
        'Three piles of grain offerings sit before the statue, each on a bronze scale. A papyrus scroll lists the weights of pairs of piles — but strangely, no individual weight is given. "Find the weight of the second pile to balance the scales."',
      question:
        'The scroll reads:\nPile A + Pile B = 15 stone\nPile B + Pile C = 20 stone\nPile A + Pile C = 13 stone\n\nHow many stone does Pile B contain?',
      answer: '11',
      hints: [
        'The scroll only tells you the weight of pairs, not individual piles. An offering niche in this chamber contains a papyrus that explains how to solve systems of equations — it may help.',
        'Add all three equations: (A+B) + (B+C) + (A+C) = 15 + 20 + 13. That gives 2A + 2B + 2C = 48, so A + B + C = 24.',
        'With all three weighing 24 stone, subtract Pile A + Pile C (13): B = 24 - 13 = 11. Pile B weighs 11 stone.'
      ],
      children: ['ante-lotus-token']
    },
    {
      id: 'ante-lotus-token',
      locationId: 'antechamber',
      parentId: 'ante-grain-scales',
      type: 'item',
      label: 'Lotus Token',
      narrative:
        'The scales balance perfectly at 11 stone. A drawer beneath the scales clicks open — inside is a carved lotus token of pale green stone, cool and smooth. Its petals are etched with the symbol of the western gate.',
      rewardItem: 'lotus-token'
    },
    {
      id: 'ante-sacred-niche',
      locationId: 'antechamber',
      parentId: null,
      type: 'locked',
      label: 'Sacred Niche',
      narrative:
        'The scarab amulet fits the niche perfectly — wings clicking into place. A hidden compartment slides open, revealing a papyrus covered in careful equations. It explains the Egyptian method for solving systems of weights — add all paired measurements, halve the total, then subtract one pair to isolate the third.',
      lockedNarrative:
        'A small niche is carved into the wall beside the grain offerings. A scarab-shaped depression marks its center — it matches the amulet you found in the Entrance Chamber.',
      lockedByItem: 'scarab-amulet',
      children: ['ante-weighing-papyrus']
    },
    {
      id: 'ante-weighing-papyrus',
      locationId: 'antechamber',
      parentId: 'ante-sacred-niche',
      type: 'dialogue',
      label: 'Weighing Papyrus',
      narrative:
        'You carefully remove the papyrus. The equations are annotated in red ink:\n\n"To find one pile from three pairs:\n1. Add all three pair-sums together.\n2. Halve the result — this is the total of all three piles.\n3. Subtract the pair that does NOT include the pile you seek."\n\nThis technique should help with the grain scales across the chamber.\n\nA border of tiny ibis-headed figures runs along the papyrus\'s edge — Thoth\'s symbol, marking the text as one of sacred measurement. The divine scribe was said to record every judgment on his scroll.',
      children: []
    },
    {
      id: 'ante-western-gate',
      locationId: 'antechamber',
      parentId: null,
      type: 'locked',
      label: 'Western Gate',
      narrative:
        'The lotus token slots into the gate\'s central mechanism. Ancient gears grind and the gate slides open — revealing a short inner passage sealed by another, smaller door.',
      lockedNarrative:
        'A stone gate bars the western end of the chamber. A lotus-shaped recess is carved into its locking mechanism. The gate hums faintly, as if already on the verge of opening.',
      lockedByItem: 'lotus-token',
      children: ['ante-inner-passage']
    },
    {
      id: 'ante-inner-passage',
      locationId: 'antechamber',
      parentId: 'ante-western-gate',
      type: 'locked',
      label: 'Inner Passage',
      narrative:
        'The copper seal fits the reed-shaped lock. The inner door slides upward into the ceiling, and beyond it, torchlight illuminates a long corridor of towering pillars — the Hall of Pillars.',
      lockedNarrative:
        'The inner passage ends in a smaller stone door with a reed-shaped lock. A seal stamped with the same symbol is needed to open it.',
      lockedByItem: 'copper-seal',
      children: ['ante-to-hall']
    },
    {
      id: 'ante-to-hall',
      locationId: 'hall',
      parentId: 'ante-inner-passage',
      type: 'dialogue',
      label: 'Enter the Hall of Pillars',
      narrative:
        'You step into the corridor. Massive pillars carved to resemble the gods stretch before you into the darkness — their lapis lazuli eyes catch the light as you approach.',
      children: []
    },

    // ===== HALL OF PILLARS =====
    {
      id: 'hall-pillar-pedestal',
      locationId: 'hall',
      parentId: null,
      type: 'dialogue',
      label: 'Pillar Pedestal',
      narrative:
        'Four stone pillars stand along the corridor, each carved to represent a different god: Osiris, Isis, Ra, and Anubis. The Isis pillar shows her wearing the throne-shaped crown, one arm cradling the infant Horus while the other holds an ankh — the queen of magic, wife to Osiris, protector of her son. A scroll on a pedestal between them lists the rules for invocation. "The gods must be invoked in the correct order to open the door," it warns.',
      children: ['hall-invocation-rules', 'hall-god-order']
    },
    {
      id: 'hall-invocation-rules',
      locationId: 'hall',
      parentId: 'hall-pillar-pedestal',
      type: 'dialogue',
      label: 'Invocation Rules',
      narrative:
        'Four clues are etched into the pillars and recorded on the pedestal scroll:\n\n1. Osiris is NOT invoked first or last.\n2. Ra is invoked BEFORE Isis.\n3. Anubis is invoked LAST.\n4. Isis is NOT invoked second.\n\nA note in the margin reads: "The queen follows her lord — but neither opens nor closes the court."',
      children: []
    },
    {
      id: 'hall-god-order',
      locationId: 'hall',
      parentId: 'hall-pillar-pedestal',
      type: 'puzzle',
      label: 'God Order Puzzle',
      narrative:
        'The pillars must be touched in the correct order. The scroll lists four rules — only one sequence satisfies them all.',
      question: 'Four pillars stand before you: Ra, Osiris, Isis, and Anubis.\n\nWhich pillar is invoked SECOND?',
      answer: 'OSIRIS',
      hints: [
        'The pedestal between the pillars holds a scroll with four rules. Use them to determine the full invocation order.',
        'With Anubis at position 4, and Isis not at position 2 (clue 4) or 1 (because Ra must come before her), Isis must be at position 3. Ra must be before her, so Ra = 1. That leaves Osiris at position 2.',
        'The order is: Ra (1st), Osiris (2nd), Isis (3rd), Anubis (4th). The SECOND pillar is OSIRIS.'
      ],
      children: ['hall-osiris-token']
    },
    {
      id: 'hall-osiris-token',
      locationId: 'hall',
      parentId: 'hall-god-order',
      type: 'item',
      label: 'Osiris Token',
      narrative:
        'The pillars rumble as the correct order is invoked. A stone token carved with the crook-and-flail of Osiris drops from a recess in the pedestal. At the end of the hall, an inscription on the wall pulses with a faint green light.',
      rewardItem: 'osiris-token'
    },
    {
      id: 'hall-wall-inscription',
      locationId: 'hall',
      parentId: null,
      type: 'locked',
      label: 'Wall Inscription',
      narrative:
        'The Osiris token activates the inscription. Faded hieroglyphs sharpen into legibility — a riddle carved in ancient Greek, its letters glowing faintly as you read.',
      lockedNarrative:
        'At the end of the Hall of Pillars, a final inscription is carved into the wall — but the text is too faded to read. An indentation in the stone matches the crook-and-flail shape of an Osiris token.',
      lockedByItem: 'osiris-token',
      children: ['hall-scribe-riddle']
    },
    {
      id: 'hall-scribe-riddle',
      locationId: 'hall',
      parentId: 'hall-wall-inscription',
      type: 'puzzle',
      label: 'Scribe\'s Riddle',
      narrative:
        'The torchlight catches the letters as they pulse faintly. "I am the scribe of the gods. My quill wrote the Book of the Dead. What is my name?"',
      question:
        'Riddle of the Egyptian god:\n\n"I am the divine scribe of the Egyptian pantheon.\nThe Greeks knew my counterpart as Hermes.\nMy head is that of an ibis.\nI measured the stars and recorded every deed.\nWho am I?"\n\nName me.',
      answer: 'THOTH',
      hints: [
        'The inscription at the end of the hall describes an ibis-headed deity who served as the scribe of the gods.',
        'This ibis-headed god was the scribe of the underworld, recording the verdict of the weighing of the heart ceremony. His name is five letters, starting with T.',
        'The god is THOTH — divine scribe, counterpart to the Greek Hermes, depicted with an ibis head.'
      ],
      children: ['hall-scribes-quill']
    },
    {
      id: 'hall-scribes-quill',
      locationId: 'hall',
      parentId: 'hall-scribe-riddle',
      type: 'item',
      label: 'Scribe\'s Quill',
      narrative:
        'The inscription brightens and a small stone quill drops from a hidden compartment above it — carved from obsidian, impossibly sharp. The sundial on the floor flares to life, its ancient mechanism unlocked.',
      rewardItem: 'scribes-quill'
    },
    {
      id: 'hall-sacred-sundial',
      locationId: 'hall',
      parentId: null,
      type: 'locked',
      label: 'Sacred Sundial',
      narrative:
        'The scribe\'s quill fits a slot in the sundial\'s obelisk gnomon. The mechanism activates — a sequence of shadow measurements appears on the stone floor, each hour\'s shadow precisely recorded.',
      lockedNarrative:
        'A sundial is carved into the stone floor between the pillars. Its gnomon — a tall bronze obelisk — stands dormant, a quill-shaped slot visible at its base. The mechanism remains silent.',
      lockedByItem: 'scribes-quill',
      children: ['hall-shadow-marks', 'hall-shadow-puzzle']
    },
    {
      id: 'hall-shadow-marks',
      locationId: 'hall',
      parentId: 'hall-sacred-sundial',
      type: 'dialogue',
      label: 'Shadow Marks',
      narrative:
        'The sundial\'s surface now glows with markings:\n\nSunrise: 128 cubits\nHour 1: 64 cubits\nHour 2: 32 cubits\nHour 3: 16 cubits\nHour 4: ?\n\nThe stone beside the dial is engraved: "The priest who cannot name the fourth shadow shall not pass."',
      children: []
    },
    {
      id: 'hall-shadow-puzzle',
      locationId: 'hall',
      parentId: 'hall-sacred-sundial',
      type: 'puzzle',
      label: 'Shadow Puzzle',
      narrative:
        'An inscription beside the sundial reads: "Ra\'s shadow shrinks by half with each passing hour. Read the pattern." The fourth hour\'s shadow is missing from the dial.',
      question: 'What is the fourth shadow\'s length?',
      answer: '8',
      hints: [
        'The shadow marks on the sundial\'s surface show a clear pattern. A weighing papyrus in the Antechamber of Offerings described a similar technique — halving a total to reveal a hidden value. Look for the same principle here.',
        'Each hour, the shadow is exactly half the length of the previous hour. The pattern is: divide by 2 each time.',
        'The fourth shadow: 16 ÷ 2 = 8 cubits.'
      ],
      children: ['hall-sun-disk']
    },
    {
      id: 'hall-sun-disk',
      locationId: 'hall',
      parentId: 'hall-shadow-puzzle',
      type: 'item',
      label: 'Sun Disk',
      narrative:
        'The sundial\'s fourth marker lights up — 8 cubits. A golden sun disk rises from the center of the dial, warm as midday. At the far end of the hall, the vault entrance glows in response, its seal waiting.',
      rewardItem: 'sun-disk'
    },
    {
      id: 'hall-vault-entrance',
      locationId: 'hall',
      parentId: null,
      type: 'locked',
      label: 'Vault Entrance',
      narrative:
        'The sun disk slots into the vault door. With a deep grinding sound, the door of polished black granite slides open — the Burial Vault lies beyond, lit only by the soft glow of gold.',
      lockedNarrative:
        'At the end of the Hall of Pillars, a vault door of polished black granite bars the way. A circular recess in its center is engraved with the rays of the sun. It awaits a disk.',
      lockedByItem: 'sun-disk',
      children: ['hall-to-vault']
    },
    {
      id: 'hall-to-vault',
      locationId: 'vault',
      parentId: 'hall-vault-entrance',
      type: 'dialogue',
      label: 'Enter the Burial Vault',
      narrative:
        'The vault door opens onto a domed chamber of black granite. The pharaoh\'s sarcophagus rests on a raised platform in the center, its gold inlay catching the faint light.',
      children: []
    },

    // ===== BURIAL VAULT =====
    {
      id: 'vault-sarcophagus-lid',
      locationId: 'vault',
      parentId: null,
      type: 'puzzle',
      label: 'Sarcophagus Lid',
      narrative:
        'The pharaoh\'s sarcophagus is engraved with a riddle on its lid. The gold inlay catches the torchlight, making the letters pulse. "The pharaoh\'s spirit must be judged. Answer this to proceed."',
      question:
        'Riddle of the Afterlife:\n\n"I am the goddess whose hieroglyph is the throne.\nI am the wife of Osiris and mother of Horus.\nI am the protector of the dead and goddess of magic.\nWho am I?"\n\nName me.',
      answer: 'ISIS',
      hints: [
        'She wore a throne upon her head, and her name is woven into every story of Osiris and Horus.',
        'This goddess used her magic to resurrect Osiris and protect her son Horus. Her name is short — only four letters.',
        'The goddess is ISIS — protector of the dead, goddess of magic, wife of Osiris, and mother of Horus.'
      ],
      children: ['vault-death-scroll']
    },
    {
      id: 'vault-death-scroll',
      locationId: 'vault',
      parentId: 'vault-sarcophagus-lid',
      type: 'item',
      label: 'Death Scroll',
      narrative:
        'The sarcophagus lid hisses and a compartment slides open. Inside is a scroll of papyrus bound with a black ribbon — the Book of Passing. "The number that follows is found in the difference," reads the opening line. The wall dials across the chamber begin to glow.',
      rewardItem: 'death-scroll'
    },
    {
      id: 'vault-wall-dials',
      locationId: 'vault',
      parentId: null,
      type: 'locked',
      label: 'Wall Dials',
      narrative:
        'The death scroll animates the wall dials. Eight rotating stone rings now spin freely, each displaying a single digit. The first seven are already set — only the eighth rings remain blank.',
      lockedNarrative:
        'A secondary door at the back of the vault is sealed with eight rotating dials. They are frozen in place, and a small slot labelled "Book of Passing" remains empty. The mechanism is inert.',
      lockedByItem: 'death-scroll',
      children: ['vault-dial-sequence']
    },
    {
      id: 'vault-dial-sequence',
      locationId: 'vault',
      parentId: 'vault-wall-dials',
      type: 'puzzle',
      label: 'Dial Sequence',
      narrative:
        'The dials currently display:\n\n1 — 1 — 2 — 4 — 7 — 11 — 16 — ?\n\nAn inscription above the dials reads: "The number that follows is found in the difference between the numbers before it."',
      question: 'What number belongs on the FINAL dial?',
      answer: '22',
      hints: [
        'The spaces between the numbers tell their own story — each gap grows by the same small step.',
        'Subtract each number from the next: 1−1=0, 2−1=1, 4−2=2, 7−4=3, 11−7=4, 16−11=5. The differences increase by 1 each time.',
        'The next difference after 5 is 6. So: 16 + 6 = 22.'
      ],
      children: ['vault-anubis-seal']
    },
    {
      id: 'vault-anubis-seal',
      locationId: 'vault',
      parentId: 'vault-dial-sequence',
      type: 'item',
      label: 'Anubis Seal',
      narrative:
        'The final dial clicks into place — 22. The wall panel swings open, revealing a small obsidian seal carved with the jackal head of Anubis. At the far end of the vault, a sealed treasury door glimmers with four empty symbol slots.',
      rewardItem: 'anubis-seal'
    },
    {
      id: 'vault-sealed-treasury',
      locationId: 'vault',
      parentId: null,
      type: 'locked',
      label: 'Sealed Treasury',
      narrative:
        'The Anubis seal slides into the final slot. The treasury door splits down the middle and parts — revealing a stone dial bearing four Egyptian symbols, each glowing faintly. A final inscription reads: "You have passed the trials. Now remember what you learned. The seal breaks for those who see."',
      lockedNarrative:
        'A sealed treasury door stands at the rear of the vault. Four symbol slots are carved into its surface — each one a different Egyptian emblem: ankh, eye, lotus, and scarab. One slot remains empty.',
      lockedByItem: 'anubis-seal',
      children: ['vault-final-seal']
    },
    {
      id: 'vault-final-seal',
      locationId: 'vault',
      parentId: 'vault-sealed-treasury',
      type: 'puzzle',
      label: 'Final Seal',
      narrative:
        'The stone dial has four positions, each marked with an Egyptian symbol and a clue. The entire chamber holds its breath — this is the final lock.',
      question:
        'The four positions read:\n\n☥ (Ankh) — The FIRST digit of the cartouche sum from the Entrance Chamber.\n𓂀 (Eye of Horus) — The number of LETTERS in the goddess\'s name from the riddle in this vault.\n𓆼 (Lotus) — The shadow length at the FOURTH hour on the sundial.\n𓋹 (Scarab) — The LAST digit of the missing number from the dial sequence.\n\nEnter the four-digit code:',
      answer: '1482',
      hints: [
        'The final seal asks for digits from four earlier puzzles. Retrace your steps — the cartouche sum (Entrance), the sarcophagus riddle (this vault), the sundial (Hall of Pillars), and the dial sequence (this vault) each hold one digit.',
        'Cartouche sum was 1453 — first digit is 1. The goddess in the sarcophagus riddle has a 4-letter name. The sundial\'s fourth shadow is 8. The dial sequence ends in 22 — whose last digit is 2.',
        'Ankh = 1 (from 1453). Eye of Horus = 4 (from ISIS). Lotus = 8 (fourth shadow on sundial). Scarab = 2 (22 ends in 2). Code: 1-4-8-2.'
      ],
      isMeta: true,
      children: ['vault-treasure-revealed']
    },
    {
      id: 'vault-treasure-revealed',
      locationId: 'vault',
      parentId: 'vault-final-seal',
      type: 'dialogue',
      label: 'Treasure Revealed',
      narrative:
        'The final seal shatters with a sound like breaking glass. The sarcophagus slides open on its own — golden light floods the vault, revealing treasures untouched for millennia: jeweled necklaces, golden death masks, and at the center, Amenhotep\'s crown. The shaft above grinds open. You\'re free — and richer than any pharaoh\'s dreams.',
      children: []
    }
  ]
};

export default data;
