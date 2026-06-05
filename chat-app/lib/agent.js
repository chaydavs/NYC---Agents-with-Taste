// The food agent core. One streamed Claude call with Redpine attached as an MCP
// server — the tool-use loop runs inside Anthropic's infra (see skills/agent-design),
// so we don't hand-roll the iteration loop; we stream text, then parse + verify.

import Anthropic from '@anthropic-ai/sdk';
import { AGENT_SYSTEM_PROMPT, VANILLA_PROMPT, buildContextBlock } from './prompt.js';
import { redpineServer, extractSources, extractWebSources, brandKey, hostOf } from './redpine.js';
import { verifyCards } from './verify.js';

// Fallback search when licensed editorial has no coverage (e.g. a specific city's
// vegetarian ramen restaurants). Editorial is always tried first (see prompt).
const WEB_SEARCH_TOOL = { type: 'web_search_20250305', name: 'web_search', max_uses: 2 };

const MODEL = 'claude-sonnet-4-5';
const MCP_BETA = 'mcp-client-2025-04-04';
const MAX_TOKENS = 900;

let _client = null;
function client() {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

// System block carries cache_control so repeat turns are ~10x cheaper (principle 7).
function systemBlock() {
  return [{ type: 'text', text: AGENT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }];
}

// Turn the client-held session into the messages array (principle 8: memory).
function buildMessages(history, message, profile, recommended) {
  const prior = Array.isArray(history) ? history : [];
  return [
    ...prior,
    {
      role: 'user',
      content: `${buildContextBlock(profile, recommended)}\n\nUSER: ${message}`,
    },
  ];
}

// Pull the spoken sentence + json block out of the model's final text.
// Returns { spoken, cards, used }. Defensive: if no/blank json, cards = [].
function parseAssistantText(text) {
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  let cards = [];
  let used = { cuisines: [], proteins: [], techniques: [] };
  if (fence) {
    try {
      const obj = JSON.parse(fence[1].trim());
      if (Array.isArray(obj.cards)) cards = obj.cards;
      if (obj.used && typeof obj.used === 'object') used = { ...used, ...obj.used };
    } catch {
      /* malformed json block — leave cards empty, spoken text still shown */
    }
  }
  const spoken = text.replace(/```json[\s\S]*?```/i, '').trim();
  return { spoken, cards, used };
}

function textFromContent(content) {
  return (content || [])
    .filter((b) => b?.type === 'text')
    .map((b) => b.text)
    .join('');
}

const TOOL_RESULT_TYPES = new Set(['mcp_tool_result', 'tool_result', 'web_search_tool_result']);

// The model narrates between tool calls ("editorial has nothing, searching web…").
// The user-facing answer is only the text AFTER the last tool result — return that,
// so the bubble shows the final sentence, not the reasoning trace.
function finalTextSegment(content) {
  const blocks = content || [];
  let lastTool = -1;
  blocks.forEach((b, i) => {
    if (TOOL_RESULT_TYPES.has(b?.type)) lastTool = i;
  });
  const seg = blocks
    .slice(lastTool + 1)
    .filter((b) => b?.type === 'text')
    .map((b) => b.text)
    .join('');
  return seg || textFromContent(content);
}

function tokens(s) {
  return new Set((s || '').toLowerCase().match(/[a-z]{3,}/g) || []);
}

function overlap(a, b) {
  const A = tokens(a);
  let n = 0;
  for (const t of tokens(b)) if (A.has(t)) n += 1;
  return n;
}

// The agent emits brand but not URLs (Redpine gives none). Attach the real
// article URL + date from the best-matching verified source, so cards link out.
function enrichCards(cards, sources) {
  return (cards || []).map((card) => {
    const ck = brandKey(card.brand);
    const hk = brandKey(hostOf(card.url));
    const matches = (s) => {
      const sk = brandKey(s.publisher);
      const sh = brandKey(hostOf(s.url));
      const hit = (a, b) => a && b && (a.includes(b) || b.includes(a));
      return hit(sk, ck) || hit(sh, ck) || hit(sk, hk) || hit(sh, hk);
    };
    const candidates = sources.filter(matches);
    if (candidates.length === 0) return card;
    const label = card.title || card.name || card.dish || '';
    const best = candidates.reduce((a, b) =>
      overlap(label, b.title) >= overlap(label, a.title) ? b : a
    );
    // Tag the card's source tier so the UI can label web vs. editorial.
    return { ...card, url: card.url || best.url, published_at: best.published_at, web: !!best.web };
  });
}

// Run the grounded agent. onDelta(textChunk) streams the spoken sentence as it
// arrives (principle 7). Returns the fully assembled, verified result.
export async function runAgent({ message, profile, recommended, history, onDelta }) {
  const messages = buildMessages(history, message, profile, recommended);
  const params = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemBlock(),
    messages,
    mcp_servers: [redpineServer()],
    tools: [WEB_SEARCH_TOOL],
    betas: [MCP_BETA],
  };

  let finalMessage;
  const stream = client().beta.messages.stream(params);
  if (typeof onDelta === 'function') {
    // Stream only the leading spoken prose; suppress the json block from the UI.
    let acc = '';
    let inJson = false;
    stream.on('text', (delta) => {
      acc += delta;
      if (!inJson && acc.includes('```')) inJson = true; // stop streaming at the fence
      if (!inJson) onDelta(delta);
    });
  }
  finalMessage = await stream.finalMessage();

  const fullText = finalTextSegment(finalMessage.content);
  const { spoken, cards, used } = parseAssistantText(fullText);
  const { sources: editorialSources, toolCalls } = extractSources(finalMessage);
  const webSources = extractWebSources(finalMessage);
  const allSources = [...editorialSources, ...webSources];
  const { verified, dropped } = verifyCards(cards, allSources);
  const enriched = enrichCards(verified, allSources);

  return {
    spoken,
    cards: enriched,
    sources: allSources,
    used,
    meta: {
      toolCalls,
      webResults: webSources.length,
      usedWebFallback: webSources.length > 0,
      droppedCards: dropped.length,
      model: MODEL,
    },
    assistantText: fullText, // for appending to history next turn
  };
}

// Non-streaming grounded run (used by /compare).
export async function runAgentOnce({ message, profile, recommended, history }) {
  return runAgent({ message, profile, recommended, history });
}

// Vanilla run: no Redpine, generic prompt — the "before" column in /compare.
export async function runVanillaOnce({ message }) {
  const resp = await client().messages.create({
    model: MODEL,
    max_tokens: 600,
    system: VANILLA_PROMPT,
    messages: [{ role: 'user', content: message }],
  });
  return { text: textFromContent(resp.content).trim(), model: MODEL };
}
