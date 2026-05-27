---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-016: allow `removeExternalPause` to execute when the token is only externally paused.

`removeExternalPause` was guarded by `onlyUnpaused`, which checks both the internal pause flag
and every registered `IExternalPause` contract. If an external pause contract reported `true`
permanently (e.g. due to a bug or compromise), the manager could never remove it — the guard
itself blocked the only escape route, creating an irreversible deadlock.

A new `checkNotInternallyPaused` function in `PauseStorageWrapper` and the corresponding
`onlyNotInternallyPaused` modifier in `PauseModifiers` check only the internal `paused` flag.
`removeExternalPause` now uses this narrower guard: the manager can remove a stuck external pause
contract as long as the token has not been explicitly paused via the internal flag.
`addExternalPause` and `updateExternalPauses` retain the full `onlyUnpaused` guard unchanged.
