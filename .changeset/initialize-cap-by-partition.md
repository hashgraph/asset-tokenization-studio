---
"@hashgraph/asset-tokenization-contracts": major
---

Migrate CapByPartition initialisation to centralised InitializerStorageWrapper pattern.

Adds `initializeCapByPartition()` gated by `onlyFacetNotRegistered(_CAP_BY_PARTITION_RESOLVER_KEY)` and `onlyRole(DEFAULT_ADMIN_ROLE)`. Calls `InitializerStorageWrapper.setFacetToReady` and emits `CapByPartitionInitialized(address indexed operator)` on first invocation. Subsequent calls revert with `FacetAlreadyRegistered`.
