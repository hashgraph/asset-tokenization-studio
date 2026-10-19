# IFreeze

_Asset Tokenization Studio Team_

> IFreeze

Interface for freezing and unfreezing token balances and wallet addresses on a security token. Partial freezes lock a specific token amount while address freezes block all token operations for the affected wallet.

_Part of the Diamond facet system. Freeze state is stored via `ERC3643StorageWrapper`. Partial token freeze/unfreeze operations are restricted to single-partition tokens. Both `ROLE_FREEZE_MANAGER` and `ROLE_AGENT` are authorised to call all mutating functions. Freezing tokens reduces the holder&#39;s liquid balance; unfreezing restores it and emits a `Transfer` event from `address(0)`._

## Methods

### freezePartialTokens

```solidity
function freezePartialTokens(address _userAddress, uint256 _amount) external nonpayable
```

Freezes a specific amount of tokens for a wallet, reducing its liquid balance.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, a non-zero non-recovered address, and a single-partition token (`onlyWithoutMultiPartition`). Updates balance snapshots before mutating frozen state. Emits `TokensFrozen` with the default partition._

#### Parameters

| Name          | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| \_userAddress | address | The address whose tokens are to be frozen. |
| \_amount      | uint256 | The amount of tokens to freeze.            |

### getFrozenTokens

```solidity
function getFrozenTokens(address _userAddress) external view returns (uint256)
```

Returns the total amount of tokens currently frozen for a wallet.

#### Parameters

| Name          | Type    | Description           |
| ------------- | ------- | --------------------- |
| \_userAddress | address | The address to query. |

#### Returns

| Name | Type    | Description                                                             |
| ---- | ------- | ----------------------------------------------------------------------- |
| \_0  | uint256 | The total frozen token amount for `_userAddress` across all partitions. |

### initializeFreeze

```solidity
function initializeFreeze() external nonpayable
```

Initialises the freeze capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isFrozen

```solidity
function isFrozen(address _userAddress) external view returns (bool)
```

Returns the freezing status of a wallet.

_returning true mean that some token or all of them are frozen_

#### Parameters

| Name          | Type    | Description                                            |
| ------------- | ------- | ------------------------------------------------------ |
| \_userAddress | address | The address of the wallet on which isFrozen is called. |

#### Returns

| Name | Type | Description                      |
| ---- | ---- | -------------------------------- |
| \_0  | bool | The freezing status of a wallet. |

### setAddressFrozen

```solidity
function setAddressFrozen(address _userAddress, bool _freezeStatus) external nonpayable
```

Sets the address-level frozen status for a wallet, blocking or restoring all token operations for that address.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, and a non-zero non-recovered address. Not restricted to single-partition tokens. Emits `AddressFrozen`._

#### Parameters

| Name           | Type    | Description                                           |
| -------------- | ------- | ----------------------------------------------------- |
| \_userAddress  | address | The address whose frozen status is to be updated.     |
| \_freezeStatus | bool    | `true` to freeze the address, `false` to unfreeze it. |

### unfreezePartialTokens

```solidity
function unfreezePartialTokens(address _userAddress, uint256 _amount) external nonpayable
```

Unfreezes a specific amount of previously frozen tokens for a wallet, restoring them to the liquid balance.

_Requires `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`, the token to be unpaused, a non-zero non-recovered address, and a single-partition token (`onlyWithoutMultiPartition`). Validates that `_amount` does not exceed the currently frozen balance. Updates balance snapshots before mutating frozen state. Emits `TokensUnfrozen` with the default partition._

#### Parameters

| Name          | Type    | Description                                  |
| ------------- | ------- | -------------------------------------------- |
| \_userAddress | address | The address whose tokens are to be unfrozen. |
| \_amount      | uint256 | The amount of tokens to unfreeze.            |

## Events

### AddressFrozen

```solidity
event AddressFrozen(address indexed userAddress, bool indexed isFrozen, address indexed owner)
```

Emitted when a wallet&#39;s address-level frozen status changes.

#### Parameters

| Name                  | Type    | Description                                                         |
| --------------------- | ------- | ------------------------------------------------------------------- |
| userAddress `indexed` | address | The wallet address whose freeze status was updated.                 |
| isFrozen `indexed`    | bool    | The new freeze status; `true` means frozen, `false` means unfrozen. |
| owner `indexed`       | address | Address of the agent who triggered the status change.               |

### FreezeInitialized

```solidity
event FreezeInitialized()
```

Emitted once when the freeze capability is initialised on a token.

_Fires exclusively from `initializeFreeze`._

### TokensFrozen

```solidity
event TokensFrozen(address indexed account, uint256 amount, bytes32 partition)
```

Emitted when a specific amount of tokens is frozen for a wallet.

#### Parameters

| Name              | Type    | Description                                  |
| ----------------- | ------- | -------------------------------------------- |
| account `indexed` | address | The wallet address whose tokens were frozen. |
| amount            | uint256 | The amount of tokens frozen.                 |
| partition         | bytes32 | The partition from which tokens were frozen. |

### TokensUnfrozen

```solidity
event TokensUnfrozen(address indexed account, uint256 amount, bytes32 partition)
```

Emitted when a specific amount of previously frozen tokens is unfrozen for a wallet.

#### Parameters

| Name              | Type    | Description                                    |
| ----------------- | ------- | ---------------------------------------------- |
| account `indexed` | address | The wallet address whose tokens were unfrozen. |
| amount            | uint256 | The amount of tokens unfrozen.                 |
| partition         | bytes32 | The partition to which tokens were restored.   |

## Errors

### InvalidFreezeAmount

```solidity
error InvalidFreezeAmount()
```

Reverts when a partial token freeze is attempted with a zero amount.

_Checked at the start of `ERC3643StorageWrapper.freezeTokens`, the entry point for partial token freezes. Freezing zero tokens is semantically invalid and rejected early._
