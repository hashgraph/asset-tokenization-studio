---
"@hashgraph/asset-tokenization-contracts": major
---

feat(ats-contracts): add BalanceTrackerByPartitionFacet and remove TotalBalanceFacet

Introduces `BalanceTrackerByPartitionFacet` with three partition-scoped read functions:

- `balanceOfByPartition` (moved from `ERC1410ReadFacet`)
- `totalSupplyByPartition` (moved from `ERC1410ReadFacet`)
- `getTotalBalanceForByPartition` (moved from `TotalBalanceFacet`, which is removed)

**Breaking changes:**

- `IERC1410Read` no longer declares `balanceOfByPartition` or `totalSupplyByPartition`; these are now on `IBalanceTrackerByPartition`. This changes `IERC1410.interfaceId` (ERC-165).
- `TotalBalanceFacet` and its interface `ITotalBalance` are deleted. Use `BalanceTrackerByPartitionFacet` instead.
- All token configurations updated to replace `TotalBalanceFacet` with `BalanceTrackerByPartitionFacet`.
