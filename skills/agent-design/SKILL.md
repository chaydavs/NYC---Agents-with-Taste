---
name: agent-design
description: Use this skill before designing tool definitions, agent loops, state, or fallback handling. Covers the chatbot vs RAG vs agent distinction, when to add a loop, how to size tools, and the failure modes that kill hackathon demos. Trigger on tasks involving agent architecture, tool design, multi step reasoning, orchestration, or any choice between single shot and looped LLM calls.
---

# Agent Design Skill

An agent is an LLM in a loop with tools. That's it. Everything else is implementation detail.

The interesting question is never "should this be an agent?" It's "how much autonomy does this task need?"

## The three patterns

| Pattern | Behavior | Use when |
|---|---|---|
| **Chatbot** | One LLM call, no tools | Pure conversation, no facts to ground |
| **RAG** | One LLM call, one tool call before it | Fact lookup with predictable shape |
| **Agent** | LLM loop with tool calls, LLM decides when to stop | Multi step questions, dynamic decomposition |

For this hackathon, we want **agent** behavior because user questions span multiple verticals ("plan a brunch" touches recipes + table + drinks) and require dynamic decomposition.

## When to add the loop

Default to RAG. Upgrade to agent loop when any of these are true:
- The user question can require more than one factual lookup
- The lookups depend on earlier results (compositional)
- The agent must choose between multiple data sources
- There's a synthesis step across heterogeneous sources

The hackathon hits all four. Loop confirmed.

## How to size tools

A tool should be small, focused, and named in plain language. The LLM picks tools based on the description; treat the description as the most important part.

**Good**:
```
search_editorial(query: str, vertical: Optional[str]) -> List[Article]
  "Search People Inc.'s editorial archive for articles matching the query.
   Optionally filter to a vertical: 'food', 'health', 'home', 'travel', etc.
   Returns up to 5 ranked results with title, source, snippet, url."
```

**Bad**:
```
query(q: str, opts: dict) -> Any
  "Query the system."
```

The Redpine MCP server handles this for you; its tools are already well shaped. Don't wrap them unnecessarily.

## The agent loop

```python
def run_agent(user_message: str, history: list) -> dict:
    messages = history + [{"role": "user", "content": user_message}]

    for iteration in range(MAX_ITERATIONS):  # cap at 5 for this demo
        response = call_claude(messages)

        if response.stop_reason == "end_turn":
            return {
                "answer": extract_text(response),
                "sources": extract_sources(messages),
                "messages": messages
            }

        # Tool use happened. Append assistant message + tool results, loop.
        messages.append({"role": "assistant", "content": response.content})
        tool_results = execute_tools(response.tool_use_blocks)
        messages.append({"role": "user", "content": tool_results})

    # Hit iteration cap. Force a final answer.
    return force_synthesize(messages)
```

When using Claude's `mcp_servers` parameter, the MCP tool calls happen *inside* Anthropic's infrastructure. You don't manage the loop yourself for those calls; you get back a final message with the tool use already resolved. Simpler.

## State to track explicitly

Even with a stateless API, your app should track:
1. **Conversation history** (the `messages` array)
2. **Sources cited so far** (dedup across turns)
3. **Iteration count** (defense against runaway loops)
4. **Cache of recent Redpine queries** (don't re query same string)

## Failure modes that kill demos

| Failure | Defense |
|---|---|
| Infinite loop | Hard cap iterations at 5 |
| Tool returns junk and LLM keeps re trying | Detect empty results, return fallback answer |
| LLM ignores tools entirely | Add explicit tool use instruction in system prompt with examples |
| LLM over calls tools | Cap calls per turn, instruct in prompt |
| Latency over 8s | Stream the response; show "thinking" indicator |
| Wifi dies during demo | Hardcoded fallback responses for the 3 planned demo queries |

## Architectural simplicity rules

For a 2.5 hour build:
- One backend file (FastAPI)
- One frontend file (HTML or single React component)
- One config file (`.env`)
- One agent loop function
- No databases, no auth, no sessions beyond an in memory dict
- Deploy from a single `git push` to Railway or Vercel

Anything beyond this is a tax you'll pay during the demo.

## When to delegate

For planning Redpine query strategy for a specific user question, invoke the `redpine-strategist` sub-agent. It maps user intent to the optimal sequence of Redpine calls.
