---
"@hashgraph/asset-tokenization-contracts": patch
---

Raise `GAS_LIMIT` ceiling and defaults in deployment constants to prevent out-of-gas failures on Hedera. `max` increased from 15 M to 30 M, `default` from 3 M to 5 M, `high` from 10 M to 20 M. Initialisation limits also updated: `initialize.businessLogicResolver` from 8 M to 15 M, `proxyAdmin.registerBusinessLogics` from 7.8 M to 10 M, and `proxyAdmin.createConfiguration` from 15 M to 20 M. These values only affect deployment scripts and have no impact on on-chain contract behaviour or the public ABI.
