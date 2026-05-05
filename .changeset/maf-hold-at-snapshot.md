---
"@hashgraph/asset-tokenization-contracts": minor
---

# HoldAtSnapshot split

Extract `heldBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated
`HoldAtSnapshotFacet` registered under `_HOLD_AT_SNAPSHOT_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/holdAtSnapshot/IHoldAtSnapshot.sol`,
  `HoldAtSnapshot.sol`, `HoldAtSnapshotFacet.sol`.
- Added `_HOLD_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `heldBalanceOfAtSnapshot` from `ISnapshots.sol`, `Snapshots.sol`,
  and `SnapshotsFacet.sol` (11 → 10 selectors).
- `IAsset` now inherits `IHoldAtSnapshot`.
- Updated `Configuration.ts` and 7 `createConfiguration.ts` scripts
  (equity, bond, bondFixedRate, bondKpiLinkedRate,
  bondSustainabilityPerformanceTargetRate, loan, loanPortfolio) to register
  `HoldAtSnapshotFacet`.
- Added `test/contracts/integration/holdAtSnapshot/holdAtSnapshot.test.ts`
  covering revert cases (SnapshotIdNull, SnapshotIdDoesNotExists), happy paths,
  historical correctness across two snapshots, and multi-holder independence.
- Removed `heldBalanceOfAtSnapshot` assertions from `snapshots.test.ts`.

## Non-breaking

The 4-byte selector of `heldBalanceOfAtSnapshot` is unchanged. Any call
through `IAsset` continues to work without modification.
