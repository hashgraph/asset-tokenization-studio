# InitializerFacet

_Asset Tokenization Studio Team_

> InitializerFacet

Diamond facet that manages the per-facet initialisation registry and the operational status of the token, registered under `RESOLVER_KEY_INITIALIZER`.

## Methods

### getFacetLastVersion

```solidity
function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_)
```

Returns the latest version recorded for a facet. Zero means never registered.

#### Parameters

| Name      | Type    | Description                       |
| --------- | ------- | --------------------------------- |
| \_facetId | bytes32 | Identifier of the facet to query. |

#### Returns

| Name          | Type    | Description                                                  |
| ------------- | ------- | ------------------------------------------------------------ |
| lastVersion\_ | uint256 | Most recent version stored for the facet, or zero if absent. |

### getFacetVersionStatus

```solidity
function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_)
```

Returns the initialisation status of a specific facet version.

_Encoding: `0` = initialisation not started, `1` = ready, `&gt;1` = initialisation in progress (intermediate value defined by the facet implementation)._

#### Parameters

| Name        | Type    | Description                       |
| ----------- | ------- | --------------------------------- |
| \_facetId   | bytes32 | Identifier of the facet to query. |
| \_versionId | uint256 | Version of the facet to query.    |

#### Returns

| Name     | Type    | Description                                           |
| -------- | ------- | ----------------------------------------------------- |
| status\_ | uint256 | Initialisation status of the requested facet version. |

### getMaxInitializerFacetIndex

```solidity
function getMaxInitializerFacetIndex() external view returns (uint256 maxInitializerFacetIndex_)
```

Returns the configured batch size for `setOperationalStatus`.

#### Returns

| Name                       | Type    | Description                                  |
| -------------------------- | ------- | -------------------------------------------- |
| maxInitializerFacetIndex\_ | uint256 | Maximum number of facets validated per call. |

### getOperationalStatus

```solidity
function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_)
```

Returns the raw operational status for a resolver-proxy configuration version.

_Encoding: `0` = not started, `1` = fully operational, `&gt;1` = resume facet index + 1._

#### Parameters

| Name        | Type    | Description                            |
| ----------- | ------- | -------------------------------------- |
| \_configId  | bytes32 | Resolver-proxy configuration to query. |
| \_versionId | uint256 | Configuration version to query.        |

#### Returns

| Name     | Type    | Description                                    |
| -------- | ------- | ---------------------------------------------- |
| status\_ | uint256 | Encoded operational status as described above. |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[] staticFunctionSelectors_)
```

Gets all function selectors of a facet

#### Returns

| Name                      | Type     | Description              |
| ------------------------- | -------- | ------------------------ |
| staticFunctionSelectors\_ | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[] staticInterfaceIds_)
```

Gets all interfaces ids of a facet.

#### Returns

| Name                 | Type     | Description        |
| -------------------- | -------- | ------------------ |
| staticInterfaceIds\_ | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### initializeInitializer

```solidity
function initializeInitializer(uint256 _maxInitializerFacetIndex) external nonpayable
```

Seeds the initializer storage with the batch size used by `setOperationalStatus` and marks the initializer facet itself as ready for its current version.

_Restricted to `DEFAULT_ADMIN_ROLE` and guarded against re-registration via `onlyFacetNotRegistered(RESOLVER_KEY_INITIALIZER)`. Emits `InitializerInitialized`._

#### Parameters

| Name                       | Type    | Description                                                         |
| -------------------------- | ------- | ------------------------------------------------------------------- |
| \_maxInitializerFacetIndex | uint256 | Maximum number of facets validated per `setOperationalStatus` call. |

### setOperationalStatus

```solidity
function setOperationalStatus() external nonpayable returns (bool isOperational_, uint256 lastFacetIndex_)
```

Walks the facet list of the active resolver-proxy `(configurationId, version)`, in batches of `maxInitializerFacetIndex`, and marks the configuration operational once every facet is ready.

_Idempotent and resumable: if already operational, returns immediately; if partial progress is stored, resumes from the recorded index; otherwise starts from index 0. Emits `OperationalStatusSet` on completion or `OperationalStatusPartialSet` otherwise._

#### Returns

