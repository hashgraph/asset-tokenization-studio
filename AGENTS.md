# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

**Asset Tokenization Studio (ATS)** is a monorepo for designing, deploying, and operating tokenized financial assets (equities, bonds) on the **Hedera network**, plus a **Mass Payout** framework for batch payment distributions.

- **License:** Apache-2.0
- **Node.js:** v20.19.4+ (ATS), v24.0.0+ (Mass Payout backend)
- **npm:** v10.9.0+
- **Package manager:** npm workspaces (no pnpm/yarn)

## Monorepo Layout

```
packages/
  ats/
    contracts/    # Solidity smart contracts (Hardhat, diamond pattern, ERC-1400/ERC-3643)
    sdk/          # TypeScript SDK (Hexagonal Architecture, DDD, CQRS)
  mass-payout/
    contracts/    # Solidity payout contracts (Hardhat)
    sdk/          # TypeScript SDK for payout flows
  eslint-config/  # Shared ESLint config (@hashgraph/eslint-config)
apps/
  ats/web/        # React 18 dApp for asset management
  mass-payout/
    backend/      # NestJS + PostgreSQL API
    frontend/     # React + Chakra UI admin panel
  docs/           # Docusaurus documentation site
```

## Build & Development Commands

### Full Setup

```bash
npm run setup              # Install deps + build everything
npm run ats:setup           # ATS only (contracts + SDK + web)
npm run mass-payout:setup   # Mass Payout only
```

### Build

```bash
npm run ats:build                  # Build ATS contracts → SDK → web
npm run ats:contracts:build        # Contracts only (needs NODE_OPTIONS='--max-old-space-size=8192')
npm run ats:contracts:compile      # Solidity compilation only (hardhat compile)
npm run ats:sdk:build              # SDK only
npm run mass-payout:build          # Build all Mass Payout modules
```

### Run Dev Servers

```bash
npm run ats:web:dev                # ATS web app dev server
npm run mass-payout:frontend:dev   # Mass Payout frontend dev
npm run mass-payout:backend:dev    # Mass Payout backend (NestJS)
npm run ats:contracts:local:hardhat  # Local Hardhat node
```

### Lint & Format

```bash
npm run lint                # All linting (JS + Solidity)
npm run lint:fix            # Auto-fix all
npm run ats:lint:sol        # Solhint for ATS contracts
npm run format              # Prettier (all files)
npm run format:check        # Prettier check only
```

## Testing

### ATS Contracts (Hardhat + Chai)

```bash
# All contract tests
npm run ats:contracts:test

# Single test file
cd packages/ats/contracts && npx hardhat test test/contracts/integration/layer_1/hold/hold.test.ts

# Parallel execution
npm run ats:contracts:test:parallel

# Scripts tests (unit + integration)
npm run ats:contracts:test:scripts
npm run ats:contracts:test:scripts:unit
npm run ats:contracts:test:scripts:integration

# Coverage
npm run ats:contracts:test:coverage
```

### ATS SDK (Jest)

```bash
npm run ats:sdk:test
# Single test
cd packages/ats/sdk && npx jest path/to/test.ts
```

### ATS Web (Vitest/Jest)

```bash
npm run ats:web:test
```

### Mass Payout

```bash
npm run mass-payout:test
npm run mass-payout:contracts:test
npm run mass-payout:sdk:test
```

## Architecture

### Smart Contracts — Diamond Pattern (EIP-2535)

Contracts use the **Diamond pattern** with modular facets organized in layers:

- **Layer 1 (core):** accessControl, cap, clearing, controlList, corporateAction, ERC1400, ERC3643, freeze, hold, kyc, lock, nonce, pause, snapshot, ssi, totalBalance, externalPause, externalControlList, externalKycList, protectedPartition
- **Layer 2 (financial):** bond, equity, security, adjustBalance, interestRate, kpi, nominalValue, proceedRecipient, scheduledTask
- **Layer 3 (jurisdiction-specific):** bondUSA, equityUSA, transferAndLock

Key contracts:

- `contracts/factory/` — Factory contracts for deploying new security tokens
- `contracts/domain/` — Domain-specific logic and storage
- `contracts/infrastructure/` — Diamond proxy and resolver infrastructure

### SDK — Hexagonal Architecture

