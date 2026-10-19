# Transfer

_Asset Tokenization Studio Team_

> Transfer

Implementation of the Transfer domain. Delegates into the existing storage wrappers so semantics match `ERC20` / `ERC1594` exactly.

## Methods

### initializeTransfer

```solidity
function initializeTransfer() external nonpayable
```

Initialises the transfer capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### transfer

```solidity
function transfer(address to, uint256 amount) external nonpayable returns (bool)
```

Moves `amount` tokens from the caller to `to`.

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| to     | address | undefined   |
| amount | uint256 | undefined   |

#### Returns

| Name | Type | Description                     |
| ---- | ---- | ------------------------------- |
| \_0  | bool | True if the transfer succeeded. |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 amount) external nonpayable returns (bool)
```

Moves `amount` tokens from `from` to `to` using the caller&#39;s allowance.

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| from   | address | undefined   |
| to     | address | undefined   |
| amount | uint256 | undefined   |

#### Returns

| Name | Type | Description                     |
| ---- | ---- | ------------------------------- |
| \_0  | bool | True if the transfer succeeded. |

### transferFromWithData

```solidity
function transferFromWithData(address _from, address _to, uint256 _value, bytes _data) external nonpayable
```

Transfers tokens from `_from` to `_to` with additional `_data` attached.

_Caller must have a sufficient allowance set by `_from`. Only available in single-partition mode._

#### Parameters

| Name    | Type    | Description                              |
| ------- | ------- | ---------------------------------------- |
| \_from  | address | Source address.                          |
| \_to    | address | Destination address.                     |
| \_value | uint256 | Amount of tokens to transfer.            |
| \_data  | bytes   | Arbitrary data attached to the transfer. |

### transferWithData

```solidity
function transferWithData(address _to, uint256 _value, bytes _data) external nonpayable
```

Transfers tokens to `_to` with additional `_data` attached.

_Only available in single-partition mode._

#### Parameters

| Name    | Type    | Description                              |
| ------- | ------- | ---------------------------------------- |
| \_to    | address | Recipient address.                       |
| \_value | uint256 | Amount of tokens to transfer.            |
| \_data  | bytes   | Arbitrary data attached to the transfer. |

## Events

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```

Emitted whenever tokens move between accounts, are minted, or are burned.

#### Parameters

| Name           | Type    | Description                                 |
| -------------- | ------- | ------------------------------------------- |
| from `indexed` | address | Source account (zero address on mint).      |
| to `indexed`   | address | Destination account (zero address on burn). |
| value          | uint256 | Amount of tokens transferred.               |

### TransferFromWithData

```solidity
event TransferFromWithData(address indexed sender, address indexed from, address indexed to, uint256 amount, bytes data)
```

Emitted when tokens are transferred via an allowance with an attached data payload.

#### Parameters

| Name             | Type    | Description                                                            |
| ---------------- | ------- | ---------------------------------------------------------------------- |
| sender `indexed` | address | Account that executed the transfer (typically `msg.sender`).           |
| from `indexed`   | address | Address from which tokens were debited.                                |
| to `indexed`     | address | Recipient of the transferred tokens.                                   |
| amount           | uint256 | Amount of tokens transferred, denominated in base units.               |
| data             | bytes   | Arbitrary payload supplied by the caller for off-chain interpretation. |

### TransferInitialized

```solidity
event TransferInitialized()
```

Emitted once when the transfer capability is initialised on a token.

_Fires exclusively from `initializeTransfer`._

### TransferWithData

```solidity
event TransferWithData(address indexed sender, address indexed to, uint256 amount, bytes data)
```

Emitted when tokens are transferred with an attached data payload.

#### Parameters

| Name             | Type    | Description                                                            |
| ---------------- | ------- | ---------------------------------------------------------------------- |
| sender `indexed` | address | Account that executed the transfer (typically `msg.sender`).           |
| to `indexed`     | address | Recipient of the transferred tokens.                                   |
| amount           | uint256 | Amount of tokens transferred, denominated in base units.               |
| data             | bytes   | Arbitrary payload supplied by the caller for off-chain interpretation. |

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

### InsufficientBalance

```solidity
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition)
```

Thrown when a transfer or redemption is attempted with insufficient partition balance.

#### Parameters

| Name      | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| account   | address | The account whose balance was checked. |
| balance   | uint256 | The actual balance available.          |
| value     | uint256 | The amount that was requested.         |
| partition | bytes32 | The partition that was checked.        |

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

### ZeroValue

```solidity
error ZeroValue()
```

Thrown when a zero token amount is supplied to an operation that requires a positive value.
