# CouponRateDispatch

_Asset Tokenization Studio Team_

> CouponRateDispatch

Central dispatcher for coupon rate resolution across all supported rate types.

_To add a new rate type: (1) add the variant to `ICouponTypes.RateType`, then (2) add the corresponding branch in `resolveRate` (if the rate is computed at read/trigger time) or `validateAndStamp` (if the rate is stamped at write time). `InterestRateFacet` is the single source of truth for which type is active on an asset. If the relevant facet has not been initialized when its branch is reached, the library returns (0, 0) rather than reverting — the admin is responsible for correct configuration._
