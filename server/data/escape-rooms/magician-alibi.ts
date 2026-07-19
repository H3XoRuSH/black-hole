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
        'The ladder has only five rungs. Each step changes just one thing about the word before it — a single letter shifts, and everything else stays the same.',
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
        'Silas replaced every label with a symbol. Each symbol keeps only one thing from its ward — the very first letter of what it stands for.',
        'The marks therefore spell J-U-S-T-I-C-E, so enter JUSTICE.'
      ]
    },
    {
      id: 'evidence-office-3',
      locationId: 'evidence-office',
      narrative: 'The cabinet swings open, and a case file bound in red thread slides out from the bottom shelf. Three lines remain on its missing witness page, each ending at a torn edge. The same blank appears in three different grammatical positions.',
      question: 'The page shows:\n\nEYE ______\nSTAR ______\n______ STAND\n\nSilas has left one sentence: The same unseen person belongs to every line. The court erased the name.\n\nWhat word fills all three spaces?',
      answer: 'witness',
      hints: [
        'The torn page ends the same way in three different places. One word fits every blank — a person the court erased from the record.',
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
        'Four drawers, four colors, four objects — none repeated. The wire guards the far-right spot. Start there and work inward, one rule at a time.',
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
        'Those intruders read ALIBI.'
      ]
    },
    {
      id: 'clockwork-workshop-3',
      locationId: 'clockwork-workshop',
      narrative: 'When the false letters are spoken aloud, a panel in the automaton\'s chest opens. Inside is a paper strip creased into three long channels, as if it was threaded through a stage prop. An arrow descends beside the channels and then climbs back. Through the automaton\'s open chest, a lantern flickers to life — its flame catches a draft and ignites sconces beyond a crack in the wall, revealing a hidden passage to the ash-covered chapel.',
      question: 'The surviving letters are:\n\nLNRTAEN\n\nThe strip has three creased channels with an arrow tracing a path that drops down one channel at a time and climbs back. Place each letter along the arrow\'s path.\n\nSilas has scrawled beneath: "The lantern reveals what the arrow hides."',
      answer: 'lantern',
      hints: [
        'The paper was threaded through a stage prop — up and down, weaving through three channels like a zigzag. Read the letters as the arrow descends and climbs.',
        'Channel 1 holds L and A. Channel 2 holds N, T, E. Channel 3 holds R and N. Reading down: LA + NTE + RN = LANTERN.'
      ]
    },
    {
      id: 'chapel-3',
      locationId: 'chapel',
      narrative: 'The lantern light falls across the chapel\'s organ bench. A concealed compartment has sprung open. Inside rests a priest\'s torn card and a small wooden mallet bearing the magistrate\'s seal. The card contains a compact piece of stage-language.',
      question: 'The card reads:\n\nGRAVE - R + L\n\nThe L is stamped at the far right edge of the card. The final object is the judge\'s wooden hammer. What five-letter word is wanted?',
      answer: 'gavel',
      hints: [
        'The card holds a word with a letter scratched out and another stamped at the far edge. Remove what\'s crossed out, then add what\'s pushed to the margin.',
        'Putting the card\'s far-right L after GAVE makes GAVEL, the judge\'s hammer.'
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
        'Every row, column, and diagonal balances to the same weight. Look at a row you can already see completely — that total is your target.',
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
        'Silas left one last card. Every line in it points backward — to locks you\'ve already turned and words you\'ve already spoken.',
        'The reflection puzzle answered MIRROR, so its leading letter is M. The cell confession answered VANISH, so its second letter is A; the judge\'s hammer was GAVEL, giving G. The square answered 5, so the fifth letter of JUSTICE is I. The telegraph answer was ESCAPE, whose third letter is C. The lock word is MAGIC.'
      ]
    }
  ]
};

export default data;
