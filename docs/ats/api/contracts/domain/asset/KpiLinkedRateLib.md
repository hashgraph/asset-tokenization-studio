# KpiLinkedRateLib

_Asset Tokenization Studio Team_

> KpiLinkedRateLib

Library for calculating KPI-linked interest rates.

_This library implements the rate calculation logic for securities with KPI-linked rates. The rate is calculated based on: - Start rate: Rate applied before the start period - Base rate: The target rate at baseline impact - Min/Max rate: Rate boundaries - Impact data: Aggregate KPI data from all proceed recipients - Missed penalty: Applied when no KPI report is found Rate calculation formula: 1. If fixing date is before start period: use start rate 2. If no KPI report found: previousRate + missedPenalty (capped at maxRate) 3. If KPI report found: proportional calculation between min/base/max based on impact vs baseline_
