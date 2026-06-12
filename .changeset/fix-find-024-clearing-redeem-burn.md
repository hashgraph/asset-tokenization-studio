---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix FIND-024: finalise the burn on clearing-redeem approval, which previously left orphaned tokens inflating `totalSupply`. `clearingRedeemCreation` debited the holder and partition balances, but the approval path never credited `address(0)` and so never decremented `totalSupply`/`totalSupplyByPartition` — leaving supply inflated and skewing every ownership-ratio calculation (dividends, coupons, voting). The approval branch now mirrors `redeemByPartition`: it snapshots the partition supply, calls `reduceTotalSupplyByPartition`, invokes `ICompliance.destroyed`, and emits `RedeemedByPartition`. The cancel/reclaim branch is unchanged.
