---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: add `onlyActivated` guard to all role-mutating functions in `AccessControl`.

`grantRole`, `revokeRole`, `renounceRole`, and `applyRoles` lacked the `onlyActivated` modifier, meaning that after a token was deactivated it was still possible to modify role assignments. A deactivated token should be immutable in all respects — including its access-control configuration.

The fix adds `onlyActivated` as the first modifier on each of those four functions, ensuring any role mutation attempt on a deactivated token reverts with `Deactivated`.
