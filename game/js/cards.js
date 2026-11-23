// Card definitions and deck building for Kindlefall.
// Every card carries a suit (told apart by colour and shape), an Ember cost,
// a power value, and one effect clause the engine reads.

export const SUITS = {
  sun: {
    id: 'sun',
    name: 'Sun',
    colour: '#f0b544',
    deep: '#7a4d12',
    glyph: 'sun',
    rite: 'Sun Resonance: 2 damage to the Warden',
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    colour: '#9a8cf0',
    deep: '#3b2f74',
    glyph: 'moon',
    rite: 'Moon Resonance: draw a card',
  },
  leaf: {
    id: 'leaf',
    name: 'Leaf',
    colour: '#63c07d',
    deep: '#1e4d31',
    glyph: 'leaf',
    rite: 'Leaf Resonance: heal 2 Warmth',
  },
  ash: {
    id: 'ash',
    name: 'Ash',
    colour: '#e2604f',
    deep: '#5d1f18',
    glyph: 'ash',
    rite: 'Ash Resonance: gain 1 Ember',
  },
};

// effects are declarative so the engine stays small and every card is data.
// strike / ward / heal / draw / ember / selfDamage, plus `bonus` for a combo.
export const CARDS = {
  sunlance: {
    id: 'sunlance', name: 'Sunlance', suit: 'sun', cost: 2, power: 4,
    effects: [{ kind: 'strike', amount: 4 }],
    text: 'Deal 4 damage.',
  },
  gildedRay: {
    id: 'gildedRay', name: 'Gilded Ray', suit: 'sun', cost: 1, power: 2,
    effects: [{ kind: 'strike', amount: 2 }],
    combo: { suit: 'moon', kind: 'strike', amount: 2, text: '+2 if a Moon card came first' },
    text: 'Deal 2. +2 if a Moon card came first.',
  },
  dawnbrand: {
    id: 'dawnbrand', name: 'Dawnbrand', suit: 'sun', cost: 3, power: 6,
    effects: [{ kind: 'strike', amount: 6 }],
    text: 'Deal 6 damage.',
  },
  solstice: {
    id: 'solstice', name: 'Solstice', suit: 'sun', cost: 3, power: 6,
    effects: [{ kind: 'strike', amount: 3 }, { kind: 'strike', amount: 3 }],
    text: 'Deal 3 damage twice.',
  },
  moonveil: {
    id: 'moonveil', name: 'Moonveil', suit: 'moon', cost: 1, power: 3,
    effects: [{ kind: 'ward', amount: 3 }],
    text: 'Gain 3 Ward.',
  },
  silverHush: {
    id: 'silverHush', name: 'Silver Hush', suit: 'moon', cost: 2, power: 5,
    effects: [{ kind: 'ward', amount: 5 }],
    text: 'Gain 5 Ward.',
  },
  tideOfStars: {
    id: 'tideOfStars', name: 'Tide of Stars', suit: 'moon', cost: 1, power: 2,
    effects: [{ kind: 'draw', amount: 2 }],
    text: 'Draw 2 cards.',
  },
  eclipse: {
    id: 'eclipse', name: 'Eclipse', suit: 'moon', cost: 2, power: 4,
    effects: [{ kind: 'ward', amount: 2 }, { kind: 'strike', amount: 2 }],
    text: 'Gain 2 Ward. Deal 2.',
  },
  rootbind: {
    id: 'rootbind', name: 'Rootbind', suit: 'leaf', cost: 1, power: 3,
    effects: [{ kind: 'heal', amount: 3 }],
    text: 'Heal 3 Warmth.',
  },
  verdantPact: {
    id: 'verdantPact', name: 'Verdant Pact', suit: 'leaf', cost: 2, power: 5,
    effects: [{ kind: 'heal', amount: 2 }, { kind: 'ward', amount: 3 }],
    text: 'Heal 2. Gain 3 Ward.',
  },
  thornwake: {
    id: 'thornwake', name: 'Thornwake', suit: 'leaf', cost: 1, power: 3,
    effects: [{ kind: 'strike', amount: 2 }, { kind: 'heal', amount: 1 }],
    text: 'Deal 2. Heal 1.',
  },
  greenwold: {
    id: 'greenwold', name: 'Greenwold', suit: 'leaf', cost: 3, power: 6,
    effects: [{ kind: 'heal', amount: 4 }, { kind: 'draw', amount: 1 }],
    text: 'Heal 4. Draw a card.',
  },
  emberlash: {
    id: 'emberlash', name: 'Emberlash', suit: 'ash', cost: 1, power: 3,
    effects: [{ kind: 'strike', amount: 3 }, { kind: 'selfDamage', amount: 1 }],
    text: 'Deal 3. Lose 1 Warmth.',
  },
  cinderStep: {
    id: 'cinderStep', name: 'Cinder Step', suit: 'ash', cost: 0, power: 1,
    effects: [{ kind: 'ember', amount: 1 }, { kind: 'strike', amount: 1 }],
    text: 'Gain 1 Ember. Deal 1.',
  },
  ashenCrown: {
    id: 'ashenCrown', name: 'Ashen Crown', suit: 'ash', cost: 2, power: 4,
    effects: [{ kind: 'strike', amount: 4 }],
    combo: { suit: 'leaf', kind: 'strike', amount: 3, text: '+3 if a Leaf card came first' },
    text: 'Deal 4. +3 if a Leaf card came first.',
  },
  wildfire: {
    id: 'wildfire', name: 'Wildfire', suit: 'ash', cost: 3, power: 5,
    effects: [{ kind: 'strike', amount: 5 }],
    text: 'Deal 5 damage.',
  },
};

export const DECK_LIST = [
  'sunlance', 'sunlance', 'sunlance',
  'gildedRay', 'gildedRay', 'gildedRay',
  'dawnbrand', 'dawnbrand',
  'solstice',
  'moonveil', 'moonveil', 'moonveil',
  'silverHush', 'silverHush',
  'tideOfStars', 'tideOfStars',
  'eclipse',
  'rootbind', 'rootbind',
  'verdantPact', 'verdantPact',
  'thornwake',
  'greenwold',
  'emberlash',
  'cinderStep',
  'ashenCrown',
  'wildfire',
];

// The Warden's deck is its own list; the engine only needs the count and the suits
// for the face-down hand it shows.
export const RIVAL_DECK_LIST = [
  'hollowLance', 'hollowLance', 'hollowLance', 'hollowLance',
  'ashGrip', 'ashGrip', 'ashGrip',
  'wardOfBells', 'wardOfBells', 'wardOfBells',
  'longNight', 'longNight', 'longNight',
  'cinderCall', 'cinderCall',
];

export const RIVAL_CARDS = {
  hollowLance: { id: 'hollowLance', name: 'Hollow Lance', suit: 'ash', cost: 2 },
  ashGrip: { id: 'ashGrip', name: 'Ash Grip', suit: 'sun', cost: 1 },
  wardOfBells: { id: 'wardOfBells', name: 'Ward of Bells', suit: 'moon', cost: 2 },
  longNight: { id: 'longNight', name: 'Long Night', suit: 'moon', cost: 3 },
  cinderCall: { id: 'cinderCall', name: 'Cinder Call', suit: 'leaf', cost: 1 },
};

export function buildDeck(list = DECK_LIST) {
  return list.map((id) => CARDS[id]);
}

export function buildRivalDeck() {
  return RIVAL_DECK_LIST.map((id) => RIVAL_CARDS[id]);
}

// mulberry32: a tiny seeded generator, so a duel can be replayed exactly.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, rng) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
