---
"@hashgraph/asset-tokenization-contracts": minor
"@hashgraph/asset-tokenization-sdk": minor
---

Remove the permissionless T-REX suite deployment surface from the factory and SDK. On the contract side, `deployTREXSuiteAtsEquity`/`deployTREXSuiteAtsBond`, the `TokenDetailsAts` struct, the now-unreachable deployment libraries, and the write-only `atsFactory` storage and its setter are deleted; the factory's remaining setters, `recoverContractOwnership`, and `getToken` are preserved. On the SDK side, the `createTrexSuite` feature is removed end to end — bond/equity commands, handlers, requests, the `getTokenBySalt` query, the `TRexFactory` context, the `InvalidTrexTokenSalt` error, and the related adapter/service/gas-constant wiring.
