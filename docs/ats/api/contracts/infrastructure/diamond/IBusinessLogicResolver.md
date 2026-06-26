# IBusinessLogicResolver

_Asset Tokenization Studio Team_

> IBusinessLogicResolver

Registry for resolving Business Logic (facet) addresses by a bytes32 key and version. All registered Business Logics share a common version counter so consumers can safely target a single version and know it is fully compatible across every registered key. Registering or updating any Business Logic increments the shared latest version by 1.

## Methods

### addSelectorsToBlacklist

```solidity
function addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] _selectors) external nonpayable
```

Adds a list of selectors to the blacklist

#### Parameters

| Name              | Type     | Description                                    |
| ----------------- | -------- | ---------------------------------------------- |
| \_configurationId | bytes32  | the configuration key to be checked.           |
| \_selectors       | bytes4[] | list of selectors to be added to the blacklist |

### cancelBatchConfiguration

```solidity
function cancelBatchConfiguration(bytes32 _configurationId) external nonpayable
```

Discards an in-progress batch configuration, dropping every facet appended so far for the pending version.

_Emits {DiamondBatchConfigurationCancelled}. Has no effect once the version has been finalised via a `_isLastBatch = true` call._

#### Parameters

| Name              | Type    | Description                                                |
| ----------------- | ------- | ---------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key whose pending batch should be cancelled. |

### checkResolverProxyConfigurationRegistered

