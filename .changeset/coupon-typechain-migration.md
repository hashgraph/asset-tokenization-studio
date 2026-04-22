---
"@hashgraph/asset-tokenization-sdk": major
---

Migrated all coupon operations from `BondToken` to a new dedicated `CouponToken` export, replacing `BondRead__factory` and `Bond__factory` with `Coupon__factory` across all coupon queries and transactions. Added new `getCouponsFor` method for paginated coupon balances per account.
