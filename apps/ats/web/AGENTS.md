# AGENTS.md — ATS Web (dApp)

React 18 dApp for managing tokenized assets on top of the ATS SDK. Built with **Vite** + **Chakra UI**.

## Quick Reference

All commands are exposed at the **monorepo root** with the `ats:web:*` prefix — see root `AGENTS.md` § Build & Development Commands:

```bash
npm run ats:web:dev        # Dev server (Vite)
npm run ats:web:build      # Production build
npm run ats:web:test       # Vitest / Jest tests
npm run ats:lint           # ESLint (workspace-wide)
npm run ats:format         # Prettier (workspace-wide)
```

Or from inside this package, run the unprefixed scripts:

```bash
cd apps/ats/web
npm run dev        # Dev server (Vite)
npm run build      # Production build
npm run test       # Vitest / Jest tests
npm run lint       # ESLint
npm run format     # Prettier
```

## Scope

- End-user UI for issuers, custodians, and operators interacting with ATS securities.
- Consumes `@hashgraph/asset-tokenization-sdk` (workspace) for all on-chain logic.

## Conventions

- React 18 + TypeScript, Chakra UI for styling, i18next for i18n.
- **State management:** Zustand (no Redux).
- **Routing:** React Router v6.
- **Tests:** Jest + React Testing Library + snapshot suite. Use `npm run ats:web:test:update` to refresh snapshots after intentional UI changes.
- **Imports:** absolute paths via `tsconfig.json` `paths` aliases — no `../../../` chains. See root `AGENTS.md` § TypeScript Imports.
- Wallet integrations: MetaMask, WalletConnect, Hedera-native via the SDK.
- Build memory: `NODE_OPTIONS='--max-old-space-size=8192'` if the build OOMs.
