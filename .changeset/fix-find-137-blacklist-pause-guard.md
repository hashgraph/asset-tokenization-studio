---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `addSelectorsToBlacklist` and `removeSelectorsFromBlacklist` now enforce the `onlyUnpaused` modifier.

Previously, both functions only checked `onlyRole(DEFAULT_ADMIN_ROLE)`, allowing an admin to modify the selector blacklist while the contract was paused. This was inconsistent with sibling functions `createConfiguration` and `registerBusinessLogics`, which already require the contract to be unpaused before executing state changes.

The fix adds `onlyUnpaused` to both functions, making pause-gating uniform across all admin write operations on `BusinessLogicResolver`.
