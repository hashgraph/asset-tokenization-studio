# BusinessLogicResolver

_Asset Tokenization Studio Team_

> Business Logic Resolver

Maintains versioned business logic registrations and resolver-proxy configurations.

_Combines business-logic version resolution with diamond-cut configuration management. Initialisation grants the default admin role to the caller and must occur once._

## Methods

### acceptOwnership

```solidity
function acceptOwnership(bytes32 _configId) external nonpayable
```

Finalises an ownership handover initiated by the current owner.

_Gated by {onlyUnpaused} and {onlyConfigurationPendingOwner}: only the nominated pending owner can finalise the handover, and only while the diamond is unpaused. Snapshots the outgoing owner via {\_getOwner} before overwriting it, promotes the caller to owner via {\_setOwner}, and clears the pending slot via {\_removePendingOwner}. Emits {OwnershipAccepted} with the captured previous owner and the caller as the new owner._

#### Parameters

| Name       | Type    | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| \_configId | bytes32 | Configuration whose pending handover is being accepted. |

### addSelectorsToBlacklist

```solidity
function addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] _selectors) external nonpayable
```

Adds a list of selectors to the blacklist

_Restricted to default admins while unpaused. Blacklisted selectors are rejected when future configurations register facet selectors for the same configuration._

#### Parameters

| Name              | Type     | Description                                    |
| ----------------- | -------- | ---------------------------------------------- |
| \_configurationId | bytes32  | the configuration key to be checked.           |
| \_selectors       | bytes4[] | list of selectors to be added to the blacklist |

### applyRoles

```solidity
function applyRoles(bytes32[] _roles, bool[] _actives, address _account) external nonpayable
```

Applies multiple role grants or revocations to an account in a single transaction.

_Requires the token to be unpaused, equal-length arrays, and no duplicate role entries. Per-role admin checks are enforced inside the storage layer._

#### Parameters

| Name      | Type      | Description                                                      |
| --------- | --------- | ---------------------------------------------------------------- |
| \_roles   | bytes32[] | Array of role identifiers to process.                            |
| \_actives | bool[]    | Corresponding flags; `true` grants the role, `false` revokes it. |
| \_account | address   | The account to which roles are applied.                          |

### cancelBatchConfiguration

```solidity
function cancelBatchConfiguration(bytes32 _configurationId) external nonpayable
```

Discards an in-progress batch configuration, dropping every facet appended so far for the pending version.

_Emits {DiamondBatchConfigurationCanceled}. Has no effect once the version has been finalised via a `_isLastBatch = true` call._

#### Parameters

| Name              | Type    | Description                                                |
| ----------------- | ------- | ---------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key whose pending batch should be cancelled. |

### checkResolverProxyConfigurationRegistered

```solidity
function checkResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external view
```

Reverts if the (configurationId, version) pair is not a registered, finalised configuration.

_Intended to gate resolver-proxy operations; reverts with {ResolverProxyConfigurationNoRegistered} when the lookup fails._

#### Parameters

| Name              | Type    | Description                                                                                                  |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| \_configurationId | bytes32 | Configuration key to verify.                                                                                 |
| \_version         | uint256 | Version to verify; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |

### createBatchConfiguration

```solidity
function createBatchConfiguration(bytes32 _configurationId, IDiamondCutManager.FacetConfiguration[] _facetConfigurations, bool _isLastBatch, bytes _data) external nonpayable
```

#### Parameters

| Name                  | Type                                    | Description |
| --------------------- | --------------------------------------- | ----------- |
| \_configurationId     | bytes32                                 | undefined   |
| \_facetConfigurations | IDiamondCutManager.FacetConfiguration[] | undefined   |
| \_isLastBatch         | bool                                    | undefined   |
| \_data                | bytes                                   | undefined   |

### createConfiguration

```solidity
function createConfiguration(bytes32 _configurationId, IDiamondCutManager.FacetConfiguration[] _facetConfigurations, bytes _data) external nonpayable
```

#### Parameters

| Name                  | Type                                    | Description |
| --------------------- | --------------------------------------- | ----------- |
| \_configurationId     | bytes32                                 | undefined   |
| \_facetConfigurations | IDiamondCutManager.FacetConfiguration[] | undefined   |
| \_data                | bytes                                   | undefined   |

### getBusinessLogicCount

```solidity
function getBusinessLogicCount() external view returns (uint256 businessLogicCount_)
```

Returns the count of currently active business logics

#### Returns

| Name                 | Type    | Description |
| -------------------- | ------- | ----------- |
| businessLogicCount\_ | uint256 | undefined   |

### getBusinessLogicKeys

