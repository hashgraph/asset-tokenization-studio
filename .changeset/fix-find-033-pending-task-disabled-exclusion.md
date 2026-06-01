---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-033: exclude disabled corporate actions from pending task aggregations.

Previously, `getPendingScheduledCouponListingTotalAt` and `getPendingScheduledBalanceAdjustmentsAt` included tasks whose corporate action had been cancelled (disabled), causing `getCouponsOrderedListTotal`, `getCouponsOrderedList`, `getCouponFromOrderedListAt`, and projected balance queries (`balanceOfAt`, `totalSupplyAdjustedAt`, `getMaxSupplyAdjustedAt`) to count or apply cancelled tasks as if they were still active.

A `bool _includeDisabled` flag was added to both aggregation functions and propagated to all internal callers. All callers that compute live values pass `false`, so disabled tasks are transparently skipped.

The flag is now also exposed on all external count and list entrypoints — `getCouponFromOrderedListAt`, `getCouponsOrderedList`, `getCouponsOrderedListTotal`, `scheduledCouponListingCount`, `getScheduledCouponListing`, `scheduledSnapshotCount`, `getScheduledSnapshots`, `getPendingBalanceAdjustmentCount`, and `getScheduledBalanceAdjustments` — so callers can explicitly opt in to including disabled items (useful for debugging and auditing). Pass `false` to preserve the default behaviour of returning only active items.
