---
"@hashgraph/asset-tokenization-contracts": major
---

Introduce `ROLE_CREATE_CONFIGURATION` access control on diamond configuration mutation and ownership transfer.

**New role: `ROLE_CREATE_CONFIGURATION`**
`bytes32 constant ROLE_CREATE_CONFIGURATION = 0x185bc02f8b16b873d7c8b9a6cb21f91bb77dcec0ee1f4af6cc568f084b1da9f8`
Added to `contracts/constants/roles.sol`. The BLR deployer is granted this role automatically during `initializeBusinessLogicResolver()` in the deployment scripts.

**Breaking: `DiamondCutManager` — three functions now require `ROLE_CREATE_CONFIGURATION`**
`createConfiguration`, `createBatchConfiguration`, and `cancelBatchConfiguration` each have a new `onlyRole(ROLE_CREATE_CONFIGURATION)` modifier. Any account that previously called these functions without holding the role will now revert with `AccountHasNoRole(account, ROLE_CREATE_CONFIGURATION)`. The role must be explicitly granted via `grantRole` before calling these functions.