```solidity
function getBusinessLogicKeys(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] businessLogicKeys_)
```

Returns a list of business logic keys

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength | uint256 | number of members to return                   |

#### Returns

| Name                | Type      | Description                 |
| ------------------- | --------- | --------------------------- |
| businessLogicKeys\_ | bytes32[] | list of business logic keys |

### getConfigurations

```solidity
function getConfigurations(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] configurationIds_)
```

Returns a paginated slice of registered configuration ids.

_Pagination is used to keep gas bounded on large registries; out-of-range pages return an empty array rather than reverting._

#### Parameters

| Name         | Type    | Description                                                   |
| ------------ | ------- | ------------------------------------------------------------- |
| \_pageIndex  | uint256 | Page index; entries skipped equal `_pageIndex * _pageLength`. |
| \_pageLength | uint256 | Maximum number of entries to return.                          |

#### Returns

| Name               | Type      | Description                                        |
| ------------------ | --------- | -------------------------------------------------- |
| configurationIds\_ | bytes32[] | Slice of configuration ids for the requested page. |

### getConfigurationsLength

```solidity
function getConfigurationsLength() external view returns (uint256 configurationsLength_)
```

Returns the number of distinct configuration keys registered in the manager.

#### Returns

| Name                   | Type    | Description                                  |
| ---------------------- | ------- | -------------------------------------------- |
| configurationsLength\_ | uint256 | Total count of registered configuration ids. |

### getFacetAddressByConfigurationIdVersionAndFacetId

```solidity
function getFacetAddressByConfigurationIdVersionAndFacetId(bytes32 _configurationId, uint256 _version, bytes32 _facetId) external view returns (address facetAddress_)
```

Returns the address of a facet inside a configuration version.

_Returns `address(0)` when the facet is not part of the configuration version._

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_facetId         | bytes32 | Facet key to look up.                                                                                       |

#### Returns

| Name           | Type    | Description                                            |
| -------------- | ------- | ------------------------------------------------------ |
| facetAddress\_ | address | Address of the facet, or `address(0)` if unregistered. |

### getFacetAddressesByConfigurationIdAndVersion

```solidity
function getFacetAddressesByConfigurationIdAndVersion(bytes32 _configurationId, uint256 _version, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] facetAddresses_)
```

Returns a paginated slice of facet addresses registered for a configuration version.

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_pageIndex       | uint256 | Page index; entries skipped equal `_pageIndex * _pageLength`.                                               |
| \_pageLength      | uint256 | Maximum number of entries to return.                                                                        |

#### Returns

| Name             | Type      | Description                                      |
| ---------------- | --------- | ------------------------------------------------ |
| facetAddresses\_ | address[] | Slice of facet addresses for the requested page. |

### getFacetByConfigurationIdVersionAndFacetId

```solidity
function getFacetByConfigurationIdVersionAndFacetId(bytes32 _configurationId, uint256 _version, bytes32 _facetId) external view returns (struct IDiamondLoupe.Facet facet_)
```

Returns the full facet record (id, address, selectors, interface ids) for a facet inside a configuration version.

_Returns a zero-valued {IDiamondLoupe.Facet} when the facet is not part of the configuration version._

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_facetId         | bytes32 | Facet key to look up.                                                                                       |

#### Returns

| Name    | Type                | Description                  |
| ------- | ------------------- | ---------------------------- |
| facet\_ | IDiamondLoupe.Facet | Facet record for `_facetId`. |

### getFacetConfigurationsByConfigurationIdAndVersion

```solidity
function getFacetConfigurationsByConfigurationIdAndVersion(bytes32 _configurationId, uint256 _version, uint256 _start, uint256 _end) external view returns (struct IDiamondCutManager.FacetConfiguration[] facetConfigurations_)
```

Returns the (facet id, facet version) tuples registered for a configuration version over a half-open index range.

_Slice semantics differ from the page-based helpers: `_start` is inclusive and `_end` is exclusive, allowing callers to express arbitrary windows._

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_start           | uint256 | Inclusive start index of the slice.                                                                         |
| \_end             | uint256 | Exclusive end index of the slice.                                                                           |

#### Returns

| Name                  | Type                                    | Description                                           |
| --------------------- | --------------------------------------- | ----------------------------------------------------- |
| facetConfigurations\_ | IDiamondCutManager.FacetConfiguration[] | Slice of {FacetConfiguration} entries for the window. |

### getFacetIdByConfigurationIdVersionAndSelector

```solidity
function getFacetIdByConfigurationIdVersionAndSelector(bytes32 _configurationId, uint256 _version, bytes4 _selector) external view returns (bytes32 facetId_)
```

