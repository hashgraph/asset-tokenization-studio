---
"@hashgraph/asset-tokenization-contracts": patch
---

Recovered (lost) wallets are now rejected by the centralized access-control checks: AccessControlStorageWrapper.checkRole and checkAnyRole revert with WalletRecovered for a recovered account, so a compromised role-bearing wallet can no longer pass any role gate after recovery — including paths that call the helpers directly (onlyFreezeRoles, applyRoles) rather than through onlyRole (BBND-1825).