```
src/
  port/in/       # Input ports (API interfaces per domain: equity, bond, factory, role, kyc...)
  port/out/       # Output ports (external integrations)
  app/usecase/    # Use cases split into command/ and query/ (CQRS)
  app/service/    # Application services
  domain/context/ # Domain models and contexts
  core/           # Shared kernel
```

Uses **tsyringe** for dependency injection.

### Ethers v6

This project uses **ethers v6**. Key patterns:

- `contract.target` (not `contract.address`)
- Native `bigint` (not `BigNumber`)
- `ethers.ZeroAddress` / `ethers.ZeroHash` (not `ethers.constants.*`)
- `signer.signTypedData(...)` (not `_signTypedData`)

### Test Structure (Contracts)

```
test/
  contracts/
    integration/
      layer_1/    # Tests per facet (hold, lock, erc3643, freeze, etc.)
      layer_2/    # Bond, equity, scheduled tasks tests
      factory/    # Factory deployment tests
      resolver/   # BusinessLogicResolver tests
      resolverProxy/
  scripts/        # Deployment script tests (unit + integration)
  fixtures/       # Shared test fixtures
```

Tests use Hardhat's `loadFixture` for efficient state snapshotting.

## Deployment

```bash
# Deploy to local Hardhat node
npm run ats:contracts:deploy:local

# Deploy to Hedera networks
npm run ats:contracts:deploy:hedera:testnet
npm run ats:contracts:deploy:hedera:mainnet

# Upgrade existing deployment
npm run ats:contracts:upgrade:configs
npm run ats:contracts:upgrade:tup      # Transparent Upgradeable Proxy
```

Environment files: copy `.env.example` → `.env` in each package/app directory.

## Commit Conventions

- **Conventional Commits:** `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Scopes: `ats:contracts`, `ats:sdk`, `ats:web`, `mp:backend`, `mp:frontend`, `mp:contracts`, `mp:sdk`
- **DCO sign-off required:** `git commit --signoff -S -m "..."`
- **GPG signature required** for pushes
- **Changesets required** for package changes: `npm run changeset`

### Git Hooks (Husky)

- `pre-commit` — lint-staged
- `commit-msg` — commitlint + auto-adds DCO sign-off
- `pre-push` — blocks without DCO + GPG

## PR Guidelines

- Target the integration branch (**`develop`** or **`development`** depending on the active workflow), not `main`
- Changeset file required (bypass with labels: `no-changeset`, `docs-only`, `chore`, `hotfix`)
- CI runs tests only for changed modules

## AI Agent Integration

This project uses the [AGENTS.md](https://agents.md/) convention for agent context and the [Agent Skills](https://agentskills.io/) standard for shared automation.

### Structure

```
AGENTS.md                                 # Root context for any AI agent (this file)
CLAUDE.md                                 # Symlink → AGENTS.md (committed, for Claude Code)
GEMINI.md                                 # Symlink → AGENTS.md (committed, for Gemini CLI)
.agents/
  skills/                                 # Agent Skills (agentskills.io standard)
    <skill-name>/
      SKILL.md                            # Required: metadata + instructions
      scripts/                            # Optional: executable code
      references/                         # Optional: documentation
      assets/                             # Optional: templates, resources
packages/
  ats/contracts/AGENTS.md                 # ATS Solidity contracts (Diamond, ethers v6)
  ats/sdk/AGENTS.md                       # ATS TypeScript SDK (hexagonal, CQRS)
  eslint-config/AGENTS.md                 # Shared ESLint preset
  mass-payout/contracts/AGENTS.md         # Mass Payout Solidity contracts
  mass-payout/sdk/AGENTS.md               # Mass Payout TypeScript SDK
apps/
  ats/web/AGENTS.md                       # ATS dApp (React + Vite + Chakra UI)
  mass-payout/backend/AGENTS.md           # Mass Payout NestJS API (PostgreSQL)
  mass-payout/frontend/AGENTS.md          # Mass Payout admin panel (React + Chakra)
  docs/AGENTS.md                          # Docusaurus documentation site
