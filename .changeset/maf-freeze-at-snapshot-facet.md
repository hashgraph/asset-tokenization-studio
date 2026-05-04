---
"@hashgraph/asset-tokenization-contracts": minor
---

# FreezeAtSnapshot / FreezeAtSnapshotByPartition split

Extract `frozenBalanceOfAtSnapshot` and `frozenBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into two dedicated facets:

- `FreezeAtSnapshotFacet` registered under `_FREEZE_AT_SNAPSHOT_RESOLVER_KEY`.
- `FreezeAtSnapshotByPartitionFacet` registered under `_FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/freezeAtSnapshot/IFreezeAtSnapshot.sol`, `FreezeAtSnapshot.sol`, `FreezeAtSnapshotFacet.sol`.
- Added `contracts/facets/freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol`, `FreezeAtSnapshotByPartition.sol`, `FreezeAtSnapshotByPartitionFacet.sol`.
- Added `_FREEZE_AT_SNAPSHOT_RESOLVER_KEY` and `_FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY` constants in `resolverKeys.sol`.
- Removed `frozenBalanceOfAtSnapshot` and `frozenBalanceOfAtSnapshotByPartition` from `Snapshots.sol`, `SnapshotsFacet.sol`, and `ISnapshots.sol` (12 → 10 selectors).
- `IAsset` now also inherits `IFreezeAtSnapshot` and `IFreezeAtSnapshotByPartition`.
- Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to register both new facets alongside `SnapshotsFacet`.

## Non-breaking

The 4-byte selectors of both functions are unchanged (`0x5e6c70ec` for `frozenBalanceOfAtSnapshot`, `0x0749c323` for `frozenBalanceOfAtSnapshotByPartition`). Any call to either function through `IAsset` continues to work without modification.
