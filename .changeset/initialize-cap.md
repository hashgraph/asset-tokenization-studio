---
"@hashgraph/asset-tokenization-contracts": major
---

Migrate Cap initialisation from per-facet boolean guard to centralised
InitializerStorageWrapper pattern. Replaces `onlyNotCapInitialized` with
`onlyFacetNotRegistered` + `onlyRole(DEFAULT_ADMIN_ROLE)`. Emits `CapInitialized`
on successful initialisation.
