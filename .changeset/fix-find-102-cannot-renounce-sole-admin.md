---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-102: prevent the sole `DEFAULT_ADMIN_ROLE` holder from renouncing, which would permanently lock all admin-gated functions.

`renounceRole` now calls `checkNotSoleAdmin` before revoking: if the role being renounced is `DEFAULT_ADMIN_ROLE` and the caller is the only remaining member, the transaction reverts with the new `CannotRenounceSoleAdmin` error. Renouncing is still allowed when at least one other admin exists.
