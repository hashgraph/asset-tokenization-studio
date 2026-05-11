---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `getPreviousCouponInOrderedList` now returns 0 when the coupon ID is not found in the ordered list.

Previously, if `couponID` was absent from the ordered list (e.g. a cancelled coupon), the loop ran to completion and returned the last `previousCouponId` assigned — the second-to-last element in the list. Any subsequent rate calculation treating that unrelated coupon as the predecessor would produce an incorrect rate.

The fix tracks whether the coupon was found during traversal and returns 0 if not, consistent with the "no previous coupon" sentinel used throughout `KpiLinkedRateLib` and `SustainabilityPerformanceTargetRateLib`.
