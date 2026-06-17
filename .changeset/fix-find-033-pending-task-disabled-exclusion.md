---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-033: exclude disabled (cancelled) corporate actions from pending-task aggregations. `getPendingScheduledCouponListingTotalAt` and `getPendingScheduledBalanceAdjustmentsAt` counted tasks whose corporate action had been cancelled, so coupon-list and projected-balance queries (`balanceOfAt`, `totalSupplyAdjustedAt`, `getMaxSupplyAdjustedAt`) applied cancelled tasks as if still active. A `bool _includeDisabled` flag is added to both aggregations and propagated to callers (live-value callers pass `false`); the flag is also exposed on the external count/list entrypoints so callers can opt in to including disabled items for debugging and auditing.
