---
"@hashgraph/asset-tokenization-contracts": major
---

Migrate `Coupon` writer + 3 rate variants (`CouponFixedRateFacet`,
`CouponKpiLinkedRateFacet`, `CouponSustainabilityPerformanceTargetRateFacet`) from
`contracts/facets/layer_2/coupon/` to the canonical flat `contracts/facets/coupon/`. The
shared `CouponFacetBase` scaffold is preserved at the new flat location because four concrete
facets share the same 6-selector set + virtual `_prepareCoupon` hook. Resolver keys, selector
sets, ABI, and runtime behaviour are unchanged. Removes the 4 dead `Coupon*FacetTimeTravel`
mirrors. Aligns Coupon with the post-MAF-split layout established by Dividend (PR #1038).
