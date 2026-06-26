# HoldByPartitionFacet

_Asset Tokenization Studio Team_

> HoldByPartitionFacet

Diamond facet that exposes all hold operations scoped to a specific partition through the `IHoldByPartition` interface, registered under `RESOLVER_KEY_HOLD_BY_PARTITION`.

_Inherits hold logic from `HoldByPartition` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration. Exposes nine selectors: five write operations (createHoldByPartition, createHoldFromByPartition, executeHoldByPartition, releaseHoldByPartition, reclaimHoldByPartition) and four partition-scoped read operations (getHeldAmountForByPartition, getHoldCountForByPartition, getHoldsIdForByPartition, getHoldForByPartition)._

## Methods

### createHoldByPartition

```solidity
function createHoldByPartition(bytes32 _partition, IHoldTypes.Hold _hold) external nonpayable returns (bool success_, uint256 holdId_)
```

#### Parameters

| Name        | Type            | Description |
| ----------- | --------------- | ----------- |
| \_partition | bytes32         | undefined   |
| \_hold      | IHoldTypes.Hold | undefined   |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| success\_ | bool    | undefined   |
| holdId\_  | uint256 | undefined   |

### createHoldFromByPartition

```solidity
function createHoldFromByPartition(bytes32 _partition, address _from, IHoldTypes.Hold _hold, bytes _operatorData) external nonpayable returns (bool success_, uint256 holdId_)
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

### executeHoldByPartition

```solidity
function executeHoldByPartition(IHoldTypes.HoldIdentifier _holdIdentifier, address _to, uint256 _amount) external nonpayable returns (bool success_, bytes32 partition_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |
| \_to             | address                   | undefined   |
| \_amount         | uint256                   | undefined   |

#### Returns

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| success\_   | bool    | undefined   |
| partition\_ | bytes32 | undefined   |

### getHeldAmountForByPartition

```solidity
function getHeldAmountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 amount_)
```

Returns the total amount of tokens held for a token holder on a specific partition.

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition to query.          |
| \_tokenHolder | address | The address of the token holder. |

#### Returns

| Name     | Type    | Description                                   |
| -------- | ------- | --------------------------------------------- |
| amount\_ | uint256 | The total held amount on the given partition. |

### getHoldCountForByPartition

```solidity
function getHoldCountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 holdCount_)
```

Returns the number of active holds for a token holder on a specific partition.

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition to query.          |
| \_tokenHolder | address | The address of the token holder. |

#### Returns

| Name        | Type    | Description                                 |
| ----------- | ------- | ------------------------------------------- |
| holdCount\_ | uint256 | The number of holds on the given partition. |

### getHoldForByPartition

```solidity
function getHoldForByPartition(IHoldTypes.HoldIdentifier _holdIdentifier) external view returns (uint256 amount_, uint256 expirationTimestamp_, address escrow_, address destination_, bytes data_, bytes operatorData_, enum ThirdPartyType thirdPartyType_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |

#### Returns

| Name                  | Type                | Description |
| --------------------- | ------------------- | ----------- |
| amount\_              | uint256             | undefined   |
| expirationTimestamp\_ | uint256             | undefined   |
| escrow\_              | address             | undefined   |
| destination\_         | address             | undefined   |
| data\_                | bytes               | undefined   |
| operatorData\_        | bytes               | undefined   |
| thirdPartyType\_      | enum ThirdPartyType | undefined   |

### getHoldsIdForByPartition

```solidity
function getHoldsIdForByPartition(bytes32 _partition, address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] holdsId_)
```

Returns a paginated list of hold IDs for a token holder on a specific partition.

#### Parameters

| Name          | Type    | Description                                   |
| ------------- | ------- | --------------------------------------------- |
| \_partition   | bytes32 | The partition to query.                       |
| \_tokenHolder | address | The address of the token holder.              |
| \_pageIndex   | uint256 | The zero-based index of the page to retrieve. |
| \_pageLength  | uint256 | The maximum number of hold IDs to return.     |

#### Returns

| Name      | Type      | Description                               |
| --------- | --------- | ----------------------------------------- |
| holdsId\_ | uint256[] | The array of hold IDs for the given page. |

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

### initializeHoldByPartition

```solidity
function initializeHoldByPartition() external nonpayable
```

Initialises the hold-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### reclaimHoldByPartition

```solidity
function reclaimHoldByPartition(IHoldTypes.HoldIdentifier _holdIdentifier) external nonpayable returns (bool success_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### releaseHoldByPartition

```solidity
function releaseHoldByPartition(IHoldTypes.HoldIdentifier _holdIdentifier, uint256 _amount) external nonpayable returns (bool success_)
```

#### Parameters

| Name             | Type                      | Description |
| ---------------- | ------------------------- | ----------- |
| \_holdIdentifier | IHoldTypes.HoldIdentifier | undefined   |
| \_amount         | uint256                   | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

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

### HoldByPartitionInitialized

```solidity
event HoldByPartitionInitialized()
```

Emitted once when the hold-by-partition capability is initialised on a token.

_Fires exclusively from `initializeHoldByPartition`._

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
