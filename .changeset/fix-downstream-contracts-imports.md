---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix downstream project compatibility for contracts package:

- Convert 454 bare `contracts/` prefix imports to relative imports across 250 Solidity files; relative imports work universally across Hardhat, Foundry, and downstream consumers
- Reorganize test utilities into dedicated files (`helpers/assertions.ts`, `fixtures/hardhatHelpers.ts`) and expose via new `./test/fixtures` export entry point for downstream test reuse
- Add `isDeployable` field to `ContractMetadata` in registry generator to correctly distinguish deployable contracts from interfaces/libraries; only deployable mocks generate TypeChain factory references
- Include test helpers and fixtures in published package build output (`tsconfig.build.json`)
- Re-enable `use-natspec` solhint rule
