---
"@hashgraph/asset-tokenization-contracts": patch
---

POST-MAF review: emit events from facets instead of storage wrappers, and drop the leading underscore from event parameter names.

**Emit events from the facet, not the `*StorageWrapper`**
Business events are now emitted in the facet that exposes the operation. The wrapper performs the state mutation and, where an emit needs a generated value (e.g. a corporate-action or hold id), returns it so the facet can build the event. Moved emits:

- `Loan` — `LoanDetailsSet`
- `Controller` — `FinalizedControllerFeature`
- `ProtectedPartitions` — `PartitionsProtected`, `PartitionsUnProtected`
- `Operator` — `AuthorizedOperator`, `RevokedOperator`
- `OperatorByPartition` — `AuthorizedOperatorByPartition`, `RevokedOperatorByPartition`
- `Kpis` — `KpiDataAdded` (three wrapper emits collapsed into a single facet emit)
- `Dividend` — `DividendSet`, `DividendCancelled`
- `Voting` — `VotingSet`, `VotingCancelled`
- `LoansPortfolio` — `HoldingsAssetAdded`, `HoldingsAssetRemoved`, `LoanHoldingsAssetUpdated`, `LoansPortfolioWithdrawn`
- `Amortization` — `AmortizationSet`, `AmortizationCancelled`, `AmortizationHoldSet`, `AmortizationHoldReleased`
- `Compliance` — `ComplianceAdded`
- `Identity` — `IdentityRegistryAdded`
- `CapByPartition` — `MaxSupplyByPartitionSet`

Emits that are reached from several callers, from the orchestrator (`*Ops`), are conditional on internal state, or are synthetic ledger events (`Transfer` / `TransferByPartition` to/from `address(0)` mirroring holds and locks) remain in the domain layer by design.

**No underscore in event parameter names**
Removed the leading `_` from event parameters in their declarations and `@param` tags: `Issued`, `Redeemed`, `TransferByPartition`, `ControllerTransfer`, `ControllerRedemption`, `AgentAdded`, `AgentRemoved`, `RecoverySuccess`, and `DiamondBatchConfigurationCreated`. This matches the OpenZeppelin convention for standard events. Function parameters keep the project convention (`_input` / `output_`).

This change is ABI-safe: emit location does not affect the emitter address (wrappers are inlined `internal` libraries, so the diamond emits either way), and the event topic hash depends on the event name and parameter types, never on parameter names.
