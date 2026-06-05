---
name: system-prompts
description: Use this skill before writing, editing, or critiquing any agent system prompt. Covers the canonical structure, anti patterns, token economics, and a worked template. Trigger on any task involving system prompts, agent instructions, persona design, tool use guidance, or behavioral specification for LLMs.
---

# System Prompt Authoring Skill

A system prompt is the operating system of an agent. It defines who the agent is, what tools it can use, how it formats output, and how it behaves under uncertainty. Most agent failures are prompt failures, not model failures.

## The five part spine

Every production grade agent prompt should have these sections, in this order:

```
1. ROLE: who you are in one sentence
2. OBJECTIVE: the single user outcome you optimize for
3. TOOLS: what's available and the rules of engagement
4. OUTPUT: format, length, citation style, examples
5. EDGE CASES: how to handle ambiguity, empty results, refusals
```

Skipping any section creates a class of failures at demo time. Edge cases are the most commonly skipped and the most damaging.

## Template

```
You are [ROLE: 1 sentence persona, grounded in the domain].

Your job is to [OBJECTIVE: the single outcome, phrased as a verb + measurable target].

## Tools

You have access to the Redpine MCP server, which exposes licensed editorial content from People Inc.'s 40+ brands (Allrecipes, Verywell Health, Real Simple, Travel+Leisure, Investopedia, etc.).

Rules for tool use:
- Call Redpine for any factual claim, recommendation, or recipe/instruction
- Decompose multi part questions into separate Redpine queries
- Cap at 3 Redpine calls per user turn
- If Redpine returns empty, say so honestly. Never fabricate sources.

## Output format

[Specify exact format. Markdown? JSON? Inline citations as [1]?]

Every claim grounded in Redpine must be followed by a citation marker like [1], [2], referencing the sources panel.

Example:
User: "Quick vegan pasta?"
You: "Try a one pot lemon orzo with white beans [1]. The trick is to add the orzo directly to simmering vegetable stock so it stays creamy [2].
Sources:
[1] Allrecipes, 'Lemon White Bean Orzo'
[2] EatingWell, 'One Pot Pasta Method'"

## Edge cases

- Empty Redpine results: "I don't have editorial sourcing for that yet. Want me to try a broader query?"
- Off topic question: redirect to [domain] gently, don't lecture
- Personal medical/legal/financial decision: cite sources, never give individual advice
- User asks for opinion: provide the editorial consensus from sources, label it as such
```

## Anti patterns to refuse

- **Persona theater without substance.** "You are a master sommelier with 30 years of experience" does nothing useful. Replace with capability statements.
- **Conflicting instructions.** "Be concise" + "Provide comprehensive detail" trains the model to pick whichever is easier in context. Pick one.
- **Vague tool guidance.** "Use tools when needed" produces both under and over calling. Be explicit about triggers.
- **No output spec.** The agent defaults to a verbose markdown blob. Always specify.
- **Negative only instructions.** "Don't hallucinate" tells the model nothing. Replace with positive specifications: "Only state facts present in tool results."
- **Wall of text.** If the prompt is over 500 tokens for a hackathon demo, you've over engineered it.

## Token economy

For Sonnet 4.5, target 300 to 500 tokens for the system prompt at this scale. The model already knows English and most domains; you're shaping behavior, not teaching from scratch.

Cache the system prompt with prompt caching if you'll call it more than 3 times per session:

```python
system=[{
    "type": "text",
    "text": AGENT_SYSTEM_PROMPT,
    "cache_control": {"type": "ephemeral"}
}]
```

This makes the second and subsequent calls about 10x cheaper on the cached tokens.

## How to iterate

1. Write v1 against the template above
2. Run 3 representative queries
3. For each failure, ask: was it a prompt failure or a model failure?
4. If prompt failure: add a specific instruction or example to the prompt
5. If model failure: switch to a stronger model (Opus) for that step
6. Re run all 3 queries to confirm no regressions

Aim for 3 iteration cycles before showtime. Diminishing returns after that.

## When to delegate

For drafting from scratch, invoke the `prompt-author` sub-agent. It will ask 2 to 3 clarifying questions and emit a v1 prompt against this template.
