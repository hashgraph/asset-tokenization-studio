---
"@hashgraph/asset-tokenization-contracts": minor
---

# TransferAndLockByPartitionFacet split

Extract `transferAndLockByPartition` from `TransferAndLock` into a dedicated
`TransferAndLockByPartitionFacet` registered under
`_TRANSFER_AND_LOCK_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/transferAndLockByPartition/ITransferAndLockTypes.sol`
  (shared `PartitionTransferredAndLocked` event).
- Added `contracts/facets/transferAndLockByPartition/ITransferAndLockByPartition.sol`,
  `TransferAndLockByPartition.sol`, `TransferAndLockByPartitionFacet.sol`.
- Added `_TRANSFER_AND_LOCK_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `transferAndLockByPartition` from `TransferAndLock.sol`,
  `ITransferAndLock.sol`, and `TransferAndLockFacetBase.sol` (2 → 1 selector).
- `ITransferAndLock` now inherits `ITransferAndLockTypes` instead of declaring
  `PartitionTransferredAndLocked` directly.
- `IAsset` now inherits `ITransferAndLockByPartition`.
- Updated `Configuration.ts` and 6 `createConfiguration.ts` scripts
  (equity, bond, bondKpiLinkedRate, bondSPTR, loan, loanPortfolio)
  to register `TransferAndLockByPartitionFacet`.
- Added
  `test/contracts/integration/transferAndLockByPartition/transferAndLockByPartition.test.ts`
  covering paused, access-control, expiration, invalid partition, and happy-path
  scenarios for both single-partition and multi-partition modes.

## Non-breaking

The 4-byte selector of `transferAndLockByPartition` is unchanged. Any call
through `IAsset` continues to work without modification.
