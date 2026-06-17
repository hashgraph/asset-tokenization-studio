# ITransfer

_Asset Tokenization Studio Team_

> ITransferFacet

Interface grouping all standard token transfer operations: ERC-20 style and ERC-1594 data-bearing style. Also owns the `Transfer` event and the `InsufficientBalance` error that were previously declared in `IERC20`.

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

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| to     | address | Recipient address.            |
| amount | uint256 | Number of tokens to transfer. |

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

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| from   | address | Source address.               |
| to     | address | Destination address.          |
| amount | uint256 | Number of tokens to transfer. |

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
