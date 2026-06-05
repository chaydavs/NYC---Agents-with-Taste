# NYC Hackathon Kit | Build AI Agents with Human Taste

This is a Claude Code workspace for the Redpine hackathon on June 5, 2026, hosted by People Inc. at Brookfield Place. We have 2.5 hours of build time. Every decision optimizes for a polished 4pm demo.

## The thesis

Most AI agents are trained on whatever is loudest on the open web. This event asks: what does an agent look like when its world model is *licensed editorial content* curated by humans (People Inc.'s 40+ brands, accessed via Redpine's MCP server)?

The winning demo will make grounding visible. Every claim the agent makes should be traceable to a source the user can click.

## How to use this workspace

When working on any task in this project, proactively consult these skills before acting:

| Skill | When to load |
|---|---|
| `skills/redpine/SKILL.md` | Before any Redpine call, query design, or provenance handling |
| `skills/system-prompts/SKILL.md` | Before writing or editing any agent system prompt |
| `skills/agent-design/SKILL.md` | When deciding tool definitions, loops, state, or fallback logic |
| `skills/api-efficiency/SKILL.md` | Before adding any Claude API call |

For focused subtasks, delegate to a sub-agent:

| Sub-agent | What it does |
|---|---|
| `prompt-author` | Drafts and refines system prompts for agents |
| `redpine-strategist` | Plans the optimal Redpine query strategy for a user question |

Invoke sub-agents with the `/agents` slash command in Claude Code.

## Stack

- **LLM brain**: Claude API (Sonnet 4.5 default, Opus 4.7 for the final synthesis if needed)
- **Grounding**: Redpine MCP at `https://api.redpine.ai/mcp` (key in `.env`)
- **Backend**: FastAPI single file (`app/main.py`), deploys to Railway
- **Frontend**: minimal HTML served from the same FastAPI app, sources panel on the right
- **Optional**: Modal only if we need GPU or async batch work (skip for v1)

## Build phases

1. **0:00 to 0:20** Setup. Clone, install, env vars, smoke test Redpine MCP via tools/list
2. **0:20 to 1:00** Vertical pick + system prompt draft via `prompt-author` sub-agent
3. **1:00 to 1:45** Backend agent loop + provenance pass through
4. **1:45 to 2:15** Frontend polish, sources panel, 3 demo queries hardcoded as fallback
5. **2:15 to 2:30** Dry run the demo twice, fix the worst friction point

## Hard rules

- Provenance is visible in the UI for every claim, no exceptions
- No Redpine call without first consulting `skills/redpine/SKILL.md`
- No system prompt edits without first consulting `skills/system-prompts/SKILL.md`
- Cap Redpine calls at 3 per user turn for v1
- Have a recorded fallback demo on disk in case wifi dies
