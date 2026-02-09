---
"@hashgraph/asset-tokenization-contracts": patch
---

- Rename test/contracts/unit to test/contracts/integration to accurately reflect test type
- Add Mocha rootHooks and globalSetup.ts to silence script logger globally during tests
- Fix logging.test.ts and hedera.test.ts to prevent logger state leakage between suites
