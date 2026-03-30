---
id: ai-agent-integration
title: AI Agent Integration
sidebar_label: AI Agent Integration
---

# AI Agent Integration

This project uses two open standards to provide consistent context and automation to AI coding agents:

- **[AGENTS.md](https://agents.md/)** — A standard file for giving AI agents project context (build commands, architecture, conventions)
- **[Agent Skills](https://agentskills.io/)** — A standard format for reusable agent capabilities (`SKILL.md` files)

These standards are supported by Claude Code, Gemini CLI, OpenAI Codex, Cursor, VS Code, GitHub Copilot, and many others.

## Directory Structure

```
AGENTS.md                         # Root context — any AI agent reads this
.agents/
  skills/                         # Agent Skills (agentskills.io standard)
    update-docs/
      SKILL.md                    # Skill definition with YAML frontmatter
packages/
  ats/contracts/AGENTS.md         # Package-scoped context
  ats/sdk/AGENTS.md               # Package-scoped context
```

No agent-specific directories (`.claude/`, `.gemini/`, etc.) are committed. Each agent reads `AGENTS.md` and self-configures on session start.

## How It Works

### 1. Context Files (`AGENTS.md`)

The root `AGENTS.md` contains everything an agent needs to understand the project:

- Monorepo layout and package relationships
- Build, test, lint, and deploy commands
- Architecture overview (diamond pattern, hexagonal SDK, CQRS)
- Coding conventions (ethers v6, commit format, etc.)

Package-level `AGENTS.md` files (e.g., `packages/ats/contracts/AGENTS.md`) provide additional context scoped to that package.

### 2. Skills (`.agents/skills/`)

Skills follow the [Agent Skills specification](https://agentskills.io/specification). Each skill is a directory with a `SKILL.md` file containing YAML frontmatter:

```yaml
---
name: skill-name
description: What this skill does and when to use it.
---
```

Required fields: `name` (lowercase, hyphens only, must match directory name) and `description`.

Skills in `.agents/skills/` are **auto-discovered** by most compatible agents — no manual configuration needed.

**Current skills:**

| Skill         | Description                                          |
| ------------- | ---------------------------------------------------- |
| `update-docs` | Update project documentation based on recent commits |

### 3. Agent Self-Configuration

Each agent reads `AGENTS.md` on session start and configures itself:

| Agent             | `.agents/skills/` discovery | Extra setup needed                                |
| ----------------- | --------------------------- | ------------------------------------------------- |
| Gemini CLI        | Native                      | None                                              |
| OpenAI Codex      | Native                      | None                                              |
| Cursor            | Native                      | None                                              |
| VS Code (Copilot) | Native                      | None                                              |
| GitHub Copilot    | Native                      | None                                              |
| Claude Code       | Not native                  | Symlinks to `.claude/commands/` (created on init) |

For Claude Code, the `AGENTS.md` includes init instructions to create the required symlinks automatically.

## Adding a New Skill

1. Create the skill directory:

```
.agents/skills/my-skill/
  SKILL.md
```

2. Write `SKILL.md` following the [spec](https://agentskills.io/specification):

```markdown
---
name: my-skill
description: What this skill does and when to use it.
---

# My Skill

Instructions for the agent...
```

3. Compatible agents will discover it automatically on next session start.

## Adding a New Agent

No repo changes needed. If the agent supports AGENTS.md or Agent Skills, it works out of the box. If the agent needs specific config (like Claude's symlinks), add setup instructions to the "Agent Setup on Init" section in `AGENTS.md`.

## Best Practices

- **Keep `AGENTS.md` as the single source of truth** — No duplication across agent-specific files
- **Follow the [Agent Skills spec](https://agentskills.io/specification)** — Use proper `name` and `description` frontmatter
- **No agent-specific directories in the repo** — Agents self-configure at runtime
- **Package-level `AGENTS.md`** — Only add when the package has specific conventions that differ from the root
