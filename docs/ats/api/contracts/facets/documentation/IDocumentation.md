# IDocumentation

_Hashgraph Asset Tokenization_

> IDocumentation

Interface for on-chain document management, enabling attachment, removal, and retrieval of off-chain documents referenced by a unique `bytes32` name.

_Implementing contracts are expected to gate write operations behind role-based access control and pause checks. Storage is managed via a dedicated diamond storage slot (`STORAGE_LOCATION_DOCUMENTATION`) to avoid layout collisions. All function selectors are identical to those of the former `IERC1643` interface, preserving full ABI compatibility._

## Methods

### getAllDocuments

```solidity
function getAllDocuments() external view returns (bytes32[])
```

Returns the names of all documents currently attached to the contract.

_The returned array reflects the current contents of the `docNames` storage array; ordering may change when documents are removed via swap-and-pop._

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

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### removeDocument

```solidity
function removeDocument(bytes32 _name) external nonpayable
```

Removes an existing document from the contract.

_Requires the caller to hold `ROLE_DOCUMENTER` and the token to be unpaused. Uses a swap-and-pop strategy to remove the entry from `docNames` in O(1), updating `docIndexes` accordingly. Emits {DocumentRemoved}. Reverts with {DocumentDoesNotExist} if `_name` is not registered._

#### Parameters

| Name   | Type    | Description                                            |
| ------ | ------- | ------------------------------------------------------ |
| \_name | bytes32 | Unique `bytes32` identifier of the document to remove. |

### setDocument

```solidity
function setDocument(bytes32 _name, string _uri, bytes32 _documentHash) external nonpayable
```

Attaches a new document to the contract or updates the URI and hash of an existing one.

_Requires the caller to hold `ROLE_DOCUMENTER` and the token to be unpaused. If `_name` is not yet registered, it is appended to the `docNames` array and its index is recorded in `docIndexes`. Emits {DocumentUpdated}._

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
