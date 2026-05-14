---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-090: guard against `address(0)` reaching snapshot and batch state-writing functions.

Three entry points allowed `address(0)` to reach internal state-writing functions with no validation, creating phantom snapshot entries or bypassing the zero-address checks enforced by their single-call counterparts.

`updateAccountSnapshot` in `SnapshotsStorageWrapper` unconditionally wrote a snapshot entry for whatever account was passed. Clearing-creation functions (`clearingTransferCreation`, `clearingRedeemCreation`, `clearingHoldCreationCreation`) intentionally pass `address(0)` as the destination at creation time, so with an active snapshot this produced a phantom storage entry for `address(0)`.

`batchFreezePartialTokens` and `batchUnfreezePartialTokens` in `BatchFreeze` called `ERC1410StorageWrapper.requireValidAddress` instead of `ExternalListManagementStorageWrapper.checkValidAddress`, which includes the zero-address check that the single-call `freezePartialTokens` and `unfreezePartialTokens` enforce.

`batchTransfer` in `BatchTransfer` omitted the `checkValidAddress` call entirely for each recipient, while the single-call `transfer` path enforced it.

The fix adds an `account == address(0)` early-return guard to `updateAccountSnapshot`, replaces the incorrect validator in `BatchFreeze`, and adds `checkValidAddress` to the recipient loop in `BatchTransfer`.
