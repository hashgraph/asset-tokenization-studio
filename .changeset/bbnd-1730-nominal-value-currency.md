---
"@hashgraph/asset-tokenization-contracts": minor
"@hashgraph/asset-tokenization-sdk": minor
---

Add `nominalValueCurrency` (ISO 4217 `bytes3`) to the `NominalValue` facet. Extends `initializeNominalValue` to accept the currency and adds `setNominalValueCurrency` / `getNominalValueCurrency` external functions, plus the matching SDK command, query, request DTOs, and adapter wiring. Factory forwards `bondDetails.currency` / `equityDetails.currency` on new deploys. Renames `initialize_NominalValue` to `initializeNominalValue` (camelCase, drops the solhint disable). [BBND-1730]