Returns the facet id that owns a selector inside a configuration version.

_Returns `bytes32(0)` when the selector is not registered._

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_selector        | bytes4  | Selector to look up.                                                                                        |

#### Returns

| Name      | Type    | Description                                           |
| --------- | ------- | ----------------------------------------------------- |
| facetId\_ | bytes32 | Facet id owning `_selector`, or `bytes32(0)` if none. |

### getFacetIdsByConfigurationIdAndVersion

```solidity
function getFacetIdsByConfigurationIdAndVersion(bytes32 _configurationId, uint256 _version, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] facetIds_)
```

Returns a paginated slice of facet ids registered for a configuration version.

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_pageIndex       | uint256 | Page index; entries skipped equal `_pageIndex * _pageLength`.                                               |
| \_pageLength      | uint256 | Maximum number of entries to return.                                                                        |

#### Returns

| Name       | Type      | Description                                |
| ---------- | --------- | ------------------------------------------ |
| facetIds\_ | bytes32[] | Slice of facet ids for the requested page. |

### getFacetSelectorsByConfigurationIdVersionAndFacetId

```solidity
function getFacetSelectorsByConfigurationIdVersionAndFacetId(bytes32 _configurationId, uint256 _version, bytes32 _facetId, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes4[] facetSelectors_)
```

Returns a paginated slice of selectors registered for a facet inside a configuration version.

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_facetId         | bytes32 | Facet key whose selectors are returned.                                                                     |
| \_pageIndex       | uint256 | Page index; entries skipped equal `_pageIndex * _pageLength`.                                               |
| \_pageLength      | uint256 | Maximum number of entries to return.                                                                        |

#### Returns

| Name             | Type     | Description                                |
| ---------------- | -------- | ------------------------------------------ |
| facetSelectors\_ | bytes4[] | Slice of selectors for the requested page. |

### getFacetSelectorsLengthByConfigurationIdVersionAndFacetId

```solidity
function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(bytes32 _configurationId, uint256 _version, bytes32 _facetId) external view returns (uint256 facetSelectorsLength_)
```

Returns the number of selectors registered for a facet inside a configuration version.

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_facetId         | bytes32 | Facet key whose selectors are counted.                                                                      |

#### Returns

| Name                   | Type    | Description                                           |
| ---------------------- | ------- | ----------------------------------------------------- |
| facetSelectorsLength\_ | uint256 | Count of selectors owned by the facet in the version. |

### getFacetVersionByConfigurationIdVersionAndFacetId

```solidity
function getFacetVersionByConfigurationIdVersionAndFacetId(bytes32 _configurationId, uint256 _version, bytes32 _facetId) external view returns (uint256 facetVersion_)
```

Returns the pinned facet version stored inside a configuration version.

_Reverts with {FacetIdNotRegistered} when the facet is not part of the configuration version, and with {VersionZero} when `_version` is 0._

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_facetId         | bytes32 | Facet key to look up.                                                                                       |

#### Returns

| Name           | Type    | Description                                            |
| -------------- | ------- | ------------------------------------------------------ |
| facetVersion\_ | uint256 | Pinned facet version inside the configuration version. |

### getFacetsByConfigurationIdAndVersion

```solidity
function getFacetsByConfigurationIdAndVersion(bytes32 _configurationId, uint256 _version, uint256 _pageIndex, uint256 _pageLength) external view returns (struct IDiamondLoupe.Facet[] facets_)
```

Returns a paginated slice of facets for a configuration version, including each facet&#39;s address, selectors, and advertised interface ids.

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_pageIndex       | uint256 | Page index; entries skipped equal `_pageIndex * _pageLength`.                                               |
| \_pageLength      | uint256 | Maximum number of entries to return.                                                                        |

#### Returns

| Name     | Type                  | Description                                                    |
| -------- | --------------------- | -------------------------------------------------------------- |
| facets\_ | IDiamondLoupe.Facet[] | Slice of {IDiamondLoupe.Facet} entries for the requested page. |

### getFacetsLengthByConfigurationIdAndVersion

```solidity
function getFacetsLengthByConfigurationIdAndVersion(bytes32 _configurationId, uint256 _version) external view returns (uint256 facetsLength_)
```

Returns the number of facets registered under a configuration version.

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to query.                                                                                 |
| \_version         | uint256 | Version to query; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |

#### Returns

| Name           | Type    | Description                                   |
| -------------- | ------- | --------------------------------------------- |
| facetsLength\_ | uint256 | Count of facets in the configuration version. |

### getLatestVersion

