---
"@hashgraph/asset-tokenization-contracts": major
---

feat: split BurnByPartitionFacet from ERC1410TokenHolderFacet

Move redeemByPartition into a dedicated BurnByPartitionFacet. ERC1410TokenHolderFacet retains the six remaining operations. Removing redeemByPartition from IERC1410TokenHolder changes its ERC-165 interfaceId.
