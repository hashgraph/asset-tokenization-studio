---
"@hashgraph/asset-tokenization-contracts": minor
---

Add DepositToken as a new asset type.

A deposit token is a minimal cash-style tokenised claim (no yield, coupon, maturity
or interest rate).

- New `DEPOSIT_TOKEN_CONFIG_ID` configuration registered in the BusinessLogicResolver,
  with a deposit-token-specific facet list (`createDepositTokenConfiguration`).
- New `DepositToken` value in `IFactory.SecurityType` and `DepositTokenData` struct.
- New `Factory.deployDepositToken(DepositTokenData, FactoryRegulationData)` entry point
  (registered in `FactoryFacet`/`MockFactoryFacet` static selectors) plus a dedicated
  `_deployDepositTokenSecurity` that initialises only the deposit-token facets, so the
  asset deliberately excludes Compliance, KYC, External KYC, External Pause, Protected
  Partitions, Identity & Claims, Snapshots, Lock and the other capabilities marked FALSE.
- New `deployDepositTokenFromFactory` TypeScript wrapper and deploy-workflow wiring.
