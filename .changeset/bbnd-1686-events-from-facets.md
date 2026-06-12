---
"@hashgraph/asset-tokenization-contracts": patch
---

POST-MAF review: emit business events from the facet that exposes the operation rather than from the `*StorageWrapper`, with wrappers returning any generated id the facet needs to build the event. Covers the Loan, Controller, ProtectedPartitions, Operator(ByPartition), Kpis, Dividend, Voting, LoansPortfolio, Amortization, Compliance, Identity and CapByPartition events; emits reached from multiple callers, from the orchestrator, or that mirror synthetic ledger `Transfer` events stay in the domain layer by design. Also drops the leading underscore from the standard events' parameter names to match the OpenZeppelin convention. ABI-safe: emit location does not change the emitter address (wrappers are inlined libraries) and event topic hashes depend on the name and parameter types, never parameter names.
