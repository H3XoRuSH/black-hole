import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'the-meridian-engine',
  name: 'The Meridian Engine',
  description: 'A mathematical observatory built around a machine that can bend space itself. Decode its numerical mechanisms before the engine reaches alignment.',
  difficulty: 'extreme',
  intro: 'You wake with your cheek pressed against a cold slate floor. Somewhere above, enormous gears grind against one another, and the whole chamber tilts as though the building is sliding down the face of the world.\n\nA strip of red light crawls across the ceiling. It measures time, but not in seconds: 74, 73, 72...\n\nOn the wall, hundreds of equations have been carved into the stone. Some are unfinished. Others have been violently crossed out. At the center of the chamber, a circular shaft descends into darkness, its rim marked with three words:\n\nMEASURE. DEDUCE. ALIGN.\n\nThe engine has begun its final rotation. The only visible route leads through the observatory below.',
  locations: [
    {
      id: 'flooded-archive',
      name: 'The Flooded Archive',
      description: 'Water laps across a sunken library of slate tablets and brass drawers. Pressure pipes run through the walls, each ending in a numbered dial. A sealed iron stairwell waits beyond the rising water.'
    },
    {
      id: 'orrery-gallery',
      name: 'The Orrery Gallery',
      description: 'An immense mechanical model of the solar system hangs in the dark. Brass planets travel along intersecting rails while glass lenses cast geometric shadows across the floor. Every orbit is silent except when its numbers align.'
    },
    {
      id: 'meridian-core',
      name: 'The Meridian Core',
      description: 'The observatory narrows into a vertical chamber wrapped around a column of white light. Coordinates, number parts, and leftovers rotate across the stone walls. At the bottom, three brass bands surround the engine\'s final aperture.'
    }
  ],
  puzzles: [
    {
      id: 'archive-1',
      locationId: 'flooded-archive',
      narrative: 'Three pressure dials tremble above the waterline. Each dial is numbered from 0 upward. When the bell strikes once, every needle advances by one tick. The iron dial resets to 0 after reaching 6 — it takes 7 ticks to complete a full cycle. The brass dial cycles every 9 ticks, the copper dial every 11 ticks. After an unknown number of identical strikes, the iron dial reads 4, the brass dial reads 2, and the copper dial reads 8.',
      question: 'A plaque beside the pipe asks: "How many times did the bell strike?"\n\nThe three dials after the bell fell silent:\n\n   Iron (7 ticks):    0, 1, 2, 3, [4], 5, 6  -> back to 0\n   Brass (9 ticks):    0, 1, [2], 3, 4, 5, 6, 7, 8  -> back to 0\n   Copper (11 ticks):  0, 1, 2, 3, 4, 5, 6, 7, [8], 9, 10  -> back to 0\n\nThe brass window beneath the dials displays n = ____.',
      answer: '74',
      hints: [
        'Start with the iron dial. If the bell struck 4 times, the needle lands at 4. After 4 + 7 = 11 strikes, it is back at 4. Write out this list: 4, 11, 18, 25... Do the same for the brass dial (starting at 2, adding 9 each time) and the copper dial (starting at 8, adding 11).',
        'You now have three lists of possible strike counts. Find the smallest number that appears in all three — that is the earliest moment every needle simultaneously matched this arrangement.',
        'The three lists grow at different speeds. Keep writing them out — their first shared number is further along than the first few entries of any single list.'
      ]
    },
    {
      id: 'archive-2',
      locationId: 'flooded-archive',
      narrative: 'A submerged map is etched into a stone table. The dry island began as a broad rectangle, but water has eaten away a right-angled triangular corner and carved a narrow channel into the northern edge. A brass ruler is fixed beside the map.',
      question: 'The island began as a 10 m by 8 m rectangle. Two pieces are now missing:\n\n   The full rectangle before the flood (10m wide, 8m tall):\n\n   +----------------------------+\n   |                            |\n   |                            |\n   |                            |\n   +----------------------------+\n\n   Missing piece 1 — right triangle (6m height, 4m base):\n   Two edges meet at a corner and a diagonal cut removed the piece between them.\n\n        +------+\n        |     /\n        |    /\n        |   /\n        |  /\n        | /\n        |/\n        +\n\n   Missing piece 2 — rectangle (2m wide, 7m long):\n\n        +--------------+\n        |              |\n        |              |\n        |              |\n        +--------------+\n\nThe plaque beneath the map reads DRY FLOOR = ____ square meters.',
      answer: '54',
      hints: [
        'The full rectangle covers 10 by 8 meters. That gives you a starting area. Now look at the two missing pieces one at a time.',
        'The triangular corner was cut from a 4-by-6 rectangle. Think about what fraction of that rectangle the triangle occupies. The channel is a plain rectangle, 2 by 7.',
        'Subtract the areas of both missing pieces from the full rectangle. The dry floor is whatever remains.'
      ]
    },
    {
      id: 'archive-3',
      locationId: 'flooded-archive',
      narrative: 'Six numbered sluice handles line the wall. Exactly three receive red seals. The water gate opens only when the sealed handle numbers add up to a multiple of 3. Handles 1 and 6 sit on opposite walls — the gate mechanism can never seal both at once.',
      question: 'The counter beneath the gate displays VALID SETS = ____.\n\n   The six sluice handles:\n\n   |   [1]   [2]   [3]\n   |   [4]   [5]   [6]\n\nPick exactly three handles. Their numbers must sum to a multiple of 3. Handles 1 and 6 can never be sealed together.',
      answer: '6',
      hints: [
        'A sum is a multiple of 3 when the remainders of its parts — after dividing each by 3 — also add up to a multiple of 3. Check what each handle number leaves behind when divided by 3.',
        'Handles 3 and 6 are already divisible by 3 (remainder 0). Handles 1 and 4 give remainder 1. Handles 2 and 5 give remainder 2. You need three remainders that total a multiple of 3. Since no group has three members, you cannot pick all three from the same group.',
        'That leaves only one pattern of remainders that works — one from each group. Count how many ways to choose that way, then remove any combination that pairs handle 1 with handle 6.'
      ]
    },
    {
      id: 'archive-4',
      locationId: 'flooded-archive',
      narrative: 'The final brass drawer contains a black stone stamped 7560. Along its edge, tiny compartments are labelled with the smallest whole-number pieces that can be multiplied to rebuild the stamp. A second ring has a place for every whole number that divides 7560 evenly.',
      question: 'The drawer carries a scratched formula:\n\n   S = different building pieces multiplied together + exact dividers counted\n\n   Factor tree of the stamp:\n\n   |   7560\n   |    /\\\n   |   2  3780\n   |       /\\\n   |      2  1890\n   |          /\\\n   |         2  945\n   |             /\\\n   |            3  315\n   |                /\\\n   |               3  105\n   |                   /\\\n   |                  3  35\n   |                      /\\\n   |                     5  7\n\nThe final window reads S = ____.',
      answer: '274',
      hints: [
        'The "building pieces" are the prime numbers at the bottom of the tree — the leaves that cannot be split any further. Each distinct prime appears only once in the product, no matter how many times it shows up in the tree.',
        'For counting exact dividers: consider how many copies of each prime you may include. You can take 0, 1, 2, or 3 copies of 2 (four choices). Same for 3. For 5 and 7, you can take either 0 or 1 copy. Multiply the number of choices together.',
        'The formula adds the product of distinct primes to the total number of divisors. Sum them to get S.'
      ]
    },
    {
      id: 'gallery-1',
      locationId: 'orrery-gallery',
      narrative: 'The iron stairwell opens into the orrery. Narrow brass rails connect six planetary stations. Each rail segment bears the energy cost of crossing it, etched into the metal. The engine will only accept the least costly route through the moving model.',
      question: 'The route plate lists these rails:\n\n   A-B: 4    B-D: 5\n   A-C: 7    C-D: 1\n   B-C: 2    C-E: 6    E-F: 2\n              D-E: 3    D-F: 9\n\n   The rail network:\n\n   |   [A] --4-- [B]\n   |    |      /|\n   |    |     / |\n   |    |    /  |\n   |    7   2   5\n   |    |  /    |\n   |    | /     |\n   |    |/      |\n   |   [C] --1- [D]\n   |    |      /|\n   |    |     / |\n   |    |    /  |\n   |    6   3   9\n   |    |  /    |\n   |    | /     |\n   |    |/      |\n   |   [E] --2- [F]\n\nThe starting lens is A and the exit lens is F. The route counter waits at ____.',
      answer: '12',
      hints: [
        'Trace different paths from A to F along the rails, adding the cost of each segment you travel. The rails cost the same in both directions, so you can move either way along a connection.',
        'Try writing down a few candidate routes with their total costs. Some routes pass through many stations; others skip some. Compare the totals.',
        'The cheapest route uses five rail segments from start to finish. Double-check the cost at each step — a quick addition error will send you down an expensive detour.'
      ]
    },
    {
      id: 'gallery-2',
      locationId: 'orrery-gallery',
      narrative: 'A pendulum swings through a circular brass scale. Seven readings are engraved along its arc: 14, 11, 18, 14, 23, 17, 14. The scale has two needles, one marked M and one marked D.',
      question: 'A note between the needles reads: "Find the reading in the heart of the ordered seven. Measure every gap from it. S is the heart and all the gaps together."\n\n   Brass scale with marked positions:\n\n   |  11    14    14    14    17    18    23\n   |   o     o     o     o     o     o     o\n   |  low   mid   mid   mid   |     |    high\n   |                           |     |\n   |                         E4    F4\n\nThe scale window waits at S = ____.',
      answer: '33',
      hints: [
        'Sort the seven readings from lowest to highest. The "heart" is the one sitting at the center of the ordered list — the fourth reading.',
        'Once you have identified the heart, measure the distance from every reading to it. A distance is always counted as a positive gap — how far above or below the heart each reading falls.',
        'S is the heart plus the sum of all seven gaps. Add carefully — every gap counts, even when it is zero.'
      ]
    },
    {
      id: 'gallery-3',
      locationId: 'orrery-gallery',
      narrative: 'A lens assembly is engraved with four calibration readings. A brass slider has five notches, but the fifth notch is dark and unmarked. A grease-pencil line runs beneath the notches.',
      question: 'The first four notches read 4, 1, 2, 7. The grease-pencil note says: "The change between readings grows by four each notch."\n\n   Brass slider and notches:\n\n   [4]----[1]----[2]----[7]----[?]\n     \\      /      /      /\n   |   -3    +1     +5     ?\n\nThe fifth notch is marked ____.',
      answer: '16',
      hints: [
        'Look at how the readings change from one notch to the next: from 4 to 1 is a drop of 3, then up by 1, then up by 5. The note says these changes themselves follow a pattern.',
        'If each change grows by 4 compared to the previous change, what would the next change be? Start with -3, add 4 to get +1, add 4 to get +5, add 4 once more.',
        'Apply the fourth change to the reading at notch four (7) to reveal the missing fifth value.'
      ]
    },
    {
      id: 'gallery-4',
      locationId: 'orrery-gallery',
      narrative: 'Twelve small moons rotate inside a sampling cage. Five pearl moons each have mass 2, four iron moons each have mass 5, and three glass moons each have mass 9. The mechanical arm reaches in and selects two different moons at random.',
      question: 'The brass counter advances only when the two chosen masses make an odd total.\n\n   Moons in the sampling cage:\n\n   Pearl (mass 2):  P P P P P     (5 moons, even mass)\n   Iron  (mass 5):  I I I I       (4 moons, odd mass)\n   Glass (mass 9):  G G G         (3 moons, odd mass)\n\nIts display reads FAVORABLE PAIRS = ____.',
      answer: '35',
      hints: [
        'An odd total can only come from one even mass and one odd mass added together. Which moon types have even mass, and which have odd mass?',
        'The pearl moons are the only ones with even mass. Every favorable pair must include one pearl moon. The iron and glass moons (seven in total) are all odd.',
        'Each of the 5 pearl moons can pair with any of the 7 odd-mass moons. Since the arm picks two different moons, a pearl moon cannot pair with itself.'
      ]
    },
    {
      id: 'core-1',
      locationId: 'meridian-core',
      narrative: 'The gallery floor folds upward, revealing the meridian core. Five concentric brass rings orbit the column of white light, each ring lined with obsidian focusing lenses. Starting from the innermost ring, each ring holds two more lenses than the one inside it.',
      question: 'The innermost ring holds 1 lens.\nThe second ring holds 3 lenses.\nThe third ring holds 5 lenses.\nThe fourth ring holds 7 lenses.\nThe fifth ring holds 9 lenses.\n\nA brass plate reads: "All lenses together focus the engine."\n\nThe core display waits for ____.',
      answer: '25',
      hints: [
        'Add the lens counts from all five rings: 1, 3, 5, 7, and 9. These are the first five odd numbers.',
        'Group the numbers to add quickly: the innermost and outermost rings together hold 1 + 9 lenses. The second and fourth together hold 3 + 7. Then add the middle ring.',
        'The pairs give 10 + 10, plus the middle ring\'s 5, for a total of 25.'
      ]
    },
    {
      id: 'core-2',
      locationId: 'meridian-core',
      narrative: 'A circular gate is stamped 360. It accepts one brass ticket for each whole number from 1 through 360 that cannot be divided evenly by 2, by 3, or by 5. Three small seals marked 2, 3, and 5 sit beneath the gate.',
      question: 'The gate ledger reads: G = accepted tickets + the three seals.\n\n   Gate mechanism:\n\n        +-------------------+\n        |      GATE 360     |\n        |                   |\n        |  Accept if NOT    |\n        |  divisible by:    |\n        |   [2]  [3]  [5]   |\n        +-------------------+\n\nThe core window displays G = ____.',
      answer: '99',
      hints: [
        'First, count how many numbers from 1 to 360 are rejected — those divisible by 2, by 3, or by 5. Be careful: some numbers are divisible by more than one of these and would be counted multiple times.',
        'Numbers like 6 are divisible by both 2 and 3 — you must subtract these overlaps so they are not counted twice. Do the same for numbers divisible by both 2 and 5, and by both 3 and 5.',
        'Numbers divisible by 2, 3, and 5 all at once (meaning divisible by 30) were subtracted too many times in the previous step. Add them back once. Subtract the final rejected count from 360, then add the 3 seals as the formula says.'
      ]
    },
    {
      id: 'core-3',
      locationId: 'meridian-core',
      narrative: 'The column of white light narrows to a rotating number wheel. Its first display is 001. Every turn multiplies the hidden number by 7, but only the final three places remain visible. The markings on the wheel reveal that after 20 turns, the display returns to 001.',
      question: 'The wheel completes 2026 turns.\n\n   Number wheel (3-place display):\n\n      +---+---+---+\n      | 0 | 0 | 1 |   Turn 0\n      +---+---+---+\n\n      +---+---+---+\n      | 0 | 0 | 7 |   Turn 1  (1 x 7)\n      +---+---+---+\n\n      +---+---+---+\n      | 0 | 4 | 9 |   Turn 2  (7 x 7)\n      +---+---+---+\n\n   |      ...and so on...\n\n      +---+---+---+\n      | 0 | 0 | 1 |   Turn 20 (returns!)\n      +---+---+---+\n\nThe three-place window now reads ____.',
      answer: '649',
      hints: [
        'Twenty turns bring the wheel full circle. Any complete group of 20 turns can be ignored — you only need to count the leftover turns. Find how many full groups of 20 fit into 2026.',
        'Divide 2026 by 20 and keep the remainder. That remainder is the actual number of turns you must apply to the starting value of 1.',
        'Multiply 1 by 7 for each remaining turn. After each multiplication, keep only the last three digits. The final three digits are your answer.'
      ]
    },
    {
      id: 'core-4',
      locationId: 'meridian-core',
      narrative: 'The engine stops. Three brass bands slide into view, each carrying the numbers recovered from one chamber. The first remembers the archive, the second remembers the gallery, and the third remembers the core.',
      question: 'The bands carry these marks:\n\n   Archive:  74   54    6   274\n   Gallery:  12   33   16    35\n   Core:     25   99   649\n\nBeneath them, an old rule is carved: "Add each band. Tie away bundles of ten. Let only what cannot make a bundle pass into the three windows."\n\nThe final windows are A | G | C. Their combined code is ____.',
      answer: '863',
      hints: [
        '"Tie away bundles of ten" means keep only the last digit of each sum — the remainder after removing every complete group of ten. Start by adding all the numbers on the Archive band.',
        'Add the Gallery band and find its last digit. Do the same for the Core band. You should have three single digits.',
        'Place the three digits in order: Archive first, then Gallery, then Core. The three windows read them left to right as a single code.'
      ]
    }
  ]
};

export default data;
