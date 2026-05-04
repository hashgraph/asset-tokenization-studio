---
"@hashgraph/asset-tokenization-contracts": minor
---

# CouponListingFacet split

Extract coupon and scheduled-coupon listing queries from `CouponFacet` and `ScheduledCouponListingFacet` into a dedicated `CouponListingFacet` registered under `_COUPON_LISTING_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/layer_2/coupon/couponListing/ICouponListing.sol`, `CouponListing.sol`, `CouponListingFacet.sol`.
- Added `_COUPON_LISTING_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `getCouponFromOrderedListAt`, `getCouponsOrderedList`, `getCouponsOrderedListTotal` from `Coupon.sol`, `ICoupon.sol`, and `CouponFacetBase.sol` (12 → 9 selectors).
- Deleted `ScheduledCouponListingFacet.sol`, `ScheduledCouponListing.sol`, `IScheduledCouponListing.sol` and the `ScheduledCouponListingFacetTimeTravel.sol` shim (all emptied by the split).
- `IAsset` now inherits `ICouponListing` instead of `IScheduledCouponListing`.
- Updated `Configuration.ts`, all 5 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, loanPortfolio) to reference `CouponListingFacet`. Added `CouponListingFacet` to `loan/createConfiguration.ts`.
- Added `test/contracts/integration/layer_1/coupon/couponListing/couponListing.test.ts` consolidating ordered-list and scheduled-listing tests.

## Non-breaking

The 4-byte selectors of all five functions are unchanged. Any call to `asset.getCouponsOrderedList(...)`, `asset.getCouponFromOrderedListAt(...)`, `asset.getCouponsOrderedListTotal()`, `asset.scheduledCouponListingCount()`, or `asset.getScheduledCouponListing(...)` through `IAsset` continues to work without modification.
