---
"@hashgraph/asset-tokenization-contracts": major
---

Remove the Equity / EquityUSA facet stack and the monolithic `BondRead` facet and `SecurityStorageWrapper`, distributing their responsibilities across dedicated micro-facets (`Maturity`, `NominalValue`, `ProceedRecipients`, `FixedRate`, `KpiLinkedRate`, `Security`). The six balance-adjustment helpers previously embedded in `EquityStorageWrapper` move to a new pure `BalanceAdjustmentOps` library, and `deployEquity`'s ABI is preserved byte-for-byte on `IFactory` while its body is removed.

Breaking: `IEquity`, `IEquityUSA`, `IEquityUSAFacet`, the monolithic `IBond`, and the `ISecurity` wrapper are no longer part of the Diamond ABI — callers must use the equivalent micro-facet surfaces — and the `SecurityType.Equity`/`Bond` enum variants are removed (use `BondFixedRate`, `BondVariableRate`, or `BondKpiLinkedRate`). Deployed tokens retain state; newly deployed tokens omit the removed facets. Greenfield redeployment, no on-chain migration.
