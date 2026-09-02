---
"@hashgraph/asset-tokenization-contracts": patch
---

Validate an external KYC list at registration time. `addExternalKycList`,
`updateExternalKycLists` and `initializeExternalKycLists` accepted any non-zero address, and a
wrong one made every subsequent transfer revert inside `isExternallyGranted`, for every holder,
with an error naming neither the list nor the cause. The candidate is now staticcalled once and
rejected with `NotAnExternalKycList` if it cannot answer `getKycStatus`. Removal and deactivation
are deliberately left unguarded, because they are the recovery path.
