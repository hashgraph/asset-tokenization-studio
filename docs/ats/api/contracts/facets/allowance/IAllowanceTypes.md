# IAllowanceTypes

_Asset Tokenization Studio Team_

> IAllowanceTypes

Events and errors emitted by the ERC-20 allowance surface.

## Events

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