```solidity
function getLatestVersion(bytes32 _businessLogicKey) external view returns (uint256 latestVersion_)
```

Returns the current latest version for all business logics

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| \_businessLogicKey | bytes32 | undefined   |

#### Returns

| Name            | Type    | Description |
| --------------- | ------- | ----------- |
| latestVersion\_ | uint256 | undefined   |

### getLatestVersionByConfiguration

```solidity
function getLatestVersionByConfiguration(bytes32 _configurationId) external view returns (uint256 latestVersion_)
```

Returns the latest registered version of a configuration.

#### Parameters

| Name              | Type    | Description                 |
| ----------------- | ------- | --------------------------- |
| \_configurationId | bytes32 | Configuration key to query. |

#### Returns

| Name            | Type    | Description                                                   |
| --------------- | ------- | ------------------------------------------------------------- |
| latestVersion\_ | uint256 | Latest finalised version, or 0 when no version is registered. |

### getLatestVersions

```solidity
function getLatestVersions(bytes32[] _businessLogicKeys) external view returns (uint256[] latestVersions_)
```

Batched variant of `getLatestVersion` that resolves many keys in a single call.

_Iterates over all supplied keys and returns zero for keys with no registered version._

#### Parameters

| Name                | Type      | Description                           |
| ------------------- | --------- | ------------------------------------- |
| \_businessLogicKeys | bytes32[] | keys of the business logics to query. |

#### Returns

| Name             | Type      | Description                                                        |
| ---------------- | --------- | ------------------------------------------------------------------ |
| latestVersions\_ | uint256[] | latest version per key, in the same order as `_businessLogicKeys`. |

### getOwner

```solidity
function getOwner(bytes32 configId) external view returns (address owner_)
```

Returns the current owner of a configuration.

#### Parameters

| Name     | Type    | Description             |
| -------- | ------- | ----------------------- |
| configId | bytes32 | Configuration to query. |

#### Returns

| Name    | Type    | Description                                                                                  |
| ------- | ------- | -------------------------------------------------------------------------------------------- |
| owner\_ | address | Address that currently owns `configId`, or the zero address when no owner has been recorded. |

### getPendingOwner

```solidity
function getPendingOwner(bytes32 configId) external view returns (address pendingOwner_)
```

Returns the pending owner of a configuration, if any.

#### Parameters

| Name     | Type    | Description             |
| -------- | ------- | ----------------------- |
| configId | bytes32 | Configuration to query. |

#### Returns

| Name           | Type    | Description                                                                                         |
| -------------- | ------- | --------------------------------------------------------------------------------------------------- |
| pendingOwner\_ | address | Address currently nominated to accept ownership, or the zero address when no transfer is in flight. |

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

### getSelectorsBlacklist

```solidity
function getSelectorsBlacklist(bytes32 _configurationId, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes4[] selectors_)
```

Returns the list of selectors in the blacklist

#### Parameters

| Name              | Type    | Description                                   |
| ----------------- | ------- | --------------------------------------------- |
| \_configurationId | bytes32 | the configuration key to be checked.          |
| \_pageIndex       | uint256 | members to skip : \_pageIndex \* \_pageLength |
| \_pageLength      | uint256 | number of members to return                   |

#### Returns

| Name        | Type     | Description                            |
| ----------- | -------- | -------------------------------------- |
| selectors\_ | bytes4[] | List of the selectors in the blacklist |

### getVersionStatus

```solidity
function getVersionStatus(bytes32 _businessLogicKey, uint256 _version) external view returns (enum IBusinessLogicResolver.VersionStatus status_)
```

Returns the current status of a given version

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| \_businessLogicKey | bytes32 | undefined   |
| \_version          | uint256 | undefined   |

#### Returns

| Name     | Type                                      | Description |
| -------- | ----------------------------------------- | ----------- |
| status\_ | enum IBusinessLogicResolver.VersionStatus | undefined   |

### grantRole

```solidity
function grantRole(bytes32 _role, address _account) external nonpayable returns (bool success_)
```

Grants a role to an account.

_Requires the token to be unpaused and the caller to hold the admin role of `_role`._

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

### initializeBusinessLogicResolver

```solidity
function initializeBusinessLogicResolver() external nonpayable returns (bool success_)
```

_Grants `DEFAULT_ADMIN_ROLE` to the current EVM sender and marks the resolver as initialised before emitting `BusinessLogicResolverInitialized`._

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### initializePause

```solidity
function initializePause() external nonpayable
```

Initialises the pause capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isResolverProxyConfigurationRegistered

```solidity
function isResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external view returns (bool isRegistered_)
```

