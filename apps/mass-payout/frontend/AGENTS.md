# AGENTS.md — Mass Payout Frontend

Admin panel for the Scheduler Payment Distribution service. React + **Chakra UI**.

## Quick Reference

```bash
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
