---
"@hashgraph/asset-tokenization-contracts": minor
---

# OperatorByPartition split

Extract per-partition operator functions from `ERC1410TokenHolder`, `ERC1410Read`, and
`ERC1410Management` into a dedicated `OperatorByPartitionFacet` registered under
`_OPERATOR_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/operatorByPartition/IOperatorByPartition.sol`,
  `OperatorByPartition.sol`, `OperatorByPartitionFacet.sol`.
- Added `_OPERATOR_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `authorizeOperatorByPartition` and `revokeOperatorByPartition` from
  `ERC1410TokenHolder.sol` and `IERC1410TokenHolder.sol` (3 → 1 selectors).
- Removed `isOperatorForPartition` from `ERC1410Read.sol` and `IERC1410Read.sol`
  (3 → 2 selectors).
- Removed `operatorTransferByPartition` and `operatorRedeemByPartition` from
  `ERC1410Management.sol` and `IERC1410Management.sol` (5 → 3 selectors).
- `IERC1410` now inherits `IOperatorByPartition`.
- Updated `Configuration.ts` and 7 `createConfiguration.ts` scripts to register
  `OperatorByPartitionFacet`.
- Added `test/contracts/integration/operatorByPartition/operatorByPartition.test.ts`
  covering authorise, revoke, query, operator-transfer, and operator-redeem scenarios.

## Non-breaking

The 4-byte selectors of all five functions are unchanged. Any call through `IAsset` or
`IERC1410` continues to work without modification.
