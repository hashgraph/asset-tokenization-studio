# AccessControlBase

_Asset Tokenization Studio Team_

> AccessControlBase

Shared implementation for role-mutating operations, reused by `AccessControl` and `AccessControlOperational`. Holds the single copy of each operation&#39;s storage mutation and event emission, so the two entry points differ only in the guard modifiers appropriate to how they are wired into the system.

_`AccessControl` is inherited directly by non-proxy consumers (e.g. `DiamondCutManager`), which must remain usable before any diamond configuration is operational. `AccessControlOperational` is inherited by `AccessControlFacet`, a proxy facet that additionally requires `onlyOperational`. Solidity modifiers must be declared statically on the function signature, so the guard difference cannot be parameterised at runtime — each subclass declares its own thin external function and delegates to the internal helpers here. `initializeAccessControl` needs no such split: its guards are identical for both consumers, so it is implemented once and inherited unchanged._

## Methods

### applyRoles

```solidity
function applyRoles(bytes32[] _roles, bool[] _actives, address _account) external nonpayable
```

Applies multiple role grants or revocations to an account in a single transaction.

_The caller must hold the admin role for each role in `_roles` (checked per entry in the storage layer). `_roles` and `_actives` must have equal length and contain no duplicate role entries. Grant entries where the account already holds the role and revoke entries where it does not are silently skipped. Emits `RolesApplied` with the subset that effectively changed state._

#### Parameters

| Name      | Type      | Description                                                      |
| --------- | --------- | ---------------------------------------------------------------- |
| \_roles   | bytes32[] | Array of role identifiers to process.                            |
| \_actives | bool[]    | Corresponding flags; `true` grants the role, `false` revokes it. |
| \_account | address   | The account to which roles are applied.                          |

### getRoleCountFor

```solidity
function getRoleCountFor(address _account) external view returns (uint256 roleCount_)
```

Returns the number of roles currently assigned to an account.

#### Parameters

| Name      | Type    | Description           |
| --------- | ------- | --------------------- |
| \_account | address | The account to query. |

#### Returns

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| roleCount\_ | uint256 | The number of roles held by `_account`. |

### getRoleMemberCount

```solidity
function getRoleMemberCount(bytes32 _role) external view returns (uint256 memberCount_)
```

Returns the number of accounts currently holding a role.

#### Parameters

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| \_role | bytes32 | The role identifier to query. |

#### Returns

| Name          | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| memberCount\_ | uint256 | The number of accounts assigned to `_role`. |

### getRoleMembers

```solidity
function getRoleMembers(bytes32 _role, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] members_)
```

Returns a paginated slice of accounts holding a role.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the member count for the role.\*

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_role       | bytes32 | The role identifier to query.                   |
| \_pageIndex  | uint256 | Zero-based page index.                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page. |

#### Returns

| Name      | Type      | Description                                                        |
| --------- | --------- | ------------------------------------------------------------------ |
| members\_ | address[] | Array of account addresses holding `_role` for the requested page. |

### getRolesFor

```solidity
function getRolesFor(address _account, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] roles_)
```

Returns a paginated slice of roles assigned to an account.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the role count for the account.\*

#### Parameters

| Name         | Type    | Description                                 |
| ------------ | ------- | ------------------------------------------- |
| \_account    | address | The account to query.                       |
| \_pageIndex  | uint256 | Zero-based page index.                      |
| \_pageLength | uint256 | Maximum number of roles to return per page. |

#### Returns

| Name    | Type      | Description                                                          |
| ------- | --------- | -------------------------------------------------------------------- |
| roles\_ | bytes32[] | Array of role identifiers held by `_account` for the requested page. |

### grantRole

```solidity
function grantRole(bytes32 _role, address _account) external nonpayable returns (bool success_)
```

Grants a role to an account.

_The caller must hold the admin role of `_role` (resolved dynamically via `getRoleAdmin`). Reverts with `AccountAssignedToRole` if the account already holds the role. Emits `RoleGranted`._

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_role    | bytes32 | The role identifier to grant.    |
| \_account | address | The account to receive the role. |

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the role was successfully granted. |

### hasRole

```solidity
function hasRole(bytes32 _role, address _account) external view returns (bool)
```

Checks whether an account holds a specific role.

#### Parameters

| Name      | Type    | Description                   |
| --------- | ------- | ----------------------------- |
| \_role    | bytes32 | The role identifier to check. |
| \_account | address | The account to check.         |

#### Returns

| Name | Type | Description                                        |
| ---- | ---- | -------------------------------------------------- |
| \_0  | bool | True if `_account` holds `_role`, false otherwise. |

### initializeAccessControl

```solidity
function initializeAccessControl() external nonpayable
```

Initialises the AccessControl capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### renounceRole

```solidity
function renounceRole(bytes32 _role) external nonpayable returns (bool success_)
```

Allows the caller to renounce a role held by their own account.

_Operates on `msg.sender` only; no admin role is required. Reverts with `AccountNotAssignedToRole` if the caller does not hold the role. Emits `RoleRenounced`._

#### Parameters

| Name   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
| \_role | bytes32 | The role identifier to renounce. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the role was successfully renounced. |

### revokeRole

```solidity
function revokeRole(bytes32 _role, address _account) external nonpayable returns (bool success_)
```

