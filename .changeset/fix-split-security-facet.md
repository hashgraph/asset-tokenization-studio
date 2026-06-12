---
"@hashgraph/asset-tokenization-contracts": patch
---

Extract `SecurityFacet` as an independent Diamond facet and fix `InterestRate`/`Kyc` initialisation guards. `BondUSA`, `EquityUSA`, `Loan` and `LoansPortfolio` previously called `SecurityStorageWrapper.initializeSecurity` directly, violating the MAF rule that each storage wrapper has exactly one owner facet; a new `SecurityFacet` becomes the sole owner, with the security init removed from the four asset initialisers and `Factory.sol` calling a `_tryInitializeSecurity` helper. `InterestRateStorageWrapper` also gains an `_initialized` flag so `initializeInterestRate` is idempotent, and the `InterestRate`/`Kyc` modifiers use the new guard.
