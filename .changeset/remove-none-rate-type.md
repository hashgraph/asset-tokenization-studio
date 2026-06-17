---
"@hashgraph/asset-tokenization-contracts": major
---

Remove `NONE` from `IInterestRate.RateType`; `STANDARD` is now the EVM default.

The sentinel variant `NONE` (previously at index `0`) has been removed from the `RateType` enum in `IInterestRate`. The enum now contains only `STANDARD`, `FIXED`, and `KPI_LINKED`, with `STANDARD` at index `0`.

As a result, `STANDARD` is the implicit EVM default for any asset whose interest-rate type was never explicitly set — assets deployed without the `InterestRate` facet, or before `initializeInterestRateType` was called, now read as `STANDARD` rather than `NONE`.

Any on-chain storage that previously held `RateType.FIXED` (`2`) or `RateType.KPI_LINKED` (`3`) on already-deployed assets will be misread after an upgrade; a storage migration or re-initialisation is required for those assets.
