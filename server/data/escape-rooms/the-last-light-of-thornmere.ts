import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'the-last-light-of-thornmere',
  name: 'The Last Light of Thornmere',
  description: 'A remote lighthouse has gone silent. The keeper vanished after discovering a shipping company\'s insurance fraud. His evidence is encoded into the station\'s own systems — master every one to escape.',
  difficulty: 'hard',
  intro: 'The supply boat departs, its wake swallowed by the grey Atlantic. Thornmere Light Station rises ahead — a granite tower twenty-two nautical miles from the nearest land, its beam still turning against a darkening sky.\n\nThe Signal House door is the only entrance left unsealed. Heavy iron storm shutters cover every other opening. Inside, the room is orderly — too orderly. Every pen is aligned. Every drawer is labelled. A mug of coffee sits on the desk, cold for weeks, a grey skin of mould on its surface. The clock on the wall has stopped at 3:47.\n\nHead Keeper Elias Marsh is gone. Three weeks of silence. The Maritime Authority sent you to investigate.\n\nTwo objects dominate the room: a Duty Roster Board covered in Marsh\'s precise handwriting, and a Vessel Authentication Board pinned with harbour entry codes. A heavy oak door — the Watch Room entrance — is sealed with two independent locks.\n\nThe storm is building to the north-west. You have hours, not days.',
  locations: [
    {
      id: 'signal-house',
      name: 'The Signal House',
      description: 'The station\'s communications and administrative centre. Marsh\'s desk is immaculate — every pen parallel, every drawer labelled. A brass-framed photograph, a cold mug of coffee, and a stopped clock tell the story of abrupt departure. The Duty Roster Board and Vessel Authentication Board dominate the walls. Through a salt-crusted window, the lighthouse beam sweeps across dark water.'
    },
    {
      id: 'watch-room',
      name: 'The Watch Room',
      description: 'The operational heart of the station, built into the tower\'s base. Unlike the Signal House\'s orderly stillness, this room feels interrupted — a cot with a rumpled blanket, overlapping coffee rings on every surface, instrument panels ticking with live data. Marsh\'s handwriting crowds the margins of every worksheet. The storm is visible through the window now: a dark line on the north-western horizon.'
    },
    {
      id: 'lantern-chamber',
      name: 'The Lantern Chamber',
      description: 'The tower\'s summit, enclosed in glass on every side. The great Fresnel lens turns slowly at the room\'s centre, its beam sweeping across the churning Atlantic. The storm fills the north-western sky. Marsh\'s work table, a neatly made cot, and the emergency override panel occupy the space beneath the light. The wind is loud. The glass rattles. Time is running out.'
    }
  ],
  nodes: [
    // =========================================================
    // SIGNAL HOUSE — Environmental Storytelling
    // =========================================================
    {
      id: 'sh-marsh-desk',
      locationId: 'signal-house',
      parentId: null,
      type: 'dialogue',
      label: 'Keeper\'s Desk',
      narrative: 'Elias Marsh\'s desk is arranged with surgical precision — every pen parallel to the blotter, every drawer bearing a handwritten label. A three-week-old newspaper lies folded beside a mug of long-cold coffee, a grey skin of mould floating on its surface. The wall clock above the desk has stopped at 3:47.\n\nA brass-framed photograph shows a young woman standing on a dock, squinting into the sun and smiling. The dust around the frame has been disturbed — this is the one object Marsh touched before he left.',
      children: []
    },
    {
      id: 'sh-filing-cabinet',
      locationId: 'signal-house',
      parentId: null,
      type: 'dialogue',
      label: 'Filing Cabinet & Outbox',
      narrative: 'The third drawer holds a folder labelled "Personnel — T. Wren." Inside is the departure letter of Assistant Keeper Thomas Wren, dated six months ago:\n\n"I hope you find what you\'re looking for, Elias. I fear the isolation has taken more from you than the sea ever gave."\n\nWren saw Marsh\'s obsession as paranoia. He was wrong — but Marsh kept the letter.\n\nA half-written telegram sits in the outbox above the cabinet, its message trailing off mid-sentence:\n\n"Penhaligon — Voss & Harrow manifests do not match observed traffic. Request authority to—"\n\nMarsh never sent it. He knew the Authority couldn\'t be trusted.\n\nA leather logbook lies open on top of the cabinet, its final entry dated three weeks ago:\n\n"Both systems are primed. The roster holds the order — the authentication holds the rule. Anyone who masters both will reach the Watch Room. Anyone who reaches the Lantern Chamber will understand. The light reveals what the darkness hides."\n\nBelow it, a diagram shows two keys turning simultaneously in the Watch Room door\'s twin locks.',
      children: []
    },
    {
      id: 'sh-storm-manual',
      locationId: 'signal-house',
      parentId: null,
      type: 'dialogue',
      label: 'Storm Protocol Manual',
      narrative: 'The station\'s emergency procedures manual lies open on the communications desk, turned to the page on automatic lockdown. One passage is underlined in Marsh\'s hand:\n\n"Override requires sequential verification at all operational stations."\n\nBelow it, a handwritten annotation: "They\'ll have to understand the station. It\'s the only way to be certain."\n\nMarsh underlined it. He wanted someone to come — someone who could think like him.',
      children: []
    },

    // =========================================================
    // SIGNAL HOUSE — Puzzle A1: Duty Roster (Constrained Ordering)
    // =========================================================
    {
      id: 'sh-duty-roster',
      locationId: 'signal-house',
      parentId: null,
      type: 'dialogue',
      label: 'Duty Roster Board',
      narrative: 'The Duty Roster Board dominates the east wall — five watch stations listed with their priority assignments, Marsh\'s precise handwriting filling every column. Station names are replaced with numbered tags 1 through 5. Operational notes in the margin explain the ranking logic.\n\nA brass key slot is built into the board\'s lower frame, its mechanism linked to the roster\'s correct ordering.',
      children: ['sh-roster-puzzle']
    },
    {
      id: 'sh-roster-puzzle',
      locationId: 'signal-house',
      parentId: 'sh-duty-roster',
      type: 'puzzle',
      label: 'Watch Station Priority',
      narrative: 'Marsh\'s operational notes are pinned beside the roster. Four clues constrain the priority order, but a fifth — a faded addendum pinned to the lower corner — is the tiebreaker he added when he refined the schedule.',
      question: 'Marsh\'s priority notes read:\n\n"Station 2 ranks exactly two positions above Station 5."\n"Station 4 does not rank first or last."\n"Station 1 ranks below Station 3."\n"Station 4 ranks immediately below Station 2."\n\nThe faded addendum reads:\n"Station 1 ranks immediately above Station 2."\n\nEnter the five station numbers in priority order (1st to 5th), no spaces.',
      answer: '31245',
      hints: [
        'Four clues alone admit three possible orderings. Check the lower corner of the board — Marsh added the addendum after refining the schedule. It resolves the ambiguity.',
        'From the addendum, Station 1 is directly above Station 2. Combined with Station 2 being two above Station 5 and Station 4 directly below Station 2, the middle three are fixed: 1, 2, 4. Station 3 must be above Station 1 (from clue 3), so Station 3 is first. Station 5 fills the last position.',
        'The priority order from 1st to 5th is: Station 3, Station 1, Station 2, Station 4, Station 5. Enter 31245.'
      ],
      children: ['sh-watchroom-key-node', 'sh-roster-order']
    },
    {
      id: 'sh-watchroom-key-node',
      locationId: 'signal-house',
      parentId: 'sh-roster-puzzle',
      type: 'item',
      label: 'Watch Room Key',
      narrative: 'The brass key slot clicks open. You retrieve a heavy brass key stamped with the station\'s anchor emblem. The tag reads: "Watch Room — Schedule Lock."',
      rewardItem: 'sh-watchroom-key',
      children: []
    },
    {
      id: 'sh-roster-order',
      locationId: 'signal-house',
      parentId: 'sh-roster-puzzle',
      type: 'dialogue',
      label: 'Roster Recording',
      narrative: 'As the key releases, a small mechanical register in the board\'s frame clicks and displays the validated priority order:\n\n1st — Station 3\n2nd — Station 1\n3rd — Station 2\n4th — Station 4\n5th — Station 5\n\nA note beneath the register reads: "Priority sequence recorded. Cross-reference with shipping categories." The order is clearly important beyond this room — Marsh\'s annotation suggests you\'ll need it again.',
      children: []
    },

    // =========================================================
    // SIGNAL HOUSE — Puzzle A2: Vessel Authentication (Inductive Rule Discovery)
    // =========================================================
    {
      id: 'sh-auth-board',
      locationId: 'signal-house',
      parentId: null,
      type: 'dialogue',
      label: 'Vessel Authentication Board',
      narrative: 'The Vessel Authentication Board hangs beside the Signal House door — a reference card used to distinguish legitimate shipping traffic from unverified vessels. Two columns show ACCEPTED and REJECTED harbour entry codes. A handwritten procedure card is pinned below.\n\nFive candidate vessels are currently requesting entry. A stamp seal is built into the board — it will release when the correct candidate is identified.',
      children: ['sh-auth-puzzle']
    },
    {
      id: 'sh-auth-puzzle',
      locationId: 'signal-house',
      parentId: 'sh-auth-board',
      type: 'puzzle',
      label: 'Vessel Codes',
      narrative: 'The board\'s accepted codes share a mathematical property. Study the examples, infer the rule, and apply it to the candidates.',
      question: 'The board displays:\n\nACCEPTED: 4826, 2604, 8642, 6280\nREJECTED: 1358, 9134, 3578, 5792\n\nCandidate vessels requesting entry: 1123, 4455, 7788, 2019, 3141\n\nIdentify the one candidate that should be accepted. Enter its four-digit code.',
      answer: '2019',
      hints: [
        'Study the accepted codes for a shared mathematical property. All accepted codes share a trait that every rejected code lacks. Look at the sum of the four digits.',
        'Add the digits of each accepted code: 4+8+2+6=20, 2+6+0+4=12, 8+6+4+2=20, 6+2+8+0=16. All are divisible by 4. The rejected codes: 1+3+5+8=17, 9+1+3+4=17, 3+5+7+8=23, 5+7+9+2=23 — none are divisible by 4. The rule is: digit sum must be divisible by 4.',
        'Test each candidate: 1123→7 (fails), 4455→18 (fails), 7788→30 (fails), 2019→12 (passes), 3141→9 (fails). The accepted code is 2019.'
      ],
      children: ['sh-auth-stamp-node', 'sh-auth-rule']
    },
    {
      id: 'sh-auth-stamp-node',
      locationId: 'signal-house',
      parentId: 'sh-auth-puzzle',
      type: 'item',
      label: 'Authentication Stamp',
      narrative: 'The stamp seal mechanism releases. You retrieve a small brass stamp bearing the station\'s verification mark. The tag reads: "Vessel Authentication — Verification Lock."',
      rewardItem: 'sh-auth-stamp',
      children: []
    },
    {
      id: 'sh-auth-rule',
      locationId: 'signal-house',
      parentId: 'sh-auth-puzzle',
      type: 'dialogue',
      label: 'Authentication Rule Card',
      narrative: 'The procedure card pinned below the board slides forward, revealing the authentication rule Marsh encoded:\n\n"A vessel code is valid if the sum of its four digits is evenly divisible by 4."\n\nA handwritten note beneath: "This rule applies beyond the board. Carry it forward."\n\nMarsh didn\'t just want you to identify one vessel — he wanted you to learn the rule itself. It will be used again.',
      children: []
    },

    // =========================================================
    // SIGNAL HOUSE — Door A→B: Watch Room Door (Dual Lock)
    // =========================================================
    {
      id: 'sh-wr-door',
      locationId: 'signal-house',
      parentId: null,
      type: 'locked',
      label: 'Watch Room Door (Schedule Lock)',
      lockedByItem: 'sh-watchroom-key',
      lockedNarrative: 'A heavy oak door set into the far wall of the Signal House. It is secured by two independent locks — a schedule lock and a verification lock. Both must be opened to reach the Watch Room.\n\nThe schedule lock\'s keyway is stamped with the anchor emblem. It requires the Watch Room Key from the Duty Roster Board.',
      narrative: 'The Watch Room Key turns in the schedule lock with a heavy click. One lock down. The verification lock still holds — it requires the Authentication Stamp.',
      children: ['sh-wr-lock2']
    },
    {
      id: 'sh-wr-lock2',
      locationId: 'signal-house',
      parentId: 'sh-wr-door',
      type: 'locked',
      label: 'Watch Room Door (Verification Lock)',
      lockedByItem: 'sh-auth-stamp',
      lockedNarrative: 'The second lock — the verification lock — has a slot shaped to accept the station\'s brass stamp seal. It requires the Authentication Stamp from the Vessel Authentication Board.',
      narrative: 'You press the Authentication Stamp into the verification lock. The mechanism accepts it with a deep mechanical thunk. Both locks disengage, and the heavy door swings inward.\n\nA narrow stone corridor slopes downward toward the tower\'s base. The sound of the wind changes — deeper, more resonant.',
      children: ['sh-to-wr']
    },
    {
      id: 'sh-to-wr',
      locationId: 'watch-room',
      parentId: 'sh-wr-lock2',
      type: 'dialogue',
      label: 'Enter the Watch Room',
      narrative: 'You descend the stone corridor into the Watch Room. Instrument panels line the walls, their needles twitching with live data. A cot is pushed against the east wall. Coffee rings overlap on every surface. Marsh\'s handwriting — less precise now, the margins crowded — covers the worksheets pinned to every available space.\n\nThrough the window, a dark line of storm clouds gathers on the north-western horizon.',
      children: []
    },

    // =========================================================
    // WATCH ROOM — Environmental Storytelling
    // =========================================================
    {
      id: 'wr-cot',
      locationId: 'watch-room',
      parentId: null,
      type: 'dialogue',
      label: 'Keeper\'s Cot',
      narrative: 'A narrow cot is pushed against the east wall beneath a salt-crusted window. A rumpled blanket, a pillow, and a pair of reading glasses rest on it. A notebook protrudes from under the pillow — the pages are filled with ship names, draught measurements, and timestamps. Marsh was sleeping here, working through the night, waking to check the telescope, returning to his calculations.\n\nThe cot tells a story of obsession.',
      children: []
    },
    {
      id: 'wr-work-desk',
      locationId: 'watch-room',
      parentId: null,
      type: 'dialogue',
      label: 'Work Desk',
      narrative: 'Marsh\'s work desk is covered in overlapping coffee rings — pale brown to dark, weeks of work compressed into stains. An inkwell nearly empty, a half-burned candle. The margins of every document are crowded with annotations, crossings-out, and question marks.\n\nPinned to the corkboard above the desk, a single note in Marsh\'s increasingly urgent hand:\n\n"Wren would call this paranoia. Perhaps it is. But the numbers don\'t lie — only people do."\n\nBelow it, a Voss & Harrow letterhead with Marsh\'s annotation: "Verify all manifests."\n\nAn envelope sits beside the inkwell, postmarked three weeks ago. Return address: "A. Marsh, 14 Harbour Street, Kingsport." His daughter. The envelope is creased — picked up and put down many times, the seal unbroken. Marsh never opened it.',
      children: []
    },
    {
      id: 'wr-telescope',
      locationId: 'watch-room',
      parentId: null,
      type: 'dialogue',
      label: 'Observation Telescope',
      narrative: 'A brass telescope stands by the window, locked onto a fixed bearing: west-north-west. A navigation chart pinned to the window frame has a single point circled in red ink at the same coordinates.\n\nYou press your eye to the lens. For now, there is only open water — grey waves and darkening sky. But Marsh was watching something specific. The chart\'s circled point is labelled: "Anomaly confirmed. Repeat observations."',
      children: []
    },

    // =========================================================
    // WATCH ROOM — Puzzle B1: Shipping Ledger (Cross-Source Triangulation)
    // =========================================================
    {
      id: 'wr-ledger',
      locationId: 'watch-room',
      parentId: null,
      type: 'dialogue',
      label: 'Shipping Ledger',
      narrative: 'The station\'s shipping ledger lies open on the desk, its pages dense with vessel records. Six entries are listed with identification tags, cargo tonnage, and shipping categories. Marsh\'s annotations crowd the margins — arrows, circles, and one entry underlined three times in red ink.\n\nA note in the margin reads: "Categories align to watch station priority. Cross-reference."',
      children: ['wr-ledger-puzzle']
    },
    {
      id: 'wr-ledger-puzzle',
      locationId: 'watch-room',
      parentId: 'wr-ledger',
      type: 'puzzle',
      label: 'Vessel Identification',
      narrative: 'The ledger records six vessels. Marsh\'s annotation system links the shipping categories to the watch station priority order. The vessel he underlined three times can only be identified by combining the duty roster priority with the vessel authentication rule.',
      question: 'The ledger shows:\n\n| Row | Tag | Tonnage | Category |\n|  1  | AX  |    44   |    A     |\n|  2  | BQ  |    31   |    C     |\n|  3  | CM  |    58   |    B     |\n|  4  | DP  |    22   |    B     |\n|  5  | EJ  |    67   |    D     |\n|  6  | FZ  |    39   |    E     |\n\nThe category system maps to watch station numbers: Station 1 = Category A, Station 2 = Category B, Station 3 = Category C, Station 4 = Category D, Station 5 = Category E.\n\nUse the duty roster priority to select a category, then apply the authentication rule to break any tie. Enter the target vessel\'s Tag.',
      answer: 'dp',
      hints: [
        'The duty roster priority order (3,1,2,4,5) tells you which station to focus on. The third station in priority is Station 2, which maps to Category B. Two vessels are in Category B: CM (Row 3) and DP (Row 4). Apply the vessel authentication rule (digit sum divisible by 4) to their tonnage values.',
        'Row 3 (CM): tonnage 58, digit sum 5+8=13 — not divisible by 4. Row 4 (DP): tonnage 22, digit sum 2+2=4 — divisible by 4. The vessel Marsh underlined three times is DP.',
        'The target vessel tag is DP. Enter dp.'
      ],
      children: ['wr-cargo-extract-node', 'wr-cargo-value']
    },
    {
      id: 'wr-cargo-extract-node',
      locationId: 'watch-room',
      parentId: 'wr-ledger-puzzle',
      type: 'item',
      label: 'Cargo Manifest Extract',
      narrative: 'A printed extract slides from a compartment at the base of the ledger. It is stamped with the vessel tag DP and shows the cargo tonnage: 22. The document is labelled: "Stairwell Verification — Shipping Records."',
      rewardItem: 'wr-cargo-extract',
      children: []
    },
    {
      id: 'wr-cargo-value',
      locationId: 'watch-room',
      parentId: 'wr-ledger-puzzle',
      type: 'dialogue',
      label: 'Ledger Annotation',
      narrative: 'A marginal note in Marsh\'s hand appears beside the identified entry:\n\n"DP — Voss & Harrow freighter. Manifest claims textiles. Observed draught indicates heavy machinery. Tonnage: 22. Iteration count for tide model."\n\nThe cargo tonnage (22) is not just a record — it is a parameter Marsh embedded in his tide prediction model. The digit sum (4) determines how many computational cycles to run.',
      children: []
    },

    // =========================================================
    // WATCH ROOM — Puzzle B2: Tide Prediction (Iterative Simulation)
    // =========================================================
    {
      id: 'wr-tide-sheet',
      locationId: 'watch-room',
      parentId: null,
      type: 'dialogue',
      label: 'Tide Prediction Worksheet',
      narrative: 'A worksheet is pinned to the wall beside the tide gauge — a computational model Marsh used to predict water levels. It shows a starting sequence and a transformation rule. The number of cycles to run is determined by the cargo tonnage from the shipping ledger.\n\nA small storage compartment is built into the worksheet\'s frame.',
      children: ['wr-tide-puzzle']
    },
    {
      id: 'wr-tide-puzzle',
      locationId: 'watch-room',
      parentId: 'wr-tide-sheet',
      type: 'puzzle',
      label: 'Tide Computation',
      narrative: 'The worksheet describes an iterative simulation. Run the stated number of cycles and report the final six-digit sequence.',
      question: 'The tide prediction worksheet reads:\n\nStarting sequence: 3 1 4 1 5 9\n\nTransformation rule: Each position becomes (its value + the value immediately to its right, wrapping around) mod 10. Apply simultaneously to all six positions per cycle.\n\nNumber of cycles: The digit sum of the identified vessel\'s cargo tonnage (K3).\n\nEnter the final six-digit sequence after all cycles.',
      answer: '027874',
      hints: [
        'The cargo tonnage (K3) is 22. Its digit sum is 2+2=4. Run the transformation for exactly 4 cycles on the starting sequence [3,1,4,1,5,9]. Each cycle updates all six positions simultaneously using the pre-update values.',
        'Cycle 1: (3+1)=4, (1+4)=5, (4+1)=5, (1+5)=6, (5+9)=4, (9+3)=2 → 4 5 5 6 4 2. Cycle 2: 9 0 1 0 6 6. Cycle 3: 9 1 1 6 2 5.',
        'Cycle 4: (9+1)=0, (1+1)=2, (1+6)=7, (6+2)=8, (2+5)=7, (5+9)=4 → 0 2 7 8 7 4. Enter 027874.'
      ],
      children: ['wr-calib-card-node', 'wr-tide-seq']
    },
    {
      id: 'wr-calib-card-node',
      locationId: 'watch-room',
      parentId: 'wr-tide-puzzle',
      type: 'item',
      label: 'Calibration Procedure Card',
      narrative: 'The worksheet\'s storage compartment opens. Inside is a laminated card stamped "Instrument Calibration Protocol." Initials in the corner read "T.W." — Thomas Wren. The card states the station\'s quality-control procedure for reconciling conflicting sensor readings.',
      rewardItem: 'wr-calib-card',
      children: []
    },
    {
      id: 'wr-tide-seq',
      locationId: 'watch-room',
      parentId: 'wr-tide-puzzle',
      type: 'dialogue',
      label: 'Predicted Tide Sequence',
      narrative: 'The tide gauge\'s register updates with the computed sequence: 027874.\n\nThe worksheet\'s header now displays the full tide prediction:\n\n"Tide Level Prediction — Sequence 027874 — Verified."\n\nA note in Marsh\'s hand: "First two digits encode the vessel\'s observed bearing offset. Last two feed into navigation tables."\n\nThe tide sequence is not just a number — it carries two pieces of evidence encoded within it.',
      children: []
    },

    // =========================================================
    // WATCH ROOM — Puzzle B3: Instrument Calibration (Consensus Filtering)
    // =========================================================
    {
      id: 'wr-inst-panel',
      locationId: 'watch-room',
      parentId: null,
      type: 'dialogue',
      label: 'Instrument Panel',
      narrative: 'Five monitoring stations around the island feed sensor readings to this panel — tidal pressure, current speed, and wind velocity data. Today, the readings are wildly inconsistent. One station is clearly malfunctioning. Or perhaps, one station is reporting something Marsh didn\'t want anyone to miss.\n\nThe Calibration Procedure Card (found with the tide prediction materials) states the protocol for reconciling conflicting readings.',
      children: ['wr-inst-puzzle']
    },
    {
      id: 'wr-inst-puzzle',
      locationId: 'watch-room',
      parentId: 'wr-inst-panel',
      type: 'puzzle',
      label: 'Sensor Reconciliation',
      narrative: 'The five sensor readings are displayed on the panel. Use the Calibration Procedure Card\'s protocol to identify and discard the outlier, then compute the consensus value.',
      question: 'The instrument panel displays five readings:\n\nStation A: 118\nStation B: 121\nStation C: 124\nStation D: 205\nStation E: 122\n\nThe Calibration Procedure Card (I4) states:\n"Discard any reading that deviates from the median of all five by more than 10. Report the average of the remaining values, rounded down."\n\nEnter the consensus value.',
      answer: '121',
      hints: [
        'The Calibration Procedure Card (I4) was stored with the tide prediction materials — retrieve it if you haven\'t already. It describes the filtering protocol: find the median, discard readings more than 10 away, average the rest.',
        'Sort the five values: 118, 121, 122, 124, 205. The median is 122. Deviations: 118→4, 121→1, 122→0, 124→2, 205→83. Only 205 exceeds the threshold of 10 — discard it.',
        'Average the remaining four: (118+121+124+122) ÷ 4 = 485 ÷ 4 = 121.25. Rounded down: 121. Enter 121.'
      ],
      children: ['wr-consensus-cert-node', 'wr-consensus-val']
    },
    {
      id: 'wr-consensus-cert-node',
      locationId: 'watch-room',
      parentId: 'wr-inst-puzzle',
      type: 'item',
      label: 'Consensus Reading Certificate',
      narrative: 'The panel prints a small certificate: "Consensus Instrument Reading — 121 — Verified." It is labelled: "Stairwell Verification — Instrument Consensus."',
      rewardItem: 'wr-consensus-cert',
      children: []
    },
    {
      id: 'wr-consensus-val',
      locationId: 'watch-room',
      parentId: 'wr-inst-puzzle',
      type: 'dialogue',
      label: 'Instrument Register',
      narrative: 'The panel\'s register logs the consensus value: 121.\n\nA note in Marsh\'s hand appears on the panel\'s maintenance log:\n\n"Station D (reading 205) corresponds to Monitoring Point 4 — the sensor nearest the western shipping lane anomaly. The reading is not a malfunction. I confirmed it three times. Something large was moving through water too shallow for its draught. Voss & Harrow."\n\nThe outlier was never an error. Marsh chose it deliberately — the same way he chose every number in this room.',
      children: []
    },

    // =========================================================
    // WATCH ROOM — Door B→C: Stairwell Door (Dual Lock)
    // =========================================================
    {
      id: 'wr-stairwell',
      locationId: 'watch-room',
      parentId: null,
      type: 'locked',
      label: 'Stairwell Door (Shipping Verification)',
      lockedByItem: 'wr-cargo-extract',
      lockedNarrative: 'A heavy iron gate at the north end of the Watch Room seals the stairwell to the Lantern Chamber. A label reads: "TOWER ACCESS — Shipping Record Verification + Instrument Consensus Verification."\n\nThe first verification slot is labelled "Cargo Manifest." It requires the Cargo Manifest Extract from the shipping ledger.',
      narrative: 'You slide the Cargo Manifest Extract into the first verification slot. A green light blinks — the shipping record is confirmed. The second verification slot still glows red.',
      children: ['wr-stairwell2']
    },
    {
      id: 'wr-stairwell2',
      locationId: 'watch-room',
      parentId: 'wr-stairwell',
      type: 'locked',
      label: 'Stairwell Door (Consensus Verification)',
      lockedByItem: 'wr-consensus-cert',
      lockedNarrative: 'The second verification slot is labelled "Instrument Consensus." It requires the Consensus Reading Certificate from the instrument panel.',
      narrative: 'You insert the Consensus Reading Certificate. The green light flashes twice. With a grinding sound, the heavy iron bolt withdraws. The stairwell door opens onto a spiral stone staircase — eighty-two steps, the walls narrowing, the sound of the wind growing louder with each turn.',
      children: ['wr-to-lc']
    },
    {
      id: 'wr-to-lc',
      locationId: 'lantern-chamber',
      parentId: 'wr-stairwell2',
      type: 'dialogue',
      label: 'Ascend the Tower',
      narrative: 'You climb the spiral staircase. The stone walls narrow. The wind grows from a distant hum to a roar. With every step, the beam of the Fresnel lens pulses brighter through the gaps in the stonework.\n\nEighty-two steps later, you emerge into the Lantern Chamber — glass on every side, the storm filling the north-western sky, the great lens turning at the room\'s centre. Marsh\'s work table, his cot, and the override panel wait beneath the light.',
      children: []
    },

    // =========================================================
    // LANTERN CHAMBER — Environmental Storytelling
    // =========================================================
    {
      id: 'lc-lens',
      locationId: 'lantern-chamber',
      parentId: null,
      type: 'dialogue',
      label: 'The Fresnel Lens',
      narrative: 'The great Fresnel lens dominates the Lantern Chamber — an intricate cathedral of brass and glass, its prisms catching and redirecting the light in a slow, hypnotic rotation. The beam sweeps across the dark Atlantic every eight seconds. It has been turning for fifteen years. It has not stopped for three weeks.\n\nMarsh kept it running. Even at the end, the light was his responsibility.\n\nThe lens\'s control panel is mounted on its base — a series of operating parameters that someone has recently modified.',
      children: []
    },
    {
      id: 'lc-work-table',
      locationId: 'lantern-chamber',
      parentId: null,
      type: 'dialogue',
      label: 'Work Table',
      narrative: 'Marsh\'s work table is pushed against the south wall, covered in navigation charts and personal notes. His personal notebook lies open, pages filled with increasingly urgent handwriting. The final entry is dated the day the station went silent:\n\n"The light reveals what the darkness hides. If you have read this far, you understand the station. You understand what I found. The override is not just a door — it is a transmitter. Enter the synthesis and the truth goes home."\n\nBelow it: "Voss & Harrow will answer for every ship they sent to the bottom. I have made certain of it."\n\nBeside the notebook lies a letter from Ada Marsh, dated three months ago. Unlike the unopened envelope in the Watch Room, this one has been opened and refolded many times — the creases are soft, the paper worn:\n\n"Father — I know you think no one believes you. I believe you. Please come home. You don\'t have to do this alone."\n\nHe read it. He just never wrote back.',
      children: []
    },
    {
      id: 'lc-telescope',
      locationId: 'lantern-chamber',
      parentId: null,
      type: 'dialogue',
      label: 'Lantern Telescope',
      narrative: 'A second telescope is mounted at the observation window, aimed at the same bearing as the one in the Watch Room: west-north-west. From this height, the view is stark.\n\nA vessel sits at anchor in the wrong channel — a freighter flying the Voss & Harrow flag. It should not be there. Its draught is too deep for those waters, and its cargo manifest claims textiles. You can see heavy machinery lashed to its deck.\n\nThe evidence is visible. It was always visible. You just had to know where to look.',
      children: []
    },
    {
      id: 'lc-marsh-cot',
      locationId: 'lantern-chamber',
      parentId: null,
      type: 'dialogue',
      label: 'Keeper\'s Cot',
      narrative: 'A narrow cot is tucked against the south wall, neatly made — the blanket tucked with military precision, the pillow smoothed. Even in his final days, sleeping beneath the light itself, Marsh maintained his discipline.\n\nA pair of reading glasses rests on the pillow. A small photograph of Ada — the same one from the Signal House, but this copy is worn from handling — is tucked into the frame.\n\nThe cot is the last bed Marsh ever made. The man who encoded evidence in tide predictions was not chaotic — he was methodical to the last.',
      children: []
    },

    // =========================================================
    // LANTERN CHAMBER — Puzzle C1: Navigation Tables (Recursive Resolution)
    // =========================================================
    {
      id: 'lc-nav-sheet',
      locationId: 'lantern-chamber',
      parentId: null,
      type: 'dialogue',
      label: 'Navigation Worksheet',
      narrative: 'A navigation worksheet is pinned to the work table — a web of interlocking term definitions, some referencing each other, some referencing values computed in the Watch Room. The terms must be resolved in the correct order before any arithmetic is possible.\n\nA heavy brass valve handle is stored in a locked compartment beneath the worksheet.',
      children: ['lc-nav-puzzle']
    },
    {
      id: 'lc-nav-puzzle',
      locationId: 'lantern-chamber',
      parentId: 'lc-nav-sheet',
      type: 'puzzle',
      label: 'Navigation Terms',
      narrative: 'Five navigation terms are defined in terms of each other and values from the Watch Room. Determine the correct resolution order, compute each value, and enter the final term.',
      question: 'The navigation worksheet defines:\n\nT1 = K5 − 100\nT2 = T1 + 9\nT3 = (last two digits of K4) − T2 − 5\nT4 = T3 + 3\nT5 = T2 + T4\n\nWhere:\nK4 = Tide Prediction Sequence (027874)\nK5 = Consensus Instrument Reading (121)\n\nResolve the terms in order and enter T5.',
      answer: '72',
      hints: [
        'Start with the term that depends only on known values. T1 uses only K5 (121), so compute T1 first. Then T2 depends only on T1. T3 needs both K4\'s last two digits (74) and T2. T4 depends on T3. T5 combines T2 and T4.',
        'T1 = 121 − 100 = 21. T2 = 21 + 9 = 30. T3 = 74 − 30 − 5 = 39. T4 = 39 + 3 = 42.',
        'T5 = T2 + T4 = 30 + 42 = 72. Enter 72.'
      ],
      children: ['lc-governor-node', 'lc-nav-val']
    },
    {
      id: 'lc-governor-node',
      locationId: 'lantern-chamber',
      parentId: 'lc-nav-puzzle',
      type: 'item',
      label: 'Governor Bypass',
      narrative: 'The compartment beneath the worksheet clicks open. Inside is a heavy brass valve handle stamped: "GOVERNOR BYPASS — EMERGENCY OVERRIDE." This component disables the light mechanism\'s speed governor, allowing the override panel to take control.',
      rewardItem: 'lc-governor-bypass',
      children: []
    },
    {
      id: 'lc-nav-val',
      locationId: 'lantern-chamber',
      parentId: 'lc-nav-puzzle',
      type: 'dialogue',
      label: 'Navigation Register',
      narrative: 'The worksheet\'s header updates: "Navigation Value T5 = 72 — Verified."\n\nA note in Marsh\'s hand: "T5 feeds the light mechanism\'s additive constant. Everything connects. The roster, the authentication, the ledger, the tide, the instruments — they all point to the same truth. Follow the chain."\n\nMarsh\'s annotations are no longer notes to himself. They are directions to you.',
      children: []
    },

    // =========================================================
    // LANTERN CHAMBER — Puzzle C2: Light Mechanism (Reverse Pipeline)
    // =========================================================
    {
      id: 'lc-light-panel',
      locationId: 'lantern-chamber',
      parentId: null,
      type: 'dialogue',
      label: 'Light Mechanism Panel',
      narrative: 'The lens control panel is mounted on the mechanism\'s brass base. It describes a four-step process applied to the lens rotation speed. Marsh\'s annotations cover the original settings — he modified the process to encode his final piece of evidence.\n\nThe current output reading is displayed. Work backwards to recover the original input.\n\nA precision gear assembly is locked in a compartment marked "TIMING MECHANISM."',
      children: ['lc-light-puzzle']
    },
    {
      id: 'lc-light-puzzle',
      locationId: 'lantern-chamber',
      parentId: 'lc-light-panel',
      type: 'puzzle',
      label: 'Rotation Speed',
      narrative: 'The light mechanism applies four sequential transformations to the lens rotation speed. Reverse the process to find the original value.',
      question: 'The control panel describes the lens process:\n\n1. Multiply the input speed by 3.\n2. Add the Navigation Value (K6).\n3. Swap the tens digit and units digit of the result.\n4. Subtract 9.\n\nThe current output reading on the lens display is: 60\n\nWork backwards through each step and enter the original input speed.',
      answer: '8',
      hints: [
        'Invert the process step by step from the output backwards. Start at 60: undo step 4 (add 9). Then undo step 3 (swap digits again — swapping a two-digit number is its own inverse). Then undo step 2 (subtract K6=72). Then undo step 1 (divide by 3).',
        '60 + 9 = 69. The two-digit number whose digit-swap gives 69 is 96 (tens=9, units=6 → swap → 69). 96 − 72 = 24.',
        '24 ÷ 3 = 8. The original input speed was 8. Enter 8.'
      ],
      children: ['lc-timing-mech-node', 'lc-light-val']
    },
    {
      id: 'lc-timing-mech-node',
      locationId: 'lantern-chamber',
      parentId: 'lc-light-puzzle',
      type: 'item',
      label: 'Timing Mechanism',
      narrative: 'The compartment marked "TIMING MECHANISM" clicks open. Inside is a precision gear assembly stamped: "TIMING MECHANISM — EMERGENCY OVERRIDE." This component synchronises the override\'s transmission with the station\'s emergency broadcast frequency.',
      rewardItem: 'lc-timing-mech',
      children: []
    },
    {
      id: 'lc-light-val',
      locationId: 'lantern-chamber',
      parentId: 'lc-light-puzzle',
      type: 'dialogue',
      label: 'Speed Register',
      narrative: 'The control panel\'s register updates: "Original Rotation Speed = 8 — Verified."\n\nThe lens\'s timing mechanism, now understood, releases a faint mechanical hum. Marsh modified the operating parameters to encode the value 8 — the final piece of evidence, hidden in the light itself.\n\nA note in Marsh\'s hand: "The speed of the light is the last key. With the governor bypass and the timing mechanism, the override will activate. Everything you have learned is fuel for the final synthesis."',
      children: []
    },

    // =========================================================
    // LANTERN CHAMBER — Override Panel → META
    // =========================================================
    {
      id: 'lc-override',
      locationId: 'lantern-chamber',
      parentId: null,
      type: 'locked',
      label: 'Override Panel (Governor Slot)',
      lockedByItem: 'lc-governor-bypass',
      lockedNarrative: 'The emergency override panel is mounted beside the stairwell door. It has two component slots — one for the Governor Bypass and one for the Timing Mechanism. Both must be installed to activate the system.\n\nThe first slot is labelled "GOVERNOR BYPASS." It requires the bypass valve handle from the navigation worksheet.',
      narrative: 'You fit the Governor Bypass into the first slot. The panel hums to life — half its indicators glow green. The second slot is still dark.',
      children: ['lc-override2']
    },
    {
      id: 'lc-override2',
      locationId: 'lantern-chamber',
      parentId: 'lc-override',
      type: 'locked',
      label: 'Override Panel (Timing Slot)',
      lockedByItem: 'lc-timing-mech',
      lockedNarrative: 'The second slot is labelled "TIMING MECHANISM." It requires the precision gear assembly from the light mechanism panel.',
      narrative: 'You install the Timing Mechanism into the second slot. The panel fully activates — every indicator glows green. A screen flickers to life:\n\n"EMERGENCY OVERRIDE PROTOCOL — STATION-WIDE SYNTHESIS REQUIRED. PRESENT VERIFIED CREDENTIALS FROM ALL OPERATIONAL STATIONS."\n\nThe terminal displays a prompt. This is it — the final test.',
      children: ['lc-meta-puzzle']
    },
    {
      id: 'lc-meta-puzzle',
      locationId: 'lantern-chamber',
      parentId: 'lc-override2',
      type: 'puzzle',
      label: 'Override Synthesis',
      isMeta: true,
      narrative: 'The override terminal glows with green text. It has mapped each of the five watch stations to a value you discovered across the station. It demands the final synthesis — a combination of every lesson Marsh encoded into these walls.',
      question: 'The terminal displays:\n\nSTATION-VALUE MAPPING:\nStation 1 → Cargo Tonnage (22)\nStation 2 → Consensus Reading (121)\nStation 3 → Navigation Value (72)\nStation 4 → Light Speed (8)\nStation 5 → Tide Offset (first two digits of the Tide Sequence: 02)\n\nINSTRUCTION:\n"Process the five values in the Duty Roster priority order. For each value, apply the Vessel Authentication Rule as a live test. If the value PASSES, ADD it to the running total. If it FAILS, SUBTRACT it. The final total is the override code."\n\nInitialize running total: 0.\n\nEnter the override code.',
      answer: '77',
      hints: [
        'Gather all seven discoveries: K1 (priority order: 3,1,2,4,5), K2 (rule: digit sum divisible by 4), K3=22, K4=027874 (first two digits→2), K5=121, K6=72, K7=8. The mapping reveals: U1=22, U2=121, U3=72, U4=8, U5=2. Process in K1 order: 72, 22, 121, 8, 2.',
        'Apply K2 to each: 72 (digit sum 9 → fails, subtract), 22 (digit sum 4 → passes, add), 121 (digit sum 4 → passes, add), 8 (digit sum 8 → passes, add), 2 (digit sum 2 → fails, subtract). Running total: 0 − 72 = −72; −72 + 22 = −50; −50 + 121 = 71; 71 + 8 = 79; 79 − 2 = 77.',
        'The override code is 77. Enter 77.'
      ],
      children: ['lc-victory']
    },
    {
      id: 'lc-victory',
      locationId: 'lantern-chamber',
      parentId: 'lc-meta-puzzle',
      type: 'dialogue',
      label: 'The Light That Remains',
      narrative: 'The terminal screen flares white.\n\nOVERRIDE CODE ACCEPTED.\nEVIDENCE TRANSMITTING — EMERGENCY BROADCAST FREQUENCY.\nLOCKDOWN RELEASED.\n\nA deep groan echoes through the tower as the iron storm shutters withdraw. The stairwell door opens downward. The station\'s emergency transmitter hums, broadcasting Marsh\'s evidence to the mainland — every shipping record, every anomalous reading, every ledger entry. Voss & Harrow\'s insurance fraud, encoded across every system in the station, now speaks in the clear.\n\nYou descend through the Watch Room — past the cot where Marsh slept, past the coffee rings and the corkboard note, past the telescope still aimed at the Voss & Harrow vessel — and through the Signal House, past the cold coffee and Ada\'s photograph and the unsent telegram.\n\nThe supply boat waits in the lee of the island. You board as the storm closes in.\n\nBehind you, the light keeps turning.\n\nElias Marsh was a lighthouse keeper for fifteen years. He understood that the most important truths are not spoken — they are shown, steadily, in the dark, to anyone willing to look.\n\nYou were willing.',
      children: []
    }
  ]
};

export default data;
