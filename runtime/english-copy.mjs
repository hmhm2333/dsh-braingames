export const EN_SHARED = {
  appLabel: 'dsh-braingames',
  headerStart: 'Play a round',
  headerContinue: 'Continue',
  headerPlaying: 'Playing',
  invite: 'A task is running. Play a round?',
  inviteIdle: 'Take a break. Play a round?',
  inviteLabel: 'Training invitation',
  inviteAccept: 'Play',
  inviteDismiss: 'Not now',
  selecting: 'Picking a game',
  retry: 'Try again',
  discardSavedRound: 'Start a new round',
  next: 'Try another',
  reload: 'Reload',
  freezeHint: 'Click DeepSeek-chan to continue',
  moveHint: 'Hold DeepSeek-chan to drag',
  replay: 'Play again',
  roundLabel: 'Score',
  mouseLeft: 'Left mouse button',
  mouseRight: 'Right mouse button',
  chancesLeft: 'Chances left: {lives}.',
  bestLabel: 'Best',
  badRecord: 'A local record is damaged. Using the default.',
  storageUnavailable: 'Local storage is unavailable. You can still play. New best scores and positions will not be saved.',
  clearRecord: 'Clear damaged records',
  loadedError: 'Could not load the game',
  bootError: 'Could not start the game. Try again.',
  loading: 'Getting the game ready…',
  noGames: 'Select at least one game in the plugin settings.',
  viewportError: 'At least {width} × {height} is needed. Enlarge the window and try again.',
  openingGuide: 'Click the game icon in the task header to start or resume.'
};

export const EN_GAMES = {
  'rice-bubbles-g10': {
    title: 'Rice & Bubbles',
    shortTitle: 'Rice',
    invite: 'Hungry fish here. Catch a bite for me?',
    start: 'Dig in',
    loading: 'Fetching the rice bowl',
    resultUnit: 's',
    control: {space: 'Space'},
    rules: {catch: 'Catch', skip: 'Skip'},
    ruleNote: 'Press Space to catch food. Skip empty bubbles, food in bubbles, and food shown on the red card.',
    pickyHint: 'Red card: skip {food}.',
    feedback: {
      rice_caught: 'Caught the food.',
      bubble_mistake: 'Caught a bubble by mistake.',
      bubble_pass: 'Let the bubble pass.',
      rice_miss: 'Missed the food.',
      food_refused: 'Skipped the marked food.',
      food_mistake: 'Caught the marked food by mistake.',
      interrupted: 'Paused. This item does not count.',
      meal: 'Saved a rice ball.'
    }
  },
  'regulars-g04': {
    title: "DeepSeek-chan's Café",
    shortTitle: 'Café',
    invite: 'The regulars are here. Remember their orders?',
    start: 'Serve',
    loading: 'Wiping the tables',
    resultUnit: 'orders',
    resultUnitOne: 'order',
    scoreLabel: 'Correct orders',
    control: {left: 'Pick a dish'},
    rules: ['Note the order', 'Serve it again'],
    ruleAccess: "Remember each order. With no new order, serve the guest's last dish.",
    feedback: {
      timeout: 'Too late to serve.',
      correct: 'Right dish for {guest}.',
      wrong: 'Wrong dish for {guest}.',
      last: '{max} mistakes. The round ends after this order.'
    }
  },
  'planks-g02': {
    title: "Theseus's Boat",
    shortTitle: 'Boat',
    invite: 'The boat is leaking again. Lend a hand?',
    start: 'Patch the boat',
    loading: 'Looking for planks',
    resultUnit: 'planks',
    resultUnitOne: 'plank',
    control: {left: 'Pick a gap'},
    rules: ['Picture the turn', 'Match the gap'],
    feedback: {correct: 'Patched!', wrong: "The plank doesn't fit."}
  },
  'balloon-winds': {
    title: "DeepSeek-chan's Balloon",
    shortTitle: 'Balloon',
    invite: 'Perfect winds. Want to catch a star?',
    start: 'Take off',
    loading: 'Filling the balloon',
    resultUnit: 'stars',
    resultUnitOne: 'star',
    control: {left: "Left click adds the cloud's offset.", right: "Right click subtracts the cloud's offset."},
    ruleNote: 'Ride the clouds to the star.',
    feedback: {
      controls: 'Left click adds the offset. Right click subtracts.',
      edge: 'Out of bounds',
      cold: "Time's up",
      spent: 'Out of wind',
      timeout: "Time's up. Lose a heart.",
      empty: 'Out of wind. Lose a heart.',
      add: "Added this cloud's offset.",
      subtract: "Subtracted this cloud's offset.",
      moved: 'Moved to {point}. New clouds are ready.',
      needsWind: 'Use clouds to reach the star.',
      unreachable: "The remaining clouds can't reach the star.",
      star: 'Got the star at {point}.',
      landed: 'Landed at {point}.'
    }
  },
  'fish-leap': {
    title: 'Catch Claude-chan!',
    shortTitle: 'Claude-chan',
    invite: 'Can you catch Claude-chan before she transforms?',
    start: 'Go fishing',
    loading: 'Getting the net ready',
    resultUnit: 's',
    control: {left: 'Scoop a fish'},
    ruleCatch: 'Catch before it changes',
    ruleLampLoss: 'Lose a light if a fish changes',
    ruleWait: 'Let other fish swim off',
    ruleNote: 'Catch the fish that has been here longest.',
    ruleAccess: "Ordinary fish can swim away safely. When the net is ready, scoop the fish that has been here longest. Lose a light if a fish changes.",
    netCooling: 'Net cooling down',
    netReady: 'Net ready',
    netLoss: 'A goldfish changed.',
    netCasting: 'Casting the net',
    lives: 'Lights left: {lives}.',
    feedback: {evolving: 'Caught it before it changed.', ordinary: 'Caught an ordinary goldfish.'}
  }
};

