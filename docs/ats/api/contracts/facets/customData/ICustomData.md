# ICustomData

_Asset Tokenization Studio Team_

> ICustomData

Interface for storing arbitrary key/value custom data associated with a security token, where each key maps to an ordered list of byte payloads.

_Part of the Diamond facet system. Custom data state is stored at `STORAGE_LOCATION_CUSTOM_DATA` via `CustomDataStorageWrapper`. Mutations require the `ROLE_CUSTOM_DATA_MANAGER` and the token to be unpaused; reads are unrestricted. Each call to `setCustomData` overwrites the entire array stored under the key — there is no append or partial update path. Payload encoding is opaque to the contract; producers and consumers must agree on the schema off-chain._

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

_Requires `ROLE_CUSTOM_DATA_MANAGER` and the token to be unpaused. Overwrites the entire array — there is no append semantics. Empty arrays are permitted and effectively clear the entry. Callers should be aware of gas costs proportional to the total payload size._

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
