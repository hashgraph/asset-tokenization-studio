---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-052: guard against `uint256` overflow in the coupon and principal calculation paths. `CouponStorageWrapper._calculateCouponAmount` and `BondStorageWrapper.getPrincipalFor` materialised large products before dividing, so high-precision bond configurations could overflow and revert every view that touched them, freezing coupon payouts and principal queries. Both now stage the numerator through `Math.mulDiv`, gaining 512-bit headroom while staying mathematically equivalent; the public fraction-returning API is preserved, so off-chain consumers that divide the pair are unaffected. The third audit-flagged site (`pendingABAF_` accumulation) is intentionally left untouched, as changing it would require a coordinated update of the ABAF convention and its consumers.
