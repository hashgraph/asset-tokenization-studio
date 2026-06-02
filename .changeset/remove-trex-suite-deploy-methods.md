---
"@hashgraph/asset-tokenization-contracts": minor
"@hashgraph/asset-tokenization-sdk": minor
---

Remove the permissionless T-REX suite deployment surface from the factory and SDK.

**Contracts:**

- Removed `deployTREXSuiteAtsEquity` and `deployTREXSuiteAtsBond` from `TREXFactory`, along with the `TokenDetailsAts` struct and their associated imports.
- Deleted the now-unreachable deployment libraries: `TREXEquityDeploymentLib`, `TREXBondDeploymentLib`, `core/TREXBaseDeploymentLib`, and `core/SecurityDeploymentLib`.
- Updated `Configuration.ts` (empty `LIBRARY_NAMES`) and the deployment task so `TREXFactoryAts` is deployed without external libraries.
- Removed the now write-only `atsFactory` storage, its `setAtsFactory` setter, and the constructor's `_atsFactory` argument, which only fed the deleted deployment libraries. The deployment task no longer derives or passes an ATS factory address.
- The factory contract itself, its remaining setters, `recoverContractOwnership`, and `getToken` are preserved.

**SDK:**

- Removed the `createTrexSuite` feature end to end: bond/equity commands, handlers, requests, the `getTokenBySalt` query, the `TRexFactory` domain context, the `InvalidTrexTokenSalt` error, and `InjectableTrexFactory`.
- Cleaned up the transaction/query adapters (HS and RPC), `TransactionAdapter`, `ValidationService` (`checkTrexTokenSaltExists`), `TransactionService`, the handlers registry, and the `TREX_CREATE_SUITE` gas constant.
