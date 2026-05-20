---
"@hashgraph/asset-tokenization-contracts": patch
---

Extract `SecurityFacet` as an independent Diamond facet and fix `InterestRate`/`Kyc` initialisation guards.

**Security split (MAF fix):** `BondUSA`, `EquityUSA`, `Loan`, and `LoansPortfolio` were calling `SecurityStorageWrapper.initializeSecurity` directly inside their own initialisers, violating the Modular Asset Factory principle that each `StorageWrapper` must be owned by exactly one facet. A new `SecurityFacet` is introduced as the sole owner of `SecurityStorageWrapper` operations. The security initialisation call is removed from all four asset initialisers and from `Factory.sol`, which now uses a `_tryInitializeSecurity` helper following the existing `_tryInitialize*` pattern for optional facet init. `SecurityModifiers.sol` is added as the service layer for security-scoped modifiers. Resolver key `SECURITY_RESOLVER_KEY` is registered in `resolverKeys.sol`. All `createConfiguration.ts` files for bond, bondFixedRate, bondKpiLinkedRate, equity, loan, and loanPortfolio are updated to include `SecurityFacet` in the facet list.

**Initialisation flag fix:** `InterestRateStorageWrapper` gained an `_initialized` flag (matching the pattern used by other storage wrappers) so that `InterestRate.initializeInterestRate` is idempotent. `InterestRateModifiers` and `KycModifiers` are updated to use the new guard; `Kyc.sol` and `InterestRate.sol` are updated accordingly.
