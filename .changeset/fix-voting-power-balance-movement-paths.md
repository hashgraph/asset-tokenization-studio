---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix voting power updates on balance-movement paths that previously bypassed `ERC20VotesStorageWrapper.afterTokenTransfer`.

Four paths moved tokens between balance buckets (or between holders) without
notifying the ERC20Votes hook, so `DelegateVotesChanged` was never emitted and
voting-power checkpoints drifted from the actual controlled balance
(`balanceOf + locked + held + cleared + frozen`):

- `HoldStorageWrapper.transferHold` (hold execution)
- `LockStorageWrapper._releaseByPartition` (lock release)
- `ERC3643StorageWrapper.unfreezeTokensByPartition` (frozen-balance restore)
- `ClearingOps.transferClearingBalanceInternal` (clearing approval)

The fix calls `afterTokenTransfer` in all four sites passing the **real
`from`** instead of `address(0)`:

- Hold execution: `from = _holdIdentifier.tokenHolder`, `to = _to`.
- Lock release: `from = tokenHolder`, `to = tokenHolder` → `from == to` makes
  `moveVotingPower` a no-op (same-holder bucket move, no net voting-power
  change).
- Unfreeze: `from = _account`, `to = _account` → same-holder no-op.
- Clearing balance transfer: `transferClearingBalance` and
  `transferClearingBalanceInternal` take a new `_from` parameter; the four
  callers (`clearingTransferExecution` ×2, `clearingRedeemExecution`,
  `clearingHoldCreationExecution`) pass `_id.tokenHolder`.

Why this matters: voting power in this codebase is the holder's total
controlled balance across all buckets. Using `from = address(0)` would treat
every restore/transfer as a mint, inflating both the recipient delegate's
votes and `totalSupplyCheckpoints` even when tokens never actually entered
circulation. Passing the real `from` makes cross-holder transfers subtract
from the sender's delegate and add to the recipient's delegate, and keeps
intra-holder bucket moves (lock release, unfreeze) as no-ops.
