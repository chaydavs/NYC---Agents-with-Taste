// Redpine MCP wiring + provenance extraction.
// Redpine exposes META-tools: search runs via call-tool {tool_name:"search",
// arguments:{collection,query,limit,filters}} and returns TEXT blocks (not JSON),
// one per result, with a "**Title**", a "Author | Brand, YYYY-MM-DD" byline, an
// abstract, and a "[brand: …, slug: …, …]" metadata footer. We parse that text.

export const REDPINE_URL = 'https://api.redpine.ai/mcp';

export function redpineServer() {
  const token = process.env.REDPINE_API_KEY;
  if (!token) throw new Error('REDPINE_API_KEY not configured');
  return { type: 'url', url: REDPINE_URL, name: 'redpine', authorization_token: token };
}

// People Inc. brand → public domain, so a citation can link to the real site.
const BRAND_DOMAINS = {
  foodandwine: 'foodandwine.com',
  seriouseats: 'seriouseats.com',
  allrecipes: 'allrecipes.com',
  eatingwell: 'eatingwell.com',
  thespruceeats: 'thespruceeats.com',
  thespruce: 'thespruce.com',
  tripsavvy: 'tripsavvy.com',
  southernliving: 'southernliving.com',
  bhg: 'bhg.com',
  byrdie: 'byrdie.com',
  brides: 'brides.com',
  instyle: 'instyle.com',
  mydomaine: 'mydomaine.com',
  realsimple: 'realsimple.com',
  shape: 'shape.com',
  usatoday: 'usatoday.com',
};

export function brandKey(brand) {
  return (brand || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Web-search fallback results (Anthropic web_search tool). Surfaced as sources
// alongside editorial, flagged web:true so the UI can label them distinctly.
export function extractWebSources(finalMessage) {
  const blocks = finalMessage?.content || [];
  const seen = new Set();
  const out = [];
  for (const b of blocks) {
    if (b?.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content) {
        if (r?.type === 'web_search_result' && r.url && !seen.has(r.url)) {
          seen.add(r.url);
          out.push({
            title: r.title || hostOf(r.url),
            publisher: hostOf(r.url),
            url: r.url,
            snippet: '',
            published_at: r.page_age || '',
            web: true,
          });
        }
      }
    }
  }
  return out;
}

// Redpine returns no canonical URL, and brand slugs don't map cleanly to live
// paths (they 404). A site-scoped search on the exact title reliably lands on
// the real article and never dead-ends — the right call for clickable provenance.
function buildUrl(brand, title) {
  const domain = BRAND_DOMAINS[brandKey(brand)];
  const q = domain ? `site:${domain} ${title}` : `${title} ${brand}`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

// Pull fields directly from the metadata footer. We avoid parsing the bracket as
// a whole because the nested `keywords: ['…']` array contains a `]` that would
// truncate a naive [^\]]* match before reaching brand/slug.
function field(text, key) {
  const m = text.match(new RegExp(`(?:^|[,\\[\\s])${key}:\\s*([^,\\]\\n]+)`, 'i'));
  return m ? m[1].trim() : '';
}

function parseMetaFooter(text) {
  return {
    brand: field(text, 'brand'),
    slug: field(text, 'slug'),
    publisher: field(text, 'publisher'),
    last_updated_date: field(text, 'last_updated_date'),
    first_published_date: field(text, 'first_published_date'),
  };
}

// Parse one "### Result" chunk into a source object.
function parseResultChunk(chunk) {
  const titleM = chunk.match(/\*\*(.+?)\*\*/);
  const title = titleM ? titleM[1].trim() : null;
  if (!title) return null;

  const meta = parseMetaFooter(chunk);

  // Byline: "Author | Brand, 2025-04-30"
  const byline = chunk.match(/\n([^\n|]+)\|\s*([A-Za-z0-9& ]+?),\s*(\d{4}-\d{2}-\d{2})/);
  const brand = meta.brand || (byline ? byline[2].trim() : '');
  const date = meta.last_updated_date || meta.first_published_date || (byline ? byline[3] : '');

  // Snippet: prefer the Abstract/Overview section.
  const absM = chunk.match(/##\s*(?:Abstract|Overview)\s*\n+([^\n#]+)/i);
  const snippet = absM ? absM[1].trim() : '';

  return {
    title,
    publisher: brand || meta.publisher || 'People Inc',
    url: buildUrl(brand, title),
    snippet,
    published_at: date || '',
  };
}

// Extract a deduped, provenance-ready source list from a final message's content.
export function extractSources(finalMessage) {
  const blocks = finalMessage?.content || [];
  let toolCalls = 0;
  let combined = '';
  for (const block of blocks) {
    if (block?.type === 'mcp_tool_use' || block?.type === 'tool_use') toolCalls += 1;
    if (block?.type === 'mcp_tool_result' || block?.type === 'tool_result') {
      const content = block.content;
      if (Array.isArray(content)) {
        for (const c of content) if (c?.type === 'text' && c.text) combined += '\n' + c.text;
      } else if (typeof content === 'string') {
        combined += '\n' + content;
      }
    }
  }

  // Split on "### Result" markers and parse each.
  const chunks = combined.split(/###\s*Result\b/).slice(1);
  const seen = new Set();
  const sources = [];
  for (const chunk of chunks) {
    const src = parseResultChunk(chunk);
    if (!src) continue;
    const key = (src.title + '|' + src.publisher).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push(src);
  }
  return { sources, toolCalls };
}
