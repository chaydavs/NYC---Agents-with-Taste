# NYC Hackathon Kit | Quick Start

This is your Claude Code workspace for the Redpine hackathon. Drop it in your project root, open Claude Code, and you're armed.

## What's in here

```
.
├── CLAUDE.md                          # Master instructions for Claude Code
├── README.md                          # This file
├── .claude/
│   └── agents/
│       ├── prompt-author.md           # Drafts system prompts
│       └── redpine-strategist.md      # Plans Redpine query strategy
└── skills/
    ├── redpine/SKILL.md               # Efficient Redpine usage
    ├── system-prompts/SKILL.md        # Production grade prompt authoring
    ├── agent-design/SKILL.md          # When to add a loop, how to size tools
    └── api-efficiency/SKILL.md        # Model selection, caching, latency
```

## How to use

### 1. Drop it into a fresh project

```bash
cd ~/projects
cp -r /path/to/hackathon-kit nyc-hackathon
cd nyc-hackathon
git init
```

### 2. Open Claude Code

```bash
claude
```

The `CLAUDE.md` at the root will auto load. Claude now knows it's working in this project and which skills to consult for which kinds of tasks.

### 3. Add Redpine MCP to Claude Code

```bash
claude mcp add --transport http redpine https://api.redpine.ai/mcp
```

This wires Redpine in as a tool you can call from any Claude Code conversation. You'll need your API key (from app.redpine.ai) when prompted.

### 4. Use the sub-agents

In Claude Code, type:

```
/agents
```

You'll see `prompt-author` and `redpine-strategist` listed. Invoke them with natural language:

> "Use prompt-author to draft a system prompt for a Sunday brunch planning agent."

> "Use redpine-strategist to plan how to handle 'help me throw a vegan brunch for 8.'"

### 5. Build the actual agent

Once you have a system prompt (from `prompt-author`) and a Redpine call plan (from `redpine-strategist`), tell Claude Code:

> "Build a single file FastAPI app that exposes a /chat endpoint. It calls Claude Sonnet 4.5 with Redpine wired in as an MCP server. Stream the response. Extract sources from Redpine tool results. Use the system prompt from prompts/agent_system.txt. Serve a minimal HTML frontend from / with a chat box and a sources panel on the right."

Claude Code will read `skills/redpine/SKILL.md`, `skills/agent-design/SKILL.md`, and `skills/api-efficiency/SKILL.md` automatically because they're flagged as relevant in `CLAUDE.md`. You'll get a clean, production grade scaffold.

## The meta strategy

Most teams will spend the first hour fighting Lovable or wiring keys. You spent yours building a Claude Code workspace that has institutional knowledge of every key decision. At 1:30 PM when others start typing, you'll be 30 minutes ahead because:

1. Your prompts will be tighter (the `system-prompts` skill enforces structure)
2. Your Redpine usage will be deliberate (the `redpine-strategist` plans every call)
3. Your agent architecture will be sound (the `agent-design` skill catches bad patterns)
4. Your API spend will be deliberate (the `api-efficiency` skill makes model and cache choices explicit)

## What to do before 1pm

1. Clone this into your project directory
2. Sign up at app.redpine.ai, grab API key, put in `.env` as `REDPINE_API_KEY`
3. Run `claude mcp add --transport http redpine https://api.redpine.ai/mcp` to wire Redpine into Claude Code itself
4. Open Claude Code, type `/agents`, confirm `prompt-author` and `redpine-strategist` are listed
5. Test the kit: ask Claude "use prompt-author to draft a system prompt for a wedding planning agent" and see what comes back. If the output follows the five part spine, the kit is live.

You're set. See you at 4pm.
