---
"@hashgraph/asset-tokenization-contracts": major
---

Remove empty modifier contracts whose initialisation guards have been migrated to the
centralised `onlyFacetNotRegistered` + `onlyRole(DEFAULT_ADMIN_ROLE)` pattern:

- `ERC20Modifiers.sol` — removed from `AssetModifiers.sol`
- `ExternalListModifiers.sol` — removed from `CoreModifiers.sol`
- `NominalValueModifiers.sol` — removed from `AssetModifiers.sol`
