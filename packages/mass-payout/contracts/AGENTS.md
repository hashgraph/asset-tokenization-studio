# Mass Payout Contracts - Knowledge Base

**Scope**: `packages/mass-payout/contracts` (Solidity payout contracts)

## OVERVIEW

Upgradeable proxy contracts for batch payment distribution on Hedera. HBAR + HTS token support, lifecycle cash flow management.

## STRUCTURE

```
contracts/
├── interfaces/         # Payout interfaces (IPayout, ILifecycle)
├── payout/             # Core payout logic (batch operations)
├── lifecycle/          # Cash flow management (scheduled payments)
├── proxy/              # Upgradeable proxy patterns
└── test/               # Unit + integration tests
```

## WHERE TO LOOK

| Task             | Location      | Notes                    |
| ---------------- | ------------- | ------------------------ |
| Add payout logic | `payout/`     | Batch operations         |
| Lifecycle flow   | `lifecycle/`  | Scheduled payments       |
| Upgrade proxy    | `proxy/`      | UUPS pattern             |
| Interfaces       | `interfaces/` | Contract ABI definitions |
| Tests            | `test/`       | Hardhat + chai           |

## CONVENTIONS

**Solidity**: 0.8.18, OpenZeppelin upgradeable patterns, UUPS proxies.

**Gas Optimization**: Batch operations, unchecked blocks, assembly where safe.

**Testing**: Hardhat chai matchers, fork tests for mainnet simulation.

**Naming**: `IPayout` interfaces, `Payout` implementations, `Proxy` for upgradeability.

## ANTI-PATTERNS

- **NEVER** use non-upgradeable proxies - always UUPS or Transparent
- **DO NOT** hardcode token addresses - use factory pattern
- **NEVER** skip initialization in proxy - use initializer pattern
- **DO NOT** use `selfdestruct` - breaks upgradeability
- **NEVER** store logic in proxy - delegate to implementation

## UNIQUE STYLES

**Batch Pattern**: `batchTransfer`, `batchPayout` for gas-efficient operations.

**Lifecycle Cash Flow**: Snapshot → record date → execution date pattern.

**Proxy Factory**: Single factory deploys + initializes proxies.

## COMMANDS

```bash
# Build
npm run mass-payout:contracts:build    # Compile + TypeChain
npm run compile                        # Hardhat compile

# Test
npm run mass-payout:contracts:test     # All tests
npm run test:ci                        # CI test run
npm run test:coverage                  # Coverage report

# Analysis
npm run slither                        # Security analysis
npm run size                           # Contract size
```

## NOTES

**Hardhat**: Shared config with ATS contracts (workspace link).

**OpenZeppelin**: `@openzeppelin/contracts-upgradeable` for proxy patterns.

**TypeChain**: Generated in `build/typechain-types/` - regenerate on compile.

**Gas Reporter**: Output in `gasReporterOutput.json` - exclude from commits.

**Solhint**: Shared config with ATS (`solhint.config.js` at root).
