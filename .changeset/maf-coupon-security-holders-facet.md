---
"@hashgraph/asset-tokenization-contracts": minor
---

# CouponSecurityHoldersFacet split

Extract coupon security-holder queries from `CouponFacet` into a dedicated `CouponSecurityHoldersFacet` registered under `_COUPON_SECURITY_HOLDERS_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/couponSecurityHolders/ICouponSecurityHolders.sol`, `CouponSecurityHolders.sol`, `CouponSecurityHoldersFacet.sol`.
- Added `_COUPON_SECURITY_HOLDERS_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `getCouponHolders`, `getCouponsFor`, `getTotalCouponHolders` from `Coupon.sol`, `ICoupon.sol`, and `CouponFacetBase.sol` (9 → 6 selectors).
- `IAsset` now inherits `ICouponSecurityHolders` alongside `ICoupon`.
- Updated `Configuration.ts` and 5 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, loan) to register `CouponSecurityHoldersFacet`.
- Added `test/contracts/integration/couponSecurityHolders/couponSecurityHolders.test.ts` covering snapshot holders, pre-record-date empty results, pagination, and error cases.

## Non-breaking

The 4-byte selectors of all three functions are unchanged. Any call to `asset.getCouponHolders(...)`, `asset.getCouponsFor(...)`, or `asset.getTotalCouponHolders(...)` through `IAsset` continues to work without modification.
