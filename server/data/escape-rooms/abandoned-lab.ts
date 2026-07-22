import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'abandoned-lab',
  name: 'The Abandoned Lab',
  description: 'A mysterious laboratory abandoned decades ago. Solve the puzzles left behind by the missing scientists to escape!',
  difficulty: 'easy',
  intro: 'The emergency lights died three hours ago. You\'ve been reading Dr. Harrison\'s field journal by the flicker of a dying flashlight, piecing together what happened here. The pages are frantic: containment failures, research that crossed lines, a lockdown initiated from the inside. His last entry reads:\n\n"If someone finds this, I\'ve sealed the lab to protect what\'s outside — and what\'s inside. I\'ve left my work scattered like breadcrumbs. Follow them. Find the exit I couldn\'t reach."\n\nThe flashlight sputters out. Somewhere, a generator kicks in — the lab is still alive. And you are still inside.',
  locations: [
    {
      id: 'foyer',
      name: 'The Foyer',
      description: 'A cramped reception area with a dusty desk and a row of employee lockers. A reinforced door to the east has a digital keypad.'
    },
    {
      id: 'lab',
      name: 'The Laboratory',
      description: 'A sprawling lab filled with beakers, bubbling vials, and strange glowing substances. Diagrams of molecular structures cover the walls, and a tattered periodic table poster hangs crookedly above the centrifuge — atomic numbers scrawled beside each symbol in faded red marker.'
    },
    {
      id: 'vault',
      name: 'The Vault',
      description: 'A heavy steel door groans open to reveal a small, windowless room. Server racks line the walls, their indicator lights blinking red. In the center stands a podium with a terminal — this must be where Dr. Harrison sealed everything away.'
    }
  ],
  nodes: [
    // ===== FOYER =====
    {
      id: 'foyer-desk',
      locationId: 'foyer',
      parentId: null,
      type: 'dialogue',
      label: 'Reception Desk',
      narrative: 'You approach the reception desk. Among scattered papers and a stone-cold coffee mug, you spot a keypad lock securing a drawer. The keys labeled 1, 3, 5, and 8 are worn smooth from repeated use.',
      children: ['foyer-drawer', 'foyer-notebook']
    },
    {
      id: 'foyer-notebook',
      locationId: 'foyer',
      parentId: 'foyer-desk',
      type: 'dialogue',
      label: 'Staff Notebook',
      narrative: 'A small notebook lies open on the desk. It lists staff names with star ratings beside them:\nAlice — ★★★\nBob — ★\nCarol — ★★★★\nDave — ★★\nEve — ★★★★★\n\nThe person with the most stars appears to be Dr. Harrison\'s lab assistant.',
      children: []
    },
    {
      id: 'foyer-drawer',
      locationId: 'foyer',
      parentId: 'foyer-desk',
      type: 'puzzle',
      label: 'Locked Drawer',
      narrative: 'A yellowed sticky note on the monitor reads: "The drawer code is my birthday, but backwards." The calendar on the wall has May 18th, 1953 circled in red — Dr. Harrison\'s birthday: 5/18/53. The drawer\'s keypad awaits five digits.',
      question: 'Enter the five-digit drawer code:',
      answer: '35815',
      hints: [
        'The calendar on the wall has May 18th, 1953 circled in red — Dr. Harrison\'s birthday. The sticky note says "read it backwards."',
        'The date is 5/18/53 — read backwards: 35815.',
        'The code is 35815 — type 3-5-8-1-5.'
      ],
      children: ['foyer-badge']
    },
    {
      id: 'foyer-badge',
      locationId: 'foyer',
      parentId: 'foyer-drawer',
      type: 'item',
      label: 'Employee Badge',
      narrative: 'Inside the drawer you find an employee badge labeled "Eve Chen — Lab Assistant." The badge has a magnetic stripe.',
      rewardItem: 'employee-badge'
    },
    {
      id: 'foyer-lockers',
      locationId: 'foyer',
      parentId: null,
      type: 'locked',
      label: 'Staff Lockers',
      narrative: 'You swipe the badge and the locker clicks open. Inside you find a lab coat, safety goggles, and a small lockbox with a 2-digit combination.',
      lockedNarrative: 'A row of employee lockers stands against the wall, each with a magnetic badge reader. "EMPLOYEE BADGE REQUIRED" blinks above the scanner.',
      lockedByItem: 'employee-badge',
      children: ['foyer-locker-combo']
    },
    {
      id: 'foyer-locker-combo',
      locationId: 'foyer',
      parentId: 'foyer-lockers',
      type: 'puzzle',
      label: 'Lock Combination',
      narrative: 'Among the locker contents you find a small lockbox with a 2-digit combination. A note says: "Use the lab assistant\'s code."',
      question: 'The notebook showed the assistant with the most stars. Their locker combination is: the number of letters in their name, followed by their number of stars. Enter the 2-digit code:',
      answer: '35',
      hints: [
        'The staff notebook on the desk lists everyone\'s star ratings. Find the lab assistant — the person with the most stars.',
        'Eve has 5 stars (the most) and 3 letters in her name. The code is letters(3) followed by stars(5).',
        'The combination is 35 — type 3-5.'
      ],
      children: ['foyer-torn-paper']
    },
    {
      id: 'foyer-torn-paper',
      locationId: 'foyer',
      parentId: 'foyer-locker-combo',
      type: 'dialogue',
      label: 'Torn Paper',
      narrative: 'The lockbox clicks open. A torn scrap of paper is folded around a key tagged "EAST DOOR OVERRIDE." Three equations are scratched in pen:\n△ + ○ = 7\n○ + □ = 9\n□ + △ = 8\n\n△ ○ □',
      children: []
    },
    {
      id: 'foyer-door',
      locationId: 'foyer',
      parentId: null,
      type: 'puzzle',
      label: 'Reinforced Door',
      narrative: 'The reinforced door looms before you — a digital keypad blinks, expecting a 3-digit code. You need to find the right combination somewhere in this room.',
      question: 'Enter the 3-digit code for the door:',
      answer: '345',
      hints: [
        'Search the room for a clue with symbols — △, ○, and □. The staff lockers might hold the answer.',
        'The torn paper from the lockbox has equations: △ + ○ = 7, ○ + □ = 9, □ + △ = 8. Solve for each symbol.',
        'The code is 345 — type 3-4-5.'
      ],
      children: ['foyer-to-lab']
    },
    {
      id: 'foyer-to-lab',
      locationId: 'lab',
      parentId: 'foyer-door',
      type: 'dialogue',
      label: 'Enter the Lab',
      narrative: 'You step through the doorway into the laboratory. The air smells of chemicals and ozone.',
      children: []
    },

    // ===== LAB =====
    {
      id: 'lab-workbench',
      locationId: 'lab',
      parentId: null,
      type: 'dialogue',
      label: 'Central Workbench',
      narrative: 'A dusty tablet sits on the central workbench, its screen flickering with a chemical puzzle. Above it, a reference chart on the wall lists common lab elements with their atomic numbers scrawled beside them.',
      children: ['lab-reference-chart', 'lab-chemical-puzzle']
    },
    {
      id: 'lab-reference-chart',
      locationId: 'lab',
      parentId: 'lab-workbench',
      type: 'dialogue',
      label: 'Reference Chart',
      narrative: 'The reference chart reads:\nHydrogen (H) = 1\nOxygen (O) = 8\nCarbon (C) = 6\nPotassium (K) = 19\nIron (Fe) = 26\n\nThese seem deliberately highlighted — relevant to the tablet\'s puzzle.',
      children: []
    },
    {
      id: 'lab-chemical-puzzle',
      locationId: 'lab',
      parentId: 'lab-workbench',
      type: 'puzzle',
      label: 'Chemical Equation',
      narrative: 'The tablet screen reads:\n"H + O + C + K + Fe = LOCK"\n\n"What is the sum of the atomic numbers?"',
      question: 'Enter the sum of the atomic numbers:',
      answer: '60',
      hints: [
        'The reference chart above the workbench lists the atomic number for each highlighted element. Check it before solving the tablet.',
        'Add the atomic numbers: H(1) + O(8) + C(6) + K(19) + Fe(26).',
        'The sum is 60 — type 6-0.'
      ],
      children: ['lab-access-key']
    },
    {
      id: 'lab-access-key',
      locationId: 'lab',
      parentId: 'lab-chemical-puzzle',
      type: 'item',
      label: 'Security Badge',
      narrative: 'The tablet beeps and a drawer beneath the workbench slides open. Inside is a security badge labeled "RESEARCH CLEARANCE."',
      rewardItem: 'lab-access-key'
    },
    {
      id: 'lab-research-station',
      locationId: 'lab',
      parentId: null,
      type: 'locked',
      label: 'Research Station',
      narrative: 'You swipe the badge and the security gate retracts. The rear section of the lab opens — a microscope station sits beside a row of filing cabinets.',
      lockedNarrative: 'A security gate blocks access to the rear section of the lab. A badge scanner blinks — "RESEARCH CLEARANCE REQUIRED."',
      lockedByItem: 'lab-access-key',
      children: ['lab-microscope', 'lab-number-puzzle', 'lab-filing-cabinet']
    },
    {
      id: 'lab-microscope',
      locationId: 'lab',
      parentId: 'lab-research-station',
      type: 'dialogue',
      label: 'Microscope Station',
      narrative: 'A microscope on the far counter has a slide inserted. Looking through the eyepiece, you see colored dots arranged in neat rows — cellular structures, perhaps.',
      children: []
    },
    {
      id: 'lab-number-puzzle',
      locationId: 'lab',
      parentId: 'lab-research-station',
      type: 'puzzle',
      label: 'Number Sequence',
      narrative: 'A terminal on the wall displays a sequence of flickering digits:\n3 — 3 — 5 — 4 — 4 — 3 — 5 — 5 — 4 — ??\n\nA sticky note taped to the monitor reads: "Count the letters. One, two, three..."\n\nA keypad beneath the screen awaits the next number.',
      question: 'What is the next number in the sequence?',
      answer: '3',
      hints: [
        'The sticky note on the monitor says "Count the letters." Say each number from one to nine out loud — the sequence counts the letters in their names.',
        'one(3), two(3), three(5), four(4), five(4), six(3), seven(5), eight(5), nine(4). Next is ten — 3 letters.',
        'The answer is 3 — type 3.'
      ],
      children: ['lab-filing-key']
    },
    {
      id: 'lab-filing-key',
      locationId: 'lab',
      parentId: 'lab-number-puzzle',
      type: 'item',
      label: 'Cabinet Code',
      narrative: 'The terminal prints a small receipt:\nCABINET UNLOCK: 4-digit override active.\n\nA sticky note is attached — it\'s the cabinet\'s override code.',
      rewardItem: 'filing-cabinet-code'
    },
    {
      id: 'lab-filing-cabinet',
      locationId: 'lab',
      parentId: 'lab-research-station',
      type: 'locked',
      label: 'Filing Cabinet',
      narrative: 'The cabinet\'s digital lock clicks open. The top drawer slides out, revealing a word dial — four rotating rings, each with letters A through Z.',
      lockedNarrative: 'A tall metal filing cabinet stands against the wall, its drawer secured by a digital lock. A small screen reads "ENTER OVERRIDE CODE."',
      lockedByItem: 'filing-cabinet-code',
      children: ['lab-riddle']
    },
    {
      id: 'lab-riddle',
      locationId: 'lab',
      parentId: 'lab-filing-cabinet',
      type: 'puzzle',
      label: 'Filing Cabinet Riddle',
      narrative: 'The word dial has four rings. A clipboard hanging beside the drawer reads:\n\n"I have a nucleus but no brain.\nI have a membrane but no skin.\nI divide but never subtract.\nA microscope reveals my world.\n\nWhat am I?"',
      question: 'Enter the four-letter answer:',
      answer: 'cell',
      hints: [
        'The microscope station in the research area shows cellular structures on its slides. Think about what you would see under the lens.',
        'It has a nucleus and a membrane, and it divides to make more of itself.',
        'The answer is CELL — type C-E-L-L.'
      ],
      children: ['lab-vault-card']
    },
    {
      id: 'lab-vault-card',
      locationId: 'lab',
      parentId: 'lab-riddle',
      type: 'item',
      label: 'Vault Access Card',
      narrative: 'Behind the word dial, a hidden compartment slides open. Inside you find a keycard labeled "VAULT ACCESS — LEVEL 5."',
      rewardItem: 'vault-keycard'
    },
    {
      id: 'lab-vault-door',
      locationId: 'lab',
      parentId: null,
      type: 'locked',
      label: 'Vault Door',
      narrative: 'You swipe the keycard. With a deep grinding sound, the vault slides open.',
      lockedNarrative: 'At the end of the lab, a heavy steel door with a card reader bars your way. "VAULT — MAXIMUM CLEARANCE" is stamped above.',
      lockedByItem: 'vault-keycard',
      children: ['lab-to-vault']
    },
    {
      id: 'lab-to-vault',
      locationId: 'vault',
      parentId: 'lab-vault-door',
      type: 'dialogue',
      label: 'Enter the Vault',
      narrative: 'You step into the vault. Server racks line the walls, their indicator lights blinking red.',
      children: []
    },

    // ===== VAULT =====
    {
      id: 'vault-terminal',
      locationId: 'vault',
      parentId: null,
      type: 'dialogue',
      label: 'Server Terminal',
      narrative: 'A terminal on the central podium displays a single numeric sequence. A note taped to the monitor reads: "Fibonacci knew the key."',
      children: ['vault-fibonacci']
    },
    {
      id: 'vault-fibonacci',
      locationId: 'vault',
      parentId: 'vault-terminal',
      type: 'puzzle',
      label: 'Fibonacci Sequence',
      narrative: 'The terminal shows:\n0 — 1 — 1 — 2 — 3 — 5 — 8 — 13 — 21 — ??\n\nThe cursor pulses beside the final entry.',
      question: 'Enter the next number in the sequence:',
      answer: '34',
      hints: [
        'The note on the monitor says "Fibonacci knew the key." In a Fibonacci sequence, each number is the sum of the two before it.',
        '13 and 21 are the last two numbers — add them together.',
        'The next number is 34 — type 3-4.'
      ],
      children: ['vault-exit']
    },
    {
      id: 'vault-exit',
      locationId: 'vault',
      parentId: 'vault-fibonacci',
      type: 'puzzle',
      label: 'Exit Keypad',
      narrative: 'As the terminal accepts the Fibonacci answer, a hidden panel slides open behind you — revealing the exit keypad.\n\nA final message from Dr. Harrison appears on the terminal:\n\n"You\'ve come far. I\'m impressed. But one lock remains — the exit. I encoded it using clues from the puzzles you just solved. Think carefully."\n\nThe exit keypad glows with four empty digits.',
      question: 'A holographic display shows:\n\nDigit 1 — The THIRD digit from the foyer drawer code.\nDigit 2 — The FIRST digit of the laboratory atomic sum.\nDigit 3 — The number of LETTERS in the riddle\'s answer.\nDigit 4 — The LAST digit of the Fibonacci number.\n\nEnter the 4-digit exit code:',
      answer: '8644',
      hints: [
        'The holographic display asks for digits from four earlier puzzles. Retrace your steps — the foyer drawer, the lab equation, the filing cabinet riddle, and the Fibonacci sequence each hold one digit.',
        'Foyer drawer code was 35815 — third digit is 8. Atomic sum was 60 — first digit is 6. Riddle answer "cell" has 4 letters. Fibonacci was 34 — last digit is 4.',
        'The exit code is 8644 — type 8-6-4-4.'
      ],
      isMeta: true,
      children: []
    }
  ]
};

export default data;
