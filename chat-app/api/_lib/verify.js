// Provenance verification gate (principles 4 + 6).
// A card is trustworthy only if its brand matches a brand Redpine actually
// returned this turn. Redpine gives no canonical URL, so BRAND is the anchor
// (normalized so "Food & Wine" === "FoodAndWine"). This stops the agent from
// citing a brand the retrieval never surfaced.

import { brandKey } from './redpine.js';

export function verifyCards(cards, sources) {
  const sourceBrands = new Set(sources.map((s) => brandKey(s.publisher)).filter(Boolean));

  const verified = [];
  const dropped = [];
  for (const card of cards || []) {
    const ck = brandKey(card.brand);
    const ok = ck && [...sourceBrands].some((b) => b.includes(ck) || ck.includes(b));
    if (ok) verified.push(card);
    else dropped.push({ card, reason: `brand "${card.brand}" not in Redpine results` });
  }
  return { verified, dropped };
}
