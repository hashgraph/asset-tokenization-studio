---
"@hashgraph/asset-tokenization-contracts": minor
---

Extract `fullRedeemAtMaturity` and `updateMaturityDate` from `BondFacet` into a dedicated `MaturityFacet`; `BondFacet` retains `redeemAtMaturityByPartition`.

Non-breaking: the 4-byte selectors are unchanged, so calls through `IAsset` continue to work without modification.
