---
"@hashgraph/asset-tokenization-contracts": patch
---

refactor(contracts): adapt diamond storage wrappers to access internal storage directly (BBND-1861).

- Remove the `DiamondCutManagerStorage storage` parameter threaded through internal helpers in `DiamondCutManagerWrapper`; these functions now resolve the namespaced storage struct internally instead of receiving it from callers.
- Apply the same internal-storage adaptation to `BusinessLogicResolverWrapper`, `ResolverProxyUnstructured`, `ResolverProxyStorageWrapper`, `ResolverProxy`, `DiamondCut`, `DiamondCutManager`, `DiamondLoupe` and `BusinessLogicResolver`.
- Improve and align the NatSpec across the resolver-proxy and diamond infrastructure, including the always-present stability banner on storage structs.

Internal refactor only. The ERC-7201 `STORAGE_LOCATION_*` constants, on-chain storage layout, external function selectors and runtime behaviour are unchanged; downstream SDK and dapp consumers see no API change.
