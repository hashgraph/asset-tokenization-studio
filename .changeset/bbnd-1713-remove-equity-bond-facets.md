---
"@hashgraph/asset-tokenization-contracts": major
---

Remove the Equity / EquityUSA facet stack and the monolithic BondFacet + SecurityFacet. Extract shared balance-adjustment helpers into a standalone library.

What changes:

- **Deleted facets**: `Equity` (layer_2), `EquityUSA` / `EquityUSAFacet` (layer_3), and their modifier `EquityModifiers`. The `BondRead` monolithic facet and `SecurityStorageWrapper` are also removed; their responsibilities are now distributed across dedicated micro-facets (`Maturity`, `NominalValue`, `ProceedRecipients`, `FixedRate`, `KpiLinkedRate`, `Security`).
- **Deleted storage**: `EquityStorageWrapper`, `BondStorageWrapper`, and `SecurityStorageWrapper` are removed. No on-chain migration is required — this is a greenfield redeployment.
- **New library**: `contracts/domain/orchestrator/BalanceAdjustmentOps.sol` — a pure library (no storage slot) that centralises the six balance-adjustment helpers previously embedded in `EquityStorageWrapper`. Consumed by `DividendStorageWrapper`, `VotingStorageWrapper`, and `ScheduledBalanceAdjustmentFacet`.
- **Factory**: `deployEquity` ABI is preserved byte-for-byte on `IFactory` / `Factory`; the implementation body is removed. `deployBond` and related equity/bond enum variants are removed from `SecurityType`.
- **IAsset**: Equity and Bond interface references removed from the aggregate interface.
- `EquityDataStorage.currency` and `BondDataStorage.currency` fields are gone; denomination currency is now owned exclusively by `NominalValueDataStorage.nominalValueCurrency`.

Breaking changes for downstream consumers:

- `IEquity`, `IEquityUSA`, `IEquityUSAFacet`, `IBond`-monolithic, and `ISecurity`-wrapper are no longer part of the Diamond ABI. Any SDK or off-chain code that calls these selectors must be updated to use the equivalent micro-facet surfaces.
- `SecurityType.Equity` and `SecurityType.Bond` enum variants are removed from `IFactory`. Callers must use `BondFixedRate`, `BondVariableRate`, or `BondKpiLinkedRate` directly.
- Deployed tokens retain their state; newly deployed tokens will not include the removed facets in their Diamond configuration.
