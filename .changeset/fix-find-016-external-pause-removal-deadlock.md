---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-016: allow `removeExternalPause` to execute when the token is only externally paused. It was guarded by `onlyUnpaused`, which checks every registered `IExternalPause` contract too, so a contract stuck reporting `true` (bug or compromise) made removal impossible — the guard blocked the only escape route. A new `onlyNotInternallyPaused` modifier (backed by `checkNotInternallyPaused`) checks only the internal `paused` flag, and `removeExternalPause` now uses it; `addExternalPause`/`updateExternalPauses` keep the full `onlyUnpaused` guard.
