# ADR: Library-Based Diamond Architecture — Evolution

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  ARCHITECTURE DECISION RECORD — COMPLETE EVOLUTION                          ║
║  Asset Tokenization Studio (ATS)                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Status:      COMPLETED                                                     ║
║  Date:        2026-02-27                                                    ║
║  Authors:     Miguel Gómez Carpena                                          ║
║  Metrics:     See MIGRATION_METRICS.md for all quantitative measurements    ║
║  Patterns:    See ADR-LIBRARY-BASED-DIAMOND-ARCHITECTURE-CODE-PATTERNS.md   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Stage 1: Original Architecture](#2-stage-1-original-architecture)
3. [Stage 2: Library Migration (1st Refactor)](#3-stage-2-library-migration-1st-refactor)
4. [Stage 3: Facet Consolidation (2nd Refactor)](#4-stage-3-facet-consolidation-2nd-refactor)
5. [Architecture Evolution](#5-architecture-evolution)
6. [TimeTravel Evolution](#6-timetravel-evolution)
7. [Interface Evolution](#7-interface-evolution)
8. [What Remains Rate-Specific](#8-what-remains-rate-specific)
9. [Adding a New Feature](#9-adding-a-new-feature)
10. [Key Patterns Discovered](#10-key-patterns-discovered)
11. [Trade-offs and Assessment](#11-trade-offs-and-assessment)
    - [Why Libraries Over Abstract Contracts](#why-libraries-over-abstract-contracts-for-domain-services)
12. [Appendix A: Optimizer Runs Impact Analysis](#12-appendix-a-optimizer-runs-impact-analysis)
13. [Final Directory Structure](#13-final-directory-structure)
14. [Conclusion](#14-conclusion)

---

## 1. Executive Summary

The ATS contracts evolved across three architectural stages — from 777 Solidity files with 55+ contract inheritance chains to 372 files with clean 2-level abstract-base patterns and proper production/test separation — while maintaining full backward compatibility and passing every test.

### The Three Stages

| Stage            | Architecture           | Key Achievement                                                      |
| ---------------- | ---------------------- | -------------------------------------------------------------------- |
| **Original**     | Deep inheritance chain | Internals.sol with 543 virtual functions, 4 copies of every facet    |
| **1st Refactor** | Library + FacetBase    | 37 libraries replaced inheritance chain, infrastructure extracted    |
| **2nd Refactor** | Abstract-base + mixin  | Variants deleted, FacetBases eliminated, clean TimeTravel separation |

> For all quantitative measurements (compile times, test times, file counts, bytecode sizes, gas usage, coverage), see **[MIGRATION_METRICS.md](./MIGRATION_METRICS.md)**.

---

## 2. Stage 1: Original Architecture

### Structure

Every facet inherited approximately 55 contracts in a single linear chain. The architecture relied on virtual function dispatch through `Internals.sol` — a 1,456-line file containing 543 virtual function declarations.

```
PauseFacet
  └── Pause (abstract — calls _internalPause() via Internals.sol)
        └── PauseStorageWrapper
              └── ExternalPauseManagementStorageWrapper
                    └── ... (50+ StorageWrappers chained linearly)
                          └── Common
                                └── Internals (1,456 LOC, 543 virtual functions)
                                      └── Modifiers (46 virtual modifiers)
```

### Why 4 Rate Variants Existed

Bonds have different coupon interest rate strategies (fixed, KPI-linked, sustainability). Each strategy includes ~10KB of `setCoupon` logic. Combining all strategies in one contract would exceed Ethereum's 24KB EIP-170 limit.

The solution (documented as "Option 2: Internal calls" in [Confluence](https://iobuilders.atlassian.net/wiki/spaces/IA/pages/4433117187)) created one contract per strategy. To handle cross-facet dependencies, a linear inheritance chain called `Common.sol` was used. Each strategy required **its own Common chain** because strategy-specific StorageWrappers were part of the C3 linearization.

This forced every facet — even rate-agnostic ones like AccessControl or Pause — to have 4 copies compiled with 4 different Common chains.

### Pain Points

- Adding a new feature required inserting a StorageWrapper link into the chain, adding virtual functions to Internals.sol, and creating 4 facet variants
- Every facet compiled with ~55 contracts in its inheritance tree
- 3 out of 4 variant copies of rate-agnostic facets were 100% identical
- Virtual function dispatch made code tracing difficult

---

## 3. Stage 2: Library Migration (1st Refactor)

37 stateless libraries replaced the StorageWrapper chain and Internals.sol. A new FacetBase pattern provided clean 2-level inheritance. Infrastructure was extracted into a standalone package with zero domain imports.

### Architecture

```
PauseFacet
  └── PauseFacetBase
        ├── uses LibPause (pause/unpause/isPaused)
        ├── uses LibAccess (role checks)
        ├── implements IStaticFunctionSelectors
        └── _getBlockTimestamp() virtual (for TimeTravel override)
```

### What Was Deleted

| Component              | Count                 |
| ---------------------- | --------------------- |
| Internals.sol          | 1,456 LOC             |
| Modifiers.sol          | 111 LOC               |
| Common.sol chain       | ~4 files, ~800 LOC    |
| StorageWrapper chain   | ~57 files, ~3,500 LOC |
| Old abstract contracts | ~53 files             |

### What Was Added

| Component        | Count                |
| ---------------- | -------------------- |
| Libraries (lib/) | 37 files, ~8,495 LOC |
| FacetBase files  | 48 files             |

### Phase-by-Phase Changes

**Phase 3: Library Migration** (53 old abstract contracts → 35 libraries + 48 FacetBases)

Deleted abstract contracts across all layers:

- **Features** (35): ERC1410Management, ERC1410TokenHolder, ERC1410Read, ERC1410Issuer, ERC1643, ERC3643Management, ERC3643Batch, ERC3643Operations, ERC3643Read, ERC20, ERC20Permit, ERC20Votes, ERC1594, ERC1644, Cap, Lock, Kyc, Snapshots, ControlList, ProtectedPartitions, SsiManagement, ExternalControlListManagement, ExternalKycListManagement, ExternalPauseManagement, Nonces, CorporateActions, TotalBalance, ClearingActions, ClearingHoldCreation, ClearingRead, ClearingRedeem, ClearingTransfer, HoldManagement, HoldRead, HoldTokenHolder
- **Assets** (13): Bond, BondRead, Equity, AdjustBalances, Kpis, FixedRate, KpiLinkedRate, SustainabilityPerformanceTargetRate, ProceedRecipients, ScheduledSnapshots, ScheduledBalanceAdjustments, ScheduledCouponListing, ScheduledCrossOrderedTasks
- **Regulation** (5): BondUSA, EquityUSA, Security, TransferAndLock, BondUSARead

**Phase 5: Delete Old Inheritance Code** (~85 files)

DiamondCutManager and ResolverProxyUnstructured were rewritten to use `LibAccess`/`LibPause`/`LibResolverProxy` directly instead of inheriting from Common.

**Phase R1: Consolidate Constants**

Merged scattered constants from `layer_0/constants/`, `layer_1/constants/`, `layer_2/constants/` into a single `constants/` directory with 7 files.

**Phase R2: Extract Infrastructure** (28 files)

Moved generic diamond/proxy code into `infrastructure/`. Zero domain imports.

**Phases R3–R7: Rename Layers**

| Before     | After                | Purpose                       |
| ---------- | -------------------- | ----------------------------- |
| `layer_0/` | `infrastructure/`    | Diamond proxy, BLR, utilities |
| `layer_1/` | `features/`          | Security token facets         |
| `layer_2/` | `assetCapabilities/` | Financial asset capabilities  |
| `layer_3/` | `regulation/`        | Jurisdiction-specific rules   |

Updated all Solidity imports, TypeScript test paths, Hardhat task references, and test directory names.

**Phase R8: Infrastructure Cleanup**

Reorganized `infrastructure/utils/` into `infrastructure/lib/` with Lib-prefixed naming convention:

- **Renames**: `ArrayLib` → `LibArrayValidation`, `CheckpointsLib` → `LibCheckpoints`, `LowLevelCall` → `LibLowLevelCall`, `LibCommon` → `LibPagination`
- **Moves out of infra**: `ERC712Lib` → `lib/core/ERC712.sol`, `ThirdPartyType` → `facets/features/types/ThirdPartyType.sol`
- **Inlined**: `DecimalsLib` into `LibInterestRate` (deleted)

**Phase R9: Facets Wrapper**

Wrapped `features/`, `assetCapabilities/`, `regulation/` under a new `facets/` directory. Updated ~670 import paths across ~468 files.

**Phase R10: IFactory.sol Relocation**

Moved `IFactory.sol` from standalone `interfaces/` directory into `factory/`, co-locating the interface with its implementation.

### What Was Preserved

Despite the radical internal restructuring, the 1st refactor preserved:

- **All 195 production facets** (4 variants per rate type)
- **196 TimeTravel variant files** (per-facet `_getBlockTimestamp()` override pattern)
- **33 `standard/` directories** (stubs for rate-agnostic facets)
- **External ABI** — same function signatures, same storage layout
- **All 1,257 contract tests** passing

---

## 4. Stage 3: Facet Consolidation (2nd Refactor)

Completed in 5 commits over 7 days (2026-02-19 to 2026-02-25), each targeting a specific consolidation goal.

### Commit 1: `466e2cec6` — Variant Consolidation

**Date**: 2026-02-19

Deleted all rate-agnostic duplicate facets. Of the 195 facets, only 63 had unique code — the remaining 132 were identical copies that existed solely because of the old Common chain requirement.

**What was deleted:**

- 132 rate-agnostic production facet variants (fixedRate, kpiLinked, sustainabilityPTR copies of AccessControl, Cap, ERC1410, ERC1594, ERC1643, ERC1644, ERC20, ERC20Permit, ERC20Votes, Pause, Lock, Freeze, Snapshots, CorporateActions, ControlList, ExternalControlLists, ExternalKycLists, ExternalPauses, Kyc, Nonces, ProtectedPartitions, SsiManagement, TotalBalance, Clearing, Hold, AdjustBalances, ScheduledBalanceAdjustments, ScheduledCouponListing, ScheduledSnapshots, TransferAndLock, and more)
- 132 corresponding TimeTravel wrapper files
- Unused resolver key constants from assets.sol and features.sol

### Commit 2: `3b0c67a3c` — Abstract-Base Pattern + Interface Flattening

**Date**: 2026-02-20

Replaced the FacetBase pattern with abstract contracts and flattened the interface hierarchy.

- All 48 FacetBase files replaced with 48 abstract contracts (e.g., `PauseFacetBase` → `Pause`)
- All 33 `standard/` directory stubs eliminated
- Interface hierarchy flattened: `I{Feature}StorageWrapper.sol` → `I{Feature}.sol`
- Interfaces reduced from 86 to 72 files

**Why abstract contracts instead of FacetBase?**

- `Pause` (what it does) is clearer than `PauseFacetBase` (how it's structured)
- Abstract contracts define business logic; concrete facets implement Diamond infrastructure
- The naming aligns with intent rather than pattern mechanics

### Commit 3: `59c044a4b` — TimeTravel Unification

**Date**: 2026-02-20

Consolidated 64 scattered TimeTravel facet variants into a single unified pattern. Single `LibTimeTravel` library, all facets use directly:

```solidity
uint256 currentTimestamp = LibTimeTravel.getBlockTimestamp();
```

Created `TimeTravel.sol` (abstract), `LibTimeTravel.sol` (library), `TimeTravelFacet.sol` (Diamond wrapper), `ITimeTravel.sol` (consolidated interface). Deleted 64 old TimeTravel files and 2,086 lines of duplicated override code.

### Commit 4: `2440dace4` — Abstract-Base for Rate-Specific Facets

**Date**: 2026-02-20

Applied the abstract-base pattern to the remaining rate-specific facets.

**Created 8 abstract base contracts:**

- `ScheduledCrossOrderedTasksKpiLinkedRate` — KPI-specific scheduled task logic
- `ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRate` — SPT-specific logic
- `BondUSAFixedRate`, `BondUSAKpiLinkedRate`, `BondUSASustainabilityPerformanceTargetRate` — Bond implementations
- `BondUSAReadKpiLinkedRate`, `BondUSAReadSustainabilityPerformanceTargetRate` — Dynamic `getCoupon()` read operations
- `EquityUSA` — Consolidated equity implementation (485 lines of core logic)

**Concrete facets simplified**: average size reduced from ~480 to ~70 lines (−85%), now containing only Diamond infrastructure (`getStaticResolverKey`, `getStaticFunctionSelectors`, `getStaticInterfaceIds`).

### Commit 5: TimeTravel Separation

**Date**: 2026-02-25

Removed `LibTimeTravel` from production code — restored clean production/test separation.

The initial TimeTravel unification (commit 3) embedded `LibTimeTravel` directly in 34 production abstract bases. This meant production bytecode contained test infrastructure and production code imported from `test/`. This commit fixes that architectural violation.

**Approach: Virtual Function + Mixin Pattern**

```solidity
// Production: contracts/infrastructure/lib/TimestampProvider.sol
abstract contract TimestampProvider {
  function _getBlockTimestamp() internal view virtual returns (uint256) {
    return block.timestamp;
  }
  function _getBlockNumber() internal view virtual returns (uint256) {
    return block.number;
  }
}

// Test-only: contracts/test/timeTravel/TimeTravelProvider.sol
abstract contract TimeTravelProvider is TimestampProvider {
  function _getBlockTimestamp() internal view virtual override returns (uint256) {
    return LibTimeTravel.getBlockTimestamp();
  }
}

// Test-only variant: contracts/test/timeTravel/variants/CapFacetTimeTravel.sol
contract CapFacetTimeTravel is CapFacet, TimeTravelProvider {
  function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
    return TimeTravelProvider._getBlockTimestamp();
  }
}
```

**Universal TimeTravel variant design**: ALL 63 facets get a variant (not just the 38 that use timestamps). This simplifies deployment (no filtering list) and is future-proof. Of the 63 variants, 38 require explicit C3 override resolution, 25 have empty body.

---

## 5. Architecture Evolution

### Visual: How Pause Looks at Each Stage

**Original (55+ contract chain):**

```
PauseFacet
  └── Pause (abstract — calls _internalPause())
        └── PauseStorageWrapper
              └── ExternalPauseManagementStorageWrapper
                    └── ... (50+ StorageWrappers chained)
                          └── Common
                                └── Internals (1,456 LOC, 543 virtual functions)
                                      └── Modifiers (46 virtual modifiers)
```

**1st Refactor (Library + FacetBase):**

```
PauseFacet
  └── PauseFacetBase
        ├── uses LibPause (pause, unpause, isPaused)
        ├── uses LibAccess (checkRole)
        ├── implements IStaticFunctionSelectors
        └── _getBlockTimestamp() virtual → overridden by PauseTimeTravelFacet
```

**2nd Refactor (Abstract-base):**

```
PauseFacet                           # Thin wrapper (~25 lines)
  └── Pause (abstract contract)      # Business logic (~28 lines)
        ├── uses LibPause            # Direct library calls
        └── uses LibAccess           # No virtual methods, no TimeTravel override needed
```

### Code: Final Pause Implementation

**Pause.sol** — abstract contract with all business logic:

```solidity
abstract contract Pause is IPause {
  function pause() external override returns (bool success_) {
    LibAccess.checkRole(_PAUSER_ROLE);
    LibPause.requireNotPaused();
    LibPause.pause();
    success_ = true;
  }

  function unpause() external override returns (bool success_) {
    LibAccess.checkRole(_PAUSER_ROLE);
    LibPause.requirePaused();
    LibPause.unpause();
    success_ = true;
  }

  function isPaused() external view override returns (bool) {
    return LibPause.isPaused();
  }
}
```

**PauseFacet.sol** — concrete Diamond infrastructure only:

```solidity
contract PauseFacet is Pause, IStaticFunctionSelectors {
  function getStaticResolverKey() external pure override returns (bytes32) {
    return _PAUSE_RESOLVER_KEY;
  }

  function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
    uint256 selectorIndex;
    bytes4[] memory selectors = new bytes4[](3);
    selectors[selectorIndex++] = this.pause.selector;
    selectors[selectorIndex++] = this.unpause.selector;
    selectors[selectorIndex++] = this.isPaused.selector;
    return selectors;
  }

  function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
    bytes4[] memory ids = new bytes4[](1);
    ids[0] = type(IPause).interfaceId;
    return ids;
  }
}
```

**Total**: 2 files, ~53 lines of code (28 business logic + 25 infrastructure).

### Architecture Pattern Summary

| Stage            | Pattern                | Inheritance Depth            | Cross-Facet Dependencies                  | Test Separation                           |
| ---------------- | ---------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------------- |
| **Original**     | Deep inheritance chain | 55+ contracts                | Via Internals.sol (543 virtual functions) | Per-facet TimeTravel files                |
| **1st Refactor** | Library + FacetBase    | 2 levels (Facet → FacetBase) | Via libraries (direct calls)              | Per-facet TimeTravel files                |
| **2nd Refactor** | Abstract-base + mixin  | 2 levels (Facet → Abstract)  | Via libraries (direct calls)              | Clean: TimestampProvider + mixin in test/ |

---

## 6. TimeTravel Evolution

### Original: ~196+ TimeTravel Variant Files

Every facet that could be tested with time manipulation had a duplicate TimeTravel version. The override was always identical:

```solidity
function _getBlockTimestamp() internal view override returns (uint256) {
  return TimeTravelStorageWrapper._blockTimestamp();
}
```

### 1st Refactor: 196 TimeTravel Variant Files

The library migration preserved the per-facet override pattern:

```solidity
// In every FacetBase (48 files)
function _getBlockTimestamp() internal view virtual returns (uint256) {
  return block.timestamp;
}

// In every TimeTravel variant (196 files)
function _getBlockTimestamp() internal view override returns (uint256) {
  return TimeTravelStorageWrapper._blockTimestamp();
}
```

196 files containing identical override logic.

### 2nd Refactor: TimestampProvider + Mixin Pattern (68 TimeTravel Files)

**Production** — `TimestampProvider` provides virtual methods returning native `block.timestamp`/`block.number`.

**Test-only** — `TimeTravelProvider` overrides with `LibTimeTravel` storage reads.

**Per-facet variants** — C3 linearization mixin (63 files in `test/timeTravel/variants/`).

Production facets inherit `TimestampProvider` and call `_getBlockTimestamp()` — returning `block.timestamp` directly with zero overhead. TimeTravel variants exist exclusively in `test/` and are only deployed when `useTimeTravel=true`.

| Metric                         | Original            | 1st Refactor        | 2nd Refactor                                           |
| ------------------------------ | ------------------- | ------------------- | ------------------------------------------------------ |
| TimeTravel files               | ~196+               | 196                 | 68 (5 core + 63 variants)                              |
| Override pattern               | Virtual function    | Virtual function    | TimestampProvider + mixin                              |
| Production imports from test/  | Yes                 | Yes                 | **None** (clean separation)                            |
| Adding TimeTravel to new facet | Create variant file | Create variant file | Create ~10-line variant in `test/timeTravel/variants/` |

---

## 7. Interface Evolution

### Original: Scattered Across StorageWrapper Chain

Interfaces were fragmented across the StorageWrapper inheritance hierarchy. Events and errors lived in `Internals.sol`. Each StorageWrapper had its own `I{Feature}StorageWrapper.sol`.

### 1st Refactor: 86 Interface Files in Nested Hierarchy

Organized under `facets/*/interfaces/` but with StorageWrapper-oriented naming:

```
facets/features/interfaces/           # 65 files in 21 subdirectories
├── cap/
│   ├── ICapStorageWrapper.sol
│   └── ICapManagementStorageWrapper.sol
├── lock/
│   ├── ILockStorageWrapper.sol
│   └── ILockTimeBoundStorageWrapper.sol
├── ... (21 subdirectories, 65 files)
```

### 2nd Refactor: 72 Interface Files in Flat + Logical Structure

```
facets/features/interfaces/           # 54 files (19 flat + 35 in 5 subdirs)
├── IAccessControl.sol                # 19 flat files for simple features
├── ICap.sol
├── IFreeze.sol
├── IPause.sol
├── ... (12 more flat)
├── ERC1400/                          # Logical subdirectories for standards/families
├── ERC3643/
├── clearing/
├── controlList/
└── hold/
```

| Metric                  | 1st Refactor         | 2nd Refactor           | Change         |
| ----------------------- | -------------------- | ---------------------- | -------------- |
| Total interface files   | 86                   | 72                     | −14            |
| `StorageWrapper` suffix | On every file        | Eliminated             | Cleaner naming |
| Feature subdirectories  | 21 (one per feature) | 6 (by standard/family) | −15            |

---

## 8. What Remains Rate-Specific

After consolidation, 63 production facets remain. Of these, **16 are genuinely rate-specific** (different business logic per rate type) and **47 are rate-agnostic** (single copy, shared across all configurations).

### Rate-Specific Facets (16 facets)

#### Interest Rate Strategy Facets (3)

| Facet                                      | Why Rate-Specific                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `FixedRateFacet`                           | Implements `IFixedRate` — fixed rate storage and operations                  |
| `KpiLinkedRateFacet`                       | Implements `IKpiLinkedRate` — KPI storage, calculation logic                 |
| `SustainabilityPerformanceTargetRateFacet` | Implements `ISustainabilityPerformanceTargetRate` — SPT storage, calculation |

#### Scheduled Task Variants (2)

| Facet                                                                | Why Rate-Specific                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `ScheduledCrossOrderedTasksKpiLinkedRateFacet`                       | Overrides `_onCouponListed()` with KPI rate calculation logic |
| `ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet` | Overrides `_onCouponListed()` with SPT rate calculation logic |

#### KPI Facets (2)

| Facet                                          | Why Rate-Specific                         |
| ---------------------------------------------- | ----------------------------------------- |
| `KpisKpiLinkedRateFacet`                       | Only exists for KPI-linked configurations |
| `KpisSustainabilityPerformanceTargetRateFacet` | Only exists for SPT configurations        |

#### Proceed Recipients Variants (2)

| Facet                                                       | Why Rate-Specific                          |
| ----------------------------------------------------------- | ------------------------------------------ |
| `ProceedRecipientsKpiLinkedRateFacet`                       | Rate-specific proceed distribution for KPI |
| `ProceedRecipientsSustainabilityPerformanceTargetRateFacet` | Rate-specific proceed distribution for SPT |

#### Bond USA Regulation (7)

| Facet                                                 | Why Rate-Specific                          |
| ----------------------------------------------------- | ------------------------------------------ |
| `BondUSAFacet` (variableRate)                         | Standard bond write operations             |
| `BondUSAReadFacet` (variableRate)                     | Standard bond read interface               |
| `BondUSAFixedRateFacet`                               | Fixed rate coupon initialization           |
| `BondUSAKpiLinkedRateFacet`                           | KPI-linked coupon operations               |
| `BondUSAReadKpiLinkedRateFacet`                       | Dynamic `getCoupon()` with KPI calculation |
| `BondUSASustainabilityPerformanceTargetRateFacet`     | SPT coupon operations                      |
| `BondUSAReadSustainabilityPerformanceTargetRateFacet` | Dynamic `getCoupon()` with SPT calculation |

### Rate-Agnostic Facets (47 facets)

All features/ facets (38), plus rate-agnostic assetCapabilities (7: AdjustBalances, ProceedRecipients, ScheduledBalanceAdjustments, ScheduledCouponListing, ScheduledCrossOrderedTasks, ScheduledSnapshots + standard ProceedRecipients), plus single-copy regulation facets (2: EquityUSA, TransferAndLock).

These are the facets where the old 4-variant duplication was eliminated. Each now exists as a single copy shared across all bond/equity configurations.

---

## 9. Adding a New Feature

### Original (8+ files, chain modification required)

1. Create StorageWrapper — insert into 57-contract linear chain
2. Add virtual functions to Internals.sol
3. Add modifiers to Modifiers.sol
4. Create abstract implementation calling `_internalFunction()`
5. Create 4 variant Facets (standard, fixedRate, kpiLinked, SPT)
6. Update all 4 Common chain variants
7. Create 4 TimeTravel variant files

### 1st Refactor (5-6 files, no chain modification)

1. Create Library — `LibNewFeature.sol` with pure business logic
2. Create storage accessor — if new storage is needed
3. Create FacetBase — import libraries, implement external functions
4. Create 4 variant Facets — thin overrides for `getStaticResolverKey()`
5. Register in BLR — add resolver key constant

### 2nd Refactor (3 files + 1 TimeTravel variant)

1. `lib/domain/Lib{Feature}.sol` — Business logic (library)
2. `facets/features/{dir}/{Feature}.sol` — Business logic (abstract, inherits TimestampProvider if time-dependent)
3. `facets/features/{dir}/{Feature}Facet.sol` — Diamond infrastructure (concrete, ~25 lines)
4. `test/timeTravel/variants/{Feature}FacetTimeTravel.sol` — TimeTravel variant (~10 lines, mixin pattern)

**No existing files need modification. No chain to update. No variants to duplicate.**

For rate-specific features: extend the abstract base with rate-specific logic. Never duplicate.

---

## 10. Key Patterns Discovered

### `_getBlockTimestamp()` Virtual Pattern

FacetBase contracts that need time-dependent view functions define:

```solidity
function _getBlockTimestamp() internal view virtual returns (uint256) {
  return block.timestamp;
}
```

TimeTravel variants override this to return the mocked timestamp. Library functions accept `uint256 _currentTimestamp` as a parameter (libraries cannot use virtual functions).

### ABAF Adjustment Pattern

Storage values are pre-adjusted by `currentAbaf`. View functions apply additional factors:

- **Global** views (maxSupply, totalSupply): multiply by `pendingAbaf` only
- **Partition** views: multiply by `abafAdjustedAt / labafByPartition`

### SnapshotsFacetBase Trigger Pattern

`takeSnapshot()` must call `triggerPendingScheduledCrossOrderedTasks()` via a diamond self-call before taking the snapshot. This ensures scheduled balance adjustments execute first.

### ABI Error Declaration Pattern

Custom errors reverted via `revert LibX.ErrorName()` must be declared in the facet's ABI (through interface inheritance) for test assertions using `revertedWithCustomError()`.

### LibERC20Votes Parameter Injection

Libraries cannot use virtual functions. `LibERC20Votes` receives `currentBlockNumber` as a parameter, passed from calling facets through `LibTokenTransfer`. This preserves library statelessness while allowing TimeTravel override at the facet level.

---

## 11. Trade-offs and Assessment

### Original → 1st Refactor

| Gained                                                             | Lost                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Eliminated Internals.sol (543 virtual functions)                   | BondUSAKpiLinkedRateFacet grew +3.5 KiB (rate logic restructuring) |
| Self-documenting directory names                                   | ABI error declarations required explicitly                         |
| Infrastructure extractable (zero domain imports)                   | Library functions need explicit `_currentTimestamp` parameter      |
| No chain modification for new features                             | —                                                                  |
| **Bytecode size neutral** (avg delta < 0.2 KiB with same compiler) | —                                                                  |

LOC: Neutral (34,297 → 34,273). Still preserved 4x variant duplication and per-facet TimeTravel pattern.

### 1st Refactor → 2nd Refactor

| Gained                                                    | Lost                                                        |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| 68% fewer facets (195 → 63)                               | Can't grep for "all FixedRate variants" (most were deleted) |
| Eliminated all 48 FacetBases                              | +65 test-only TimeTravel variant files                      |
| Clean TimeTravel separation (196 embedded → 68 test-only) | +10s compile time (35s vs 25s, from 65 extra files)         |
| Flattened interfaces (86 → 72, no StorageWrapper suffix)  | —                                                           |
| Zero production imports from test/                        | —                                                           |
| Cleaner naming (business logic focus)                     | —                                                           |
| Zero behavioral changes                                   | —                                                           |

Assessment: The 2nd refactor was purely additive improvement. The "missing" rate variants were identical copies with no unique code. TimeTravel variants moved from being embedded in production code to clean test-only files.

### Why Libraries Over Abstract Contracts for Domain Services

A natural question: why not use abstract contracts (class-like OOP) for domain services instead of libraries (functional-style)?

#### The Diamond Pattern IS the Composition Mechanism

The Diamond pattern (EIP-2535) provides class-like composition at runtime: facets are the "classes," the proxy composes them, and `DELEGATECALL` provides polymorphic dispatch. This is the first composition layer.

Adding abstract contract inheritance for domain services creates a **second, competing composition layer** at compile time:

```
Layer 1 — Diamond composition (runtime):
  Proxy → PauseFacet (selectors 0x01, 0x02)
  Proxy → HoldFacet (selectors 0x03, 0x04, 0x05)

Layer 2 — Inheritance composition (compile-time):
  PauseFacet is PauseDomain, ExternalListsDomain, AccessDomain
  HoldFacet is HoldDomain, ClearingDomain, ComplianceDomain, ExternalListsDomain, AccessDomain
```

#### Why Two Layers Conflict

**Inter-domain calls force inheritance propagation.** If `PauseDomain` needs `ExternalListsDomain` internally, every facet that inherits `PauseDomain` must also inherit `ExternalListsDomain` — even facets with no relation to external lists. With 40+ facets and 15+ domain services, the inheritance graph grows quadratically:

```
With abstract contracts:
  Adding a new domain? → Recheck C3 linearization across ALL consuming facets.
  PauseDomain adds a new dependency? → Cascades to every facet that inherits it.

With libraries:
  Adding a new library? → Import and call where needed. Zero impact on other facets.
  LibPause adds a new dependency (LibExternalLists)? → Internal to LibPause. No cascade.
```

#### Comparison

| Aspect                      | Libraries                                                 | Abstract Contracts                                     |
| --------------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| **Composition mechanism**   | Call any library, no wiring                               | Must inherit; facet carries all ancestors              |
| **Inter-domain dependency** | `LibPause` calls `LibExternalLists` internally            | Facet must inherit both + resolve linearization        |
| **Adding new domain**       | Add library, import where needed                          | Update inheritance tree of every consuming facet       |
| **Diamond compatibility**   | Native pattern — libraries complement Diamond             | Double composition — inheritance competes with Diamond |
| **Bytecode**                | Identical (internal functions inline the same)            | Identical                                              |
| **Gas**                     | Identical                                                 | Identical                                              |
| **External deployment**     | `public`/`external` functions → deploy once, DELEGATECALL | Abstract contracts cannot be deployed as shared code   |
| **Polymorphism**            | Not available                                             | `virtual`/`override` available                         |

#### Where Abstract Contracts Remain Appropriate

1. **Facet base classes with genuine polymorphism**: `SnapshotsFacetBase` with `_getBlockTimestamp() virtual` that TimeTravel variants override.
2. **Small mixins for cross-cutting behavior**: `TimestampProvider` that adds `_getBlockTimestamp()` to any facet.

Both cases involve **facet behavior variants**, not domain logic encapsulation. The distinction:

- **Domain services** (pause, access control, external lists, compliance) → **Libraries**
- **Facet behavior variants** (time source, rate-specific overrides) → **Abstract contracts**

> The Diamond pattern replaces deep inheritance with flat composition. Domain service libraries preserve this flatness. Abstract contracts for domain services would re-introduce the inheritance complexity that the migration specifically eliminated.

---

## 12. Appendix A: Optimizer Runs Impact Analysis

The Solidity optimizer `runs` parameter controls the trade-off between deployment cost/size (lower `runs`) and runtime gas cost (higher `runs`). Five configurations were benchmarked: `runs=1`, `100` (current), `200`, `500`, `1000`.

All measurements taken on commit `2440dace4`, Solidity 0.8.28/cancun, 1,257 tests.

### Contract Size Impact

| Optimizer Runs      | Total (KiB) | Avg/Facet (KiB) | vs runs=100  |
| ------------------- | ----------- | --------------- | ------------ |
| **1**               | 584.9       | 20.89           | −0.4%        |
| **100** _(current)_ | **587.4**   | **20.98**       | **baseline** |
| **200**             | 609.9       | 21.78           | +3.8%        |
| **500**             | 630.7       | 22.52           | +7.4%        |
| **1000**            | 664.8       | 23.74           | +13.2%       |

### EIP-170 Limit Analysis

| Optimizer Runs      | Facets > 20 KiB | Facets > 23 KiB | Closest to Limit                   |
| ------------------- | --------------- | --------------- | ---------------------------------- |
| **1**               | 4               | 0               | TREXFactory: 22.812                |
| **100** _(current)_ | **4**           | **0**           | **TREXFactory: 22.850**            |
| **200**             | 6               | 0               | TREXFactory: 22.944                |
| **500**             | 9               | 1               | TREXFactory: 23.228                |
| **1000**            | 12              | 4               | **ERC1410ManagementFacet: 23.704** |

At `runs=1000`, **ERC1410ManagementFacet reaches 23.704 KiB** — only **296 bytes from the 24 KiB limit**. Unsafe for future development.

### Gas Cost Impact

| Optimizer Runs      | Avg Gas/Operation | vs runs=100  |
| ------------------- | ----------------- | ------------ |
| **1**               | 191,201           | +0.3%        |
| **100** _(current)_ | **190,686**       | **baseline** |
| **200**             | 190,451           | −0.1%        |
| **500**             | 190,223           | −0.2%        |
| **1000**            | 190,088           | −0.3%        |

The entire range from `runs=1` to `runs=1000` produces only a **0.6% gas reduction** — approximately 1,113 gas per transaction. Negligible compared to the 13.7% contract size increase.

### Deployment Gas

| Optimizer Runs      | Avg Deploy Gas | vs runs=100  |
| ------------------- | -------------- | ------------ |
| **1**               | 1,734,148      | +0.4%        |
| **100** _(current)_ | **1,727,308**  | **baseline** |
| **200**             | 1,726,265      | −0.06%       |
| **500**             | 1,732,275      | +0.3%        |
| **1000**            | 1,756,167      | +1.7%        |

Deployment gas follows a U-curve: lowest at `runs=200`, then **increasing** at higher values.

### Recommendation: Keep `runs=100`

1. **Size safety**: Only +2.5 KiB total above the absolute minimum, with comfortable EIP-170 headroom
2. **Gas efficiency**: Captures most available gas savings — marginal benefit from `runs=200` to `runs=1000` is only 0.3% additional
3. **Deployment cost**: Near-optimal; higher values increase deployment cost
4. **Future development**: Sufficient headroom for new features without approaching 24 KiB
5. **Industry standard**: `runs=200` is the Solidity compiler default; `runs=100` is conservative and well-suited for complex diamond-pattern contracts

---

## 13. Final Directory Structure

### Complete Layout (372 .sol files)

```
contracts/                                # 372 .sol files total
├── facets/                               # ALL diamond entry points
│   ├── features/                         #   38 facets, 55 interfaces, 1 types file
│   │   ├── ERC1400/                      #     10 facets: ERC1410 (4), ERC1594, ERC1643, ERC1644, ERC20, ERC20Permit, ERC20Votes
│   │   ├── ERC3643/                      #     4 facets: Batch, Management, Operations, Read
│   │   ├── accessControl/                #     1 facet + 1 abstract
│   │   ├── cap/                          #     1 facet + 1 abstract (inherits TimestampProvider)
│   │   ├── clearing/                     #     5 facets + 5 abstracts
│   │   ├── controlList/                  #     1 facet + 1 abstract
│   │   ├── corporateActions/             #     1 facet + 1 abstract
│   │   ├── externalControlLists/         #     1 facet + 1 abstract
│   │   ├── externalKycLists/             #     1 facet + 1 abstract
│   │   ├── externalPauses/               #     1 facet + 1 abstract
│   │   ├── freeze/                       #     1 facet + 1 abstract (inherits TimestampProvider)
│   │   ├── hold/                         #     3 facets + 3 abstracts
│   │   ├── kyc/                          #     1 facet + 1 abstract
│   │   ├── lock/                         #     1 facet + 1 abstract (inherits TimestampProvider)
│   │   ├── nonces/                       #     1 facet + 1 abstract
│   │   ├── pause/                        #     1 facet + 1 abstract
│   │   ├── protectedPartitions/          #     1 facet + 1 abstract
│   │   ├── snapshots/                    #     1 facet + 1 abstract (inherits TimestampProvider)
│   │   ├── ssi/                          #     1 facet + 1 abstract
│   │   ├── totalBalance/                 #     1 facet + 1 abstract (inherits TimestampProvider)
│   │   ├── interfaces/                   #     55 files (20 flat + 35 in 5 subdirs)
│   │   └── types/                        #     1 file (ThirdPartyType.sol)
│   ├── assetCapabilities/                #   15 facets, 14 interfaces
│   │   ├── adjustBalances/               #     1 facet + 1 abstract
│   │   ├── interestRates/                #     3 facets + 3 abstracts (fixedRate, kpiLinked, SPT)
│   │   ├── kpis/kpiLatest/               #     2 facets + 2 abstracts (kpiLinked, SPT)
│   │   ├── proceedRecipients/            #     3 facets + 3 abstracts
│   │   ├── scheduledTasks/               #     6 facets + 6 abstracts
│   │   └── interfaces/                   #     14 files
│   └── regulation/                       #   9 facets, 4 interfaces
│       ├── bondUSA/                      #     7 facets + 7 abstracts (all inherit TimestampProvider)
│       ├── equityUSA/                    #     1 facet + 1 abstract (inherits TimestampProvider)
│       ├── transferAndLock/              #     1 facet + 1 abstract (inherits TimestampProvider)
│       └── interfaces/                   #     4 files
├── lib/                   (38 files)     # Shared libraries
│   ├── core/              (12 files)     #   Generic: LibAccess, LibPause, LibCap, LibControlList, etc.
│   ├── domain/            (22 files)     #   Asset-specific: LibBond, LibERC1410, LibABAF, etc.
│   └── orchestrator/       (4 files)     #   Cross-domain: LibTokenTransfer, LibClearingOps, etc.
├── infrastructure/        (25 files)     # Diamond proxy, BLR, utilities (zero domain imports)
│   ├── diamond/            (4 files)     #   BLR, DiamondCutManager, wrappers
│   ├── proxy/              (7 files)     #   ResolverProxy, DiamondCut, DiamondLoupe, DiamondFacet
│   ├── interfaces/         (7 files)     #   IBusinessLogicResolver, IDiamondCut, etc.
│   ├── lib/                (7 files)     #   EnumerableSetBytes4, LibCheckpoints, TimestampProvider, etc.
│   └── proxies/            (1 file)      #   OZ TransparentUpgradeableProxy import
├── constants/              (7 files)     # Roles, storage positions, resolver keys
├── storage/                (5 files)     # Unified storage layout definitions
├── factory/               (25 files)     # Token deployment (Factory, TREXFactory, libraries)
├── mocks/                 (10 files)     # Test mocks
└── test/                  (70 files)     # Test contracts (zero production imports FROM here)
    ├── timeTravel/        (68 files)     #   TimeTravel architecture
    │   ├── TimeTravelProvider.sol        #     Test-only mixin overriding TimestampProvider
    │   ├── TimeTravel.sol                #     Abstract contract with time manipulation methods
    │   ├── LibTimeTravel.sol             #     Library reading/writing timestamp storage
    │   ├── TimeTravelFacet.sol           #     Concrete Diamond wrapper
    │   ├── ITimeTravel.sol               #     Consolidated interface
    │   └── variants/      (63 files)     #     Per-facet TimeTravel variants (C3 mixin pattern)
    ├── compliance/         (1 file)
    └── identity/           (1 file)
```

### Facet Count Summary

| Area                    | Facets | Abstract Bases | Interfaces |
| ----------------------- | ------ | -------------- | ---------- |
| features/               | 38     | 38             | 55         |
| assetCapabilities/      | 15     | 15             | 14         |
| regulation/             | 9      | 9              | 4          |
| test/ (TimeTravelFacet) | 1      | —              | —          |
| **Total**               | **63** | **56**         | **73**     |

---

## 14. Conclusion

The ATS contracts evolved across two major refactors from 777 files with 55-contract inheritance chains to 372 files with a clean 2-level abstract-base pattern and proper production/test separation.

### Stage-by-Stage Summary

| Stage            | Problem Addressed                                               | Solution                                                          |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Original**     | 55-contract chain, 543 virtual functions, 4x forced duplication | —                                                                 |
| **1st Refactor** | Replace inheritance with libraries                              | 37 libraries + 48 FacetBases, delete StorageWrappers              |
| **2nd Refactor** | Eliminate forced duplication, clean test separation             | Delete variants, abstract-base pattern, TimestampProvider + mixin |

### What Makes This Architecture Work

1. **Libraries as the integration layer**: All cross-facet dependencies flow through libraries, not inheritance
2. **Abstract contracts for business logic**: Clean separation of _what_ (abstract) from _how_ (concrete facet)
3. **Rate-specific only where needed**: 16 facets have genuinely different code; 47 are shared
4. **Clean TimeTravel separation**: `TimestampProvider` in production, `TimeTravelProvider` mixin in test/ — zero production imports from test/
5. **Flat interface organization**: `I{Feature}.sol` — no StorageWrapper suffix, logical grouping
6. **Self-documenting directory structure**: Every name tells you what's inside

> For complete quantitative measurements across both architectures, see **[MIGRATION_METRICS.md](./MIGRATION_METRICS.md)**.
