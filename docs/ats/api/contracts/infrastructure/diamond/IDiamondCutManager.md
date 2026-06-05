# IDiamondCutManager

_Asset Tokenization Studio Team_

> IDiamondCutManager

Manages versioned diamond configurations consumed by resolver proxies.

_Each configuration is keyed by `configurationId` and groups a set of facets at pinned versions. For every configurationId the manager retains: - `latestVersion`: monotonically increasing counter of registered versions. - Per version: the facet list, where each entry exposes the facet id, its selectors, and its supported interface ids. Configurations may be registered atomically via {createConfiguration} or incrementally via {createBatchConfiguration}, with {cancelBatchConfiguration} discarding an in-progress batch. Resolution helpers ({resolveResolverProxyCall}, {resolveSupportsInterface}) drive the dispatch logic of resolver proxies and require an explicit non-zero `_version`; callers that want the most recent version must read it first via {getLatestVersionByConfiguration}. Read helpers expose paginated views over configurations, facets, and selectors to keep gas bounded._

## Methods

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
function createBatchConfiguration(bytes32 _configurationId, IDiamondCutManager.FacetConfiguration[] _facetConfigurations, bool _isLastBatch) external nonpayable
```

#### Parameters

| Name                  | Type                                    | Description |
| --------------------- | --------------------------------------- | ----------- |
| \_configurationId     | bytes32                                 | undefined   |
| \_facetConfigurations | IDiamondCutManager.FacetConfiguration[] | undefined   |
| \_isLastBatch         | bool                                    | undefined   |

### createConfiguration

```solidity
function createConfiguration(bytes32 _configurationId, IDiamondCutManager.FacetConfiguration[] _facetConfigurations) external nonpayable
```

#### Parameters

| Name                  | Type                                    | Description |
| --------------------- | --------------------------------------- | ----------- |
| \_configurationId     | bytes32                                 | undefined   |
| \_facetConfigurations | IDiamondCutManager.FacetConfiguration[] | undefined   |

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

## Events

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
event DiamondBatchConfigurationCreated(bytes32 configurationId, IDiamondCutManager.FacetConfiguration[] facetConfigurations, bool _isLastBatch, uint256 version)
```

Emitted on every {createBatchConfiguration} call, including the final batch.

#### Parameters

| Name                | Type                                    | Description                                              |
| ------------------- | --------------------------------------- | -------------------------------------------------------- |
| configurationId     | bytes32                                 | Configuration key being assembled.                       |
| facetConfigurations | IDiamondCutManager.FacetConfiguration[] | Facets appended in this batch.                           |
| \_isLastBatch       | bool                                    | True when this call finalises the configuration version. |
| version             | uint256                                 | Version number being assembled for this configuration.   |

### DiamondConfigurationCreated

```solidity
event DiamondConfigurationCreated(bytes32 configurationId, IDiamondCutManager.FacetConfiguration[] facetConfigurations, uint256 version)
```

Emitted when a configuration is created atomically via {createConfiguration}.

#### Parameters

| Name                | Type                                    | Description                                                 |
| ------------------- | --------------------------------------- | ----------------------------------------------------------- |
| configurationId     | bytes32                                 | Configuration key that was registered.                      |
| facetConfigurations | IDiamondCutManager.FacetConfiguration[] | Facets (id, version) that compose the new configuration.    |
| version             | uint256                                 | Version number assigned to the newly created configuration. |

## Errors

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