```

Agent-specific workspaces (`.claude/`, `.gemini/`, …) are **local-only** (gitignored) — each agent generates them on session start. Only two committed concessions exist for cross-agent compatibility: `CLAUDE.md` and `GEMINI.md` at the repo root are kept as **symlinks to `AGENTS.md`**, so every agent reads the same source of truth without duplication.

### How It Works

1. **`AGENTS.md`** (root) is the single source of truth for project context — any agent reads it.
2. **Skills** live in `.agents/skills/<name>/SKILL.md` following the [Agent Skills spec](https://agentskills.io/specification). They are auto-discovered by most compatible agents (Gemini CLI, OpenAI Codex, Cursor, VS Code, GitHub Copilot, etc.).
3. **Package- and app-level `AGENTS.md`** provide context scoped to a specific module. Every workspace under `packages/` and `apps/` ships one — start there before reading the root file when working inside a single module.

### Agent Skills Format

Each skill is a directory under `.agents/skills/` containing a `SKILL.md` with YAML frontmatter:

```yaml
---
name: skill-name # Required. Lowercase a-z + hyphens. Must match directory name.
description: > # Required. What the skill does and when to use it.
  Describe exactly when this skill should trigger.
license: Apache-2.0 # Optional.
compatibility: "" # Optional. Environment requirements.
metadata: # Optional. Arbitrary key-value pairs.
  author: example-org
  version: "1.0"
---
# Skill Instructions

Step-by-step instructions for the agent...
```

**Rules:**

- `name`: 1-64 chars, lowercase `a-z` + hyphens, no leading/trailing/consecutive hyphens, must match directory name
- `description`: 1-1024 chars, should include keywords that help agents identify relevant tasks
- Keep `SKILL.md` under 500 lines — move detailed content to `references/` files
- Progressive disclosure: agents load metadata at startup, full instructions only when activated

### Agent Setup on Init

When starting a session, each agent must self-configure based on its own requirements:

**Claude Code** — Reads `CLAUDE.md` (shipped as a symlink to `AGENTS.md`) for project context. Skills must additionally be symlinked into the local-only `.claude/commands/` directory for slash command support:

```bash
mkdir -p .claude/commands
for skill in .agents/skills/*/SKILL.md; do
  name="$(basename "$(dirname "$skill")")"
  ln -sf "../../.agents/skills/$name/SKILL.md" ".claude/commands/$name.md"
done
```

**Gemini CLI** — Reads `GEMINI.md` for foundational mandates. The repo ships `GEMINI.md` as a symlink to `AGENTS.md` so the contexts cannot drift.

**OpenAI Codex / Cursor / VS Code / Others** — No setup needed. These agents discover `.agents/skills/` natively.

## Technical Standards & Conventions

### Smart Contracts (Diamond Pattern)

- **Solidity:** `^0.8.0`, max 120 chars/line, `SCREAMING_SNAKE_CASE` for constants, `_privateVar` for internal state.
- **Ethers v6:** Use `contract.target` (not `.address`), `bigint` (not `BigNumber`), `ethers.ZeroAddress`, `ethers.ZeroHash`, and `signer.signTypedData(...)`.

### SDK (Hexagonal Architecture)

- **DI:** `tsyringe` (`reflect-metadata` required).
- **CQRS:** Commands for writes, Queries for reads.

### Git & Commits

- **Conventional Commits:** `<type>(<scope>): <subject>`.
- **DCO Sign-off:** Every commit **MUST** include `Signed-off-by` (`git commit --signoff`).
- **GPG Signature:** Every commit **MUST** be GPG-signed (`git commit -S`).

### Available Skills

- `update-docs` — Update project documentation based on recent commits
- `solidity-natspec` — Produce and validate audit-ready NatSpec on `.sol` files. Auto-triggers when any contract under `packages/ats/contracts/**` is created or modified, or on explicit request (`/solidity-natspec [path]`) for a full pass

### Notes

- When running contract tests, always compile first if `artifacts/` is missing
- Use `NODE_OPTIONS='--max-old-space-size=8192'` for contract compilation and web builds
- The SDK requires `NODE_OPTIONS=--max-old-space-size=16384` for test runs
- Ethers v6 is used throughout — never use v5 patterns (`BigNumber`, `contract.address`, `_signTypedData`)
- Commits require DCO sign-off (`--signoff`) and GPG signature (`-S`). Do not skip hooks with `--no-verify`
