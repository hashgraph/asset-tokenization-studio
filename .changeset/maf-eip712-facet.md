---
"@hashgraph/asset-tokenization-contracts": minor
---

# EIP712Facet split

Extract `DOMAIN_SEPARATOR` from `ERC20PermitFacet` into a dedicated `EIP712Facet`
registered under `_EIP712_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/eip712/IEIP712.sol`, `EIP712.sol`, `EIP712Facet.sol`.
- Added `_EIP712_RESOLVER_KEY` to `resolverKeys.sol`.
- Removed `DOMAIN_SEPARATOR` from `IERC20Permit.sol`, `ERC20Permit.sol`; updated
  `ERC20PermitFacet.sol` to 1 selector with pre-decrement pattern.
- `IAsset` now inherits `IEIP712`.
- Updated `Configuration.ts` and 7 `createConfiguration.ts` scripts to register `EIP712Facet`.
- Added `test/contracts/integration/eip712/eip712.test.ts`.

## Non-breaking

The 4-byte selector of `DOMAIN_SEPARATOR` is unchanged. Any call through `IAsset`
continues to work without modification.
