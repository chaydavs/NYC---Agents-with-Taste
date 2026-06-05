---
name: redpine-usage
description: Use this skill before any interaction with Redpine, the grounding API for licensed editorial data exposed via MCP at https://api.redpine.ai/mcp. Covers query construction, batching, provenance extraction, error handling, and cost discipline. Trigger on any mention of Redpine, grounding, premium data, People Inc., editorial content retrieval, or RAG against licensed sources.
---

# Redpine Usage Skill

Redpine is a grounding API exposing licensed non public data via MCP, HTTP, and CLI. For this project, the canonical interface is the MCP server at `https://api.redpine.ai/mcp`.

## Authentication

Bearer token in the `Authorization` header or `X-API-Key` header. Get the key at app.redpine.ai. Store as `REDPINE_API_KEY` in `.env`.

## How to call Redpine

### Recommended: via Claude API as an MCP server

This is the path of least resistance. Claude discovers Redpine's tools automatically and calls them inside its tool use loop.

```python
import anthropic
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=4096,
    system=AGENT_SYSTEM_PROMPT,
    messages=conversation_history,
    mcp_servers=[{
        "type": "url",
        "url": "https://api.redpine.ai/mcp",
        "name": "redpine",
        "authorization_token": os.environ["REDPINE_API_KEY"]
    }],
    betas=["mcp-client-2025-04-04"]
)
```

### For local debugging: raw HTTP MCP

```bash
curl -X POST https://api.redpine.ai/mcp \
  -H "Authorization: Bearer $REDPINE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Run this first thing to confirm the key works and to see what tools are actually exposed. Do not assume tool names; read them from the response.

## Query design rules

1. **Be specific.** `vegan brunch menu for 8 people no nuts` beats `food ideas`.
2. **One concept per query.** If the user asks two things, plan two separate calls.
3. **Hint the vertical.** Mention the editorial domain in the query so Redpine routes to the right data partner: `Real Simple style table setting`, `Investopedia explanation of`, `Verywell Health perspective on`.
4. **Start narrow.** If results are sparse, broaden on the next call. Never start broad and try to filter down in the LLM.
5. **Cap at 3 calls per user turn for v1.** More than that and latency tanks the demo.

## Provenance extraction

This is the demo. Every Redpine response carries source metadata. Always surface it to the frontend:

```python
def extract_sources(redpine_result):
    return [{
        "title": item.get("title"),
        "publisher": item.get("source") or item.get("publisher"),
        "url": item.get("url"),
        "snippet": item.get("snippet") or item.get("excerpt"),
        "published_at": item.get("published_at"),
    } for item in redpine_result.get("results", [])]
```

The agent's final answer should reference sources inline (e.g. `[1]`, `[2]`) and the UI should render the sources panel with clickable links.

## Anti patterns

- Calling Redpine for greetings, opinions, or clarifying questions
- Stuffing the entire user message verbatim into the query
- Asking for "all results" when 3 to 5 is plenty
- Looping Redpine calls without bounds
- Fabricating sources in the final answer (if Redpine returned nothing, say so)
- Ignoring `published_at`; recency matters for some verticals (health, finance, travel)

## Failure modes and handling

| Failure | Handling |
|---|---|
| Empty results | Say "no editorial coverage found for that exact query" and offer to broaden. Do not hallucinate. |
| Rate limit | Fall back to a hardcoded cached result for the demo queries. |
| Network timeout (>5s) | Skip the call, return partial answer with what's known. |
| Auth error | Log loudly, check `.env`, do not retry silently. |

## Cost discipline

Free for the first 5 queries, then pay per token. For the hackathon:
- Cap 3 Redpine calls per user turn
- Cache identical queries within a session (in memory dict keyed on query string)
- Pre warm 3 to 5 demo queries before showtime so the live demo hits cache and feels instant

## Worked example

User: "Plan a Sunday brunch for 8, two vegan guests, no nuts."

Wrong: one Redpine call with the whole message.

Right: three planned calls.
1. `vegan brunch main dish recipes no nuts serves 8`
2. `brunch table setting ideas Real Simple style spring`
3. `non alcoholic brunch drink pairings for vegan menu`

Then synthesize across the three result sets in the final answer, with citations.
