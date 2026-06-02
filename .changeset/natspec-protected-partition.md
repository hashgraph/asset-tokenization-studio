---
"@hashgraph/asset-tokenization-contracts": patch
---

Relocate `ProtectedPartitions` facet out of `layer_1/` nesting into `facets/protectedPartition/` as part of the POST-MAF layer-flattening effort, and add missing NatSpec documentation to all three files.

What changes:

- `facets/layer_1/protectedPartition/` moved to `facets/protectedPartition/`. Directory name follows the existing lowercase-camelCase convention.
- Import paths updated in all callers: `ProtectedPartitionsStorageWrapper.sol`, `IProtectedByPartition.sol`, `ProtectedByPartition.sol`, `ProtectedPartitionsFacetTimeTravel.sol`.
- `IProtectedPartitions`: document `ProtectionData` struct fields, all events (`PartitionsProtected`, `PartitionsUnProtected`, `ProtectedTransferFrom`, `ProtectedRedeemFrom`), all errors (`PartitionsAreProtectedAndNoRole`, `PartitionsAreUnProtected`, `PartitionsAreProtected`), and `initializeProtectedPartitions`.
- `ProtectedPartitions`: add contract-level `@title`/`@author`/`@notice`/`@dev` block.
- `ProtectedPartitionsFacet`: add contract-level NatSpec and `@inheritdoc` tags on all three `IStaticFunctionSelectors` overrides.

No ABI, selector, or storage layout changes.
