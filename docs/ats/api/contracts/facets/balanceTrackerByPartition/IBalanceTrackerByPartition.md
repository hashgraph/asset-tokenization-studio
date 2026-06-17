# IBalanceTrackerByPartition

_Asset Tokenization Studio Team_

> IBalanceTrackerByPartition

Interface for querying token balances and total supply scoped to a specific partition, with support for time-adjusted values that simulate pending balance adjustments.

_All read operations resolve the current block timestamp via `EvmAccessors`, enabling deterministic results in test environments without altering production behaviour._

## Methods

### balanceOfByPartition

```solidity
function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256)
```

Returns the token balance of a holder within a specific partition, simulating non-triggered balance adjustments up to the current timestamp.

#### Parameters

| Name          | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| \_partition   | bytes32 | The partition identifier        |
| \_tokenHolder | address | The address of the token holder |

#### Returns

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| \_0  | uint256 | The adjusted balance of the token holder in the partition |

### getTotalBalanceForByPartition

```solidity
function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256)
```

Returns the total balance held by an account within a specific partition, including locked tokens, held tokens, and clearing amounts, simulating non-triggered adjustments up to the current timestamp.

#### Parameters

| Name        | Type    | Description                |
| ----------- | ------- | -------------------------- |
| \_partition | bytes32 | The partition identifier   |
| \_account   | address | The address of the account |

#### Returns

| Name | Type    | Description                                                 |
| ---- | ------- | ----------------------------------------------------------- |
| \_0  | uint256 | The adjusted total balance for the account in the partition |

### initializeBalanceTrackerByPartition

```solidity
function initializeBalanceTrackerByPartition() external nonpayable
```

Initialises the partition balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### totalSupplyByPartition

```solidity
function totalSupplyByPartition(bytes32 _partition) external view returns (uint256)
```

Returns the total token supply within a specific partition, simulating non-triggered supply adjustments up to the current timestamp.

#### Parameters

| Name        | Type    | Description              |
| ----------- | ------- | ------------------------ |
| \_partition | bytes32 | The partition identifier |

#### Returns

| Name | Type    | Description                                 |
| ---- | ------- | ------------------------------------------- |
| \_0  | uint256 | The adjusted total supply for the partition |

## Events

### BalanceTrackerByPartitionInitialized

```solidity
event BalanceTrackerByPartitionInitialized()
```

Emitted once when the partition balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTrackerByPartition` after the storage write succeeds._
