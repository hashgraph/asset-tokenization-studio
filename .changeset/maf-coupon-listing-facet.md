---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract coupon and scheduled-coupon listing queries from `CouponFacet` and `ScheduledCouponListingFacet` into a dedicated `CouponListingFacet`; the now-empty `ScheduledCouponListingFacet` is deleted and `IAsset` inherits `ICouponListing` in its place.

Non-breaking: the 4-byte selectors of all moved queries are unchanged, so calls through `IAsset` continue to work without modification.
