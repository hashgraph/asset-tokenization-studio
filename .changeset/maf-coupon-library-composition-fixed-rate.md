---
"@hashgraph/asset-tokenization-contracts": patch
---

Migrate CouponFixedRateFacet to library composition (BBND-1710).

The fixed-rate variant no longer inherits the abstract `Coupon` / `CouponFacetBase`
scaffold. It now declares its own external bodies and selector array, calls the
existing `CouponStorageWrapper` and `InterestRateStorageWrapper` libraries directly,
and inlines the rate-resolution step previously hidden behind the virtual
`_prepareCoupon` hook. ABI, selector set, `interfaceId`, and resolver key are
unchanged. Other coupon variants are untouched and follow in subsequent issues.
