// POST /api/compare — jury bonus. Same query, two columns:
//   vanilla  = Claude with a generic prompt, NO Redpine
//   grounded = the full agent with live Redpine + verified sources
// Runs both in parallel so the reveal is fast.

import { z } from 'zod';
import { runAgentOnce, runVanillaOnce } from '../lib/agent.js';
import { getFallback, VANILLA_FALLBACK } from '../lib/fallbacks.js';

const Body = z.object({
  message: z.string().min(1).max(2000),
  user_profile: z
    .object({
      eats_summary: z.string().optional(),
      dines: z.string().optional(),
      restrictions: z.string().optional(),
    })
    .partial()
    .optional(),
});

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  let body;
  try {
    body = Body.parse(await readBody(req));
  } catch (err) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'invalid request', detail: err?.message }));
  }

  const { message, user_profile } = body;

  const [vanilla, grounded] = await Promise.all([
    runVanillaOnce({ message }).catch(() => ({ text: VANILLA_FALLBACK, model: 'fallback' })),
    runAgentOnce({
      message,
      profile: user_profile,
      recommended: { cuisines: [], proteins: [], techniques: [] },
      history: [],
    }).catch(() => {
      const fb = getFallback(message);
      return fb
        ? { spoken: fb.text, cards: fb.cards, sources: [], used: fb.used, meta: { fallback: true } }
        : { spoken: 'Could not ground that right now.', cards: [], sources: [], meta: { error: true } };
    }),
  ]);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      vanilla: { text: vanilla.text },
      grounded: {
        text: grounded.spoken,
        cards: grounded.cards,
        sources: grounded.sources,
        meta: grounded.meta,
      },
    })
  );
}
