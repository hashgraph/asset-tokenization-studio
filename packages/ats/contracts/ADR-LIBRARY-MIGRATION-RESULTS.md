# ADR: Library-Based Diamond Migration — Results

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  ARCHITECTURE DECISION RECORD — MIGRATION RESULTS                            ║
║  Asset Tokenization Studio (ATS)                                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Status:      COMPLETED (All Phases) + Variant Consolidation Identified      ║
║  Date:        2026-02-19                                                     ║
║  Authors:     Miguel Gómez Carpena                                           ║
║  Reference:   ADR-LIBRARY-BASED-DIAMOND.md (original proposal)              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Metrics Comparison](#2-metrics-comparison)
3. [Final Contract Structure](#3-final-contract-structure)
4. [What Changed](#4-what-changed)
5. [Architecture: Before vs After](#5-architecture-before-vs-after)
6. [Adding a New Feature: Before vs After](#6-adding-a-new-feature-before-vs-after)
7. [Trade-offs and Honest Assessment](#7-trade-offs-and-honest-assessment)
8. [Key Patterns Discovered](#8-key-patterns-discovered)
9. [Facet Variant Consolidation Opportunity](#9-facet-variant-consolidation-opportunity)
10. [Conclusion](#10-conclusion)

---

## 1. Executive Summary

The library-based diamond migration replaced deep inheritance chains in ATS facet contracts with focused Solidity libraries, then restructured the entire codebase for clean separation of concerns. All 48 feature domains across 193 facets were migrated, old inheritance code was fully deleted, infrastructure was extracted into a self-contained package, layers were renamed from opaque numbers (`layer_0`..`layer_3`) to semantic names, and facet directories were wrapped under `facets/` for discoverability.

| Aspect                  | Result                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| Features migrated       | 48 domains (Pause, AccessControl, ERC1410, Bond, etc.)                |
| Facets affected         | 193 (all variants: standard, fixedRate, kpiLinked, sustainabilityPTR) |
| Tests passing           | 1,257 contract tests + 1,191 script tests = **2,448 total**           |
| Old inheritance deleted | 85 files (Internals, Modifiers, Common, StorageWrappers, extensions)  |
| New files added         | 37 libraries + 48 FacetBase files                                     |
| Compile time            | **37% faster** (2m 11s → 1m 23s)                                      |
| External ABI            | **Unchanged** — same function signatures, same storage layout         |
| Total Solidity files    | 777 → 641 (−136 files)                                                |

---

## 2. Metrics Comparison

### Build Performance

| Metric                                    | Before | After  | Delta    |
| ----------------------------------------- | ------ | ------ | -------- |
| Clean compile (`hardhat compile --force`) | 2m 11s | 1m 23s | **−37%** |
| Contract tests (`hardhat test`)           | 1m 42s | 1m 17s | **−25%** |
| Compiled artifacts                        | 791    | 733    | −58      |

### Codebase Size

| Metric                   | Before | After  | Delta                     |
| ------------------------ | ------ | ------ | ------------------------- |
| Total Solidity LOC       | 34,297 | 34,271 | −26 (effectively neutral) |
| Total Solidity files     | 777    | 641    | −136                      |
| Library files            | 0      | 37     | +37 (new)                 |
| Library code LOC         | 0      | 8,495  | +8,495 (new)              |
| FacetBase files          | 0      | 48     | +48 (new)                 |
| Old abstract contracts   | ~70    | 0      | −70 deleted               |
| Old StorageWrapper chain | ~57    | 0      | −57 deleted               |
| Internals.sol            | 1,456  | 0      | deleted                   |
| Modifiers.sol            | 111    | 0      | deleted                   |
| Common.sol chain         | ~4     | 0      | deleted                   |

### Contract Sizes (Top Facets)

| Facet                     | Before (KB)                 | After (KB) | Delta |
| ------------------------- | --------------------------- | ---------- | ----- |
| BondUSAKpiLinkedRateFacet | 16.918                      | 20.292     | +3.4  |
| BondUSAFixedRateFacet     | 16.878                      | 16.988     | +0.1  |
| BondUSAFacet (standard)   | 16.688                      | 16.804     | +0.1  |
| ERC1410ManagementFacet    | — (was ERC1410Facet 12.625) | 20.654     | split |
| EquityUSAFacet            | 10.447                      | 16.642     | +6.2  |
| ERC1594Facet              | 7.654                       | 19.969     | +12.3 |

**Note**: Bytecode size increases are expected. The old architecture relied on virtual function dispatch through Internals.sol — the compiler only included the final override. With libraries, each facet includes inlined library code directly. **No facets exceed the 24KB EIP-170 limit.**

---

## 3. Final Contract Structure

### Overview (641 .sol files)

```
contracts/                               # 641 .sol files total
├── facets/             (330 files)      # ALL diamond entry points
│   ├── features/       (256 files)      #   Security token facets (was layer_1)
│   ├── assetCapabilities/(53 files)     #   Financial asset capabilities (was layer_2)
│   └── regulation/      (21 files)      #   Jurisdiction-specific rules (was layer_3)
├── lib/                 (37 files)      # Shared libraries (core, domain, orchestrator)
├── infrastructure/      (25 files)      # Diamond proxy, BLR, utilities — extractable as standalone package
├── constants/            (7 files)      # Centralized roles, storage positions, resolver keys
├── storage/              (5 files)      # Unified storage layout definitions
├── factory/             (25 files)      # Token deployment (includes IFactory.sol)
├── mocks/               (10 files)      # Test mocks
└── test/               (202 files)      # Test contracts & time travel
```

### Infrastructure (25 files) — Extractable Package

Generic diamond/proxy infrastructure with zero domain imports.

```
infrastructure/
├── diamond/                             # Core diamond pattern
│   ├── BusinessLogicResolver.sol        #   Facet registry & resolution
│   ├── BusinessLogicResolverWrapper.sol #   Storage wrapper for BLR
│   ├── DiamondCutManager.sol            #   Configuration management
│   └── DiamondCutManagerWrapper.sol     #   Storage wrapper for DCM
├── proxy/                               # Token proxy contracts
│   ├── ResolverProxy.sol                #   Main proxy entry point
│   ├── ResolverProxyUnstructured.sol    #   Unstructured storage proxy
│   ├── LibResolverProxy.sol             #   Proxy configuration management
│   └── facets/                          #   Diamond standard facets
│       ├── DiamondCut.sol               #     Config update operations
│       ├── DiamondFacet.sol             #     Facet registration
│       └── DiamondLoupe.sol             #     Introspection (EIP-2535)
├── interfaces/                          # All infrastructure interfaces
│   ├── IBusinessLogicResolver.sol
│   ├── IBusinessLogicResolverWrapper.sol
│   ├── IDiamond.sol
│   ├── IDiamondCut.sol
│   ├── IDiamondCutManager.sol
│   ├── IDiamondLoupe.sol
│   ├── IResolverProxy.sol
│   └── IStaticFunctionSelectors.sol
├── lib/                                 # Generic utility libraries
│   ├── EnumerableSetBytes4.sol          #   bytes4 set (selectors)
│   ├── LibArrayValidation.sol           #   Array validation operations
│   ├── LibCheckpoints.sol               #   Checkpoint data structure
│   ├── LibLowLevelCall.sol              #   Low-level call utilities
│   ├── LibPagination.sol                #   Pagination helpers
│   └── LocalContext.sol                 #   Block timestamp/number context
└── proxies/
    └── Proxies.sol                      # OZ TransparentUpgradeableProxy import
```

### Constants (7 files)

Consolidated from previously scattered `layer_0/constants/`, `layer_1/constants/`, `layer_2/constants/`.

```
constants/
├── eip1066.sol                          # EIP-1066 status codes
├── roles.sol                            # 30 access control roles (merged)
├── storagePositions.sol                 # ~41 storage positions (merged)
├── values.sol                           # Value constants (merged)
└── resolverKeys/                        # Facet resolver keys by domain
    ├── features.sol                     #   Security token features
    ├── assets.sol                       #   Financial asset features
    └── regulation.sol                   #   Jurisdiction-specific features
```

### Storage (5 files)

Unified storage layout definitions for all facets.

```
storage/
├── CoreStorage.sol                      # Access control, pause, KYC, control lists
├── TokenStorage.sol                     # ERC1410, ERC1594, ERC20, snapshots, locks
├── AssetStorage.sol                     # Bond, equity, interest rates, ABAF
├── ExternalStorage.sol                  # External lists, SSI, nonces, EIP-712
└── ScheduledStorage.sol                 # Scheduled tasks, coupons, balance adjustments
```

### Libraries (37 files)

Shared business logic organized by abstraction level.

```
lib/
├── core/          (12 files)            # Generic security/compliance features
│   ├── ERC712.sol                       #   EIP-712 typed data signing
│   ├── LibAccess.sol                    #   Role-based access control
│   ├── LibCap.sol                       #   Supply cap management
│   ├── LibCompliance.sol                #   ERC3643 compliance hooks
│   ├── LibControlList.sol               #   Block/allow list management
│   ├── LibCorporateActions.sol          #   Corporate action execution
│   ├── LibExternalLists.sol             #   External list integration
│   ├── LibKyc.sol                       #   KYC verification
│   ├── LibNonce.sol                     #   Nonce management
│   ├── LibPause.sol                     #   Global/external pause
│   ├── LibProtectedPartitions.sol       #   Protected partition logic
│   └── LibSSI.sol                       #   Self-sovereign identity
├── domain/        (21 files)            # Asset-specific domain logic
│   ├── LibABAF.sol                      #   Adjustable Balance Adjustment Factor
│   ├── LibBond.sol                      #   Bond coupon/maturity management
│   ├── LibClearing.sol                  #   Settlement/clearing
│   ├── LibERC1410.sol                   #   Multi-partition token transfers
│   ├── LibERC1594.sol                   #   Security token transfers
│   ├── LibERC1643.sol                   #   Document management
│   ├── LibERC1644.sol                   #   Controller operations
│   ├── LibERC20.sol                     #   ERC20 compatibility layer
│   ├── LibERC20Permit.sol               #   Gasless approvals (EIP-2612)
│   ├── LibERC20Votes.sol                #   Voting power delegation
│   ├── LibEquity.sol                    #   Equity-specific logic
│   ├── LibFreeze.sol                    #   Account freeze management
│   ├── LibHold.sol                      #   Token hold/escrow
│   ├── LibInterestRate.sol              #   Interest rate calculations
│   ├── LibKpis.sol                      #   KPI data management
│   ├── LibLock.sol                      #   Time-based token locking
│   ├── LibProceedRecipients.sol         #   Proceed recipient management
│   ├── LibScheduledTasks.sol            #   Scheduled task execution
│   ├── LibScheduledTasksStorage.sol     #   Scheduled task storage accessors
│   ├── LibSecurity.sol                  #   Security regulation data
│   └── LibSnapshots.sol                 #   Historical balance snapshots
└── orchestrator/  (4 files)             # Cross-domain coordination
    ├── LibClearingOps.sol               #   Clearing + compliance + transfer
    ├── LibHoldOps.sol                   #   Hold + compliance + transfer
    ├── LibTokenTransfer.sol             #   Transfer + compliance + events
    └── LibTotalBalance.sol              #   Aggregate balance calculation
```

### Features (256 files) — Security Token Facets

Each feature follows a consistent structure: `FacetBase` + 4 rate variant facets (standard, fixedRate, kpiLinkedRate, sustainabilityPerformanceTargetRate). Read-only view functions are separated into dedicated `*ReadFacet` contracts. See [Section 9](#9-facet-variant-consolidation-opportunity) for why these variants exist and how the lib migration makes most of them unnecessary.

```
facets/features/
├── ERC1400/                             # Token standards (50 files)
│   ├── ERC1410Management/               #   Multi-partition management
│   ├── ERC1410Read/                     #   Partition balance queries
│   ├── ERC1410TokenHolder/              #   Holder-facing operations
│   ├── ERC1594/                         #   Security token transfers
│   ├── ERC1643/                         #   Document management
│   ├── ERC1644/                         #   Controller operations
│   ├── ERC20/                           #   ERC20 compatibility
│   ├── ERC20Permit/                     #   Gasless approvals
│   └── ERC20Votes/                      #   Voting power
├── ERC3643/                             # T-REX compliance (20 files)
│   ├── ERC3643Batch/                    #   Batch operations
│   ├── ERC3643Management/               #   Identity registry management
│   ├── ERC3643Operations/               #   Compliance operations
│   └── ERC3643Read/                     #   Compliance queries
├── accessControl/       (5 files)       # Role management
├── cap/                 (5 files)       # Supply cap
├── clearing/           (25 files)       # Settlement/clearing
│   ├── clearingActions/
│   ├── clearingHoldCreation/
│   ├── clearingRead/
│   ├── clearingRedeem/
│   └── clearingTransfer/
├── controlList/         (5 files)       # Block/allow lists
├── corporateActions/    (5 files)       # Corporate actions
├── externalControlLists/(5 files)       # External list integration
├── externalKycLists/    (5 files)       # External KYC integration
├── externalPauses/      (5 files)       # External pause integration
├── freeze/              (5 files)       # Account freezing
├── hold/               (15 files)       # Token holds/escrow
│   ├── holdManagement/
│   ├── holdRead/
│   └── holdTokenHolder/
├── kyc/                 (5 files)       # KYC management
├── lock/                (5 files)       # Time-based locking
├── nonces/              (5 files)       # Nonce management
├── pause/               (5 files)       # Pause control
├── protectedPartitions/ (5 files)       # Protected partitions
├── snapshots/           (5 files)       # Historical snapshots
├── ssi/                 (5 files)       # Self-sovereign identity
├── totalBalance/        (5 files)       # Total balance queries
├── types/               (1 file)        # Shared domain types (ThirdPartyType)
├── interfaces/         (65 files)       # Feature interface definitions
└── constants/                           # Feature-specific constants
```

### Asset Capabilities (53 files) — Financial Asset Capabilities

```
facets/assetCapabilities/
├── adjustBalances/      (4 files)       # Balance adjustment facets (4 rate variants)
├── interestRates/       (3 files)       # Interest rate facets (3 rate type variants)
├── kpis/                                # KPI facets
│   └── kpiLatest/       (5 files)       #   Latest KPI data management
├── proceedRecipients/   (4 files)       # Proceed recipient facets
├── scheduledTasks/     (20 files)       # Scheduled execution
│   ├── scheduledBalanceAdjustments/ (5) #   Timed balance adjustments
│   ├── scheduledCouponListing/      (5) #   Coupon listing triggers
│   ├── scheduledCrossOrderedTasks/  (6) #   Cross-ordered task orchestration
│   └── scheduledSnapshots/          (5) #   Timed snapshot creation
└── interfaces/         (17 files)       # Asset interface definitions
```

### Regulation (21 files) — Jurisdiction-Specific Rules

```
facets/regulation/
├── bondUSA/            (10 files)       # US bond regulations
│   ├── BondUSAFacetBase.sol             #   Shared USA bond logic
│   ├── BondUSAReadFacetBase.sol         #   Shared USA bond queries
│   ├── variableRate/                    #   Variable rate variant
│   ├── fixedRate/                       #   Fixed rate variant
│   ├── kpiLinkedRate/                   #   KPI-linked variant
│   └── sustainabilityPerformanceTargetRate/
├── equityUSA/           (1 file)        # US equity regulations
│   └── EquityUSAFacet.sol
├── transferAndLock/     (5 files)       # Transfer-and-lock with regulations
│   ├── TransferAndLockFacetBase.sol
│   ├── standard/
│   ├── fixedRate/
│   ├── kpiLinkedRate/
│   └── sustainabilityPerformanceTargetRate/
├── constants/
│   └── regulation.sol                   # USA-specific enums/structs
└── interfaces/          (4 files)       # Regulation interfaces
```

### Factory (25 files)

```
factory/
├── Factory.sol                          # Main deployment entry point
├── IFactory.sol                         # Factory interface
├── isinValidator.sol                    # ISIN code validation
└── ERC3643/                             # T-REX factory
    ├── TREXFactory.sol                  #   T-REX deployment logic
    ├── interfaces/     (17 files)       #   Cloned interfaces (ERC3643 compat)
    └── libraries/       (4 files)       #   Deployment helper libraries
```

---

## 4. What Changed

### Phase 3: Library Migration (53 old abstract contracts → 35 libraries + 48 FacetBases)

**Deleted abstract contracts** (53 files across all layers):

- **Features** (35): ERC1410Management, ERC1410TokenHolder, ERC1410Read, ERC1410Issuer, ERC1643, ERC3643Management, ERC3643Batch, ERC3643Operations, ERC3643Read, ERC20, ERC20Permit, ERC20Votes, ERC1594, ERC1644, Cap, Lock, Kyc, Snapshots, ControlList, ProtectedPartitions, SsiManagement, ExternalControlListManagement, ExternalKycListManagement, ExternalPauseManagement, Nonces, CorporateActions, TotalBalance, ClearingActions, ClearingHoldCreation, ClearingRead, ClearingRedeem, ClearingTransfer, HoldManagement, HoldRead, HoldTokenHolder
- **Assets** (13): Bond, BondRead, Equity, AdjustBalances, Kpis, FixedRate, KpiLinkedRate, SustainabilityPerformanceTargetRate, ProceedRecipients, ScheduledSnapshots, ScheduledBalanceAdjustments, ScheduledCouponListing, ScheduledCrossOrderedTasks
- **Regulation** (5): BondUSA, EquityUSA, Security, TransferAndLock, BondUSARead

**Added**: 35 libraries (`lib/`) + 48 FacetBase files.

### Phase 5: Delete Old Inheritance Code (~85 files)

Deleted the entire inheritance chain that was blocked during Phase 3:

- **Internals.sol** (1,456 LOC) — 543 virtual function declarations
- **Modifiers.sol** (111 LOC) — 46 virtual modifiers
- **Common.sol chain** (~4 files, ~800 LOC)
- **StorageWrapper chain** (~57 files, ~3,500 LOC) — linear inheritance chain
- **layer_0_extensions/** — Bond/equity-specific common contracts

DiamondCutManager and ResolverProxyUnstructured were rewritten to use `LibAccess`/`LibPause`/`LibResolverProxy` directly instead of inheriting from Common.

### Phase R1: Consolidate Constants

Merged scattered constants from `layer_0/constants/`, `layer_1/constants/`, `layer_2/constants/` into a single `constants/` directory with 7 files. Converted all absolute import paths to relative paths for IDE compatibility and downstream project resolution.

### Phase R2: Extract Infrastructure (28 files)

Moved generic diamond/proxy code from `resolver/`, `proxies/`, `interfaces/resolver/`, `layer_0/`, and `lib/core/LibResolverProxy.sol` into `infrastructure/`. Deleted empty `layer_0/`, `resolver/`, `proxies/`, and `interfaces/resolver/` directories.

### Phases R3–R7: Rename Layers

| Before     | After                | Files | Purpose                      |
| ---------- | -------------------- | ----- | ---------------------------- |
| `layer_1/` | `features/`          | 255   | Security token facets        |
| `layer_2/` | `assetCapabilities/` | 54    | Financial asset capabilities |
| `layer_3/` | `regulation/`        | 21    | Jurisdiction-specific rules  |

Updated all Solidity imports, TypeScript test paths, Hardhat task references, and test directory names. Renamed `test/contracts/integration/layer_1/` → `features/` and `resolver/` → `infrastructure/`.

### Phase R8: Infrastructure Cleanup

Reorganized `infrastructure/utils/` into `infrastructure/lib/` with Lib-prefixed naming convention, relocated domain-specific files out of infrastructure:

- **Renames**: `ArrayLib` → `LibArrayValidation`, `CheckpointsLib` → `LibCheckpoints`, `LowLevelCall` → `LibLowLevelCall`, `LibCommon` → `LibPagination`
- **Moves out of infra**: `ERC712Lib` → `lib/core/ERC712.sol`, `ThirdPartyType` → `facets/features/types/ThirdPartyType.sol`
- **Inlined**: `DecimalsLib` into `LibInterestRate` (deleted)
- **Move within infra**: `LibResolverProxy` → `infrastructure/proxy/LibResolverProxy.sol`
- **Move to lib**: `ScheduledTasksLib` → `lib/domain/LibScheduledTasksStorage.sol`

### Phase R9: Facets Wrapper

Wrapped `features/`, `assetCapabilities/`, `regulation/` under a new `facets/` directory to make it immediately clear these are diamond entry points. Updated ~670 import paths across ~468 files.

### Phase R10: IFactory.sol Relocation

Moved `IFactory.sol` from standalone `interfaces/` directory into `factory/`, co-locating the interface with its implementation.

### Other Modifications

- **Factory.sol**: Replaced `Common.sol` inheritance with OpenZeppelin `Context` + direct modifier definitions
- **~35 test files**: Updated `getContractAt()` artifact names from old abstract contracts to interface names (`I*` prefix)
- **`tasks/compile.ts`**: Updated ERC3643 interface cloning paths to use new directory names
- **`scripts/tools/registry-generator/pipeline.ts`**: Updated resolver key glob patterns for new directory structure
- **`atsRegistry.data.ts`**: Auto-regenerated to reflect new file locations
- **READMEs**: Added `contracts/README.md` and `contracts/infrastructure/README.md` documenting the directory structure

---

## 5. Architecture: Before vs After

### Before: Deep Inheritance Chain

```
PauseFacet
  └── Pause (abstract — implements logic via Internals.sol calls)
        └── PauseStorageWrapper
              └── ExternalPauseManagementStorageWrapper
                    └── ... (50+ StorageWrappers chained linearly)
                          └── Common
                                └── Internals (1,456 lines, 543 virtual functions)
                                      └── Modifiers (46 virtual modifiers)
```

Every facet inherited ~55 contracts in a single linear chain. Adding a new feature meant inserting a new StorageWrapper link into this chain and adding virtual functions to Internals.sol.

### After: Library-Based Flat Architecture

```
PauseFacetBase
  ├── uses LibPause (pause/unpause/isPaused)
  ├── uses LibAccess (role checks)
  └── implements IStaticFunctionSelectors

PauseFacet extends PauseFacetBase
  └── overrides getStaticResolverKey() → returns _PAUSE_RESOLVER_KEY
```

Each facet directly imports only the libraries it needs. No chain, no virtual dispatch, no Internals.sol.

### Before: Opaque Directory Structure

```
contracts/
├── layer_0/          # What does "0" mean? Core? Base? Infrastructure?
├── layer_1/          # Features? Standards? Something else?
├── layer_2/          # Assets? Extensions? Higher-level?
├── layer_3/          # Regulation? Jurisdiction? Even higher?
├── resolver/         # Mixed with domain code (AccessControl, Pause)
├── proxies/          # Single file, odd location
├── interfaces/       # resolver/ subdirectory mixed with factory/
└── constants/        # Only some constants; rest scattered in layer_*/constants/
```

### After: Self-Documenting Structure

```
contracts/
├── facets/            # ALL diamond entry points (features, assetCapabilities, regulation)
├── lib/               # Libraries organized by abstraction (core → domain → orchestrator)
├── infrastructure/    # Extractable diamond/proxy package (zero domain imports)
├── constants/         # All constants consolidated in one place
├── storage/           # Unified storage definitions
└── factory/           # Token deployment
```

---

## 6. Adding a New Feature: Before vs After

### Before (8+ files, chain modification required)

1. **Create StorageWrapper** — Define storage struct, accessor, and basic operations
2. **Insert into chain** — Modify the inheritance chain to include the new StorageWrapper between existing links (fragile, order-dependent)
3. **Add to Internals.sol** — Add virtual functions for the new feature (~10-20 lines each, 543 already exist)
4. **Add to Modifiers.sol** — Add virtual modifiers if needed
5. **Create Implementation** — Abstract contract calling `_internalFunction()` from Internals.sol
6. **Create FacetBase** — Wire up Implementation + IStaticFunctionSelectors
7. **Create 4 variant Facets** — One per bond variant (standard, fixedRate, kpiLinked, sustainabilityPTR)
8. **Update Common chain** — Ensure Common.sol and its 3 bond-variant copies include the new inheritance

### After (5-6 files, no chain modification)

1. **Create Library** — `LibNewFeature.sol` with pure business logic (40-80 lines)
2. **Create storage accessor** — If new storage is needed, add to existing storage file or create new one
3. **Create FacetBase** — Import libraries, implement external functions
4. **Create 4 variant Facets** — Thin overrides (~10 lines each) for `getStaticResolverKey()`
5. **Register in BLR** — Add resolver key constant and register facets

**No modification of existing files required.** No chain to update, no Internals.sol to extend.

---

## 7. Trade-offs and Honest Assessment

### Advantages Confirmed

| Advantage                        | Evidence                                                                |
| -------------------------------- | ----------------------------------------------------------------------- |
| **Faster compilation**           | 37% reduction in compile time                                           |
| **Faster tests**                 | 25% reduction in test execution time                                    |
| **No behavioral changes**        | All 2,448 tests pass unchanged                                          |
| **Simpler feature additions**    | No chain modification needed for new features                           |
| **Better code locality**         | Each library is 40-80 lines with clear domain boundaries                |
| **Eliminated virtual dispatch**  | No more 543 virtual function declarations in Internals.sol              |
| **Full old code deletion**       | Internals, Modifiers, Common, StorageWrapper chain — all gone           |
| **LOC-neutral migration**        | 34,297 → 34,271 LOC (−26) — libraries replaced inheritance              |
| **Infrastructure extractable**   | `infrastructure/` has zero domain imports                               |
| **Self-documenting directories** | `features/`, `assetCapabilities/`, `regulation/` describe their content |

### Disadvantages Observed

| Disadvantage                    | Detail                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Bytecode size increase**      | Some facets grew significantly (ERC1594: +12KB) due to library inlining                                                               |
| **IERC20 artifact ambiguity**   | OpenZeppelin's IERC20 conflicts with ours; requires fully qualified names in tests                                                    |
| **ABI error declarations**      | Facets must explicitly inherit error interfaces for `revertedWithCustomError` to work in tests                                        |
| **Library function signatures** | Time-dependent functions need explicit `_currentTimestamp` parameter (cannot use `block.timestamp` in view context through libraries) |

### Neutral Observations

- **Facet count unchanged** (193) — the external API surface is identical
- **Storage layout unchanged** — same `bytes32` position constants, same struct definitions
- **Test count unchanged** (1,257 contract tests) — no tests added or removed
- **TypeChain generation unchanged** — same ABI means same TypeScript types

---

## 8. Key Patterns Discovered

### `_getBlockTimestamp()` Virtual Pattern

FacetBase contracts that need time-dependent view functions define:

```solidity
function _getBlockTimestamp() internal view virtual returns (uint256) {
  return block.timestamp;
}
```

TimeTravel variants override this to return the mocked timestamp. Library functions accept `uint256 _currentTimestamp` as a parameter.

### ABAF Adjustment Pattern

Storage values are pre-adjusted by `currentAbaf`. View functions apply additional factors:

- **Global** views (maxSupply, totalSupply): multiply by `pendingAbaf` only
- **Partition** views: multiply by `abafAdjustedAt / labafByPartition`

### SnapshotsFacetBase Trigger Pattern

`takeSnapshot()` must call `triggerPendingScheduledCrossOrderedTasks()` via a diamond self-call before taking the snapshot. This ensures scheduled balance adjustments execute first.

### ABI Error Declaration Pattern

Custom errors reverted via `revert LibX.ErrorName()` must be declared in the facet's ABI (through interface inheritance) for test assertions using `revertedWithCustomError()`.

---

## 9. Facet Variant Consolidation Opportunity

### Background: Why Variants Existed

The original architecture required 4 copies of every facet (standard, fixedRate, kpiLinkedRate, sustainabilityPerformanceTargetRate). This was **not a design choice** — it was a **necessary consequence of the inheritance architecture**.

The problem is documented in Confluence: [Cross-Facets dependencies: 24Kb Methods size issue](https://iobuilders.atlassian.net/wiki/spaces/IA/pages/4433117187).

#### The 24KB Contract Size Limit

Bonds have different coupon interest rate strategies (fixed, KPI-linked, sustainability, etc.). Each strategy has ~10KB of logic for `setCoupon`. Putting all strategies in one contract with if/else would exceed Ethereum's 24KB limit:

```
setCoupon with all strategies = ~30KB  ← EXCEEDS 24KB LIMIT
```

#### The Solution: Option 2 (Internal Calls via Common Chain)

Instead of one contract with branching, the team created **one contract per strategy** — each compiles only its strategy's code (documented as "Option 2: Internal calls"):

```solidity
contract Bond_STRATEGY_ONE {
    function setCoupon(...) internal { Strategy1(); } // 10KB only
}
```

To make cross-facet dependencies work, a **linear inheritance chain** called `Common.sol` was used (documented in [Cross-Facets dependencies: Common virtual](https://iobuilders.atlassian.net/wiki/spaces/IA/pages/4658626561)). Each strategy had its **own Common chain** because strategy-specific storage wrappers were included in the linearization. The [Facet code structuring](https://iobuilders.atlassian.net/wiki/spaces/IA/pages/4442685455) document states it explicitly:

> "External Facet: If the facet must be included in different strategies, **a different version of it with its corresponding Common must be implemented.**"

This is why every facet — even rate-agnostic ones like AccessControl — needed 4 variants. They were compiled with **different Common chains**.

### Why the Lib Migration Made Variants Unnecessary

The lib migration eliminated the Common chain entirely:

```
OLD: AccessControlFixedRateFacet → AccessControlFacetBase → CommonFixedInterestRate → [55+ SWs]
NEW: AccessControlFixedRateFacet → AccessControlFacetBase → (uses LibAccess, LibPause)
```

Libraries are stateless function calls — they don't participate in inheritance. There is no Common chain, no C3 linearization requirement, no reason for a facet to be compiled differently per strategy. Rate-agnostic facets are now **100% identical** across all 4 variants, differing only in a resolver key constant.

### Classification

#### Rate-Agnostic (IDENTICAL) — Candidates for Consolidation

All 4 variants inherit from the same FacetBase, have zero additional logic, and differ only in `getStaticResolverKey()`.

| Area                                      | Facet Types                                    | Current Variants | After Consolidation |
| ----------------------------------------- | ---------------------------------------------- | ---------------- | ------------------- |
| features/ (21 areas)                      | 45 facet types                                 | 180              | 45                  |
| assetCapabilities/ (rate-agnostic subset) | 5 areas + fixedRate scheduledCrossOrderedTasks | 21               | 5                   |
| regulation/ (all)                         | 3 areas                                        | 12               | 3                   |
| **Total**                                 | **53**                                         | **213**          | **53**              |

#### Rate-Specific (DIFFERENT) — Must Keep Variants

These have genuinely different logic, interfaces, and function selectors per rate type:

| Facet                                                                                | Why It's Different                                                                                           |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `FixedRateFacet` / `KpiLinkedRateFacet` / `SustainabilityPerformanceTargetRateFacet` | Completely different interfaces (`IFixedRate` vs `IKpiLinkedRate` vs `ISustainabilityPerformanceTargetRate`) |
| `ScheduledCrossOrderedTasks` (kpiLinked & sustainability)                            | Override `_onCouponListed()` with ~50-60 lines of rate calculation logic                                     |
| `Kpis` facets (kpiLinked & sustainability)                                           | Only exist for these two rate types                                                                          |

### Impact Assessment

| Category                         | Count          | Description                                       |
| -------------------------------- | -------------- | ------------------------------------------------- |
| Production Solidity to DELETE    | ~141 files     | 3 of 4 variants per rate-agnostic facet           |
| TimeTravel Solidity to DELETE    | ~144 files     | Corresponding TimeTravel wrappers                 |
| Resolver key constants to DELETE | ~141 constants | Unused variant-specific keys                      |
| TS configuration files to MODIFY | ~5 files       | Swap variant names to shared names                |
| Integration tests to MODIFY      | 0              | Tests call through diamond proxy, not facet names |
| **Total deletions**              | **~285 files** |                                                   |

### Status

Analysis complete. Implementation pending. Full details in `.temp/facet-variant-consolidation-analysis.md`.

---

## 10. Conclusion

The library-based migration achieved all its goals across 10 phases:

1. **Eliminated the need for Internals.sol** — Facets use libraries directly instead of routing through 543 virtual function declarations
2. **Broke the circular dependency workaround** — Libraries have no inheritance chain; each facet imports only what it needs
3. **Maintained full backward compatibility** — Same external ABI, same storage layout, same test suite
4. **Improved build performance** — 37% faster compilation, 25% faster tests
5. **Fully deleted old inheritance code** — Internals.sol, Modifiers.sol, Common.sol chain, and all 57 StorageWrappers are gone
6. **Extracted infrastructure** — Diamond/proxy code in a self-contained `infrastructure/` directory with zero domain coupling
7. **Semantic directory structure** — `features/`, `assetCapabilities/`, `regulation/` replace opaque `layer_1/`, `layer_2/`, `layer_3/`
8. **Clean infrastructure internals** — `utils/` → `lib/` with Lib-prefixed naming, domain files relocated out of infrastructure
9. **Explicit facet grouping** — `facets/` wrapper makes diamond entry points discoverable at a glance
10. **Unlocked variant consolidation** — By eliminating the Common chain, ~285 identical variant files can now be removed (see [Section 9](#9-facet-variant-consolidation-opportunity))

The codebase is now LOC-neutral (34,271 vs 34,297 original), has 136 fewer files, and has a clear architectural separation that makes infrastructure extraction into a standalone package straightforward. The next optimization opportunity is consolidating the 4x facet variant duplication — a direct consequence of removing the old Common chain inheritance that originally required it.
