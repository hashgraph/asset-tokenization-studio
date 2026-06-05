# IProtectedByPartition

_Asset Tokenization Studio Team_

> IProtectedByPartition

Interface for protected partition-scoped redemption and transfer operations, gated by a per-partition role and off-chain signature verification.

_Single-tier interface with events declared inline. No separate types interface; uses `IProtectedPartitions.ProtectionData` for cross-facet consistency._

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
