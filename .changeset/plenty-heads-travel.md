---
"@hashgraph/asset-tokenization-contracts": major
---

BLR bugs fixed. `getVersionStatus` and `getLatestVersion` method signatures updated; new batched `getLatestVersions(bytes32[])` view added so deploy scripts can avoid the JSON-RPC relay per-IP `eth_call` rate limit.
