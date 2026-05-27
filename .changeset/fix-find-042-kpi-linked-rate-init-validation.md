---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `initializeKpiLinkedRate` now validates `interestRate` and `impactData` at initialisation time.

Previously, `initializeKpiLinkedRate` accepted any `InterestRate` and `ImpactData` structs without checking their contents. Invalid values (e.g. zero oracle address, out-of-range rate bounds) could be written to storage during deployment and would only surface as failures later during coupon or payout operations.

The fix adds the `onlyValidInterestRate` and `onlyValidImpactData` modifiers to `initializeKpiLinkedRate` in `KpiLinkedRate.sol`, applying the same validation that `setKpiLinkedRateInterestRate` and `setKpiLinkedRateImpactData` already enforced on updates. Deployments with invalid initial parameters now revert immediately at the factory level.
