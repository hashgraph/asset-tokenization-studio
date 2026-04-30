---
"@hashgraph/asset-tokenization-contracts": minor
---

# ClearingAtSnapshotByPartitionFacet split

Extract `clearedBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `ClearingAtSnapshotByPartitionFacet` registered under `_CLEARING_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/clearingAtSnapshotByPartition/IClearingAtSnapshotByPartition.sol`, `ClearingAtSnapshotByPartition.sol`, `ClearingAtSnapshotByPartitionFacet.sol`.
- Added `_CLEARING_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `clearedBalanceOfAtSnapshotByPartition` from `Snapshots.sol`, `ISnapshots.sol` and `SnapshotsFacet.sol`; selector count drops from 15 to 14. The global `clearedBalanceOfAtSnapshot` stays in `Snapshots`.
- `IAsset` now exposes the selector via `IClearingAtSnapshotByPartition`.
- Updated `Configuration.ts`, `orchestratorLibraries.ts` (registered with `clearingReadOps`) and all 7 `createConfiguration.ts` scripts to include `ClearingAtSnapshotByPartitionFacet`.
- Lifted the dedicated cleared-balance scenario from `test/contracts/integration/layer_1/snapshots/snapshots.test.ts` into a new `test/contracts/integration/clearingAtSnapshotByPartition/clearingAtSnapshotByPartition.test.ts`. The test still co-asserts on the global `clearedBalanceOfAtSnapshot`, which keeps working through `IAsset` because that function remains in `SnapshotsFacet`.

## Non-breaking

The 4-byte selector of `clearedBalanceOfAtSnapshotByPartition` is unchanged. Calls through `IAsset` continue to work without modification.
