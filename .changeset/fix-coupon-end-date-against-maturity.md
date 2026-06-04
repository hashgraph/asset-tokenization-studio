---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `setCoupon` now rejects coupon `endDate` values that exceed the bond's maturity date.

Previously, `setCoupon` validated internal date ordering (e.g. `startDate <= endDate`) via `onlyValidDates` modifiers but never compared `endDate` against `_getMaturityDate()`. A coupon with `endDate > maturityDate` could be created, causing interest to accrue beyond the bond's contractual life and producing incorrect coupon amounts.

The fix adds `CouponStorageWrapper.checkEndDateAgainstMaturity`, which reads the bond's maturity date from storage and delegates to `DatesValidation.checkDates`, reverting with `WrongDates` if the constraint is violated. When `maturityDate` is zero the bond is treated as open-ended and no constraint is applied. `setCoupon` calls this check before any rate stamping.
