# ClearingReadOps

> ClearingReadOps

Clearing read operations library - deployed once and called via DELEGATECALL

_Contains read-only clearing operations with ABAF adjustments_

## Methods

### checkClearingExpirationTimestamp

```solidity
function checkClearingExpirationTimestamp(IClearingTypes.ClearingOperationIdentifier _clearingOperationIdentifier, bool _mustBeExpired, uint256) external view
```

#### Parameters

| Name                          | Type                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| \_clearingOperationIdentifier | IClearingTypes.ClearingOperationIdentifier | undefined   |
| \_mustBeExpired               | bool                                       | undefined   |
| \_2                           | uint256                                    | undefined   |

### checkClearingValidExpirationTimestamp

```solidity
function checkClearingValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) external pure
```

Validate that a clearing expiration timestamp is in the future

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| \_expirationTimestamp | uint256 | undefined   |
| \_blockTimestamp      | uint256 | undefined   |

### getClearedAmountForAdjustedAt

```solidity
function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256)
```

Get cleared amount for token holder adjusted at timestamp

_Uses ABAF factor to adjust the cleared amount for balance adjustments_

#### Parameters

| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| \_tokenHolder | address | undefined   |
| \_timestamp   | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### getClearedAmountForByPartitionAdjustedAt

```solidity
function getClearedAmountForByPartitionAdjustedAt(bytes32 _partition, address _tokenHolder, uint256 _timestamp) external view returns (uint256)
```

Get cleared amount by partition adjusted at timestamp

_Uses ABAF factor to adjust the cleared amount for balance adjustments_

#### Parameters

| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| \_partition   | bytes32 | undefined   |
| \_tokenHolder | address | undefined   |
| \_timestamp   | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### getClearingHoldCreationForByPartitionAdjustedAt

```solidity
function getClearingHoldCreationForByPartitionAdjustedAt(bytes32 _partition, address _tokenHolder, uint256 _clearingId, uint256 _timestamp) external view returns (struct IClearingTypes.ClearingHoldCreationData clearingHoldCreationData_)
```

Get clearing hold creation data by partition adjusted at timestamp

_Returns hold creation data with ABAF-adjusted amount_

#### Parameters

| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| \_partition   | bytes32 | undefined   |
| \_tokenHolder | address | undefined   |
| \_clearingId  | uint256 | undefined   |
| \_timestamp   | uint256 | undefined   |

#### Returns

| Name                       | Type                                    | Description |
| -------------------------- | --------------------------------------- | ----------- |
| clearingHoldCreationData\_ | IClearingTypes.ClearingHoldCreationData | undefined   |

### getClearingRedeemForByPartitionAdjustedAt

```solidity
function getClearingRedeemForByPartitionAdjustedAt(bytes32 _partition, address _tokenHolder, uint256 _clearingId, uint256 _timestamp) external view returns (struct IClearingTypes.ClearingRedeemData clearingRedeemData_)
```

Get clearing redeem data by partition adjusted at timestamp

_Returns redeem data with ABAF-adjusted amount_

#### Parameters

| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| \_partition   | bytes32 | undefined   |
| \_tokenHolder | address | undefined   |
| \_clearingId  | uint256 | undefined   |
| \_timestamp   | uint256 | undefined   |

#### Returns

| Name                 | Type                              | Description |
| -------------------- | --------------------------------- | ----------- |
| clearingRedeemData\_ | IClearingTypes.ClearingRedeemData | undefined   |

### getClearingTransferForByPartitionAdjustedAt

```solidity
function getClearingTransferForByPartitionAdjustedAt(bytes32 _partition, address _tokenHolder, uint256 _clearingId, uint256 _timestamp) external view returns (struct IClearingTypes.ClearingTransferData clearingTransferData_)
```

Get clearing transfer data by partition adjusted at timestamp

_Returns transfer data with ABAF-adjusted amount_

#### Parameters

| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| \_partition   | bytes32 | undefined   |
| \_tokenHolder | address | undefined   |
| \_clearingId  | uint256 | undefined   |
| \_timestamp   | uint256 | undefined   |

#### Returns

| Name                   | Type                                | Description |
| ---------------------- | ----------------------------------- | ----------- |
| clearingTransferData\_ | IClearingTypes.ClearingTransferData | undefined   |

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
