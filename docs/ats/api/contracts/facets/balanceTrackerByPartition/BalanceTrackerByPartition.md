# BalanceTrackerByPartition

_Asset Tokenization Studio Team_

> BalanceTrackerByPartition

Abstract implementation of `IBalanceTrackerByPartition` that consolidates partition-scoped token balance and total supply queries into a single, time-aware read layer.

_Delegates all storage reads to `ERC1410StorageWrapper` and `ERC3643StorageWrapper`, passing the resolved timestamp from `EvmAccessors` to support non-triggered adjustment simulation. Intended to be inherited by `BalanceTrackerByPartitionFacet`._

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

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
