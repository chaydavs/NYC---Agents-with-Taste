// POST /api/chat — main food agent, streams Server-Sent Events.
// Primary path is LIVE Redpine grounding. Fallbacks fire only on failure or ?demo=1.

import { z } from 'zod';
import { runAgent } from './_lib/agent.js';
import { mergeVariety } from './_lib/variety.js';
import { getFallback } from './_lib/fallbacks.js';

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
  already_recommended: z
    .object({
      cuisines: z.array(z.string()).optional(),
      proteins: z.array(z.string()).optional(),
      techniques: z.array(z.string()).optional(),
    })
    .partial()
    .optional(),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(20)
    .optional(),
});

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

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

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const { message, user_profile, already_recommended, history } = body;
  const recommended = already_recommended || { cuisines: [], proteins: [], techniques: [] };
  const demo = req.query?.demo === '1' || process.env.DEMO_MODE === '1';

  // Deterministic demo path (only when explicitly requested).
  if (demo) {
    const fb = getFallback(message);
    if (fb) {
      sse(res, 'delta', { text: fb.text });
      sse(res, 'result', {
        cards: fb.cards,
        sources: deriveSourcesFromCards(fb.cards),
        used: fb.used,
        recommended_next: mergeVariety(recommended, fb.used),
        meta: { fallback: true },
      });
      return res.end();
    }
  }

  try {
    const result = await runAgent({
      message,
      profile: user_profile,
      recommended,
      history,
      onDelta: (text) => sse(res, 'delta', { text }),
    });

    sse(res, 'result', {
      cards: result.cards,
      sources: result.sources,
      used: result.used,
      recommended_next: mergeVariety(recommended, result.used),
      assistantText: result.assistantText,
      meta: result.meta,
    });
    sse(res, 'done', { ok: true });
  } catch (err) {
    // Wifi insurance: serve a fallback if we have one, else surface the error honestly.
    const fb = getFallback(message);
    if (fb) {
      sse(res, 'delta', { text: fb.text });
      sse(res, 'result', {
        cards: fb.cards,
        sources: deriveSourcesFromCards(fb.cards),
        used: fb.used,
        recommended_next: mergeVariety(recommended, fb.used),
        meta: { fallback: true, error: err?.message },
      });
    } else {
      sse(res, 'error', { message: 'The agent hit an error grounding that. Try again?' });
    }
  } finally {
    res.end();
  }
}

// Fallback cards already carry brand+url; surface them as sources for the panel.
function deriveSourcesFromCards(cards) {
  return (cards || []).map((c) => ({
    title: c.title || c.name,
    publisher: c.brand,
    url: c.url,
    snippet: c.why,
    published_at: '',
  }));
}
