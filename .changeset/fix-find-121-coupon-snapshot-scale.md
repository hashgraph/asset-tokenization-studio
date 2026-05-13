---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-121: `CouponStorageWrapper._calculateCouponAmount` re-read the live `nominalValue` and `nominalValueDecimals` from `NominalValueStorageWrapper`, even when the holder balance and token decimals had been resolved at the snapshot bound to the coupon. When `setNominalValue` (or an ABAF adjustment changing decimal precision) ran between the coupon's record date and a `getCouponFor` / `getCouponAmountFor` query, the numerator and denominator were composed at incompatible scales — inflating or shrinking the fractional payable amount.

`_calculateCouponAmount` now receives `nominalValue` and `nominalValueDecimals` as parameters, sampled by `getCouponFor` from the snapshot (via `SnapshotsStorageWrapper.nominalValueAtSnapshot` / `nominalValueDecimalsAtSnapshot`) or from live storage in the no-snapshot fallback. The helper no longer reads storage and is now `pure`, making the scale invariant the caller's responsibility and preventing the inconsistent-read defect at the type level.
