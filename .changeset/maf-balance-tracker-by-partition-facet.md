---
"@hashgraph/asset-tokenization-contracts": major
---

Introduce `BalanceTrackerByPartitionFacet` with three partition-scoped read functions — `balanceOfByPartition` and `totalSupplyByPartition` (moved from `ERC1410ReadFacet`) and `getTotalBalanceForByPartition` (moved from the now-removed `TotalBalanceFacet`).

Breaking: `IERC1410Read` no longer declares `balanceOfByPartition`/`totalSupplyByPartition` — they move to `IBalanceTrackerByPartition`, changing `IERC1410.interfaceId` (ERC-165); `TotalBalanceFacet` and `ITotalBalance` are deleted, so use `BalanceTrackerByPartitionFacet` instead.
