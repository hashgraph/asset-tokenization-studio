# AGENTS.md — Mass Payout Backend

NestJS API backing the Scheduler Payment Distribution flow. Persists state in **PostgreSQL** via TypeORM.

## Quick Reference

All commands are exposed at the **monorepo root** with the `mass-payout:backend:*` prefix — see root `AGENTS.md` § Build & Development Commands:

```bash
npm run mass-payout:backend:build    # Build NestJS app
npm run mass-payout:backend:test     # Jest tests
npm run mass-payout:lint             # ESLint (workspace-wide)
npm run mass-payout:format           # Prettier (workspace-wide)
```

Or from inside this package, run the unprefixed scripts (includes dev-only `start:dev` watch mode):

```bash
cd apps/mass-payout/backend
npm run start          # Run in production mode
npm run start:dev      # Watch mode (dev-only)
npm run build          # Build NestJS app
npm run test           # Jest tests
npm run lint           # ESLint
npm run format         # Prettier
```

## Scope

- Orchestrates batch payouts, exposes REST/HTTP endpoints, and persists schedules and runs.
- Consumes `@hashgraph/mass-payout-sdk` (workspace) to interact with the on-chain contracts.

## Conventions

- NestJS modules + TypeORM entities. Migrations live alongside the app — do not edit the DB schema by hand.
- Requires Node v24.0.0+ (per root `AGENTS.md`).
- Copy `.env.example` → `.env` for local runs.
