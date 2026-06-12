---
"@hashgraph/asset-tokenization-contracts": major
---

Adopt full ERC-7201 namespaced storage discipline across the ATS contracts, completing the slot-formula work from BBND-1674: every top-level storage struct under `contracts/domain/{asset,core}/` gains a `@custom:storage-location` annotation and is reorganised into the v8.0.0 five-region layout terminated by an append-only marker. Several structs are repacked for slot savings, and the duplicated `currency` fields on Bond/Equity are dropped in favour of `NominalValueDataStorage.nominalValueCurrency`.

Breaking: storage slots under `contracts/domain/` shift as fields move regions, so existing deployed proxies cannot be migrated in place — v8.0.0 is a clean redeploy. ABI surface, selectors, and EIP-165 `interfaceId` values are unchanged, so SDK and TypeChain consumers see no public-surface change.
