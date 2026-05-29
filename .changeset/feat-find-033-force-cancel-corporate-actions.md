---
"@hashgraph/asset-tokenization-contracts": minor
---

Feat FIND-033: add force-cancel capability for all corporate action types.

Introduces a new `CORPORATE_ACTION_CANCEL_ADMIN_ROLE` and five corresponding force-cancel methods — `forceCancelCoupon`, `forceCancelDividend`, `forceCancelVoting`, `forceCancelBalanceAdjustment`, and `forceCancelAmortization` — that allow privileged admins to cancel a corporate action regardless of its execution or record date. This unblocks stuck actions (e.g. already-executed) without bypassing active-hold guards for amortization.

Each method keeps the same modifier chain as its regular cancel counterpart, only replacing the role constant and removing the internal date guard. Events `CouponForceCancelled`, `DividendForceCancelled`, `VotingForceCancelled`, `ScheduledBalanceAdjustmentForceCancelled`, and `AmortizationForceCancelled` are emitted at the facet layer.
