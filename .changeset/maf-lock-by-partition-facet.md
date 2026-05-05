---
"@hashgraph/asset-tokenization-contracts": minor
---

# LockByPartitionFacet split

Extract the partition-aware lock surface — `lockByPartition`, `releaseByPartition`,
`getLockedAmountForByPartition`, `getLockCountForByPartition`, `getLocksIdForByPartition`,
`getLockForByPartition` — from `LockFacet` into a dedicated `LockByPartitionFacet` registered
under `_LOCK_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/lockByPartition/ILockByPartition.sol`, `LockByPartition.sol`,
  `LockByPartitionFacet.sol`.
- Introduced `contracts/facets/layer_1/lock/ILockTypes.sol` as the single source of truth for
  `LockData`, `LockedByPartition`, `LockByPartitionReleased`, `LockExpirationNotReached`,
  `WrongLockId`. Both `ILock` and `ILockByPartition` now inherit from it.
- Removed `lockByPartition`, `releaseByPartition`, `getLockedAmountForByPartition`,
  `getLockCountForByPartition`, `getLocksIdForByPartition`, `getLockForByPartition` from
  `Lock.sol`, `LockFacet.sol`, and `ILock.sol` (14 → 8 selectors).
- Added `_LOCK_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Updated `LockStorageWrapper.sol` to reference `ILockTypes` for `LockData`, `WrongLockId`,
  and `LockExpirationNotReached`.
- `IAsset` now also inherits `ILockByPartition`.
- Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate,
  bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to
  register `LockByPartitionFacet` alongside `LockFacet`.
- Moved partition-specific tests to `test/contracts/integration/lockByPartition/lockByPartition.test.ts`,
  including modifier-driven reverts (`TokenIsPaused`, `AccountHasNoRole`,
  `PartitionNotAllowedInSinglePartitionMode`).

## Non-breaking

The 4-byte selectors of all moved methods are unchanged (`lockByPartition` `0x7a87884e`,
`releaseByPartition` `0xdc6a3e75`, `getLockedAmountForByPartition` `0x6e1c55ba`,
`getLockCountForByPartition` `0x3b193d92`, `getLocksIdForByPartition` `0x3ea8b59d`,
`getLockForByPartition` `0xa9acfccb`). Any call to these methods through `IAsset` continues
to work without modification.