Non-reverting variant of {checkResolverProxyConfigurationRegistered}.

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to check.                                                                                 |
| \_version         | uint256 | Version to check; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |

#### Returns

| Name           | Type | Description                                                      |
| -------------- | ---- | ---------------------------------------------------------------- |
| isRegistered\_ | bool | True when the configuration version is registered and finalised. |

### pause

```solidity
function pause() external nonpayable returns (bool success_)
```

Sets the token&#39;s internal pause flag, blocking all guarded operations.

_Requires `ROLE_PAUSER` and the token to be currently unpaused. Reverts with `IsPaused` if the token is already paused. Emits `Paused`._

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the token was successfully paused. |

### paused

```solidity
function paused() external view returns (bool)
```

Checks whether the token is currently paused.

_Returns `true` if the token&#39;s own pause flag is set, or if any registered external pause contract returns `true` from its `isPaused()` call (OR semantics). created to be compatible with ERC3643_

#### Returns

| Name | Type | Description                                                 |
| ---- | ---- | ----------------------------------------------------------- |
| \_0  | bool | True if the token is paused by any source, false otherwise. |

### registerBusinessLogics

```solidity
function registerBusinessLogics(IBusinessLogicResolver.BusinessLogicRegistryData[] _businessLogics) external nonpayable
```

#### Parameters

| Name             | Type                                               | Description |
| ---------------- | -------------------------------------------------- | ----------- |
| \_businessLogics | IBusinessLogicResolver.BusinessLogicRegistryData[] | undefined   |

### removeSelectorsFromBlacklist

```solidity
function removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] _selectors) external nonpayable
```

Removes a list of selectors from the blacklist

_Restricted to default admins while unpaused. Removing a selector only affects subsequent validation and does not mutate already activated configurations._

#### Parameters

| Name              | Type     | Description                                        |
| ----------------- | -------- | -------------------------------------------------- |
| \_configurationId | bytes32  | the configuration key to be checked.               |
| \_selectors       | bytes4[] | list of selectors to be removed from the blacklist |

### renounceRole

```solidity
function renounceRole(bytes32 _role) external nonpayable returns (bool success_)
```

Allows the caller to renounce a role held by their own account.

_Requires the token to be unpaused. No admin role required; acts on `msg.sender`. Reverts with `CannotRenounceSoleAdmin` if the caller is the sole DEFAULT_ADMIN_ROLE holder._

#### Parameters

| Name   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
| \_role | bytes32 | The role identifier to renounce. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the role was successfully renounced. |

### resolveBusinessLogicByVersion

```solidity
function resolveBusinessLogicByVersion(bytes32 _businessLogicKey, uint256 _version) external view returns (address businessLogicAddress_)
```

Returns a specific business logic version address

#### Parameters

| Name               | Type    | Description                                               |
| ------------------ | ------- | --------------------------------------------------------- |
| \_businessLogicKey | bytes32 | key of the business logic. Business Logic must be active. |
| \_version          | uint256 | the version                                               |

#### Returns

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| businessLogicAddress\_ | address | undefined   |

### resolveLatestBusinessLogic

```solidity
function resolveLatestBusinessLogic(bytes32 _businessLogicKey) external view returns (address businessLogicAddress_)
```

Returns the business logic address for the latest version

#### Parameters

| Name               | Type    | Description                                               |
| ------------------ | ------- | --------------------------------------------------------- |
| \_businessLogicKey | bytes32 | key of the business logic. Business Logic must be active. |

#### Returns

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| businessLogicAddress\_ | address | undefined   |

### resolveResolverProxyCall

```solidity
function resolveResolverProxyCall(bytes32 _configurationId, uint256 _version, bytes4 _selector) external view returns (address facetAddress_)
```

Resolves the facet address that implements a selector for a given configuration and version.

_Used by resolver proxies during dispatch. Returns `address(0)` when no facet claims the selector._

#### Parameters

| Name              | Type    | Description                                                                                                                    |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| \_configurationId | bytes32 | Configuration key bound to the resolver proxy.                                                                                 |
| \_version         | uint256 | Version bound to the resolver proxy; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_selector        | bytes4  | Function selector being dispatched.                                                                                            |

#### Returns

| Name           | Type    | Description                                                                                                                        |
| -------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| facetAddress\_ | address | Address of the facet that owns `_selector`, or `address(0)` if the selector is not registered for the given configuration/version. |

### resolveSupportsInterface

```solidity
function resolveSupportsInterface(bytes32 _configurationId, uint256 _version, bytes4 _interfaceId) external view returns (bool exists_)
```

