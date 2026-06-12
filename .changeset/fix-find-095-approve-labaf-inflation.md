---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-095: anchor the allowance LABAF in `approve` to prevent allowance inflation. `ERC20StorageWrapper.approve` set the allowance without updating its Last Applied Balance Adjustment Factor, so when the global ABAF had already grown a later `transferFrom` silently multiplied the stored allowance by `currentAbaf / staleLabaf`, letting the spender move more than approved. `approve` now calls `updateAllowanceLabaf` to pin the allowance LABAF to the current ABAF, so `transferFrom` finds `abaf == labaf` and leaves the allowance unchanged. Adds a regression test.
