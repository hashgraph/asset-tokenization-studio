# IBurnByPartition

_Asset Tokenization Studio Team_

> IBurnByPartition

Interface for the partition-aware token redemption entry point of the ATS Diamond.

_Exposes `redeemByPartition` which follows the ERC-1410 standard for redeeming (burning) tokens from a specific partition. The operation decreases the total supply and the partition supply and emits the `RedeemedByPartition` event._

## Methods

### initializeBurnByPartition

```solidity
function initializeBurnByPartition() external nonpayable
```

Initialises the burn by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### redeemByPartition

```solidity
function redeemByPartition(bytes32 _partition, uint256 _value, bytes _data) external nonpayable
```

Decreases totalSupply and the corresponding amount of the specified partition of msg.sender

_Only callable when not paused. In single-partition mode only the default partition is accepted. The caller must pass redemption authorization checks for the given partition and amount._

#### Parameters

| Name        | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| \_partition | bytes32 | The partition from which to redeem tokens  |
| \_value     | uint256 | The amount of tokens to redeem             |
| \_data      | bytes   | Additional data attached to the redemption |

## Events

### BurnByPartitionInitialized

```solidity
event BurnByPartitionInitialized()
```

Emitted once when the burn by partition capability is initialised on a token.

_Fires exclusively from `initializeBurnByPartition`._
