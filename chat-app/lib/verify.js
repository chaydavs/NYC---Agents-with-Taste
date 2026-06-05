// Provenance verification gate (principles 4 + 6).
// A card is trustworthy only if its brand matches a brand Redpine actually
// returned this turn. Redpine gives no canonical URL, so BRAND is the anchor
// (normalized so "Food & Wine" === "FoodAndWine"). This stops the agent from
// citing a brand the retrieval never surfaced.

import { brandKey, hostOf } from './redpine.js';

export function verifyCards(cards, sources) {
  // Each source contributes its publisher name AND its url host as match keys,
  // so editorial cards (brand) and web-fallback cards (site/domain) both verify.
  const keys = new Set();
  for (const s of sources) {
    if (s.publisher) keys.add(brandKey(s.publisher));
    const h = brandKey(hostOf(s.url));
    if (h) keys.add(h);
  }

  const verified = [];
  const dropped = [];
  for (const card of cards || []) {
    const ck = brandKey(card.brand);
    const hk = brandKey(hostOf(card.url));
    const ok =
      (ck && [...keys].some((k) => k.includes(ck) || ck.includes(k))) ||
      (hk && [...keys].some((k) => k.includes(hk) || hk.includes(k)));
    if (ok) verified.push(card);
    else dropped.push({ card, reason: `source "${card.brand}" not in results` });
  }
  return { verified, dropped };
}
