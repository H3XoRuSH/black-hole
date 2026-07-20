import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'abandoned-lab',
  name: 'The Abandoned Lab',
  description: 'A mysterious laboratory abandoned decades ago. Solve the puzzles left behind by the missing scientists to escape!',
  difficulty: 'very-easy',
  intro: 'The emergency lights died three hours ago. You\'ve been reading Dr. Harrison\'s field journal by the flicker of a dying flashlight, piecing together what happened here. The pages are frantic: containment failures, research that crossed lines, a lockdown initiated from the inside. His last entry reads:\n\n"If someone finds this, I\'ve sealed the lab to protect what\'s outside — and what\'s inside. I\'ve left my work scattered like breadcrumbs. Follow them. Find the exit I couldn\'t reach."\n\nThe flashlight sputters out. Somewhere, a generator kicks in — the lab is still alive. And you are still inside.',
  locations: [
    {
      id: 'foyer',
      name: 'The Foyer',
      description: 'A cramped reception area with a dusty desk, a bulletin board of faded notices, and a row of employee lockers. A reinforced door to the east has a digital keypad.'
    },
    {
      id: 'lab',
      name: 'The Laboratory',
      description: 'A sprawling lab filled with beakers, bubbling vials, and strange glowing substances. Diagrams of molecular structures cover the walls, and a tattered periodic table poster hangs crookedly above the centrifuge — atomic numbers scrawled beside each symbol in faded red marker. A massive centrifuge hums quietly in the corner.'
    },
    {
      id: 'vault',
      name: 'The Vault',
      description: 'A heavy steel door groans open to reveal a small, windowless room. Server racks line the walls, their indicator lights blinking red. In the center stands a podium with a terminal — this must be where Dr. Harrison sealed everything away.'
    }
  ],
  puzzles: [
    {
      id: 'foyer-1',
      locationId: 'foyer',
      narrative: 'You approach the reception desk. Among scattered papers and a stone-cold coffee mug, you spot a keypad lock securing a drawer. The keys labeled 1, 3, 5, and 8 are worn smooth from repeated use.',
      question: 'A yellowed sticky note on the monitor reads: "The drawer code is my birthday, but backwards." The calendar on the wall has May 18th, 1953 circled in red — Dr. Harrison\'s birthday: 5/18/53.\n\nThe drawer\'s keypad awaits five digits.',
      answer: '35815',
      hints: [
        'The calendar shows his birthday circled, and the code is that date read the other way around.',
        'Read 51853 backwards.',
        'The code is 35815 — type 3-5-8-1-5.'
      ]
    },
    {
      id: 'foyer-2',
      locationId: 'foyer',
      narrative: 'Inside the drawer you find an employee badge and a small notebook listing staff names with star ratings. A row of lockers stands against the wall, each with a 2-digit combination lock.',
      question: 'The notebook reads:\nAlice — ★★★\nBob — ★\nCarol — ★★★★\nDave — ★★\nEve — ★★★★★\n\n"Dr. Harrison\'s lab assistant has the MOST stars. Their locker combination is: the number of letters in their name, followed by their number of stars."',
      answer: '35',
      hints: [
        'Count the stars beside each name. The person with the most is Dr. Harrison\'s lab assistant.',
        'Eve has 3 letters in her name, and 5 stars.',
        'The combination is 35 — type 3-5.'
      ]
    },
    {
      id: 'foyer-3',
      locationId: 'foyer',
      narrative: 'The locker creaks open, revealing a lab coat, safety goggles, and a torn scrap of paper with symbols. The reinforced door to the east blocks your path — its keypad expects a 3-digit code.',
      question: 'The torn paper shows three equations scratched in pen:\n△ + ○ = 7\n○ + □ = 9\n□ + △ = 8\n\nThe reinforced door keypad blinks, expecting three digits.',
      answer: '345',
      hints: [
        'If you combine all three equations, you can find the value of each symbol one at a time.',
        'Since ○ + □ = 9, △ must be 3. Then ○ = 4 and □ = 5.',
        'The code is 345 — type 3-4-5.'
      ]
    },
    {
      id: 'lab-1',
      locationId: 'lab',
      narrative: 'The reinforced door clicks open. You step into a vast laboratory. Beakers bubble on hot plates and a luminescent blue liquid drips from a cracked flask overhead. On the central workbench, a dusty tablet displays a chemical puzzle — it\'s referencing the periodic table poster above the centrifuge.',
      question: 'The tablet screen reads:\n"H + O + C + K + Fe = LOCK"\n\n"What is the sum of the atomic numbers?"',
      answer: '60',
      hints: [
        'The periodic table poster above the centrifuge has the atomic numbers you need — find each element and sum them.',
        'Add the atomic numbers: H(1) + O(8) + C(6) + K(19) + Fe(26).',
        'The sum is 60 — type 6-0.'
      ]
    },
    {
      id: 'lab-2',
      locationId: 'lab',
      narrative: 'A microscope on the far counter has a slide inserted. Looking through the eyepiece, you see colored dots in rows. Underneath, a sequence of numbers is scratched into the metal workbench.',
      question: 'The metal bench reads:\n3 — 3 — 5 — 4 — 4 — 3 — 5 — 5 — 4 — ??\n\nA sticky note nearby says: "Count the letters. One, two, three..."',
      answer: '3',
      hints: [
        'Say each number out loud and count the letters in its name — "one" has 3, "two" has 3, "three" has 5...',
        '"Ten" has 3 letters.',
        'The answer is 3 — type 3.'
      ]
    },
    {
      id: 'lab-3',
      locationId: 'lab',
      narrative: 'A filing cabinet in the corner is locked with a word dial — four rotating rings, each with letters A through Z. A clipboard hanging beside it has a riddle written in hasty handwriting.',
      question: '"I have a nucleus but no brain.\nI have a membrane but no skin.\nI divide but never subtract.\nA microscope reveals my world.\n\nWhat am I?"',
      answer: 'cell',
      hints: [
        'Think about what you would see through the microscope in this lab — the building blocks of life.',
        'It has a nucleus and a membrane, and it divides to make more of itself.',
        'The answer is CELL — turn the dial to C-E-L-L.'
      ]
    },
    {
      id: 'vault-1',
      locationId: 'vault',
      narrative: 'The filing cabinet swings open, revealing blueprints for a vault door and a keycard. You swipe it at the steel door at the end of the lab. With a deep grinding sound, the vault slides open.\n\nInside, servers hum and indicator lights blink. A terminal on the central podium displays a single sequence.',
      question: 'The terminal shows:\n0 — 1 — 1 — 2 — 3 — 5 — 8 — 13 — 21 — ??\n\nA note taped to the monitor reads: "Fibonacci knew the key."\n\nThe cursor pulses beside the final entry.',
      answer: '34',
      hints: [
        'Look at how each pair of neighbors adds up to the next number in the chain.',
        '13 and 21 are the last two numbers — add them together.',
        'The next number is 34 — type 3-4.'
      ]
    },
    {
      id: 'vault-2',
      locationId: 'vault',
      narrative: 'The terminal flashes green. A final message from Dr. Harrison appears:\n\n"You\'ve come far. I\'m impressed. But one lock remains — the exit. I encoded it using clues from the puzzles you just solved. Think carefully."\n\nThe exit keypad glows with four empty digits.',
      question: 'A holographic display shows:\n\nDigit 1 — The THIRD digit from the foyer drawer code.\nDigit 2 — The FIRST digit of the laboratory atomic sum.\nDigit 3 — The number of LETTERS in the riddle\'s answer.\nDigit 4 — The LAST digit of the Fibonacci number.\n\nThe exit keypad glows, awaiting the final sequence.',
      answer: '8644',
      hints: [
        'Retrace your steps through the lab. The drawer, the formula, the riddle, and the number sequence each left a digit behind.',
        'Foyer drawer code was 35815 — the third digit is 8. Atomic sum was 60 — first digit is 6. Riddle answer "cell" has 4 letters. Fibonacci was 34 — last digit is 4.',
        'The exit code is 8644 — type 8-6-4-4.'
      ]
    }
  ]
};

export default data;
