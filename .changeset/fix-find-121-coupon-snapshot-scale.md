---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-121: `CouponStorageWrapper._calculateCouponAmount` re-read the live `nominalValue`/`nominalValueDecimals` even when the holder balance and decimals were resolved at the coupon's snapshot, so a `setNominalValue` (or decimal-precision ABAF adjustment) between the record date and a `getCouponFor`/`getCouponAmountFor` query composed numerator and denominator at incompatible scales, inflating or shrinking the payable amount. The helper now receives `nominalValue` and `nominalValueDecimals` as parameters sampled from the snapshot (or live storage in the no-snapshot fallback) and is `pure`, making the scale invariant the caller's responsibility.
