# ComplianceByPartitionFacet

_Asset Tokenization Studio Team_

> ComplianceByPartitionFacet

Diamond facet that exposes partition-aware transfer-eligibility and redemption checks via `IComplianceByPartition`, registered under `RESOLVER_KEY_COMPLIANCE_BY_PARTITION`.

_Exposes 2 selectors: `canTransferByPartition`, `canRedeemByPartition`._

## Methods

### canRedeemByPartition

```solidity
function canRedeemByPartition(address _from, bytes32 _partition, uint256 _value, bytes _data, bytes _operatorData) external view returns (bool, bytes1, bytes32)
```

Checks whether a redemption can be executed on a specific partition.

_Assumes that if the caller has an admin role the redemption will be performed using the associated method._

#### Parameters

| Name           | Type    | Description                                       |
| -------------- | ------- | ------------------------------------------------- |
| \_from         | address | The address whose tokens would be redeemed.       |
| \_partition    | bytes32 | The partition the redemption would happen in.     |
| \_value        | uint256 | The amount of tokens to redeem.                   |
| \_data         | bytes   | Additional data attached to the redemption check. |
| \_operatorData | bytes   | Additional data attached by the operator.         |

#### Returns

| Name | Type    | Description                                     |
| ---- | ------- | ----------------------------------------------- |
| \_0  | bool    | True when the redemption is allowed.            |
| \_1  | bytes1  | EIP-1066 status code describing the result.     |
| \_2  | bytes32 | Additional reason data tied to the status code. |

### canTransferByPartition

```solidity
function canTransferByPartition(address _from, address _to, bytes32 _partition, uint256 _value, bytes _data, bytes _operatorData) external view returns (bool, bytes1, bytes32)
```

Checks whether a transfer can be executed on a specific partition.

_Assumes that if the caller has an admin role the transfer will be performed using the associated method. For example, if msg.sender is an operator of `_to`, the transfer will be performed using `operatorTransferByPartition`. Using other methods can lead to inconsistent results._

#### Parameters

| Name           | Type    | Description                                     |
| -------------- | ------- | ----------------------------------------------- |
| \_from         | address | The sender address.                             |
| \_to           | address | The recipient address.                          |
| \_partition    | bytes32 | The partition the transfer would happen in.     |
| \_value        | uint256 | The amount of tokens to transfer.               |
| \_data         | bytes   | Additional data attached to the transfer check. |
| \_operatorData | bytes   | Additional data attached by the operator.       |

#### Returns

| Name | Type    | Description                                     |
| ---- | ------- | ----------------------------------------------- |
| \_0  | bool    | True when the transfer is allowed.              |
| \_1  | bytes1  | EIP-1066 status code describing the result.     |
| \_2  | bytes32 | Additional reason data tied to the status code. |

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

### initializeComplianceByPartition

```solidity
function initializeComplianceByPartition() external nonpayable
```

Initialises the compliance by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### ComplianceByPartitionInitialized

```solidity
event ComplianceByPartitionInitialized()
```

Emitted once when the compliance by partition capability is initialised on a token.

_Fires exclusively from `initializeComplianceByPartition`._

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
