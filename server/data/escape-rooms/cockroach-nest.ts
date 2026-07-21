import type { EscapeRoomData } from '../../../src/types/shared.js';

const data: EscapeRoomData = {
  id: 'cockroach-nest',
  name: 'The Cockroach Nest',
  description: 'An apartment completely overrun by a massive cockroach infestation. Solve the puzzles set by the swarm to find your way out.',
  difficulty: 'very-easy',
  intro: 'Your eyes slowly open to chaos. Hundreds of cockroaches scatter as you sit up, their tiny feet tapping against every surface. The once ordinary apartment is now their domain. Boards cover the windows, and the main door is barricaded with layers of a sticky, amber-like substance. A trail of larger roaches seems to beckon you further in, as if testing you.',
  locations: [
    {
      id: 'kitchen',
      name: 'The Kitchen',
      description: 'A filthy kitchen with overflowing trash, sticky counters, and cabinets hanging off their hinges. Cockroaches scurry in and out of every crack.',
    },
    {
      id: 'livingroom',
      name: 'The Living Room',
      description: 'A cluttered living space with a sagging couch, a broken TV, and piles of old newspapers. Roaches have claimed the remote control as their throne.',
    },
    {
      id: 'bedroom',
      name: 'The Bedroom',
      description: 'A dark bedroom with a lumpy mattress and closets full of clothes. The queen\'s lair, where the largest cluster of roaches gathers.',
    },
  ],
  puzzles: [
    {
      id: 'kitchen-1',
      locationId: 'kitchen',
      narrative: 'You make your way to the kitchen. The counters are alive with activity. Clusters of roach droppings form distinct groups on the countertop.',
      question: 'Five clusters trail toward a cabinet keypad: one of 3 specks, one of 1, one of 4, one of 1, and one of 5. It doesn\u2019t seem to want them separately.',
      answer: '14',
      hints: [
        'The droppings are clustered in groups. Maybe the cabinet lock cares how many there are altogether.',
        'Count the specks in each cluster, then add them all together.',
        '3 + 1 + 4 + 1 + 5 = 14. Enter 14.',
      ],
    },
    {
      id: 'kitchen-2',
      locationId: 'kitchen',
      narrative: 'Opening the cabinet reveals old food containers, some with labels partially eaten away.',
      question: 'The labels read: APPLES, BREAD, MILK, EGGS, CHEESE. One letter appears again and again in these words \u2014 the drawer lock beneath them has been worn down by it.',
      answer: '6',
      hints: [
        'Some letters show up more often than others in these food labels. Take a closer look.',
        'Tally every occurrence of the letter E across all five words.',
        'Apples (1) + Bread (1) + Milk (0) + Eggs (1) + Cheese (3) = 6. Enter 6.',
      ],
    },
    {
      id: 'kitchen-3',
      locationId: 'kitchen',
      narrative: 'A line of roaches marches across the floor in a clear pattern toward the living room.',
      question: 'Groups of roaches move toward the living room door: 2, then 4, then 6, then 8\u2026 The lock expects the next group\u2019s size.',
      answer: '10',
      hints: [
        'Look at how each group size compares to the one before it. Is there a rhythm?',
        'Each group is 2 roaches larger than the previous one.',
        '2, 4, 6, 8, then 10. Enter 10.',
      ],
    },
    {
      id: 'livingroom-1',
      locationId: 'livingroom',
      narrative: 'The living room is filled with old magazines and newspapers, many chewed through by the pests.',
      question: 'Roach trails circle three numbers on a magazine page: 5, 3, 2. A dusty calculator beside them has a single key worn smooth by tiny feet.',
      answer: '30',
      hints: [
        'Three numbers are calling for your attention. What do they make when combined?',
        'Multiply the three highlighted numbers together to get the side table combination.',
        '5 \u00d7 3 \u00d7 2 = 30. Enter 30.',
      ],
    },
    {
      id: 'livingroom-2',
      locationId: 'livingroom',
      narrative: 'A note on the couch describes the roach population growth.',
      question: 'A torn scrap on the cushion reads: "Started with 12. Doubled once. Doubled again. Then 6 more joined." A blank space at the bottom waits to be filled.',
      answer: '54',
      hints: [
        'The roaches multiplied, then more showed up. Take it one step at a time.',
        'Start with 12, double it, double that result, then add the 6 newcomers.',
        '12 \u2192 24 \u2192 48 \u2192 54. Enter 54.',
      ],
    },
    {
      id: 'livingroom-3',
      locationId: 'livingroom',
      narrative: 'A children\'s book on the coffee table lies open to a page about bugs. Most of the text is chewed away, but a riddle remains legible beside a sketch of the apartment.',
      question: '"I scurry and scatter when you turn on the light.\nI hide in the cracks and I come out at night.\nCount all my legs \u2014 it\u2019s not hard to do.\nSpeak the number, and I\u2019ll scurry from you."\n\nThe closet lock flashes, awaiting a response.',
      answer: '6',
      hints: [
        'What bug has been everywhere in this apartment? How many legs do most bugs like that have?',
        'A cockroach is an insect, and all insects have six legs.',
        'The answer is 6. Enter 6.',
      ],
    },
    {
      id: 'bedroom-1',
      locationId: 'bedroom',
      narrative: 'In the bedroom, the mattress is covered with roach formations. A looping cluster traces a figure-eight, a tight knot forms a triangle, and a crooked column shapes the letter L.',
      question: 'A figure-eight, a triangle, an L. Each formation hides a number. The nightstand lock wants them as one.',
      answer: '18',
      hints: [
        'What numbers do the shapes remind you of? A figure-eight, a triangle, and an L.',
        'A figure-eight is 8, a triangle has 3 sides, and an L looks like a 7. Add them up.',
        '8 + 3 + 7 = 18. Enter 18.',
      ],
    },
    {
      id: 'bedroom-2',
      locationId: 'bedroom',
      narrative: 'The queen roach sits atop a final keypad. A message etched nearby references your previous discoveries.',
      question: 'Four lines are scratched into the keypad\u2019s base:\n\n"The droppings\u2019 final shape.\nThe label letter that returned most.\nThe swarm\u2019s ending number.\nThe shapes upon the bed, together as one."\n\nThe queen awaits four digits.',
      answer: '4648',
      hints: [
        'The queen is testing your memory. Each discovery you made in this room holds a clue.',
        'Take the last digit from the droppings total (14), the E-count (6), the final roach population (54), and the mattress formations (18).',
        'Droppings = 14 (4), E-count = 6, Population = 54 (4), Formations = 18 (8). Combine: 4648.',
      ],
    },
  ],
};

export default data;
