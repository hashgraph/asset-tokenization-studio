---
"@hashgraph/asset-tokenization-contracts": patch
---

test: migrate all IAsset integration suites onto one reconfigurable shared fixture (deployAssetMockCtx), eliminating the redundant per-file token deploys (BBND-1876). Test-only — no contract behaviour change; test run ~5 min → ~1 min and the coverage run roughly halved.