Reports whether an interface id is advertised by any facet inside the given configuration and version.

_Powers ERC-165 lookups on resolver proxies._

#### Parameters

| Name              | Type    | Description                                                                                                                    |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| \_configurationId | bytes32 | Configuration key bound to the resolver proxy.                                                                                 |
| \_version         | uint256 | Version bound to the resolver proxy; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |
| \_interfaceId     | bytes4  | Interface identifier to test.                                                                                                  |

#### Returns

| Name     | Type | Description                                                       |
| -------- | ---- | ----------------------------------------------------------------- |
| exists\_ | bool | True if `_interfaceId` is supported by the configuration version. |

### revokeRole

```solidity
function revokeRole(bytes32 _role, address _account) external nonpayable returns (bool success_)
```

Revokes a role from an account.

_Requires the token to be unpaused and the caller to hold the admin role of `_role`._

#### Parameters

| Name      | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| \_role    | bytes32 | The role identifier to revoke. |
| \_account | address | The account to lose the role.  |

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the role was successfully revoked. |

### transferOwnership

```solidity
function transferOwnership(bytes32 _configId, address _newOwner) external nonpayable
```

Nominates `_newOwner` as the pending owner of `_configId`.

_Gated by {onlyUnpaused}, {onlyConfigurationOwner} and {onlyCreateConfigurationRole}: only the existing owner can nominate a successor who was previously granted the ROLE_CREATE_CONFIGURATION, and only while the diamond is unpaused. Stores `_newOwner` as the pending owner without touching the current owner; finalisation happens in {acceptOwnership}. Emits {OwnershipTransfered} with the caller as the outgoing owner._

#### Parameters

| Name       | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| \_configId | bytes32 | Configuration whose ownership is being handed over. |
| \_newOwner | address | Address to record as pending owner.                 |

### unpause

```solidity
function unpause() external nonpayable returns (bool success_)
```

Clears the token&#39;s internal pause flag, restoring guarded operations.

_Requires `ROLE_PAUSER` and the token&#39;s internal flag to be set. Reverts with `IsUnpaused` if the internal flag is already cleared. Emits `Unpaused`. Note: if any external pause contract remains paused, `isPaused` will still return `true` after this call._

#### Returns

| Name      | Type | Description                                               |
| --------- | ---- | --------------------------------------------------------- |
| success\_ | bool | True if the internal pause flag was successfully cleared. |

## Events

### AccessControlInitialized

```solidity
event AccessControlInitialized()
```

Emitted once when the AccessControl capability is initialised on a token.

_Fires exclusively from `initializeAccessControl` after the registration succeeds._

### BusinessLogicResolverInitialized

```solidity
event BusinessLogicResolverInitialized()
```

Emitted once when the BLR itself is initialised.

_Fires exclusively from `initializeBusinessLogicResolver` after the storage write succeeds._

### BusinessLogicsRegistered

```solidity
event BusinessLogicsRegistered(IBusinessLogicResolver.BusinessLogicRegistryData[] businessLogics, uint256[] newLatestVersions)
```

Event emitted when Business Logic(s) are registered (updated or added).

#### Parameters

| Name              | Type                                               | Description                                                                   |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| businessLogics    | IBusinessLogicResolver.BusinessLogicRegistryData[] | list of registered Business Logics.                                           |
| newLatestVersions | uint256[]                                          | new latest version per registered key, in the same order as `businessLogics`. |

### DiamondBatchConfigurationCanceled

```solidity
event DiamondBatchConfigurationCanceled(bytes32 indexed configurationId, uint256 version)
```

Emitted when an in-progress batch configuration is discarded.

#### Parameters

| Name                      | Type    | Description                                                 |
| ------------------------- | ------- | ----------------------------------------------------------- |
| configurationId `indexed` | bytes32 | Configuration key whose pending batch was cancelled.        |
| version                   | uint256 | Version number that was being assembled and is now dropped. |

### DiamondBatchConfigurationCreated

```solidity
event DiamondBatchConfigurationCreated(bytes32 configurationId, IDiamondCutManager.FacetConfiguration[] facetConfigurations, bool isLastBatch, uint256 version, bytes data)
```

Emitted on every {createBatchConfiguration} call, including the final batch.

#### Parameters

| Name                | Type                                    | Description                                              |
| ------------------- | --------------------------------------- | -------------------------------------------------------- |
| configurationId     | bytes32                                 | Configuration key being assembled.                       |
| facetConfigurations | IDiamondCutManager.FacetConfiguration[] | Facets appended in this batch.                           |
| isLastBatch         | bool                                    | True when this call finalises the configuration version. |
| version             | uint256                                 | Version number being assembled for this configuration.   |
| data                | bytes                                   | Additional data passed to the configuration.             |

