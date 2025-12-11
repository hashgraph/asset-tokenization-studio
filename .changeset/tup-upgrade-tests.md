---
"@hashgraph/asset-tokenization-contracts": patch
---

test(contracts): add comprehensive unit and integration tests for TUP upgrade operations

Add 34 tests for TransparentUpgradeableProxy (TUP) upgrade operations:

- 13 unit tests covering parameter validation, behavior detection, result structure, and helper functions
- 21 integration tests covering upgrade scenarios, access control, state verification, and gas reporting
- New TUP test fixtures using composition pattern (deployTupProxyFixture, deployTupProxyWithV2Fixture)
- Mock contracts (MockImplementation, MockImplementationV2) with proper initialization guards and storage layout compatibility
