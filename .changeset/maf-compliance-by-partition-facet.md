---
"@hashgraph/asset-tokenization-contracts": minor
---

# ComplianceByPartitionFacet split

Extract `canTransferByPartition` and `canRedeemByPartition` from `ERC1410ReadFacet` into a dedicated `ComplianceByPartitionFacet` registered under `_COMPLIANCE_BY_PARTITION_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/complianceByPartition/IComplianceByPartition.sol`, `ComplianceByPartition.sol`, `ComplianceByPartitionFacet.sol`.
- Added `_COMPLIANCE_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `canTransferByPartition` and `canRedeemByPartition` from `ERC1410Read.sol`, `ERC1410ReadFacet.sol`, and `IERC1410Read.sol` (6 → 4 selectors).
- `IAsset` now also inherits `IComplianceByPartition`.
- Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to register `ComplianceByPartitionFacet` alongside `ComplianceFacet`.

## Non-breaking

The 4-byte selectors of both functions are unchanged (`0xa7b518b1` for `canTransferByPartition`, `0x7b7322c4` for `canRedeemByPartition`). Any call to `asset.canTransferByPartition(...)` or `asset.canRedeemByPartition(...)` through `IAsset` continues to work without modification.
