# IMaturityByPartition

_Asset Tokenization Studio Team_

> IMaturityByPartition

Interface for redeeming a specified amount of tokens from a partition at maturity.

_The caller must hold ROLE_MATURITY_REDEEMER. The contract must be unpaused and clearing disabled. The token holder must be on the allowed list with granted KYC status, must not be recovered, and the maturity date must have passed. In single-partition mode, the partition must be the default partition. In multi-partition mode, any partition is allowed._

## Methods

### initializeMaturityByPartition

```solidity
function initializeMaturityByPartition() external nonpayable
```

Initialises the maturity-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### redeemAtMaturityByPartition

```solidity
function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external nonpayable
```

Redeems a specified amount of tokens from a single partition at maturity.

_Emits a Transfer event on successful redemption via ERC1410StorageWrapper.redeemByPartition._

#### Parameters

| Name          | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| \_tokenHolder | address | Address of the token holder to redeem. |
| \_partition   | bytes32 | Partition identifier to redeem from.   |
| \_amount      | uint256 | Amount of tokens to redeem.            |

## Events

### MaturityByPartitionInitialized

```solidity
event MaturityByPartitionInitialized()
```

Emitted once when the maturity-by-partition capability is initialised on a token.

_Fires exclusively from `initializeMaturityByPartition`._
