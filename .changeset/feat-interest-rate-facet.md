---
"@hashgraph/asset-tokenization-contracts": minor
---

Add InterestRateFacet with coupon rate type selector (STANDARD, FIXED, KPI_LINKED).

- Introduces `IInterestRate` interface with `setCouponRateType`, `getCouponRateType`, and `initializeInterestRateType`
- Moves `RateType` enum from `ICouponTypes` to `IInterestRate` as the canonical owner
- Adds `InterestRateStorageWrapper` helpers: `setCouponRateType`, `getCouponRateType`, `requireValidRateType`
- Adds `CouponRateDispatchLib` as central dispatcher for coupon rate resolution across all rate variants
- Wires `InterestRateFacet` into Factory deployment for all security types (Equity, Bond, BondFixedRate, BondKpiLinkedRate)
- Adds `InterestRateModifiers` with `onlyValidRateType` delegating to storage wrapper
