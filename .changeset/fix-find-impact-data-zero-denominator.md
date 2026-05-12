---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: reject impact data where baseLine equals maxDeviationFloor or maxDeviationCap.

`requireValidImpactData` used strict greater-than comparisons (`>`), allowing `baseLine == maxDeviationFloor` and `baseLine == maxDeviationCap` as valid inputs. Either equality produces a zero denominator in `_calculateKpiLinkedInterestRate`, which reverts on every subsequent token operation and permanently freezes the protocol.

The fix tightens both comparisons to `>=`, enforcing `maxDeviationFloor < baseLine < maxDeviationCap` as a strict invariant.
