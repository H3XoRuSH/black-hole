import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'house-that-draws-itself',
  name: 'The House That Draws Itself',
  description: 'A house assembled from floor plans rather than rooms. Its corridors fold around absent courtyards, and every door opens onto another impossible threshold. Somewhere in its architecture, the missing outside has been hidden as a name.',
  difficulty: 'extreme',
  intro: 'You wake with your cheek against wallpaper that is warm as skin. Someone has drawn a floor plan across the ceiling in pencil, but the route begins beneath your own name, which you do not remember writing. A toy house rests on your chest, its tiny front door opening and closing with your breathing. Through its windows you see a corridor that cannot fit inside the room around you.\n\nA muffled child counts from somewhere beyond the walls. On "four," the house changes shape: the ceiling becomes a stair, the stair becomes a wall, and a photograph falls face-down beside your hand. On its back, in a different handwriting, are six words:\n\nDO NOT LOOK FOR THE EXIT.\nLOOK FOR THE ROOM THAT HAS NO OUTSIDE.\n\nThe child begins counting again. You stand before a door painted with a room number that is also your birth date, though you have never seen it before.',
  locations: [
    {
      id: 'borrowed-entrance',
      name: 'The Borrowed Entrance',
      description: 'A narrow vestibule dressed as several different homes at once. Wallpaper changes pattern at every seam. Three windows are stacked vertically in the far wall, though there is no exterior beyond the glass. A brass grille, a carpenter\'s threshold ledger, and a burned floor plan wait beneath them.',
    },
    {
      id: 'backstairs',
      name: 'The Rooms Behind the Rooms',
      description: 'The entrance opens into a hallway whose doors are flush with the wallpaper and whose doorknobs are on the wrong sides. A strip of room-words runs along the skirting board. Farther in, an abandoned nursery shares a wall with a pantry that has no shelves, only five inventories written in a child\'s careful hand.',
    },
    {
      id: 'between-floors',
      name: 'The Floor Between Floors',
      description: 'There is no ceiling here. Landings hang above and below one another like pages in a dropped book, connected by a lift cage that moves when nobody touches it. A survey grid is pinned between two staircases, and a cross-section of nested rooms has been carved into the lift\'s inner panel.',
    },
    {
      id: 'heart-room',
      name: 'The Room That Copies You',
      description: 'The last landing opens into a square room with four identical doors and walls polished to a dull mirror. A brass shutter covers a letter tile in the floor. Beyond it, four plaques argue in different handwriting. The center of the room is empty except for a final plan with six blank rooms.',
    },
  ],
  puzzles: [
    {
      id: 'borrowed-entrance-1',
      locationId: 'borrowed-entrance',
      narrative: 'A grille hangs at eye level, but no wind comes through it. Beyond its bars are three painted windows: a low basement window with a lamp, a middle ground-floor window with a key, and a high attic window with a bell. The windows are all the house left at different heights. A small chime begins to speak.',
      question: 'A brass plate is blank except for three word slots. Above it, the little floor plan shows:\n\n+---------+\n| ATTIC   |\n|   BELL  |\n+---------+\n| GROUND  |\n|   KEY   |\n+---------+\n| BASEMENT|\n|   LAMP  |\n+---------+\n\nThe lock waits for the names in the tones\' order.',
      answer: 'bellkeylamp',
      hints: [
        'The tones are high, medium, and low. The three windows place the bell highest, the key in the middle, and the lamp lowest.',
        'Read the objects in that order: BELL, then KEY, then LAMP. The word is BELLKEYLAMP.',
      ],
      sound: {
        type: 'pitch-sequence',
        notes: [
          { pitch: 'high', dur: 400, rest: false },
          { pitch: 'high', dur: 180, rest: true },
          { pitch: 'medium', dur: 400, rest: false },
          { pitch: 'medium', dur: 180, rest: true },
          { pitch: 'low', dur: 400, rest: false },
        ],
      },
    },
    {
      id: 'borrowed-entrance-2',
      locationId: 'borrowed-entrance',
      narrative: 'The chime releases a narrow drawer in the skirting board. Inside are five threshold rubbings, each made from two words pressed against opposite sides of a doorframe. The carpenter who made them left no alphabet, only a sentence about things that can stand on both sides.',
      question: 'The rubbings read:\n\nSTAIRS / STONE\nFIREPLACE / EAVE\nVERANDA / ARCH\nROOM / MIRROR\nHALLS / STAIR\n\nA carpenter\'s note is folded beneath them: "The house keeps only what can stand on both sides of a threshold." A five-letter recess waits.',
      answer: 'seams',
      hints: [
        'In each pair, look where the first word meets the second. The last letter on the left is also the first letter on the right.',
        'The shared edge letters are S, E, A, M, and S. They spell SEAMS.',
      ],
    },
    {
      id: 'borrowed-entrance-3',
      locationId: 'borrowed-entrance',
      narrative: 'Behind the drawer, a plaster panel has been burned into a directional floor plan. Every doorway points one way. FIRE is the only room whose name is still warm to the touch, and the brass label beneath the panel has lost its final word.',
      question: 'The plan has been burned into the plaster:\n\n+------+     +------+     +------+\n| FIRE |---->| HALL |<----| WELL |\n+------+     +------+     +------+\n                 |\n                 v\n              +------+\n              | ROOT |\n              +------+\n                 |\n                 v\n              +------+\n              | BELL |\n              +------+\n\nA brass label says: "Begin at FIRE. The third doorway has a name." The plan\'s nameplate is empty.',
      answer: 'bell',
      hints: [
        'Follow only the arrows, starting at FIRE. The first doorway reaches HALL, the second reaches ROOT, and the third reaches BELL.',
        'The missing nameplate therefore reads BELL.',
      ],
    },
    {
      id: 'backstairs-1',
      locationId: 'backstairs',
      narrative: 'The word BELL opens a door that was painted to look like a wall. Behind it, room names run along the corridor in a procession. Each card overlaps the next at a two-letter hinge, as if the house refuses to let one room end before another begins.',
      question: 'The strip of wallpaper reads:\n\nFLOOR -> ORBIT -> ITCH -> CHIMNEY -> EYE -> [      ] -> OWLET\n\nThe missing card is the word the stairwell accepts.',
      answer: 'yellow',
      hints: [
        'The last two letters of each card become the first two letters of the next: OR, IT, CH, EY, and YE are already visible.',
        'EYE ends in YE, while OWLET begins in OW. The missing word must begin with YE and end with OW so both hinges meet. YELLOW fits.',
      ],
    },
    {
      id: 'backstairs-2',
      locationId: 'backstairs',
      narrative: 'A nursery lies at the end of the corridor, untouched except for a music box turning silently — its spring wound down years ago and never rewound. A child\'s copybook is open beside it. One line of verse remains, though three words have been scratched out so fiercely the paper is nearly torn through.',
      question: 'The surviving verse reads:\n\n"January whispers, October closes —\nbut year after year, the house remembers what the dark never knows."\n\nThe brass slot under the copybook waits for the word the poem describes.',
      answer: 'joy',
      hints: [
        'The poem hides its answer in the first letter of three key words: the first month (January), the tenth month (October), and the word that measures all months.',
        'J from January, O from October, and Y from Year. Together they spell JOY.',
      ],
    },
    {
      id: 'backstairs-3',
      locationId: 'backstairs',
      narrative: 'The music box opens the pantry wall. There are no shelves inside, only five inventories written in chalk. A child has arranged the lists so that every shelf contains four of the same five objects, then written a warning about refusal beneath them.',
      question: 'The pantry inventories read:\n\nShelf I:   hook, oil, slate, thread\nShelf II:  glass, oil, slate, thread\nShelf III: glass, hook, slate, thread\nShelf IV:  glass, hook, oil, thread\nShelf V:   glass, hook, oil, slate\n\nA child\'s label says: "What a shelf refuses is the word that counts." The nursery lock has five letters.',
      answer: 'ghost',
      hints: [
        'Compare each shelf with the full set of five objects. Shelf I lacks glass, Shelf II lacks hook, Shelf III lacks oil, Shelf IV lacks slate, and Shelf V lacks thread.',
        'Their initials are G, H, O, S, T. The lock wants GHOST.',
      ],
    },
    {
      id: 'between-floors-1',
      locationId: 'between-floors',
      narrative: 'The pantry floor drops away and leaves you on a landing between floors. A surveyor\'s grid is pinned to the railing. Its rows are named with letters and its columns with numbers; four fresh nail heads mark addresses where the house has measured itself.',
      question: 'The survey grid reads:\n\n+---+---+---+---+---+---+\n|   | 1 | 2 | 3 | 4 | 5 |\n+---+---+---+---+---+---+\n| A | W | A | L | L | S |\n| B | W | I | N | G | S |\n| C | N | U | R | S | E |\n| D | S | T | A | I | R |\n| E | F | L | O | O | R |\n+---+---+---+---+---+---+\n\nThe nail heads mark A1, D4, C1, and B4. A lift cage below them has four blank letter windows.',
      answer: 'wing',
      hints: [
        'Read the marked cells in the order written. A1 is W, D4 is I, C1 is N, and B4 is G.',
        'The four windows therefore read WING.',
      ],
    },
    {
      id: 'between-floors-2',
      locationId: 'between-floors',
      narrative: 'The lift cage descends through a floor that is not on the survey. Three brass windows appear in its wall. A sequence of knocks travels through the plaster in groups, with a long hush separating one landing from the next. The house counts footsteps but never counts silence.',
      question: 'A sentence scratched beneath the windows reads: "One landing, one number. Do not count the silence." The three windows remain dark while the knocking repeats. They are waiting for a three-part footprint.',
      answer: '213',
      hints: [
        'The knocks arrive in three groups: two knocks, then one knock, then three knocks. The long rests separate the groups.',
        'Write the group sizes in order. The footprint is 2-1-3, or 213.',
      ],
      sound: {
        type: 'rhythm',
        notes: [
          { pitch: 'C4', dur: 150, rest: false },
          { pitch: 'C4', dur: 140, rest: true },
          { pitch: 'C4', dur: 150, rest: false },
          { pitch: 'C4', dur: 700, rest: true },
          { pitch: 'C4', dur: 150, rest: false },
          { pitch: 'C4', dur: 700, rest: true },
          { pitch: 'C4', dur: 150, rest: false },
          { pitch: 'C4', dur: 140, rest: true },
          { pitch: 'C4', dur: 150, rest: false },
          { pitch: 'C4', dur: 140, rest: true },
          { pitch: 'C4', dur: 150, rest: false },
        ],
      },
    },
    {
      id: 'between-floors-3',
      locationId: 'between-floors',
      narrative: 'At the bottom of the lift shaft, the inner panel opens onto a cross-section of the house. The carpenter used different marks for each doorway, nesting one room inside another. A key tag hangs from the smallest enclosure.',
      question: 'The cross-section is carved into the lift panel:\n\n+ HOUSE\n|  [ HALL\n|  |  ( NURSERY\n|  |  |  { CELLAR }\n|  |  |  )\n|  |  ]\n|  +\n\nEach pair of matching marks is a doorway. The key is in the room with no other room inside its pair.',
      answer: 'cellar',
      hints: [
        'The brackets contain HALL, the parentheses contain NURSERY, and the braces contain CELLAR.',
        'CELLAR is the innermost room, so it is the room with no smaller doorway inside it.',
      ],
    },
    {
      id: 'heart-room-1',
      locationId: 'heart-room',
      narrative: 'The lift reaches the square room that copies you in its dull mirrors. A brass shutter covers a four-by-four letter tile. Its hinge bears a clockwise arrow, and four holes are cut into the shutter in an uneven little shape — dark circles punched through the metal.',
      question: 'In its unturned position, the shutter holes cover the cells marked with dark dots:\n\n● ● . .\n● ● . .\n. . . .\n. . . .\n\nThe letter tile beneath it reads:\n\n+---+---+---+---+\n| T | H | O | U |\n| E | H | S | E |\n| S | Y | W | A |\n| O | U | N | T |\n+---+---+---+---+\n\nA note inside the frame says: "Four positions. Read only what the shutter reveals." The brass lock has sixteen letter slots.',
      answer: 'thehousewantsyou',
      hints: [
        'The four clockwise positions reveal THEH, OUSE, WANT, and SYOU. Read the four visible cells after each turn.',
        'Joining the groups without spaces gives THEHOUSEWANTSYOU.',
      ],
    },
    {
      id: 'heart-room-2',
      locationId: 'heart-room',
      narrative: 'The shutter sentence makes all four doors unlatch at once. Their plaques are written in four different hands, but the same rule is carved above every handle: truth must have a shape, and the outside must share it.',
      question: 'The rule above the doors reads:\n\n"Exactly two plaques tell the truth, and the door to the outside bears one of those truths."\n\nASH:   "The outside is behind DUST or CEDAR."\nDUST:  "The outside is behind DUST, CEDAR, or BONE."\nCEDAR: "The outside is behind ASH."\nBONE:  "The outside is behind ASH or CEDAR."\n\nOnly one handle is unlatched. Its plaque names the way out.',
      answer: 'dust',
      hints: [
        'If the outside is behind ASH, the CEDAR and BONE plaques are true. If it is behind CEDAR, three plaques are true. If it is behind BONE, only the DUST plaque is true.',
        'With the outside behind DUST, the DUST and ASH plaques are true, while CEDAR and BONE are false. DUST is one of the two true plaques, so DUST is the unique answer.',
      ],
    },
    {
      id: 'heart-room-3',
      locationId: 'heart-room',
      narrative: 'The unlatched door does not open. Instead, the polished floor turns transparent and reveals the final floor plan: six rooms in a spine, each identified only by a memory of a lock you have already faced. Arrows point into blank recesses. The child behind the walls has stopped counting.',
      question: 'Six empty recesses bear these memories, in order: the three-height chime, the threshold pairs, the two-letter stair procession, the nursery music box, the nail-head survey, and the four-door oath. The caret marks the letter touched by each arrow:\n\n| CHIME      ^---------- |\n| THRESHOLD  -^---       |\n| STAIR      ^-----      |\n| MUSIC      -^-         |\n| SURVEY     --^-        |\n| OATH       ^---        |\n\nA final sentence is carved beneath the plan: "The touched letters are my name, and my name is what lies beyond."',
      answer: 'beyond',
      hints: [
        'The six memories point to BELLKEYLAMP, SEAMS, YELLOW, JOY, WING, and DUST, respectively. These are the exact answers from the earlier locks.',
        'The arrows touch the first, second, first, second, third, and first letters: B, E, Y, O, N, D. The house\'s final name is BEYOND.',
      ],
    },
  ],
};

export default data;
