---
"@hashgraph/asset-tokenization-contracts": major
---

Remove country from LoansPortfolio and isin from the token core. The country field is dropped from the HoldingsAsset struct and all geographical-exposure tracking (GeographicalExposureData, getGeographicalExposure and the per-country storage) is removed. The isin field is dropped from ERC20MetadataInfo and ERC20Storage, and the factory ISIN validation (isinValidator, onlyValidISIN, WrongISIN errors and ISIN constants) is removed. Both values can now be stored in the CustomData facet instead.
