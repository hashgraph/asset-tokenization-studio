---
"@hashgraph/asset-tokenization-contracts": minor
---

# IdentityFacet split

Extract `setIdentityRegistry`, `setOnchainID`, `identityRegistry`, and `onchainID` from
`ERC3643ManagementFacet` and `ERC3643ReadFacet` into a dedicated `IdentityFacet` registered
under `_IDENTITY_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/identity/IIdentity.sol`, `Identity.sol`, `IdentityFacet.sol`.
- Added `_IDENTITY_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `setIdentityRegistry`, `setOnchainID` from `IERC3643Management.sol`,
  `ERC3643Management.sol`, and `ERC3643ManagementFacet.sol` (4 → 2 selectors).
- Removed `identityRegistry`, `onchainID` from `IERC3643Read.sol`, `ERC3643Read.sol`, and
  `ERC3643ReadFacet.sol` (3 → 1 selectors).
- `IAsset` now also inherits `IIdentity`.
- Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate,
  bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to
  register `IdentityFacet` alongside the ERC3643 facets.

## Non-breaking

The 4-byte selectors of `setIdentityRegistry` (`0xcbf3f861`), `setOnchainID` (`0x3d1ddc5b`),
`identityRegistry` (`0x134e18f4`), and `onchainID` (`0xaba63705`) are unchanged. Calls through
`IAsset` continue to work without modification.
