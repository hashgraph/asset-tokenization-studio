# OperatorHoldByPartition

_Asset Tokenization Studio Team_

> OperatorHoldByPartition

Abstract implementation of `IOperatorHoldByPartition`.

_Delegates hold creation to `HoldOps.createHoldByPartition` (deployed orchestrator library, DELEGATECALL) tagged with `ThirdPartyType.OPERATOR`. Routing through `HoldOps` keeps the storage-wrapper chain inlined inside the deployed library rather than the facet, so the facet stays well below the EIP-170 24 KiB cap. Access guards are enforced via `Modifiers`._

## Methods

### initializeOperatorHoldByPartition

```solidity
function initializeOperatorHoldByPartition() external nonpayable
```

Initialises the operator-hold-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### operatorCreateHoldByPartition

```solidity
function operatorCreateHoldByPartition(bytes32 _partition, address _from, IHoldTypes.Hold _hold, bytes _operatorData) external nonpayable returns (bool success_, uint256 holdId_)
```

#### Parameters

| Name           | Type            | Description |
| -------------- | --------------- | ----------- |
| \_partition    | bytes32         | undefined   |
| \_from         | address         | undefined   |
| \_hold         | IHoldTypes.Hold | undefined   |
| \_operatorData | bytes           | undefined   |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| success\_ | bool    | undefined   |
| holdId\_  | uint256 | undefined   |

## Events

### ControllerHeldByPartition

```solidity
event ControllerHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a controller creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                              |
| --------------------- | --------------- | ---------------------------------------- |
| operator `indexed`    | address         | The controller initiating the hold.      |
| tokenHolder `indexed` | address         | The holder whose balance is being held.  |
| partition             | bytes32         | Partition over which the hold is placed. |
| holdId                | uint256         | Sequence id assigned to the hold.        |
| hold                  | IHoldTypes.Hold | The hold definition.                     |
| operatorData          | bytes           | Operator-supplied metadata.              |

### HeldByPartition

```solidity
event HeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a holder creates a hold over its own partitioned balance.

#### Parameters

| Name                  | Type            | Description                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------ |
| operator `indexed`    | address         | The address that initiated the hold (the holder itself).           |
| tokenHolder `indexed` | address         | The holder whose balance is being held.                            |
| partition             | bytes32         | Partition over which the hold is placed.                           |
| holdId                | uint256         | Sequence id assigned to the hold.                                  |
| hold                  | IHoldTypes.Hold | The hold definition (escrow, recipient, expiration, amount, data). |
| operatorData          | bytes           | Operator-supplied metadata.                                        |

### HeldFromByPartition

```solidity
event HeldFromByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when an authorised third party creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------ |
| operator `indexed`    | address         | The third-party caller initiating the hold.                        |
| tokenHolder `indexed` | address         | The holder whose balance is being held.                            |
| partition             | bytes32         | Partition over which the hold is placed.                           |
| holdId                | uint256         | Sequence id assigned to the hold.                                  |
| hold                  | IHoldTypes.Hold | The hold definition (escrow, recipient, expiration, amount, data). |
| operatorData          | bytes           | Operator-supplied metadata.                                        |

### HoldByPartitionExecuted

```solidity
event HoldByPartitionExecuted(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount, address to)
```

Emitted when an existing hold is executed and balance transferred to a recipient.

#### Parameters

| Name                  | Type    | Description                          |
| --------------------- | ------- | ------------------------------------ |
| tokenHolder `indexed` | address | The holder whose hold was executed.  |
| partition `indexed`   | bytes32 | Partition over which the hold lived. |
| holdId                | uint256 | Sequence id of the executed hold.    |
| amount                | uint256 | Amount released to the recipient.    |
| to                    | address | Recipient of the executed balance.   |

### HoldByPartitionReclaimed

```solidity
event HoldByPartitionReclaimed(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount)
```

Emitted when an expired hold is reclaimed by the holder.

#### Parameters

| Name                  | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| operator `indexed`    | address | The address that triggered the reclaim.                |
| tokenHolder `indexed` | address | The holder receiving the reclaimed balance.            |
| partition `indexed`   | bytes32 | Partition over which the hold lived.                   |
| holdId                | uint256 | Sequence id of the reclaimed hold.                     |
| amount                | uint256 | Amount returned to the holder&#39;s available balance. |

### HoldByPartitionReleased

```solidity
event HoldByPartitionReleased(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount)
```

Emitted when a hold is partially or fully released back to the holder.

#### Parameters

| Name                  | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| tokenHolder `indexed` | address | The holder receiving the released balance.             |
| partition `indexed`   | bytes32 | Partition over which the hold lived.                   |
| holdId                | uint256 | Sequence id of the released hold.                      |
| amount                | uint256 | Amount returned to the holder&#39;s available balance. |

### OperatorHeldByPartition

```solidity
event OperatorHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when an ERC-1410 operator creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                                  |
| --------------------- | --------------- | -------------------------------------------- |
| operator `indexed`    | address         | The authorised operator initiating the hold. |
| tokenHolder `indexed` | address         | The holder whose balance is being held.      |
| partition             | bytes32         | Partition over which the hold is placed.     |
| holdId                | uint256         | Sequence id assigned to the hold.            |
| hold                  | IHoldTypes.Hold | The hold definition.                         |
| operatorData          | bytes           | Operator-supplied metadata.                  |