// Text on the existing template, recorded with its original value so Chinese is
// restored verbatim when a resident stage begins its next round in Chinese.
export const EN_MARKUP = {
  'rice-bubbles-g10': [['.best-time > span', null, 's']],
  'regulars-g04': [
    ['#lives', 'title', 'Three wrong or missed orders end the round.']
  ],
  'planks-g02': [
    ['#boat-hit', 'aria-label', 'Fishing boat. Click outside to return to work.'],
    ['#sites', 'aria-label', 'Gaps in the boat'],
    ['#mast-clock', 'aria-label', 'Time left for this patch'],
    ['#result .best span span', null, 'planks']
  ],
  'balloon-winds': [
    ['#current', 'aria-label', 'Balloon position'],
    ['#target', 'aria-label', 'Star position'],
    ['#heat', 'aria-label', 'Balloon heat'],
    ['#clouds', 'aria-label', 'Available clouds'],
    ['#rule-add', 'aria-label', 'Add (15, 0) to (30, 45) to reach the star at (45, 45).'],
    ['#rule-subtract', 'aria-label', 'Subtract (5, 0) from (45, 45) to reach the star at (40, 45).'],
    ['.best-score > span', null, 'stars']
  ],
  'fish-leap': [
    ['#fish-controls', 'aria-label', 'Swimming goldfish'],
    ['#rule-scoop', 'aria-label', 'DeepSeek-chan scoops up a goldfish.'],
    ['#rule-evolve', 'aria-label', 'A goldfish turns into Claude-chan.']
  ]
};

export const EN_DETAIL = {
  'rice-bubbles-g10': {
    foods: {
      baozi: 'steamed buns', jiaozi: 'dumplings', corn: 'corn', zongzi: 'sticky rice wraps',
      tanghulu: 'candied hawthorn', sweetpotato: 'sweet potato', youtiao: 'fried dough', mooncake: 'mooncakes'
    }
  },
  'regulars-g04': {
    secondsLeft: 'Time left: {seconds} s',
    request: '{guest} wants {dish}',
    first: '{guest} first',
    serve: 'Serve {guest}',
    choose: 'Pick a dish to serve',
    guests: {'guest-3':'Penguin','guest-4':'Rabbit','guest-5':'Cat','guest-6':'Pig','guest-7':'Elephant','guest-8':'Deer'},
    meals: {rice:'Rice',baozi:'Bao',dumplings:'Dumplings',noodles:'Noodles',corn:'Corn',zongzi:'Zongzi',
      'sweet-potato':'Sweet potato',pancake:'Pancake',tanghulu:'Tanghulu'}
  },
  'planks-g02': {patch: 'Patch gap {slot}'},
  'balloon-winds': {hearts: 'Hearts left: {count}', cloud: 'Select cloud {point}'},
  'fish-leap': {scoop: 'Scoop this goldfish', practice: 'Level {level} practice'}
};
