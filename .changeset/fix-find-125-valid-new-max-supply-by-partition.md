---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-125: prohibit setting partition max supply to zero and remove the global-cap coherence check.

`requireValidNewMaxSupplyByPartition` returned early when `_newMaxSupply == 0`, silently treating zero as "unlimited" and bypassing all validation. An admin could therefore remove a partition-level cap without any constraint, downgrading a bounded partition to unlimited with no revert.

The fix replaces the early return with a `NewMaxSupplyCannotBeZero` revert, making partition-cap behaviour consistent with the global-cap validation already present in `requireValidNewMaxSupply`.

Additionally, the check that prevented a partition cap from exceeding the global max supply (`NewMaxSupplyByPartitionTooHigh`) has been removed, as there is no business requirement for that constraint.
