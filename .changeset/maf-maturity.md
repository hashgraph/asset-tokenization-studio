---
"@hashgraph/asset-tokenization-contracts": minor
---

# Maturity split

Extract `fullRedeemAtMaturity` and `updateMaturityDate` from `BondFacet` into a dedicated
`MaturityFacet` registered under `_MATURITY_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/maturity/IMaturity.sol`, `Maturity.sol`, `MaturityFacet.sol`.
- Added `_MATURITY_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `fullRedeemAtMaturity` and `updateMaturityDate` from `Bond.sol` and
  `IBondManagement.sol`; `Bond.sol` retains `redeemAtMaturityByPartition` (1 selector).
- `IAsset` now inherits `IMaturity`.
- Updated `scripts/domain/bond/createConfiguration.ts` and the three rate-variant bond
  `createConfiguration.ts` scripts to register `MaturityFacet`.
- Updated `BondUSAFacetBase.sol`: removed maturity selectors (4 → 2 selectors).
- Added `test/contracts/integration/maturity/maturity.test.ts` covering
  `fullRedeemAtMaturity` (8 negative + 2 happy-path + 1 edge) and
  `updateMaturityDate` (3 negative + 1 happy-path).
- Moved `fullRedeemAtMaturity` tests from `bond.test.ts` to `maturity.test.ts`.
- Moved `updateMaturityDate` tests from `coupon.test.ts` to `maturity.test.ts`.

## Non-breaking

The 4-byte selectors of all functions are unchanged. Any call through `IAsset` continues to
work without modification.