### OperatorHoldByPartitionInitialized

```solidity
event OperatorHoldByPartitionInitialized()
```

Emitted once when the operator-hold-by-partition capability is initialised on a token.

_Fires exclusively from `initializeOperatorHoldByPartition`._

### ProtectedHeldByPartition

```solidity
event ProtectedHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a protected hold authorised by an EIP-712 signature is created.

#### Parameters

| Name                  | Type            | Description                                                    |
| --------------------- | --------------- | -------------------------------------------------------------- |
| operator `indexed`    | address         | The address submitting the protected hold (signature relayer). |
| tokenHolder `indexed` | address         | The holder whose balance is being held; must match the signer. |
| partition             | bytes32         | Partition over which the hold is placed.                       |
| holdId                | uint256         | Sequence id assigned to the hold.                              |
| hold                  | IHoldTypes.Hold | The hold definition.                                           |
| operatorData          | bytes           | Operator-supplied metadata.                                    |

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

### ClearingIsActivated

```solidity
error ClearingIsActivated()
```

Thrown when an administration action requires clearing to be inactive but it is currently enabled.

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

### HoldExpirationNotReached

```solidity
error HoldExpirationNotReached()
```

Reverts when a reclaim is attempted before the hold&#39;s expiration timestamp.

### HoldExpirationReached

```solidity
error HoldExpirationReached()
```

Reverts when an operation requires an unexpired hold but the hold has expired.

### InsufficientHoldBalance

```solidity
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount)
```

Reverts when the requested release amount exceeds the hold&#39;s remaining balance.

#### Parameters

| Name       | Type    | Description            |
| ---------- | ------- | ---------------------- |
| holdAmount | uint256 | The amount still held. |
| amount     | uint256 | The amount requested.  |

### InvalidDestinationAddress

```solidity
error InvalidDestinationAddress(address holdDestination, address to)
```

Reverts when the recipient supplied to {executeHoldByPartition} mismatches the hold.

#### Parameters

| Name            | Type    | Description                                 |
| --------------- | ------- | ------------------------------------------- |
| holdDestination | address | The recipient stored on the hold.           |
| to              | address | The recipient supplied to the execute call. |

### InvalidHoldAmount

```solidity
error InvalidHoldAmount()
```

Reverts when a hold is created with a zero or otherwise invalid amount.

### IsNotEscrow

```solidity
error IsNotEscrow()
```

Reverts when a caller that is not the recorded escrow attempts to execute the hold.

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### PartitionNotAllowedInSinglePartitionMode

```solidity
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition)
```

Thrown when a multi-partition operation specifies a partition not permitted in single-partition mode.

#### Parameters

| Name      | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| partition | bytes32 | The disallowed partition supplied by the caller. |

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

### Unauthorized

```solidity
error Unauthorized(address operator, address tokenHolder, bytes32 partition)
```

Thrown when the caller is not an authorised operator for the token holder on the given partition.

#### Parameters

| Name        | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| operator    | address | Address that attempted the operation.         |
| tokenHolder | address | Token holder whose tokens were targeted.      |
| partition   | bytes32 | Partition on which authorisation was checked. |

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

### WrongExpirationTimestamp

```solidity
error WrongExpirationTimestamp()
```

Reverts when an expiration timestamp is invalid.

_Used for expired, past, or otherwise unacceptable expiration values._

### WrongHoldId

```solidity
error WrongHoldId()
```

Reverts when the supplied hold id does not exist for the (partition, holder) pair.

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
