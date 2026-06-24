# ProtectedPartitionsFacet

_Asset Tokenization Studio Team_

> ProtectedPartitionsFacet

Diamond facet exposing the protected-partitions toggle and partition-role query declared in `IProtectedPartitions`, registered under `RESOLVER_KEY_PROTECTED_PARTITIONS`.

_Inherits the implementation from `ProtectedPartitions` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for static selector registration. Exposes 5 selectors: `initializeProtectedPartitions`, `protectPartitions`, `unprotectPartitions`, `arePartitionsProtected`, `calculateRoleForPartition`._

## Methods

### arePartitionsProtected

```solidity
function arePartitionsProtected() external view returns (bool)
```

Returns whether the protected partitions mode is active

_If true, transfers are restricted to accounts having the required role for the partition_

#### Returns

| Name | Type | Description                                                           |
| ---- | ---- | --------------------------------------------------------------------- |
| \_0  | bool | bool true if the protected partitions mode is active, false otherwise |

### calculateRoleForPartition

```solidity
function calculateRoleForPartition(bytes32 partition) external pure returns (bytes32 role)
```

Calculates the role required to transfer tokens from a given partition

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| partition | bytes32 | undefined   |

#### Returns

| Name | Type    | Description                                                   |
| ---- | ------- | ------------------------------------------------------------- |
| role | bytes32 | The role required to transfer tokens from the given partition |

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

### initializeProtectedPartitions

```solidity
function initializeProtectedPartitions(bool _protectPartitions) external nonpayable returns (bool success_)
```

Initialises the protected-partitions capability with the given starting state.

_Called once during token deployment; reverts if the facet has already been registered._

#### Parameters

| Name                | Type | Description |
| ------------------- | ---- | ----------- |
| \_protectPartitions | bool | undefined   |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | Always `true` when the call does not revert. |

### protectPartitions

```solidity
function protectPartitions() external nonpayable returns (bool success_)
```

Activates the protected partitions mode.

_Disables free token transfers; callers must hold the required role for the partition._

#### Returns

| Name      | Type | Description                                      |
| --------- | ---- | ------------------------------------------------ |
| success\_ | bool | True when activation succeeds without reverting. |

### unprotectPartitions

```solidity
function unprotectPartitions() external nonpayable returns (bool success_)
```

Deactivates the protected partitions mode.

_Re-enables free token transfers regardless of partition role._

#### Returns

| Name      | Type | Description                                        |
| --------- | ---- | -------------------------------------------------- |
| success\_ | bool | True when deactivation succeeds without reverting. |

## Events

### PartitionsProtected

```solidity
event PartitionsProtected(address indexed operator)
```

Emitted when the protected-partition mode is activated.

#### Parameters

| Name               | Type    | Description                                  |
| ------------------ | ------- | -------------------------------------------- |
| operator `indexed` | address | The address that called `protectPartitions`. |

### PartitionsUnProtected

```solidity
event PartitionsUnProtected(address indexed operator)
```

Emitted when the protected-partition mode is deactivated.

#### Parameters

| Name               | Type    | Description                                    |
| ------------------ | ------- | ---------------------------------------------- |
| operator `indexed` | address | The address that called `unprotectPartitions`. |

### ProtectedPartitionsInitialized

```solidity
event ProtectedPartitionsInitialized(bool arePartitionsProtected)
```

Emitted once when the protected partitions capability is initialised on a token.

_Fires exclusively from `initializeProtectedPartitions` after the storage write succeeds._

#### Parameters

| Name                   | Type | Description                                      |
| ---------------------- | ---- | ------------------------------------------------ |
| arePartitionsProtected | bool | Initial protection state set at deployment time. |

### ProtectedRedeemFrom

```solidity
event ProtectedRedeemFrom(bytes32 indexed partition, address indexed operator, address indexed from, uint256 value, uint256 deadline, uint256 nonce, bytes signature)
```

Emitted when a signature-authorised redemption executes under protected-partition mode.

#### Parameters

| Name                | Type    | Description                                                     |
| ------------------- | ------- | --------------------------------------------------------------- |
| partition `indexed` | bytes32 | Partition from which the tokens are redeemed.                   |
| operator `indexed`  | address | The address that submitted the protected redemption.            |
| from `indexed`      | address | The holder whose tokens are being redeemed; must be the signer. |
| value               | uint256 | Number of tokens redeemed.                                      |
| deadline            | uint256 | Signature validity deadline supplied with the operation.        |
| nonce               | uint256 | Holder nonce consumed by this operation.                        |
| signature           | bytes   | EIP-712 signature provided by the holder.                       |

### ProtectedTransferFrom

```solidity
event ProtectedTransferFrom(bytes32 indexed partition, address indexed operator, address indexed from, address to, uint256 value, uint256 deadline, uint256 nonce, bytes signature)
```

Emitted when a signature-authorised transfer executes under protected-partition mode.

#### Parameters

| Name                | Type    | Description                                                        |
| ------------------- | ------- | ------------------------------------------------------------------ |
| partition `indexed` | bytes32 | Partition from which the tokens are transferred.                   |
| operator `indexed`  | address | The address that submitted the protected transfer.                 |
| from `indexed`      | address | The holder whose tokens are being transferred; must be the signer. |
| to                  | address | Recipient of the transferred tokens.                               |
| value               | uint256 | Number of tokens transferred.                                      |
| deadline            | uint256 | Signature validity deadline supplied with the operation.           |
| nonce               | uint256 | Holder nonce consumed by this operation.                           |
| signature           | bytes   | EIP-712 signature provided by the holder.                          |

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

### PartitionsAreProtected

```solidity
error PartitionsAreProtected()
```

Reverts when an operation that requires unprotected mode is attempted while partitions are protected.

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

### PartitionsAreUnProtected

```solidity
error PartitionsAreUnProtected()
```

Reverts when a protected-mode operation is attempted but partitions are not currently protected.

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
