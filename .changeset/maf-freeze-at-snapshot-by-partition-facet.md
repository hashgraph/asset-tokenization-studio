---
"@hashgraph/asset-tokenization-contracts": minor
---

# FreezeAtSnapshotByPartitionFacet split

Extract `frozenBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `FreezeAtSnapshotByPartitionFacet` registered under `_FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol`, `FreezeAtSnapshotByPartition.sol`, `FreezeAtSnapshotByPartitionFacet.sol`.
- Added `_FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `frozenBalanceOfAtSnapshotByPartition` from `Snapshots.sol`, `SnapshotsFacet.sol`, and `ISnapshots.sol` (11 → 10 selectors).
- `IAsset` now also inherits `IFreezeAtSnapshotByPartition`.
- Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to register `FreezeAtSnapshotByPartitionFacet` alongside `SnapshotsFacet`.

## Non-breaking

The 4-byte selector of `frozenBalanceOfAtSnapshotByPartition` is unchanged (`0x0749c323`). Any call to `asset.frozenBalanceOfAtSnapshotByPartition(...)` through `IAsset` continues to work without modification.
