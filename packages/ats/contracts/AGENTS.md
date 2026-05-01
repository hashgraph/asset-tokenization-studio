# AGENTS.md — ATS Contracts

Solidity smart contracts for the Asset Tokenization Studio. Uses **Hardhat** + **ethers v6** + **Chai**.

## Quick Reference

All commands are exposed at the **monorepo root** with the `ats:contracts:*` / `ats:lint:*` prefix — see root `AGENTS.md` § Build & Development Commands:

```bash
npm run ats:contracts:compile          # Compile contracts
npm run ats:contracts:test             # All contract tests
npm run ats:contracts:test:parallel    # All tests in parallel
npm run ats:contracts:test:coverage    # Coverage
npm run ats:lint:sol                   # Solhint
```

Or from inside this package, run the unprefixed scripts:

```bash
cd packages/ats/contracts
npm run compile                                                         # Compile contracts
npm run test                                                            # All contract tests
npm run test -- test/contracts/integration/layer_1/hold/hold.test.ts    # Single test
npm run lint:sol                                                        # Solhint
npm run size                                                            # Contract sizes
```

## Architecture

**Diamond pattern (EIP-2535)** with facets in three layers:

| Layer | Purpose               | Facets                                                                                                                                                                                                                    |
| ----- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1    | Core token features   | accessControl, cap, ERC1400, ERC3643, freeze, hold, kyc, lock, pause, snapshot, nonce, clearing, controlList, corporateAction, ssi, totalBalance, externalPause, externalControlList, externalKycList, protectedPartition |
| L2    | Financial instruments | bond, equity, security, adjustBalance, interestRate, kpi, nominalValue, proceedRecipient, scheduledTask                                                                                                                   |
| L3    | Jurisdiction-specific | bondUSA, equityUSA, transferAndLock                                                                                                                                                                                       |

- `contracts/factory/` — Factory + factory proxy for deploying securities
- `contracts/domain/` — Storage structs and domain logic
- `contracts/infrastructure/` — Diamond proxy, resolver, upgradeability (TUP)

## Solidity Conventions

- Solidity `>=0.8.0 <0.9.0`
- Max line length: 120 chars
- Double quotes for strings
- `CONSTANT_NAME` for constants (SCREAMING_SNAKE_CASE)
- `_privateVar` leading underscore for private/internal state
- `functionName` mixedCase for functions
- OpenZeppelin v4.9.x for base contracts

## Testing Conventions

- Tests use `loadFixture` from `@nomicfoundation/hardhat-network-helpers`
- Ethers v6 patterns: `contract.target`, native `bigint`, `ethers.ZeroAddress`
- Event parsing: use `contract.interface.parseLog()` on `receipt.logs`
- Test organization mirrors facet structure in `test/contracts/integration/`
- Deployment script tests in `test/scripts/` (unit + integration)
- **`confirmations: 0`** for Hardhat and instant networks — anything higher hangs deploys for minutes
- **No magic strings or numbers in tests** — use the shared `@test` constants (`TEST_ADDRESSES`, `TEST_NETWORKS`, `TEST_CONFIG_IDS`, etc.). Don't introduce new hardcoded literals
- **Full-length hex strings** for `bytes32`, addresses, and tx hashes — no shorthand
- **Path aliases** (`@scripts/infrastructure`, `@contract-types`, `@test`) for cross-module imports; relative paths inside the same module — see root `AGENTS.md` § TypeScript Imports

## Domain Notes

### Bond — Coupon System

- A coupon schedule is auto-created during deployment when `firstCouponDate > 0` — `_setFixedCoupons` derives the schedule from `couponFrequency` × maturity.
- Adding a coupon manually after deployment uses `setCoupon` and requires the `CORPORATE_ACTION_ROLE`.
- Coupon facets live under `contracts/domain/asset/coupon/` and the `coupon` L2 facet.
