---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": major
"@hashgraph/asset-tokenization-dapp": major
---

refactor(contracts): remove `country` from `LoansPortfolio` and `isin` from the token core

### Country removed from LoansPortfolio

The `country` field has been removed from the `HoldingsAsset` struct. All geographical-exposure
tracking that relied on it has been deleted:

- `HoldingsAsset.country` field removed — callers of `addHoldingsAsset` and `removeHoldingsAsset`
  must drop the `country` argument.
- `GeographicalExposureData` struct removed.
- `WrongCountryCode` custom error removed.
- `getGeographicalExposure()` view function removed.
- `onlyValidCountryCode` modifier and the underlying `checkCountryCode` helper removed from
  `LoansPortfolioStorageWrapper`.

Country data is now the responsibility of the `CustomData` facet; consumers that require it should
store and query the value there.

### ISIN removed from the token core

The `isin` field has been removed from `ERC20MetadataInfo` (defined in `ICore`) and from all
factory interfaces and deployment helpers:

- `ICore.ERC20MetadataInfo.isin` field removed.
- `IFactory` / `IFactory` (ERC3643 clone) no longer accept an `isin` parameter.
- `Factory.sol` and `MockFactory.sol` updated accordingly.
- SDK deployment scripts (`deployBondToken`, `deployBondFixedRateToken`,
  `deployBondKpiLinkedRateToken`) no longer pass `isin`.
