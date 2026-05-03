---
"@hashgraph/asset-tokenization-contracts": minor
---

# ClearingAtSnapshotFacet split

Extract `clearedBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated `ClearingAtSnapshotFacet` registered under `_CLEARING_AT_SNAPSHOT_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/clearingAtSnapshot/IClearingAtSnapshot.sol`, `ClearingAtSnapshot.sol`, `ClearingAtSnapshotFacet.sol`.
- Added `_CLEARING_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `clearedBalanceOfAtSnapshot` from `Snapshots.sol`, `ISnapshots.sol` and `SnapshotsFacet.sol`; selector count drops from 15 to 14. The partition-scoped `clearedBalanceOfAtSnapshotByPartition` stays in `Snapshots` and will be split separately.
- `IAsset` now exposes the selector via `IClearingAtSnapshot`.
- Updated `Configuration.ts`, `orchestratorLibraries.ts` (registered with `clearingReadOps`) and all 7 `createConfiguration.ts` scripts to include `ClearingAtSnapshotFacet`.
- Lifted the dedicated cleared-balance test case from `test/contracts/integration/layer_1/snapshots/snapshots.test.ts` into a new `test/contracts/integration/clearingAtSnapshot/clearingAtSnapshot.test.ts`.

## Non-breaking

The 4-byte selector of `clearedBalanceOfAtSnapshot` is unchanged. Calls through `IAsset` continue to work without modification.
