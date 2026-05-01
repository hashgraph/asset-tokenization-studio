# AGENTS.md — Mass Payout Frontend

Admin panel for the Scheduler Payment Distribution service. React + **Chakra UI**.

## Quick Reference

All commands are exposed at the **monorepo root** with the `mass-payout:frontend:*` prefix — see root `AGENTS.md` § Build & Development Commands:

```bash
npm run mass-payout:frontend:dev      # Dev server
npm run mass-payout:frontend:build    # Production build
npm run mass-payout:frontend:test     # Tests
npm run mass-payout:lint              # ESLint (workspace-wide)
npm run mass-payout:format            # Prettier (workspace-wide)
```

Or from inside this package, run the unprefixed scripts:

```bash
cd apps/mass-payout/frontend
npm run dev        # Dev server
npm run build      # Production build
npm run test       # Tests
npm run lint       # ESLint
npm run format     # Prettier
```

## Scope

- UI for operators to schedule, monitor, and audit payout runs.
- Talks to `apps/mass-payout/backend` over HTTP; does not call contracts directly.

## Conventions

- React + TypeScript + Chakra UI, mirroring `apps/ats/web` styling stack.
- i18n via i18next (locale files under `src/locales/` if/when added).
