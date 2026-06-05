---
name: api-efficiency
description: Use this skill before adding any Claude API call to the project. Covers model selection per task, prompt caching, streaming, parallel tool calls, and back of envelope cost math. Trigger on any task involving Claude API integration, model choice, latency optimization, token cost concerns, or scaling agent calls.
---

# Claude API Efficiency Skill

For a hackathon, the goal is: cheapest call that ships a great demo, lowest latency the user can perceive. This skill makes you pick the right model and the right call pattern.

## Model selection

| Model | Strengths | Use for |
|---|---|---|
| **Claude Haiku 4.5** | Fast, cheap, decent reasoning | Classification, routing, simple summaries, autocomplete |
| **Claude Sonnet 4.5** | Best speed to quality ratio, strong tool use | Default agent brain for this project |
| **Claude Opus 4.7** | Strongest reasoning, slowest, most expensive | Final synthesis step if quality matters more than latency |

For this hackathon: **Sonnet 4.5 as the default**. Consider Opus only for the final synthesis step if Sonnet gives shallow answers.

Do not mix models within a single agent turn unless you have a measured reason. Consistency wins.

## Prompt caching

If the system prompt is the same across calls (it usually is), cache it:

```python
client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=4096,
    system=[{
        "type": "text",
        "text": AGENT_SYSTEM_PROMPT,
        "cache_control": {"type": "ephemeral"}
    }],
    messages=conversation_history,
    mcp_servers=[...]
)
```

Cached tokens are roughly 10% the price of fresh tokens on cache hits. Cache lasts 5 minutes (refreshed on each hit). For a multi turn demo, this matters.

You can also cache long parts of the conversation history if it stabilizes. For a hackathon demo with short conversations, system prompt caching alone is enough.

## Streaming

Use `stream=True` for any user facing response over 1 second. The user sees tokens appear; perceived latency drops massively.

```python
with client.messages.stream(...) as stream:
    for text in stream.text_stream:
        yield text  # push to the frontend via SSE
```

Streaming is the single biggest UX win for a live demo. The jury will visibly react.

## Parallel tool calls

Claude can request multiple tools in a single response when it knows the calls are independent. For multi vertical questions ("brunch + table + drinks"), this halves the wall clock latency.

To encourage parallel tool use, include in your system prompt:

> When the user's question decomposes into independent sub queries, call all relevant Redpine queries in parallel within a single response rather than sequentially across turns.

The MCP integration handles this naturally; Claude will batch tool_use blocks when it can.

## Latency budget for the demo

Target end to end response time under 4 seconds for the demo to feel snappy. Budget:

| Step | Budget |
|---|---|
| Network round trip + auth | 300 ms |
| Redpine MCP tool calls (parallel) | 1500 ms |
| Claude synthesis with streaming first token | 800 ms |
| Total first token | ~2.5 s |
| Full response | ~4 s |

If you blow past 5 seconds, you're losing the demo. Profile each step, optimize the slowest one.

## Cost back of envelope

Sonnet 4.5 pricing (rough, check current docs):
- Input: ~$3 per million tokens (10% of that with cache hits)
- Output: ~$15 per million tokens

A single agent turn with 500 token system prompt (cached after first call) + 2000 token conversation + 1000 token output costs roughly half a cent. The hackathon demo will cost under a dollar total.

Modal credits ($150) and Lovable credits (100) don't apply if you skip those tools. Anthropic API is on your card; budget $5 for the day, you'll likely use $1.

## Things to skip for v1

These are real optimizations but not worth the time today:
- Custom embeddings (Redpine handles retrieval)
- Vector DB (Redpine handles retrieval)
- Multi turn evaluation harness (no time, eyeball quality instead)
- Distillation to Haiku (Sonnet is fast enough)
- Self consistency / multiple sampling (single sample, one model)

Ship the boring, well executed version.
