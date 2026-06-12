---
"@hashgraph/asset-tokenization-contracts": minor
---

Add DepositToken as a new asset type — a minimal cash-style tokenised claim with no yield, coupon, maturity or interest rate. Registers a `DEPOSIT_TOKEN_CONFIG_ID` with its own facet list, adds a `DepositToken` `SecurityType` value and `DepositTokenData` struct, and adds a `Factory.deployDepositToken` entry point with a dedicated `_deployDepositTokenSecurity` that initialises only the deposit-token facets (deliberately excluding Compliance, KYC, External KYC/Pause, Protected Partitions, Identity & Claims, Snapshots, Lock, etc.), plus the TypeScript deploy wrapper and workflow wiring.
