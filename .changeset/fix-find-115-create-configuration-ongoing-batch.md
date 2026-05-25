---
"@hashgraph/asset-tokenization-contracts": patch
---

Prevent `createConfiguration` from prematurely finalising an in-progress batch. `_createConfiguration` now reverts with `OngoingBatchConfigurationNotPermitted` when `_isOngoingConfiguration` returns true, closing a vector where calling `createConfiguration` on an open batch would absorb partial state and immediately activate the configuration — potentially missing facets intended for subsequent batch additions. [FIND-115]
