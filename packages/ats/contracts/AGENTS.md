# AGENTS.md — ATS Contracts

Solidity smart contracts for the Asset Tokenization Studio. Uses **Hardhat** + **ethers v6** + **Chai**.

## Quick Reference

```bash
npx hardhat compile                                    # Compile contracts
npx hardhat test test/contracts/integration/layer_1/hold/hold.test.ts  # Single test
npx hardhat test --parallel                            # All tests in parallel
npx hardhat coverage --testfiles 'test/contracts/integration/layer_1/**/*.ts'  # Coverage
npm run lint:sol                                       # Solhint
npm run size                                           # Contract sizes
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
