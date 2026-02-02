---
"@hashgraph/asset-tokenization-contracts": patch
---

Refactor integration test helpers to reduce boilerplate and eliminate magic numbers:

- Add centralized test constants (TEST_DELAYS, TEST_OPTIONS.CONFIRMATIONS_INSTANT, EIP1967_SLOTS, TEST_GAS_LIMITS, TEST_INIT_VALUES)
- Create reusable test helpers (silenceScriptLogging, createCheckpointCleanupHooks)
- Standardize import organization across all integration tests
- Reclassify atsRegistry.data.test.ts from integration to unit directory
- Reduce test code duplication (~100 lines eliminated)
