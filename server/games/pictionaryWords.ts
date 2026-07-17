export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WORDS = [
  'cat', 'dog', 'house', 'tree', 'sun', 'moon', 'star', 'fish', 'bird', 'book',
  'apple', 'banana', 'guitar', 'piano', 'castle', 'bridge', 'train', 'plane', 'ship', 'cake',
  'mountain', 'river', 'ocean', 'forest', 'desert', 'flower', 'garden', 'cloud', 'rain', 'snow',
  'pizza', 'burger', 'cookie', 'candy', 'coffee', 'pencil', 'paint', 'camera', 'watch', 'money',
  'spider', 'snake', 'eagle', 'whale', 'tiger', 'bear', 'wolf', 'fox', 'owl', 'bat',
  'sword', 'shield', 'crown', 'ring', 'key', 'door', 'window', 'chair', 'table', 'lamp',
  'rocket', 'robot', 'alien', 'ghost', 'witch', 'dragon', 'knight', 'pirate', 'ninja', 'wizard',
  'violin', 'drum', 'flute', 'bell', 'whistle', 'balloon', 'kite', 'bubble', 'ribbon', 'arrow',
  'island', 'cave', 'volcano', 'waterfall', 'lighthouse', 'tent', 'fence', 'tower', 'wall', 'stair',
  'wagon', 'sled', 'canoe', 'raft', 'wings', 'feather', 'shell', 'web', 'nest', 'hive',

  // Medium
  'skateboard', 'surfing', 'parachute', 'microscope', 'ladder', 'anchor',
  'sailboat', 'helicopter', 'submarine', 'tractor', 'rollercoaster', 'carousel', 'traffic',
  'escalator', 'satellite', 'scarecrow', 'skeleton', 'vampire', 'zombie', 'mermaid',
  'unicorn', 'pegasus', 'centaur', 'griffin', 'phoenix', 'penguin', 'giraffe', 'elephant',
  'kangaroo', 'panda', 'octopus', 'dolphin', 'butterfly', 'dragonfly', 'fireworks',
  'rainbow', 'lightning', 'glacier', 'oasis', 'canyon', 'jungle',
  'pyramid', 'temple', 'greenhouse', 'skyscraper', 'igloo',
  'tepee', 'pagoda', 'factory', 'library', 'hospital', 'airport', 'bakery', 'circus',
  'treasure', 'diamond', 'emerald', 'ruby', 'crystal', 'lantern', 'torch', 'candle',
  'hourglass', 'thermometer', 'calendar', 'clock', 'binoculars', 'magnifying',
  'saddle', 'tunnel', 'railroad', 'ferris', 'cannon', 'cannonball', 'dumbbell',
  'trophy', 'medal', 'throne', 'curtain', 'puppet',
  'marathon', 'sprint', 'archery', 'fencing', 'boxing', 'wrestling', 'golf', 'bowling',
  'hurdle', 'javelin', 'discus', 'podcast', 'saxophone', 'trumpet', 'accordion',
  'banjo', 'harp', 'xylophone', 'megaphone', 'microphone', 'stereo', 'record', 'canvas',
  'sculptor', 'pottery', 'origami', 'stained', 'mosaic', 'collage', 'graffiti', 'tattoo',

  // Hard
  'astronaut', 'labyrinth', 'silhouette', 'caricature', 'camouflage',
  'kaleidoscope', 'marionette', 'scavenger', 'catapult', 'trebuchet', 'pendulum',
  'equator', 'horizon', 'constellation', 'stethoscope', 'barometer',
  'colosseum', 'parthenon', 'sphinx', 'obelisk',
  'lumberjack', 'blacksmith', 'juggernaut', 'mannequin', 'chandelier', 'carriage',
  'zeppelin', 'gondola', 'kayak', 'catamaran', 'trampoline', 'hammock',
  'synchronize', 'celebrate', 'vacation', 'expedition', 'adventure', 'festival',
  'parade', 'carnival', 'masquerade', 'pilgrim', 'viking', 'samurai', 'gladiator',
  'cowboy', 'detective', 'pharaoh',
  'chess', 'dominoes', 'dice', 'roulette', 'target', 'maze', 'puzzle', 'riddle',
  'tightrope', 'trapeze', 'acrobat', 'juggler', 'unicycle', 'stilt',
  'earthquake', 'avalanche', 'hurricane', 'monsoon', 'blizzard',
  'iceberg', 'fjord', 'geyser', 'coral', 'lagoon', 'bayou', 'tundra', 'savanna',
  'cathedral', 'monastery', 'vineyard', 'plantation', 'ranch',
  'orchestra', 'conductor', 'soprano', 'ballerina', 'pantomime',
  'typhoon', 'cyclone', 'whirlpool', 'mirage', 'eclipse',
  'centipede', 'chameleon', 'flamingo', 'peacock', 'woodpecker', 'hummingbird',
  'snowflake', 'icicle', 'stalactite', 'stalagmite', 'fossil', 'dinosaur',
  'crosswalk', 'roundabout', 'billboard', 'lamppost', 'mailbox',
  'goalpost', 'scoreboard', 'bleachers', 'concession', 'scorecard',

  // Compound words
  'hot dog', 'ice cream', 'popcorn', 'cupcake', 'milkshake', 'bubble gum',
  'cotton candy', 'peanut butter', 'jelly bean', 'maple syrup',
  'super hero', 'time machine', 'spaceship', 'treasure map', 'magic wand',
  'flying saucer', 'rubber duck', 'teddy bear', 'rag doll', 'yoyo',
  'jump rope', 'roller skates', 'rocking horse', 'pinwheel', 'snow globe',
  'sand castle', 'tree house', 'birdhouse', 'dog house', 'greenhouse',
  'fire truck', 'police car', 'school bus', 'race car', 'garbage truck',
  'food truck', 'tow truck', 'mail truck', 'ice skates', 'ski boots',
  'rain coat', 'swim suit', 'under wear', 'sun glasses', 'high heels',
  'birthday cake', 'wedding cake', 'pumpkin pie', 'apple pie', 'lemonade',
  'rocket ship', 'pirate ship', 'sail boat', 'motor boat', 'canoe paddle',
  'fishing rod', 'butterfly net', 'kite string', 'party hat', 'gift box',
  'candy cane', 'gingerbread', 'snow man', 'sleigh ride', 'stocking',
  'rainbow', 'pot of gold', 'magic carpet', 'flying carpet', 'genie lamp',
  'cow boy', 'horse shoe', 'farm house', 'barn yard', 'hay bale',
  'stop sign', 'street light', 'traffic light', 'park bench', 'water fountain',
  'fire place', 'book shelf', 'night stand', 'coffee table', 'door knob',
  'wind chime', 'door bell', 'light bulb', 'soap bubble', 'tea pot',
  'honey bee', 'lady bug', 'caterpillar', 'dragon fly', 'jelly fish',
  'star fish', 'sea horse', 'puffer fish', 'clown fish', 'blue whale',
  'polar bear', 'panda bear', 'grizzly bear', 'sea lion', 'tiger shark',
  'basket ball', 'base ball', 'foot ball', 'snow board', 'surf board',
  'volley ball', 'hockey puck', 'tennis racket', 'golf club', 'bowling ball',
  'high five', 'hand shake', 'jump shot', 'home run', 'touch down',
  'tug boat', 'bull dozer', 'fork lift', 'steam roller', 'dump truck',
  'space shuttle', 'hot air balloon', 'hang glider', 'bumper car', 'go kart',
  'pin cushion', 'button', 'zipper', 'safety pin', 'clothes pin',
  'rolling pin', 'can opener', 'nut cracker', 'cork screw', 'egg timer',
  'alarm clock', 'hour glass', 'sundial', 'stop watch', 'weather vane',
  'wind sock', 'flag pole', 'may pole', 'totem pole', 'telephone pole',
];

export function pickWords(count: number, usedWords: string[]): string[] {
  const available = WORDS.filter((w) => !usedWords.includes(w));
  const pool = available.length >= count ? available : WORDS;
  return shuffleArray(pool).slice(0, count);
}
