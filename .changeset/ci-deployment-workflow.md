---
"@hashgraph/asset-tokenization-contracts": patch
---

Add CI deployment testing workflow and multiple deployment improvements

- Add GitHub Actions workflow for automated deployment testing against Hiero Solo network
- Extract shared build job to eliminate duplication across deployment workflows
- Migrate deployment workflow to Hiero Solo with standardized naming convention
- Fix facet registration performance: replace 195 parallel RPC calls with synchronous registry lookups
- Fix ethers v5 to v6 API compatibility in diamondCutManager test (keccak256, contract address accessor)
- Add timing output to registry generation task
