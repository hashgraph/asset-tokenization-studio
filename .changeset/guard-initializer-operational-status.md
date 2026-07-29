---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix `setOperationalStatus` incorrectly marking a configuration version as fully operational when `initializeInitializer` had never been called (`maxInitializerFacetIndex == 0`). The function now guards against this case and preserves the "not started" (`0`) encoding instead of colliding with the "fully operational" (`1`) sentinel, so `onlyOperational` checks can no longer be bypassed.
