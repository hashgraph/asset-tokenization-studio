# IAllowance

_Asset Tokenization Studio Team_

> IAllowance

Consolidated interface for the ERC-20 allowance domain: granting, reading and atomically adjusting spender allowances.

## Methods

### allowance

```solidity
function allowance(address _owner, address _spender) external view returns (uint256)
```

Returns the remaining amount `spender` may spend on behalf of `owner` via a downstream `transferFrom`-style call.

_Zero by default. Updated by {approve}, {increaseAllowance}, {decreaseAllowance} and by any consuming transfer operation. The returned value is time-travel adjusted at the current block timestamp on the implementing facet._

#### Parameters

| Name      | Type    | Description                                          |
| --------- | ------- | ---------------------------------------------------- |
| \_owner   | address | Address that granted the allowance.                  |
| \_spender | address | Address authorised to spend on `owner`&#39;s behalf. |

#### Returns

| Name | Type    | Description                                                 |
| ---- | ------- | ----------------------------------------------------------- |
| \_0  | uint256 | Remaining allowance of `spender` over `owner`&#39;s tokens. |

### approve

```solidity
function approve(address _spender, uint256 _value) external nonpayable returns (bool)
```

Sets `value` as the allowance of `spender` over the caller&#39;s tokens.

_Overwrites any previously-granted allowance. Known race: moving a non-zero allowance directly to another non-zero value lets `spender` spend both the old and the new amount via unfortunate transaction ordering — see EIP-20 discussion https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729. Prefer {increaseAllowance}/{decreaseAllowance}, or reset to zero before setting a new value. Emits {IAllowanceTypes.Approval} with the resulting allowance._

#### Parameters

| Name      | Type    | Description                                             |
| --------- | ------- | ------------------------------------------------------- |
| \_spender | address | Address authorised to spend on the caller&#39;s behalf. |
| \_value   | uint256 | Absolute allowance amount to grant.                     |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### decreaseAllowance

```solidity
function decreaseAllowance(address _spender, uint256 _subtractedValue) external nonpayable returns (bool)
```

Atomically decreases the allowance granted to `spender` by the caller.

_Preferred alternative to {approve} as it avoids the read-modify-write allowance race. Reverts with {IAllowanceTypes.SpenderWithZeroAddress} when `spender` is the zero address, or with {IAllowanceTypes.InsufficientAllowance} when the current allowance is below `subtractedValue`. Emits {IAllowanceTypes.Approval} with the resulting allowance._

#### Parameters

| Name              | Type    | Description                                    |
| ----------------- | ------- | ---------------------------------------------- |
| \_spender         | address | Address whose allowance is being decreased.    |
| \_subtractedValue | uint256 | Amount subtracted from the existing allowance. |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### increaseAllowance

```solidity
function increaseAllowance(address _spender, uint256 _addedValue) external nonpayable returns (bool)
```

Atomically increases the allowance granted to `spender` by the caller.

_Preferred alternative to {approve} as it avoids the read-modify-write allowance race. Reverts with {IAllowanceTypes.SpenderWithZeroAddress} when `spender` is the zero address. Emits {IAllowanceTypes.Approval} with the resulting allowance._

#### Parameters

| Name         | Type    | Description                                 |
| ------------ | ------- | ------------------------------------------- |
| \_spender    | address | Address whose allowance is being increased. |
| \_addedValue | uint256 | Amount added to the existing allowance.     |

#### Returns

| Name | Type | Description                                              |
| ---- | ---- | -------------------------------------------------------- |
| \_0  | bool | Boolean flag indicating whether the operation succeeded. |

### initializeAllowance

```solidity
function initializeAllowance() external nonpayable
```

Initialises the allowance capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### AllowanceInitialized

```solidity
event AllowanceInitialized()
```

Emitted once when the allowance capability is initialised on a token.

_Fires exclusively from `initializeAllowance` after the storage write succeeds._

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```

Emitted when `owner` authorises `spender` to spend up to `value` tokens on their behalf, whether via {IAllowance.approve}, {IAllowance.increaseAllowance} or {IAllowance.decreaseAllowance}.

_Mirrors the ERC-20 `Approval` event. `value` is the resulting, absolute allowance after the update — not the delta applied._

#### Parameters

| Name              | Type    | Description                                                        |
| ----------------- | ------- | ------------------------------------------------------------------ |
| owner `indexed`   | address | Address whose tokens may be spent.                                 |
| spender `indexed` | address | Address authorised to spend on `owner`&#39;s behalf.               |
| value             | uint256 | Allowance of `spender` over `owner`&#39;s tokens after the update. |

## Errors

### InsufficientAllowance

```solidity
error InsufficientAllowance(address spender, address from)
```

Reverts when `spender` attempts to consume more allowance than `from` has granted.

_Raised by `transferFrom`-style flows and by {IAllowance.decreaseAllowance} when the subtracted amount exceeds the current allowance._

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| spender | address | Address attempting to spend on behalf of `from`. |
| from    | address | Address whose allowance is being consumed.       |

### SpenderWithZeroAddress

```solidity
error SpenderWithZeroAddress()
```

Reverts when the zero address is supplied as `spender` in an allowance update.

### ZeroOwnerAddress

```solidity
error ZeroOwnerAddress()
```

Reverts when an allowance operation references the zero address as the owner.

_Defensive guard against mis-wired flows or malformed calldata reaching the underlying storage wrappers._
