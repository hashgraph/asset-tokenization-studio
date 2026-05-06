---
"@hashgraph/asset-tokenization-contracts": minor
---

# PartitionsFacet split

Extract `partitionsOf` and `isMultiPartition` from `ERC1410ReadFacet` into a dedicated
`PartitionsFacet` registered under `_PARTITIONS_RESOLVER_KEY`.

## Changes

- Added `contracts/facets/partitions/IPartitions.sol`, `Partitions.sol`, `PartitionsFacet.sol`.
- Added `_PARTITIONS_RESOLVER_KEY` constant in `resolverKeys.sol`.
- Removed `partitionsOf` and `isMultiPartition` from `IERC1410Read.sol`, `ERC1410Read.sol`, and
  `ERC1410ReadFacet.sol` (4 → 2 selectors).
- `IAsset` now also inherits `IPartitions`.
- Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate,
  bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to
  register `PartitionsFacet` alongside the ERC1410 facets.

## Non-breaking

The 4-byte selectors of `partitionsOf` (`0x740ab8f4`) and `isMultiPartition` (`0xbd09cc54`) are
unchanged. Calls through `IAsset` continue to work without modification.
