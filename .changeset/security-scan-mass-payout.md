---
"@hashgraph/mass-payout-contracts": patch
"@hashgraph/mass-payout-sdk": patch
"@hashgraph/mass-payout-backend": patch
"@hashgraph/mass-payout-frontend": patch
---

Security scan fixes. `LifeCycleCashFlow` is initialized in its proxy deployment transaction, its implementation can no longer be initialized, and initial role grants emit `RoleGranted`. Percentage snapshot payouts use the pool captured on the first paid batch, so holders in later batches are no longer underpaid. `executePercentageSnapshotByAddresses` rejects percentages above 100%. A zero snapshot amount no longer marks a holder as paid. The SDK no longer logs DFNS credentials, RPC API keys or full mirror node URLs. The backend validates the listener configuration and restricts mirror node hosts, caps page size and metadata lookups, returns generic error messages, writes an audit log line for every state-changing request, and documents that it has no built-in authentication and must run behind the adopter's gateway. The local docker-compose database reads its credentials from `.env`.
