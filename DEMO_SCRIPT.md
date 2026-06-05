# Food Agent — 3-Minute Demo Script

**Thesis in one line:** "Most AI eats whatever's loudest on the open web. Ours only eats
*licensed editorial* from People Inc.'s 15 food brands — and every claim is clickable."

---

## 0. Before you go on stage (setup, ~2 min)

```bash
# Terminal 1 — backend (live Anthropic + Redpine)
cd chat-app && npm run api          # → [api] keys present ✓

# Terminal 2 — frontend
cd chat-app && ./node_modules/.bin/vite   # → http://localhost:5173
```

- Open **http://localhost:5173** in Chrome, full screen.
- **Pre-warm** so the first live answer is fast (run once, then leave it):
  ```bash
  cd chat-app && npm run smoke      # should print ✅ REAL REDPINE WORK CONFIRMED
  ```
- Top-right: **Load persona → "Alex — eats out often, vegetarian"** (skips onboarding).
- Have this file open on your phone as the talk-track.

---

## 1. The hook (20 sec)

> "This is a food agent. But the only thing it's allowed to know comes from People Inc.'s
> licensed editorial — Serious Eats, Food & Wine, EatingWell, TripSavvy, and 11 other brands.
> Watch the right side: every recommendation is grounded in a real article you can click."

Point at the green **"● Grounded in People Inc. editorial"** badge.

---

## 2. Cook mode — the core loop (40 sec)

Type:
> **What should I cook tonight? Got chicken thighs and feeling lazy.**

While it says *"🔍 Searching People Inc. editorial…"*:
> "It's not guessing. It's running a live retrieval against the licensed corpus right now."

When cards appear:
- Point at the **brand badge** on the card ("Food & Wine", "Serious Eats").
- Click **"Get the full recipe →"** → lands on the real article.
> "Title, brand, date — and the source is one click away. That's the whole pitch:
> grounded, and *visibly* grounded."

---

## 3. Eat-out mode — same agent, different mode (35 sec)

Type:
> **Actually I don't want to cook. I'm in NYC, somewhere sit-down with a good vibe.**

> "Same agent — no mode switch, no menu. It decides this is a dining question, searches
> the travel-dining brands, and comes back with a *place* card: the restaurant, the dish
> to order, and who recommended it."

Point at the **place card** + its TripSavvy / Food & Wine badge + **Open in Maps →**.

---

## 4. Memory + variety (20 sec)

Type:
> **Make it a week of dinners, all vegetarian, nothing repeated.**

> "It remembers I'm vegetarian from my profile, and it tracks what it's already suggested —
> so no repeated cuisine, protein, or technique across the week. Variety is enforced, not hoped for."

---

## 5. The money shot — Compare vs vanilla (35 sec)

Click **"Compare vs vanilla"** (top-right) → it runs the same question two ways.

- Land on **✦ Grounded · People Inc.** (full color, cards, badges).
- Flip the switch to **⚠ Outdated generic** → the answer drains to **black & white**.
> "Same question. On the left [flip], a generic model working off stale, unsourced data —
> no citations, no brands, no way to verify. On the right, ours. *This* is what licensed
> grounding buys you."

Let the black-and-white sit for a beat. That's the image they'll remember.

---

## 6. Close (10 sec)

> "Every answer traceable to a brand you trust, a single agent that handles cook / eat-out /
> plan, and a visible contrast against ungrounded AI. Agents with human taste."

---

## If something breaks (wifi insurance)

- **Live call hangs / errors:** add `?demo=1` to the URL → deterministic cached answers for
  the 3 demo queries (chicken / Charleston / vegetarian week). Identical UI, no network.
- **Page won't load:** hard-refresh (Cmd+Shift+R). If still blank, restart Vite.
- **API down:** Terminal 1 — `npm run api` again.
- **Never** apologize for latency — say "it's doing a live licensed-data search" (it is).

## Demo queries that are known-good
1. `What should I cook tonight? Got chicken thighs and feeling lazy.`
2. `I'm in Charleston this weekend. Where should I eat dinner?`
3. `Build me a week of dinners, vegetarian, under 30 minutes each.`
4. (Compare modal) reuse #1 for the side-by-side.
