---
"@hashgraph/asset-tokenization-contracts": patch
---

Add missing modifier tests for all forceCancel corporate action functions (forceCancelCoupon, forceCancelDividend, forceCancelVoting, forceCancelScheduledBalanceAdjustment, forceCancelAmortization): onlyActivated (Deactivated) branch now covered for all five; onlyWithoutMultiPartition (NotAllowedInMultiPartitionMode) branch added for forceCancelAmortization. Fixes incorrect rejection assertion in forceCancelVoting WrongIndexForAction test. [FIND-033]
