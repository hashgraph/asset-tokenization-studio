---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-135: wrap revocation registry call in `try/catch` in `KycStorageWrapper.getKycStatusFor`.

The external call to `IRevocationList.revoked()` was made without error handling. If the revocation registry contract reverted for any reason (bug, upgrade, misconfiguration), every KYC status check for accounts with internal KYC would revert as well, blocking all KYC-dependent operations such as transfers.

The call is now wrapped in a `try/catch`. If the registry reverts, the catch block treats the credential as not revoked and allows execution to continue — a deliberate fail-open policy that preserves availability when the registry is unreachable.
