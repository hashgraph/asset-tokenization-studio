---
"@hashgraph/asset-tokenization-contracts": patch
---

Consolidate `getTotalBalanceForAdjustedAt` into `TokenCoreOps` as the single source of truth.

`TokenCoreOps.getTotalBalanceForAdjustedAt` was missing the frozen balance component (balance + lock + hold + clearing, no frozen). `ERC3643StorageWrapper` had a correct wrapper that summed `TokenCoreOps` plus frozen, but this created an unnecessary indirection and two implementations to maintain.

The fix adds the frozen balance term directly to `TokenCoreOps.getTotalBalanceForAdjustedAt` via `ERC3643StorageWrapper.getFrozenAmountForAdjustedAt`, removes the now-redundant wrapper in `ERC3643StorageWrapper` to call `TokenCoreOps` directly.