### DiamondConfigurationCreated

```solidity
event DiamondConfigurationCreated(bytes32 configurationId, IDiamondCutManager.FacetConfiguration[] facetConfigurations, uint256 version, bytes data)
```

Emitted when a configuration is created atomically via {createConfiguration}.

#### Parameters

| Name                | Type                                    | Description                                                 |
| ------------------- | --------------------------------------- | ----------------------------------------------------------- |
| configurationId     | bytes32                                 | Configuration key that was registered.                      |
| facetConfigurations | IDiamondCutManager.FacetConfiguration[] | Facets (id, version) that compose the new configuration.    |
| version             | uint256                                 | Version number assigned to the newly created configuration. |
| data                | bytes                                   | Additional data passed to the configuration.                |

### OwnershipAccepted

```solidity
event OwnershipAccepted(bytes32 indexed configId, address previousOwner, address newOwner)
```

Emitted when the pending owner finalises the ownership handover.

_Fired by {acceptOwnership} after the configuration owner has been updated and the pending owner slot cleared._

#### Parameters

| Name               | Type    | Description                                                     |
| ------------------ | ------- | --------------------------------------------------------------- |
| configId `indexed` | bytes32 | Configuration whose ownership has changed.                      |
| previousOwner      | address | Address that previously owned the configuration.                |
| newOwner           | address | Caller that accepted ownership and now holds the configuration. |

### OwnershipTransfered

```solidity
event OwnershipTransfered(bytes32 indexed configId, address owner, address pendingOwner)
```

Emitted when the current owner nominates a new owner for a configuration.

_Fired by {transferOwnership} before the handover is accepted; the existing owner remains in control until {acceptOwnership} is invoked by `newOwner`._

#### Parameters

| Name               | Type    | Description                                         |
| ------------------ | ------- | --------------------------------------------------- |
| configId `indexed` | bytes32 | Configuration whose ownership is being transferred. |
| owner              | address | Current owner that initiated the transfer.          |
| pendingOwner       | address | Address nominated as the pending owner.             |

### PauseInitialized

```solidity
event PauseInitialized()
```

Emitted once when the pause capability is initialised on a token.

_Fires exclusively from `initializePause`._

### Paused

```solidity
event Paused(address indexed operator)
```

Emitted when the token&#39;s internal pause flag is set to `true`.

#### Parameters

| Name               | Type    | Description                                    |
| ------------------ | ------- | ---------------------------------------------- |
| operator `indexed` | address | Address of the caller who triggered the pause. |

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

### Unpaused

```solidity
event Unpaused(address indexed operator)
```

Emitted when the token&#39;s internal pause flag is cleared to `false`.

#### Parameters

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| operator `indexed` | address | Address of the caller who triggered the unpause. |

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

### AlreadyInitialized

```solidity
error AlreadyInitialized()
```

Reverts when an initialisation routine is invoked more than once.

_Used by contracts or facets that must be initialised exactly once._

### BusinessLogicKeyDuplicated

```solidity
error BusinessLogicKeyDuplicated(bytes32 businessLogicKey)
```

#### Parameters

| Name             | Type    | Description |
| ---------------- | ------- | ----------- |
| businessLogicKey | bytes32 | undefined   |

### BusinessLogicKeyMismatch

```solidity
error BusinessLogicKeyMismatch(address implementation, bytes32 actualKey, bytes32 expectedKey)
```

#### Parameters

| Name           | Type    | Description |
| -------------- | ------- | ----------- |
| implementation | address | undefined   |
| actualKey      | bytes32 | undefined   |
| expectedKey    | bytes32 | undefined   |

### BusinessLogicVersionDoesNotExist

