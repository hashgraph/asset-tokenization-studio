---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-025: remove `onlyClearingActivated` guard from clearing resolution functions.

`approveClearingOperation`, `cancelClearingByValidator`, and `executeClearingOperation` all carried the `onlyClearingActivated` modifier. This meant that once clearing was disabled by an admin, any already-submitted clearing operations became permanently unresolvable — tokens locked in the clearing process could never be released or returned, regardless of the operation's state or expiry.

The fix removes `onlyClearingActivated` from those three functions. Whether clearing is currently enabled is a gate for _creating_ new operations, not for _resolving_ ones already in flight.
