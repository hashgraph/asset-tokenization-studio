---
"@hashgraph/asset-tokenization-contracts": patch
---

Migrate the entire Coupon facet family to library composition (BBND-1710).

`CouponFacet`, `CouponFixedRateFacet`, `CouponKpiLinkedRateFacet`, and
`CouponSustainabilityPerformanceTargetRateFacet` no longer inherit the abstract
`Coupon` / `CouponFacetBase` scaffold. Each facet now declares its own external
bodies and selector array, calls the existing `CouponStorageWrapper` and
`InterestRateStorageWrapper` libraries directly, and inlines variant-specific
rate-resolution previously hidden behind the virtual `_prepareCoupon` hook.
`Coupon.sol` and `CouponFacetBase.sol` are removed (no remaining consumers).

ABI, selector set, `interfaceId`, and resolver keys are unchanged for every
facet. Aggregate Coupon-family bytecode shrinks 180 bytes.