```solidity
error BusinessLogicVersionDoesNotExist(uint256 version)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| version | uint256 | undefined   |

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

### DefaultValueForConfigurationIdNotPermitted

```solidity
error DefaultValueForConfigurationIdNotPermitted()
```

Thrown when `bytes32(0)` is supplied as a configuration id, which is reserved.

### DuplicatedFacetInConfiguration

```solidity
error DuplicatedFacetInConfiguration(bytes32 facetId)
```

Thrown when the same facet id appears more than once within a configuration.

#### Parameters

| Name    | Type    | Description          |
| ------- | ------- | -------------------- |
| facetId | bytes32 | Duplicated facet id. |

### EmptyFacetConfigurationNotPermitted

```solidity
error EmptyFacetConfigurationNotPermitted(bytes32 configurationId)
```

Thrown when attempting to activate a configuration that contains no facets, which would brick any ResolverProxy following the latest version.

#### Parameters

| Name            | Type    | Description                                                   |
| --------------- | ------- | ------------------------------------------------------------- |
| configurationId | bytes32 | Configuration key that was supplied with an empty facet list. |

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

### FacetIdNotRegistered

```solidity
error FacetIdNotRegistered(bytes32 configurationId, bytes32 facetId)
```

Thrown when a configuration references a facet id that is not registered in the business-logic resolver.

#### Parameters

| Name            | Type    | Description                                 |
| --------------- | ------- | ------------------------------------------- |
| configurationId | bytes32 | Configuration being created or modified.    |
| facetId         | bytes32 | Unknown facet id that triggered the revert. |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### IsUnpaused

```solidity
error IsUnpaused()
```

Thrown when `unpause` is called while the token&#39;s internal pause flag is already cleared.

### NotOwner

```solidity
error NotOwner(bytes32 configId, address sender, address owner)
```

Raised when the caller is not the current owner of the configuration.

#### Parameters

| Name     | Type    | Description                                        |
| -------- | ------- | -------------------------------------------------- |
| configId | bytes32 | Configuration that was accessed.                   |
| sender   | address | Caller that attempted the owner-only action.       |
| owner    | address | Address currently holding ownership of `configId`. |

### NotPendingOwner

```solidity
error NotPendingOwner(bytes32 configId, address sender, address pendingOwner)
```

Raised when the caller is not the pending owner of the configuration.

#### Parameters

| Name         | Type    | Description                                                 |
| ------------ | ------- | ----------------------------------------------------------- |
| configId     | bytes32 | Configuration whose pending handover was targeted.          |
| sender       | address | Caller that attempted to accept ownership.                  |
| pendingOwner | address | Address currently nominated as pending owner of `configId`. |

### OngoingBatchConfigurationNotPermitted

```solidity
error OngoingBatchConfigurationNotPermitted(bytes32 configurationId)
```

Thrown when {createConfiguration} is called for a configuration id that already has an in-progress batch, which would prematurely finalise the incomplete batch and absorb any facets that were intended for subsequent batch additions.

#### Parameters

| Name            | Type    | Description                                      |
| --------------- | ------- | ------------------------------------------------ |
| configurationId | bytes32 | Configuration key whose batch is currently open. |

### ResolverProxyConfigurationNoRegistered

```solidity
error ResolverProxyConfigurationNoRegistered(bytes32 resolverProxyConfigurationId, uint256 version)
```

Thrown when a (configurationId, version) pair is referenced but has not been registered (or is still mid-batch and therefore not yet finalised).

#### Parameters

| Name                         | Type    | Description                           |
| ---------------------------- | ------- | ------------------------------------- |
| resolverProxyConfigurationId | bytes32 | Configuration key that was looked up. |
| version                      | uint256 | Version that was looked up.           |

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

### SelectorAlreadyRegistered

```solidity
error SelectorAlreadyRegistered(bytes32 configurationId, uint256 version, bytes32 facetId, bytes4 selector)
```

Thrown when a selector is already registered under another facet for the same (configurationId, version), which would create an ambiguous dispatch.

#### Parameters

| Name            | Type    | Description                                           |
| --------------- | ------- | ----------------------------------------------------- |
| configurationId | bytes32 | Configuration where the clash was detected.           |
| version         | uint256 | Version where the clash was detected.                 |
| facetId         | bytes32 | Facet attempting to register the selector.            |
| selector        | bytes4  | Selector that is already mapped to a different facet. |

### SelectorBlacklisted

```solidity
error SelectorBlacklisted(bytes4 selector)
```

Thrown when attempting to register a selector that is globally blacklisted.

#### Parameters

| Name     | Type   | Description                          |
| -------- | ------ | ------------------------------------ |
| selector | bytes4 | Function selector that is forbidden. |

### Unimplemented

```solidity
error Unimplemented()
```

Indicates that a requested operation is not implemented by this resolver.

_Reserved for interface compatibility or future extension points._

### VersionZero

```solidity
error VersionZero(bytes32 configurationId)
```

Thrown when a configuration version of 0 is supplied to an entry point that requires an explicit version pin.

_Callers that want the most recent registered version must read it first via {getLatestVersionByConfiguration} and pass that value._

#### Parameters

| Name            | Type    | Description                           |
| --------------- | ------- | ------------------------------------- |
| configurationId | bytes32 | Configuration key that was looked up. |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._

### ZeroKeyNotValidForBusinessLogic

```solidity
error ZeroKeyNotValidForBusinessLogic()
```
