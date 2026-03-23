# ATS Library Architecture Migration Plan

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Decisions](#2-architecture-decisions)
3. [Migration Inventory](#3-migration-inventory)
4. [Migration Phases](#4-migration-phases)
5. [File-by-File Migration Patterns](#5-file-by-file-migration-patterns)
6. [Naming Mapping](#6-naming-mapping-complete)
7. [Risk Register](#7-risk-register)
8. [Re-engagement Protocol](#8-re-engagement-protocol)

---

## 1. Executive Summary

This plan migrates the ATS smart contract architecture from deep abstract-contract inheritance to Solidity libraries, while preserving the EIP-2535 Diamond pattern with ResolverProxy + BusinessLogicResolver (BLR).

### What Changes

- **58 abstract StorageWrapper contracts** → **~33 library contracts** (merged split wrappers, flattened hierarchy)
- **God objects eliminated**: `Internals.sol` (~200 virtual functions), `Modifiers.sol` (~50 virtual modifiers), `Common.sol` (4 variants) — all deleted
- **Rate variant explosion eliminated**: ~180 duplicate concrete facets reduced to ~30 (only kept where behavior genuinely differs)
- **Facets simplified**: 3-tier (Feature + FacetBase + Facet×4) → 2-tier (Feature + Facet)
- **16 IXxxStorageWrapper interfaces** → deleted (see justification below)
- **4 orchestrator libraries** added: TokenCoreOps, HoldOps, ClearingOps, ClearingReadOps

### What Stays the Same

- Diamond proxy pattern (ResolverProxy + BLR + DiamondCut)
- Facet selector registration via IStaticFunctionSelectors
- All external function signatures (ABI compatibility preserved)
- Storage layout (same bytes32 positions, same struct layouts)
- Layer organization: layer_1/ (core), layer_2/ (asset), layer_3/ (regulation)
- Test infrastructure and deployment scripts (updated imports only)

### Why

- **Eliminates ~50-level deep inheritance chain** — reduces cognitive load, compile time, and C3 linearization complexity
- **Explicit > implicit** — library calls are self-documenting; no more virtual dispatch guessing
- **~60% file reduction** in contracts directory (913→~380 files)
- **Merged split wrappers** — no more artificial StorageWrapper1/2 separation forced by inheritance positioning
- **SOLID compliance** — each library has single responsibility, no god objects

### Key Constraints

- Working from `origin/development` branch (NOT the spike branch directly)
- Keep `facets/layer_1/`, `layer_2/`, `layer_3/` directory structure
- Naming must follow domain concepts (see Section 6)
- Structs, errors, events MUST be inside interfaces — never file-level loose declarations
  - **EXCEPTION**: Storage structs used by libraries are declared at file level (same file as the library) because libraries cannot inherit interfaces, and these structs are internal implementation details, not part of the public API
- Solidity member ordering: external → public → internal → private
- All storage positions and struct layouts preserved exactly (storage-compatible migration)

---

## 2. Architecture Decisions

### Q1: Orchestrator Optimal Pattern — Libraries (Confirmed)

**Decision**: Orchestrators remain as **libraries** with `public` functions.

**Justification**:

- `public` library functions are deployed as separate contracts and invoked via DELEGATECALL by the EVM — identical to how facets work in the diamond pattern
- Libraries cannot hold state, which enforces statelessness (Single Responsibility Principle)
- Libraries compose other libraries cleanly without inheritance complications
- Dependency injection of `_timestamp`/`_blockNumber` parameters keeps orchestrators pure and testable
- No virtual dispatch overhead — all calls are resolved at compile time

**Orchestrators in production**:
| Library | Purpose | Dependencies |
|---------|---------|-------------|
| `TokenCoreOps` | Transfer, issue, redeem, ERC20 wrappers, approval, hooks | ERC1410StorageWrapper, ERC20StorageWrapper, ERC20VotesStorageWrapper, SnapshotsStorageWrapper, AdjustBalancesStorageWrapper, ERC3643StorageWrapper |
| `HoldOps` | Hold create/execute/release/reclaim, total balance queries | HoldStorageWrapper, ERC1410StorageWrapper, ERC20StorageWrapper, ClearingStorageWrapper |
| `ClearingOps` | Clearing operations (transfer, redeem, hold creation) | ClearingStorageWrapper, HoldStorageWrapper, TokenCoreOps, HoldOps |
| `ClearingReadOps` | Clearing read operations, preparation, validation | ClearingStorageWrapper, HoldStorageWrapper |

### Q2: Orchestrator Dependency Chain — Correct

Libraries can freely call other libraries. The dependency chain is:

```
Facet (concrete contract)
  ├── inherits Feature (abstract contract) — calls libraries directly
  │     ├── calls StorageWrapper libraries (AccessControlStorageWrapper.checkRole())
  │     ├── calls Orchestrator libraries (TokenCoreOps.transfer())
  │     └── inherits TimestampProvider (for _getBlockTimestamp()/_getBlockNumber())
  └── implements IStaticFunctionSelectors

Orchestrator libraries
  ├── call StorageWrapper libraries
  └── call other Orchestrator libraries (e.g., ClearingOps calls TokenCoreOps)

StorageWrapper libraries
  ├── call other StorageWrapper libraries (e.g., BondStorageWrapper calls CorporateActionsStorageWrapper)
  └── access storage via assembly slot pattern
```

No inheritance needed between libraries. All inter-library calls are direct static calls.

### Q3: Abstract Contracts That Survive

| Contract                                              | Type              | Reason                                                                                                 |
| ----------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `TimestampProvider`                                   | abstract contract | Provides overridable `_getBlockTimestamp()`/`_getBlockNumber()` for testing. Only facets inherit this. |
| Feature contracts (Pause, AccessControl, ERC20, etc.) | abstract contract | Facets inherit these for function signature exposure. They call libraries, not virtual functions.      |
| `IStaticFunctionSelectors`                            | interface         | Diamond infrastructure — unchanged                                                                     |
| All I\* facet interfaces                              | interface         | ABI definitions — unchanged                                                                            |

**DELETED (cannot survive)**:
| Contract | Reason |
|----------|--------|
| `Internals.sol` | God object with ~200 virtual functions — replaced by direct library calls |
| `Modifiers.sol` | ~50 virtual modifiers — replaced by library guard functions |
| `Common.sol` (all 4 variants) | Bridge between modifiers and StorageWrapper chain — eliminated with inheritance |
| All `IXxxStorageWrapper` interfaces | See "Why IXxxStorageWrapper Interfaces Are Deleted" below |
| `LocalContext` | Replaced by `TimestampProvider` |

#### Why IXxxStorageWrapper Interfaces Are Deleted

The 16 `IXxxStorageWrapper` interfaces (e.g., `IAccessControlStorageWrapper`, `IPauseStorageWrapper`, `IERC20StorageWrapper`) existed for one reason: **abstract contracts needed to inherit interfaces to emit their events and revert with their errors**. In the old pattern:

```solidity
// OLD: Abstract contract MUST inherit the interface to use its events/errors
abstract contract PauseStorageWrapper is IPauseStorageWrapper, ExternalPauseManagementStorageWrapper {
  function _setPaused(bool _paused) internal override {
    emit Paused(msg.sender); // ← only works because PauseStorageWrapper "is IPauseStorageWrapper"
  }
}
```

Since Solidity 0.8.4, events and errors can be referenced via **qualified names** (`InterfaceName.EventName`). Libraries cannot use `is` inheritance, but they don't need to — they reference events/errors from the **facet interfaces** that already define them:

```solidity
// NEW: Library references events/errors via qualified name from the facet interface
library PauseStorageWrapper {
  function pause() internal {
    emit IPause.TokenPaused(msg.sender); // ← qualified reference, no inheritance needed
  }
  function requireNotPaused() internal view {
    if (isPaused()) revert IPause.TokenIsPaused(); // ← same pattern for errors
  }
}
```

The events and errors logically belong to the **public facet interfaces** (`IPause`, `IAccessControl`, `IControlList`, etc.) — those are the ABI contracts that external consumers reference. The `IXxxStorageWrapper` interfaces were a **redundant duplication layer** that existed solely to satisfy the inheritance-based resolution requirement. With qualified references, this duplication is eliminated.

**Evidence from the spike**: Every library in the spike uses this pattern:

- `emit IPause.TokenPaused(msg.sender)` (PauseStorageWrapper)
- `revert IAccessControl.AccountHasNoRole(account, role)` (AccessControlStorageWrapper)
- `revert IControlListBase.AccountIsBlocked(account)` (ControlListStorageWrapper)

### Dependency Graph — BEFORE

```
                         Facet (concrete)
                           |
                    FacetBase (abstract) ──── IStaticFunctionSelectors
                           |
                    Feature (abstract) ──── IFeature
                           |
              Common (abstract) ──── SecurityStorageWrapper
                                          |
                                    EquityStorageWrapper
                                          |
                                    BondStorageWrapper
                                          |
                                    ... (~45 more abstract contracts) ...
                                          |
                                    NonceStorageWrapper
                                          |
                                    Internals (GOD OBJECT: ~200 virtual functions)
                                          |
                                    Modifiers (~50 virtual modifiers)
                                          |
                                    LocalContext → Context (OZ)
```

### Dependency Graph — AFTER

```
                         Facet (concrete)
                           |
                    Feature (abstract) ──── IFeature, TimestampProvider
                           |
              ┌────────────┼────────────────┐
              ↓             ↓                ↓
    StorageWrapper     Orchestrator    StorageWrapper
      Libraries          Libraries       Libraries
    (direct calls)     (direct calls)  (direct calls)
         |                  |                |
    Diamond Storage    (compose multiple   Diamond Storage
    (assembly slot)     StorageWrappers)   (assembly slot)
```

---

## 3. Migration Inventory

### 3.1 StorageWrapper Conversions (abstract contract → library)

| #   | Current File (development)                                                                                                                                                                                              | Action            | New File/Name                                        | Dependencies                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | domain/core/nonce/NonceStorageWrapper.sol                                                                                                                                                                               | CONVERT           | domain/core/NonceStorageWrapper.sol                  | (none)                                                                     |
| 2   | domain/core/resolverProxy/ResolverProxyStorageWrapper.sol                                                                                                                                                               | CONVERT → MOVE    | infrastructure/proxy/ResolverProxyStorageWrapper.sol | (none)                                                                     |
| 3   | domain/core/accessControl/AccessControlStorageWrapper.sol                                                                                                                                                               | CONVERT + FLATTEN | domain/core/AccessControlStorageWrapper.sol          | (none)                                                                     |
| 4   | domain/core/accessControl/IAccessControlStorageWrapper.sol                                                                                                                                                              | DELETE            | —                                                    | —                                                                          |
| 5   | domain/core/ssi/SsiManagementStorageWrapper.sol                                                                                                                                                                         | CONVERT + FLATTEN | domain/core/SsiManagementStorageWrapper.sol          | (none)                                                                     |
| 6   | domain/core/externalList/ExternalListManagementStorageWrapper.sol                                                                                                                                                       | CONVERT + MERGE   | domain/core/ExternalListManagementStorageWrapper.sol | Merges ExternalKyc, ExternalControlList, ExternalPause management wrappers |
| 7   | domain/core/externalKycList/ExternalKycListManagementStorageWrapper.sol                                                                                                                                                 | MERGE INTO #6     | —                                                    | —                                                                          |
| 8   | domain/core/externalControlList/ExternalControlListManagementStorageWrapper.sol                                                                                                                                         | MERGE INTO #6     | —                                                    | —                                                                          |
| 9   | domain/core/externalPause/ExternalPauseManagementStorageWrapper.sol                                                                                                                                                     | MERGE INTO #6     | —                                                    | —                                                                          |
| 10  | domain/core/kyc/KycStorageWrapper.sol                                                                                                                                                                                   | CONVERT + FLATTEN | domain/core/KycStorageWrapper.sol                    | (none)                                                                     |
| 11  | domain/core/protectedPartition/ProtectedPartitionsStorageWrapper.sol                                                                                                                                                    | CONVERT + FLATTEN | domain/core/ProtectedPartitionsStorageWrapper.sol    | (none)                                                                     |
| 12  | domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol                                                                                                                                                   | DELETE            | —                                                    | —                                                                          |
| 13  | domain/core/controlList/ControlListStorageWrapper.sol                                                                                                                                                                   | CONVERT + FLATTEN | domain/core/ControlListStorageWrapper.sol            | (none)                                                                     |
| 14  | domain/core/controlList/IControlListStorageWrapper.sol                                                                                                                                                                  | DELETE            | —                                                    | —                                                                          |
| 15  | domain/core/pause/PauseStorageWrapper.sol                                                                                                                                                                               | CONVERT + FLATTEN | domain/core/PauseStorageWrapper.sol                  | (none)                                                                     |
| 16  | domain/core/pause/IPauseStorageWrapper.sol                                                                                                                                                                              | DELETE            | —                                                    | —                                                                          |
| 17  | domain/asset/interestRate/kpiLinkedRate/KpiLinkedRateStorageWrapper.sol                                                                                                                                                 | CONVERT + MERGE   | domain/asset/InterestRateStorageWrapper.sol          | Merge all 3 rate wrappers into one                                         |
| 18  | domain/asset/interestRate/sustainabilityPerformanceTargetRate/SustainabilityPerformanceTargetRateStorageWrapper.sol                                                                                                     | MERGE INTO #17    | —                                                    | —                                                                          |
| 19  | domain/asset/interestRate/fixedRate/FixedRateStorageWrapper.sol                                                                                                                                                         | MERGE INTO #17    | —                                                    | —                                                                          |
| 20  | domain/asset/totalBalance/TotalBalancesStorageWrapper.sol                                                                                                                                                               | DELETE or INLINE  | —                                                    | Virtual-only base; functionality moved to orchestrators                    |
| 21  | domain/asset/proceedRecipient/ProceedRecipientsStorageWrapper.sol                                                                                                                                                       | CONVERT + FLATTEN | domain/asset/ProceedRecipientsStorageWrapper.sol     | (none)                                                                     |
| 22  | domain/asset/ERC3643/ERC3643StorageWrapper1.sol + ERC3643StorageWrapper2.sol                                                                                                                                            | CONVERT + MERGE   | domain/core/ERC3643StorageWrapper.sol                | (note: keeping ERC3643 name, not "Compliance")                             |
| 23  | domain/asset/ERC3643/IERC3643StorageWrapper.sol                                                                                                                                                                         | DELETE            | —                                                    | —                                                                          |
| 24  | domain/asset/hold/HoldStorageWrapper1.sol + HoldStorageWrapper2.sol                                                                                                                                                     | CONVERT + MERGE   | domain/asset/HoldStorageWrapper.sol                  | (none)                                                                     |
| 25  | domain/asset/clearing/ClearingStorageWrapper1.sol + ClearingStorageWrapper2.sol                                                                                                                                         | CONVERT + MERGE   | domain/asset/ClearingStorageWrapper.sol              | (none)                                                                     |
| 26  | domain/asset/clearing/IClearingStorageWrapper.sol                                                                                                                                                                       | DELETE            | —                                                    | —                                                                          |
| 27  | domain/asset/corporateAction/CorporateActionsStorageWrapper.sol                                                                                                                                                         | CONVERT + FLATTEN | domain/core/CorporateActionsStorageWrapper.sol       | (none)                                                                     |
| 28  | domain/asset/corporateAction/ICorporateActionsStorageWrapper.sol                                                                                                                                                        | DELETE            | —                                                    | —                                                                          |
| 29  | domain/asset/snapshot/SnapshotsStorageWrapper1.sol + SnapshotsStorageWrapper2.sol                                                                                                                                       | CONVERT + MERGE   | domain/asset/SnapshotsStorageWrapper.sol             | (none)                                                                     |
| 30  | domain/asset/snapshot/ISnapshotsStorageWrapper.sol                                                                                                                                                                      | DELETE            | —                                                    | —                                                                          |
| 31  | domain/asset/scheduledTask/ScheduledTasksCommon.sol                                                                                                                                                                     | CONVERT           | domain/asset/ScheduledTasksStorageWrapper.sol        | (none)                                                                     |
| 32  | domain/asset/scheduledTask/scheduledSnapshot/ScheduledSnapshotsStorageWrapper.sol                                                                                                                                       | MERGE INTO #31    | —                                                    | —                                                                          |
| 33  | domain/asset/scheduledTask/scheduledCouponListing/ScheduledCouponListingStorageWrapper.sol                                                                                                                              | MERGE INTO #31    | —                                                    | —                                                                          |
| 34  | domain/asset/scheduledTask/scheduledBalanceAdjustment/ScheduledBalanceAdjustmentsStorageWrapper.sol                                                                                                                     | MERGE INTO #31    | —                                                    | —                                                                          |
| 35  | domain/asset/scheduledTask/scheduledCrossOrderedTask/ScheduledCrossOrderedTasksStorageWrapper.sol                                                                                                                       | MERGE INTO #31    | —                                                    | —                                                                          |
| 36  | domain/asset/adjustBalance/AdjustBalancesStorageWrapper1.sol + AdjustBalancesStorageWrapper2.sol                                                                                                                        | CONVERT + MERGE   | domain/asset/AdjustBalancesStorageWrapper.sol        | (none)                                                                     |
| 37  | domain/asset/adjustBalance/IAdjustBalancesStorageWrapper.sol                                                                                                                                                            | DELETE            | —                                                    | —                                                                          |
| 38  | domain/asset/cap/CapStorageWrapper1.sol + CapStorageWrapper2.sol                                                                                                                                                        | CONVERT + MERGE   | domain/core/CapStorageWrapper.sol                    | (none)                                                                     |
| 39  | domain/asset/cap/ICapStorageWrapper.sol                                                                                                                                                                                 | DELETE            | —                                                    | —                                                                          |
| 40  | domain/asset/lock/LockStorageWrapper1.sol + LockStorageWrapper2.sol                                                                                                                                                     | CONVERT + MERGE   | domain/asset/LockStorageWrapper.sol                  | (none)                                                                     |
| 41  | domain/asset/ERC1400/ERC1410/ERC1410BasicStorageWrapperRead.sol + ERC1410BasicStorageWrapper.sol + ERC1410OperatorStorageWrapper.sol + ERC1410StandardStorageWrapper.sol + ERC1410ProtectedPartitionsStorageWrapper.sol | CONVERT + MERGE   | domain/asset/ERC1410StorageWrapper.sol               | (none)                                                                     |
| 42  | domain/asset/ERC1400/ERC1410/IERC1410StorageWrapper.sol                                                                                                                                                                 | DELETE            | —                                                    | —                                                                          |
| 43  | domain/asset/ERC1400/ERC20/ERC20StorageWrapper1.sol + ERC20StorageWrapper2.sol                                                                                                                                          | CONVERT + MERGE   | domain/asset/ERC20StorageWrapper.sol                 | (none)                                                                     |
| 44  | domain/asset/ERC1400/ERC20/IERC20StorageWrapper.sol                                                                                                                                                                     | DELETE            | —                                                    | —                                                                          |
| 45  | domain/asset/ERC1400/ERC1594/ERC1594StorageWrapper.sol                                                                                                                                                                  | CONVERT + FLATTEN | domain/asset/ERC1594StorageWrapper.sol               | (none)                                                                     |
| 46  | domain/asset/ERC1400/ERC1594/IERC1594StorageWrapper.sol                                                                                                                                                                 | DELETE            | —                                                    | —                                                                          |
| 47  | domain/asset/ERC1400/ERC1644/ERC1644StorageWrapper.sol                                                                                                                                                                  | CONVERT + FLATTEN | domain/asset/ERC1644StorageWrapper.sol               | (none)                                                                     |
| 48  | domain/asset/ERC1400/ERC1644/IERC1644StorageWrapper.sol                                                                                                                                                                 | DELETE            | —                                                    | —                                                                          |
| 49  | domain/asset/ERC1400/ERC20Votes/ERC20VotesStorageWrapper.sol                                                                                                                                                            | CONVERT + FLATTEN | domain/asset/ERC20VotesStorageWrapper.sol            | (none)                                                                     |
| 50  | domain/asset/ERC1400/ERC20Permit/ERC20PermitStorageWrapper.sol                                                                                                                                                          | CONVERT + FLATTEN | domain/asset/ERC20PermitStorageWrapper.sol           | (none)                                                                     |
| 51  | domain/asset/bond/BondStorageWrapper.sol                                                                                                                                                                                | CONVERT + FLATTEN | domain/asset/BondStorageWrapper.sol                  | CorporateActionsStorageWrapper, ScheduledTasksStorageWrapper               |
| 52  | domain/asset/bond/IBondStorageWrapper.sol                                                                                                                                                                               | DELETE            | —                                                    | —                                                                          |
| 53  | domain/asset/equity/EquityStorageWrapper.sol                                                                                                                                                                            | CONVERT + FLATTEN | domain/asset/EquityStorageWrapper.sol                | (none)                                                                     |
| 54  | domain/asset/equity/IEquityStorageWrapper.sol                                                                                                                                                                           | DELETE            | —                                                    | —                                                                          |
| 55  | domain/asset/security/SecurityStorageWrapper.sol                                                                                                                                                                        | CONVERT + FLATTEN | domain/asset/SecurityStorageWrapper.sol              | (none)                                                                     |

### 3.2 God Objects to Delete

| File                                                                      | Action | Reason                                                                         |
| ------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| domain/Internals.sol                                                      | DELETE | ~200 virtual function declarations replaced by direct library calls            |
| domain/Modifiers.sol                                                      | DELETE | ~50 virtual modifiers replaced by library guard functions                      |
| domain/Common.sol                                                         | DELETE | Bridge contract no longer needed                                               |
| domain/asset/extension/bond/fixedInterestRate/Common.sol                  | DELETE | Rate variant extension                                                         |
| domain/asset/extension/bond/fixedInterestRate/Internals.sol               | DELETE | Rate variant extension                                                         |
| domain/asset/extension/bond/fixedInterestRate/Modifiers.sol               | DELETE | Rate variant extension                                                         |
| domain/asset/extension/bond/fixedInterestRate/bond/BondStorageWrapper.sol | DELETE | Rate-specific override absorbed into BondStorageWrapper library                |
| domain/asset/extension/bond/fixingDateInterestRate/\* (all)               | DELETE | Rate variant extensions absorbed into InterestRateStorageWrapper/orchestrators |
| domain/asset/extension/ (entire directory)                                | DELETE | All rate extensions eliminated                                                 |
| domain/asset/types/ThirdPartyType.sol                                     | MOVE   | → facets/core/externalControlList/ThirdPartyType.sol or inline                 |

### 3.3 New Files to Create

| File                                       | Type                   | Purpose                                                |
| ------------------------------------------ | ---------------------- | ------------------------------------------------------ |
| domain/orchestrator/TokenCoreOps.sol       | library                | Transfer, issue, redeem, approval, hooks orchestration |
| domain/orchestrator/HoldOps.sol            | library                | Hold operations orchestration                          |
| domain/orchestrator/ClearingOps.sol        | library                | Clearing operations orchestration                      |
| domain/orchestrator/ClearingReadOps.sol    | library                | Clearing read operations                               |
| infrastructure/utils/TimestampProvider.sol | abstract contract      | Block timestamp/number abstraction for testing         |
| domain/asset/ScheduledTasksStorage.sol     | free functions/library | Scheduled tasks storage struct and helpers             |
| domain/asset/Regulation.sol                | library                | Regulation data management                             |
| constants/resolverKeys.sol                 | constants              | All facet resolver keys consolidated                   |
| constants/values.sol                       | constants              | Domain constants consolidated                          |

### 3.4 Facet Transformations

**Core facets (layer_1) — Eliminate rate variants**:
Each feature currently has: Feature.sol + FeatureFacetBase.sol + 4 variant facets.
Target: Feature.sol (rewritten to call libraries) + FeatureFacet.sol (single concrete facet).

The ~180 rate-variant concrete facets in layer_1 (standard/, fixedRate/, kpiLinkedRate/, sustainabilityPerformanceTargetRate/) are all DELETE. Only keep single FeatureFacet.sol per feature.

**Asset facets (layer_2) — Keep rate variants only where needed**:

- Bond, Equity, Security: Single facet each (no rate variants)
- InterestRate: Keep rate-specific facets (fixedRate, kpiLinkedRate, SPT)
- KPI: Keep kpiLinkedRate and SPT variants
- ProceedRecipients: Keep kpiLinkedRate and SPT variants
- ScheduledCrossOrderedTasks: Keep kpiLinkedRate and SPT variants

**Regulation facets (layer_3) — Keep rate variants for BondUSA only**:

- EquityUSA: Single facet
- BondUSA: Keep fixedRate, kpiLinkedRate, SPT, variableRate variants
- TransferAndLock: Single facet

### 3.5 Infrastructure Renames

| Current                                 | New                                      | Reason                 |
| --------------------------------------- | ---------------------------------------- | ---------------------- |
| infrastructure/utils/LibCommon.sol      | infrastructure/utils/Pagination.sol      | Matches actual purpose |
| infrastructure/utils/ArrayLib.sol       | infrastructure/utils/ArrayValidation.sol | More descriptive       |
| infrastructure/utils/CheckpointsLib.sol | infrastructure/utils/Checkpoints.sol     | Simplified             |

### 3.6 Constants Consolidation

| Current Location                                                                | New Location                   | Action                              |
| ------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------- |
| layer_0/constants/storagePositions.sol + layer_1/constants/storagePositions.sol | constants/storagePositions.sol | MERGE + EXPAND to ~50 positions     |
| (scattered across facet files)                                                  | constants/resolverKeys.sol     | NEW - consolidate all resolver keys |
| layer_0/constants/values.sol + layer_1/constants/values.sol                     | constants/values.sol           | MERGE + EXPAND                      |
| layer_0/constants/roles.sol + layer_1/constants/roles.sol                       | constants/roles.sol            | MERGE                               |

---

## 4. Migration Phases

### Phase 0: Preparation and Safety

**Goal**: Set up the working branch, create backups, and establish baseline.

**Prerequisites**: None.

**Steps**:

1. Create working branch from `origin/development`:
   ```bash
   git checkout -b refactor/lib-diamond-migration origin/development
   ```
2. Create backup:
   ```bash
   git branch backup/pre-lib-migration-$(date +%Y%m%d)
   ```
3. Verify clean build:
   ```bash
   cd packages/ats/contracts && npx hardhat compile 2>&1 | tee /tmp/pre-migration-compile.txt
   ```
4. Run full test suite and capture baseline:
   ```bash
   npx hardhat test 2>&1 | tee /tmp/pre-migration-tests.txt
   ```
5. Record test count and pass rate for comparison.

**Verification**: Clean compile, all tests pass, baseline captured.
**Rollback**: `git checkout origin/development`

---

### Phase 1: Constants Consolidation

**Goal**: Consolidate all constants into unified files. This is safe because it only adds/moves constants.

**Prerequisites**: Phase 0.

**Files to modify/create**:

- MODIFY: `contracts/constants/storagePositions.sol` — add ALL storage position constants from layer_0 and layer_1
- CREATE: `contracts/constants/resolverKeys.sol` — consolidate all `_*_RESOLVER_KEY` constants
- CREATE: `contracts/constants/values.sol` — consolidate domain constants (\_DEFAULT_PARTITION, action types, gas limits, etc.)
- MODIFY: `contracts/constants/roles.sol` — merge layer_0 and layer_1 role constants

**Step-by-step**:

1. Read all storage position constants from development: `constants/storagePositions.sol`, `layer_0/constants/storagePositions.sol`, `layer_1/constants/storagePositions.sol`
2. Merge into single `constants/storagePositions.sol` with clear section comments (infrastructure, core, token, asset, scheduled tasks, interest rates, regulation)
3. Extract all `_*_RESOLVER_KEY` constants from facet files and consolidate into `constants/resolverKeys.sol`
4. Extract domain constants from `layer_0/constants/values.sol` and `layer_1/constants/values.sol` into `constants/values.sol`
5. Update imports in all files that reference moved constants
6. Compile to verify

**Verification**: `npx hardhat compile` succeeds. No logic changes — only import paths changed.
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 2: Infrastructure Utilities

**Goal**: Add/rename utility contracts needed by the new architecture.

**Prerequisites**: Phase 1.

**Files to create/modify**:

- CREATE: `infrastructure/utils/TimestampProvider.sol`
- RENAME: `infrastructure/utils/LibCommon.sol` → `infrastructure/utils/Pagination.sol`
- RENAME: `infrastructure/utils/ArrayLib.sol` → `infrastructure/utils/ArrayValidation.sol`
- RENAME: `infrastructure/utils/CheckpointsLib.sol` → `infrastructure/utils/Checkpoints.sol`
- MOVE: `infrastructure/proxy/ResolverProxyStorageWrapper.sol` (convert from abstract to library)

**Step-by-step**:

1. Create `TimestampProvider.sol`:
   ```solidity
   abstract contract TimestampProvider {
     function _getBlockTimestamp() internal view virtual returns (uint256) {
       return block.timestamp;
     }
     function _getBlockNumber() internal view virtual returns (uint256) {
       return block.number;
     }
   }
   ```
2. Rename utility files and update all imports. Keep old names as re-export shims temporarily for backward compatibility during migration.
3. Convert `ResolverProxyStorageWrapper` from abstract contract to library (it has no dependencies on other abstract contracts).
4. Update all import references.
5. Compile.

**Verification**: `npx hardhat compile` succeeds. All tests pass.
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 3: Core StorageWrapper Libraries (domain/core/)

**Goal**: Convert all core domain StorageWrappers from abstract contracts to libraries. This is the foundation — all other phases depend on it.

**Prerequisites**: Phase 2.

**Files to create** (12 new library files):

1. `domain/core/NonceStorageWrapper.sol` (library)
2. `domain/core/AccessControlStorageWrapper.sol` (library)
3. `domain/core/SsiManagementStorageWrapper.sol` (library)
4. `domain/core/ExternalListManagementStorageWrapper.sol` (library — merges ExternalKyc + ExternalControlList + ExternalPause management)
5. `domain/core/KycStorageWrapper.sol` (library)
6. `domain/core/ProtectedPartitionsStorageWrapper.sol` (library)
7. `domain/core/ControlListStorageWrapper.sol` (library)
8. `domain/core/PauseStorageWrapper.sol` (library)
9. `domain/core/CorporateActionsStorageWrapper.sol` (library)
10. `domain/core/CapStorageWrapper.sol` (library)
11. `domain/core/ERC3643StorageWrapper.sol` (library — merges ERC3643StorageWrapper1 + 2)
12. `domain/core/ERC712.sol` (library)

**For each library conversion, follow this template**:

1. Read the original abstract contract(s)
2. Extract the storage struct — place at file level (same file, above library declaration)
3. Create `library XxxStorageWrapper { ... }`
4. Move the `_xxxStorage()` accessor into the library, rename to `xxxStorage()` (drop underscore prefix)
5. Convert all `internal override` functions to `internal` (no override in libraries)
6. Drop underscore prefix from function names (e.g., `_grantRole` → `grantRole`)
7. Replace modifier-based guards with explicit `check*`/`require*` functions
8. Replace `_msgSender()` with `msg.sender` (libraries don't have Context inheritance)
9. Replace `using LibCommon for` with `using Pagination for`
10. Replace `using EnumerableSet for` (keep as-is, OpenZeppelin still needed)
11. For merged wrappers (e.g., ERC3643StorageWrapper1+2), combine all functions into single library
12. Delete the old abstract contract file(s) and IXxxStorageWrapper interface file(s)

**Critical rule for structs**: Storage structs go at FILE LEVEL (same .sol file, above library). This is because libraries cannot inherit from interfaces, and these structs are internal implementation details. Errors and events that are part of the PUBLIC API stay in facet interfaces (IAccessControl, IPause, etc.).

**Step-by-step for each wrapper** (repeat for all 12):

1. Create new library file in `domain/core/`
2. Copy storage struct from original, place at file level
3. Copy storage accessor, place inside library
4. Copy all function implementations, adjust signatures (remove override, remove underscore)
5. Add explicit guard functions where modifiers existed (e.g., `requireNotPaused()`, `checkRole()`)
6. Delete old abstract contract file(s)
7. Delete IXxxStorageWrapper interface file
8. DO NOT update facet imports yet (Phase 5 handles that)

**Verification**: Compile will FAIL after this phase (facets still reference old abstracts). This is expected. Verify by checking that all library files are syntactically valid:

```bash
# Check each new file compiles in isolation (if possible with Hardhat's compiler)
npx hardhat compile 2>&1 | tee /tmp/phase3-compile.txt
grep -c "Error" /tmp/phase3-compile.txt  # Expected: many errors from facets, zero from new libraries
```

**Rollback**: `git reset --soft HEAD~1`

---

### Phase 4: Asset StorageWrapper Libraries (domain/asset/)

**Goal**: Convert all asset-domain StorageWrappers from abstract contracts to libraries.

**Prerequisites**: Phase 3.

**Files to create** (21 new library files):

1. `domain/asset/ERC1410StorageWrapper.sol` (library — merges 5 ERC1410 wrappers)
2. `domain/asset/ERC20StorageWrapper.sol` (library — merges ERC20StorageWrapper1+2)
3. `domain/asset/ERC1594StorageWrapper.sol` (library)
4. `domain/asset/ERC1644StorageWrapper.sol` (library)
5. `domain/asset/ERC20VotesStorageWrapper.sol` (library)
6. `domain/asset/ERC20PermitStorageWrapper.sol` (library)
7. `domain/asset/SnapshotsStorageWrapper.sol` (library — merges 1+2)
8. `domain/asset/AdjustBalancesStorageWrapper.sol` (library — merges 1+2)
9. `domain/asset/HoldStorageWrapper.sol` (library — merges 1+2)
10. `domain/asset/ClearingStorageWrapper.sol` (library — merges 1+2)
11. `domain/asset/LockStorageWrapper.sol` (library — merges 1+2)
12. `domain/asset/ProceedRecipientsStorageWrapper.sol` (library)
13. `domain/asset/BondStorageWrapper.sol` (library)
14. `domain/asset/EquityStorageWrapper.sol` (library)
15. `domain/asset/SecurityStorageWrapper.sol` (library)
16. `domain/asset/InterestRateStorageWrapper.sol` (library — merges Fixed+KpiLinked+SPT)
17. `domain/asset/KpisStorageWrapper.sol` (library)
18. `domain/asset/ScheduledTasksStorageWrapper.sol` (library — merges all 4 scheduled task wrappers)
19. `domain/asset/ScheduledTasksStorage.sol` (shared struct/helpers)
20. `domain/asset/Regulation.sol` (library)

**Follow the same conversion template from Phase 3.** Key differences:

- Merging split wrappers: Combine StorageWrapper1 + StorageWrapper2 functions into single library
- Merging scheduled tasks: Combine 4 separate scheduled task wrappers into ScheduledTasksStorageWrapper with functions namespaced by task type
- InterestRateStorageWrapper: Merge 3 rate storage wrappers — each rate type gets its own storage struct at file level, all accessor functions in single library

**Verification**: Same as Phase 3 — compile will still fail (facets not updated yet). Verify library files are syntactically valid.
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 5: Orchestrator Libraries

**Goal**: Create the 4 orchestrator libraries that coordinate multi-library operations.

**Prerequisites**: Phases 3 and 4 (all StorageWrapper libraries must exist).

**Files to create**:

1. `domain/orchestrator/TokenCoreOps.sol`
2. `domain/orchestrator/HoldOps.sol`
3. `domain/orchestrator/ClearingOps.sol`
4. `domain/orchestrator/ClearingReadOps.sol`

**Key patterns for orchestrators**:

- All functions are `public` (deployed as separate contracts, called via DELEGATECALL)
- Accept `_timestamp` and `_blockNumber` as parameters (dependency injection from TimestampProvider)
- Import and call StorageWrapper libraries directly
- Use `using LowLevelCall for address` for compliance callbacks
- Contain hook logic (beforeTokenTransfer, afterTokenTransfer, etc.)

**Step-by-step**:

1. Identify orchestration logic currently in Internals.sol (transfer, issue, redeem, hooks, hold operations, clearing operations)
2. Group into the 4 orchestrator libraries by domain
3. For each function: extract from Internals.sol, replace virtual calls with direct library calls, add timestamp/blockNumber parameters
4. Verify internal cross-library calls resolve correctly

**Verification**: Compile should get closer to success (orchestrators provide the glue layer). Still expected to fail on facets.
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 6: Core Facet Updates (layer_1)

**Goal**: Rewrite all core facets to use libraries instead of inheritance. Eliminate rate variants.

**Prerequisites**: Phase 5 (all libraries must exist).

**This is the largest phase.** For each feature in layer_1:

**Step-by-step for each feature** (e.g., Pause):

1. **Rewrite Feature.sol** (e.g., `Pause.sol`):
   - Remove `Internals` inheritance
   - Add `IPause` interface inheritance
   - Add `TimestampProvider` inheritance (if feature needs timestamps)
   - Replace modifier calls with explicit library guard calls
   - Replace virtual function calls with direct library calls
   - Example: `onlyRole(_PAUSER_ROLE) onlyUnpaused` → `AccessControlStorageWrapper.checkRole(_PAUSER_ROLE); PauseStorageWrapper.requireNotPaused();`

2. **Merge FeatureFacetBase.sol into FeatureFacet.sol**:
   - FacetBase had IStaticFunctionSelectors + selector registration
   - Move this into FeatureFacet directly
   - FeatureFacet inherits Feature + IStaticFunctionSelectors
   - Delete FeatureFacetBase.sol

3. **Delete all rate-variant concrete facets**:
   - Delete `standard/FeatureFacet.sol`
   - Delete `fixedRate/FeatureFixedRateFacet.sol`
   - Delete `kpiLinkedRate/FeatureKpiLinkedRateFacet.sol`
   - Delete `sustainabilityPerformanceTargetRate/FeatureSPTFacet.sol`
   - The single FeatureFacet.sol replaces all 4

4. **Update resolver key**: Each FeatureFacet returns a single resolver key (from `constants/resolverKeys.sol`)

**Layer 1 features to process** (each follows the pattern above):

- AccessControl, Cap, Clearing (5 sub-facets), ControlList, CorporateActions
- ExternalControlListManagement, ExternalKycListManagement, ExternalPauseManagement
- Freeze, Hold (3 sub-facets), Kyc, Lock, Nonces, Pause
- ProtectedPartitions, Snapshots, SsiManagement, TotalBalance
- ERC20, ERC20Permit, ERC20Votes, ERC1410 (4 sub-facets), ERC1594, ERC1643, ERC1644
- ERC3643 (4 sub-facets: Batch, Management, Operations, Read)

**Verification**: After completing ALL layer_1 facets, compile should succeed for core contracts.

```bash
npx hardhat compile 2>&1 | tee /tmp/phase6-compile.txt
```

**Rollback**: `git reset --soft HEAD~1`

---

### Phase 7: Asset Facet Updates (layer_2)

**Goal**: Rewrite asset facets. Keep rate variants only where behavior genuinely differs.

**Prerequisites**: Phase 6.

**Features to process**:

- `AdjustBalances` — single facet (no rate variants)
- `Bond` — single facet
- `Equity` — single facet
- `Security` — single facet (may merge into EquityUSA/BondUSA in layer_3)
- `InterestRate/fixedRate` — keep as distinct facet
- `InterestRate/kpiLinkedRate` — keep as distinct facet
- `InterestRate/sustainabilityPerformanceTargetRate` — keep as distinct facet
- `Kpis` — keep kpiLinkedRate and SPT variants
- `ProceedRecipients` — keep kpiLinkedRate and SPT variants
- `ScheduledBalanceAdjustments` — single facet
- `ScheduledCouponListing` — single facet
- `ScheduledSnapshots` — single facet
- `ScheduledCrossOrderedTasks` — keep kpiLinkedRate and SPT variants

**Step-by-step**: Same pattern as Phase 6, but preserve rate-specific facets where they have genuinely different behavior (different library calls for coupon rate calculation, KPI operations, etc.).

**Verification**: Compile succeeds.
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 8: Regulation Facet Updates (layer_3)

**Goal**: Rewrite regulation/jurisdiction facets.

**Prerequisites**: Phase 7.

**Features to process**:

- `EquityUSA` — single facet
- `BondUSA` — keep rate variants (fixedRate, kpiLinkedRate, SPT, variableRate)
- `TransferAndLock` — single facet

**Step-by-step**: Same pattern. BondUSA rate variants have genuinely different coupon/rate initialization logic.

**Verification**: Full compile succeeds.
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 9: Delete God Objects and Extension Layer

**Goal**: Remove all files that are no longer referenced.

**Prerequisites**: Phase 8.

**Files to delete**:

- `domain/Internals.sol`
- `domain/Modifiers.sol`
- `domain/Common.sol`
- `domain/asset/extension/` (entire directory — all rate-variant Common/Internals/Modifiers/BondStorageWrapper extensions)
- All old `IXxxStorageWrapper.sol` interface files (already deleted in Phases 3-4, verify none remain)
- All old abstract StorageWrapper files in nested subdirectories (already superseded by flat library files)
- `infrastructure/utils/LocalContext.sol` (replaced by TimestampProvider)

**Step-by-step**:

1. Run compile to verify nothing references deleted files
2. Search for any remaining imports of deleted files: `grep -r "domain/Internals" contracts/` etc.
3. Delete files
4. Clean up any empty directories

**Verification**: `npx hardhat compile` succeeds with zero warnings about missing files.
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 10: Factory and Interface Updates

**Goal**: Update Factory contract and any remaining interfaces for new import paths.

**Prerequisites**: Phase 9.

**Files to modify**:

- `factory/Factory.sol` — update imports
- `factory/ERC3643/interfaces/*` — update imports
- Any `ISecurity`, `IBondUSA`, `IEquityUSA` that reference moved types
- `facets/core/ERC1400/ERC1410/IERC1410Types.sol` — create if needed for extracted shared types

**Verification**: Full compile succeeds.
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 11: Test Updates

**Goal**: Update all test files for new import paths and patterns.

**Prerequisites**: Phase 10.

**Categories of test changes**:

1. **Import path updates**: All test files importing StorageWrappers, facets, or constants need path updates
2. **Test harness updates**: Any test contracts that inherit from deleted abstracts need rewriting
3. **Mock contracts**: Update to use library pattern
4. **Test logic**: Should be minimal — external function signatures unchanged

**Step-by-step**:

1. Compile test files: `npx hardhat compile 2>&1 | tee /tmp/phase11-compile.txt`
2. Fix import errors systematically (usually just path changes)
3. Rewrite test harnesses that inherited from Internals/Common/Modifiers
4. Run full test suite: `npx hardhat test 2>&1 | tee /tmp/phase11-tests.txt`
5. Compare test count and pass rate with Phase 0 baseline

**Verification**: ALL tests pass. Test count matches baseline (no tests lost).
**Rollback**: `git reset --soft HEAD~1`

---

### Phase 12: Final Verification and Cleanup

**Goal**: Verify the migration is complete, correct, and clean.

**Prerequisites**: Phase 11.

**Checklist**:

1. [ ] Full compile: `npx hardhat compile` — zero errors, zero warnings
2. [ ] Full test suite: `npx hardhat test` — all tests pass
3. [ ] Coverage: `npx hardhat coverage` — coverage matches or exceeds baseline
4. [ ] No stale files: `find contracts/ -name "*.sol" | xargs grep -l "abstract contract.*StorageWrapper"` — should return zero results (all converted to libraries)
5. [ ] No god object references: `grep -r "Internals\|Modifiers\|domain/Common" contracts/ --include="*.sol"` — zero results
6. [ ] No rate variant facets in layer_1: `find contracts/facets/layer_1/ -name "*FixedRate*" -o -name "*KpiLinked*" -o -name "*SustainabilityPerformanceTarget*"` — zero results (except interfaces/types that legitimately reference rates)
7. [ ] Storage layout verification: Compare storage positions between old and new to ensure no position constants changed
8. [ ] ABI compatibility: Generate ABIs for all facets and compare with pre-migration baseline
9. [ ] Gas comparison: Run gas reporter and compare with baseline
10. [ ] Clean up any temporary backward-compatibility shims from Phase 2

**Verification**: All checklist items pass.
**Rollback**: `git reset --soft HEAD~1`

---

## 5. File-by-File Migration Patterns

### Pattern A: Abstract StorageWrapper → Library

**BEFORE** (`domain/core/pause/PauseStorageWrapper.sol`):

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPauseStorageWrapper } from "./IPauseStorageWrapper.sol";
import { ExternalPauseManagementStorageWrapper } from "../externalPause/ExternalPauseManagementStorageWrapper.sol";
import { _PAUSE_STORAGE_POSITION } from "../../../constants/storagePositions.sol";

abstract contract PauseStorageWrapper is IPauseStorageWrapper, ExternalPauseManagementStorageWrapper {
  struct PauseDataStorage {
    bool isPaused;
  }

  function _pauseStorage() internal pure returns (PauseDataStorage storage ds) {
    bytes32 position = _PAUSE_STORAGE_POSITION;
    assembly {
      ds.slot := position
    }
  }

  function _setPaused(bool _paused) internal override {
    _pauseStorage().isPaused = _paused;
    if (_paused) {
      emit Paused(msg.sender);
    } else {
      emit Unpaused(msg.sender);
    }
  }

  function _isPaused() internal view override returns (bool) {
    return _pauseStorage().isPaused;
  }

  modifier onlyUnpaused() override {
    if (_isPaused()) revert IsPaused();
    _;
  }

  modifier onlyPaused() override {
    if (!_isPaused()) revert IsNotPaused();
    _;
  }
}
```

**AFTER** (`domain/core/PauseStorageWrapper.sol`):

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PAUSE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IPause } from "../../facets/core/pause/IPause.sol";

struct PauseDataStorage {
  bool isPaused;
}

library PauseStorageWrapper {
  function pauseStorage() internal pure returns (PauseDataStorage storage ds) {
    bytes32 position = _PAUSE_STORAGE_POSITION;
    assembly {
      ds.slot := position
    }
  }

  function pause() internal {
    pauseStorage().isPaused = true;
    emit IPause.Paused(msg.sender);
  }

  function unpause() internal {
    pauseStorage().isPaused = false;
    emit IPause.Unpaused(msg.sender);
  }

  function isPaused() internal view returns (bool) {
    return pauseStorage().isPaused;
  }

  function requireNotPaused() internal view {
    if (isPaused()) revert IPause.IsPaused();
  }

  function requirePaused() internal view {
    if (!isPaused()) revert IPause.IsNotPaused();
  }
}
```

**Key changes**:

1. `abstract contract` → `library`
2. Storage struct moved to file level
3. Inheritance removed (was `is IPauseStorageWrapper, ExternalPauseManagementStorageWrapper`)
4. `_pauseStorage()` → `pauseStorage()` (drop underscore)
5. `_setPaused(bool)` split into `pause()` + `unpause()` (single responsibility)
6. `_isPaused()` → `isPaused()` (drop underscore)
7. Modifiers → explicit guard functions (`requireNotPaused()`, `requirePaused()`)
8. Events/errors emitted via facet interface reference (`IPause.Paused`, `IPause.IsPaused`)
9. `override` keyword removed (libraries don't override)
10. `virtual` keyword removed (library functions are final)

### Pattern B: Merging Split Wrappers (StorageWrapper1 + StorageWrapper2 → Single Library)

**BEFORE**: Two files:

- `ERC20StorageWrapper1.sol` — struct, accessor, read functions (low in inheritance chain)
- `ERC20StorageWrapper2.sol` — write functions, business logic (high in inheritance chain)

**AFTER**: Single `domain/asset/ERC20StorageWrapper.sol` — all functions in one library.

The split existed because of the linear inheritance chain: read functions needed to be available low in the chain, while write functions needed access to functions from higher wrappers. With libraries, this constraint disappears — libraries call each other freely.

### Pattern C: Facet Rewrite (3-tier → 2-tier)

**BEFORE** (3 files):

```solidity
// Cap.sol (abstract business logic)
abstract contract Cap is ICap, Internals {
    function setMaxSupply(...) external override onlyRole(_CAP_ROLE) onlyUnpaused {
        _setMaxSupply(...);  // virtual dispatch
    }
}

// CapFacetBase.sol (selector registration)
abstract contract CapFacetBase is Cap, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) { ... }
}

// standard/CapFacet.sol (concrete, one of 4 variants)
contract CapFacet is CapFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32) {
        return _CAP_RESOLVER_KEY;
    }
}
```

**AFTER** (2 files):

```solidity
// Cap.sol (abstract, calls libraries)
abstract contract Cap is ICap {
    function setMaxSupply(...) external override {
        AccessControlStorageWrapper.checkRole(_CAP_ROLE);
        PauseStorageWrapper.requireNotPaused();
        CapStorageWrapper.setMaxSupply(...);  // direct library call
    }
}

// CapFacet.sol (concrete, single facet — no rate variants)
contract CapFacet is Cap, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32) {
        return _CAP_RESOLVER_KEY;
    }
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) { ... }
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) { ... }
}
```

### Pattern D: Test Adaptation

**BEFORE**:

```solidity
// Test inheriting from abstract contracts
contract PauseTestHarness is PauseFacet {
  // gets all inherited functionality
}
```

**AFTER**:

```solidity
// Test using libraries directly
contract PauseTestHarness is Pause, IStaticFunctionSelectors {
  // Pause already calls PauseStorageWrapper library internally
  // Test harness just needs to expose functions for testing
  function getStaticResolverKey() external pure override returns (bytes32) {
    return bytes32(0);
  }
  function getStaticFunctionSelectors() external pure override returns (bytes4[] memory s) {
    s = new bytes4[](0);
  }
  function getStaticInterfaceIds() external pure override returns (bytes4[] memory s) {
    s = new bytes4[](0);
  }
}
```

---

## 6. Naming Mapping (Complete)

### StorageWrapper Renames (Spike → Production)

| Spike Name                    | Production Name                        | Reason                                                                             |
| ----------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `ABAFStorageWrapper`          | `AdjustBalancesStorageWrapper`         | "ABAF" is internal jargon; name must match domain concept                          |
| `AccessStorageWrapper`        | `AccessControlStorageWrapper`          | "Access" alone loses the RBAC "access control" distinction                         |
| `ComplianceStorageWrapper`    | `ERC3643StorageWrapper`                | Matches ERC-3643/T-REX standard; consistent with ERC1410/ERC1594/ERC20/etc. naming |
| `SSIStorageWrapper`           | `SsiManagementStorageWrapper`          | Dropped "Management"; inconsistent casing (SSI vs Ssi)                             |
| `ExternalListsStorageWrapper` | `ExternalListManagementStorageWrapper` | Dropped "Management" — functionality is list management                            |

### Utility Renames (Development → Production)

| Development Name | Production Name     | Reason                                                    |
| ---------------- | ------------------- | --------------------------------------------------------- |
| `LibCommon`      | `Pagination`        | Matches actual purpose (paginated enumerable set queries) |
| `ArrayLib`       | `ArrayValidation`   | More descriptive                                          |
| `CheckpointsLib` | `Checkpoints`       | Simplified; aligns with OZ naming                         |
| `LocalContext`   | `TimestampProvider` | Better describes purpose; Context inheritance eliminated  |

### Facet Renames (Development → Production)

| Development Pattern                                       | Production Pattern      | Reason                            |
| --------------------------------------------------------- | ----------------------- | --------------------------------- |
| `FeatureFacetBase`                                        | (deleted)               | Merged into FeatureFacet          |
| `standard/FeatureFacet`                                   | `FeatureFacet` (single) | Rate variants eliminated for core |
| `fixedRate/FeatureFixedRateFacet`                         | (deleted for core)      | Rate variants eliminated          |
| `kpiLinkedRate/FeatureKpiLinkedRateFacet`                 | (deleted for core)      | Rate variants eliminated          |
| `sustainabilityPerformanceTargetRate/FeatureSPTRateFacet` | (deleted for core)      | Rate variants eliminated          |

---

## 7. Risk Register

| #   | Risk                                                | Impact                                      | Likelihood | Mitigation                                                                                                                                                           |
| --- | --------------------------------------------------- | ------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Storage layout mismatch between old and new         | CRITICAL — deployed proxies break           | Low        | Verify all `_*_STORAGE_POSITION` constants are identical. Storage struct field ordering must not change. Run storage layout comparison tool.                         |
| 2   | ABI compatibility broken                            | HIGH — SDK and web app break                | Low        | Generate ABI before and after migration; diff to confirm no external function signature changes.                                                                     |
| 3   | Gas regression from library pattern                 | MEDIUM — deployment/tx costs increase       | Medium     | Library `internal` functions are inlined by compiler (zero overhead). `public` orchestrator functions add one DELEGATECALL (~2600 gas) per use. Monitor gas reports. |
| 4   | Incorrect modifier → guard function translation     | HIGH — security bypass                      | Medium     | For each modifier, create an equivalent `check*`/`require*` function. Run full test suite to catch regressions. Security review post-migration.                      |
| 5   | Missing function during Internals.sol decomposition | HIGH — runtime revert                       | Medium     | Cross-reference every function in Internals.sol against library implementations. Compile will catch missing functions that facets reference.                         |
| 6   | Rate variant elimination breaks BLR configuration   | HIGH — token contracts can't resolve facets | Medium     | Verify BLR configuration scripts. Core facets now have single resolver key (not 4 variant keys). Update deployment scripts accordingly.                              |
| 7   | Split wrapper merge introduces ordering bugs        | MEDIUM — incorrect state transitions        | Low        | When merging StorageWrapper1+2, preserve exact function implementations. Run tests that exercise cross-domain operations (e.g., transfer with snapshots + clearing). |
| 8   | Circular library dependencies                       | LOW — compile error                         | Low        | Libraries cannot have circular dependencies (Solidity enforces). Design library boundaries carefully.                                                                |
| 9   | Test harness rewrite misses edge cases              | MEDIUM — false test confidence              | Medium     | Compare test counts before/after. Ensure coverage matches baseline.                                                                                                  |
| 10  | Deployment script incompatibility                   | HIGH — can't deploy to testnet              | Medium     | Update deployment scripts after migration. Test full deployment flow on local Hardhat network.                                                                       |

---

## 8. Re-engagement Protocol

### How to Determine Current Progress

---

## 9. Migration Progress Tracker

### Current Status (2026-03-18)

| Phase      | Description                    | Status       | Notes                                                       |
| ---------- | ------------------------------ | ------------ | ----------------------------------------------------------- |
| Phase 3    | Core StorageWrapper Libraries  | ✅ COMPLETED | AccessControlStorageWrapper + PauseStorageWrapper migrated  |
| Phase 4    | Asset StorageWrapper Libraries | ⏳ PENDING   | Not started                                                 |
| Phase 5    | Orchestrator Libraries         | ✅ COMPLETED | TokenCoreOps, HoldOps, ClearingOps, ClearingReadOps created |
| Phase 6    | Core Facet Updates             | ⏳ PENDING   | Not started                                                 |
| Phase 7-12 | Remaining phases               | ⏳ PENDING   | Not started                                                 |

### Completed Work

#### AccessControlStorageWrapper Migration (2026-03-18)

- **Status**: ✅ COMPLETED
- **Files Modified**: 20+ files
- **Pattern Applied**:
  - `abstract contract` → `library`
  - Functions renamed: `_hasRole()` → `hasRole()`, `_grantRole()` → `grantRole()`, etc.
  - Removed inheritance, replaced with direct library calls
  - `AccessControlModifiers.sol` uses `using AccessControlStorageWrapper for RoleDataStorage;`

#### PauseStorageWrapper Migration (2026-03-18)

- **Status**: ✅ COMPLETED
- **Files Modified**: 18+ files
- **Pattern Applied**:
  - Libraries cannot contain modifiers → extracted to `PauseModifiers.sol`
  - `abstract contract PauseStorageWrapper` → `library PauseStorageWrapper`
  - Functions renamed: `_isPaused()` → `isPaused()`, `_setPause()` → `setPause()`, etc.
  - All facets inherit from `PauseModifiers` for `onlyUnpaused`/`onlyPaused` modifiers
  - Facets using pause state call `PauseStorageWrapper.isPaused()` directly

#### ClearingReadOps Spike Pattern (2026-03-17)

- **Status**: ✅ COMPLETED
- Migrated from delegating everything to ClearingStorageWrapper to proper encapsulation
- Uses AdjustBalancesStorageWrapper for ABAF calculations
- Uses SnapshotsStorageWrapper for snapshot operations

### Pre-existing Issues (Not Migration Related)

- TypeScript TypeChain errors: TokenCoreOps library linking needs registry generator update
- Tests have failures related to library linking (same as above)

### Verification Commands

```bash
# Check if core StorageWrapper libraries exist
grep -l "^library.*StorageWrapper" packages/ats/contracts/contracts/domain/core/*.sol 2>/dev/null

# Check if orchestrator libraries exist
ls packages/ats/contracts/contracts/domain/orchestrator/*.sol

# Verify compilation
cd packages/ats/contracts && npx hardhat compile
```

---

### How to Determine Current Progress

1. **Check which phases are complete**:

   ```bash
   # Check if constants are consolidated (Phase 1)
   test -f packages/ats/contracts/contracts/constants/resolverKeys.sol && echo "Phase 1: DONE"

   # Check if TimestampProvider exists (Phase 2)
   test -f packages/ats/contracts/contracts/infrastructure/utils/TimestampProvider.sol && echo "Phase 2: DONE"

   # Check if core StorageWrapper libraries exist (Phase 3)
   grep -l "^library.*StorageWrapper" packages/ats/contracts/contracts/domain/core/*.sol 2>/dev/null | wc -l
   # Should be 12 if Phase 3 complete

   # Check if asset StorageWrapper libraries exist (Phase 4)
   grep -l "^library.*StorageWrapper\|^library.*Regulation\|^library.*ScheduledTasks" packages/ats/contracts/contracts/domain/asset/*.sol 2>/dev/null | wc -l
   # Should be ~20 if Phase 4 complete

   # Check if orchestrators exist (Phase 5)
   ls packages/ats/contracts/contracts/domain/orchestrator/*.sol 2>/dev/null | wc -l
   # Should be 4 if Phase 5 complete

   # Check if god objects are deleted (Phase 9)
   test ! -f packages/ats/contracts/contracts/domain/Internals.sol && echo "Phase 9: DONE"

   # Check compile status
   cd packages/ats/contracts && npx hardhat compile 2>&1 | tail -5

   # Check test status
   npx hardhat test 2>&1 | tail -10
   ```

2. **Read git log for migration commits**:
   ```bash
   git log --oneline -20
   ```

### How to Verify Completed Phases

For each completed phase, run its Verification step (listed in Phase descriptions above).

### How to Pick Up from Any Phase

1. Read this plan file
2. Run the progress check commands above
3. Identify the first incomplete phase
4. Read the Phase description and execute step-by-step
5. After completing the phase, run its verification
6. Proceed to next phase

### Key Files to Read for Context

| File                                                                    | Purpose                                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| This plan file                                                          | Complete migration instructions                                        |
| `packages/ats/contracts/contracts/constants/storagePositions.sol`       | All storage position constants                                         |
| `packages/ats/contracts/contracts/constants/resolverKeys.sol`           | All facet resolver keys (once created)                                 |
| `packages/ats/contracts/contracts/domain/core/PauseStorageWrapper.sol`  | Reference implementation of library pattern (once created)             |
| `packages/ats/contracts/contracts/facets/core/pause/Pause.sol`          | Reference implementation of facet-calls-library pattern (once created) |
| `packages/ats/contracts/contracts/domain/orchestrator/TokenCoreOps.sol` | Reference orchestrator implementation (once created)                   |
| `CLAUDE.md`                                                             | Project conventions and build commands                                 |

### Critical Reminders for Resuming AI

1. **NEVER change storage positions** — they must match deployed proxies exactly
2. **NEVER change storage struct field ordering** — same reason
3. **NEVER change external function signatures** — ABI compatibility required
4. **Use the spike (`origin/spike/integrated-lib-diamond`) as REFERENCE only** — apply naming corrections from Section 6
5. **Build in dependency order**: Libraries → Orchestrators → Facets → Tests
6. **Compile frequently** — the compiler is your best verification tool
7. **One phase per commit** — keeps rollback clean
8. **Capture output once, analyze many** — use `tee /tmp/filename.txt` pattern
