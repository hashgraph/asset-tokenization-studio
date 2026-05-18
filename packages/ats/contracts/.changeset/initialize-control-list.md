---
"@hashgraph/asset-tokenization-contracts": major
---

Migrate ControlList initialisation from per-facet boolean guard to centralised InitializerStorageWrapper pattern. Replaces `onlyNotControlListInitialized` with `onlyFacetNotRegistered` + `onlyRole(DEFAULT_ADMIN_ROLE)`. Emits `ControlListInitialized` on successful initialisation.
