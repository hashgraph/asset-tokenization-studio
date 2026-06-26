# AccessControlOperational

_Asset Tokenization Studio Team_

> AccessControlOperational

Variant of AccessControl for proxy facets only. Identical to AccessControl except every state-changing function requires onlyOperational as its first modifier. Use AccessControl (without onlyOperational) for direct-inheritance consumers such as DiamondCutManager that do not operate through the ResolverProxy pattern.

_Implements `IAccessControl`. Intended to be inherited exclusively by `AccessControlFacet`._

## Methods

### applyRoles

```solidity
function applyRoles(bytes32[] _roles, bool[] _actives, address _account) external nonpayable
```

Applies multiple role grants or revocations to an account in a single transaction.

_Requires the token to be operational and unpaused, equal-length arrays, and no duplicate role entries. Per-role admin checks are enforced inside the storage layer._

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

_Requires the token to be operational and unpaused, and the caller to hold the admin role of `_role`._

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

_Requires the token to be operational and unpaused. No admin role required; acts on `msg.sender`. Reverts with `CannotRenounceSoleAdmin` if the caller is the sole DEFAULT_ADMIN_ROLE holder._

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

_Requires the token to be operational and unpaused, and the caller to hold the admin role of `_role`._

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
event RolesApplied(bytes32[] requestedRoles, bool[] requestedStates, address account, bytes32[] appliedRoles, bool[] appliedStates)
```

Emitted when multiple roles are applied to an account in a single operation.

#### Parameters

| Name            | Type      | Description                                                              |
| --------------- | --------- | ------------------------------------------------------------------------ |
| requestedRoles  | bytes32[] | The roles that were submitted by the caller.                             |
| requestedStates | bool[]    | Corresponding grant/revoke flags; `true` means granted, `false` revoked. |
| account         | address   | The account to which the roles were applied.                             |
| appliedRoles    | bytes32[] | The subset of `requestedRoles` whose state effectively changed.          |
| appliedStates   | bool[]    | The corresponding final state for each effectively applied role.         |

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

### AssetNotOperational

```solidity
error AssetNotOperational(bytes32 configId, uint256 versionId)
```

Raised by `InitializerStorageWrapper.checkOperational` (and the related `isConfigVersionOperational` helper) when an operation is attempted on a configuration version that has not yet been marked operational.

#### Parameters

| Name      | Type    | Description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| configId  | bytes32 | Resolver-proxy configuration whose operational status was checked. |
| versionId | uint256 | Configuration version whose operational status was checked.        |

### CannotRenounceSoleAdmin

```solidity
error CannotRenounceSoleAdmin()
```

Thrown when the sole holder of `DEFAULT_ADMIN_ROLE` attempts to renounce it, which would permanently lock all admin-gated functions.

### ContradictoryValuesInArray

```solidity
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex)
```

Reverts when ordered array values contradict expected ordering.

_Indicates that two indexed values cannot both satisfy the required monotonic or range invariant._

#### Parameters

| Name       | Type    | Description                                      |
| ---------- | ------- | ------------------------------------------------ |
| lowerIndex | uint256 | Lower array index involved in the contradiction. |
| upperIndex | uint256 | Upper array index involved in the contradiction. |

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

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
