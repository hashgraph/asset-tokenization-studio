---
"@hashgraph/mass-payout-contracts": patch
---

Update the `ICoupon` import in `LifeCycleCashFlowStorageWrapper.sol` to the post-PR-#1042 flat path (`contracts/facets/coupon/ICoupon.sol`). The legacy `layer_2/coupon/ICoupon.sol` path was removed during the coupon MAF flat migration, breaking the mass-payout build on every downstream PR.
