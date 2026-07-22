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
  nodes: [
    // =====================================================================
    // THE FLOODED ARCHIVE — 7 root objects, max depth 4
    //
    // Two knowledge-gated puzzles (pressure dials, factor puzzle) blocked by
    // teaching nodes in later locations. One locked drawer (brass drawer)
    // opened by a key from the sluice gate chain. The exit stairwell is
    // locked behind the archive release pin from the sluice chain.
    //
    // Flow: stone map (accessible) → maul-stone-key →
    //       sluice gate (knowledge-gated by remainder plaque) → lockbox (use key) → gate-key + release-pin →
    //       brass drawer (use gate-key) → factor puzzle (blocked by core teaching) →
    //       exit (use release-pin) → gallery
    //       [backtrack from gallery] pressure dials (use orbital theorem) → flow-token
    //       [backtrack from core] factor puzzle (use prime decomposition) → tannery-seal
    // =====================================================================

    {
      id: 'fa-surveyors-table',
      locationId: 'flooded-archive',
      parentId: null,
      type: 'dialogue',
      label: 'Surveyor\'s Stone Map',
      narrative: 'A submerged map is etched into a stone table. The dry island began as a broad rectangle, but water has eaten away a right-angled triangular corner and carved a narrow channel into the northern edge. A brass ruler is fixed beside the map. The map holds the key to understanding how much floor remains above the water.',
      children: ['fa-stone-map-puzzle']
    },
    {
      id: 'fa-stone-map-puzzle',
      locationId: 'flooded-archive',
      parentId: 'fa-surveyors-table',
      type: 'puzzle',
      label: 'Dry Floor Calculation',
      narrative: 'The map table glows beneath the water. The brass ruler slides into position above the eroded edges.',
      question: 'The island began as a 10 m by 8 m rectangle. Two pieces are now missing:\n\n   The full rectangle before the flood (10m wide, 8m tall):\n\n   +----------------------------+\n   |                            |\n   |                            |\n   |                            |\n   +----------------------------+\n\n   Missing piece 1 — right triangle (6m height, 4m base):\n   Two edges meet at a corner and a diagonal cut removed the piece between them.\n\n        +------+\n        |     /\n        |    /\n        |   /\n        |  /\n        | /\n        |/\n        +\n\n   Missing piece 2 — rectangle (2m wide, 7m long):\n\n        +--------------+\n        |              |\n        |              |\n        |              |\n        +--------------+\n\nThe plaque beneath the map reads DRY FLOOR = ____ square meters.',
      answer: '54',
      hints: [
        'The full rectangle covers 10 by 8 meters. That gives you a starting area. Now look at the two missing pieces one at a time.',
        'The triangular corner is exactly half of a 4-by-6 rectangle. The channel is a plain rectangle, 2 by 7.',
        'Subtract the areas of both missing pieces from the full rectangle. What\'s left is the dry floor.'
      ],
      children: ['fa-dry-floor-record']
    },
    {
      id: 'fa-dry-floor-record',
      locationId: 'flooded-archive',
      parentId: 'fa-stone-map-puzzle',
      type: 'dialogue',
      label: 'Dry Floor Records',
      narrative: 'The map table releases a chiseled stone key from its lower compartment. Beside it, an engraved tablet records the dry floor area in clean numerals — a value the observatory will remember when the bands slide into place.',
      children: ['fa-maul-stone-key', 'fa-area-reference']
    },
    {
      id: 'fa-maul-stone-key',
      locationId: 'flooded-archive',
      parentId: 'fa-dry-floor-record',
      type: 'item',
      label: 'Maul Stone Key',
      narrative: 'The key is heavy, carved from the same dark stone as the map table. Its teeth match the zigzag lock plate set into the sluice gate chamber.',
      rewardItem: 'maul-stone-key'
    },
    {
      id: 'fa-area-reference',
      locationId: 'flooded-archive',
      parentId: 'fa-dry-floor-record',
      type: 'dialogue',
      label: 'Area Reference Tablet',
      narrative: 'The engraved tablet reads: FLOOR 54. The engine will collect this number when the final band is assembled.',
      children: []
    },

    {
      id: 'fa-remainder-plaque',
      locationId: 'flooded-archive',
      parentId: null,
      type: 'dialogue',
      label: 'Remainder Principle Plaque',
      narrative: 'A brass plaque is bolted to the wall beside the sluice gate. Its engraving is worn but legible:\n\n"All quantities may be gathered into equal groups. What cannot be gathered is the remainder — and remainders, added together, behave in their own arithmetic. A remainder of 1 plus a remainder of 2 gives a remainder of 0 when the groups are threes."\n\nThe plaque continues: "When every number is divided by 3, it leaves behind a remainder of 0, 1, or 2. Numbers that leave the same remainder belong to the same family. To make a multiple of 3 from three numbers, you must take one number from each family — or take three numbers all from the zero-remainder family. No other combination works."',
      children: ['fa-remainder-application']
    },
    {
      id: 'fa-remainder-application',
      locationId: 'flooded-archive',
      parentId: 'fa-remainder-plaque',
      type: 'dialogue',
      label: 'Remainder Application',
      narrative: 'The lower half of the plaque applies the principle to the six sluice handles:\n\n"Handle 3 and Handle 6 leave zero remainder. Handles 1 and 4 leave one leftover. Handles 2 and 5 leave two leftovers. Each family has only two members — not enough to supply three. The gate demands one handle from each family."\n\nTo count valid sets: pick one handle from each remainder family. That gives 2 × 2 × 2 = 8 combinations. But Handles 1 and 6 can never be sealed together — and they appear together in only two of those combinations. Remove those, leaving 6 valid configurations.',
      children: []
    },

    {
      id: 'fa-sluice-gate-mechanism',
      locationId: 'flooded-archive',
      parentId: null,
      type: 'dialogue',
      label: 'Sluice Gate Control Panel',
      narrative: 'Six numbered sluice handles line the wall. Exactly three receive red seals. The water gate opens only when the sealed handle numbers add up to a multiple of 3. Handles 1 and 6 sit on opposite walls — the gate mechanism can never seal both at once. A brass counter beneath the gate clicks with anticipation.',
      children: ['fa-sluice-panel-puzzle']
    },
    {
      id: 'fa-sluice-panel-puzzle',
      locationId: 'flooded-archive',
      parentId: 'fa-sluice-gate-mechanism',
      type: 'puzzle',
      label: 'Sluice Handle Configuration',
      narrative: 'The control panel awaits your configuration. The remainder plaque on the wall holds the key to counting valid sets — you may wish to review it before proceeding.',
      question: 'The counter beneath the gate displays VALID SETS = ____.\n\n   The six sluice handles:\n\n   |   [1]   [2]   [3]\n   |   [4]   [5]   [6]\n\nPick exactly three handles. Their numbers must sum to a multiple of 3. Handles 1 and 6 can never be sealed together.',
      answer: '6',
      hints: [
        'When you split a number into groups of three, what is left over? The Remainder Principle plaque on the wall explains this. Check what each handle number leaves behind after taking away as many full groups of three as possible.',
        'Handles 3 and 6 make clean groups of three — nothing leftover. Handles 1 and 4 each leave 1 leftover. Handles 2 and 5 each leave 2 leftover. Each family has only two handles, so you must pick one from each family.',
        'The only way is to take one handle from each leftover group. Count every possible set of three that follows this rule. Then remove any set that pairs handle 1 with handle 6.'
      ],
      children: ['fa-sluice-chamber']
    },
    {
      id: 'fa-sluice-chamber',
      locationId: 'flooded-archive',
      parentId: 'fa-sluice-panel-puzzle',
      type: 'dialogue',
      label: 'Sluice Chamber',
      narrative: 'The sluice gate groans open. Water rushes through for a long moment, then calms to a steady trickle. Behind the gate, a narrow chamber has been carved into the stone — and inside it, an iron lockbox with a stone-key slot. The lockbox waits for the maul stone key from the surveyor\'s table.',
      children: ['fa-sluice-lockbox']
    },
    {
      id: 'fa-sluice-lockbox',
      locationId: 'flooded-archive',
      parentId: 'fa-sluice-chamber',
      type: 'locked',
      label: 'Sluice Chamber Lockbox',
      narrative: 'The stone key turns with a heavy grind. The lockbox lid springs open, revealing two objects nestled in oiled cloth: a brass gate key and a pin stamped with the archive\'s emergency release symbol.',
      lockedNarrative: 'The iron lockbox sits in the flooded chamber, its keyhole shaped for a heavy stone key. The maul stone key from the surveyor\'s map table would fit this lock.',
      lockedByItem: 'maul-stone-key',
      children: ['fa-gate-key', 'fa-release-pin']
    },
    {
      id: 'fa-gate-key',
      locationId: 'flooded-archive',
      parentId: 'fa-sluice-lockbox',
      type: 'item',
      label: 'Brass Gate Key',
      narrative: 'The brass key is warm from the lockbox and stamped with a tannery mark — a leather press with crossed needles. It matches the lock on the brass drawer across the archive.',
      rewardItem: 'sluice-gate-key'
    },
    {
      id: 'fa-release-pin',
      locationId: 'flooded-archive',
      parentId: 'fa-sluice-lockbox',
      type: 'item',
      label: 'Archive Release Pin',
      narrative: 'The pin is heavy iron, stamped with the observatory\'s emergency seal — three concentric circles around a single point. It fits the iron stairwell\'s release mechanism.',
      rewardItem: 'archive-release-pin'
    },

    {
      id: 'fa-brass-tannery-drawer',
      locationId: 'flooded-archive',
      parentId: null,
      type: 'locked',
      label: 'Brass Tannery Drawer',
      narrative: 'The brass key turns smoothly. The drawer slides open, revealing a black stone tablet stamped 7560. Along its edge, tiny compartments are labelled with the smallest whole-number pieces that can be multiplied to rebuild the stamp. A second ring shows every whole number that divides 7560 evenly — the divisor count is worn away, waiting to be recalculated.',
      lockedNarrative: 'A polished brass drawer is set into the wall, its surface etched with a factor tree. A brass lock with the tannery\'s crossed-needle mark keeps it shut. The key looks to be the same shape as the brass gate key.',
      lockedByItem: 'sluice-gate-key',
      children: ['fa-factor-tablet', 'fa-factor-puzzle']
    },
    {
      id: 'fa-factor-tablet',
      locationId: 'flooded-archive',
      parentId: 'fa-brass-tannery-drawer',
      type: 'dialogue',
      label: 'Black Stone Factor Tablet',
      narrative: 'The tablet displays the complete factor tree of 7560:\n\n   |   7560\n   |    /\\\n   |   2  3780\n   |       /\\\n   |      2  1890\n   |          /\\\n   |         2  945\n   |             /\\\n   |            3  315\n   |                /\\\n   |               3  105\n   |                   /\\\n   |                  3  35\n   |                      /\\\n   |                     5  7\n\nThe drawer carries a scratched formula: S = one of each type of building piece multiplied together + all exact dividers counted up. But the formula for counting dividers from the prime pieces has been torn away — the theorem is archived in the Meridian Core.',
      children: []
    },
    {
      id: 'fa-factor-puzzle',
      locationId: 'flooded-archive',
      parentId: 'fa-brass-tannery-drawer',
      type: 'puzzle',
      label: 'Factor Reconstruction',
      narrative: 'The final brass window beneath the drawer flickers. It expects the value of S, but the divisor-counting formula has been removed — the Prime Decomposition Theorem in the Meridian Core holds the complete method.',
      question: 'The drawer carries a scratched formula:\n\n   S = one of each type of building piece multiplied together + all exact dividers counted up\n\nThe final window reads S = ____.',
      answer: '274',
      hints: [
        'The Prime Decomposition Theorem in the Meridian Core explains how to break a number into its fundamental building pieces and count its divisors. The black stone tablet already shows the factor tree of 7560 — you need the theorem to finish the calculation.',
        'The building pieces are the primes at the leaves: 2 (three copies), 3 (three copies), 5 (one copy), 7 (one copy). The product of one copy of each: 2 × 3 × 5 × 7 = 210. For counting divisors: (3+1)(3+1)(1+1)(1+1) = 4 × 4 × 2 × 2 = 64.',
        'S = 210 + 64 = 274. The formula adds the product of one copy of each building piece to the total number of exact dividers.'
      ],
      children: ['fa-factor-conclusion']
    },
    {
      id: 'fa-factor-conclusion',
      locationId: 'flooded-archive',
      parentId: 'fa-factor-puzzle',
      type: 'dialogue',
      label: 'Factor Chamber Conclusion',
      narrative: 'The brass window blinks 274 — accepted. A compartment beneath the drawer clicks open, revealing a heavy wax seal stamped with the observatory\'s tannery emblem. The seal reads: FOR THE ENGINE ALIGNMENT TERMINAL.',
      children: ['fa-tannery-seal']
    },
    {
      id: 'fa-tannery-seal',
      locationId: 'flooded-archive',
      parentId: 'fa-factor-conclusion',
      type: 'item',
      label: 'Tannery Archive Seal',
      narrative: 'The wax seal is still warm. It bears the tannery\'s crossed-needle mark over a number sequence: 274. The reverse reads: PRESENT AT THE MERIDIAN CORE ALIGNMENT TERMINAL.',
      rewardItem: 'tannery-seal'
    },

    {
      id: 'fa-pressure-pipe-assembly',
      locationId: 'flooded-archive',
      parentId: null,
      type: 'dialogue',
      label: 'Pressure Pipe Dials',
      narrative: 'Three pressure dials tremble above the waterline. Each dial is numbered from 0 upward. When the bell strikes once, every needle advances by one tick. The iron dial resets to 0 after reaching 6 — it takes 7 ticks to complete a full cycle. The brass dial cycles every 9 ticks, the copper dial every 11 ticks. After an unknown number of identical strikes, the iron dial reads 4, the brass dial reads 2, and the copper dial reads 8.\n\nThe method for finding the shared strike count across mismatched cycles is known as periodic alignment. The Orrery Gallery above holds a theorem that explains it.',
      children: ['fa-pressure-dials-puzzle']
    },
    {
      id: 'fa-pressure-dials-puzzle',
      locationId: 'flooded-archive',
      parentId: 'fa-pressure-pipe-assembly',
      type: 'puzzle',
      label: 'Periodic Alignment Puzzle',
      narrative: 'A plaque beside the pipe waits. The dials show clear readings, but finding the number of strikes that could produce all three at once requires the Orbital Period Theorem from the Orrery Gallery.',
      question: 'A plaque beside the pipe asks: "How many times did the bell strike?"\n\nThe three dials after the bell fell silent:\n\n   Iron (7 ticks):    0, 1, 2, 3, [4], 5, 6  -> back to 0\n   Brass (9 ticks):    0, 1, [2], 3, 4, 5, 6, 7, 8  -> back to 0\n   Copper (11 ticks):  0, 1, 2, 3, 4, 5, 6, 7, [8], 9, 10  -> back to 0\n\nThe brass window beneath the dials displays n = ____.',
      answer: '74',
      hints: [
        'The Orbital Period Theorem in the Orrery Gallery explains how to align cycles of different lengths. Start with the iron dial: every 7 strikes bring it back to where it started. If it reads 4 now, the strike count could be 4, or 4+7=11, or 4+7+7=18, and so on. Make a list for each dial using its own full cycle length.',
        'Compare the three lists. Look for a number that shows up on all of them — that is the earliest moment every dial matched its current reading at the same time.',
        'The number you need is bigger than the first few entries of any single list. Keep adding each dial\'s full cycle length and checking — the shared number will appear eventually.'
      ],
      children: ['fa-calibration-shaft']
    },
    {
      id: 'fa-calibration-shaft',
      locationId: 'flooded-archive',
      parentId: 'fa-pressure-dials-puzzle',
      type: 'dialogue',
      label: 'Calibration Shaft',
      narrative: 'The dials align at 74 strikes. A narrow shaft opens in the pipe assembly, releasing a brass flow calibration token and a pressure reference slip. The token is stamped with a planetary rail diagram — it belongs in the Orrery Gallery.',
      children: ['fa-flow-token', 'fa-pressure-reference']
    },
    {
      id: 'fa-flow-token',
      locationId: 'flooded-archive',
      parentId: 'fa-calibration-shaft',
      type: 'item',
      label: 'Flow Calibration Token',
      narrative: 'The brass token is warm and stamped with a planetary rail diagram — five stations connected by curved tracks. On the reverse: ORRERY GALLERY — PLANET RAIL FORK ACCESS.',
      rewardItem: 'flow-calibration-token'
    },
    {
      id: 'fa-pressure-reference',
      locationId: 'flooded-archive',
      parentId: 'fa-calibration-shaft',
      type: 'dialogue',
      label: 'Pressure Reference Slip',
      narrative: 'The slip records the pressure calibration code: 74. The engine will collect this value when the final bands are drawn together.',
      children: []
    },

    {
      id: 'fa-iron-stairwell',
      locationId: 'flooded-archive',
      parentId: null,
      type: 'locked',
      label: 'Iron Stairwell Hatch',
      narrative: 'The release pin slides into the emergency mechanism. Bolts retract with a cascading clank, and the iron hatch swings upward. Beyond it, a spiral stair climbs toward a vast mechanical chamber — the Orrery Gallery.',
      lockedNarrative: 'A sealed iron stairwell is set into the far wall, its hatch locked by an emergency release mechanism. A slot beside the handle is shaped for a heavy iron pin. Water creeps closer by the minute.',
      lockedByItem: 'archive-release-pin',
      children: ['fa-stairwell-hatch']
    },
    {
      id: 'fa-stairwell-hatch',
      locationId: 'flooded-archive',
      parentId: 'fa-iron-stairwell',
      type: 'dialogue',
      label: 'Stairwell Hatch',
      narrative: 'The hatch groans open. Cold air spills down from above, carrying the scent of brass and oil. The stairs spiral upward into a vast mechanical darkness — the Orrery Gallery, where planets travel along brass rails and lenses cast geometric shadows.',
      children: ['fa-stairwell-descent']
    },
    {
      id: 'fa-stairwell-descent',
      locationId: 'flooded-archive',
      parentId: 'fa-stairwell-hatch',
      type: 'dialogue',
      label: 'Stairwell Passage',
      narrative: 'Each step rings underfoot as you climb. The stairwell narrows near the top, ending at a heavy wooden door. Through its seams, a faint glow pulses — the Orrery Gallery\'s central lens.',
      children: ['fa-to-gallery']
    },
    {
      id: 'fa-to-gallery',
      locationId: 'orrery-gallery',
      parentId: 'fa-stairwell-descent',
      type: 'dialogue',
      label: 'Enter the Orrery Gallery',
      narrative: 'The iron stairwell opens into the Orrery Gallery. An immense mechanical model of the solar system hangs in the dark. Brass planets travel along intersecting rails while glass lenses cast geometric shadows across the floor. Narrow brass rails connect six planetary stations, each bearing an energy cost etched into the metal. A central lens waits at the heart of the model.',
      children: []
    },

    // =====================================================================
    // THE ORRERY GALLERY — 7 root objects, max depth 3
    //
    // Teaching node (orbital period theorem) provides knowledge for the
    // archive's pressure dials puzzle. Four accessible puzzles yield tokens.
    // One locked node (rail fork) uses a cross-location item from the archive.
    // The exit lens puzzle is knowledge-gated by all 4 gallery puzzles.
    // =====================================================================

    {
      id: 'og-orbital-period-theorem',
      locationId: 'orrery-gallery',
      parentId: null,
      type: 'dialogue',
      label: 'Orbital Period Theorem',
      narrative: 'A brass plate is mounted beside the planet rails, its surface engraved with a practical method:\n\n"THE ORBITAL PERIOD THEOREM — When three bodies with different cycle lengths complete an unknown number of identical steps and arrive at known positions, find the shared step count by skip-counting. Begin with the largest cycle. Write down every number that could produce its current reading by adding the full cycle length repeatedly. Test each against the other two."\n\nA worked example follows:\n\n"Consider cycles of 5, 7, and 9 with current readings 2, 3, and 5. The 9-cycle reading is 5. Skip by 9: 5, 14, 23, 32, 41, 50, 59, 68, 77, 86, 95, 104, 113, 122...\n\nTest each: does it leave remainder 3 in the 7-cycle? 14 gives 0, 23 gives 2, 32 gives 4, 41 gives 6, 50 gives 1, 59 gives 3. 59 fits the 7-cycle. Now test 59 in the 5-cycle: 59 leaves 4, not 2. Continue. 68 fails, 77 fails, 86 fails, 95 fails, 104 fails, 113 fails, 122 gives 3 in the 7-cycle then 2 in the 5-cycle — 122 fits all three."\n\nThe first number that satisfies all cycles is 122.\n\nA small note below reads: "The Flooded Archive holds a pressure pipe assembly with three dials obeying mismatched cycles."',
      children: []
    },

    {
      id: 'og-astronomical-rail-table',
      locationId: 'orrery-gallery',
      parentId: null,
      type: 'dialogue',
      label: 'Astronomical Rail Table',
      narrative: 'Narrow brass rails connect six planetary stations. Each rail segment bears the energy cost of crossing it, etched into the metal. The starting lens is A and the exit lens is F. The engine will only accept the least costly route through the moving model.',
      children: ['og-rail-network-puzzle']
    },
    {
      id: 'og-rail-network-puzzle',
      locationId: 'orrery-gallery',
      parentId: 'og-astronomical-rail-table',
      type: 'puzzle',
      label: 'Planet Rail Network',
      narrative: 'The route plate lists these rails. Trace the cheapest path from A to F.',
      question: 'The route plate lists these rails:\n\n   A-B: 2    B-D: 5\n   A-C: 6    C-D: 1\n   B-C: 3    C-E: 4    E-F: 4\n              D-E: 2    D-F: 7\n\n   The rail network:\n\n   |   [A] --2-- [B]\n   |    |      /|\n   |    |     / |\n   |    |    /  |\n   |    6   3   5\n   |    |  /    |\n   |    | /     |\n   |    |/      |\n   |   [C] --1- [D]\n   |    |      /|\n   |    |     / |\n   |    |    /  |\n   |    4   2   7\n   |    |  /    |\n   |    | /     |\n   |    |/      |\n   |   [E] --4- [F]\n\nThe starting lens is A and the exit lens is F. The route counter waits at ____.',
      answer: '12',
      hints: [
        'Trace different paths from A to F along the rails, adding the cost of each segment you travel. The rails cost the same in both directions, so you can move either way along a connection.',
        'Try writing down a few candidate routes with their total costs. Some routes pass through many stations; others skip some. Compare the totals.',
        'The cheapest route uses five rail segments from start to finish. Double-check the cost at each step — a quick addition error will send you down an expensive detour.'
      ],
      children: ['og-rail-conclusion']
    },
    {
      id: 'og-rail-conclusion',
      locationId: 'orrery-gallery',
      parentId: 'og-rail-network-puzzle',
      type: 'dialogue',
      label: 'Rail Network Conclusion',
      narrative: 'The counter blinks 12 and the shortest route lights up along the rails: A→B→C→D→E→F. A small token drops from the route plate, stamped with the number 12.',
      children: ['og-shortest-path-token']
    },
    {
      id: 'og-shortest-path-token',
      locationId: 'orrery-gallery',
      parentId: 'og-rail-conclusion',
      type: 'item',
      label: 'Shortest Path Token',
      narrative: 'The token reads 12 on one face. The reverse shows a simple line diagram of the winning route. The central lens will collect this value.',
      rewardItem: 'shortest-path-token'
    },

    {
      id: 'og-pendulum-arc',
      locationId: 'orrery-gallery',
      parentId: null,
      type: 'dialogue',
      label: 'Pendulum Arc Scale',
      narrative: 'A pendulum swings through a circular brass scale. Seven readings are engraved along its arc: 14, 11, 18, 14, 23, 17, 14. The scale has two needles, one marked M and one marked D. A note between them reads: "Find the reading in the heart of the ordered seven. Measure every gap from it. S is the heart and all the gaps together."',
      children: ['og-pendulum-scale-puzzle']
    },
    {
      id: 'og-pendulum-scale-puzzle',
      locationId: 'orrery-gallery',
      parentId: 'og-pendulum-arc',
      type: 'puzzle',
      label: 'Pendulum Measurement',
      narrative: 'The pendulum swings through the scale. Seven numbers wait to be ordered and measured.',
      question: 'A note between the needles reads: "Find the reading in the heart of the ordered seven. Measure every gap from it. S is the heart and all the gaps together."\n\n   Brass scale with marked positions:\n\n   |  11    14    14    14    17    18    23\n   |   o     o     o     o     o     o     o\n   |  low   mid   mid   mid   |     |    high\n   |                           |     |\n   |                         E4    F4\n\nThe scale window waits at S = ____.',
      answer: '33',
      hints: [
        'Sort the seven readings from lowest to highest. The "heart" is the one sitting at the center of the ordered list — the fourth reading.',
        'Once you have identified the heart, measure the distance from every reading to it. A distance is always counted as a positive gap — how far above or below the heart each reading falls.',
        'S is the heart plus the sum of all seven gaps. Add carefully — every gap counts, even when it is zero.'
      ],
      children: ['og-median-conclusion']
    },
    {
      id: 'og-median-conclusion',
      locationId: 'orrery-gallery',
      parentId: 'og-pendulum-scale-puzzle',
      type: 'dialogue',
      label: 'Median Measurement Record',
      narrative: 'The scale window ticks to 33. The median reading was 14, and the seven gaps summed to 19 — together, 33. A brass token drops from beneath the scale.',
      children: ['og-median-code-token']
    },
    {
      id: 'og-median-code-token',
      locationId: 'orrery-gallery',
      parentId: 'og-median-conclusion',
      type: 'item',
      label: 'Median Code Token',
      narrative: 'The token reads 33. The central lens will collect this measurement.',
      rewardItem: 'median-code-token'
    },

    {
      id: 'og-planet-balance-beam',
      locationId: 'orrery-gallery',
      parentId: null,
      type: 'dialogue',
      label: 'Planet Balance Beam',
      narrative: 'A brass scale in the center of the orrery holds four unlabeled planet models. Their names have worn away, but a ledger next to the scale records their combined masses. Each planet has a different mass, measured in stone units.',
      children: ['og-planet-scale-puzzle']
    },
    {
      id: 'og-planet-scale-puzzle',
      locationId: 'orrery-gallery',
      parentId: 'og-planet-balance-beam',
      type: 'puzzle',
      label: 'Planet Mass Calculation',
      narrative: 'The ledger beside the scale shows four relationships. Solve for Saturn\'s mass alone.',
      question: 'The ledger reads:\n\n   Mars  +  Venus  =  23\n   Mars  +  Jupiter =  31\n   Venus +  Jupiter =  28\n   Saturn +  Mars   =  39\n\nEach planet has a different mass, measured in stone units. Find Saturn\'s mass alone.\n\nThe scale counter reads ____.',
      answer: '26',
      hints: [
        'Look at the first two entries. Both include Mars. The difference between their totals tells you how much heavier Jupiter is than Venus.',
        'If Jupiter is 8 heavier than Venus, and together they make 28, you can find them both. One must be 10 and the other 18.',
        'Venus is 10 and Jupiter is 18. That makes Mars 13 (since Mars + 10 = 23). Saturn + 13 = 39, so Saturn is 26.'
      ],
      children: ['og-saturn-conclusion']
    },
    {
      id: 'og-saturn-conclusion',
      locationId: 'orrery-gallery',
      parentId: 'og-planet-scale-puzzle',
      type: 'dialogue',
      label: 'Saturn Mass Record',
      narrative: 'The scale counter stops at 26 — Saturn\'s mass in stone units, derived from the ledger. A brass token engraved with 26 falls into the collection tray.',
      children: ['og-saturn-mass-token']
    },
    {
      id: 'og-saturn-mass-token',
      locationId: 'orrery-gallery',
      parentId: 'og-saturn-conclusion',
      type: 'item',
      label: 'Saturn Mass Token',
      narrative: 'The token displays 26. The central lens awaits this value alongside the others.',
      rewardItem: 'saturn-mass-token'
    },

    {
      id: 'og-moon-sampling-cage',
      locationId: 'orrery-gallery',
      parentId: null,
      type: 'dialogue',
      label: 'Moon Sampling Cage',
      narrative: 'Twelve small moons rotate inside a sampling cage. Five pearl moons each have mass 2, four iron moons each have mass 5, and three glass moons each have mass 9. The mechanical arm reaches in and selects two different moons at random. A brass counter advances only when the two chosen masses make an odd total.',
      children: ['og-moon-cage-puzzle']
    },
    {
      id: 'og-moon-cage-puzzle',
      locationId: 'orrery-gallery',
      parentId: 'og-moon-sampling-cage',
      type: 'puzzle',
      label: 'Favorable Moon Pairs',
      narrative: 'The brass counter beneath the cage ticks with each possible selection. It wants the number of pairs that produce an odd total.',
      question: 'The brass counter advances only when the two chosen masses make an odd total.\n\n   Moons in the sampling cage:\n\n   Pearl (mass 2):  P P P P P     (5 moons, even mass)\n   Iron  (mass 5):  I I I I       (4 moons, odd mass)\n   Glass (mass 9):  G G G         (3 moons, odd mass)\n\nIts display reads FAVORABLE PAIRS = ____.',
      answer: '35',
      hints: [
        'An odd total can only come from one even mass and one odd mass added together. Which moon types have even mass, and which have odd mass?',
        'The pearl moons are the only ones with even mass. Every favorable pair must include one pearl moon. The iron and glass moons (seven in total) are all odd.',
        'Each of the 5 pearl moons can pair with any of the 7 odd-mass moons. Since the arm picks two different moons, a pearl moon cannot pair with itself.'
      ],
      children: ['og-moon-conclusion']
    },
    {
      id: 'og-moon-conclusion',
      locationId: 'orrery-gallery',
      parentId: 'og-moon-cage-puzzle',
      type: 'dialogue',
      label: 'Moon Pair Record',
      narrative: 'The display registers 35 — every pearl moon paired with every odd-mass moon. A final brass token drops from the cage mechanism.',
      children: ['og-moon-pair-token']
    },
    {
      id: 'og-moon-pair-token',
      locationId: 'orrery-gallery',
      parentId: 'og-moon-conclusion',
      type: 'item',
      label: 'Moon Pair Token',
      narrative: 'The token reads 35. The central lens now holds all four gallery measurements.',
      rewardItem: 'moon-pair-token'
    },

    {
      id: 'og-planet-rail-fork',
      locationId: 'orrery-gallery',
      parentId: null,
      type: 'locked',
      label: 'Planet Rail Fork',
      narrative: 'The flow calibration token slides into a recess on the rail fork. The track splits open, revealing a hidden compartment. Inside, an engraved tablet explains the gear recurrence pattern used throughout the observatory, and an alignment code for the Meridian Core.',
      lockedNarrative: 'Where two brass rails diverge, a locked switch plate bars the inner fork. The keyhole is stamped with a planetary rail diagram — the same mark carried by the flow calibration token from the Flooded Archive.',
      lockedByItem: 'flow-calibration-token',
      children: ['og-fork-inner-panel']
    },
    {
      id: 'og-fork-inner-panel',
      locationId: 'orrery-gallery',
      parentId: 'og-planet-rail-fork',
      type: 'dialogue',
      label: 'Fork Inner Panel',
      narrative: 'The compartment holds two items: a detailed study of gear tooth recurrence, and a brass code cylinder.',
      children: ['og-gear-recurrence-study', 'og-core-alignment-code']
    },
    {
      id: 'og-gear-recurrence-study',
      locationId: 'orrery-gallery',
      parentId: 'og-fork-inner-panel',
      type: 'dialogue',
      label: 'Gear Recurrence Study',
      narrative: 'The engraved tablet explains:\n\n"GEAR RECURRENCE PRINCIPLE — When each ring outward follows the rule N → 2N + 2, the tooth count grows predictably. Begin with the innermost count N₁. Compute N₂ = 2N₁ + 2, N₃ = 2N₂ + 2, continuing outward. Each outer ring depends only on the ring immediately inside it."\n\nThe tablet shows an example ring set starting from 3 teeth:\nRing 1: 3 teeth → Ring 2: 2×3+2 = 8 → Ring 3: 2×8+2 = 18 → Ring 4: 2×18+2 = 38 → Ring 5: 2×38+2 = 78.\n\nA note reads: "The Meridian Core contains five concentric rings. The innermost begins with 4 teeth — apply the same rule to verify the outermost ring."',
      children: []
    },
    {
      id: 'og-core-alignment-code',
      locationId: 'orrery-gallery',
      parentId: 'og-fork-inner-panel',
      type: 'item',
      label: 'Core Alignment Code',
      narrative: 'The brass cylinder is etched with a long number sequence. It is tagged: MERIDIAN CORE — NUMBER GATE COLUMN ACCESS. The code will unlock the sealed number gate.',
      rewardItem: 'core-alignment-code'
    },

    {
      id: 'og-central-alignment-lens',
      locationId: 'orrery-gallery',
      parentId: null,
      type: 'puzzle',
      label: 'Central Alignment Lens',
      narrative: 'The orrery\'s central lens activates now that four planetary stations have been measured. Four lights glow on the console — one for each station. The lens awaits the single combined orbital value carried by the four tokens.',
      question: 'Four measurements have been taken across the Orrery Gallery. The central lens waits for their combined orbital alignment value.',
      answer: '106',
      hints: [
        'Each planetary station yielded a brass token with its measurement. Gather the four tokens — the rail network, the pendulum, the planet balance, and the moon cage.',
        'The rail network gave 12, the pendulum gave 33, the planet scale gave 26, and the moon cage gave 35. Add them together.',
        '12 + 33 + 26 + 35 = 106. Enter this sum to align the lens.'
      ],
      children: ['og-alignment-record']
    },
    {
      id: 'og-alignment-record',
      locationId: 'orrery-gallery',
      parentId: 'og-central-alignment-lens',
      type: 'dialogue',
      label: 'Alignment Record',
      narrative: 'The lens rotates to 106 and locks with a deep hum. The orrery\'s planets align for a single breath — then the floor beneath the central lens splits open, revealing a spiral descent into a vertical chamber wrapped around a column of white light. The Meridian Core.',
      children: ['og-to-core']
    },
    {
      id: 'og-to-core',
      locationId: 'meridian-core',
      parentId: 'og-alignment-record',
      type: 'dialogue',
      label: 'Enter the Meridian Core',
      narrative: 'The gallery floor folds downward, revealing the meridian core. Five concentric brass rings are interlocked around the column of light, their rims lined with gear teeth. Coordinates, number parts, and leftovers rotate across the stone walls — the engine\'s final calculations.',
      children: []
    },

    // =====================================================================
    // THE MERIDIAN CORE — 8 root objects, max depth 10
    //
    // Three teaching nodes provide knowledge for archive and core puzzles.
    // The gear rings and number wheel puzzles are accessible (knowledge-gated).
    // The number gate column is locked by the core alignment code from gallery.
    // The meta terminal is locked behind an 8-ring chain: tannery seal + all
    // 7 gallery/core tokens — ensuring every puzzle must be solved first.
    // =====================================================================

    {
      id: 'mc-prime-decomposition-theorem',
      locationId: 'meridian-core',
      parentId: null,
      type: 'dialogue',
      label: 'Prime Decomposition Theorem',
      narrative: 'A theorem is engraved into the core\'s interior wall, its letters inlaid with brass:\n\n"THE PRIME DECOMPOSITION THEOREM — Any whole number may be expressed uniquely as a product of prime powers. To count the exact divisors of N = p₁^a₁ × p₂^a₂ × ... × pₖ^aₖ, compute (a₁+1) × (a₂+1) × ... × (aₖ+1)."\n\n"The product of one copy of each distinct prime is the square-free kernel. The sum of the square-free kernel and the divisor count is a quantity the engine uses to verify archival integrity."\n\nThe theorem is followed by a worked example: 360 = 2³ × 3² × 5¹. Divisor count = (3+1)(2+1)(1+1) = 4 × 3 × 2 = 24. Square-free kernel = 2 × 3 × 5 = 30. Verification value = 54.\n\nA handwritten note in the margin reads: "The Flooded Archive contains a black stone stamped 7560. Its drawer requires this exact calculation. The factor tree is already laid out on the stone — use it with this theorem to finish the verification."',
      children: []
    },

    {
      id: 'mc-inclusion-teaching',
      locationId: 'meridian-core',
      parentId: null,
      type: 'dialogue',
      label: 'Inclusion-Exclusion Principle',
      narrative: 'A stone panel beside the number gate explains:\n\n"THE INCLUSION-EXCLUSION PRINCIPLE — To count elements that belong to NONE of several sets, begin with the total. Subtract those belonging to each individual set. Add back those belonging to every pair of sets (subtracted twice). Subtract those belonging to every triple (added back too many times). Continue alternating."\n\nThe panel diagrams a Venn arrangement of three overlapping circles.\n\nA short example: "For a gate stamped 60 with seals 2 and 3 — numbers divisible by 2: 60÷2=30. By 3: 60÷3=20. By both (6): 60÷6=10. Rejected: 30+20−10=40. Accepted: 60−40=20. Add the two seals: 20+2=22."\n\nA note beneath the diagram reads: "The number gate beside this panel is stamped 360 with seals 2, 3, and 5. Apply the same alternating formula — then add the three seals beneath the gate."',
      children: []
    },

    {
      id: 'mc-modular-teaching',
      locationId: 'meridian-core',
      parentId: null,
      type: 'dialogue',
      label: 'Modular Exponentiation Theorem',
      narrative: 'A theorem is etched beside the number wheel:\n\n"MODULAR EXPONENTIATION — When a number is repeatedly multiplied, only the final few digits matter. Every sequence eventually cycles. The cycle length, once found, allows any turn count to be reduced to a manageable remainder."\n\nA worked example uses base 3 modulo 50:\n\n1 → 3 → 9 → 27 → 31 → 43 → 29 → 37 → 11 → 33 → 49 → 47 → 41 → 23 → 19 → 7 → 21 → 13 → 39 → 17 → 1 (cycle length: 20 steps).\n\n"Given 47 turns: divide 47 by 20. The remainder is 7. Trace 7 multiplications from 1: 1 → 3 → 9 → 27 → 31 → 43 → 29. Keep only the last digits at each step — only the remainder matters."\n\nA note beside the theorem adds: "The number wheel uses base 7 modulo 1000. Find its cycle."',
      children: []
    },

    {
      id: 'mc-gear-ring-housing',
      locationId: 'meridian-core',
      parentId: null,
      type: 'dialogue',
      label: 'Gear Ring Housing',
      narrative: 'Five concentric brass rings are interlocked around the column of light, their rims lined with gear teeth. The innermost ring carries a small plaque: "RING 1 — 4 TEETH. EACH OUTER RING: DOUBLE THE INNER, THEN ADD TWO MORE." The Gear Recurrence Study recovered from the Orrery Gallery\'s rail fork explains the pattern.',
      children: ['mc-gear-rings-puzzle']
    },
    {
      id: 'mc-gear-rings-puzzle',
      locationId: 'meridian-core',
      parentId: 'mc-gear-ring-housing',
      type: 'puzzle',
      label: 'Gear Ring Recurrence',
      narrative: 'The core display waits for the outermost ring\'s tooth count. The gear recurrence study you found in the Orrery Gallery demonstrates how to compute each successive ring.',
      question: 'The innermost ring (Ring 1) has 4 teeth. Each ring outward follows the same rule: take the inner ring\'s tooth count, double it, then add two more.\n\n   Ring 1: 4 teeth\n   Ring 2: 4 doubled + 2 = ?\n   Ring 3: ? doubled + 2 = ?\n   Ring 4: ? doubled + 2 = ?\n   Ring 5: ? doubled + 2 = ?\n\nHow many teeth does the outermost ring (Ring 5) have?\n\nThe core display waits for ____.',
      answer: '94',
      hints: [
        'Work outward one ring at a time. Each new ring\'s teeth depend only on the ring just inside it. The Gear Recurrence Study from the Orrery Gallery shows the full pattern.',
        'Ring 2 has 10 teeth. Ring 3 has 22 teeth. Keep going — the numbers grow faster than you might expect.',
        '4 → 10 → 22 → 46 → 94. The fifth ring has 94 teeth.'
      ],
      children: ['mc-gear-conclusion']
    },
    {
      id: 'mc-gear-conclusion',
      locationId: 'meridian-core',
      parentId: 'mc-gear-rings-puzzle',
      type: 'dialogue',
      label: 'Gear Ring Conclusion',
      narrative: 'The display confirms 94. The outermost ring\'s teeth engage with the core mechanism, and a brass token stamped 94 drops into the collection tray.',
      children: ['mc-outermost-ring-token']
    },
    {
      id: 'mc-outermost-ring-token',
      locationId: 'meridian-core',
      parentId: 'mc-gear-conclusion',
      type: 'item',
      label: 'Outermost Ring Token',
      narrative: 'The token bears 94 — the fifth ring\'s tooth count, verified by the recurrence principle.',
      rewardItem: 'outermost-ring-token'
    },

    {
      id: 'mc-number-gate-housing',
      locationId: 'meridian-core',
      parentId: null,
      type: 'dialogue',
      label: 'Number Gate Housing',
      narrative: 'A circular gate is stamped 360. It accepts one brass ticket for each whole number from 1 through 360 that cannot be divided evenly by 2, by 3, or by 5. Three small seals marked 2, 3, and 5 sit beneath the gate. A column beside the gate is sealed shut — it requires the Core Alignment Code from the Orrery Gallery.',
      children: ['mc-number-gate-column']
    },
    {
      id: 'mc-number-gate-column',
      locationId: 'meridian-core',
      parentId: 'mc-number-gate-housing',
      type: 'locked',
      label: 'Number Gate Column',
      narrative: 'The core alignment code is accepted. The column\'s seal breaks with a hiss of pressure, revealing the gate\'s inner mechanism — a counting array waiting for the final tally.',
      lockedNarrative: 'A sealed column is set into the wall beside the number gate. A brass slot reads: "CORE ALIGNMENT CODE REQUIRED."',
      lockedByItem: 'core-alignment-code',
      children: ['mc-number-gate-inner']
    },
    {
      id: 'mc-number-gate-inner',
      locationId: 'meridian-core',
      parentId: 'mc-number-gate-column',
      type: 'dialogue',
      label: 'Gate Inner Mechanism',
      narrative: 'The gate mechanism clicks into readiness. Its counting array awaits — 360 numbers, three forbidden divisors. The Inclusion-Exclusion Principle on the wall explains how to tally those that survive.',
      children: ['mc-number-gate-puzzle']
    },
    {
      id: 'mc-number-gate-puzzle',
      locationId: 'meridian-core',
      parentId: 'mc-number-gate-inner',
      type: 'puzzle',
      label: 'Number Gate Count',
      narrative: 'The gate\'s counting array is ready. The Inclusion-Exclusion Principle on the stone panel shows how to handle overlapping divisor sets.',
      question: 'The gate ledger reads: G = accepted tickets + the three seals.\n\n   Gate mechanism:\n\n        +-------------------+\n        |      GATE 360     |\n        |                   |\n        |  Accept if NOT    |\n        |  divisible by:    |\n        |   [2]  [3]  [5]   |\n        +-------------------+\n\nThe core window displays G = ____.',
      answer: '99',
      hints: [
        'First, count how many numbers from 1 to 360 can be split evenly into groups of 2, of 3, or of 5. The Inclusion-Exclusion Principle panel explains how to avoid counting overlaps.',
        'A number like 6 can be split into equal groups of 2 AND into equal groups of 3. You must subtract these overlapping numbers so they are not counted twice. Do the same for numbers that split into 2 and 5, and for 3 and 5.',
        'Numbers that split into 2, 3, and 5 all at once (like 30, 60, 90) were subtracted too many times. Add them back once. Remove the final rejected count from 360, then add the 3 seals.'
      ],
      children: ['mc-gate-conclusion']
    },
    {
      id: 'mc-gate-conclusion',
      locationId: 'meridian-core',
      parentId: 'mc-number-gate-puzzle',
      type: 'dialogue',
      label: 'Gate Count Conclusion',
      narrative: 'The window displays 99. The gate accepts 96 tickets — all numbers from 1 to 360 not divisible by 2, 3, or 5 — plus the three seals themselves. A brass token stamped with the tally drops from the mechanism.',
      children: ['mc-gate-count-token']
    },
    {
      id: 'mc-gate-count-token',
      locationId: 'meridian-core',
      parentId: 'mc-gate-conclusion',
      type: 'item',
      label: 'Gate Count Token',
      narrative: 'The token reads 99 — the total accepted tickets plus seals. The engine\'s final band will collect this count.',
      rewardItem: 'gate-count-token'
    },

    {
      id: 'mc-number-wheel-assembly',
      locationId: 'meridian-core',
      parentId: null,
      type: 'dialogue',
      label: 'Number Wheel Assembly',
      narrative: 'The column of white light narrows to a rotating number wheel. Its first display is 001. Every turn multiplies the hidden number by 7, but only the final three places remain visible. The markings on the wheel reveal that after 20 turns, the display returns to 001. The wheel has completed 2026 turns. The Modular Exponentiation Theorem on the wall explains how cycles reduce large turn counts.',
      children: ['mc-number-wheel-puzzle']
    },
    {
      id: 'mc-number-wheel-puzzle',
      locationId: 'meridian-core',
      parentId: 'mc-number-wheel-assembly',
      type: 'puzzle',
      label: 'Number Wheel Display',
      narrative: 'The wheel completes 2026 turns. The Modular Exponentiation Theorem shows how to reduce this using the 20-turn cycle.',
      question: 'The wheel completes 2026 turns.\n\n   Number wheel (3-place display):\n\n      +---+---+---+\n      | 0 | 0 | 1 |   Turn 0\n      +---+---+---+\n\n      +---+---+---+\n      | 0 | 0 | 7 |   Turn 1  (1 x 7)\n      +---+---+---+\n\n      +---+---+---+\n      | 0 | 4 | 9 |   Turn 2  (7 x 7)\n      +---+---+---+\n\n   |      ...and so on...\n\n      +---+---+---+\n      | 0 | 0 | 1 |   Turn 20 (returns!)\n      +---+---+---+\n\nThe three-place window now reads ____.',
      answer: '649',
      hints: [
        'Twenty turns bring the wheel full circle. Any complete group of 20 turns can be ignored — you only need to count the leftover turns. Find how many full groups of 20 fit into 2026.',
        'The Modular Exponentiation Theorem on the wall shows the full cycle and the computation: 2026 ÷ 20 = 101 remainder 6. Only 6 turns matter.',
        'Start from 1 and multiply by 7 once for each leftover turn. After each multiplication, keep only the last three digits. Those three digits are the answer.'
      ],
      children: ['mc-wheel-conclusion']
    },
    {
      id: 'mc-wheel-conclusion',
      locationId: 'meridian-core',
      parentId: 'mc-number-wheel-puzzle',
      type: 'dialogue',
      label: 'Wheel Display Conclusion',
      narrative: 'The three-place window settles at 649. The wheel\'s rotation slows and stops. A final brass token bearing 649 drops into the collection bin.',
      children: ['mc-wheel-display-token']
    },
    {
      id: 'mc-wheel-display-token',
      locationId: 'meridian-core',
      parentId: 'mc-wheel-conclusion',
      type: 'item',
      label: 'Wheel Display Token',
      narrative: 'The token reads 649 — the wheel\'s display after 2026 turns, reduced through modular cycle detection.',
      rewardItem: 'wheel-display-token'
    },

    {
      id: 'mc-engine-alignment-terminal',
      locationId: 'meridian-core',
      parentId: null,
      type: 'locked',
      label: 'Engine Alignment Terminal',
      narrative: 'The tannery seal presses into the terminal\'s authentication slot. The wax cracks along its edges and the terminal screen flickers to life. Seven concentric rings illuminate around the engine\'s final aperture — each ring has a slot waiting for a specific token.',
      lockedNarrative: 'At the base of the core, a terminal is sealed with a heavy brass plate. The lock plate bears the tannery\'s crossed-needle emblem — the same mark as the wax seal from the Flooded Archive. The terminal hums with latent power.',
      lockedByItem: 'tannery-seal',
      children: ['mc-token-gate-g1']
    },
    {
      id: 'mc-token-gate-g1',
      locationId: 'meridian-core',
      parentId: 'mc-engine-alignment-terminal',
      type: 'locked',
      label: 'Engine Ring 1 — Gallery Rail',
      narrative: 'The token slides into the outermost brass ring. A chime rings through the observatory — the rail network\'s shortest path is counted. Six more rings await their tokens.',
      lockedNarrative: 'The outermost brass ring encircles the engine aperture. A slot is cut into its rim, stamped with the shortest-path rail diagram. The ring glows faintly — it waits for the Shortest Path Token from the Orrery Gallery.',
      lockedByItem: 'shortest-path-token',
      children: ['mc-token-gate-g2']
    },
    {
      id: 'mc-token-gate-g2',
      locationId: 'meridian-core',
      parentId: 'mc-token-gate-g1',
      type: 'locked',
      label: 'Engine Ring 2 — Gallery Pendulum',
      narrative: 'The second token slides home. The engine hum resonates lower — the pendulum\'s median measurement is registered. Five rings remain.',
      lockedNarrative: 'The second brass ring has a slot stamped with a pendulum arc. The Median Code Token from the Orrery Gallery will fit here.',
      lockedByItem: 'median-code-token',
      children: ['mc-token-gate-g3']
    },
    {
      id: 'mc-token-gate-g3',
      locationId: 'meridian-core',
      parentId: 'mc-token-gate-g2',
      type: 'locked',
      label: 'Engine Ring 3 — Gallery Planet',
      narrative: 'The third ring accepts its token with a deep vibration. Saturn\'s mass is absorbed into the engine\'s calculation. Four rings left.',
      lockedNarrative: 'The third ring is heavier than the others, stamped with a planetary balance beam. It needs the Saturn Mass Token from the Orrery Gallery.',
      lockedByItem: 'saturn-mass-token',
      children: ['mc-token-gate-g4']
    },
    {
      id: 'mc-token-gate-g4',
      locationId: 'meridian-core',
      parentId: 'mc-token-gate-g3',
      type: 'locked',
      label: 'Engine Ring 4 — Gallery Moon',
      narrative: 'The fourth token clicks into place. The moon cage\'s favorable pairs are counted. Three rings remain — the gallery band is now complete.',
      lockedNarrative: 'The fourth ring glows with a pearl-white light, its slot shaped like a moon. The Moon Pair Token from the Orrery Gallery completes the gallery set.',
      lockedByItem: 'moon-pair-token',
      children: ['mc-token-gate-c1']
    },
    {
      id: 'mc-token-gate-c1',
      locationId: 'meridian-core',
      parentId: 'mc-token-gate-g4',
      type: 'locked',
      label: 'Engine Ring 5 — Core Gear',
      narrative: 'The fifth ring vibrates in sympathy with the gear rings above. The outermost gear tooth count is verified. Two rings remain — the core band takes shape.',
      lockedNarrative: 'The fifth ring\'s slot is etched with concentric gear teeth. The Outermost Ring Token from the Meridian Core is required.',
      lockedByItem: 'outermost-ring-token',
      children: ['mc-token-gate-c2']
    },
    {
      id: 'mc-token-gate-c2',
      locationId: 'meridian-core',
      parentId: 'mc-token-gate-c1',
      type: 'locked',
      label: 'Engine Ring 6 — Core Gate',
      narrative: 'The sixth ring flares as the token seats. The number gate\'s tally is written into the engine\'s memory — 360 numbers, three forbidden divisors, three seals. One final ring awaits.',
      lockedNarrative: 'The sixth ring is stamped with a gate and three seals — 2, 3, and 5. It waits for the Gate Count Token from the Meridian Core.',
      lockedByItem: 'gate-count-token',
      children: ['mc-token-gate-c3']
    },
    {
      id: 'mc-token-gate-c3',
      locationId: 'meridian-core',
      parentId: 'mc-token-gate-c2',
      type: 'locked',
      label: 'Engine Ring 7 — Core Wheel',
      narrative: 'The seventh and final ring closes around the token. The number wheel\'s display — six turns beyond 001 — is factored into the engine. All seven rings lock together and the three brass alignment bands slide into view.',
      lockedNarrative: 'The innermost ring is the narrowest, its slot barely wide enough for a thin brass token. The Wheel Display Token from the Meridian Core is the final piece.',
      lockedByItem: 'wheel-display-token',
      children: ['mc-engine-alignment-inner']
    },
    {
      id: 'mc-engine-alignment-inner',
      locationId: 'meridian-core',
      parentId: 'mc-token-gate-c3',
      type: 'dialogue',
      label: 'Alignment Chamber',
      narrative: 'Three brass bands slide into view, each carrying the numbers recovered from one chamber. The first remembers the archive. The second remembers the gallery. The third remembers the core. An old rule is carved beneath them: "Add each band. Tie away bundles of ten. Let only what cannot make a bundle pass into the three windows."',
      children: ['mc-engine-alignment-puzzle']
    },
    {
      id: 'mc-engine-alignment-puzzle',
      locationId: 'meridian-core',
      parentId: 'mc-engine-alignment-inner',
      type: 'puzzle',
      label: 'Final Engine Alignment',
      narrative: 'The engine stops. The three bands hold the answers from every chamber you have solved. The final windows wait for the combined code.',
      question: 'The bands carry these marks:\n\n   Archive:  74   54    6   274\n   Gallery:  12   33   26    35\n   Core:     94   99   649\n\nBeneath them, an old rule is carved: "Add each band. Tie away bundles of ten. Let only what cannot make a bundle pass into the three windows."\n\nThe final windows are A | G | C. Their combined code is ____.',
      answer: '862',
      hints: [
        '"Tie away bundles of ten" means keep only the last digit of each sum — the remainder after removing every complete group of ten. Start by adding all the numbers on the Archive band.',
        'Add the Gallery band and find its last digit. Do the same for the Core band. You should have three single digits.',
        'Place the three digits in order: Archive first, then Gallery, then Core. The three windows read them left to right as a single code.'
      ],
      isMeta: true,
      children: ['mc-victory']
    },
    {
      id: 'mc-victory',
      locationId: 'meridian-core',
      parentId: 'mc-engine-alignment-puzzle',
      type: 'dialogue',
      label: 'Engine Alignment Complete',
      narrative: 'The three windows light up: 8 — 6 — 2.\n\nThe Meridian Engine aligns for the first time in centuries. The column of white light expands outward, wrapping the observatory in a perfect ring of radiance. The gears fall silent. The red strip on the ceiling stops counting.\n\nThe stone wall before you ripples and becomes a doorway — not into another chamber, but into a sky you have never seen. Stars wheel above a landscape that bends gently at the edges.\n\nBelow the final window, a single line of new engraving glows:\n\nYOU MEASURED. YOU DEDUCED. YOU ALIGNED.\n\nStep through.',
      children: []
    }
  ]
};

export default data;
