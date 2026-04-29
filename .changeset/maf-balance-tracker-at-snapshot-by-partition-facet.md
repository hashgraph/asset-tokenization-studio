---
"@hashgraph/asset-tokenization-contracts": minor
---

# BalanceTrackerAtSnapshotByPartitionFacet split

Extract `balanceOfAtSnapshotByPartition` and `totalSupplyAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `BalanceTrackerAtSnapshotByPartitionFacet` registered under `_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/balanceTrackerAtSnapshotByPartition/IBalanceTrackerAtSnapshotByPartition.sol`, `BalanceTrackerAtSnapshotByPartition.sol`, `BalanceTrackerAtSnapshotByPartitionFacet.sol`.
- Added `_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `balanceOfAtSnapshotByPartition` and `totalSupplyAtSnapshotByPartition` from `Snapshots.sol`, `ISnapshots.sol` and `SnapshotsFacet.sol`; selector count drops from 15 to 13.
- `IAsset` now exposes the two selectors via `IBalanceTrackerAtSnapshotByPartition`.
- Updated `Configuration.ts`, `orchestratorLibraries.ts` and all 7 `createConfiguration.ts` scripts to include `BalanceTrackerAtSnapshotByPartitionFacet`.
- Added `test/contracts/integration/balanceTrackerAtSnapshotByPartition/balanceTrackerAtSnapshotByPartition.test.ts` covering: balance/total-supply at a snapshot for a partition, snapshotted vs. post-snapshot mutations, partition isolation, and `SnapshotIdNull` / `SnapshotIdDoesNotExists` revert paths.

## Non-breaking

The 4-byte selectors of `balanceOfAtSnapshotByPartition` and `totalSupplyAtSnapshotByPartition` are unchanged. Calls through `IAsset` continue to work without modification.
