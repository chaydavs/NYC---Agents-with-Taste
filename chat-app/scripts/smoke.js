// Live smoke test: proves the agent actually reaches Redpine and grounds output.
// Run: node --env-file=../.env scripts/smoke.js   (from chat-app/)
//  or: node --env-file=.env chat-app/scripts/smoke.js  (from repo root)

import { runAgentOnce, runVanillaOnce } from '../lib/agent.js';

const QUERY = 'What should I cook tonight? Got chicken thighs and feeling lazy.';
const profile = {
  eats_summary: 'Cooks at home most weeknights, time-poor, likes bold flavors.',
  dines: 'mostly home',
  restrictions: 'no shellfish',
};

function line() {
  console.log('─'.repeat(64));
}

async function main() {
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'present' : 'MISSING');
  console.log('REDPINE_API_KEY:', process.env.REDPINE_API_KEY ? 'present' : 'MISSING');
  line();

  console.log('Running GROUNDED agent (live Redpine)...');
  const t0 = Date.now();
  const grounded = await runAgentOnce({
    message: QUERY,
    profile,
    recommended: { cuisines: [], proteins: [], techniques: [] },
    history: [],
  });
  const ms = Date.now() - t0;

  console.log('\nSPOKEN:', grounded.spoken);
  console.log('\nCARDS (verified):', JSON.stringify(grounded.cards, null, 2));
  console.log('\nSOURCES from Redpine:', JSON.stringify(grounded.sources, null, 2));
  console.log('\nMETA:', JSON.stringify(grounded.meta));
  console.log(`\nLatency: ${ms}ms`);
  line();

  // The proof the user asked for: did the agent really call Redpine?
  const hitRedpine = grounded.meta.toolCalls > 0 && grounded.sources.length > 0;
  console.log(hitRedpine ? '✅ REAL REDPINE WORK CONFIRMED' : '❌ NO REDPINE CALLS / NO SOURCES');
  if (grounded.meta.droppedCards > 0) {
    console.log(`(verification dropped ${grounded.meta.droppedCards} unsourced card[s])`);
  }
  line();

  console.log('Running VANILLA (no Redpine) for contrast...');
  const vanilla = await runVanillaOnce({ message: QUERY });
  console.log('VANILLA:', vanilla.text);

  process.exit(hitRedpine ? 0 : 1);
}

main().catch((err) => {
  console.error('SMOKE FAILED:', err?.message || err);
  if (err?.status) console.error('HTTP status:', err.status);
  if (err?.error) console.error('API error:', JSON.stringify(err.error));
  process.exit(1);
});