Revokes a role from an account.

_The caller must hold the admin role of `_role` (resolved dynamically via `getRoleAdmin`). Reverts with `AccountNotAssignedToRole` if the account does not hold the role. Emits `RoleRevoked`._

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| \_role    | bytes32 | The role identifier to revoke. |
| \_account | address | The account to lose the role.  |

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the role was successfully revoked. |

## Events

### AccessControlInitialized

```solidity
event AccessControlInitialized()
```

Emitted once when the AccessControl capability is initialised on a token.

_Fires exclusively from `initializeAccessControl` after the registration succeeds._

### EffectivelyRolesApplied

```solidity
event EffectivelyRolesApplied(bytes32[] roles, bool[] actives)
```

Emitted when one or more role changes are effectively applied.

_`roles` and `actives` are parallel arrays containing the role states that resulted in effective storage mutations._

#### Parameters

| Name    | Type      | Description                                                                   |
| ------- | --------- | ----------------------------------------------------------------------------- |
| roles   | bytes32[] | The roles whose assigned state changed.                                       |
| actives | bool[]    | The effective state applied to each role; `true` granted and `false` revoked. |

### RoleGranted

```solidity
event RoleGranted(address indexed operator, address indexed account, bytes32 indexed role)
```

Emitted when a role is granted to an account.

#### Parameters

| Name               | Type    | Description                           |
| ------------------ | ------- | ------------------------------------- |
| operator `indexed` | address | The address that performed the grant. |
| account `indexed`  | address | The account that received the role.   |
| role `indexed`     | bytes32 | The role that was granted.            |

### RoleRenounced

```solidity
event RoleRenounced(address indexed account, bytes32 indexed role)
```

Emitted when an account voluntarily renounces a role it holds.

#### Parameters

| Name              | Type    | Description                          |
| ----------------- | ------- | ------------------------------------ |
| account `indexed` | address | The account that renounced the role. |
| role `indexed`    | bytes32 | The role that was renounced.         |

### RoleRevoked

```solidity
event RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role)
```

Emitted when a role is revoked from an account.

#### Parameters

| Name               | Type    | Description                                  |
| ------------------ | ------- | -------------------------------------------- |
| operator `indexed` | address | The address that performed the revocation.   |
| account `indexed`  | address | The account from which the role was revoked. |
| role `indexed`     | bytes32 | The role that was revoked.                   |

### RolesApplied

```solidity
event RolesApplied(bytes32[] roles, bool[] actives, address account)
```

Emitted when multiple role operations are requested for an account.

_`roles` and `actives` are parallel arrays and must have the same length. Entries represent the requested role state changes, not necessarily only the effective storage mutations._

#### Parameters

| Name    | Type      | Description                                                           |
| ------- | --------- | --------------------------------------------------------------------- |
| roles   | bytes32[] | The roles processed by the batch operation.                           |
| actives | bool[]    | The requested state for each role; `true` grants and `false` revokes. |
| account | address   | The account for which the role operations are requested.              |

## Errors

### AccountAssignedToRole

```solidity
error AccountAssignedToRole(bytes32 role, address account)
```

Thrown when attempting to grant a role to an account that already holds it.

#### Parameters

| Name    | Type    | Description                               |
| ------- | ------- | ----------------------------------------- |
| role    | bytes32 | The role the account already holds.       |
| account | address | The account already assigned to the role. |

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

Thrown when an account does not hold a required role.

#### Parameters

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| account | address | The account that lacks the role. |
| role    | bytes32 | The role that is not held.       |

### AccountHasNoRoles

```solidity
error AccountHasNoRoles(address account, bytes32[] roles)
```

Thrown when an account does not hold any of the specified roles.

#### Parameters

| Name    | Type      | Description                       |
| ------- | --------- | --------------------------------- |
| account | address   | The account that lacks the roles. |
| roles   | bytes32[] | The roles that are not held.      |

### AccountNotAssignedToRole

```solidity
error AccountNotAssignedToRole(bytes32 role, address account)
```

Thrown when attempting to revoke or renounce a role from an account that does not hold it.

#### Parameters

| Name    | Type    | Description                           |
| ------- | ------- | ------------------------------------- |
| role    | bytes32 | The role the account does not hold.   |
| account | address | The account not assigned to the role. |

### CannotRenounceSoleAdmin

```solidity
error CannotRenounceSoleAdmin()
```

Thrown when the sole holder of `DEFAULT_ADMIN_ROLE` attempts to renounce it, which would permanently lock all admin-gated functions.

### FacetAlreadyRegistered

```solidity
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion)
```

Raised when an initialiser tries to register a facet that already has a non-zero last registered version (i.e. the facet is being re-initialised on a fresh install).

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| facetId     | bytes32 | Identifier of the offending facet.                             |
| lastVersion | uint256 | Last version recorded for that facet at the time of the check. |

### RolesAndActivesLengthMismatch

```solidity
error RolesAndActivesLengthMismatch(uint256 rolesLength, uint256 activesLength)
```

Thrown when the `roles` and `actives` arrays passed to `applyRoles` differ in length.

#### Parameters

| Name          | Type    | Description                  |
| ------------- | ------- | ---------------------------- |
| rolesLength   | uint256 | Length of the roles array.   |
| activesLength | uint256 | Length of the actives array. |

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
