# ProtectedByPartition

_Asset Tokenization Studio Team_

> ProtectedByPartition

Abstract facet implementation for protected partition-scoped transfer and redemption operations, extracted from `ERC1410Management` as part of the MAF (Modular Asset Factory) decomposition.

_Forwards write logic to `TokenCoreOps.protectedTransferFromByPartition` and `TokenCoreOps.protectedRedeemFromByPartition`. Authorisation is enforced by a partition-specific role obtained from `ProtectedPartitionsStorageWrapper`. Storage layout is unchanged; this contract only owns the selector exposure._

## Methods

### initializeProtectedByPartition

```solidity
function initializeProtectedByPartition() external nonpayable
```

Initialises the protected-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### protectedRedeemFromByPartition

```solidity
function protectedRedeemFromByPartition(bytes32 _partition, address _from, uint256 _amount, IProtectedPartitions.ProtectionData _protectionData) external nonpayable
```

#### Parameters

| Name             | Type                                | Description |
| ---------------- | ----------------------------------- | ----------- |
| \_partition      | bytes32                             | undefined   |
| \_from           | address                             | undefined   |
| \_amount         | uint256                             | undefined   |
| \_protectionData | IProtectedPartitions.ProtectionData | undefined   |

### protectedTransferFromByPartition

```solidity
function protectedTransferFromByPartition(bytes32 _partition, address _from, address _to, uint256 _amount, IProtectedPartitions.ProtectionData _protectionData) external nonpayable returns (bytes32)
```

#### Parameters

| Name             | Type                                | Description |
| ---------------- | ----------------------------------- | ----------- |
| \_partition      | bytes32                             | undefined   |
| \_from           | address                             | undefined   |
| \_to             | address                             | undefined   |
| \_amount         | uint256                             | undefined   |
| \_protectionData | IProtectedPartitions.ProtectionData | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

## Events

### ProtectedByPartitionInitialized

```solidity
event ProtectedByPartitionInitialized()
```

Emitted once when the protected-by-partition capability is initialised on a token.

_Fires exclusively from `initializeProtectedByPartition`._

### ProtectedRedeemedByPartition

```solidity
event ProtectedRedeemedByPartition(address indexed operator, address indexed from, uint256 amount, bytes32 partition, IProtectedPartitions.ProtectionData protectionData)
```

Emitted when a protected redemption completes successfully.

#### Parameters

| Name               | Type                                | Description                                              |
| ------------------ | ----------------------------------- | -------------------------------------------------------- |
| operator `indexed` | address                             | The address that initiated the redemption (msg.sender).  |
| from `indexed`     | address                             | The token holder whose tokens are redeemed.              |
| amount             | uint256                             | The quantity of tokens redeemed.                         |
| partition          | bytes32                             | The partition from which tokens are redeemed.            |
| protectionData     | IProtectedPartitions.ProtectionData | The protection metadata used for signature verification. |

### ProtectedTransferredByPartition

```solidity
event ProtectedTransferredByPartition(address indexed operator, address indexed from, address indexed to, uint256 amount, bytes32 partition, IProtectedPartitions.ProtectionData protectionData)
```

Emitted when a protected transfer completes successfully.

#### Parameters

| Name               | Type                                | Description                                              |
| ------------------ | ----------------------------------- | -------------------------------------------------------- |
| operator `indexed` | address                             | The address that initiated the transfer (msg.sender).    |
| from `indexed`     | address                             | The token holder whose tokens are transferred.           |
| to `indexed`       | address                             | The recipient of the transferred tokens.                 |
| amount             | uint256                             | The quantity of tokens transferred.                      |
| partition          | bytes32                             | The partition from which tokens are transferred.         |
| protectionData     | IProtectedPartitions.ProtectionData | The protection metadata used for signature verification. |

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

### PartitionsAreUnProtected

```solidity
error PartitionsAreUnProtected()
```

Reverts when a protected-mode operation is attempted but partitions are not currently protected.

### ProtectedPartitionRoleRequired

```solidity
error ProtectedPartitionRoleRequired(bytes32 partition, address sender)
```

Raised when an account is not authorised for a protected partition.

_The reported sender is resolved through `EvmAccessors` for forwarding support._

#### Parameters

| Name      | Type    | Description                                          |
| --------- | ------- | ---------------------------------------------------- |
| partition | bytes32 | Partition whose access requirement is not satisfied. |
| sender    | address | Effective caller that lacks the required role.       |
