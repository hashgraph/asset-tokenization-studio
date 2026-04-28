# AGENTS.md — Mass Payout Contracts

Solidity contracts for the **Scheduler Payment Distribution** flow. Uses **Hardhat** + **ethers v6**.

## Quick Reference

```bash
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
