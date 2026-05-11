---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix audit finding 024: clearing redeem approval never finalised the burn, leaving orphaned tokens in `totalSupply`.

`clearingRedeemCreation` debits the holder balance and the partition balance at creation time, but `performTransfer(_from, address(0), _amount)` skips the credit to `address(0)` and therefore never decrements `totalSupply` / `totalSupplyByPartition`. The approval path in `clearingRedeemExecution` only ran identity/compliance checks and cleared the bookkeeping, so the burn was never finalised: the holder's balance stayed reduced, `totalSupply` stayed inflated, and the tokens became unowned. All ownership-ratio calculations (dividends, coupons, voting) were skewed by the inflated supply.

The approval branch now mirrors `redeemByPartition`'s finalisation:

- Snapshots `totalSupply` for the partition before the burn so historical queries (`totalSupplyAt`) keep returning pre-burn values.
- Calls `reduceTotalSupplyByPartition` to decrement both the partition supply and the ERC-20 `totalSupply` (the holder/partition balances were already debited at creation).
- Invokes `ICompliance.destroyed` on the default partition, matching the canonical burn flow.
- Emits `RedeemedByPartition` with the original `data` / `operatorData` so off-chain indexers see the burn.

The cancel/reclaim branch is unchanged and still restores the ABAF-adjusted amount to the holder.
