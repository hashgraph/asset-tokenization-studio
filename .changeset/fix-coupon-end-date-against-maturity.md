---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix `setCoupon` to reject a coupon `endDate` that exceeds the bond's maturity date. It validated internal date ordering via `onlyValidDates` but never compared `endDate` against `_getMaturityDate()`, so a coupon could accrue interest beyond the bond's contractual life and produce incorrect amounts. A new `CouponStorageWrapper.checkEndDateAgainstMaturity` reads the maturity date and delegates to `DatesValidation.checkDates`, reverting `WrongDates` when violated; a zero maturity date is treated as open-ended (no constraint). `setCoupon` runs the check before any rate stamping.
