// Variety tracking (principle: no repeated cuisine/protein/technique per session).
// The model self-reports what each turn's cards cover via the json block's `used`
// field; we merge that into the running session set. Single source of truth.

function mergeUnique(prev = [], next = []) {
  const seen = new Set(prev.map((x) => x.toLowerCase()));
  const out = [...prev];
  for (const item of next) {
    const k = (item || '').toString().trim();
    if (k && !seen.has(k.toLowerCase())) {
      seen.add(k.toLowerCase());
      out.push(k);
    }
  }
  return out;
}

// Merge a turn's `used` tags into the prior already_recommended state and return
// the new immutable state for the client to hold.
export function mergeVariety(prev, used) {
  const p = prev || {};
  const u = used || {};
  return {
    cuisines: mergeUnique(p.cuisines, u.cuisines),
    proteins: mergeUnique(p.proteins, u.proteins),
    techniques: mergeUnique(p.techniques, u.techniques),
  };
}
