---
"@hashgraph/asset-tokenization-contracts": minor
---

Extends the `CustomData` facet with seed entries on init and a batch setter.

- `initializeCustomData(CustomDataEntry[] entries)` — accepts an optional list of key/value pairs to seed atomically at deployment; empty array preserves existing behaviour.
- `setCustomDataBatch(CustomDataEntry[] entries)` — new runtime setter that writes multiple entries in a single call; requires `ROLE_CUSTOM_DATA_MANAGER` and emits one `CustomDataBatchSet` event per invocation.
- Fix: `setCustomData` was not emitting any event; now emits `CustomDataSet` on every write.
- `CustomDataStorageWrapper` gains an internal `setCustomDataBatch` helper with no events and no access control; used by both init and batch paths.
