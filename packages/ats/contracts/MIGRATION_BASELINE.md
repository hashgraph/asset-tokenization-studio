# Library-Based Diamond Migration — Baseline Metrics

## Table of Contents

- [Capture Date](#capture-date)
- [Build & Compile Times](#build--compile-times)
- [Test Results](#test-results)
- [Codebase Metrics](#codebase-metrics)
- [Architecture Metrics](#architecture-metrics)
- [Contract Bytecode Sizes (Top Facets)](#contract-bytecode-sizes-top-facets)
- [Post-Migration Metrics](#post-migration-metrics)

## Capture Date

**Baseline captured**: 2026-02-10
**Branch**: `spike/lib-based-diamond-version`
**Package version**: 4.1.0

## Build & Compile Times

| Metric                                                        | Time       | Notes                                              |
| ------------------------------------------------------------- | ---------- | -------------------------------------------------- |
| Clean compile (`npx hardhat compile`)                         | **2m 11s** | From scratch (cache/artifacts/typechain deleted)   |
| Full clean build (`npm run build`)                            | **3m 00s** | Includes compile + typechain + registry generation |
| Contract tests (`npx hardhat test`)                           | **1m 42s** | 1257 tests passing                                 |
| Script unit tests (`npm run test:scripts:unit`)               | **12.8s**  | 907 tests passing                                  |
| Script integration tests (`npm run test:scripts:integration`) | **59.5s**  | 284 tests passing                                  |

## Test Results

| Suite                      | Tests     | Status          |
| -------------------------- | --------- | --------------- |
| Contract integration tests | 1,257     | All passing     |
| Script unit tests          | 907       | All passing     |
| Script integration tests   | 284       | All passing     |
| **Total**                  | **2,448** | **All passing** |

## Codebase Metrics

| Metric                      | Value                                |
| --------------------------- | ------------------------------------ |
| Total Solidity LOC          | **34,297**                           |
| Facet contracts             | **193**                              |
| StorageWrapper files        | **57**                               |
| Common chain files          | **4** (1 standard + 3 bond variants) |
| Test files                  | **84**                               |
| Solidity artifacts compiled | **791**                              |

## Architecture Metrics

| Component                  | Lines       | Purpose                                      |
| -------------------------- | ----------- | -------------------------------------------- |
| `Internals.sol`            | **1,456**   | Abstract contract with 543 virtual functions |
| `Modifiers.sol`            | **111**     | 46 virtual modifiers                         |
| StorageWrappers (57 files) | ~3,500 est. | Linear chain to avoid circular inheritance   |
| Common chain (4 files)     | ~800 est.   | Variant-specific bridge contracts            |

## Contract Bytecode Sizes (Top Facets)

Largest facets by deployed bytecode (KiB). Measured from `reference-contracts/` artifacts compiled with Solidity 0.8.28, cancun EVM, optimizer runs=100.

| Facet                             | Deploy Size | Runtime Size |
| --------------------------------- | ----------- | ------------ |
| ERC1410ManagementFacet            | 20.963      | 20.990       |
| ClearingActionsFacet              | 20.597      | 20.624       |
| ERC1594Facet                      | 20.105      | 20.133       |
| ERC20Facet                        | 19.407      | 19.435       |
| HoldTokenHolderFacet              | 18.654      | 18.682       |
| ERC3643BatchFacet                 | 18.137      | 18.164       |
| ERC1410TokenHolderFacet           | 17.618      | 17.646       |
| EquityUSAFacet                    | 17.598      | 17.625       |
| ERC3643ManagementFacet            | 17.086      | 17.113       |
| BondUSAKpiLinkedRateFacet         | 16.918      | 16.945       |
| BondUSASustainabilityPTRFacet     | 16.918      | 16.945       |
| BondUSAFixedRateFacet             | 16.878      | 16.905       |
| BondUSAFacet (standard)           | 16.688      | 16.716       |
| BondUSAReadKpiLinkedRateFacet     | 13.731      | 13.759       |
| BondUSAReadSustainabilityPTRFacet | 13.167      | 13.194       |
| TransferAndLockFacet              | 13.062      | 13.089       |
| BondUSAReadFacet                  | 10.928      | 10.955       |
| TREXFactoryAts                    | 6.044       | 6.365        |
| AccessControlFacet                | 5.063       | 5.091        |

**24KB limit**: No facets exceed the EIP-170 contract size limit.

> **Note (2026-02-23)**: This table was corrected to use Solidity 0.8.28/cancun values (matching the current project compiler). The original baseline (2026-02-10) used Solidity 0.8.17/london, which produced misleadingly smaller sizes for facets with deep inheritance chains (e.g., ERC1594: 7.654 KiB at 0.8.17 vs 20.105 KiB at 0.8.28, same source code). The corrected values enable accurate comparison with post-migration measurements.

---

## Post-Migration Metrics

**Captured**: 2026-02-16

| Metric                 | Before | After         | Delta          |
| ---------------------- | ------ | ------------- | -------------- |
| Clean compile time     | 2m 11s | 1m 23s        | -37%           |
| Contract test time     | 1m 42s | 1m 17s        | -25%           |
| Total Solidity LOC     | 34,297 | 44,621        | +10,324 (+30%) |
| Total Solidity files   | 777    | 724           | -53            |
| Facet count            | 193    | 193           | 0 (unchanged)  |
| StorageWrapper files   | 57     | 57 (still)    | 0 (blocked)    |
| Internals.sol lines    | 1,456  | 1,456 (still) | 0 (blocked)    |
| Modifiers.sol lines    | 111    | 111 (still)   | 0 (blocked)    |
| Library files (new)    | 0      | 36            | +36            |
| FacetBase files (new)  | 0      | 48            | +48            |
| Old abstract contracts | ~70    | 4 remaining   | -66 deleted    |
| Compiled artifacts     | 791    | 815           | +24            |
| Library code LOC       | 0      | 8,579         | +8,579         |
| Tests passing          | 2,448  | 2,448         | 0 (unchanged)  |

### Notes

- **LOC increase**: Expected — libraries add new code while old StorageWrapper chain (still present) has not yet been removed. Net LOC will decrease significantly once the StorageWrapper chain + Internals.sol + Modifiers.sol are deleted (~5,900 lines).
- **Compile time improvement**: 37% faster despite more files, due to libraries having simpler dependency graphs than deep inheritance chains.
- **StorageWrapper chain still present**: Blocked by `DiamondCutManager.sol` and `ResolverProxyUnstructured.sol` which still inherit from the old pattern.
- **4 old abstracts remaining**: `AccessControl.sol`, `Pause.sol` (blocked by DiamondCutManager), `Freeze.sol`, and factory-related contracts.
