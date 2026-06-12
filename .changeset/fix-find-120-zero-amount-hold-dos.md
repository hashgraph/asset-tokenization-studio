---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-120: reject zero-amount holds that create a ghost partition and permanently block `fullRedeemAtMaturity`. A hold with `amount == 0` executed against a recipient who didn't hold the partition wrote a `Partition(0, partition)` entry; at maturity the redemption loop hit the zero-balance ghost and reverted via `_checkUnexpectedError`, bricking redemption for that address (clearing holds shared the same vector). The fix adds a `checkNonZeroHoldAmount` guard at hold and clearing-hold creation (reverting `InvalidHoldAmount`), makes `fullRedeemAtMaturity` skip zero-balance partitions as defence in depth, and adds analogous zero-amount guards to the lock and freeze paths. New errors: `InvalidHoldAmount`, `InvalidLockAmount`, `InvalidFreezeAmount`.
