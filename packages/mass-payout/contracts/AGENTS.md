# AGENTS.md — Mass Payout Contracts

Solidity contracts for the **Scheduler Payment Distribution** flow. Uses **Hardhat** + **ethers v6**.

## Quick Reference

All commands are exposed at the **monorepo root** with the `mass-payout:contracts:*` prefix — see root `AGENTS.md` § Build & Development Commands:

```bash
npm run mass-payout:contracts:build      # Compile contracts
npm run mass-payout:contracts:test       # Hardhat tests
npm run mass-payout:contracts:compile    # Solidity compilation only
npm run mass-payout:lint                 # Solhint (workspace-wide)
npm run mass-payout:format               # Prettier (workspace-wide)
```

Or from inside this package, run the unprefixed scripts:

```bash
cd packages/mass-payout/contracts
npm run build      # Compile contracts
npm run test       # Hardhat tests
npm run lint       # Solhint
npm run format     # Prettier
```

## Scope

- Batch payment distribution contracts orchestrated by the Mass Payout SDK / backend.
- Independent from ATS contracts — no diamond facets here, simpler standalone contracts.

## Conventions

- Solidity `>=0.8.0 <0.9.0`, ethers v6 patterns (`contract.target`, `bigint`, `ethers.ZeroAddress`).
- Same NatSpec house style as ATS: see the root `solidity-natspec` skill.
