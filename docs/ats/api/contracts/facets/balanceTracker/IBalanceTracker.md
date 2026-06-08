# IBalanceTracker

> IBalanceTracker

Interface for querying token balances and total supply across all partitions, with support for time-adjusted values that simulate pending balance adjustments.

_All read operations resolve the current block timestamp via `EvmAccessors`, enabling deterministic results in test environments without altering production behaviour._

## Methods

### balanceOf

```solidity
function balanceOf(address _tokenHolder) external view returns (uint256)
```

Returns the total token balance of a token holder across all partitions, including locked and held amounts, simulating non-triggered balance adjustments up to the current timestamp.

#### Parameters

| Name          | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| \_tokenHolder | address | The address of the token holder |

#### Returns

| Name | Type    | Description                |
| ---- | ------- | -------------------------- |
| \_0  | uint256 | The adjusted total balance |

### getTotalBalanceFor

```solidity
function getTotalBalanceFor(address _account) external view returns (uint256)
```

Returns the total balance held by an account across all partitions, including locked tokens, held tokens and clearing amounts, simulating non-triggered adjustments up to the current timestamp.

#### Parameters

| Name      | Type    | Description                |
| --------- | ------- | -------------------------- |
| \_account | address | The address of the account |

#### Returns

| Name | Type    | Description                                |
| ---- | ------- | ------------------------------------------ |
| \_0  | uint256 | The adjusted total balance for the account |

### initializeBalanceTracker

```solidity
function initializeBalanceTracker() external nonpayable
```

Initialises the balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Returns the total token supply across all partitions, simulating non-triggered supply adjustments up to the current timestamp.

#### Returns

| Name | Type    | Description               |
| ---- | ------- | ------------------------- |
| \_0  | uint256 | The adjusted total supply |

## Events

### BalanceTrackerInitialized

```solidity
event BalanceTrackerInitialized()
```

Emitted once when the balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTracker` after the storage write succeeds._
