---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-045: guard against `uint256` underflow when computing the KPI report lookback window in `KpiLinkedRateLib::_collectImpactData`. `fixingDate - reportPeriod` was evaluated without checking `reportPeriod <= fixingDate`, so a misconfigured `reportPeriod` reverted every KPI-linked rate calculation — and since it runs from the scheduled-tasks queue, one bad config could permanently freeze coupon processing. The subtraction is now staged so an over-large `reportPeriod` collapses the window to `[fixingDate, fixingDate]`, finds no KPI record, and falls back to the existing missed-report branch instead of reverting; valid configurations are unchanged.
