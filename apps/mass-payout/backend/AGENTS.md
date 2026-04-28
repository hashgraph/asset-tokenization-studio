# AGENTS.md — Mass Payout Backend

NestJS API backing the Scheduler Payment Distribution flow. Persists state in **PostgreSQL** via TypeORM.

## Quick Reference

```bash
npm run start      # Run in production mode
npm run start:dev  # Watch mode
npm run build      # Build NestJS app
npm run test       # Jest tests
npm run lint       # ESLint
npm run format     # Prettier
```

## Scope

- Orchestrates batch payouts, exposes REST/HTTP endpoints, and persists schedules and runs.
- Consumes `@hashgraph/mass-payout-sdk` (workspace) to interact with the on-chain contracts.

## Conventions

- NestJS modules + TypeORM entities. Migrations live alongside the app — do not edit the DB schema by hand.
- Requires Node v24.0.0+ (per root `AGENTS.md`).
- Copy `.env.example` → `.env` for local runs.
