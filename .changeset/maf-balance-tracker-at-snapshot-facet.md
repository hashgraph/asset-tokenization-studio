---
"@hashgraph/asset-tokenization-contracts": minor
---

# BalanceTrackerAtSnapshotFacet split

Extract `balanceOfAtSnapshot`, `balancesOfAtSnapshot` and `totalSupplyAtSnapshot` from `SnapshotsFacet` into a dedicated `BalanceTrackerAtSnapshotFacet` registered under `_BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol`, `BalanceTrackerAtSnapshot.sol`, `BalanceTrackerAtSnapshotFacet.sol`.
- Added `_BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `balanceOfAtSnapshot`, `balancesOfAtSnapshot` and `totalSupplyAtSnapshot` from `Snapshots.sol`, `ISnapshots.sol` and `SnapshotsFacet.sol`; selector count drops from 18 to 15. Also migrated `SnapshotsFacet` selector registration to the `--selectorIndex`/`unchecked` pattern.
- `IAsset` now exposes the three selectors via `IBalanceTrackerAtSnapshot`.
- Updated `Configuration.ts`, `orchestratorLibraries.ts` and all 7 `createConfiguration.ts` scripts to include `BalanceTrackerAtSnapshotFacet`.
- Added `test/contracts/integration/balanceTrackerAtSnapshot/balanceTrackerAtSnapshot.test.ts` covering: balance/total-supply at a snapshot, snapshotted vs. post-snapshot mutations, paginated `balancesOfAtSnapshot`, and `SnapshotIdNull` / `SnapshotIdDoesNotExists` revert paths.

## Non-breaking

The 4-byte selectors of `balanceOfAtSnapshot`, `balancesOfAtSnapshot` and `totalSupplyAtSnapshot` are unchanged. Calls through `IAsset` continue to work without modification.
