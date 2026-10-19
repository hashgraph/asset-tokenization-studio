# IMaturity

_Asset Tokenization Studio Team_

> IMaturity

Interface for maturity redemption and maturity date management.

_`fullRedeemAtMaturity` and `updateMaturityDate` manage the token maturity lifecycle, registered under `RESOLVER_KEY_MATURITY`. Events: `MaturityDateUpdated`. Errors: `MaturityDateInvalid`._

## Methods

### fullRedeemAtMaturity

```solidity
function fullRedeemAtMaturity(address _tokenHolder) external nonpayable
```

Redeems all token partitions held by a token holder at maturity.

_Caller must hold `ROLE_MATURITY_REDEEMER`. Contract must be unpaused and clearing must be disabled. `_tokenHolder` must be on the allowed list, hold granted KYC status, must not be recovered, and the current timestamp must be at or past the maturity date. Iterates every partition owned by `_tokenHolder` and redeems each balance in full. Reverts with an unexpected error if any partition balance is zero.Emits {TransferByPartition} and {RedeemedByPartition} for each redeemed partition via `ERC1410StorageWrapper.redeemByPartition`, then {FullyRedeemedAtMaturity} once after every partition has been processed._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_tokenHolder | address | Address of the token holder whose partitions are to be redeemed. |

### getMaturityDate

```solidity
function getMaturityDate() external view returns (uint256 maturityDate_)
```

Returns the current token maturity date.

_Reads directly from `MaturityDateStorageWrapper` storage slot. No access-control gate — maturity date is public information._

#### Returns

| Name           | Type    | Description                                                                                         |
| -------------- | ------- | --------------------------------------------------------------------------------------------------- |
| maturityDate\_ | uint256 | Current maturity timestamp (Unix epoch, in seconds). Returns zero if the date has not been set yet. |

### initializeMaturity

```solidity
function initializeMaturity(uint256 _maturityDate) external nonpayable
```

Sets the token maturity date exactly once during deployment.

_Called by the Factory immediately after the proxy is deployed. No role gate — the one-time guard is enforced by `onlyNotMaturityInitialized`, which reverts with `AlreadyInitialized` on any subsequent call. Persists the date via `MaturityDateStorageWrapper.initializeMaturity`.Emits {MaturityInitialized} with the contract address and the maturity date._

#### Parameters

| Name           | Type    | Description                                                                                                                  |
| -------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| \_maturityDate | uint256 | Maturity timestamp to set (Unix epoch, in seconds). Must be strictly greater than zero and in the future at deployment time. |

### redeemAtMaturityByPartitionRange

```solidity
function redeemAtMaturityByPartitionRange(address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) external nonpayable
```

Redeems a bounded page of the token partitions held by a token holder at maturity.

_Caller must hold `ROLE_MATURITY_REDEEMER`. Contract must be unpaused and clearing must be disabled. `_tokenHolder` must be on the allowed list, hold granted KYC status, must not be recovered, and the current timestamp must be at or past the maturity date. Iterates only the partitions in the `[\_pageIndex _ \_pageLength, \_pageIndex _ \_pageLength + \_pageLength)`range of`\_tokenHolder`&#39;s partition list,         clamped to the actual partition count, and redeems each balance in full. Reverts         with an unexpected error if any partition in that range has a zero balance. Exists         so a holder with more partitions than fit in one block&#39;s gas limit can still be         fully redeemed across multiple calls; `fullRedeemAtMaturity`remains available         unchanged for holders within the existing gas budget.Emits {TransferByPartition} and {RedeemedByPartition} for each redeemed partition         via`ERC1410StorageWrapper.redeemByPartition`, then {RedeemedAtMaturityByPartitionRange} once after the page has been processed._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_tokenHolder | address | Address of the token holder whose partitions are to be redeemed. |
| \_pageIndex   | uint256 | Zero-based index of the page of partitions to redeem.            |
| \_pageLength  | uint256 | Number of partitions per page.                                   |

### updateMaturityDate

```solidity
function updateMaturityDate(uint256 _newMaturityDate) external nonpayable returns (bool success_)
```

Updates the token maturity date to a new timestamp.

_Caller must hold `ROLE_MATURITY_MANAGER`. Contract must be unpaused. `_newMaturityDate` must satisfy the validity constraint enforced by `onlyValidMaturityDate` — the new date must be strictly greater than the current maturity date. Persists the new date via `MaturityDateStorageWrapper.setMaturityDate`.Emits {MaturityDateUpdated} with the contract address, the new maturity date, and the previous maturity date._

#### Parameters

| Name              | Type    | Description                                             |
| ----------------- | ------- | ------------------------------------------------------- |
| \_newMaturityDate | uint256 | New maturity timestamp to set (Unix epoch, in seconds). |

#### Returns

| Name      | Type | Description                            |
| --------- | ---- | -------------------------------------- |
| success\_ | bool | Always `true` on successful execution. |

## Events

### FullyRedeemedAtMaturity

```solidity
event FullyRedeemedAtMaturity(address indexed tokenHolder)
```

Emitted once after `fullRedeemAtMaturity` has redeemed every partition held by `tokenHolder`.

#### Parameters

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| tokenHolder `indexed` | address | Token holder whose full partition list was redeemed. |

### MaturityDateUpdated

```solidity
event MaturityDateUpdated(address indexed tokenId, uint256 indexed maturityDate, uint256 indexed previousMaturityDate)
```

Emitted whenever the maturity date is updated via `updateMaturityDate`.

#### Parameters

| Name                           | Type    | Description                                        |
| ------------------------------ | ------- | -------------------------------------------------- |
| tokenId `indexed`              | address | Address of the token proxy whose date was updated. |
| maturityDate `indexed`         | uint256 | New maturity timestamp (Unix epoch, seconds).      |
| previousMaturityDate `indexed` | uint256 | Previous maturity timestamp that was replaced.     |

### MaturityInitialized

```solidity
event MaturityInitialized(uint256 indexed maturityDate)
```

Emitted once when the maturity date is set for the first time via `initializeMaturity`.

#### Parameters

| Name                   | Type    | Description                                       |
| ---------------------- | ------- | ------------------------------------------------- |
| maturityDate `indexed` | uint256 | Initial maturity timestamp (Unix epoch, seconds). |

### RedeemedAtMaturityByPartitionRange

```solidity
event RedeemedAtMaturityByPartitionRange(address indexed tokenHolder, uint256 pageIndex, uint256 pageLength)
```

Emitted once after `redeemAtMaturityByPartitionRange` has redeemed the requested page of partitions held by `tokenHolder`.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| tokenHolder `indexed` | address | Token holder whose partitions were redeemed.               |
| pageIndex             | uint256 | Zero-based index of the page that was redeemed.            |
| pageLength            | uint256 | Number of partitions per page, as requested by the caller. |

## Errors

### MaturityDateInvalid

```solidity
error MaturityDateInvalid()
```

Thrown when a maturity date fails validation.

_Reverts when a proposed maturity date is not strictly in the future at the time it is set, or when a maturity-gated action is attempted before the stored maturity date has been reached._
