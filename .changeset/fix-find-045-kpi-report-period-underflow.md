---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-045: guard against `uint256` underflow when computing the KPI report lookback window in `KpiLinkedRateLib::_collectImpactData`. The expression `fixingDate - reportPeriod` was evaluated without validating that `reportPeriod <= fixingDate`, so a misconfigured `reportPeriod` (greater than the coupon `fixingDate`) reverted every KPI-linked rate calculation. Because the calculation runs from the scheduled-tasks queue, a single bad configuration could permanently freeze coupon processing for the asset.

The subtraction is now staged through `windowStart = fixingDate > reportPeriod ? fixingDate - reportPeriod : fixingDate`. When `reportPeriod` exceeds `fixingDate`, the lookup window collapses to `[fixingDate, fixingDate]`, no KPI record is found, and the rate falls back to the existing missed-report branch (`_getRateWhenNoReport`) instead of reverting. Existing behaviour for valid configurations is unchanged.
