// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldBase } from "../hold/IHoldBase.sol";
import { IClearing } from "./IClearing.sol";
import { ThirdPartyType } from "../../types/ThirdPartyType.sol";

interface IClearingHoldCreation is IClearing, IHoldBase {
    struct ClearingHoldCreationData {
        uint256 amount;
        uint256 expirationTimestamp;
        bytes data;
        address holdEscrow;
        uint256 holdExpirationTimestamp;
        address holdTo;
        bytes holdData;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    event ClearedHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldBase.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedHoldFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldBase.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ClearedOperatorHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldBase.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    event ProtectedClearedHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldBase.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Creates a hold for a clearing operation by partition
     *
     * @param _clearingOperation The clearing operation details
     * @param _hold The hold details
     */
    function clearingCreateHoldByPartition(
        ClearingOperation calldata _clearingOperation,
        IHoldBase.Hold calldata _hold
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a hold for a clearing operation by partition from a third party
     * @dev Caller needs to have approval to transfer the tokens from the token holder
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _hold The hold details
     */
    function clearingCreateHoldFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        IHoldBase.Hold calldata _hold
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a hold for a clearing operation by partition from a third party
     * @dev Caller needs to be a token holder operator
     *
     * @param _clearingOperationFrom The clearing operation details
     * @param _hold The hold details
     */
    function operatorClearingCreateHoldByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        IHoldBase.Hold calldata _hold
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Creates a hold for a clearing operation by partition from a third party
     * @dev Can only be called by the protected partitions role
     *
     * @param _protectedClearingOperation The clearing operation details
     * @param _hold The hold details
     * @param _signature The signature of the token holder authorizing the operation
     */
    function protectedClearingCreateHoldByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldBase.Hold calldata _hold,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_);

    /**
     * @notice Gets the clearing hold creation data for a given partition, token holder and clearing ID
     *
     * @param _partition The partition of the token
     * @param _tokenHolder The address of the token holder
     * @param _clearingId The ID of the clearing operation
     *
     * @return clearingHoldCreationData_ The clearing hold creation data
     */
    function getClearingCreateHoldForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view returns (ClearingHoldCreationData memory clearingHoldCreationData_);
}
