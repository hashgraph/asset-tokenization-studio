---
"@hashgraph/asset-tokenization-contracts": minor
---

# LockAtSnapshot split

Extract `lockedBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated
`LockAtSnapshotFacet` registered under `_LOCK_AT_SNAPSHOT_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/lockAtSnapshot/ILockAtSnapshot.sol`,
  `LockAtSnapshot.sol`, `LockAtSnapshotFacet.sol`.
- Added `_LOCK_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `lockedBalanceOfAtSnapshot` from `Snapshots.sol`, `ISnapshots.sol`,
  and `SnapshotsFacet.sol` (10 → 9 selectors).
- `IAsset` now inherits `ILockAtSnapshot`.
- Updated `Configuration.ts` and 7 `createConfiguration.ts` scripts
  (equity, bond, bondFixedRate, bondKpiLinkedRate, bondSPTR, loan,
  loanPortfolio) to register `LockAtSnapshotFacet`.
- Added `test/contracts/integration/lockAtSnapshot/lockAtSnapshot.test.ts`
  covering null snapshot, unknown snapshot, zero-lock, exact-amount,
  historical isolation, and multi-holder scenarios.

## Non-breaking

The 4-byte selector of `lockedBalanceOfAtSnapshot` is unchanged. Any call
through `IAsset` continues to work without modification.
