// Wifi-insurance fallbacks for the 4 demo queries. Served when Redpine errors,
// times out, or when ?demo=1 forces deterministic output. Content mirrors the
// shape real Redpine answers produce so the UI renders identically.
//
// NOTE: these are demo stand-ins. Live runs hit Redpine; this is the safety net.

function key(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

const ENTRIES = [
  {
    match: 'what should i cook tonight got chicken thighs and feeling lazy',
    text: "Lazy night, great protein — here's a one-pan braise that does the work for you.",
    cards: [
      {
        type: 'recipe',
        title: 'Crispy Braised Chicken Thighs with Lemon & Garlic',
        brand: 'Serious Eats',
        why: 'One skillet, crispy skin, and a pan sauce that comes together while it braises — minimal effort, big payoff.',
        time: '40 min',
        key_ingredient: 'bone-in chicken thighs',
        url: 'https://www.seriouseats.com/crispy-braised-chicken-thighs-recipe',
      },
    ],
    used: { cuisines: ['American'], proteins: ['chicken'], techniques: ['braise'] },
  },
  {
    match: 'im in charleston this weekend where should i eat dinner',
    text: "Charleston does Lowcountry dinner beautifully — here's a spot the editors keep coming back to.",
    cards: [
      {
        type: 'place',
        name: "FIG (Food Is Good)",
        brand: 'Southern Living',
        dish: 'Wood-grilled local fish with seasonal vegetables',
        why: 'Southern Living highlights its ingredient-driven Lowcountry menu as a Charleston must-visit.',
        maps_query: 'FIG restaurant Charleston SC',
        url: 'https://www.southernliving.com/charleston-restaurants',
      },
    ],
    used: { cuisines: ['Lowcountry'], proteins: ['fish'], techniques: ['wood-grill'] },
  },
  {
    match: 'build me a week of dinners vegetarian under 30 minutes each',
    text: "Here's a week of fast, varied vegetarian dinners — no repeats, all under 30 minutes.",
    cards: [
      {
        type: 'recipe',
        title: 'One-Pot Lemon Orzo with White Beans',
        brand: 'EatingWell',
        why: 'A creamy, protein-rich weeknight bowl that cooks in a single pot in under 30 minutes.',
        time: '25 min',
        key_ingredient: 'white beans',
        url: 'https://www.eatingwell.com/one-pot-lemon-orzo-white-beans',
      },
      {
        type: 'recipe',
        title: 'Crispy Tofu Stir-Fry with Snap Peas',
        brand: 'Allrecipes',
        why: 'High-heat stir-fry gets dinner on the table fast with a different cuisine and protein.',
        time: '20 min',
        key_ingredient: 'firm tofu',
        url: 'https://www.allrecipes.com/crispy-tofu-stir-fry',
      },
      {
        type: 'recipe',
        title: 'Smoky Black Bean Tacos',
        brand: 'The Spruce Eats',
        why: 'Pantry-friendly tacos with a smoky char — a third distinct cuisine for the week.',
        time: '20 min',
        key_ingredient: 'black beans',
        url: 'https://www.thespruceeats.com/smoky-black-bean-tacos',
      },
    ],
    used: {
      cuisines: ['Mediterranean', 'Asian', 'Mexican'],
      proteins: ['white beans', 'tofu', 'black beans'],
      techniques: ['one-pot', 'stir-fry', 'char'],
    },
  },
];

const FALLBACKS = ENTRIES.map((e) => ({ ...e, _k: key(e.match) }));

export function getFallback(message) {
  const k = key(message);
  return FALLBACKS.find((f) => f._k === k || k.includes(f._k) || f._k.includes(k)) || null;
}

// For /compare: a deliberately generic "vanilla" answer to contrast against grounding.
export const VANILLA_FALLBACK =
  "You could pan-sear the chicken thighs with some salt, pepper, and garlic, then roast until cooked through. Serve with whatever vegetables you have on hand. It's quick and works for most weeknights.";
