---
"@hashgraph/asset-tokenization-contracts": major
---

Move `initializeClearing` from the standalone `ClearingActionsFacet` into the consolidated `ClearingFacet`, completing the clearing-module unification; `ClearingFacet` now exposes 6 selectors under its resolver key.

Breaking: the `IClearingActions` interface and `ClearingActionsFacet` are removed and `_CLEARING_ACTIONS_RESOLVER_KEY` is gone, so diamond configurations that referenced it must register `ClearingFacet` instead and `IClearing`'s `interfaceId` changes accordingly. The 4-byte selector of `initializeClearing(bool)` is unchanged, so low-level calls through the proxy still work.
