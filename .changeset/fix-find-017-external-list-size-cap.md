---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-017: cap every external pause/control/KYC list to close a gas-griefing denial-of-service. These lists are iterated in full on the hot path of every transfer/mint/burn (`isExternallyPaused`/`isExternallyAuthorized`/`isExternallyGranted`); being unbounded, they could grow until the iteration alone exceeds the block gas limit — most critically for external pauses, where it would revert every operation and permanently brick the token. A new `MAX_EXTERNAL_LIST_SIZE` (= 10) is enforced at the single `addExternalList` chokepoint through which all add paths flow, reverting with the shared `ICommonErrors.MaxExternalListSizeReached`; re-adding an existing member is unaffected.
