---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract the coupon security-holder queries (`getCouponHolders`, `getCouponsFor`, `getTotalCouponHolders`) from `CouponFacet` into a dedicated `CouponSecurityHoldersFacet`; `IAsset` now inherits `ICouponSecurityHolders` alongside `ICoupon`.

Non-breaking: the 4-byte selectors of all three functions are unchanged, so calls through `IAsset` continue to work without modification.
