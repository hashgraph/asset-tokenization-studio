---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-125: prohibit setting a partition max supply to zero and remove the global-cap coherence check. `requireValidNewMaxSupplyByPartition` returned early when `_newMaxSupply == 0`, silently treating zero as "unlimited" and letting an admin downgrade a bounded partition to unlimited with no revert; it now reverts `NewMaxSupplyCannotBeZero`, matching the global-cap validation. The `NewMaxSupplyByPartitionTooHigh` check (partition cap must not exceed the global cap) is removed, as there is no business requirement for it.
