---
"@hashgraph/asset-tokenization-contracts": patch
---

Prevent activation of diamond configurations with zero facets. `_activateConfiguration` now reverts with `EmptyFacetConfigurationNotPermitted` when the accumulated facet list for a batch version is empty, closing a vector where `createConfiguration` or `createBatchConfiguration` could register a configuration with no function selectors and brick any `ResolverProxy` following the latest version. [FIND-114]
