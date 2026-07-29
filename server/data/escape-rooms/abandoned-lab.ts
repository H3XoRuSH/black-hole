import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'abandoned-lab',
  name: 'The Abandoned Lab',
  description: 'A research facility sealed in emergency lockdown. The scientist who locked it from the inside left a trail — follow it to the exit.',
  difficulty: 'easy',
  intro: 'The emergency lights died three hours ago. You\'ve been reading Dr. Harrison\'s field journal by the flicker of a dying flashlight, piecing together what happened here. The pages are frantic: containment failures, research that crossed lines, a lockdown initiated from the inside. His last entry reads:\n\n"If someone finds this, I\'ve sealed the lab to protect what\'s outside — and what\'s inside. I\'ve left my work scattered like breadcrumbs. Follow them. Find the exit I couldn\'t reach."\n\nThe flashlight sputters out. Somewhere, a generator kicks in — the lab is still alive. And you are still inside.',
  locations: [
    {
      id: 'foyer',
      name: 'The Foyer',
      description: 'A cramped reception area, still under emergency power. The overhead fluorescents are dead, replaced by a dim red strip along the floor. The desk is scattered with papers; a stone-cold coffee mug sits exactly where someone left it in a hurry. A reinforced door to the east has a digital keypad.'
    },
    {
      id: 'lab',
      name: 'The Laboratory',
      description: 'The air carries the smell of chemicals and something faintly burnt — an experiment interrupted. Beakers and centrifuge tubes sit mid-run, frozen in place. Diagrams of molecular structures cover the walls, and a tattered periodic table poster hangs crookedly above the centrifuge. Emergency amber lighting makes every surface look like a crime scene. Whatever happened here, whoever was working never came back to clean it up.'
    },
    {
      id: 'vault',
      name: 'The Vault',
      description: 'The vault is cold — noticeably colder than the lab. Server racks line three walls, fully powered, their indicator lights active. Most glow green; a cluster near the rear pulses red in two distinct groups. A podium stands in the center. At the far wall, a sealed inner door bears a small frosted viewport and a monitor cycling one line: CONTAINMENT: HOLDING.'
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
      narrative: 'A yellowed sticky note on the monitor reads: "New girl keeps forgetting the drawer code. It\'s the Doc\'s birthday — punch it in backwards, all five digits. — H." The calendar on the wall has May 18th, 1953 circled in red — Dr. Harrison\'s birthday: 5/18/53. The drawer\'s keypad awaits five digits.',
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
      narrative: 'Among the locker contents you find a small lockbox with a 2-digit combination. A note in Harrison\'s handwriting reads: "Assistant\'s code opens the box — you know the formula."',
      question: 'The notebook showed the assistant with the most stars. Their locker combination is: the number of letters in their first name, followed by their number of stars. Enter the 2-digit code:',
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
      narrative: 'The lockbox clicks open. A torn scrap of paper is folded around a key tagged "EAST DOOR OVERRIDE — cabinet lock only." The main door is keypad-controlled; the key fits a small supply cabinet beneath the lockers — empty shelves, nothing more. Three equations are scratched in pen:\n△ + ○ = 7\n○ + □ = 9\n□ + △ = 8\n\n△ ○ □',
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
      narrative: 'The reinforced door grinds open. The air beyond is denser — chemicals, ozone, and something electric that hasn\'t fully dissipated. The emergency lighting shifts from red to amber. Whatever happened, it happened in this room.',
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
      narrative: 'The tablet screen reads:\n"DAILY CENTRIFUGE CALIBRATION — Dr. E. Harrison\nTotal atomic mass of containment reagents: H + O + C + K + Fe\nEnter the sum to log calibration."',
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
      narrative: 'A microscope on the far counter has a slide inserted. Looking through the eyepiece, you see a smear of cellular structures — faint outlines of nuclei and membranes suspended in blue stain.',
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
      narrative: 'The terminal prints a small receipt:\nCABINET UNLOCK: override J-7 accepted.\n\nThe bottom of the slip is stamped: AUTHORIZED — FILING ACCESS GRANTED.',
      rewardItem: 'filing-cabinet-code'
    },
    {
      id: 'lab-filing-cabinet',
      locationId: 'lab',
      parentId: 'lab-research-station',
      type: 'locked',
      label: 'Filing Cabinet',
      narrative: 'The cabinet\'s digital lock clicks open. The top drawer slides out, revealing a word dial — four rotating rings, each with letters A through Z.',
      lockedNarrative: 'A tall metal filing cabinet stands against the wall, its drawer secured by a digital lock. A small screen reads "ENTER OVERRIDE KEY."',
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
      narrative: 'The vault door grinds open on heavy hinges. The air beyond is cold — colder than the lab, colder than the foyer. Full white lighting burns steadily here; the emergency strips stop at the threshold. This room never lost power.',
      children: []
    },

    // ===== VAULT =====
    {
      id: 'vault-harrison-trace',
      locationId: 'vault',
      parentId: null,
      type: 'dialogue',
      label: 'Harrison\'s Final Log',
      narrative: 'Near the sealed inner door, a cot has been pushed against the wall — a sleeping bag, an empty water bottle, and a field journal open to its last page. The entry is dated three hours ago:\n\n"Containment held on the second breach. I don\'t know how long the seals hold for a third. I can\'t reach the exit — whatever is inside the inner chamber responds to movement near the door.\n\nIf you\'re reading this: it\'s still in there. The CONTAINMENT: HOLDING monitor means the seals are intact. Go. Don\'t look at the viewport.\n\n— H."\n\nThrough the frosted viewport of the sealed inner door, something shifts in the dark.',
      children: []
    },
    {
      id: 'vault-terminal',
      locationId: 'vault',
      parentId: null,
      type: 'dialogue',
      label: 'Server Terminal',
      narrative: 'The central podium terminal displays a containment breach log. On the rack to your right, indicator lights pulse in two separate clusters — thirteen red lights in the left group, twenty-one in the right, separated by a dark band. The log header reads: "BREACH COUNTER — pattern sequence active."',
      children: ['vault-fibonacci']
    },
    {
      id: 'vault-fibonacci',
      locationId: 'vault',
      parentId: 'vault-terminal',
      type: 'puzzle',
      label: 'Fibonacci Sequence',
      narrative: 'The breach counter log reads:\n0 — 1 — 1 — 2 — 3 — 5 — 8 — 13 — 21 — ??\n\nThe rack lights confirm the pattern: thirteen LEDs lit in the left cluster, twenty-one in the right. The terminal prompts for the next count.',
      question: 'How many indicator lights should be lit next? Enter the number:',
      answer: '34',
      hints: [
        'Look at the server rack lights to your right — they pulse in two clusters. Count them: 13 in the first group, 21 in the second. The breach log follows the same pattern: each number is the sum of the two before it.',
        'The rack shows 13 lit, then 21 lit. Add them together to find the next count in the sequence.',
        'The next count is 34 — type 3-4.'
      ],
      children: ['vault-exit']
    },
    {
      id: 'vault-exit',
      locationId: 'vault',
      parentId: 'vault-fibonacci',
      type: 'puzzle',
      label: 'Exit Keypad',
      narrative: 'As the terminal accepts the final count, a physical panel slides open in the wall behind you — not a screen, but a keypad set into the steel.\n\nThe terminal switches to a pre-recorded message. Harrison\'s voice is quieter here, deliberate:\n\n"This is failsafe protocol seven. The exit responds only to someone who walked every step of my work — not a colleague reciting a code, and not whatever is inside trying to do the same.\n\nIf you\'re standing here, you followed the trail. Prove it.\n\nDigit one: the third digit of what you found in the foyer drawer.\nDigit two: the first digit of the laboratory calibration sum.\nDigit three: the number of letters in the answer to my riddle.\nDigit four: the last digit of the final breach count.\n\nGo."\n\nThe exit keypad waits.',
      question: 'Enter the 4-digit exit code:',
      answer: '8644',
      hints: [
        'Harrison\'s failsafe asks for four digits from earlier in his trail. Retrace your steps — the foyer drawer, the lab calibration sum, the filing cabinet riddle, and the final breach count each hold one digit.',
        'Foyer drawer code was 35815 — third digit is 8. Calibration sum was 60 — first digit is 6. Riddle answer "cell" has 4 letters. Breach count was 34 — last digit is 4.',
        'The exit code is 8644 — type 8-6-4-4.'
      ],
      isMeta: true,
      children: []
    }
  ]
};

export default data;
