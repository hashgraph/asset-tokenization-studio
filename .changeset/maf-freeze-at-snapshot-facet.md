---
"@hashgraph/asset-tokenization-contracts": minor
---

# FreezeAtSnapshotFacet split

Extract `frozenBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated `FreezeAtSnapshotFacet` registered under `_FREEZE_AT_SNAPSHOT_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/freezeAtSnapshot/IFreezeAtSnapshot.sol`, `FreezeAtSnapshot.sol`, `FreezeAtSnapshotFacet.sol`.
- Added `_FREEZE_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `frozenBalanceOfAtSnapshot` from `Snapshots.sol`, `SnapshotsFacet.sol`, and `ISnapshots.sol` (12 → 11 selectors). `frozenBalanceOfAtSnapshotByPartition` stays in `SnapshotsFacet`.
- `IAsset` now also inherits `IFreezeAtSnapshot`.
- Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to register `FreezeAtSnapshotFacet` alongside `SnapshotsFacet`.

## Non-breaking

The 4-byte selector of `frozenBalanceOfAtSnapshot` is unchanged (`0x5e6c70ec`). Any call to `asset.frozenBalanceOfAtSnapshot(...)` through `IAsset` continues to work without modification.
