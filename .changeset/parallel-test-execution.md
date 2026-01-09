---
"@hashgraph/asset-tokenization-contracts": patch
---

Enable parallel test execution with tsx loader for 60-75% faster test runs

- Add tsx (v4.21.0) for runtime TypeScript support in Mocha worker threads
- Configure parallel test scripts with NODE_OPTIONS='--import tsx'
- Fix circular dependency in checkpoint module imports
- Fix DiamondCutManager test assertions to use TypeChain factories
- Separate contract and script tests with dedicated parallel targets
