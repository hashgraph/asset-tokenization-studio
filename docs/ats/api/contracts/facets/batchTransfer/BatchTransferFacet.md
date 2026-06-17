# BatchTransferFacet

_Asset Tokenization Studio Team_

> BatchTransferFacet

Diamond facet that exposes the batch transfer capability through the `IBatchTransfer` interface, registered under `RESOLVER_KEY_BATCH_TRANSFER`.

_Inherits transfer logic from `BatchTransfer` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration. Exposes one selector: `batchTransfer`._

## Methods

### batchTransfer

```solidity
function batchTransfer(address[] _toList, uint256[] _amounts) external nonpayable
```

Transfers tokens from the caller to multiple addresses in a single transaction.

_Token must be unpaused, not in multi-partition mode, clearing disabled, and the caller plus every recipient must satisfy identity and compliance checks. Delegates each transfer to `TokenCoreOps.transfer`._

#### Parameters

| Name      | Type      | Description                                                                    |
| --------- | --------- | ------------------------------------------------------------------------------ |
| \_toList  | address[] | Recipient addresses.                                                           |
| \_amounts | uint256[] | Corresponding token amounts to transfer. Must be the same length as `_toList`. |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

#### Returns

| Name | Type     | Description              |
| ---- | -------- | ------------------------ |
| \_0  | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[])
```

Gets all interfaces ids of a facet.

#### Returns

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| \_0  | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### initializeBatchTransfer

```solidity
function initializeBatchTransfer() external nonpayable
```

Initialises the batch transfer capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### BatchTransferInitialized

```solidity
event BatchTransferInitialized()
```

Emitted once when the batch transfer capability is initialised on a token.

_Fires exclusively from `initializeBatchTransfer`._

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

### InputAmountsArrayLengthMismatch

```solidity
error InputAmountsArrayLengthMismatch()
```

Thrown when the lengths of two input amount arrays do not match.

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

### PartitionsAreProtectedAndNoRole

```solidity
error PartitionsAreProtectedAndNoRole(address account, bytes32 role)
```

Reverts when a transfer is attempted while partitions are protected and the caller does not hold the required partition role.

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| account | address | The caller lacking the required role.            |
| role    | bytes32 | The role that would have been needed to proceed. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
