---
"@hashgraph/asset-tokenization-contracts": patch
---

Shard contracts solidity-coverage across parallel CI runners (one shared mega-asset deploy per shard plus a weight-balanced split of the standalone suites) and merge the per-shard lcov reports into a single Codecov upload matching the local single-run report. Test/CI only — no contract behaviour change; also fixes a test-isolation leak in the registry unit suite by adding a `resetOrchestratorLibraryAddresses()` helper that clears the shared orchestrator-library singleton between runs.
