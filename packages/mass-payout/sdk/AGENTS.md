# AGENTS.md — Mass Payout SDK

TypeScript SDK that drives the Scheduler Payment Distribution contracts.

## Quick Reference

```bash
npm run build      # Build the SDK
npm run test       # Jest tests
npm run lint       # ESLint
npm run format     # Prettier
```

## Scope

- Wraps the Mass Payout contracts with high-level use cases (schedule payouts, batch distribution).
- Consumed by `apps/mass-payout/backend` and `apps/mass-payout/frontend`.

## Conventions

- Ethers v6 only (no `BigNumber`, `_signTypedData`, `contract.address`).
- Workspace dependency on `@hashgraph/mass-payout-contracts` for typed contract bindings.