```solidity
function checkResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external nonpayable
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

Returns the total number of business logic keys currently registered in the resolver.

#### Returns

| Name                 | Type    | Description                                  |
| -------------------- | ------- | -------------------------------------------- |
| businessLogicCount\_ | uint256 | The count of registered business logic keys. |

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

Returns the latest registered version for the given business logic key.

#### Parameters

| Name               | Type    | Description                                              |
| ------------------ | ------- | -------------------------------------------------------- |
| \_businessLogicKey | bytes32 | The bytes32 key identifying the business logic to query. |

#### Returns

| Name            | Type    | Description                                                        |
| --------------- | ------- | ------------------------------------------------------------------ |
| latestVersion\_ | uint256 | The latest registered version for that key; 0 if never registered. |

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

_Issued so off-chain consumers can avoid one `eth_call` per key — JSON-RPC relays such as Hedera&#39;s enforce per-IP rate limits on `eth_call` and reject bursts. Returns 0 for keys that have never been registered (same semantics as the scalar variant)._

#### Parameters

| Name                | Type      | Description                           |
| ------------------- | --------- | ------------------------------------- |
| \_businessLogicKeys | bytes32[] | keys of the business logics to query. |

#### Returns

| Name             | Type      | Description                                                        |
| ---------------- | --------- | ------------------------------------------------------------------ |
| latestVersions\_ | uint256[] | latest version per key, in the same order as `_businessLogicKeys`. |

### getReplacementAddress

```solidity
function getReplacementAddress(address _oldAddress) external view returns (address replacementAddress_)
```

Returns the replacement address for a given address, or address(0) if none exists

#### Parameters

| Name         | Type    | Description                              |
| ------------ | ------- | ---------------------------------------- |
| \_oldAddress | address | the address whose replacement is queried |

#### Returns

| Name                 | Type    | Description                                           |
| -------------------- | ------- | ----------------------------------------------------- |
| replacementAddress\_ | address | the replacement address, or address(0) if none exists |

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

Returns the current status of a given version for a business logic key.

#### Parameters

| Name               | Type    | Description                                              |
| ------------------ | ------- | -------------------------------------------------------- |
| \_businessLogicKey | bytes32 | The bytes32 key identifying the business logic to query. |
| \_version          | uint256 | The version number to inspect.                           |

#### Returns

| Name     | Type                                      | Description                                                             |
| -------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| status\_ | enum IBusinessLogicResolver.VersionStatus | The `VersionStatus` (NONE, ACTIVATED, or DEACTIVATED) for that version. |

### initializeBusinessLogicResolver

```solidity
function initializeBusinessLogicResolver() external nonpayable returns (bool success_)
```

Initialises the Business Logic Resolver storage. Must be called once before any registration operations; subsequent calls revert.

#### Returns

| Name      | Type | Description                                          |
| --------- | ---- | ---------------------------------------------------- |
| success\_ | bool | True when initialisation succeeds without reverting. |

### isResolverProxyConfigurationRegistered

```solidity
function isResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external view returns (bool)
```

Non-reverting variant of {checkResolverProxyConfigurationRegistered}.

#### Parameters

| Name              | Type    | Description                                                                                                 |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| \_configurationId | bytes32 | Configuration key to check.                                                                                 |
| \_version         | uint256 | Version to check; must be &gt; 0. Read {getLatestVersionByConfiguration} first when the latest is required. |

#### Returns

| Name | Type | Description                                                      |
| ---- | ---- | ---------------------------------------------------------------- |
| \_0  | bool | True when the configuration version is registered and finalised. |

### registerBusinessLogics

```solidity
function registerBusinessLogics(IBusinessLogicResolver.BusinessLogicRegistryData[] _businessLogics) external nonpayable
```

#### Parameters

| Name             | Type                                               | Description |
| ---------------- | -------------------------------------------------- | ----------- |
| \_businessLogics | IBusinessLogicResolver.BusinessLogicRegistryData[] | undefined   |

### removeReplacementAddress

```solidity
function removeReplacementAddress(address _oldAddress) external nonpayable
```

Removes the replacement address for a given address

#### Parameters

| Name         | Type    | Description                                     |
| ------------ | ------- | ----------------------------------------------- |
| \_oldAddress | address | the address for which to remove the replacement |

### removeSelectorsFromBlacklist

```solidity
function removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] _selectors) external nonpayable
```

Removes a list of selectors from the blacklist

#### Parameters

| Name              | Type     | Description                                        |
| ----------------- | -------- | -------------------------------------------------- |
| \_configurationId | bytes32  | the configuration key to be checked.               |
| \_selectors       | bytes4[] | list of selectors to be removed from the blacklist |

### resolveBusinessLogicByVersion

```solidity
function resolveBusinessLogicByVersion(bytes32 _businessLogicKey, uint256 _version) external view returns (address businessLogicAddress_)
```

Returns the implementation address for a specific version of a business logic.

#### Parameters

| Name               | Type    | Description                                               |
| ------------------ | ------- | --------------------------------------------------------- |
| \_businessLogicKey | bytes32 | Key of the business logic. Business Logic must be active. |
| \_version          | uint256 | The version number to resolve.                            |

#### Returns

| Name                   | Type    | Description                                            |
| ---------------------- | ------- | ------------------------------------------------------ |
| businessLogicAddress\_ | address | The implementation address registered at that version. |

### resolveLatestBusinessLogic

```solidity
function resolveLatestBusinessLogic(bytes32 _businessLogicKey) external view returns (address businessLogicAddress_)
```

Returns the business logic address for the latest version.

#### Parameters

| Name               | Type    | Description                                               |
| ------------------ | ------- | --------------------------------------------------------- |
| \_businessLogicKey | bytes32 | Key of the business logic. Business Logic must be active. |

#### Returns

| Name                   | Type    | Description                                                  |
| ---------------------- | ------- | ------------------------------------------------------------ |
| businessLogicAddress\_ | address | The implementation address registered at the latest version. |

### resolveResolverProxyCall

```solidity
function resolveResolverProxyCall(bytes _resolverProxyConfiguration, bytes4 _selector) external view returns (address facetAddress_)
```

Resolves the facet address that implements a selector for a given configuration and version.

_Used by resolver proxies during dispatch. Returns `address(0)` when no facet claims the selector._

#### Parameters

| Name                         | Type   | Description                         |
| ---------------------------- | ------ | ----------------------------------- |
| \_resolverProxyConfiguration | bytes  | Resolver proxy full configuration.  |
| \_selector                   | bytes4 | Function selector being dispatched. |

#### Returns

| Name           | Type    | Description                                                                                                                        |
| -------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| facetAddress\_ | address | Address of the facet that owns `_selector`, or `address(0)` if the selector is not registered for the given configuration/version. |

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

### updateReplacementAddress

```solidity
function updateReplacementAddress(address _oldAddress, address _newAddress) external nonpayable
```

Updates the replacement address for a given address

#### Parameters

| Name         | Type    | Description                        |
| ------------ | ------- | ---------------------------------- |
| \_oldAddress | address | the address to be replaced         |
| \_newAddress | address | the new address to replace it with |

## Events

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

### DiamondBatchConfigurationCancelled

```solidity
event DiamondBatchConfigurationCancelled(bytes32 indexed configurationId, uint256 indexed version)
```

Emitted when an in-progress batch configuration is discarded.

#### Parameters

| Name                      | Type    | Description                                                 |
| ------------------------- | ------- | ----------------------------------------------------------- |
| configurationId `indexed` | bytes32 | Configuration key whose pending batch was cancelled.        |
| version `indexed`         | uint256 | Version number that was being assembled and is now dropped. |

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

### ReplacementAddressRemoved

```solidity
event ReplacementAddressRemoved(address indexed replacedAddress, address indexed replacementAddressRemoved)
```

Event emitted when a replacement address is removed

#### Parameters

| Name                                | Type    | Description                                         |
| ----------------------------------- | ------- | --------------------------------------------------- |
| replacedAddress `indexed`           | address | address for which the replacement is being removed. |
| replacementAddressRemoved `indexed` | address | removed replacement address.                        |

### ReplacementAddressUpdated

```solidity
event ReplacementAddressUpdated(address indexed replacedAddress, address indexed replacementAddress)
```

Event emitted when an old address is replaced with a new one

#### Parameters

| Name                         | Type    | Description                        |
| ---------------------------- | ------- | ---------------------------------- |
| replacedAddress `indexed`    | address | old address been replaced.         |
| replacementAddress `indexed` | address | new address replacing the old one. |

## Errors

### BusinessLogicKeyDuplicated

```solidity
error BusinessLogicKeyDuplicated(bytes32 businessLogicKey)
```

Thrown when two entries in a registration batch share the same business logic key.

#### Parameters

| Name             | Type    | Description                            |
| ---------------- | ------- | -------------------------------------- |
| businessLogicKey | bytes32 | The duplicated key found in the batch. |

### BusinessLogicKeyMismatch

```solidity
error BusinessLogicKeyMismatch(address implementation, bytes32 actualKey, bytes32 expectedKey)
```

Thrown when the key reported by the implementation contract differs from the expected key.

#### Parameters

| Name           | Type    | Description                                              |
| -------------- | ------- | -------------------------------------------------------- |
| implementation | address | Address of the implementation whose key was checked.     |
| actualKey      | bytes32 | The resolver key returned by the implementation.         |
| expectedKey    | bytes32 | The resolver key that was expected at registration time. |

### BusinessLogicVersionDoesNotExist

```solidity
error BusinessLogicVersionDoesNotExist(uint256 version)
```

Thrown when the requested version has never been registered for any business logic key.

#### Parameters

| Name    | Type    | Description                                             |
| ------- | ------- | ------------------------------------------------------- |
| version | uint256 | The version number that does not exist in the registry. |

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

### InvalidReplacedAddress

```solidity
error InvalidReplacedAddress(address replacedAddress)
```

Thrown when a replaced address is already been used as replacement of other addresses.

#### Parameters

| Name            | Type    | Description       |
| --------------- | ------- | ----------------- |
| replacedAddress | address | Replaced address. |

### InvalidReplacementAddress

```solidity
error InvalidReplacementAddress(address replacementAddress)
```

Thrown when a replacement address is already been replaced.

#### Parameters

| Name               | Type    | Description                                                                             |
| ------------------ | ------- | --------------------------------------------------------------------------------------- |
| replacementAddress | address | Replacement address that is already been replaced and thus cannot replaced another one. |

### InvalidResolverProxyConfiguration

```solidity
error InvalidResolverProxyConfiguration(bytes _resolverProxyConfiguration)
```

Thrown when the provided encoded proxy configuration does not respect the standard.

#### Parameters

| Name                         | Type  | Description                        |
| ---------------------------- | ----- | ---------------------------------- |
| \_resolverProxyConfiguration | bytes | wrong encoded proxy configuration. |

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

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

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

### ZeroKeyNotValidForBusinessLogic

```solidity
error ZeroKeyNotValidForBusinessLogic()
```

Thrown when a registration attempt uses the zero bytes32 value as the business logic key.
