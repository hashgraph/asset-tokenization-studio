# TRexIAccessControl

## Methods

### applyRoles

```solidity
function applyRoles(bytes32[] _roles, bool[] _actives, address _account) external nonpayable returns (bool success_)
```

_Apply roles to an account_

#### Parameters

| Name      | Type      | Description                                                 |
| --------- | --------- | ----------------------------------------------------------- |
| \_roles   | bytes32[] | The role id array                                           |
| \_actives | bool[]    | By each role, true if the role is granted, false if revoked |
| \_account | address   | The account address                                         |

#### Returns

| Name      | Type | Description   |
| --------- | ---- | ------------- |
| success\_ | bool | true or false |

### getRoleCountFor

```solidity
function getRoleCountFor(address _account) external view returns (uint256 roleCount_)
```

_Returns the number of roles the account currently has_

#### Parameters

| Name      | Type    | Description         |
| --------- | ------- | ------------------- |
| \_account | address | The account address |

#### Returns

| Name        | Type    | Description         |
| ----------- | ------- | ------------------- |
| roleCount\_ | uint256 | The number of roles |

### getRoleMemberCount

```solidity
function getRoleMemberCount(bytes32 _role) external view returns (uint256 memberCount_)
```

_Returns the number of members the role currently has_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| \_role | bytes32 | The role id |

#### Returns

| Name          | Type    | Description           |
| ------------- | ------- | --------------------- |
| memberCount\_ | uint256 | The number of members |

### getRoleMembers

```solidity
function getRoleMembers(bytes32 _role, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

_Returns an array of members the role currently has_

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_role       | bytes32 | The role id                                   |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name      | Type      | Description                                |
| --------- | --------- | ------------------------------------------ |
| members\_ | address[] | The array containing the members addresses |

### getRolesFor

```solidity
function getRolesFor(address _account, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] roles_)
```

_Returns an array of roles the account currently has_

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_account    | address | The account address                           |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name    | Type      | Description                    |
| ------- | --------- | ------------------------------ |
| roles\_ | bytes32[] | The array containing the roles |

### grantRole

```solidity
function grantRole(bytes32 _role, address _account) external nonpayable returns (bool success_)
```

_Grants a role_

#### Parameters

| Name      | Type    | Description         |
| --------- | ------- | ------------------- |
| \_role    | bytes32 | The role id         |
| \_account | address | The account address |

#### Returns

| Name      | Type | Description   |
| --------- | ---- | ------------- |
| success\_ | bool | true or false |

### hasRole

```solidity
function hasRole(bytes32 _role, address _account) external view returns (bool)
```

_Checks if an account has a role_

#### Parameters

| Name      | Type    | Description         |
| --------- | ------- | ------------------- |
| \_role    | bytes32 | The role id         |
| \_account | address | the account address |

#### Returns

| Name | Type | Description        |
| ---- | ---- | ------------------ |
| \_0  | bool | bool true or false |

### renounceRole

```solidity
function renounceRole(bytes32 _role) external nonpayable returns (bool success_)
```

_Renounces a role_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| \_role | bytes32 | The role id |

#### Returns

| Name      | Type | Description   |
| --------- | ---- | ------------- |
| success\_ | bool | true or false |

### revokeRole

```solidity
function revokeRole(bytes32 _role, address _account) external nonpayable returns (bool success_)
```

_Revokes a role_

#### Parameters

| Name      | Type    | Description         |
| --------- | ------- | ------------------- |
| \_role    | bytes32 | The role id         |
| \_account | address | The account address |

#### Returns

| Name      | Type | Description   |
| --------- | ---- | ------------- |
| success\_ | bool | true or false |

## Events

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
```

_Emitted when a default admin role is replaced_

#### Parameters

| Name                        | Type    | Description                                    |
| --------------------------- | ------- | ---------------------------------------------- |
| role `indexed`              | bytes32 | The role that replace its administrative role. |
| previousAdminRole `indexed` | bytes32 | The legacy administrative role.                |
| newAdminRole `indexed`      | bytes32 | The new administrative role.                   |

### RoleGranted

```solidity
event RoleGranted(address indexed operator, address indexed account, bytes32 indexed role)
```

_Emitted when a role is granted to an account_

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| operator `indexed` | address | The caller of the function that emitted the event |
| account `indexed`  | address | The account for which the role is to be granted   |
| role `indexed`     | bytes32 | The role to be granted                            |

### RoleRenounced

```solidity
event RoleRenounced(address indexed account, bytes32 indexed role)
```

_Emitted when a role is renounced by an account_

#### Parameters

| Name              | Type    | Description                           |
| ----------------- | ------- | ------------------------------------- |
| account `indexed` | address | The account that renouced to the role |
| role `indexed`    | bytes32 | The role that was renounced           |

### RoleRevoked

```solidity
event RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role)
```

_Emitted when a role is revoked from an account_

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| operator `indexed` | address | The caller of the function that emitted the event |
| account `indexed`  | address | The account for which the role is to be revoked   |
| role `indexed`     | bytes32 | The role to be revoked                            |

### RolesApplied

```solidity
event RolesApplied(bytes32[] roles, bool[] actives, address account)
```

_Emitted when a set of roles are applied to an account_

#### Parameters

| Name    | Type      | Description                                                 |
| ------- | --------- | ----------------------------------------------------------- |
| roles   | bytes32[] | The roles that was applied                                  |
| actives | bool[]    | By each role, true if the role is granted, false if revoked |
| account | address   | The account that renouced to the role                       |

## Errors

### AccountAssignedToRole

```solidity
error AccountAssignedToRole(bytes32 role, address account)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| role    | bytes32 | undefined   |
| account | address | undefined   |

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

_Emitted when the provided account is not granted the role_

#### Parameters

| Name    | Type    | Description                                                     |
| ------- | ------- | --------------------------------------------------------------- |
| account | address | The account for which the role is checked for granted           |
| role    | bytes32 | The role that is checked to see if the account has been granted |

### AccountHasNoRoles

```solidity
error AccountHasNoRoles(address account, bytes32[] roles)
```

_Emitted when the provided account is not granted any of the roles_

#### Parameters

| Name    | Type      | Description                                                       |
| ------- | --------- | ----------------------------------------------------------------- |
| account | address   | The account for which the role is checked for granted             |
| roles   | bytes32[] | The roles that are checked to see if the account has been granted |

### AccountNotAssignedToRole

```solidity
error AccountNotAssignedToRole(bytes32 role, address account)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| role    | bytes32 | undefined   |
| account | address | undefined   |

### ContradictoryValuesInArray

```solidity
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex)
```

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| lowerIndex | uint256 | undefined   |
| upperIndex | uint256 | undefined   |

### RolesAndActivesLengthMismatch

```solidity
error RolesAndActivesLengthMismatch(uint256 rolesLength, uint256 activesLength)
```

_Emitted when the roles length and actives length are not the same_

#### Parameters

| Name          | Type    | Description                 |
| ------------- | ------- | --------------------------- |
| rolesLength   | uint256 | The length of roles array   |
| activesLength | uint256 | The length of actives array |

### RolesNotApplied

```solidity
error RolesNotApplied(bytes32[] roles, bool[] actives, address account)
```

#### Parameters

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| roles   | bytes32[] | undefined   |
| actives | bool[]    | undefined   |
| account | address   | undefined   |
