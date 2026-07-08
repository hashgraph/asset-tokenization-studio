# BalanceTrackerByPartitionFacet

_Asset Tokenization Studio Team_

> BalanceTrackerByPartitionFacet

Diamond facet that exposes partition-scoped token balance and total supply queries through the `IBalanceTrackerByPartition` interface, registered under `RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION`.

_Inherits balance logic from `BalanceTrackerByPartition` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration. Exposes four selectors: `initializeBalanceTrackerByPartition`, `balanceOfByPartition`, `totalSupplyByPartition`, and `getTotalBalanceForByPartition`._

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
