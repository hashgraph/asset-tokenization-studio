---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-120: zero-amount hold execution creates ghost partition, permanently blocking `fullRedeemAtMaturity`.

`HoldStorageWrapper.createHoldByPartition` accepted `_hold.amount == 0` without validation. When such a hold was executed against a recipient who did not yet hold the relevant partition, `_transferHoldBalance` called `ERC1410StorageWrapper.addPartitionToOnly(0, _to, partition)`, writing a `Partition(0, partition)` entry into the recipient's partition array. At maturity, `Maturity.fullRedeemAtMaturity` iterated all partitions of the token holder, encountered the ghost entry with balance 0, and reverted via `_checkUnexpectedError` — permanently blocking redemption for that address.

`ClearingOps.clearingHoldCreationCreation` was exposed to the same vector: a zero-amount clearing hold would also produce a ghost partition upon approval.

The fix applies two complementary layers of defence:

- **Root cause — hold and clearing-hold creation**: `HoldStorageWrapper.checkNonZeroHoldAmount` is a new internal pure function that reverts with `IHoldTypes.InvalidHoldAmount` when the amount is zero. `createHoldByPartition` calls it at entry, and `ClearingOps.clearingHoldCreationCreation` delegates to it via `HoldStorageWrapper`, keeping the guard in a single place.
- **Defence in depth — maturity redemption**: `fullRedeemAtMaturity` no longer reverts on a zero-balance partition; it now skips it with `if (balance != 0)`, making the function resilient to any ghost partition that may already exist in storage.
- **Hygiene guards**: `LockStorageWrapper.lockByPartition` rejects `amount == 0` with `ILockTypes.InvalidLockAmount`; `ERC3643StorageWrapper.freezeTokensByPartition` rejects `_amount == 0` with `IFreeze.InvalidFreezeAmount`. Neither operation can produce a ghost partition, but accepting a zero amount is semantically invalid and creates unnecessary storage noise.

New errors added: `IHoldTypes.InvalidHoldAmount`, `ILockTypes.InvalidLockAmount`, `IFreeze.InvalidFreezeAmount`.
