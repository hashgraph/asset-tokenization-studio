---
"@hashgraph/asset-tokenization-contracts": patch
---

Add CI deployment testing workflow and harden CI pipeline

- Add GitHub Actions workflow for automated deployment testing (Hardhat + Hiero Solo)
- Extract shared build job with dependency/artifact caching to eliminate duplication
- Migrate deployment workflow to Hiero Solo with standardized naming convention
- Upgrade actions/checkout v4.2.2 → v5.0.0 across all workflows
- Pin actions/cache to v4.2.3 with SHA, add timeout-minutes and concurrency controls
- Add defaults.run.shell: bash and codecov version annotation
- Fix facet registration: replace 195 parallel RPC calls with synchronous registry lookups
- Wrap signer with NonceManager to prevent nonce caching issues during deployment
- Fix ethers v6 API in diamondCutManager test (keccak256, contract address accessor)
- Add selector conflict validation test (SelectorAlreadyRegistered error)
- Add timing output and type-safe error handling to registry generation task
