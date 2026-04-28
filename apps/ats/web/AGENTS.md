# AGENTS.md — ATS Web (dApp)

React 18 dApp for managing tokenized assets on top of the ATS SDK. Built with **Vite** + **Chakra UI**.

## Quick Reference

```bash
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
- Wallet integrations: MetaMask, WalletConnect, Hedera-native via the SDK.
- Build memory: `NODE_OPTIONS='--max-old-space-size=8192'` if the build OOMs.
