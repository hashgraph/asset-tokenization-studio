---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-095: update allowance LABAF in `approve` to prevent allowance inflation.

`ERC20StorageWrapper.approve` set `allowed[owner][spender] = value` directly without updating the Last Applied Balance Adjustment Factor (LABAF) for that allowance pair. Because `getAllowanceLabaf` returns 1 for any entry that has never been written, a subsequent call to `transferFrom` would enter `updateAllowanceAndLabaf` with a stale LABAF of 1 even when the global ABAF had already grown (e.g. to 2 via a balance adjustment). The result was that the stored allowance was silently multiplied by `currentAbaf / staleLabaf`, allowing the spender to transfer more tokens than the owner intended to approve.

The fix adds a single call to `AdjustBalancesStorageWrapper.updateAllowanceLabaf` inside `approve`, anchoring the allowance LABAF to the current ABAF at the moment of approval. When `transferFrom` later invokes `updateAllowanceAndLabaf`, it finds `abaf == labaf` and leaves the stored allowance unchanged.

A regression test was added to `allowance.test.ts` (FIND-095) that:

1. Applies a balance adjustment (factor 2, ABAF goes from 1 → 2).
2. Calls `approve` for 500 tokens.
3. Asserts that `transferFrom` for 501 tokens reverts with `InsufficientAllowance` — which it did not before the fix.
