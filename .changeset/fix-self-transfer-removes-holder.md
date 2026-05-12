---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: self-transfer of full balance silently removes holder from registry.

In `beforeTokenTransfer`, a self-transfer (`from == to`) with the full balance caused `removeFrom = true` (full balance transferred) while `addTo = false` (recipient already had balance), triggering `removeTokenHolder(from)` even though the holder still retained their tokens. Any affected holder would be excluded from all future dividend, coupon, and corporate action distributions.

Fix adds an early return at the top of `beforeTokenTransfer` when `from == to`. A self-transfer produces no net balance change, so no snapshot updates, holder registry mutations, or balance adjustments are needed.
