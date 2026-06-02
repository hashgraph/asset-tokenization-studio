---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `lockByPartition` and `transferAndLock` no longer return a misleading `bool success_` value.

Previously, both functions declared a `bool success_` return that was always `true` — the underlying implementation either succeeds or reverts, so `false` can never be returned. This constituted dead code that misled integrators into writing defensive `require(success_, "Lock failed")` checks that are never triggered, wasted gas on unnecessary branching, and increased audit surface area without adding any functional value.

The fix removes the `success_` return value from `lockByPartition` and `transferAndLock`, aligning the interface with the actual revert-on-failure behaviour of the internal implementation.
