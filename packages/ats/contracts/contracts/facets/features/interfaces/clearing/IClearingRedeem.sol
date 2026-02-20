// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing } from "./IClearing.sol";
import { ThirdPartyType } from "../../types/ThirdPartyType.sol";

interface IClearingRedeem is IClearing {
    struct ClearingRedeemData {
        uint256 amount;
        uint256 expirationTimestamp;
        bytes data;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    event ClearedRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedRedeemFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedOperatorRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ProtectedClearedRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Creates a redeem clearing operation for a partition
     *
     * @param _clearingOperation The clearing operation details
     * @param _amount The amount to redeem
     */
    function clearingRedeemByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a redeem clearing operation for a partition from a third party
     * @dev Caller needs to have approval to transfer the tokens from the token holder
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _amount The amount to redeem
     */
    function clearingRedeemFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a redeem clearing operation for a partition from a third party
     * @dev Caller needs to be a token holder operator
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _amount The amount to redeem
     */
    function operatorClearingRedeemByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a redeem clearing operation for a partition from a third party
     * @dev Caller needs to have the procected partitions role
     *
     * @param _protectedClearingOperation The clearing operation details
     * @param _amount The amount to redeem
     * @param _signature The signature of the token holder authorizing the operation
     */
    function protectedClearingRedeemByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Gets the clearing redeem data for a given partition, token holder and clearing ID
     *
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingId The ID of the clearing operation
     *
     * @return clearingRedeemData_ The clearing reedeem data
     */
    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view returns (ClearingRedeemData memory clearingRedeemData_);
}
