import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'magician-alibi',
  name: 'The Magician\'s Alibi',
  description: 'Condemned for a magistrate\'s murder you did not commit, you have one night in Blackthorn Prison. A vanished illusionist has hidden a chain of puzzles that can expose the real culprit and open a path to freedom.',
  difficulty: 'hard',
  intro: 'The execution bell is due at dawn. In Blackthorn Prison, your cell has been sealed since Magistrate Vale was killed, though the bloodied knife was found in another man\'s hand and your protest was buried beneath the verdict. Tonight, a deck of cards slides under the door. The ace of spades has been cut open. Inside is a note in violet ink:\n\nI performed at Vale\'s theater the night he died. You were framed. The real evidence is locked beneath the prison, and the warden has buried the one thing that clears you. Follow my marks. Do not trust any sentence that looks too clean.\n- Silas Vane\n\nA key turns somewhere beyond the wall. The corridor lights go dark. If Silas is still helping you, he has chosen riddles instead of ropes.',
  locations: [
    {
      id: 'cell-17',
      name: 'Cell Seventeen',
      description: 'A condemned cell of black stone, with a straw cot, a loose mortar block, and iron bars overlooking a corridor of unlit lamps. Someone has carved tiny card-suit marks into the wall beside the door.'
    },
    {
      id: 'evidence-office',
      name: 'The Evidence Office',
      description: 'A records office frozen in the middle of a trial: locked evidence cabinets, dust-filmed ledgers, and a long table beneath a dead gas lamp. The magistrate\'s trial dossier is missing its final page.'
    },
    {
      id: 'clockwork-workshop',
      name: 'The Clockwork Workshop',
      description: 'A disused prison workshop packed with gears, wire automata, brass drawers, and stage mechanisms confiscated from visitors. A narrow service door leads toward the chapel foundations.'
    },
    {
      id: 'chapel',
      name: 'The Prison Chapel',
      description: 'A narrow chapel sunk below the cell block, where violet light enters through cracked stained glass. The altar, confessionals, and silent organ are coated in ash, and a trapdoor bears the outline of a judge\'s mallet.'
    },
    {
      id: 'understage',
      name: 'The Understage',
      description: 'Beneath the chapel lies an abandoned theater: a low stage, velvet curtains, trapdoors, telegraph wire, and a black iron exit with a five-letter lock. The old audience seats face the darkness as if waiting for the final act.'
    }
  ],
  nodes: [
    // ===== CELL SEVENTEEN =====
    {
      id: 'cell-cot',
      locationId: 'cell-17',
      parentId: null,
      type: 'dialogue',
      label: 'Straw Cot',
      narrative: 'You kneel beside the straw cot. The mortar between two stones near the floor is crumbling — one block shifts under your fingers. Behind it, a thin strip of paper is wedged into a hollow. Nearby, a recessed panel in the wall has a narrow slot; something is meant to slide into it.',
      children: ['cell-loose-mortar', 'cell-wall-recess']
    },
    {
      id: 'cell-loose-mortar',
      locationId: 'cell-17',
      parentId: 'cell-cot',
      type: 'dialogue',
      label: 'Loose Mortar Block',
      narrative: 'The block pulls free. A narrow strip of paper slides out, but it carries no sentence. Four clipped impressions are stamped across it like pieces of a stage magician\'s private shorthand. A brass latch on the cell wall beside it has no visible keyhole.',
      children: ['cell-wall-latch']
    },
    {
      id: 'cell-wall-latch',
      locationId: 'cell-17',
      parentId: 'cell-loose-mortar',
      type: 'puzzle',
      label: 'Brass Wall Latch',
      narrative: 'The impressions sit beneath one another and the latch has six letter slots. You press your ear to the brass — it\'s hollow, waiting for a word.',
      question: 'The strip is stamped:\n\nTHE ROMAN SIGN FOR FIVE\nAN INDEFINITE ARTICLE\nTHE LONELY SELF\nTHE SOUND THAT STOPS A STAGE WHISPER\n\nThe impressions sit beneath one another. The latch has six letter slots. What word is hidden in the fragments?',
      answer: 'vanish',
      hints: [
        'The loose mortar block held a strip with four clipped impressions. Re-read the strip — each fragment names something short. A Roman numeral, a grammar word, the solitary self, and a stage cue.',
        'Write one short fragment beside each line: V, AN, I, and SH. Keep them in the order shown and join them only after all four have been identified.',
        'Join the fragments in order: V + AN + I + SH = VANISH.'
      ],
      children: ['cell-silas-card', 'cell-cipher-method']
    },
    {
      id: 'cell-silas-card',
      locationId: 'cell-17',
      parentId: 'cell-wall-latch',
      type: 'item',
      label: 'Silas\'s Playing Card',
      narrative: 'The brass latch yields when the word is whispered. Inside is a playing card with its face scraped blank except for a six-letter string. The name Silas Vane is stamped around the edge, and the card smells faintly of violet smoke. You tuck it away.',
      rewardItem: 'silas-card'
    },
    {
      id: 'cell-cipher-method',
      locationId: 'cell-17',
      parentId: 'cell-wall-latch',
      type: 'dialogue',
      label: 'Silas\'s Cipher Method',
      narrative: 'Silas\'s performances always used the Vigenère cipher — a rotating shift where each letter of a keyword tells you how many steps to move backward through the alphabet. Write the keyword beneath the ciphertext, repeating it to match the length. With A=0, B=1, C=2 through Z=25, subtract each keyword letter\'s value from the ciphertext letter above it. SILAS means S=18, I=8, L=11, A=0, S=18. The card in your hand has both the scrambled message and the performer\'s name around the edge — one is the lock, the other is the key.',
      children: []
    },
    {
      id: 'cell-iron-bars',
      locationId: 'cell-17',
      parentId: null,
      type: 'dialogue',
      label: 'Iron Bars',
      narrative: 'The iron bars overlook a dark corridor. Tiny card-suit marks are carved into the stone beside them — hearts, diamonds, clubs, spades — arranged in no obvious pattern. A cut in one bar catches the light at a strange angle.',
      children: ['cell-cipher-puzzle']
    },
    {
      id: 'cell-cipher-puzzle',
      locationId: 'cell-17',
      parentId: 'cell-iron-bars',
      type: 'puzzle',
      label: 'Cipher Puzzle',
      narrative: 'You hold the playing card to the violet light, recalling the cipher method Silas taught you. The six letters begin to resolve. The magician\'s name turns each one backward by a different amount.',
      question: 'On the card:\n\nEQCRGJ\n\nAround it: SILAS\n\nA line in purple ink reads: A name turns every letter; the same name returns when the road ends.\n\nWhat six-letter word is concealed?',
      answer: 'mirror',
      hints: [
        'The playing card from the wall latch has both the ciphertext (EQCRGJ) and the key (SILAS). Refresh your memory with Silas\'s cipher method if you need a refresher.',
        'Write SILAS beneath EQCRGJ, repeating the key if needed. With A=0, shift each cipher letter backward by the key letter\'s value: S is 18, I is 8, L is 11, A is 0, S is 18.',
        'E minus S = M, Q minus I = I, C minus L = R, R minus A = R, G minus S = O, J minus S = R. The word is MIRROR.'
      ],
      children: ['cell-cut-in-bars']
    },
    {
      id: 'cell-cut-in-bars',
      locationId: 'cell-17',
      parentId: 'cell-cipher-puzzle',
      type: 'dialogue',
      label: 'Cut in the Bars',
      narrative: 'The solved word catches the violet light. The card\'s polished back acts like a mirror, reflecting a narrow gap in the iron bars. Wedged inside is a copper strip engraved with five rungs. The strip\'s width matches the slot in the recessed wall panel beside the cot — it was clearly cut to fit there.',
      children: ['cell-copper-strip']
    },
    {
      id: 'cell-copper-strip',
      locationId: 'cell-17',
      parentId: 'cell-cut-in-bars',
      type: 'item',
      label: 'Copper Strip',
      narrative: 'You work the copper strip free. Five rungs are engraved along it: CAGE at the top, then a gouged gap where the second rung should be, followed by CAST, LAST, and LOST. A legal seal hangs beside the missing rung.',
      rewardItem: 'copper-strip'
    },
    {
      id: 'cell-wall-recess',
      locationId: 'cell-17',
      parentId: 'cell-cot',
      type: 'locked',
      label: 'Wall Recess',
      narrative: 'The copper strip slides into the slot. The recessed panel swings outward to reveal a copper engraving. A word ladder is etched across its surface — five rungs descending toward the floor, with the second rung gouged away. A legal seal hangs beside the missing rung, and the panel itself trembles as if it\'s ready to rotate.',
      lockedNarrative: 'Where the mortar gave way, a recessed panel sits flush with the wall. A thin horizontal slot runs across it — the width of a copper engraving strip. Something belongs here.',
      lockedByItem: 'copper-strip',
      children: ['cell-copper-ladder']
    },
    {
      id: 'cell-copper-ladder',
      locationId: 'cell-17',
      parentId: 'cell-wall-recess',
      type: 'puzzle',
      label: 'Word Ladder',
      narrative: 'You study the engraving up close. The word ladder is incomplete — one rung has been chiseled away. A legal seal bearing the court\'s insignia hangs beside the gap, and a small brass keypad waits beneath it for the correct four letters.',
      question: 'The ladder is marked:\n\nCAGE\n[____]\nCAST\nLAST\nLOST\n\nThe legal seal says: The missing rung must differ from both neighbors by exactly one letter, and it must name the matter the court hears. What four-letter word belongs in the gap?',
      answer: 'case',
      hints: [
        'The copper strip\'s five rungs form a word ladder — each rung changes one letter from the one above. Compare CAGE and CAST to see how the missing rung bridges them.',
        'The missing word shares three letters with CAGE and three with CAST, but the differing letter is not the same in both pairs. CAGE changes G, then changes E to reach CAST.',
        'CAGE changes G to S to make CASE, then CASE changes E to T to make CAST. The full ladder is CAGE → CASE → CAST → LAST → LOST. The missing rung is CASE.'
      ],
      children: ['cell-rotating-passage']
    },
    {
      id: 'cell-rotating-passage',
      locationId: 'evidence-office',
      parentId: 'cell-copper-ladder',
      type: 'dialogue',
      label: 'Rotating Passage',
      narrative: 'The correct word triggers a deep metallic click. The entire wall panel rotates on a hidden axis, and cold air pours through from the darkness beyond — the evidence office, frozen in time like a crime scene.',
      children: []
    },

    // ===== EVIDENCE OFFICE =====
    {
      id: 'office-exam-table',
      locationId: 'evidence-office',
      parentId: null,
      type: 'dialogue',
      label: 'Examination Table',
      narrative: 'A long table sits beneath a dead gas lamp. Dust lies thick on every surface except a leather-bound evidence ledger, which has been recently handled. Its pages list the office\'s tagged exhibits, each one marked with a strange symbol.',
      children: ['office-evidence-ledger']
    },
    {
      id: 'office-evidence-ledger',
      locationId: 'evidence-office',
      parentId: 'office-exam-table',
      type: 'dialogue',
      label: 'Evidence Ledger',
      narrative: 'The evidence ledger is out of order:\n\n* — torn testimony\n= — court docket\n# — judicial seal\n? — exhibit ledger\n& — smudged fingerprint\n+ — inmate\'s key\n% — unsigned confession\n\nSilas has written in violet beneath the list: \'The marks keep nothing of their wards except the beginning.\'',
      children: []
    },
    {
      id: 'office-evidence-cabinet',
      locationId: 'evidence-office',
      parentId: null,
      type: 'puzzle',
      label: 'Evidence Cabinet',
      narrative: 'The evidence cabinet stands against the far wall, its door sealed with a word lock. Seven strange symbols are etched in a row above the dial — the same marks that label the entries in the evidence ledger. The dial waits for a seven-letter response.',
      question: 'The cabinet shows:\n\n# % & * + = ?\n\nSilas has written beneath: \'The marks keep nothing of their wards except the beginning.\'\n\nWhat word should the cabinet accept?',
      answer: 'justice',
      hints: [
        'The examination table holds an evidence ledger that lists what each marked symbol represents. Cross-reference the cabinet\'s symbol order with the ledger entries — each symbol takes only the first letter of its label.',
        'Use the beginning of each ledger entry, not the visual shape of the symbol. # = Judicial seal (J), % = Unsigned confession (U), & = Smudged fingerprint (S), * = Torn testimony (T), + = Inmate\'s key (I), = = Court docket (C), ? = Exhibit ledger (E).',
        'Read in cabinet order: # % & * + = ? gives J-U-S-T-I-C-E. Enter JUSTICE.'
      ],
      children: ['office-docket-key']
    },
    {
      id: 'office-docket-key',
      locationId: 'evidence-office',
      parentId: 'office-evidence-cabinet',
      type: 'item',
      label: 'Court Docket Key',
      narrative: 'The cabinet swings open. Among the tagged exhibits, a brass key stamped \'COURT DOCKET — DRAWER ACCESS\' rests on a velvet-lined tray. The examination table has a locked drawer this should fit.',
      rewardItem: 'court-docket-key'
    },
    {
      id: 'office-locked-drawer',
      locationId: 'evidence-office',
      parentId: null,
      type: 'locked',
      label: 'Locked Drawer',
      narrative: 'The key turns and the drawer slides open. Inside rests a trial dossier bound in red thread, its pages yellowed but intact. The witness statement page is complete, but three lines contain the same deliberate mistake.',
      lockedNarrative: 'A drawer beneath the examination table is secured with a brass keyhole. A faded label reads \'TRIAL EXHIBITS — COURT ORDER REQUIRED.\' The cabinet may hold the key.',
      lockedByItem: 'court-docket-key',
      children: ['office-case-file']
    },
    {
      id: 'office-case-file',
      locationId: 'evidence-office',
      parentId: 'office-locked-drawer',
      type: 'dialogue',
      label: 'Red-Thread Dossier',
      narrative: 'The dossier\'s witness page shows three lines, each with an identical misspelling. The altered word appears in different positions, as if someone tried to erase a bystander without tearing the page:\n\nEYE WINTESS\nSTAR WINTESS\nWINTESS STAND\n\nSilas has written beneath: \'The court buried a name beneath a swapped pair. The same pair, every time. The phrases remember who should stand here.\'',
      children: ['office-swapped-testimony']
    },
    {
      id: 'office-swapped-testimony',
      locationId: 'evidence-office',
      parentId: 'office-case-file',
      type: 'puzzle',
      label: 'Swapped Testimony',
      narrative: 'The misspelled word appears in three positions, yet the letters are always the same — two of them simply reversed. Behind the page, a spring-loaded mechanism seems primed to release something.',
      question: 'The page shows:\n\nEYE WINTESS\nSTAR WINTESS\nWINTESS STAND\n\nSilas has written beneath: \'The court buried a name beneath a swapped pair. The same pair, every time. The phrases remember who should stand here.\' What name was buried?',
      answer: 'witness',
      hints: [
        'The trial dossier contains three lines, each with the same misspelling. EYE WINTESS, STAR WINTESS, WINTESS STAND — compare them side by side to see what person all three phrases need.',
        'WINTESS uses the right set of letters, but two are reversed. EYE needs a person, STAR needs a person, and STAND needs a person. Swap the pair that\'s out of order.',
        'Swap the N and T in WINTESS to get WITNESS: EYE WITNESS, STAR WITNESS, and WITNESS STAND.'
      ],
      children: ['office-spring-key']
    },
    {
      id: 'office-spring-key',
      locationId: 'evidence-office',
      parentId: 'office-swapped-testimony',
      type: 'item',
      label: 'Spring-Loaded Key',
      narrative: 'The page yields and a hidden compartment releases a tension-coiled key. You slide it out — it\'s shaped to fit the spring-loaded panel on the opposite wall.',
      rewardItem: 'spring-key'
    },
    {
      id: 'office-spring-panel',
      locationId: 'evidence-office',
      parentId: null,
      type: 'locked',
      label: 'Spring Panel',
      narrative: 'The spring-loaded key fits perfectly. The panel retracts with a hiss, and cold workshop air rushes through the gap. Beyond it: the glint of brass gears and wire frames.',
      lockedNarrative: 'A narrow wall panel is held shut by a spring-loaded mechanism. A keyhole shaped like a tension coil waits beside it. The dossier drawer might have released something that fits.',
      lockedByItem: 'spring-key',
      children: ['office-to-workshop']
    },
    {
      id: 'office-to-workshop',
      locationId: 'clockwork-workshop',
      parentId: 'office-spring-panel',
      type: 'dialogue',
      label: 'Enter the Workshop',
      narrative: 'You step through the panel into a disused workshop. Gears, wire automata, and stage props clutter every surface. In the center stands a life-sized automaton, frozen mid-gesture. Four brass drawers are set into the wall beside it, and a faint mechanical hum vibrates through the floor.',
      children: []
    },

    // ===== CLOCKWORK WORKSHOP =====
    {
      id: 'workshop-brass-drawers',
      locationId: 'clockwork-workshop',
      parentId: null,
      type: 'puzzle',
      label: 'Brass Drawer Array',
      narrative: 'Four shallow brass drawers stand in a row beneath a stopped automaton. Their colors have faded, but the objects inside are still sharply outlined through frosted glass panels. A gear slot in the automaton\'s chest waits for the right component.',
      question: 'Four drawers stand from left to right. Each drawer has one color — red, blue, green, or gold — and holds one object — a key, lens, deck, or wire. No color or object repeats.\n\nThe wire is in the far-right drawer.\nThe blue drawer is immediately left of the lens.\nThe deck is somewhere left of the green drawer.\nThe key is to the right of the deck.\nThe key is not in the blue drawer.\nThe green drawer holds neither the lens nor the wire.\n\nWhich color holds the key?',
      answer: 'green',
      hints: [
        'Four drawers, four colors, four objects — none repeated. The wire is fixed in the far-right spot. Start from position 4 and work inward, testing each rule one constraint at a time.',
        'Wire is position 4. Blue must be left of lens — test positions (1,2) or (2,3). Deck is left of green. Key is right of deck and not blue. Green holds neither lens nor wire. Only blue at 1 and lens at 2 works, giving deck at 1, key at 3, green at 3.',
        'Blue is first, lens second, deck first, key third, and wire fourth. Green cannot be first, second, or fourth, so it is third and holds the key. The answer is GREEN.'
      ],
      children: ['workshop-drawer-gear']
    },
    {
      id: 'workshop-drawer-gear',
      locationId: 'clockwork-workshop',
      parentId: 'workshop-brass-drawers',
      type: 'item',
      label: 'Brass Drawer Gear',
      narrative: 'The correct drawer opens. Inside is a toothed brass gear, its edges polished from use. It\'s the exact size of the slot in the automaton\'s chest — the missing piece that brings it to life.',
      rewardItem: 'drawer-gear'
    },
    {
      id: 'workshop-wire-automaton',
      locationId: 'clockwork-workshop',
      parentId: null,
      type: 'locked',
      label: 'Wire Automaton',
      narrative: 'The gear clicks into the automaton\'s chest. Copper teeth begin to turn, and a strip of paper feeds through the automaton\'s jaw — an old inspection log, calm in tone and wrong in places. The type bars seem to have struck some letters twice.',
      lockedNarrative: 'A life-sized wire automaton stands motionless in the center of the workshop. A slot in its chest is shaped like a missing gear — the mechanism is incomplete. The brass drawers might hold what it needs.',
      lockedByItem: 'drawer-gear',
      children: ['workshop-inspection-log']
    },
    {
      id: 'workshop-inspection-log',
      locationId: 'clockwork-workshop',
      parentId: 'workshop-wire-automaton',
      type: 'dialogue',
      label: 'Inspection Log',
      narrative: 'The log reads:\n\nAt second bell, the guaard remained at the north gate.\nThe inner door was cllosed before the rain.\nA brass lens lay insiide the glove box.\nThe warden\'s report was befobre the judge.\nNo one saw the torch beyond the stiair.\n\nFive words are counterfeit. Silas wrote underneath: \'Find the intruder and listen to what they whisper together.\'',
      children: ['workshop-stuttering-typewriter']
    },
    {
      id: 'workshop-stuttering-typewriter',
      locationId: 'clockwork-workshop',
      parentId: 'workshop-inspection-log',
      type: 'puzzle',
      label: 'Stuttering Typewriter',
      narrative: 'The automaton\'s jaw clacks as the log scrolls past. Each counterfeit word hides an extra keystroke — a letter that snuck in where it doesn\'t belong. A panel on the automaton\'s chest trembles, ready to spring open.',
      question: 'The log reads:\n\nAt second bell, the guaard remained at the north gate.\nThe inner door was cllosed before the rain.\nA brass lens lay insiide the glove box.\nThe warden\'s report was befobre the judge.\nNo one saw the torch beyond the stiair.\n\nFive words are counterfeit. Silas wrote underneath: \'Find the intruder and listen to what they whisper together.\' What word do they spell?',
      answer: 'alibi',
      hints: [
        'The inspection log has five counterfeit words. Read each sentence aloud and find the extra letter that doesn\'t belong — the typewriter stammered the same way five times.',
        'Correct each word: guaard → guard (extra A), cllosed → closed (extra L), insiide → inside (extra I), befobre → before (extra B), stiair → stair (extra I).',
        'The extra letters in order spell A-L-I-B-I. The word is ALIBI.'
      ],
      children: ['workshop-threaded-strip']
    },
    {
      id: 'workshop-threaded-strip',
      locationId: 'clockwork-workshop',
      parentId: 'workshop-stuttering-typewriter',
      type: 'item',
      label: 'Threaded Paper Strip',
      narrative: 'The automaton\'s chest panel springs open. Inside is a paper strip creased into three long channels, as if it was threaded through a stage prop. Seven letters — LNRTAEN — are printed across it. An arrow descends beside the channels and then climbs back. A hidden flame catches a draft and ignites sconces beyond a crack in the wall — the service door to the chapel.',
      rewardItem: 'threaded-strip'
    },
    {
      id: 'workshop-chapel-door',
      locationId: 'clockwork-workshop',
      parentId: null,
      type: 'locked',
      label: 'Chapel Service Door',
      narrative: 'You thread the paper strip through the three slots — top, middle, and bottom. The channel mechanism aligns, and the door\'s latch releases with a soft click. Now you must read what the channels reveal.',
      lockedNarrative: 'A narrow service door at the end of the workshop has three vertical slots — top, middle, and bottom — as if a paper strip was meant to be threaded through them. A faded sign reads \'CHAPEL ACCESS.\' The automaton may have fed out something that fits.',
      lockedByItem: 'threaded-strip',
      children: ['workshop-channel-zigzag']
    },
    {
      id: 'workshop-channel-zigzag',
      locationId: 'clockwork-workshop',
      parentId: 'workshop-chapel-door',
      type: 'puzzle',
      label: 'Channel Zigzag',
      narrative: 'The paper strip is threaded: top slot, middle slot, bottom slot. An arrow traces a zigzag path across the three channels, dipping and climbing. The door waits for the word the channels spell.',
      question: 'The surviving letters are:\n\nLNRTAEN\n\nThe strip has three creased channels with an arrow tracing a path that drops down one channel at a time and climbs back. Place each letter along the arrow\'s path, then read the channels in order from top to bottom.\n\nSilas has scrawled beneath: \'The light reveals what the arrow hides.\'',
      answer: 'lantern',
      hints: [
        'The threaded paper strip has three channels and seven letters. The arrow traces a zigzag: it visits the top, middle, bottom, middle, top, middle, bottom in a repeating pattern. Place the letters along the arrow\'s path.',
        'Using the arrow path: the 1st and 5th letters go in channel 1, the 2nd, 4th, and 6th in channel 2, and the 3rd and 7th in channel 3. Read each channel from top to bottom.',
        'The channels contain LA, NTE, and RN. Reading them in order gives LANTERN.'
      ],
      children: ['workshop-sconce-passage']
    },
    {
      id: 'workshop-sconce-passage',
      locationId: 'chapel',
      parentId: 'workshop-channel-zigzag',
      type: 'dialogue',
      label: 'Sconce Passage',
      narrative: 'The door swings open and wall sconces flare to life in sequence, illuminating a narrow stone passage. The air grows heavy with ash and incense as you step toward the prison chapel.',
      children: []
    },
    {
      id: 'workshop-workbench',
      locationId: 'clockwork-workshop',
      parentId: null,
      type: 'dialogue',
      label: 'Scattered Workbench',
      narrative: 'A long workbench is strewn with confiscated stage props — trick mirrors, collapsible canes, silk flowers. A wooden crate at the far end contains heavier mechanical pieces, including brass pipe fittings stamped with the prison chapel\'s seal.',
      children: ['workshop-props-crate']
    },
    {
      id: 'workshop-props-crate',
      locationId: 'clockwork-workshop',
      parentId: 'workshop-workbench',
      type: 'dialogue',
      label: 'Props Crate',
      narrative: 'Among the gears and clockwork birds, a brass organ stop catches your eye. A tag wired to it reads \'CHAPEL ORGAN — REGISTER IV — CONFISCATED BY ORDER OF THE WARDEN.\' It looks like it was pried from the chapel organ long ago.',
      children: ['workshop-organ-stop']
    },
    {
      id: 'workshop-organ-stop',
      locationId: 'clockwork-workshop',
      parentId: 'workshop-props-crate',
      type: 'item',
      label: 'Brass Organ Stop',
      narrative: 'You pocket the brass organ stop. The chapel\'s organ has been silent since the warden stripped it — this might restore something that was meant to stay hidden.',
      rewardItem: 'organ-stop'
    },
    {
      id: 'workshop-card-trick-lock',
      locationId: 'clockwork-workshop',
      parentId: null,
      type: 'locked',
      label: 'Magician\'s Card Lock',
      narrative: 'The playing card slides into the recess. The panel opens to reveal Silas\'s handwritten cipher notes — a table of letter shifts and the magician\'s private shorthand for the Vigenère method. It confirms the technique you used on the cipher in the cell.',
      lockedNarrative: 'A brass panel on the automaton\'s worktable bears a card-shaped recess. A faint violet inscription reads: \'Only the marked card opens the performer\'s notes.\' The card from your cell may have this exact shape.',
      lockedByItem: 'silas-card',
      children: ['workshop-cipher-notes']
    },
    {
      id: 'workshop-cipher-notes',
      locationId: 'clockwork-workshop',
      parentId: 'workshop-card-trick-lock',
      type: 'dialogue',
      label: 'Silas\'s Cipher Notes',
      narrative: 'Silas\'s notes show a Vigenère table with the alphabet spiraling around the card suits. His annotations are playful: \'The key is always a name. The name is always the one who signs the trick. The trick is always the same — turn every letter backward by the one beneath it.\' The cipher you solved in the cell was his signature move.',
      children: []
    },

    // ===== PRISON CHAPEL =====
    {
      id: 'chapel-organ-bench',
      locationId: 'chapel',
      parentId: null,
      type: 'locked',
      label: 'Organ Bench',
      narrative: 'The brass organ stop slides home. Pipes hum faintly as the organ bench\'s concealed compartment springs open. Inside rests a priest\'s torn card, five rotating letter shutters, and a small wooden mallet bearing the magistrate\'s seal.',
      lockedNarrative: 'The chapel organ\'s pipe-chest has an empty slot where a brass stop should be. A small plaque reads \'REGISTER IV — REMOVED BY ORDER OF THE WARDEN.\' Without it, the bench compartment won\'t open. The workshop\'s confiscated props might hold what was taken.',
      lockedByItem: 'organ-stop',
      children: ['chapel-priest-card']
    },
    {
      id: 'chapel-priest-card',
      locationId: 'chapel',
      parentId: 'chapel-organ-bench',
      type: 'dialogue',
      label: 'Priest\'s Torn Card',
      narrative: 'The card shows five rotating letter shutters spelling:\n\nG R A V E\n\nThe second shutter is marked with a red false-witness seal. A brass letter tile marked L lies outside the shutters, and a violet arrow points to the open end. A note reads: \'Remove the false witness. Let the seal enter. Keep the surviving testimony in order.\'',
      children: ['chapel-letter-shutters']
    },
    {
      id: 'chapel-letter-shutters',
      locationId: 'chapel',
      parentId: 'chapel-priest-card',
      type: 'puzzle',
      label: 'Letter Shutters',
      narrative: 'Five shutters stand in a row. One bears the red seal of a false witness — its testimony must be struck. A loose brass tile marked L waits to enter where the arrow points. The compartment beneath the shutters holds a wooden mallet, but it won\'t release until the shutters spell the mallet\'s name.',
      question: 'The card shows five shutters spelling:\n\nG R A V E\n\nThe second shutter is marked with a red false-witness seal. A brass letter tile marked L lies outside the shutters, and a violet arrow points to the open end. A note reads: \'Remove the false witness. Let the seal enter. Keep the surviving testimony in order.\' What five-letter word opens the organ compartment?',
      answer: 'gavel',
      hints: [
        'The concealed compartment contains five letter shutters showing GRAVE, a loose brass L tile, and a red seal. The seal marks one shutter as false — remove it and read what remains, then let the loose tile enter where the arrow points.',
        'Remove the second shutter marked R. The remaining shutters read GAVE. The violet arrow points to the end — place the loose L tile there.',
        'GRAVE minus R is GAVE. Add L at the open end to make GAVEL, the word for the sealed mallet.'
      ],
      children: ['chapel-magistrate-mallet']
    },
    {
      id: 'chapel-magistrate-mallet',
      locationId: 'chapel',
      parentId: 'chapel-letter-shutters',
      type: 'item',
      label: 'Magistrate\'s Mallet',
      narrative: 'The shutters click into place and the compartment releases. You lift out a small wooden mallet bearing the magistrate\'s personal seal — the same seal that condemned you. The trapdoor in the chapel floor has an outline that matches this exactly.',
      rewardItem: 'magistrate-mallet'
    },
    {
      id: 'chapel-trapdoor',
      locationId: 'chapel',
      parentId: null,
      type: 'locked',
      label: 'Trapdoor',
      narrative: 'The magistrate\'s mallet fits the outline perfectly. The trapdoor groans open, and a cold draft rises from below — the smell of dust, ozone, and old velvet. Steps spiral down into darkness.',
      lockedNarrative: 'A heavy trapdoor is set into the chapel floor, its surface coated in ash. A recessed outline matches a judge\'s mallet exactly — something ceremonial must press into it. The organ bench holds something of the magistrate\'s.',
      lockedByItem: 'magistrate-mallet',
      children: ['chapel-to-understage']
    },
    {
      id: 'chapel-to-understage',
      locationId: 'understage',
      parentId: 'chapel-trapdoor',
      type: 'dialogue',
      label: 'Enter the Understage',
      narrative: 'You descend the spiral stairs into a forgotten theater beneath the chapel. A low stage faces empty velvet seats. The air is thick with dust and ozone. An antique telegraph key is wired to the far wall, and a black iron exit door looms at the back of the stage.',
      children: []
    },
    {
      id: 'chapel-stained-glass',
      locationId: 'chapel',
      parentId: null,
      type: 'dialogue',
      label: 'Stained Glass Window',
      narrative: 'Cracked stained glass filters violet light across the ash-covered pews. Among the religious motifs, small card suits — hearts, diamonds, clubs, spades — are worked into the glass, barely visible in the colored panes. Silas left his mark even here.',
      children: []
    },
    {
      id: 'chapel-confessional',
      locationId: 'chapel',
      parentId: null,
      type: 'dialogue',
      label: 'Confessional Booth',
      narrative: 'The confessional booth is empty, its wooden screen warped by age and ash. A faint smell of violet smoke lingers inside the penitent\'s side, as if someone sat here not long ago — listening, waiting, leaving no confession behind.',
      children: []
    },

    // ===== UNDERSTAGE =====
    {
      id: 'understage-morse-reference',
      locationId: 'understage',
      parentId: null,
      type: 'dialogue',
      label: 'Telegraph Codebook',
      narrative: 'A faded telegraph operator\'s codebook is pinned to the wall beside the key. Each letter of the alphabet is assigned a pattern of short taps (dots) and long taps (dashes):\n\nA .-    B -...  C -.-.  D -..   E .\nF ..-.  G --.   H ....  I ..    J .---\nK -.-   L .-..  M --    N -.    O ---\nP .--.  Q --.-  R .-.   S ...   T -\nU ..-   V ...-  W .--   X -..-  Y -.--  Z --..\n\nSilas has underlined the word MORSE in violet ink, but the codebook gives no hint about which message the key has tapped out.',
      children: []
    },
    {
      id: 'understage-telegraph-key',
      locationId: 'understage',
      parentId: null,
      type: 'puzzle',
      label: 'Telegraph Key',
      narrative: 'The antique telegraph key is wired directly to the stage floor. Its paper tape has been torn away, leaving only a rhythm pressed into the brass contacts. Each cluster of taps is separated by a deliberate pause. Beneath the key, a trapdoor in the stage floor is bolted shut.',
      question: 'The key has left this rhythm, with each slash marking a pause:\n\n./.../-.-./.-/.--./.\n\nSilas wrote beside it: Short breath. Long breath. The dead telegraph still knows the way.\n\nWhat word is tapped out?',
      answer: 'escape',
      hints: [
        'The telegraph key\'s tape shows dots and dashes separated by slashes. Each cluster between pauses is one Morse character — short taps are dots, long taps are dashes.',
        'Decode each cluster: . = E, ... = S, -.-. = C, .- = A, .--. = P, . = E.',
        'The clusters decode as E, S, C, A, P, E. Together they spell ESCAPE.'
      ],
      children: ['understage-stage-controls']
    },
    {
      id: 'understage-stage-controls',
      locationId: 'understage',
      parentId: 'understage-telegraph-key',
      type: 'dialogue',
      label: 'Stage Controls',
      narrative: 'The telegraph signal triggers a mechanism beneath the stage. Bolts retract and the trapdoor yawns open, revealing a pit where floor tiles form a damaged four-by-four square. Three tiles are missing, and a small star marks the one connected to the exit mechanism. The magician\'s mark says that every completed row, column, and long diagonal balances to the same total.',
      children: ['understage-floor-tile-square']
    },
    {
      id: 'understage-floor-tile-square',
      locationId: 'understage',
      parentId: 'understage-stage-controls',
      type: 'puzzle',
      label: 'Floor Tile Square',
      narrative: 'The tile square gleams in the pit. Two rows are intact, two are damaged, and a star marks the tile wired to the exit mechanism. Every row, column, and long diagonal must balance to the same total. A keypad beside the pit waits for the starred tile\'s number.',
      question: 'The floor bears:\n\n16  3  2 13\n ★ 10  □  8\n 9  6  7 12\n 4 15  □  1\n\nThe star marks the tile to enter. Every row, column, and long diagonal must have the same total. What number belongs at ★?',
      answer: '5',
      hints: [
        'The floor tiles form a damaged four-by-four square. Two complete rows give you the magic sum: Row 1 (16+3+2+13=34) and Row 3 (9+6+7+12=34). The magic constant is 34.',
        'Row 4: 4+15+□+1=34 → the missing tile is 14. Column 3: 2+□+7+14=34 → the upper missing tile is 11. Row 2: ★+10+11+8=34.',
        '★ = 34 - 10 - 11 - 8 = 5. The starred tile is 5.'
      ],
      children: ['understage-exit-token']
    },
    {
      id: 'understage-exit-token',
      locationId: 'understage',
      parentId: 'understage-floor-tile-square',
      type: 'item',
      label: 'Exit Token',
      narrative: 'The correct number sinks the tile square into the floor. A circular brass token rises from the mechanism — stamped with a five-letter slot pattern. The black iron door at the back of the stage has a matching receiver.',
      rewardItem: 'exit-token'
    },
    {
      id: 'understage-iron-door',
      locationId: 'understage',
      parentId: null,
      type: 'locked',
      label: 'Black Iron Door',
      narrative: 'The exit token clicks into the receiver. The five letter slots above the door\'s handle flare violet, and Silas\'s final card materializes in the lock — its paper warm as if someone has just held it.',
      lockedNarrative: 'A black iron door bars the far end of the understage. Five narrow letter slots glow above its handle, and a circular token receiver is set beside them. The floor tile mechanism beneath the stage may hold what fits this slot.',
      lockedByItem: 'exit-token',
      children: ['understage-final-card']
    },
    {
      id: 'understage-final-card',
      locationId: 'understage',
      parentId: 'understage-iron-door',
      type: 'puzzle',
      label: 'Silas\'s Final Card',
      narrative: 'The final card shimmers into view inside the lock. Five cryptic lines are written in violet ink, each pointing backward — to locks you\'ve already turned and words you\'ve already spoken. The five letter slots glow, waiting.',
      question: 'Silas\'s final card reads:\n\nThe reflection leads.\nThe cell\'s confession lends its second breath.\nThe judge\'s hammer speaks first.\nThe square\'s number points into the cabinet\'s word.\nThe escape leaves its third mark.\n\nThe iron lock has five letter slots. What word belongs in them?',
      answer: 'magic',
      hints: [
        'Silas\'s final card lists five clues, each pointing to an answer from a previous puzzle. The reflection (the cipher solved in the cell), the confession (the cell\'s first word spoken), the hammer (the chapel\'s word), the cabinet\'s word (from the office), and the escape (the telegraph\'s word) — each holds one letter.',
        'MIRROR → first letter M. VANISH → second letter A. GAVEL → first letter G. JUSTICE → fifth letter I (the square\'s number was 5). ESCAPE → third letter C.',
        'M + A + G + I + C = MAGIC.'
      ],
      isMeta: true,
      children: []
    },
    {
      id: 'understage-velvet-curtains',
      locationId: 'understage',
      parentId: null,
      type: 'dialogue',
      label: 'Velvet Curtains',
      narrative: 'Heavy velvet curtains frame the stage, moth-eaten and stiff with age. Among the props stacked in the wings, a polished mirror panel catches a stray reflection — something the magician left to remind you where this began. The word you solved in the cell stares back from the glass.',
      children: []
    }
  ]
};

export default data;
