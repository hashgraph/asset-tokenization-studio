# CouponModifiers

_Asset Tokenization Studio Team_

> CouponModifiers

Abstract contract providing coupon-related modifiers.

_Wraps `CouponStorageWrapper` validation into modifier form so it can be reused by any contract that does not face a stack-too-deep constraint. When the modifier cannot be used as a decorator (e.g. `CouponFacet.setCoupon` already chains seven modifiers), call `CouponStorageWrapper.checkEndDateAgainstMaturity` directly as the first statement of the function body instead._
