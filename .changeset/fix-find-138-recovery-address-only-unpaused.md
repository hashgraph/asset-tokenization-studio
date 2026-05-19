---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-138: prevent wallet recovery while the token is paused.

Added the `onlyUnpaused` modifier to `Recovery.recoveryAddress`. Without it, an agent could trigger a wallet recovery — migrating token balances and marking the old wallet as permanently decommissioned — even when the contract is paused. Since a pause is intended to halt all state-mutating operations during emergencies or maintenance windows, allowing recovery to proceed in that state could result in balance migrations that cannot be undone once the pause is lifted.
