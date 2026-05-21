---
"@hashgraph/asset-tokenization-contracts": patch
---

Refactor `initializeSecurity` to use the shared facet-registration guard.

The previous implementation relied on a bespoke `onlyNotSecurityInitialized` modifier defined in `SecurityModifiers.sol`. This has been replaced with the standard `onlyFacetNotRegistered(_SECURITY_RESOLVER_KEY)` + `onlyRole(DEFAULT_ADMIN_ROLE)` modifiers already used by every other facet, making the guard consistent across the entire diamond and removing `SecurityModifiers.sol`.

`InitializerStorageWrapper.setFacetToReady` is now called after storage is written, so a second call reverts with `FacetAlreadyRegistered` rather than a custom error.
