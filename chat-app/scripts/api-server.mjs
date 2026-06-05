// Local API server for development — runs the same handlers Vercel will run in
// prod, on port 3001. Vite proxies /api/* here (see vite.config.js).
// Run: node --env-file=../.env scripts/api-server.mjs   (from chat-app/)

import http from 'node:http';
import chat from '../api/chat.js';
import compare from '../api/compare.js';

const PORT = process.env.API_PORT || 3001;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  // Mimic Vercel's req.query so handlers can read ?demo=1 etc.
  req.query = Object.fromEntries(url.searchParams.entries());

  if (url.pathname === '/api/chat') return chat(req, res);
  if (url.pathname === '/api/compare') return compare(req, res);

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  const keys = ['ANTHROPIC_API_KEY', 'REDPINE_API_KEY'];
  const missing = keys.filter((k) => !process.env[k]);
  console.log(`[api] listening on http://localhost:${PORT}`);
  if (missing.length) console.warn(`[api] ⚠️ missing env: ${missing.join(', ')}`);
  else console.log('[api] keys present ✓ — live Redpine grounding enabled');
});