| Name             | Type    | Description                                                                                                                       |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| isOperational\_  | bool    | True when every facet of the configuration version is ready.                                                                      |
| lastFacetIndex\_ | uint256 | Index reached in this call; on partial progress, the next call resumes here. Zero when the configuration was already operational. |

### updateMaxInitializerFacetIndex

```solidity
function updateMaxInitializerFacetIndex(uint256 _newMaxInitializerFacetIndex) external nonpayable
```

Updates the batch size used by `setOperationalStatus` to bound per-call gas usage.

_Restricted to `DEFAULT_ADMIN_ROLE`. Emits `MaxInitializerFacetIndexUpdated`._

#### Parameters

| Name                          | Type    | Description                                   |
| ----------------------------- | ------- | --------------------------------------------- |
| \_newMaxInitializerFacetIndex | uint256 | New batch size, in number of facets per call. |

## Events

### InitializerInitialized

```solidity
event InitializerInitialized(uint256 maxInitializerFacetIndex)
```

Emitted on the first successful call to `initializeInitializer`, which seeds the initializer storage with its batch size.

#### Parameters

| Name                     | Type    | Description                                                                               |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| maxInitializerFacetIndex | uint256 | Batch size used by `setOperationalStatus` to bound the number of facets checked per call. |

### MaxInitializerFacetIndexUpdated

```solidity
event MaxInitializerFacetIndexUpdated(address sender, uint256 newMaxInitializerFacetIndex)
```

Emitted when `updateMaxInitializerFacetIndex` changes the batch size used by `setOperationalStatus`.

#### Parameters

| Name                        | Type    | Description                                   |
| --------------------------- | ------- | --------------------------------------------- |
| sender                      | address | Address that triggered the update.            |
| newMaxInitializerFacetIndex | uint256 | New batch size, in number of facets per call. |

### OperationalStatusPartialSet

```solidity
event OperationalStatusPartialSet(address sender, bytes32 configurationId, uint256 version, uint256 lastIndex)
```

Emitted by `setOperationalStatus` when only part of the facet list could be validated in the current call. Subsequent calls resume from `lastIndex`.

#### Parameters

| Name            | Type    | Description                                                             |
| --------------- | ------- | ----------------------------------------------------------------------- |
| sender          | address | Address that triggered the partial set.                                 |
| configurationId | bytes32 | Resolver-proxy configuration being validated.                           |
| version         | uint256 | Configuration version being validated.                                  |
| lastIndex       | uint256 | Index of the first facet not yet validated; the next call resumes here. |

### OperationalStatusSet

```solidity
event OperationalStatusSet(address sender, bytes32 configurationId, uint256 version)
```

Emitted by `setOperationalStatus` when every facet of the configuration version has been validated and the configuration becomes fully operational.

#### Parameters

| Name            | Type    | Description                                           |
| --------------- | ------- | ----------------------------------------------------- |
| sender          | address | Address that triggered the final set.                 |
| configurationId | bytes32 | Resolver-proxy configuration that became operational. |
| version         | uint256 | Configuration version that became operational.        |

## Errors

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

### FacetPreviousVersionNotAccepted

```solidity
error FacetPreviousVersionNotAccepted(bytes32 facetId, uint256 lastVersion, uint256[] expectedVersions)
```

Raised when an initialiser requires the facet&#39;s previously registered version to match one of an expected set and the current `lastVersion` falls outside that set.

#### Parameters

| Name             | Type      | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| facetId          | bytes32   | Identifier of the facet being upgraded.      |
| lastVersion      | uint256   | Last version currently stored for the facet. |
| expectedVersions | uint256[] | List of acceptable predecessor versions.     |

### FacetReady

```solidity
error FacetReady(bytes32 facetId, uint256 versionId)
```

Raised by `checkFacetNotReady` when a facet is already marked ready for the resolver&#39;s current version and a subsequent ready-marking attempt would be a double initialisation.

#### Parameters

| Name      | Type    | Description                                       |
| --------- | ------- | ------------------------------------------------- |
| facetId   | bytes32 | Identifier of the facet already flagged as ready. |
| versionId | uint256 | Version for which the facet is already ready.     |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### ZeroValueNotAllowed

```solidity
error ZeroValueNotAllowed()
```

Reverts when zero is supplied where a positive value is required.

_Used for shared validation of amounts, limits, factors, or identifiers._
