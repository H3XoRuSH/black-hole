import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'magician-alibi',
  name: 'The Magician\'s Alibi',
  description: 'Condemned for a magistrate\'s murder you did not commit, you have one night in Blackthorn Prison. A vanished illusionist has hidden a chain of puzzles that can expose the real culprit and open a path to freedom.',
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
        'The four definitions resolve to V, AN, I, and SH: a Roman five, an indefinite article, the solitary self, and a magician\'s signal for silence.',
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
        'Treat SILAS as a repeating key, so the six key letters are S I L A S S.',
        'With A=0, subtract each key value from the matching ciphertext value: E-S=M, Q-I=I, C-L=R, R-A=R, G-S=O, J-S=R. The result is MIRROR.'
      ]
    },
    {
      id: 'cell-17-3',
      locationId: 'cell-17',
      narrative: 'The card\'s polished back catches a reflection that points to a cut in the bars. Behind it, a strip of copper is engraved with five rungs. The second rung has been gouged away, and a legal seal hangs beside the gap.',
      question: 'The ladder is marked:\n\nCAGE\n[____]\nCAST\nLAST\nLOST\n\nA line beneath it reads: The missing rung is the matter the court hears. Every neighboring rung differs by one letter. What four-letter word belongs in the gap?',
      answer: 'case',
      hints: [
        'Each neighbor changes in one position only. The completed chain is CAGE -> CASE -> CAST -> LAST -> LOST.',
        'CASE is the legal matter heard by a court.'
      ]
    },
    {
      id: 'evidence-office-1',
      locationId: 'evidence-office',
      narrative: 'The copper ladder gives a metallic click and a section of wall rotates. Beyond it, the evidence office has been preserved like a crime scene. Dust lies everywhere except on a cabinet of tagged exhibits. Each tag bears a strange mark, as if the magician replaced labels with stage symbols.',
      question: 'The evidence ledger is out of order:\n\n* - torn testimony\n= - court docket\n# - judicial seal\n? - exhibit ledger\n& - smudged fingerprint\n+ - inmate\'s key\n% - unsigned confession\n\nSilas has written: The marks keep nothing of their wards except the beginning.\n\nThe cabinet repeats:\n\n# % & * + = ?\n\nWhat word should the cabinet accept?',
      answer: 'justice',
      hints: [
        'Read the opening letter of each item named after the symbol: judicial, unsigned, smudged, torn, inmate\'s, court, exhibit.',
        'The marks therefore spell J-U-S-T-I-C-E, so enter JUSTICE.'
      ]
    },
    {
      id: 'evidence-office-2',
      locationId: 'evidence-office',
      narrative: 'The cabinet opens a narrow drawer containing three brass tokens: a mask, a feather, and a ring. Their weights have been recorded on a slate, but the final evidence seal has been scratched blank. The objects look like props from Silas\'s act rather than anything from a murder scene.',
      question: 'A slate records:\n\nmask + mask + feather = 17\nfeather + ring = 11\nmask + ring + ring = 13\n\nThe seal beneath them is marked:\n\n(mask x ring) + feather\n\nWhat number belongs on the seal?',
      answer: '27',
      hints: [
        'Let the mask, feather, and ring be m, f, and r. The equations resolve to m=5, f=7, r=4.',
        'The seal is (5 x 4) + 7, which is 27.'
      ]
    },
    {
      id: 'evidence-office-3',
      locationId: 'evidence-office',
      narrative: 'The seal releases a case file bound in red thread. Three lines remain on its missing witness page, each ending at a torn edge. The same blank appears in three different grammatical positions.',
      question: 'The page shows:\n\nEYE ______\nSTAR ______\n______ STAND\n\nSilas has left one sentence: The same unseen person belongs to every line. The court erased the name.\n\nWhat word fills all three spaces?',
      answer: 'witness',
      hints: [
        'EYEWITNESS, STAR WITNESS, and WITNESS STAND all contain the same missing word.',
        'That word is WITNESS.'
      ]
    },
    {
      id: 'clockwork-workshop-1',
      locationId: 'clockwork-workshop',
      narrative: 'Behind the witness page, a spring-loaded panel opens into the clockwork workshop. Four shallow drawers stand beneath a stopped automaton. Their colors have faded, but the objects inside are still sharply outlined.',
      question: 'Four drawers stand from left to right. Each drawer has one color - red, blue, green, or gold - and holds one object - a key, lens, deck, or wire. No color or object repeats.\n\nThe wire is in the far-right drawer.\nThe blue drawer is immediately left of the lens.\nThe deck is somewhere left of the green drawer.\nThe key is to the right of the deck.\nThe key is not in the blue drawer.\nThe green drawer holds neither the lens nor the wire.\n\nWhich color holds the key?',
      answer: 'green',
      hints: [
        'If blue were second, the lens would be third, forcing the deck first and the key second; the key would then be in blue, which is forbidden.',
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
        'Each suspicious word contains one extra letter: guaard -> guard leaves A; cllosed -> closed leaves L; insiide -> inside leaves I; befobre -> before leaves B; stiair -> stair leaves I.',
        'Those intruders read ALIBI.'
      ]
    },
    {
      id: 'clockwork-workshop-3',
      locationId: 'clockwork-workshop',
      narrative: 'When the false letters are spoken aloud, a panel in the automaton\'s chest opens. Inside is a paper strip creased into three long channels, as if it was threaded through a stage prop. An arrow descends beside the channels and then climbs back.',
      question: 'The surviving letters are:\n\nLNRTAEN\n\nThe strip has three creased channels with an arrow tracing a path that drops down one channel at a time and climbs back. Place each letter along the arrow\'s path.\n\nWhat word appears when you read across all three channels, from the top row down?',
      answer: 'lantern',
      hints: [
        'The arrow steps through the channels in order: first channel, second channel, third channel, then second channel, first channel, second channel, third channel.',
        'Channel 1 holds L and A. Channel 2 holds N, T, E. Channel 3 holds R and N. Reading down: LA + NTE + RN = LANTERN.'
      ]
    },
    {
      id: 'chapel-1',
      locationId: 'chapel',
      narrative: 'The lantern\'s flame reaches the chapel foundations. A hidden door opens into the ash-covered chapel, where the blackened altar tile shines like a mirror without reflecting your face. A riddle has been scratched into it.',
      question: 'The tile says:\n\nI borrow the prisoner\'s outline but none of his guilt.\nAt noon I kneel; at dusk I stretch.\nA candle can banish me, yet a brighter lamp may make me sharper.\nI pass beneath a door without opening it.\nSilas calls me his twin without a face.\n\nWhat six-letter companion is named?',
      answer: 'shadow',
      hints: [
        'It is a silhouette that follows a body, stretches with changing light, and cannot be held.',
        'The six-letter answer is SHADOW.'
      ]
    },
    {
      id: 'chapel-2',
      locationId: 'chapel',
      narrative: 'The answer makes the altar tile slide aside. Behind it, organ pipes rise around a stained-glass panel with one broken pane. Six brass numbers are etched beneath the keys, and the organ gives a single low note.',
      question: 'A row of six brass numbers beneath the organ reads:\n\n2 - 6 - 12 - 20 - 30 - ??\n\nThe chapel\'s inscription reads: Each pane is bordered by the next two numbers. What number belongs in the broken pane?',
      answer: '42',
      hints: [
        'The terms are consecutive products: 1x2, 2x3, 3x4, 4x5, 5x6.',
        'The next is 6x7, or 42.'
      ]
    },
    {
      id: 'chapel-3',
      locationId: 'chapel',
      narrative: 'The new number releases a compartment in the organ bench. Inside is a priest\'s torn card and a small wooden mallet bearing the magistrate\'s seal. The card contains a compact piece of stage-language.',
      question: 'The card reads:\n\nGRAVE - R + L\n\nThe L is stamped at the far right edge of the card. The final object is the judge\'s wooden hammer. What five-letter word is wanted?',
      answer: 'gavel',
      hints: [
        'Removing R from GRAVE leaves GAVE.',
        'Putting the card\'s far-right L after it makes GAVEL, the judge\'s hammer.'
      ]
    },
    {
      id: 'understage-1',
      locationId: 'understage',
      narrative: 'The mallet fits the outline on the chapel trapdoor. Below, the understage theater smells of dust, ozone, and old velvet. An antique telegraph key is wired to the exit mechanism; its paper tape has been torn away, leaving only the rhythm.',
      question: 'The key has left this rhythm, with each slash marking a pause:\n\n./.../-.-./.-/.--./.\n\nSilas wrote beside it: Short breath. Long breath. The dead telegraph still knows the way.\n\nWhat word is tapped out?',
      answer: 'escape',
      hints: [
        'The slashes separate Morse characters: . is E, ... is S, -.-. is C, .- is A, .--. is P, and . is E.',
        'Together they spell ESCAPE.'
      ]
    },
    {
      id: 'understage-2',
      locationId: 'understage',
      narrative: 'The telegraph signal opens a trapdoor beneath the stage. In the pit below, floor tiles form a nearly complete four-by-four square. The magician\'s mark says that every completed row, column, and long diagonal balances to the same total.',
      question: 'The floor bears:\n\n16  3  2 13\n ? 10 11  8\n 9  6  7 12\n 4 15 14  1\n\nThe magician\'s mark says every completed row, column, and long diagonal balances to the same total. What number belongs in the blank?',
      answer: '5',
      hints: [
        'The second row must satisfy ? + 10 + 11 + 8 = 34.',
        'The blank is 5; the first column, 16 + 5 + 9 + 4, confirms it.'
      ]
    },
    {
      id: 'understage-3',
      locationId: 'understage',
      narrative: 'The square sinks into the floor and exposes a black iron door. Five narrow letter slots glow above its handle. Silas\'s final card rests in the lock, its paper warm as if someone has just held it.',
      question: 'Silas\'s final card reads:\n\nThe reflection leads.\nThe cell\'s confession lends its second breath.\nThe judge\'s hammer speaks first.\nThe square\'s number points into the cabinet\'s word.\nThe escape leaves its third mark.\n\nThe iron lock has five letter slots. What word belongs in them?',
      answer: 'magic',
      hints: [
        'The reflection puzzle answered MIRROR, so its leading letter is M. The cell confession answered VANISH, so its second letter is A; the judge\'s hammer was GAVEL, giving G.',
        'The square answered 5, so the fifth letter of JUSTICE is I. The telegraph answer was ESCAPE, whose third letter is C. The lock word is MAGIC.'
      ]
    }
  ]
};

export default data;
