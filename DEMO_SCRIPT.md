# BananaBread — Demo Script

**Live:** https://bananabread-eta.vercel.app

**Thesis in one line:** "Most AI eats whatever's loudest on the open web. BananaBread eats
*licensed editorial* from People Inc.'s 15 food brands first — and every claim is clickable."

---

## 0. Before you go on stage

- Open **https://bananabread-eta.vercel.app** in Chrome, full screen. (No localhost needed —
  it's deployed; functions hit live Redpine + Anthropic.)
- It greets you automatically (the agent writes the greeting — nothing scripted).
- Top-right: **Load persona → "Alex — eats out often, vegetarian"** for the dining demo.
- Latency: editorial answers ~8–11s, web-fallback ~18s. The "typing…" indicator covers it.

---

## 1. The hook (20s)

> "This is BananaBread. The only thing it's allowed to know comes from People Inc.'s licensed
> editorial — Serious Eats, Food & Wine, EatingWell, TripSavvy, 11 more. Watch the right side:
> every recommendation traces to a real article you can click."

---

## 2. Cook mode — grounded in editorial (40s)

Load persona **"Sam — cooks most nights"**, then type:
> **What should I cook tonight? Got chicken thighs and feeling lazy.**

- Cards appear with **brown brand badges** (Food & Wine, EatingWell, Serious Eats).
- Right panel: **"Grounded in N editorial sources across M People Inc. brands."**
- Click **"Get the full recipe →"** → lands on the real article.
> "Title, brand, date — sourced and clickable. Grounded, and *visibly* grounded."

---

## 3. Eat-out mode — persona-driven + web fallback (45s)  ← the strongest moment

Load persona **"Alex — eats out often, vegetarian"**, then:
> **What can I eat in NYC? I'm in Manhattan and craving ramen.**

> "Alex eats out, so BananaBread stays in restaurant mode — it gives me *places*, not recipes.
> People Inc. editorial doesn't cover NYC vegetarian ramen… so watch: it says so, then falls
> back to a live web search — and labels those sources honestly as **web**, not editorial."

- Cards are **restaurants** (place cards), badges show **🌐 site · web** in gray.
- Right panel headline flips to **"No editorial coverage — fell back to N web sources."**
> "It never fakes a source. Editorial first; web as an honest, labeled backstop."

---

## 4. Memory + variety (20s)

> **Make it a week of vegetarian dinners, nothing repeated.**

> "It remembers Alex is vegetarian, and tracks what it's already suggested — no repeated
> cuisine, protein, or technique. Variety is enforced, not hoped for."

---

## 5. The money shot — Compare (35s)

Click **"Compare vs vanilla"** → **Switch** mode.
- Lands on **✦ Grounded · People Inc.** (full color, cards, badges).
- Flip to **⚠ Outdated generic** → the answer drains to **black & white**.
> "Same question. Flip it — a generic model on stale, unsourced data: no citations, no brands,
> no way to verify. Flip back: BananaBread. *This* is what licensed grounding buys you."

Let the black-and-white sit for a beat.

---

## 6. Close (10s)

> "Every answer traceable to a brand you trust, one agent across cook / eat-out / plan, honest
> when editorial runs out, and a visible contrast against ungrounded AI. Agents with human taste."

---

## If something breaks
- **A query hangs:** refresh and re-ask. Web-fallback queries legitimately take ~18s.
- **Page issue:** hard-refresh (Cmd+Shift+R).
- Never apologize for the wait — "it's running a live licensed-data search" (it is).

## Known-good demo queries
1. `What should I cook tonight? Got chicken thighs and feeling lazy.`  (Sam → editorial recipes)
2. `What can I eat in NYC? I'm in Manhattan and craving ramen.`  (Alex → restaurants, web fallback)
3. `Make it a week of vegetarian dinners, nothing repeated.`  (variety)
4. Compare modal, reuse #1 for the side-by-side.
