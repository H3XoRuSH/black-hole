import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'the-bloodline',
  name: 'The Bloodline',
  description: 'You wake sealed inside a coffin in the crypt of an ancient vampire\'s keep. Three locked chambers stand between you and the dawn — each guarded by the castle\'s long memory.',
  difficulty: 'easy',
  intro: 'Cold. Dark. The smell of soil and candle wax.\n\nYour fingers find splinters — wood above you, wood below. A muffled thudding pulls you back to awareness: your own heartbeat, too loud, too close.\n\nYou push. The lid groans and gives, crashing aside into dust-choked air. You are in a crypt. You do not know how you got here. Your memory holds only a road, a storm, and a castle rising black against the lightning — and then nothing.\n\nPhosphorescent blue flames shiver in iron sconces along the stone walls. A great door at the top of a narrow stair stands sealed with layered locks. Below it, chalked in archaic lettering, a single line:\n\n"Only the knowing may pass."\n\nSomewhere above, in the dark, something stirs.',
  locations: [
    {
      id: 'the-crypt',
      name: 'The Crypt',
      description: 'A vaulted stone chamber smelling of wet earth and melted wax. Your overturned coffin rests in the centre — its lid split open, a tarnished silver mirror set into the inner face. Three other coffins stand sealed along the far wall; one bears a corroded bronze plaque reading ALDRIC with Roman numeral dates. On a stone altar in the alcove, a small music box stands open, its mechanism winding slowly down.',
    },
    {
      id: 'the-library',
      name: 'The Dark Library',
      description: 'Shelves of leather-bound volumes rise from floor to ceiling. Candles guttered to stubs throw unsteady orange light. A carved stone cipher-table is mounted on the far wall, its surface scored into a lettered grid. Bolted to the floor below it, four ornate candle holders each bear a small number scratched into the base. On the opposite wall, five oil portraits of vampire elders hang in gilded frames; the century of each elder\'s death is inscribed in the lower corner. A reading desk sits near the east wall, four heavy tomes left open on its surface, each with a ribbon marking a page.',
    },
    {
      id: 'the-throne-room',
      name: 'The Throne Room',
      description: 'A cavernous hall of black marble. A throne of carved bone sits on a raised dais at the far end. Above it, chiselled directly into the stone, is the Dracula family genealogy — five names branching outward from a single ancestor at the crown. A wax-sealed scroll rests on the throne\'s armrest. Beyond the throne, the exit gate stands sealed, its lock glowing a faint and patient red.',
    },
  ],
  puzzles: [
    {
      id: 'crypt-1',
      locationId: 'the-crypt',
      narrative: 'You sit up and brush the splinters from your coat. Scratched into the inside face of the coffin lid — beside the tarnished mirror — is a crude sequence of angular letters: E T A G. They face you squarely, as though waiting to be read. Something about them is wrong.',
      question: 'The tarnished mirror set into the lid catches the inscription from the opposite angle.\n\nThe sealed door at the top of the stair demands a word.',
      answer: 'gate',
      hints: [
        'The mirror in the coffin lid is not decorative.',
        'Hold the carved inscription up to the mirror and read it as the reflection shows it.',
        'E-T-A-G read in a mirror becomes G-A-T-E. The word is gate.',
      ],
    },
    {
      id: 'crypt-2',
      locationId: 'the-crypt',
      narrative: 'One sealed coffin along the far wall bears a corroded bronze plaque:\n\nCOUNT ALDRIC\nMDCCCXXXIII — MDCCCLXXXIX\n\nBeneath the dates, a single sentence has been scratched into the bronze:\n\n*What lasts longer than the blood?*\n\nThe iron grating between the crypt and the stair is padlocked. Embossed on the lock\'s face is a single word: ETERNAL.',
      question: 'The lock has four letter slots. What did the count believe outlasts even the bloodline?',
      answer: 'dust',
      hints: [
        'The epitaph asks about permanence — what outlasts ancient blood?',
        'Everything mortal returns to the same fine state. The answer is the final word of the epitaph\'s reply.',
        'What lasts longer than blood? Dust — what even vampires become in the end.',
      ],
    },
    {
      id: 'crypt-3',
      locationId: 'the-crypt',
      narrative: 'The music box on the stone altar begins to play on its own. Four clear, unhurried notes ring out across the cold air — each separate, each deliberate. A tarnished brass plaque on the lid reads: *The notes speak what this castle is.*\n\nThe mechanism loops once, then falls silent.\n\nThrough a cracked glass panel in the side, you can see the brass comb inside. Each tooth is etched with a tiny letter — C, D, E, F, G, A, B — running from left to right. The pins on the cylinder strike the teeth in sequence, and you can watch which lettered tooth trembles with each note.',
      question: 'Each note has a name. The music box has already spoken.\n\nThe altar drawer\'s lock waits for a single word.',
      answer: 'dead',
      hints: [
        'Musical notes carry letter names — D, E, F, G, A, B, C. The comb inside is labelled so you can see which tooth rings.',
        'Watch the labelled comb as it plays. Note the letter struck by each pin, in order.',
        'The four notes strike D, E, A, D in sequence. Together they spell: dead.',
      ],
      sound: {
        type: 'melody',
        notes: [
          { pitch: 'D4', dur: 450, rest: false },
          { pitch: 'D4', dur: 220, rest: true },
          { pitch: 'E4', dur: 450, rest: false },
          { pitch: 'E4', dur: 220, rest: true },
          { pitch: 'A4', dur: 450, rest: false },
          { pitch: 'A4', dur: 220, rest: true },
          { pitch: 'D4', dur: 450, rest: false },
          { pitch: 'D4', dur: 300, rest: true },
        ],
      },
    },
    {
      id: 'library-1',
      locationId: 'the-library',
      narrative: 'The carved stone cipher-table on the far wall is scored with a precise grid of letters. Below it, four ornate candle holders are bolted to the floor at careful intervals. Each base bears a scratched pair of numbers — not coordinates you recognise, but deliberate. The first digit, the second digit — they speak a language of position.',
      question: '     | 1 | 2 | 3 | 4 | 5 |\n  A  | V | A | M | P | X |\n  B  | F | L | N | D | R |\n  C  | K | I | E | G | S |\n  D  | T | O | W | H | U |\n  E  | C | Y | Q | Z | J |\n\nCandle 1 ──> 21\nCandle 2 ──> 12\nCandle 3 ──> 23\nCandle 4 ──> 34\n\nThe iron-banded chest in the corner waits for a four-letter word.',
      answer: 'fang',
      hints: [
        'Two digits scratch each base — the first names the row, the second the column. The grid waits to be read.',
        'Each candle\'s pair of numbers describes a single cell on the cipher-table above. Left to right, read what sits at each crossing.',
        '21 = row 2, col 1 = F. 12 = row 1, col 2 = A. 23 = row 2, col 3 = N. 34 = row 3, col 4 = G. The word is fang.',
      ],
    },
    {
      id: 'library-2',
      locationId: 'the-library',
      narrative: 'Five oil portraits of vampire elders hang on the west wall. The century of each one\'s final death is inscribed in the lower corner of their gilded frame:\n\n• Yara . . . XV\n• Talitha . . . XIII\n• Radu . . . XVI\n• Countess Vera . . . XVII\n• Polidor . . . XIV\n\nThey are not arranged by age. A velvet placard beneath the portraits reads: "The seal answers to their names — youngest first to oldest last."',
      question: 'Five elders wait to be named. Let the first letter of each speak for itself, youngest first.\n\nThe portrait cabinet\'s word-lock waits for five letters.',
      answer: 'crypt',
      hints: [
        'The Roman numeral century tells you how recently each elder died. A higher number means a more recent death — ignore the hanging order.',
        'Re-order the five vampires from the highest century to the lowest, then read the first letter of each name.',
        'Youngest to oldest: Countess Vera (XVII), Radu (XVI), Yara (XV), Polidor (XIV), Talitha (XIII). Their initials: C, R, Y, P, T.',
      ],
    },
    {
      id: 'library-3',
      locationId: 'the-library',
      narrative: 'On the reading desk, four heavy tomes lie open, their spines cracked. Each has a silk ribbon marking a different page. The pages are numbered in the old style — Roman numerals — as though the castle refuses to count in any language but its own.',
      question: 'Book I: ribbon at page III\nBook II: ribbon at page I\nBook III: ribbon at page IV\nBook IV: ribbon at page II\n\nRead the page numbers as the books sit on the desk, left to right.\n\nThe four-digit lock beside the desk waits.',
      answer: '3142',
      hints: [
        'The books rest in order on the desk. Each ribbon marks a page in Roman numerals — convert them to ordinary digits.',
        'Read the page number from each book left to right, then place the digits side by side.',
        'III = 3, I = 1, IV = 4, II = 2. The code is 3142.',
      ],
    },
    {
      id: 'throne-1',
      locationId: 'the-throne-room',
      narrative: 'Above the bone throne, the family genealogy is chiselled directly into the black marble — five names branching from a single ancestor. A stone inscription beneath reads: "Root to branch — left before right." The names have stood here for centuries. Something in them has been waiting to be spoken.',
      question: 'The inscription reads: \'Root to branch — left before right.\'\n\n|           BATHOR\n|          /      \\\n|       LEENA    OTTO\n|         |        |\n|       OLAF  DRAHOMIRA\n\nThe throne\'s outer seal expects a single word.',
      answer: 'blood',
      hints: [
        'Dracula\'s bloodline runs from the apex of the tree to its outermost branches. Perhaps each ancestor holds a single letter.',
        'Take the first letter of each ancestor\'s name, moving generation by generation — root first, left branch before right at each level.',
        'In order: Bathor (B), Leena (L), Otto (O), Olaf (O), Drahomira (D). The five letters spell: blood.',
      ],
    },
    {
      id: 'throne-2',
      locationId: 'the-throne-room',
      narrative: 'The exit gate\'s final lock is a four-digit seal. You crack open the wax-sealed scroll from the throne\'s armrest. Inside, in a neat archaic hand, four questions are posed — each one reaching back to something you have already found.',
      question: '"Four truths seal the final door.\n\nHow many letters freed you from your stone-sealed sleep?\nHow many letters name the hidden word the portraits guard?\nHow many pages does the second book on the reading desk mark?\nHow many letters cry aloud in the music box\'s song?\n\nRead them as one."\n\nThe exit gate\'s lock awaits four digits.',
      answer: '4514',
      hints: [
        'Each question points to a specific answer you found earlier. Revisit what the crypt, the library, and the music box revealed.',
        'Gate has 4 letters. The portrait word has 5 letters. Book II marks page I. Dead has 4 letters.',
        'The four digits are 4 (gate), 5 (crypt), 1 (book II), 4 (dead). The code is 4514.',
      ],
    },
  ],
};

export default data;
