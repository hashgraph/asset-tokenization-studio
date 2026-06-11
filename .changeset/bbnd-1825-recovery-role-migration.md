---
"@hashgraph/asset-tokenization-contracts": patch
---

Wallet recovery now migrates role memberships from the lost wallet to the new wallet and blocks recovered addresses from passing any role check, so a compromised role-bearing wallet retains no privileges after recovery (BBND-1825).
