# INonces

_Asset Tokenization Studio Team_

> INonces

Interface for querying per-account nonces used in off-chain signature schemes such as EIP-2612 permit.

_Derived from OpenZeppelin&#39;s `Nonces` interface. Each nonce is a monotonically increasing counter; it is incremented internally after a valid signed operation (e.g. permit) to invalidate replay of the same signature._

## Methods

### initializeNonces

```solidity
function initializeNonces() external nonpayable
```

Initialises the nonces capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### nonces

```solidity
function nonces(address _owner) external view returns (uint256)
```

Returns the current nonce for `owner`.

#### Parameters

| Name    | Type    | Description                     |
| ------- | ------- | ------------------------------- |
| \_owner | address | Address whose nonce is queried. |

#### Returns

| Name | Type    | Description                      |
| ---- | ------- | -------------------------------- |
| \_0  | uint256 | Current nonce value for `owner`. |

### protectedClearingCreateHoldByPartitionNonce

```solidity
function protectedClearingCreateHoldByPartitionNonce(address _owner) external view returns (uint256)
```

Returns the current nonce for `_owner` used in protected clearing partition hold creations.

_Incremented internally upon consumption of a valid signed `protectedClearingCreateHoldByPartition` operation._

#### Parameters

| Name    | Type    | Description                                                      |
| ------- | ------- | ---------------------------------------------------------------- |
| \_owner | address | Address whose clearing partition hold creation nonce is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current nonce value for `_owner`. |

### protectedClearingRedeemByPartitionNonce

```solidity
function protectedClearingRedeemByPartitionNonce(address _owner) external view returns (uint256)
```

Returns the current nonce for `_owner` used in protected clearing partition redemptions.

_Incremented internally upon consumption of a valid signed `protectedClearingRedeemByPartition` operation._

#### Parameters

| Name    | Type    | Description                                                   |
| ------- | ------- | ------------------------------------------------------------- |
| \_owner | address | Address whose clearing partition redemption nonce is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current nonce value for `_owner`. |

### protectedClearingTransferByPartitionNonce

```solidity
function protectedClearingTransferByPartitionNonce(address _owner) external view returns (uint256)
```

Returns the current nonce for `_owner` used in protected clearing partition transfers.

_Incremented internally upon consumption of a valid signed `protectedClearingTransferByPartition` operation._

#### Parameters

| Name    | Type    | Description                                                 |
| ------- | ------- | ----------------------------------------------------------- |
| \_owner | address | Address whose clearing partition transfer nonce is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current nonce value for `_owner`. |

### protectedCreateHoldByPartitionNonce

```solidity
function protectedCreateHoldByPartitionNonce(address _owner) external view returns (uint256)
```

Returns the current nonce for `_owner` used in protected partition hold creations.

_Incremented internally upon consumption of a valid signed `protectedCreateHoldByPartition` operation._

#### Parameters

| Name    | Type    | Description                                             |
| ------- | ------- | ------------------------------------------------------- |
| \_owner | address | Address whose partition hold creation nonce is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current nonce value for `_owner`. |

### protectedRedeemFromByPartitionNonce

```solidity
function protectedRedeemFromByPartitionNonce(address _owner) external view returns (uint256)
```

Returns the current nonce for `_owner` used in protected partition redemptions.

_Incremented internally upon consumption of a valid signed `protectedRedeemFromByPartition` operation._

#### Parameters

| Name    | Type    | Description                                          |
| ------- | ------- | ---------------------------------------------------- |
| \_owner | address | Address whose partition redemption nonce is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current nonce value for `_owner`. |

### protectedTransferFromByPartitionNonce

```solidity
function protectedTransferFromByPartitionNonce(address _owner) external view returns (uint256)
```

Returns the current nonce for `_owner` used in protected partition transfers.

_Incremented internally upon consumption of a valid signed `protectedTransferFromByPartition` operation._

#### Parameters

| Name    | Type    | Description                                        |
| ------- | ------- | -------------------------------------------------- |
| \_owner | address | Address whose partition transfer nonce is queried. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Current nonce value for `_owner`. |

## Events

### NoncesInitialized

```solidity
event NoncesInitialized()
```

Emitted once when the nonces capability is initialised on a token.

_Fires exclusively from `initializeNonces`._
