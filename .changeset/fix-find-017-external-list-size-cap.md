---
"@hashgraph/asset-tokenization-contracts": patch
---

The external pause, control and KYC lists are each iterated in full on the hot path of token
operations (`isExternallyPaused`, `isExternallyAuthorized`, `isExternallyGranted`). These checks
run inside the `onlyUnpaused` / compliance guards of every transfer, mint, burn, etc. Because the
lists were unbounded, they could grow large enough that the iteration alone exceeds the block/tx
gas limit — most critically for external pauses, where it would cause every operation to revert
and permanently brick the token.

A gas benchmark using the external-pause mock measured ~7,717 gas per entry for the cheapest
possible external contract (a single `SLOAD`), with real contracts costing more, so the cost
grows linearly and without bound.

A new `MAX_EXTERNAL_LIST_SIZE` constant (= 10) caps every external list. The bound is enforced at
the single chokepoint `ExternalListManagementStorageWrapper.addExternalList`, through which all add
paths flow (single add, bulk `updateExternal*`, and the three initialisers), so it applies
uniformly to pauses, control lists and KYC lists. Adding an entry that would grow a list beyond the
cap reverts with the new shared error `ICommonErrors.MaxExternalListSizeReached`. Re-adding an
existing member is unaffected. The cap comfortably exceeds any realistic number of providers.
