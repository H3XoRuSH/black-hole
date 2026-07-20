import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'magician-alibi',
  name: 'The Magician\'s Alibi',
  description: 'Condemned for a magistrate\'s murder you did not commit, you have one night in Blackthorn Prison. A vanished illusionist has hidden a chain of puzzles that can expose the real culprit and open a path to freedom.',
  difficulty: 'hard',
  intro: 'The execution bell is due at dawn. In Blackthorn Prison, your cell has been sealed since Magistrate Vale was killed, though the bloodied knife was found in another man\'s hand and your protest was buried beneath the verdict. Tonight, a deck of cards slides under the door. The ace of spades has been cut open. Inside is a note in violet ink:\n\nI performed at Vale\'s theater the night he died. You were framed. The real evidence is locked beneath the prison, and the warden has buried the only alibi. Follow my marks. Do not trust any sentence that looks too clean.\n- Silas Vane\n\nA key turns somewhere beyond the wall. The corridor lights go dark. If Silas is still helping you, he has chosen riddles instead of ropes.',
  locations: [
    {
      id: 'cell-17',
      name: 'Cell Seventeen',
      description: 'A condemned cell of black stone, with a straw cot, a loose mortar block, and iron bars overlooking a corridor of unlit lamps. Someone has carved tiny card-suit marks into the wall beside the door.'
    },
    {
      id: 'evidence-office',
      name: 'The Evidence Office',
      description: 'A records office frozen in the middle of a trial: locked evidence cabinets, dust-filmed ledgers, and a long table beneath a dead gas lamp. The magistrate\'s case file is missing its final page.'
    },
    {
      id: 'clockwork-workshop',
      name: 'The Clockwork Workshop',
      description: 'A disused prison workshop packed with gears, wire automata, brass drawers, and stage mechanisms confiscated from visitors. A narrow service door leads toward the chapel foundations.'
    },
    {
      id: 'chapel',
      name: 'The Prison Chapel',
      description: 'A narrow chapel sunk below the cell block, where violet light enters through cracked stained glass. The altar, confessionals, and silent organ are coated in ash, and a trapdoor bears the outline of a gavel.'
    },
    {
      id: 'understage',
      name: 'The Understage',
      description: 'Beneath the chapel lies an abandoned theater: a low stage, velvet curtains, trapdoors, telegraph wire, and a black iron exit with a five-letter lock. The old audience seats face the darkness as if waiting for the final act.'
    }
  ],
  puzzles: [
    {
      id: 'cell-17-1',
      locationId: 'cell-17',
      narrative: 'The loose stone behind the cot gives way under your fingers. A narrow strip of paper slides out, but it carries no sentence. Four clipped impressions are stamped across it like pieces of a stage magician\'s private shorthand. A brass latch on the cell wall has no visible keyhole.',
      question: 'The strip is stamped:\n\nTHE ROMAN SIGN FOR FIVE\nAN INDEFINITE ARTICLE\nTHE LONELY SELF\nTHE SOUND THAT STOPS A STAGE WHISPER\n\nThe impressions sit beneath one another. The latch has six letter slots. What word is hidden in the fragments?',
      answer: 'vanish',
      hints: [
        'Silas worked in fragments. A Roman numeral, a small grammar word, the solitary self, and a stage whisper — each gives up a sound when you name it.',
        'Write one short fragment beside each line: V, AN, I, and SH. Keep them in the order shown and join them only after all four have been identified.',
        'Join the fragments in order: V + AN + I + SH = VANISH.'
      ]
    },
    {
      id: 'cell-17-2',
      locationId: 'cell-17',
      narrative: 'The brass latch yields when the first word is whispered. Inside is a playing card with its face scraped blank except for a six-letter string. The name Silas Vane is stamped around the edge, and the card smells faintly of violet smoke.',
      question: 'On the card:\n\nEQCRGJ\n\nAround it: SILAS\n\nA line in purple ink reads: A name turns every letter; the same name returns when the road ends.\n\nWhat six-letter word is concealed?',
      answer: 'mirror',
      hints: [
        'The magician signed his name around the edge. His name is the key that turns every letter back to what it once was.',
        'Write SILAS beneath EQCRGJ, repeating the key if needed. Compare each vertical pair and move the upper letter backward by the key letter\'s distance around the alphabet.',
        'With A=0, subtract each key value from the matching ciphertext value: E-S=M, Q-I=I, C-L=R, R-A=R, G-S=O, J-S=R. The result is MIRROR.'
      ]
    },
    {
      id: 'cell-17-3',
      locationId: 'cell-17',
      narrative: 'The card\'s polished back catches a reflection that points to a cut in the bars. Behind it, a strip of copper is engraved with five rungs. The second rung has been gouged away, and a legal seal hangs beside the gap.',
      question: 'The ladder is marked:\n\nCAGE\n[____]\nCAST\nLAST\nLOST\n\nThe legal seal says: The missing rung must differ from both neighbors by exactly one letter, and it must name the matter the court hears. What four-letter word belongs in the gap?',
      answer: 'case',
      hints: [
        'Each rung changes one letter from the one above. Compare CAGE and CAST to see what the middle rung could be.',
        'The missing word shares three letters with CAGE and three with CAST, but the differing letter is not the same in both pairs.',
        'The missing word is CASE: CAGE changes G to S, then CASE changes E to T to make CAST. The full ladder is CAGE → CASE → CAST → LAST → LOST.'
      ]
    },
    {
      id: 'evidence-office-1',
      locationId: 'evidence-office',
      narrative: 'The copper ladder gives a metallic click and a section of wall rotates. Beyond it, the evidence office has been preserved like a crime scene. Dust lies everywhere except on a cabinet of tagged exhibits. Each tag bears a strange mark, as if the magician replaced labels with stage symbols. One faded label remains on the cabinet door: a hand-drawn star above the word "Testimony."',
      question: 'The evidence ledger is out of order:\n\n* - torn testimony\n= - court docket\n# - judicial seal\n? - exhibit ledger\n& - smudged fingerprint\n+ - inmate\'s key\n% - unsigned confession\n\nSilas has written: The marks keep nothing of their wards except the beginning.\n\nThe cabinet repeats:\n\n# % & * + = ?\n\nWhat word should the cabinet accept?',
      answer: 'justice',
      hints: [
        'Silas replaced every label with a symbol. Each symbol keeps only one thing from its ward — the very first letter of what it stands for.',
        'Use the beginning of each ledger description, not the visual shape of the symbol. Take those letters in the cabinet\'s order.',
        'The marks therefore spell J-U-S-T-I-C-E, so enter JUSTICE.'
      ]
    },
    {
      id: 'evidence-office-2',
      locationId: 'evidence-office',
      narrative: 'The cabinet swings open, and a case file bound in red thread slides out from the bottom shelf. Its witness page is complete, but three lines contain the same deliberate mistake. The altered word appears in different positions, as if someone tried to erase a witness without tearing the page.',
      question: 'The page shows:\n\nEYE WINTESS\nSTAR WINTESS\nWINTESS STAND\n\nSilas has written beneath: "The court buried a name beneath a swapped pair. The same pair, every time. The phrases remember who should stand here." What name was buried?',
      answer: 'witness',
      hints: [
        'The error is repeated, not accidental. Look at WINTESS in all three positions and ask what kind of person each complete phrase needs.',
        'WINTESS uses the right set of letters, but two are reversed. Find which pair was swapped and you will find who the court tried to bury.',
        'Swap the N and T in WINTESS to get WITNESS: EYE WITNESS, STAR WITNESS, and WITNESS STAND.'
      ]
    },
    {
      id: 'clockwork-workshop-1',
      locationId: 'clockwork-workshop',
      narrative: 'Behind the witness page, a spring-loaded panel opens into the clockwork workshop. Four shallow drawers stand beneath a stopped automaton. Their colors have faded, but the objects inside are still sharply outlined.',
      question: 'Four drawers stand from left to right. Each drawer has one color - red, blue, green, or gold - and holds one object - a key, lens, deck, or wire. No color or object repeats.\n\nThe wire is in the far-right drawer.\nThe blue drawer is immediately left of the lens.\nThe deck is somewhere left of the green drawer.\nThe key is to the right of the deck.\nThe key is not in the blue drawer.\nThe green drawer holds neither the lens nor the wire.\n\nWhich color holds the key?',
      answer: 'green',
      hints: [
        'Four drawers, four colors, four objects — none repeated. The wire guards the far-right spot. Start there and work inward, one rule at a time.',
        'Because wire is fourth, the blue-and-lens pair can only be positions one and two or positions two and three. Test each pair against the green drawer\'s exclusions and the deck/key order.',
        'Blue is first, lens second, deck first, key third, and wire fourth. Green cannot be first, second, or fourth, so it is third and holds the key.'
      ]
    },
    {
      id: 'clockwork-workshop-2',
      locationId: 'clockwork-workshop',
      narrative: 'The correct drawer opens and a wire automaton jerks awake. It feeds a strip of paper through its teeth. The strip is an old inspection log, calm in tone and wrong in places. The type bars seem to have struck some letters twice.',
      question: 'The log reads:\n\nAt second bell, the guaard remained at the north gate.\nThe inner door was cllosed before the rain.\nA brass lens lay insiide the glove box.\nThe warden\'s report was befobre the judge.\nNo one saw the lantern beyond the stiair.\n\nFive words are counterfeit. Silas wrote underneath: "Find the intruder and listen to what they whisper together." What word do they spell?',
      answer: 'alibi',
      hints: [
        'The typewriter stammered. In five places, the same key was struck twice. What letter snuck in where it doesn\'t belong?',
        'Restore each counterfeit word from its sentence. In each correction, identify the extra occurrence of a letter, even when the two copies are separated.',
        'The extra letters are A, L, I, B, and I. Together they read ALIBI.'
      ]
    },
    {
      id: 'clockwork-workshop-3',
      locationId: 'clockwork-workshop',
      narrative: 'When the false letters are spoken aloud, a panel in the automaton\'s chest opens. Inside is a paper strip creased into three long channels, as if it was threaded through a stage prop. An arrow descends beside the channels and then climbs back. A hidden flame catches a draft and ignites sconces beyond a crack in the wall, revealing a passage to the ash-covered chapel.',
      question: 'The surviving letters are:\n\nLNRTAEN\n\nThe strip has three creased channels with an arrow tracing a path that drops down one channel at a time and climbs back. Place each letter along the arrow\'s path, then read the channels in order from top to bottom.\n\nSilas has scrawled beneath: "The light reveals what the arrow hides."',
      answer: 'lantern',
      hints: [
        'The strip was threaded through three channels rather than read straight across. Think of the arrow as visiting the top, middle, bottom, middle, top, middle, bottom in a repeating zigzag.',
        'Using the arrow path, place the 1st and 5th letters in channel 1, the 2nd, 4th, and 6th in channel 2, and the 3rd and 7th in channel 3. Read each channel from top to bottom.',
        'The channels contain LA, NTE, and RN. Reading them in order gives LANTERN.'
      ]
    },
    {
      id: 'chapel-1',
      locationId: 'chapel',
      narrative: 'The new light falls across the chapel\'s organ bench. A concealed compartment has sprung open. Inside rests a priest\'s torn card, five rotating letter shutters, and a small wooden mallet bearing the magistrate\'s seal. The card contains a compact piece of stage-language.',
      question: 'The card shows five shutters spelling:\n\nG R A V E\n\nThe second shutter is marked with a red false-witness seal. A brass letter tile marked L lies outside the shutters, and a violet arrow points to the open end. A note reads: "Remove the false witness. Let the seal enter. Keep the surviving testimony in order." What five-letter word opens the organ compartment?',
      answer: 'gavel',
      hints: [
        'The shutters hold five letters, but the red seal identifies one as false. The brass tile replaces that letter at the end rather than changing the order of the others.',
        'Remove the second letter R from GRAVE. The remaining shutters read GAVE; place the loose L where the violet arrow points.',
        'GRAVE minus R is GAVE. Add L at the open end to make GAVEL, the word for the sealed mallet.'
      ]
    },
    {
      id: 'understage-1',
      locationId: 'understage',
      narrative: 'The mallet fits the outline on the chapel trapdoor. Below, the understage theater smells of dust, ozone, and old velvet. An antique telegraph key is wired to the exit mechanism; its paper tape has been torn away, leaving only the rhythm.',
      question: 'The key has left this rhythm, with each slash marking a pause:\n\n./.../-.-./.-/.--./.\n\nSilas wrote beside it: Short breath. Long breath. The dead telegraph still knows the way.\n\nWhat word is tapped out?',
      answer: 'escape',
      hints: [
        'The telegraph spoke in dots and dashes — a language with no alphabet, only rhythm. Each cluster between the pauses is one letter.',
        'Treat each slash-separated cluster as one Morse character. Decode the clusters one at a time from left to right.',
        'The clusters decode as E, S, C, A, P, E. Together they spell ESCAPE.'
      ]
    },
    {
      id: 'understage-2',
      locationId: 'understage',
      narrative: 'The telegraph signal opens a trapdoor beneath the stage. In the pit below, floor tiles form a damaged four-by-four square. Three tiles are missing, and a small star marks the one connected to the exit mechanism. The magician\'s mark says that every completed row, column, and long diagonal balances to the same total.',
      question: 'The floor bears:\n\n16  3  2 13\n ★ 10 □ 8\n 9  6  7 12\n 4 15 □ 1\n\nThe star marks the tile to enter. Every row, column, and long diagonal must have the same total. What number belongs at ★?',
      answer: '5',
      hints: [
        'Every row, column, and diagonal balances to the same total. Find that total from a complete row, then use the other missing tiles as stepping stones.',
        'The lower row gives its missing tile as 14. The third column then gives its missing tile as 11; use the second row to find the starred tile.',
        'The common total is 34. The missing tiles are 14 and 11, so ★ + 10 + 11 + 8 = 34 and ★ = 5.'
      ]
    },
    {
      id: 'understage-3',
      locationId: 'understage',
      narrative: 'The square sinks into the floor and exposes a black iron door. Five narrow letter slots glow above its handle. Silas\'s final card rests in the lock, its paper warm as if someone has just held it.',
      question: 'Silas\'s final card reads:\n\nThe reflection leads.\nThe cell\'s confession lends its second breath.\nThe judge\'s hammer speaks first.\nThe square\'s number points into the cabinet\'s word.\nThe escape leaves its third mark.\n\nThe iron lock has five letter slots. What word belongs in them?',
      answer: 'magic',
      hints: [
        'Silas left one last card. Every line in it points backward — to locks you\'ve already turned and words you\'ve already spoken.',
        'Identify the five earlier answers referenced by the card. Take the indicated letter from each: first, second, first, the square\'s number as a position, and third.',
        'MIRROR gives M, VANISH gives A, GAVEL gives G, the fifth letter of JUSTICE is I, and the third letter of ESCAPE is C. The lock word is MAGIC.'
      ]
    }
  ]
};

export default data;
