# ClearingReadOps

_Asset Tokenization Studio Team_

> ClearingReadOps

Clearing read operations library - deployed once and called via DELEGATECALL

_Contains read-only clearing operations with ABAF adjustments_

## Methods

### checkClearingExpirationTimestamp

```solidity
function checkClearingExpirationTimestamp(IClearingTypes.ClearingOperationIdentifier _clearingOperationIdentifier, bool _mustBeExpired, uint256 _blockTimestamp) external view
```

#### Parameters

| Name                          | Type                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| \_clearingOperationIdentifier | IClearingTypes.ClearingOperationIdentifier | undefined   |
| \_mustBeExpired               | bool                                       | undefined   |
| \_blockTimestamp              | uint256                                    | undefined   |

### checkClearingValidExpirationTimestamp

```solidity
function checkClearingValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) external pure
```

Reverts when `_expirationTimestamp` is not strictly in the future relative to `_blockTimestamp`.

#### Parameters

| Name                  | Type    | Description                                          |
| --------------------- | ------- | ---------------------------------------------------- |
| \_expirationTimestamp | uint256 | Expiration timestamp supplied by the caller.         |
| \_blockTimestamp      | uint256 | Current block timestamp used as the reference point. |

### getClearedAmountForAdjustedAt

```solidity
function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256)
```

Returns the cleared amount for a token holder, scaled by the ABAF factor at the given timestamp.

_Uses ABAF factor to adjust the cleared amount for balance adjustments._

#### Parameters

| Name          | Type    | Description                                                |
| ------------- | ------- | ---------------------------------------------------------- |
| \_tokenHolder | address | Holder whose cleared amount is being queried.              |
| \_timestamp   | uint256 | Reference timestamp for the adjustment-factor calculation. |

#### Returns

| Name | Type    | Description                              |
| ---- | ------- | ---------------------------------------- |
| \_0  | uint256 | Adjusted cleared amount at `_timestamp`. |

### getClearedAmountForByPartitionAdjustedAt

```solidity
function getClearedAmountForByPartitionAdjustedAt(bytes32 _partition, address _tokenHolder, uint256 _timestamp) external view returns (uint256)
```

Returns the cleared amount for a token holder on a specific partition, scaled by the ABAF factor at the given timestamp.

_Uses ABAF factor to adjust the cleared amount for balance adjustments._

#### Parameters

| Name          | Type    | Description                                                |
| ------------- | ------- | ---------------------------------------------------------- |
| \_partition   | bytes32 | Partition being queried.                                   |
| \_tokenHolder | address | Holder whose partition cleared amount is being queried.    |
| \_timestamp   | uint256 | Reference timestamp for the adjustment-factor calculation. |

#### Returns

| Name | Type    | Description                                        |
| ---- | ------- | -------------------------------------------------- |
| \_0  | uint256 | Adjusted partition cleared amount at `_timestamp`. |

### getClearingHoldCreationForByPartitionAdjustedAt

```solidity
function getClearingHoldCreationForByPartitionAdjustedAt(bytes32 _partition, address _tokenHolder, uint256 _clearingId, uint256 _timestamp) external view returns (struct IClearingTypes.ClearingHoldCreationData clearingHoldCreationData_)
```

Returns clearing hold-creation data for a specific operation, with the stored amount scaled by the ABAF factor at the given timestamp.

_Returns hold creation data with ABAF-adjusted amount._

#### Parameters

| Name          | Type    | Description                                                |
| ------------- | ------- | ---------------------------------------------------------- |
| \_partition   | bytes32 | Partition of the clearing operation.                       |
| \_tokenHolder | address | Holder who initiated the clearing hold creation.           |
| \_clearingId  | uint256 | Identifier of the clearing operation.                      |
| \_timestamp   | uint256 | Reference timestamp for the adjustment-factor calculation. |

#### Returns

| Name                       | Type                                    | Description                                                    |
| -------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| clearingHoldCreationData\_ | IClearingTypes.ClearingHoldCreationData | Hold-creation record with the amount adjusted to `_timestamp`. |

### getClearingRedeemForByPartitionAdjustedAt

```solidity
function getClearingRedeemForByPartitionAdjustedAt(bytes32 _partition, address _tokenHolder, uint256 _clearingId, uint256 _timestamp) external view returns (struct IClearingTypes.ClearingRedeemData clearingRedeemData_)
```

Returns clearing redeem data for a specific operation, with the stored amount scaled by the ABAF factor at the given timestamp.

_Returns redeem data with ABAF-adjusted amount._

#### Parameters

| Name          | Type    | Description                                                |
| ------------- | ------- | ---------------------------------------------------------- |
| \_partition   | bytes32 | Partition of the clearing operation.                       |
| \_tokenHolder | address | Holder who initiated the clearing redeem.                  |
| \_clearingId  | uint256 | Identifier of the clearing operation.                      |
| \_timestamp   | uint256 | Reference timestamp for the adjustment-factor calculation. |

#### Returns

| Name                 | Type                              | Description                                             |
| -------------------- | --------------------------------- | ------------------------------------------------------- |
| clearingRedeemData\_ | IClearingTypes.ClearingRedeemData | Redeem record with the amount adjusted to `_timestamp`. |

### getClearingTransferForByPartitionAdjustedAt

```solidity
function getClearingTransferForByPartitionAdjustedAt(bytes32 _partition, address _tokenHolder, uint256 _clearingId, uint256 _timestamp) external view returns (struct IClearingTypes.ClearingTransferData clearingTransferData_)
```

Returns clearing transfer data for a specific operation, with the stored amount scaled by the ABAF factor at the given timestamp.

_Returns transfer data with ABAF-adjusted amount._

#### Parameters

| Name          | Type    | Description                                                |
| ------------- | ------- | ---------------------------------------------------------- |
| \_partition   | bytes32 | Partition of the clearing operation.                       |
| \_tokenHolder | address | Holder who initiated the clearing transfer.                |
| \_clearingId  | uint256 | Identifier of the clearing operation.                      |
| \_timestamp   | uint256 | Reference timestamp for the adjustment-factor calculation. |

#### Returns

| Name                   | Type                                | Description                                               |
| ---------------------- | ----------------------------------- | --------------------------------------------------------- |
| clearingTransferData\_ | IClearingTypes.ClearingTransferData | Transfer record with the amount adjusted to `_timestamp`. |

## Errors

### ExpirationDateNotReached

```solidity
error ExpirationDateNotReached()
```

Thrown when an action requires the clearing operation to have expired (e.g., a reclaim attempt) but the expiration timestamp has not yet passed.

### ExpirationDateReached

```solidity
error ExpirationDateReached()
```

Thrown when an action requires the clearing operation to still be within its validity window but its expiration timestamp has already passed.

### WrongExpirationTimestamp

```solidity
error WrongExpirationTimestamp()
```

Reverts when an expiration timestamp is invalid.

_Used for expired, past, or otherwise unacceptable expiration values._
