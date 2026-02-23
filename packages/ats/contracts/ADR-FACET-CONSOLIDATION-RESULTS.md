# ADR: Facet Consolidation & Abstract-Base Pattern — Results

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  ARCHITECTURE DECISION RECORD — COMPLETE EVOLUTION RESULTS                  ║
║  Asset Tokenization Studio (ATS)                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Status:      COMPLETED                                                     ║
║  Date:        2026-02-23                                                    ║
║  Authors:     Miguel Gómez Carpena                                          ║
║  Reference:   ADR-LIBRARY-MIGRATION-RESULTS.md (1st refactor results)      ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Three-Stage Metrics Comparison](#2-three-stage-metrics-comparison)
3. [Stage 1: Original Architecture](#3-stage-1-original-architecture)
4. [Stage 2: Library Migration (1st Refactor)](#4-stage-2-library-migration-1st-refactor)
5. [Stage 3: Facet Consolidation (2nd Refactor)](#5-stage-3-facet-consolidation-2nd-refactor)
6. [Architecture Evolution](#6-architecture-evolution)
7. [TimeTravel Evolution](#7-timetravel-evolution)
8. [Interface Evolution](#8-interface-evolution)
9. [What Remains Rate-Specific](#9-what-remains-rate-specific)
10. [Trade-offs and Assessment Per Stage](#10-trade-offs-and-assessment-per-stage)
11. [Appendix A: Optimizer Runs Impact Analysis](#11-appendix-a-optimizer-runs-impact-analysis)
12. [Final Directory Structure](#12-final-directory-structure)
13. [Conclusion](#13-conclusion)

---

## 1. Executive Summary

The Asset Tokenization Studio contracts evolved across three architectural stages, from 777 Solidity files with 55+ contract inheritance chains to 307 files with clean 2-level abstract-base patterns — while maintaining full backward compatibility and passing every test.

### The Three Stages

| Stage            | Architecture           | Total .sol | Production Facets      | LOC    | Key Achievement                                             |
| ---------------- | ---------------------- | ---------- | ---------------------- | ------ | ----------------------------------------------------------- |
| **Original**     | Deep inheritance chain | 777        | ~196 (4 variants each) | 34,297 | Internals.sol with 543 virtual functions                    |
| **1st Refactor** | Library + FacetBase    | 641        | 195 (4 variants each)  | 34,273 | 37 libraries replaced inheritance chain                     |
| **2nd Refactor** | Abstract-base          | 307        | 63 (1 copy each)       | 29,869 | Variants deleted, FacetBases eliminated, TimeTravel unified |

### Cumulative Impact

| Metric              | Change    | Numbers                      |
| ------------------- | --------- | ---------------------------- |
| Total .sol files    | −61%      | 777 → 307 (−470 files)       |
| Production facets   | −68%      | ~196 → 63 (−133 facets)      |
| Total LOC           | −13%      | 34,297 → 29,869 (−4,428 LOC) |
| Inheritance depth   | −96%      | 55+ contracts → 2 levels     |
| Virtual functions   | −100%     | 543 → 0                      |
| TimeTravel variants | −99%      | 196 → 1 facet                |
| Test files (.sol)   | −97%      | 202 → 6 files                |
| Clean compile       | −83%      | 2m 11s → 22.5s               |
| Test execution      | −54%      | 1m 42s → 47s                 |
| Tests passing       | Unchanged | 1,257 contract tests         |
| External ABI        | Unchanged | 100% backward compatible     |

### 2nd Refactor Headline Results

| Metric                          | Before (1st Refactor) | After (2nd Refactor) | Delta             |
| ------------------------------- | --------------------- | -------------------- | ----------------- |
| Total .sol files                | 641                   | 307                  | −334 (−52%)       |
| Production facets               | 195                   | 63                   | −132 (−68%)       |
| FacetBase files                 | 48                    | 0                    | −48 (eliminated)  |
| Abstract base contracts         | 0                     | 56                   | +56 (new pattern) |
| TimeTravel variant files        | 196                   | 4                    | −192 (unified)    |
| `standard/` directories         | 33                    | 0                    | −33 (eliminated)  |
| Interface files (under facets/) | 86                    | 73                   | −13 (flattened)   |
| Test .sol files                 | 202                   | 6                    | −196              |
| Total LOC                       | 34,273                | 29,869               | −4,404 (−13%)     |
| Clean compile time              | 1m 23s                | **22.5s**            | **−73%**          |
| Test execution time             | 1m 17s                | **47s**              | **−39%**          |
| Tests passing                   | 1,257                 | 1,257                | Unchanged         |
| Git diff (total)                | —                     | 625 files changed    | +7,181 / −19,899  |

---

## 2. Three-Stage Metrics Comparison

### Codebase Size

| Metric                            | Original   | 1st Refactor | 2nd Refactor |
| --------------------------------- | ---------- | ------------ | ------------ |
| **Total Solidity files**          | **777**    | **641**      | **307**      |
| Production .sol (excl test/mocks) | ~575       | 429          | 291          |
| Test .sol files                   | ~200       | 202          | 6            |
| Mock .sol files                   | ~10        | 10           | 10           |
| **Total Solidity LOC**            | **34,297** | **34,273**   | **29,869**   |

### File Type Breakdown

| File Category                   | Original  | 1st Refactor | 2nd Refactor |
| ------------------------------- | --------- | ------------ | ------------ |
| Production facets               | ~196      | 195          | 63           |
| FacetBase files                 | 0         | 48           | 0            |
| Abstract base contracts         | 0         | 0            | 56           |
| StorageWrapper files            | 57        | 0            | 0            |
| Library files (lib/)            | 0         | 37           | 38           |
| Infrastructure files            | —         | 25           | 24           |
| Constants files                 | scattered | 7            | 7            |
| Storage files                   | —         | 5            | 5            |
| Factory files                   | ~25       | 25           | 25           |
| Interface files (under facets/) | scattered | 86           | 73           |
| TimeTravel variant files        | ~196+     | 196          | 4            |
| `standard/` directories         | many      | 33           | 0            |

### Architecture Pattern

| Stage            | Pattern                | Inheritance Depth            | Cross-Facet Dependencies                  |
| ---------------- | ---------------------- | ---------------------------- | ----------------------------------------- |
| **Original**     | Deep inheritance chain | 55+ contracts                | Via Internals.sol (543 virtual functions) |
| **1st Refactor** | Library + FacetBase    | 2 levels (Facet → FacetBase) | Via libraries (direct calls)              |
| **2nd Refactor** | Abstract-base          | 2 levels (Facet → Abstract)  | Via libraries (direct calls)              |

### LOC Distribution (1st vs 2nd Refactor)

| Area                 | 1st Refactor LOC | 2nd Refactor LOC | Delta  |
| -------------------- | ---------------- | ---------------- | ------ |
| facets/ (total)      | 14,307           | 12,686           | −1,621 |
| — features/          | 10,194           | 8,805            | −1,389 |
| — assetCapabilities/ | 2,019            | 1,892            | −127   |
| — regulation/        | 2,094            | 1,989            | −105   |
| lib/                 | 8,853            | 9,021            | +168   |
| infrastructure/      | 2,684            | 2,665            | −19    |
| test/                | 2,933            | 315              | −2,618 |
| mocks/               | 524              | 524              | 0      |
| constants/           | —                | 984              | —      |
| storage/             | —                | 860              | —      |
| factory/             | —                | 2,814            | —      |

### Build Performance

| Metric                                    | Original | 1st Refactor | 2nd Refactor |
| ----------------------------------------- | -------- | ------------ | ------------ |
| Clean compile (`hardhat compile --force`) | 2m 11s   | 1m 23s       | **22.5s**    |
| Contract tests (`hardhat test`)           | 1m 42s   | 1m 17s       | **47s**      |
| Compiled Solidity files                   | —        | —            | 397          |
| TypeChain typings generated               | —        | —            | 940          |

| Compile Improvement | vs Original               | vs 1st Refactor           |
| ------------------- | ------------------------- | ------------------------- |
| Clean compile       | **−83%** (2m 11s → 22.5s) | **−73%** (1m 23s → 22.5s) |
| Test execution      | **−54%** (1m 42s → 47s)   | **−39%** (1m 17s → 47s)   |

### Contract Sizes (2nd Refactor — Deployed Bytecode)

All facets remain within the 24 KiB EIP-170 limit. Largest facets:

| Contract                      | Size (KiB) | Near Limit?  |
| ----------------------------- | ---------- | ------------ |
| BondUSAKpiLinkedRateFacet     | 20.377     | Within limit |
| ERC1410ManagementFacet        | 20.734     | Within limit |
| ClearingActionsFacet          | 20.660     | Within limit |
| ERC1594Facet                  | 20.080     | Within limit |
| ERC20Facet                    | 19.914     | Within limit |
| BondUSASustainabilityPTRFacet | 19.830     | Within limit |
| HoldTokenHolderFacet          | 18.976     | Within limit |
| ERC3643BatchFacet             | 17.911     | Within limit |
| ERC1410TokenHolderFacet       | 17.449     | Within limit |
| BondUSAFixedRateFacet         | 17.060     | Within limit |
| ERC3643ManagementFacet        | 17.041     | Within limit |
| BondUSAFacet                  | 16.875     | Within limit |
| EquityUSAFacet                | 16.732     | Within limit |
| ERC3643OperationsFacet        | 16.463     | Within limit |
| ClearingHoldCreationFacet     | 16.400     | Within limit |

Smallest facets:

| Contract                         | Size (KiB) |
| -------------------------------- | ---------- |
| NoncesFacet                      | 0.603      |
| PauseFacet                       | 1.558      |
| TimeTravelFacet                  | 1.499      |
| ScheduledBalanceAdjustmentsFacet | 1.564      |
| ScheduledCouponListingFacet      | 1.564      |
| ScheduledSnapshotsFacet          | 1.564      |
| FixedRateFacet                   | 1.755      |
| ProtectedPartitionsFacet         | 1.907      |

Contract size comparison across all three stages (all compiled with identical settings: Solidity 0.8.28, cancun EVM, optimizer runs=100):

| Facet                     | Original (KiB) | 1st Refactor (KiB) | 2nd Refactor (KiB) | Original → Final |
| ------------------------- | -------------- | ------------------ | ------------------ | ---------------- |
| ERC1594Facet              | 20.105         | 19.969             | 20.080             | −0.025           |
| ERC1410ManagementFacet    | 20.963         | 20.654             | 20.734             | −0.229           |
| EquityUSAFacet            | 17.598         | 16.642             | 16.732             | −0.866           |
| BondUSAKpiLinkedRateFacet | 16.918         | 20.292             | 20.377             | +3.459           |
| BondUSAFixedRateFacet     | 16.878         | 16.988             | 17.060             | +0.182           |
| BondUSAFacet (variable)   | 16.688         | 16.804             | 16.875             | +0.187           |

> **Size changes by stage**: When measured with identical compiler settings, most facets show negligible size changes (< 0.3 KiB). Three facets actually _decreased_ — EquityUSAFacet (−0.866 KiB), ERC1410ManagementFacet (−0.229 KiB), and ERC1594Facet (−0.025 KiB). The only significant increase is BondUSAKpiLinkedRateFacet (+3.459 KiB), caused by KPI rate calculation logic being restructured during the 1st refactor. The 2nd refactor had negligible impact (all changes < 0.12 KiB). **No facets exceed the 24 KiB EIP-170 limit.**

Comprehensive comparison across all 29 matched facets (original vs 2nd refactor, same compiler):

| Facet                                        | Original (KiB) | 2nd Refactor (KiB) | Delta  |
| -------------------------------------------- | -------------- | ------------------ | ------ |
| ERC1410ManagementFacet                       | 20.963         | 20.734             | −0.229 |
| ClearingActionsFacet                         | 20.597         | 20.660             | +0.063 |
| ERC1594Facet                                 | 20.105         | 20.080             | −0.025 |
| ERC20Facet                                   | 19.407         | 19.914             | +0.507 |
| HoldTokenHolderFacet                         | 18.654         | 18.976             | +0.322 |
| ERC3643BatchFacet                            | 18.137         | 17.911             | −0.226 |
| ERC1410TokenHolderFacet                      | 17.618         | 17.449             | −0.169 |
| EquityUSAFacet                               | 17.598         | 16.732             | −0.866 |
| ERC3643ManagementFacet                       | 17.086         | 17.041             | −0.045 |
| BondUSAKpiLinkedRateFacet                    | 16.918         | 20.377             | +3.459 |
| BondUSASustainabilityPTRFacet                | 16.918         | 19.830             | +2.912 |
| BondUSAFixedRateFacet                        | 16.878         | 17.060             | +0.182 |
| BondUSAFacet                                 | 16.688         | 16.875             | +0.187 |
| ClearingHoldCreationFacet                    | 16.392         | 16.400             | +0.008 |
| ERC3643OperationsFacet                       | 16.368         | 16.463             | +0.095 |
| ClearingTransferFacet                        | 15.354         | 15.409             | +0.055 |
| ClearingRedeemFacet                          | 15.100         | 15.152             | +0.052 |
| ERC1410IssuerFacet                           | 14.207         | 14.220             | +0.013 |
| ERC1644Facet                                 | 13.232         | 13.123             | −0.109 |
| TransferAndLockFacet                         | 13.062         | 13.141             | +0.079 |
| HoldManagementFacet                          | 12.529         | 12.817             | +0.288 |
| LockFacet                                    | 12.053         | 12.342             | +0.289 |
| FreezeFacet                                  | 12.045         | 12.046             | +0.001 |
| ScheduledCrossOrderedTasksKpiLinkedRateFacet | 9.739          | 9.773              | +0.034 |
| ScheduledCrossOrderedTasksSPTRateFacet       | 8.967          | 9.474              | +0.507 |
| AccessControlFacet                           | 5.063          | 5.039              | −0.024 |
| CapFacet                                     | 3.935          | 4.313              | +0.378 |
| PauseFacet                                   | 1.555          | 1.558              | +0.003 |
| NoncesFacet                                  | 0.603          | 0.603              | 0.000  |

Summary: Of 29 facets, 8 decreased, 20 increased, 1 unchanged. **Average delta: +0.27 KiB**. Excluding the two BondUSA rate-restructured facets (+3.459, +2.912), the average delta is **+0.05 KiB** — effectively zero.

> **Compiler version correction**: Earlier measurements in `MIGRATION_BASELINE.md` compared original code compiled with Solidity 0.8.17/london against migrated code compiled with 0.8.28/cancun, showing apparent massive increases (e.g., ERC1594: 7.654 → 20.080 = +12.4 KiB). These increases were entirely caused by the compiler version change, not the library migration. Solidity 0.8.28 produces significantly larger bytecode for contracts with deep inheritance chains due to different dead code elimination behavior. With identical compiler settings (0.8.28/cancun), the same original ERC1594 code produces 20.105 KiB — making the actual migration impact −0.025 KiB. The BondUSA facets (already near 17 KiB in both compilers) were unaffected by the version change because the compiler already included most of their inheritance chain at 0.8.17.

---

## 3. Stage 1: Original Architecture

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

The solution (documented as "Option 2: Internal calls" in Confluence) created one contract per strategy. To handle cross-facet dependencies, a linear inheritance chain called `Common.sol` was used. Each strategy required **its own Common chain** because strategy-specific StorageWrappers were part of the C3 linearization.

This forced every facet — even rate-agnostic ones like AccessControl or Pause — to have 4 copies compiled with 4 different Common chains.

### Key Numbers

| Metric                | Count                     |
| --------------------- | ------------------------- |
| Total .sol files      | 777                       |
| Production facets     | ~196 (4 variants each)    |
| StorageWrapper files  | 57 (linear chain)         |
| Internals.sol LOC     | 1,456                     |
| Virtual functions     | 543                       |
| Modifiers             | 46                        |
| Common chain variants | 4 (one per rate strategy) |

### Pain Points

- Adding a new feature required inserting a StorageWrapper link into the chain, adding virtual functions to Internals.sol, and creating 4 facet variants
- Every facet compiled with ~55 contracts in its inheritance tree
- 3 out of 4 variant copies of rate-agnostic facets were 100% identical
- Virtual function dispatch made code tracing difficult

---

## 4. Stage 2: Library Migration (1st Refactor)

### What Changed

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

| Component              | Files    | LOC        |
| ---------------------- | -------- | ---------- |
| Internals.sol          | 1        | 1,456      |
| Modifiers.sol          | 1        | 111        |
| Common.sol chain       | ~4       | ~800       |
| StorageWrapper chain   | ~57      | ~3,500     |
| Old abstract contracts | ~53      | —          |
| **Total deleted**      | **~116** | **~5,867** |

### What Was Added

| Component        | Files  | LOC        |
| ---------------- | ------ | ---------- |
| Libraries (lib/) | 37     | 8,495      |
| FacetBase files  | 48     | —          |
| **Total added**  | **85** | **~8,495** |

### Infrastructure Restructuring

- Layers renamed: `layer_0` → `infrastructure`, `layer_1` → `features`, `layer_2` → `assetCapabilities`, `layer_3` → `regulation`
- All facets wrapped under `facets/` directory
- Constants consolidated from scattered locations into single `constants/` directory
- Infrastructure extracted to self-contained directory with zero domain imports

### What Was Preserved

Despite the radical internal restructuring, the 1st refactor preserved:

- **All 195 production facets** (4 variants per rate type)
- **196 TimeTravel variant files** (per-facet `_getBlockTimestamp()` override pattern)
- **33 `standard/` directories** (stubs for rate-agnostic facets)
- **External ABI** — same function signatures, same storage layout
- **All 1,257 contract tests** passing

### Key Numbers

| Metric          | Before | After  | Delta         |
| --------------- | ------ | ------ | ------------- |
| Total .sol      | 777    | 641    | −136 (−17%)   |
| LOC             | 34,297 | 34,273 | −24 (neutral) |
| Facets          | ~196   | 195    | ~same         |
| Libraries       | 0      | 37     | +37           |
| FacetBases      | 0      | 48     | +48           |
| StorageWrappers | 57     | 0      | −57           |
| Compile time    | 2m 11s | 1m 23s | −37%          |

---

## 5. Stage 3: Facet Consolidation (2nd Refactor)

The 2nd refactor was completed in 4 commits over 2 days (2026-02-19 to 2026-02-20), each targeting a specific consolidation goal.

### Commit-by-Commit Progression

| State                  | Total .sol | Facets | FacetBases | TT Variants | LOC    |
| ---------------------- | ---------- | ------ | ---------- | ----------- | ------ |
| Before (1st refactor)  | 641        | 195    | 48         | 196         | 34,273 |
| After commit 1         | 377        | 63     | 48         | 64          | 30,427 |
| After commit 2         | 361        | 63     | 0          | 64          | 30,575 |
| After commit 3         | 299        | 63     | 0          | 4           | 29,820 |
| After commit 4 (final) | 307        | 63     | 0          | 4           | 29,869 |

### Commit 1: `466e2cec6` — Variant Consolidation

**Date**: 2026-02-19 14:48 CET
**Git diff**: 274 files changed, +2,233 / −13,400

Deleted all rate-agnostic duplicate facets. Of the 195 facets, only 63 had unique code — the remaining 132 were identical copies that existed solely because of the old Common chain requirement.

**What was deleted:**

- 132 rate-agnostic production facet variants (fixedRate, kpiLinkedRate, sustainabilityPTR copies of AccessControl, Cap, ERC1410, ERC1594, ERC1643, ERC1644, ERC20, ERC20Permit, ERC20Votes, Pause, Lock, Freeze, Snapshots, CorporateActions, ControlList, ExternalControlLists, ExternalKycLists, ExternalPauses, Kyc, Nonces, ProtectedPartitions, SsiManagement, TotalBalance, Clearing, Hold, AdjustBalances, ScheduledBalanceAdjustments, ScheduledCouponListing, ScheduledSnapshots, TransferAndLock, and more)
- 132 corresponding TimeTravel wrapper files
- Unused resolver key constants from assets.sol and features.sol

**Impact**: 641 → 377 files (−264), 34,273 → 30,427 LOC (−3,846)

### Commit 2: `3b0c67a3c` — Abstract-Base Pattern + Interface Flattening

**Date**: 2026-02-20 10:46 CET
**Git diff**: 286 files changed, +3,402 / −3,241

Replaced the FacetBase pattern with abstract contracts and flattened the interface hierarchy.

**What changed:**

- All 48 FacetBase files replaced with 48 abstract contracts (e.g., `PauseFacetBase` → `Pause`)
- All 33 `standard/` directory stubs eliminated
- Interface hierarchy flattened: `I{Feature}StorageWrapper.sol` → `I{Feature}.sol`
- Nested interface directories reorganized into logical groupings
- Interfaces reduced from 86 to 70 files

**Why abstract contracts instead of FacetBase?**

- `Pause` (what it does) is clearer than `PauseFacetBase` (how it's structured)
- Abstract contracts define business logic; concrete facets implement Diamond infrastructure
- The naming aligns with intent rather than pattern mechanics

**Impact**: 377 → 361 files (−16), 30,427 → 30,575 LOC (+148 — restructuring, not growth)

### Commit 3: `59c044a4b` — TimeTravel Unification

**Date**: 2026-02-20 13:08 CET
**Git diff**: 155 files changed, +852 / −2,583

Consolidated 64 scattered TimeTravel facet variants into a single unified pattern.

**Before**: Each facet had its own TimeTravel variant overriding `_getBlockTimestamp()`:

```solidity
// In 64 separate *TimeTravelFacet files
function _getBlockTimestamp() internal view override returns (uint256) {
  return TimeTravelStorageWrapper._blockTimestamp();
}
```

**After**: Single `LibTimeTravel` library, all facets use directly:

```solidity
uint256 currentTimestamp = LibTimeTravel.getBlockTimestamp();
```

**Created:**

- `TimeTravel.sol` (abstract contract, business logic)
- `LibTimeTravel.sol` (library, storage-based timestamp management)
- `TimeTravelFacet.sol` (thin Diamond wrapper)
- `ITimeTravel.sol` (consolidated interface, merged from `ITimeTravelStorageWrapper`)

**Deleted:**

- 64 old TimeTravel facet variant files
- Old TimeTravel interfaces and storage wrapper files
- 2,086 lines of duplicated override code

**Impact**: 361 → 299 files (−62), 30,575 → 29,820 LOC (−755)

### Commit 4: `2440dace4` — Abstract-Base for Rate-Specific Facets

**Date**: 2026-02-20 16:23 CET
**Git diff**: 21 files changed, +1,281 / −1,262

Applied the abstract-base pattern to the remaining rate-specific facets — the ones that genuinely differ per rate type.

**Created 8 abstract base contracts:**

- `ScheduledCrossOrderedTasksKpiLinkedRate` — KPI-specific scheduled task logic
- `ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRate` — SPT-specific logic
- `BondUSAFixedRate` — Fixed rate bond implementation
- `BondUSAKpiLinkedRate` — KPI rate bond implementation
- `BondUSAReadKpiLinkedRate` — KPI read operations (dynamic `getCoupon()`)
- `BondUSAReadSustainabilityPerformanceTargetRate` — SPT read operations
- `BondUSASustainabilityPerformanceTargetRate` — SPT bond implementation
- `EquityUSA` — Consolidated equity implementation (485 lines of core logic)

**Concrete facets simplified**: average size reduced from ~480 to ~70 lines (−85%), now containing only Diamond infrastructure (`getStaticResolverKey`, `getStaticFunctionSelectors`, `getStaticInterfaceIds`).

**Infrastructure cleanup**: Deleted `IBusinessLogicResolverWrapper.sol`, moved error declarations to `IBusinessLogicResolver.sol`.

**Impact**: 299 → 307 files (+8 new abstract bases + IERC712), 29,820 → 29,869 LOC (+49 — restructuring)

---

## 6. Architecture Evolution

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

### Code: 2nd Refactor Pause Implementation

**Pause.sol** — abstract contract with all business logic:

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "../interfaces/IPause.sol";
import { _PAUSER_ROLE } from "../../../constants/roles.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";

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
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pause } from "./Pause.sol";
import { IPause } from "../interfaces/IPause.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _PAUSE_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract PauseFacet is Pause, IStaticFunctionSelectors {
  function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
    staticResolverKey_ = _PAUSE_RESOLVER_KEY;
  }

  function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
    uint256 selectorIndex;
    staticFunctionSelectors_ = new bytes4[](3);
    staticFunctionSelectors_[selectorIndex++] = this.pause.selector;
    staticFunctionSelectors_[selectorIndex++] = this.unpause.selector;
    staticFunctionSelectors_[selectorIndex++] = this.isPaused.selector;
  }

  function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
    staticInterfaceIds_ = new bytes4[](1);
    uint256 selectorsIndex;
    staticInterfaceIds_[selectorsIndex++] = type(IPause).interfaceId;
  }
}
```

**Total**: 2 files, ~53 lines of code (28 business logic + 25 infrastructure).

### Before vs After: Adding a New Feature

**Original (8+ files, chain modification required):**

1. Create StorageWrapper — insert into 57-contract linear chain
2. Add virtual functions to Internals.sol
3. Add modifiers to Modifiers.sol
4. Create abstract implementation calling `_internalFunction()`
5. Create 4 variant Facets (standard, fixedRate, kpiLinked, SPT)
6. Update all 4 Common chain variants
7. Create 4 TimeTravel variant files

**2nd Refactor (3 files, no chain modification):**

1. Create library (`lib/domain/Lib{Feature}.sol`) — business logic
2. Create abstract contract (`facets/features/{dir}/{Feature}.sol`) — using libraries
3. Create concrete facet (`facets/features/{dir}/{Feature}Facet.sol`) — Diamond infrastructure only

No existing files need modification. No chain to update. No variants to duplicate.

---

## 7. TimeTravel Evolution

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

196 files containing identical override logic. The test/ directory alone was 202 files, 2,933 LOC.

### 2nd Refactor: 4 TimeTravel Files

Single `LibTimeTravel` library eliminates all overrides:

```solidity
library LibTimeTravel {
  function getBlockTimestamp() internal view returns (uint256) {
    TimeTravelStorage storage tts = _getStorage();
    return tts.timestamp != 0 ? tts.timestamp : block.timestamp;
  }
}
```

Any facet needing time-based logic uses `LibTimeTravel.getBlockTimestamp()` directly — no virtual method, no override, no per-facet variant.

**Final TimeTravel architecture (4 files, 315 LOC):**

- `TimeTravel.sol` — abstract contract with time manipulation methods
- `LibTimeTravel.sol` — library reading/writing timestamp storage
- `TimeTravelFacet.sol` — concrete Diamond wrapper (~30 lines)
- `ITimeTravel.sol` — consolidated interface (merged from `ITimeTravelStorageWrapper`)

| Metric                         | Original            | 1st Refactor        | 2nd Refactor                             |
| ------------------------------ | ------------------- | ------------------- | ---------------------------------------- |
| TimeTravel files               | ~196+               | 196                 | 4                                        |
| test/ directory LOC            | —                   | 2,933               | 315                                      |
| Override pattern               | Virtual function    | Virtual function    | Library call                             |
| Adding TimeTravel to new facet | Create variant file | Create variant file | Call `LibTimeTravel.getBlockTimestamp()` |

---

## 8. Interface Evolution

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

facets/assetCapabilities/interfaces/  # 17 files
facets/regulation/interfaces/         # 4 files
```

**Total**: 86 interface files. Every feature interface carried the `StorageWrapper` suffix.

### 2nd Refactor: 72 Interface Files in Flat + Logical Structure

```
facets/features/interfaces/           # 54 files (19 flat + 35 in 5 subdirs)
├── IAccessControl.sol                # 19 flat files for simple features
├── ICap.sol
├── IFreeze.sol
├── IKyc.sol
├── ILock.sol
├── IPause.sol
├── ISnapshots.sol
├── ... (12 more flat)
├── ERC1400/                          # Logical subdirectories for standards/families
├── ERC3643/
├── clearing/
├── controlList/
└── hold/

facets/assetCapabilities/interfaces/  # 14 files in domain-organized subdirs
facets/regulation/interfaces/         # 4 files
```

**Total**: 72 interface files (54 features + 14 assetCapabilities + 4 regulation).

| Metric                  | 1st Refactor         | 2nd Refactor             | Change         |
| ----------------------- | -------------------- | ------------------------ | -------------- |
| Total interface files   | 86                   | 73                       | −13            |
| Feature interfaces      | 65 (in 21 subdirs)   | 55 (20 flat + 5 subdirs) | −10, flattened |
| Asset interfaces        | 17                   | 14                       | −3             |
| Regulation interfaces   | 4                    | 4                        | unchanged      |
| `StorageWrapper` suffix | On every file        | Eliminated               | Cleaner naming |
| Feature subdirectories  | 21 (one per feature) | 6 (by standard/family)   | −15            |

---

## 9. What Remains Rate-Specific

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

## 10. Trade-offs and Assessment Per Stage

### Original → 1st Refactor

| Gained                                                             | Lost                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Eliminated Internals.sol (543 virtual functions)                   | BondUSAKpiLinkedRateFacet grew +3.5 KiB (rate logic restructuring) |
| 37% faster compilation                                             | ABI error declarations required explicitly                         |
| Self-documenting directory names                                   | Library functions need explicit `_currentTimestamp` parameter      |
| Infrastructure extractable (zero domain imports)                   | —                                                                  |
| No chain modification for new features                             | —                                                                  |
| **Bytecode size neutral** (avg delta < 0.2 KiB with same compiler) | —                                                                  |

LOC: Neutral (34,297 → 34,273). Files: −136.
Still preserved 4x variant duplication and per-facet TimeTravel pattern.

### 1st Refactor → 2nd Refactor

| Gained                                                   | Lost                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| 68% fewer facets (195 → 63)                              | Can't grep for "all FixedRate variants" (most were deleted) |
| Eliminated all 48 FacetBases                             | —                                                           |
| Unified TimeTravel (196 variants → 1 facet)              | —                                                           |
| Flattened interfaces (86 → 72, no StorageWrapper suffix) | —                                                           |
| 52% fewer files (641 → 307)                              | —                                                           |
| 13% LOC reduction (34,273 → 29,869)                      | —                                                           |
| Cleaner naming (business logic focus)                    | —                                                           |
| Zero behavioral changes                                  | —                                                           |

Assessment: The 2nd refactor was purely additive improvement. Every metric improved, nothing of value was lost. The "missing" rate variants were identical copies with no unique code.

### Cumulative Assessment

| Dimension              | Original            | 1st Refactor        | 2nd Refactor            |
| ---------------------- | ------------------- | ------------------- | ----------------------- |
| **Files**              | 777                 | 641 (−17%)          | 307 (−52%)              |
| **LOC**                | 34,297              | 34,273 (−0.07%)     | 29,869 (−13%)           |
| **Facets**             | ~196                | 195 (~same)         | 63 (−68%)               |
| **Inheritance**        | 55+ deep            | 2 levels            | 2 levels                |
| **Duplication**        | 4x per facet        | 4x per facet        | 1x (rate-agnostic)      |
| **TimeTravel**         | ~196+ files         | 196 files           | 4 files                 |
| **test/ .sol files**   | ~200                | 202                 | 6                       |
| **Pattern**            | Virtual dispatch    | Library + FacetBase | Library + Abstract-base |
| **Clean compile**      | 2m 11s              | 1m 23s (−37%)       | **22.5s (−83%)**        |
| **Test execution**     | 1m 42s              | 1m 17s (−25%)       | **47s (−54%)**          |
| **Tests**              | 1,257               | 1,257               | 1,257                   |
| **New feature effort** | 8+ files, chain mod | 5-6 files           | 3 files                 |

---

## 11. Appendix A: Optimizer Runs Impact Analysis

The Solidity optimizer `runs` parameter controls the trade-off between deployment cost/size (lower `runs`) and runtime gas cost (higher `runs`). This analysis measures the impact of different optimizer settings across all 28 measured facets.

### Methodology

Five configurations benchmarked against the full test suite (1,257 tests, Hardhat, Solidity 0.8.28/cancun + 0.8.17/london):

- `runs=1` — Optimize for smallest deployment size
- `runs=100` — Current production setting
- `runs=200`, `runs=500`, `runs=1000` — Progressively optimized for runtime

All measurements taken on the same machine, same commit (`2440dace4`), clean compile each time.

### Contract Size Impact (Deployed Bytecode)

Total size across 28 facets with `hardhat size-contracts`:

| Optimizer Runs      | Total (KiB) | Avg/Facet (KiB) | vs runs=1 | vs runs=100  |
| ------------------- | ----------- | --------------- | --------- | ------------ |
| **1**               | 584.9       | 20.89           | baseline  | −0.4%        |
| **100** _(current)_ | **587.4**   | **20.98**       | **+0.4%** | **baseline** |
| **200**             | 609.9       | 21.78           | +4.3%     | +3.8%        |
| **500**             | 630.7       | 22.52           | +7.8%     | +7.4%        |
| **1000**            | 664.8       | 23.74           | +13.7%    | +13.2%       |

#### Per-Facet Size Comparison (KiB)

| Facet                              | runs=1 | runs=100 | runs=200 | runs=500 | runs=1000  | Growth 1→1000 |
| ---------------------------------- | ------ | -------- | -------- | -------- | ---------- | ------------- |
| ERC1410ManagementFacet             | 20.635 | 20.734   | 21.332   | 22.695   | **23.704** | +14.9%        |
| BondUSAKpiLinkedRateFacet          | 20.262 | 20.377   | 21.208   | 22.006   | 23.083     | +13.9%        |
| ERC20Facet                         | 19.835 | 19.914   | 20.618   | 21.860   | 23.022     | +16.1%        |
| ERC1594Facet                       | 19.998 | 20.080   | 20.683   | 21.989   | 22.894     | +14.5%        |
| ClearingActionsFacet               | 20.567 | 20.660   | 21.245   | 21.994   | 22.771     | +10.7%        |
| TREXFactory                        | 22.812 | 22.850   | 22.944   | 23.228   | 23.562     | +3.3%         |
| BondUSASPTRateFacet                | 19.745 | 19.830   | 20.711   | 21.509   | 22.589     | +14.4%        |
| HoldTokenHolderFacet               | 18.852 | 18.976   | 19.771   | 20.358   | 21.202     | +12.5%        |
| ERC3643BatchFacet                  | 17.813 | 17.911   | 18.576   | 19.617   | 20.368     | +14.3%        |
| ERC3643ManagementFacet             | 17.013 | 17.041   | 17.834   | 19.067   | 20.185     | +18.6%        |
| BondUSAFixedRateFacet              | 16.986 | 17.060   | 17.703   | 18.501   | 19.539     | +15.0%        |
| EquityUSAFacet                     | 16.584 | 16.732   | 17.318   | 17.879   | 18.942     | +14.2%        |
| ERC3643OperationsFacet             | 16.371 | 16.463   | 17.140   | 18.195   | 18.873     | +15.3%        |
| ClearingHoldCreationFacet          | 16.393 | 16.400   | 17.122   | 17.308   | 18.134     | +10.6%        |
| ERC1410TokenHolderFacet            | 17.354 | 17.449   | 18.047   | 19.189   | 19.976     | +15.1%        |
| ClearingTransferFacet              | 15.404 | 15.409   | 16.131   | 16.310   | 17.136     | +11.2%        |
| ClearingRedeemFacet                | 15.147 | 15.152   | 15.874   | 16.039   | 16.854     | +11.3%        |
| ERC1410IssuerFacet                 | 14.147 | 14.220   | 14.854   | 15.830   | 16.570     | +17.1%        |
| TransferAndLockFacet               | 13.124 | 13.141   | 13.711   | 14.601   | 15.220     | +16.0%        |
| ERC1644Facet                       | 13.105 | 13.123   | 13.574   | 14.486   | 15.141     | +15.5%        |
| HoldManagementFacet                | 12.844 | 12.817   | 13.347   | 13.545   | 14.322     | +11.5%        |
| LockFacet                          | 12.324 | 12.342   | 13.001   | 13.378   | 14.032     | +13.9%        |
| FreezeFacet                        | 12.006 | 12.046   | 12.588   | 12.913   | 13.684     | +14.0%        |
| SchedCrossOrderedTasksKpiRateFacet | 9.645  | 9.773    | 10.185   | 10.394   | 10.578     | +9.7%         |
| SchedCrossOrderedTasksSPTRateFacet | 9.373  | 9.474    | 9.933    | 10.142   | 10.366     | +10.6%        |
| AccessControlFacet                 | 5.025  | 5.039    | 5.149    | 5.203    | 5.692      | +13.3%        |
| CapFacet                           | 4.275  | 4.313    | 4.399    | 4.442    | 4.799      | +12.3%        |
| PauseFacet                         | 1.552  | 1.558    | 1.582    | 1.597    | 1.806      | +16.4%        |

### EIP-170 Limit Analysis

The 24 KiB contract size limit is the critical constraint:

| Optimizer Runs      | Facets > 20 KiB | Facets > 22 KiB | Facets > 23 KiB | Closest to Limit                   |
| ------------------- | --------------- | --------------- | --------------- | ---------------------------------- |
| **1**               | 4               | 1 (TREXFactory) | 0               | TREXFactory: 22.812                |
| **100** _(current)_ | **4**           | **1**           | **0**           | **TREXFactory: 22.850**            |
| **200**             | 6               | 1               | 0               | TREXFactory: 22.944                |
| **500**             | 9               | 3               | 1               | TREXFactory: 23.228                |
| **1000**            | 12              | 5               | 4               | **ERC1410ManagementFacet: 23.704** |

At `runs=1000`, **ERC1410ManagementFacet reaches 23.704 KiB** — only **296 bytes from the 24 KiB EIP-170 limit**. Adding any feature to this facet would breach the limit. Four other facets also exceed 23 KiB, making this setting unsafe for future development.

### Gas Cost Impact

Average gas cost per operation across all measured function calls (excluding deployment):

| Optimizer Runs      | Avg Gas/Operation | vs runs=1 | vs runs=100  |
| ------------------- | ----------------- | --------- | ------------ |
| **1**               | 191,201           | baseline  | +0.3%        |
| **100** _(current)_ | **190,686**       | **−0.3%** | **baseline** |
| **200**             | 190,451           | −0.4%     | −0.1%        |
| **500**             | 190,223           | −0.5%     | −0.2%        |
| **1000**            | 190,088           | −0.6%     | −0.3%        |

**Key finding**: The entire range from `runs=1` to `runs=1000` produces only a **0.6% gas reduction** for function calls — approximately **1,113 gas per transaction**. This is negligible compared to the 13.7% contract size increase.

#### Select Function Gas Comparison

| Function                                    | runs=1  | runs=100 | runs=1000 | Savings 1→1000 |
| ------------------------------------------- | ------- | -------- | --------- | -------------- |
| ERC20Facet.transfer                         | 384,670 | 381,372  | 381,119   | −3,551 (−0.9%) |
| ERC1410TokenHolderFacet.transferByPartition | 572,998 | 569,419  | 569,158   | −3,840 (−0.7%) |
| ERC3643OperationsFacet.mint                 | 430,336 | 427,915  | 427,658   | −2,678 (−0.6%) |
| ERC3643OperationsFacet.forcedTransfer       | 367,189 | 364,893  | 364,675   | −2,514 (−0.7%) |
| HoldTokenHolderFacet.createHoldByPartition  | 398,877 | 396,529  | 396,214   | −2,663 (−0.7%) |
| LockFacet.lockByPartition                   | 373,164 | 370,750  | 370,449   | −2,715 (−0.7%) |
| FreezeFacet.unfreezePartialTokens           | 275,195 | 273,018  | 272,674   | −2,521 (−0.9%) |
| PauseFacet.pause                            | 72,391  | 71,867   | 71,763    | −628 (−0.9%)   |

### Deployment Gas Cost

Average deployment gas across all Factory.deploy\* operations:

| Optimizer Runs      | Avg Deploy Gas | vs runs=1 | vs runs=100  |
| ------------------- | -------------- | --------- | ------------ |
| **1**               | 1,734,148      | baseline  | +0.4%        |
| **100** _(current)_ | **1,727,308**  | **−0.4%** | **baseline** |
| **200**             | 1,726,265      | −0.5%     | −0.06%       |
| **500**             | 1,732,275      | −0.1%     | +0.3%        |
| **1000**            | 1,756,167      | +1.3%     | +1.7%        |

Deployment gas follows a U-curve: lowest at `runs=200`, then **increasing** at higher values. At `runs=1000`, deployment is more expensive than `runs=1` — the larger bytecodes require more gas to deploy.

### Summary and Recommendation

```
                   Contract Size vs Gas Savings (runs=1 to runs=1000)

  Size:     ████████████████████████████████████████████  +13.7%  (584.9 → 664.8 KiB)
  Gas:      ██                                            −0.6%   (191,201 → 190,088 avg)
  Deploy:   ████                                          +1.3%   (1,734,148 → 1,756,167 avg)
```

| Criterion        | runs=1 | runs=100  | runs=200 | runs=500 | runs=1000  |
| ---------------- | ------ | --------- | -------- | -------- | ---------- |
| Total size (KiB) | 584.9  | **587.4** | 609.9    | 630.7    | 664.8      |
| EIP-170 headroom | Best   | Good      | Moderate | Low      | **Unsafe** |
| Function gas     | +0.3%  | Baseline  | −0.1%    | −0.2%    | −0.3%      |
| Deploy gas       | +0.4%  | Baseline  | −0.06%   | +0.3%    | +1.7%      |
| Future-proof     | Best   | **Good**  | Moderate | Risky    | **No**     |

**Recommendation: Keep `runs=100` (current setting).**

1. **Size safety**: Only +2.5 KiB total above the absolute minimum (`runs=1`), with comfortable headroom below EIP-170
2. **Gas efficiency**: Captures most of the gas savings available — the marginal benefit from `runs=200` to `runs=1000` is only 0.3% additional
3. **Deployment cost**: Near-optimal deployment gas; higher values actually increase deployment cost
4. **Future development**: Sufficient headroom for new features without approaching the 24 KiB limit
5. **Industry standard**: `runs=200` is the Solidity compiler default; `runs=100` is conservative and well-suited for complex diamond-pattern contracts

---

## 12. Final Directory Structure

### Complete Layout (307 .sol files)

```
contracts/                                # 307 .sol files total
├── facets/                               # ALL diamond entry points
│   ├── features/                         #   38 facets, 19+35 interfaces, 1 types file
│   │   ├── ERC1400/                      #     10 facets: ERC1410 (4), ERC1594, ERC1643, ERC1644, ERC20, ERC20Permit, ERC20Votes
│   │   ├── ERC3643/                      #     4 facets: Batch, Management, Operations, Read
│   │   ├── accessControl/                #     1 facet + 1 abstract
│   │   ├── cap/                          #     1 facet + 1 abstract
│   │   ├── clearing/                     #     5 facets + 5 abstracts: Actions, HoldCreation, Read, Redeem, Transfer
│   │   ├── controlList/                  #     1 facet + 1 abstract
│   │   ├── corporateActions/             #     1 facet + 1 abstract
│   │   ├── externalControlLists/         #     1 facet + 1 abstract
│   │   ├── externalKycLists/             #     1 facet + 1 abstract
│   │   ├── externalPauses/              #     1 facet + 1 abstract
│   │   ├── freeze/                       #     1 facet + 1 abstract
│   │   ├── hold/                         #     3 facets + 3 abstracts: Management, Read, TokenHolder
│   │   ├── kyc/                          #     1 facet + 1 abstract
│   │   ├── lock/                         #     1 facet + 1 abstract
│   │   ├── nonces/                       #     1 facet + 1 abstract
│   │   ├── pause/                        #     1 facet + 1 abstract
│   │   ├── protectedPartitions/          #     1 facet + 1 abstract
│   │   ├── snapshots/                    #     1 facet + 1 abstract
│   │   ├── ssi/                          #     1 facet + 1 abstract
│   │   ├── totalBalance/                 #     1 facet + 1 abstract
│   │   ├── interfaces/                   #     55 files (20 flat + 35 in 5 subdirs)
│   │   └── types/                        #     1 file (ThirdPartyType.sol)
│   ├── assetCapabilities/                #   15 facets, 14 interfaces
│   │   ├── adjustBalances/               #     1 facet + 1 abstract
│   │   ├── interestRates/                #     3 facets + 3 abstracts (fixedRate, kpiLinked, SPT)
│   │   ├── kpis/kpiLatest/               #     2 facets + 2 abstracts (kpiLinked, SPT)
│   │   ├── proceedRecipients/            #     3 facets + 3 abstracts (standard + kpiLinked, SPT)
│   │   ├── scheduledTasks/               #     6 facets + 6 abstracts (balanceAdj, couponListing, crossOrdered×3, snapshots)
│   │   └── interfaces/                   #     14 files in domain-organized subdirs
│   └── regulation/                       #   9 facets, 4 interfaces
│       ├── bondUSA/                      #     7 facets + 7 abstracts (variable, fixed, kpiLinked, SPT + reads)
│       ├── equityUSA/                    #     1 facet + 1 abstract
│       ├── transferAndLock/              #     1 facet + 1 abstract
│       └── interfaces/                   #     4 files
├── lib/                   (38 files)     # Shared libraries
│   ├── core/              (12 files)     #   Generic: LibAccess, LibPause, LibCap, LibControlList, LibERC712, etc.
│   ├── domain/            (22 files)     #   Asset-specific: LibBond, LibERC1410, LibABAF, LibRegulation, etc.
│   └── orchestrator/       (4 files)     #   Cross-domain: LibTokenTransfer, LibClearingOps, etc.
├── infrastructure/        (24 files)     # Diamond proxy, BLR, utilities (zero domain imports)
│   ├── diamond/            (4 files)     #   BLR, DiamondCutManager, wrappers
│   ├── proxy/              (7 files)     #   ResolverProxy, DiamondCut, DiamondLoupe, DiamondFacet
│   ├── interfaces/         (7 files)     #   IBusinessLogicResolver, IDiamondCut, etc.
│   ├── lib/                (6 files)     #   EnumerableSetBytes4, LibCheckpoints, LibPagination, etc.
│   └── proxies/            (1 file)      #   OZ TransparentUpgradeableProxy import
├── constants/              (7 files)     # Roles, storage positions, resolver keys
│   ├── eip1066.sol
│   ├── roles.sol                         #   30 access control roles
│   ├── storagePositions.sol              #   ~41 storage positions
│   ├── values.sol
│   └── resolverKeys/       (3 files)     #   features.sol, assets.sol, regulation.sol
├── storage/                (5 files)     # Unified storage layout definitions
│   ├── CoreStorage.sol                   #   Access control, pause, KYC, control lists
│   ├── TokenStorage.sol                  #   ERC1410, ERC1594, ERC20, snapshots, locks
│   ├── AssetStorage.sol                  #   Bond, equity, interest rates, ABAF
│   ├── ExternalStorage.sol               #   External lists, SSI, nonces, EIP-712
│   └── ScheduledStorage.sol              #   Scheduled tasks, coupons, balance adjustments
├── factory/               (25 files)     # Token deployment (Factory, TREXFactory, libraries)
├── mocks/                 (10 files)     # Test mocks
└── test/                   (6 files)     # Test contracts
    ├── timeTravel/         (4 files)     #   TimeTravel.sol, LibTimeTravel.sol, TimeTravelFacet.sol, ITimeTravel.sol
    ├── compliance/         (1 file)
    └── identity/           (1 file)
```

### Facet Count Summary

| Area                    | Facets | Abstract Bases                    | Interfaces |
| ----------------------- | ------ | --------------------------------- | ---------- |
| features/               | 38     | 38                                | 55         |
| assetCapabilities/      | 15     | 15                                | 14         |
| regulation/             | 9      | 9                                 | 4          |
| test/ (TimeTravelFacet) | 1      | —                                 | —          |
| **Total**               | **63** | **56** (+ 6 not needing abstract) | **73**     |

> Note: Some facets (like ERC1410IssuerFacet) don't have a separate abstract base because the parent abstract serves multiple facets in the same feature family.

---

## 13. Conclusion

The ATS contracts evolved across two major refactors from 777 files with 55-contract inheritance chains to 307 files with a clean 2-level abstract-base pattern.

### Stage-by-Stage Summary

| Stage            | Problem Addressed                                                                        | Solution                                                                     | Result                                                |
| ---------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Original**     | Business logic buried in 55-contract chain, 543 virtual functions, 4x forced duplication | —                                                                            | 777 files, ~196 facets                                |
| **1st Refactor** | Replace inheritance with libraries                                                       | 37 libraries + 48 FacetBases, delete StorageWrappers                         | 641 files, 195 facets, compile 1m 23s (−37%)          |
| **2nd Refactor** | Eliminate forced duplication, unify patterns                                             | Delete variants, abstract-base pattern, unify TimeTravel, flatten interfaces | 307 files, 63 facets, compile 22.5s (−83% cumulative) |

### Key Numbers

| Metric              | Original | 1st Refactor | 2nd Refactor | Cumulative      |
| ------------------- | -------- | ------------ | ------------ | --------------- |
| .sol files          | 777      | 641          | 307          | −470 (−61%)     |
| Production facets   | ~196     | 195          | 63           | −133 (−68%)     |
| LOC                 | 34,297   | 34,273       | 29,869       | −4,428 (−13%)   |
| Inheritance depth   | 55+      | 2            | 2            | −96%            |
| Virtual functions   | 543      | 0            | 0            | −100%           |
| TimeTravel variants | ~196+    | 196          | 1            | −99%            |
| Test .sol files     | ~200     | 202          | 6            | −97%            |
| Clean compile       | 2m 11s   | 1m 23s       | **22.5s**    | −83%            |
| Test execution      | 1m 42s   | 1m 17s       | **47s**      | −54%            |
| Tests passing       | 1,257    | 1,257        | 1,257        | Unchanged       |
| External ABI        | —        | Unchanged    | Unchanged    | 100% compatible |

### What Makes This Architecture Work

1. **Libraries as the integration layer**: All cross-facet dependencies flow through libraries, not inheritance
2. **Abstract contracts for business logic**: Clean separation of _what_ (abstract) from _how_ (concrete facet)
3. **Rate-specific only where needed**: 16 facets have genuinely different code; 47 are shared
4. **Unified TimeTravel**: One library, one facet, zero per-feature duplication
5. **Flat interface organization**: `I{Feature}.sol` — no StorageWrapper suffix, logical grouping
6. **Self-documenting directory structure**: Every name tells you what's inside

### Adding New Features

```
1. lib/domain/Lib{Feature}.sol        — Business logic (library)
2. facets/features/{dir}/{Feature}.sol — Business logic (abstract contract using libraries)
3. facets/features/{dir}/{Feature}Facet.sol — Diamond infrastructure (concrete, ~25 lines)
4. facets/features/interfaces/I{Feature}.sol — External ABI (interface)
```

For rate-specific features: extend the abstract base with rate-specific logic. Never duplicate.
