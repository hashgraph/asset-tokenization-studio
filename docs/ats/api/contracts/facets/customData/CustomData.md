# CustomData

_Asset Tokenization Studio Team_

> CustomData

Abstract contract implementing arbitrary key/value custom data storage for a security token, where each key maps to an ordered list of byte payloads.

_Implements `ICustomData`. Custom data state is stored at `STORAGE_LOCATION_CUSTOM_DATA` via `CustomDataStorageWrapper`. Write access is gated by `ROLE_CUSTOM_DATA_MANAGER` and the `onlyUnpaused` modifier; reads are unrestricted. Each `setCustomData` call replaces the entire array under the key. Intended to be inherited exclusively by `CustomDataFacet`._

## Methods

### getCustomData

```solidity
function getCustomData(bytes32 _key) external view returns (bytes[] value_)
```

Returns the ordered list of byte payloads associated with `_key`.

_Returns an empty array if the key has never been set or has been cleared. Read-only; no access control._

#### Parameters

| Name  | Type    | Description                   |
| ----- | ------- | ----------------------------- |
| \_key | bytes32 | The custom data key to query. |

#### Returns

| Name    | Type    | Description                                                                        |
| ------- | ------- | ---------------------------------------------------------------------------------- |
| value\_ | bytes[] | The ordered list of byte payloads stored under `_key`, or an empty array if unset. |

### initializeCustomData

```solidity
function initializeCustomData() external nonpayable
```

Initialises the custom data capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### setCustomData

```solidity
function setCustomData(bytes32 _key, bytes[] _value) external nonpayable
```

Sets the ordered list of byte payloads associated with `_key`, replacing any previously stored value.

_Requires `ROLE_CUSTOM_DATA_MANAGER` and the token to be unpaused. Delegates persistence to `CustomDataStorageWrapper.setCustomData`, which overwrites any existing array._

#### Parameters

| Name    | Type    | Description                                                  |
| ------- | ------- | ------------------------------------------------------------ |
| \_key   | bytes32 | The custom data key under which to store the value.          |
| \_value | bytes[] | The ordered list of byte payloads to associate with the key. |

## Events

### CustomDataInitialized

```solidity
event CustomDataInitialized()
```

Emitted once when the metadata capability is initialised on a token.

_Fires exclusively from `initializeCustomData`._

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
