---
"@hashgraph/asset-tokenization-contracts": patch
---

Adapt the diamond storage wrappers to resolve their namespaced storage struct internally instead of receiving it as a parameter (BBND-1861). Removes the threaded `DiamondCutManagerStorage storage` argument from `DiamondCutManagerWrapper`'s internal helpers and applies the same adaptation to `BusinessLogicResolverWrapper`, `ResolverProxyUnstructured`, `ResolverProxyStorageWrapper`, `ResolverProxy`, `DiamondCut`, `DiamondCutManager`, `DiamondLoupe` and `BusinessLogicResolver`, alongside NatSpec alignment. Internal refactor only — `STORAGE_LOCATION_*` constants, storage layout, selectors and runtime behaviour are unchanged, so SDK and dapp consumers see no API change.
