// Pre-seeded demo personas so the demo can skip live onboarding and fire the
// canonical queries instantly with a coherent, realistic profile.

export const PERSONAS = [
  {
    id: 'home-cook',
    label: 'Sam — cooks most nights',
    user_profile: {
      eats_summary: 'Cooks at home most weeknights, comfortable but time-poor, likes bold flavors.',
      dines: 'mostly home',
      restrictions: 'no shellfish',
    },
    already_recommended: { cuisines: [], proteins: [], techniques: [] },
  },
  {
    id: 'traveler',
    label: 'Alex — eats out often, vegetarian',
    user_profile: {
      eats_summary: 'Eats out 4-5 nights a week, adventurous, loves discovering local spots.',
      dines: 'mostly out',
      restrictions: 'vegetarian',
    },
    already_recommended: { cuisines: [], proteins: [], techniques: [] },
  },
  {
    id: 'planner',
    label: 'Jordan — weekly meal planner',
    user_profile: {
      eats_summary: 'Plans the week on Sunday, cooks in batches, wants fast healthy dinners.',
      dines: 'mix of both',
      restrictions: 'none',
    },
    already_recommended: { cuisines: [], proteins: [], techniques: [] },
  },
];

export function getPersona(id) {
  return PERSONAS.find((p) => p.id === id) || null;
}
