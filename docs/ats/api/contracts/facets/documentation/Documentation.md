# Documentation

_Hashgraph Asset Tokenization_

> Documentation

Manages the lifecycle and retrieval of token-related documentation.

_Provides the abstract implementation of `IDocumentation` for diamond facets. Write operations require an operational, activated and unpaused token, and are restricted to authorised documenters. Document data is persisted through `DocumentationStorageWrapper`, while timestamps are resolved through `EvmAccessors` to support deterministic test execution._

## Methods

### getAllDocuments

```solidity
function getAllDocuments() external view returns (bytes32[])
```

Returns the names of all documents currently attached to the contract.

_The returned ordering follows storage order and may change after removals._

#### Returns

| Name | Type      | Description                        |
| ---- | --------- | ---------------------------------- |
| \_0  | bytes32[] | Array of `bytes32` document names. |

### getDocument

```solidity
function getDocument(bytes32 _name) external view returns (string, bytes32, uint256)
```

Returns the URI, content hash, and last-modified timestamp of a document.

#### Parameters

| Name   | Type    | Description                                           |
| ------ | ------- | ----------------------------------------------------- |
| \_name | bytes32 | Unique `bytes32` identifier of the document to query. |

#### Returns

| Name | Type    | Description                                                  |
| ---- | ------- | ------------------------------------------------------------ |
| \_0  | string  | Off-chain URI of the document.                               |
| \_1  | bytes32 | Keccak-256 content hash of the document.                     |
| \_2  | uint256 | Unix timestamp of the last write operation on this document. |

### initializeDocumentation

```solidity
function initializeDocumentation() external nonpayable
```

Initialises the documentation capability on the token.

_Registers this facet as ready and emits `DocumentationInitialized`._

### removeDocument

```solidity
function removeDocument(bytes32 _name) external nonpayable
```

Removes an existing document from the contract.

_Requires `DOCUMENTER_ROLE` and an existing document on an operational, activated and unpaused token. Emits `DocumentRemoved`._

#### Parameters

| Name   | Type    | Description                                            |
| ------ | ------- | ------------------------------------------------------ |
| \_name | bytes32 | Unique `bytes32` identifier of the document to remove. |

### setDocument

```solidity
function setDocument(bytes32 _name, string _uri, bytes32 _documentHash) external nonpayable
```

Attaches a new document to the contract or updates the URI and hash of an existing one.

_Requires `ROLE_DOCUMENTER`, an operational and activated token, and a non-empty name, URI and hash. Emits `DocumentUpdated`._

#### Parameters

| Name           | Type    | Description                                                     |
| -------------- | ------- | --------------------------------------------------------------- |
| \_name         | bytes32 | Unique `bytes32` identifier for the document. Must not be zero. |
| \_uri          | string  | Off-chain URI of the document. Must not be empty.               |
| \_documentHash | bytes32 | Keccak-256 content hash of the document. Must not be zero.      |

## Events

### DocumentRemoved

```solidity
event DocumentRemoved(bytes32 indexed name, string uri, bytes32 documentHash)
```

Emitted when a document is permanently removed from the contract.

#### Parameters

| Name           | Type    | Description                                          |
| -------------- | ------- | ---------------------------------------------------- |
| name `indexed` | bytes32 | Unique identifier of the document that was removed.  |
| uri            | string  | Off-chain URI that was associated with the document. |
| documentHash   | bytes32 | Content hash that was associated with the document.  |

### DocumentUpdated

```solidity
event DocumentUpdated(bytes32 indexed name, string uri, bytes32 documentHash)
```

Emitted when a document is created or its URI or hash is updated.

#### Parameters

| Name           | Type    | Description                                                |
| -------------- | ------- | ---------------------------------------------------------- |
| name `indexed` | bytes32 | Unique identifier of the document that was set or updated. |
| uri            | string  | Off-chain URI now associated with the document.            |
| documentHash   | bytes32 | Content hash now associated with the document.             |

### DocumentationInitialized

```solidity
event DocumentationInitialized()
```

Emitted once when the documentation capability is initialised on a token.

_Fires exclusively from `initializeDocumentation`._

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

### DocumentDoesNotExist

```solidity
error DocumentDoesNotExist(bytes32 name)
```

Raised when an operation targets a document name that has not been registered.

#### Parameters

| Name | Type    | Description                                           |
| ---- | ------- | ----------------------------------------------------- |
| name | bytes32 | The document name that could not be found in storage. |

### EmptyHASH

```solidity
error EmptyHASH()
```

Raised when `setDocument` is called with a zero-value document hash.

_A zero hash provides no integrity guarantee and is therefore disallowed._

### EmptyName

```solidity
error EmptyName()
```

Raised when `setDocument` is called with a zero-value document name.

_A `bytes32(0)` name is rejected to prevent silent collisions in storage._

### EmptyURI

```solidity
error EmptyURI()
```

Raised when `setDocument` is called with an empty URI string.

_An empty URI would produce an unresolvable document reference._

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
