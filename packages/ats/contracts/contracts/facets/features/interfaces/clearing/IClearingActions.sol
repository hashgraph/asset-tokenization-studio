// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing } from "./IClearing.sol";

interface IClearingActions is IClearing {
    enum ClearingActionType {
        Approve,
        Cancel,
        Reclaim
    }

    event ClearingActivated(address indexed operator);
    event ClearingDeactivated(address indexed operator);

    event ClearingOperationApproved(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        IClearing.ClearingOperationType clearingOperationType,
        bytes operationData
    );

    event ClearingOperationCanceled(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        IClearing.ClearingOperationType clearingOperationType
    );

    event ClearingOperationReclaimed(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        IClearing.ClearingOperationType clearingOperationType
    );

    function initializeClearing(bool _activateClearing) external;
    function activateClearing() external returns (bool success_);
    function deactivateClearing() external returns (bool success_);
    function approveClearingOperationByPartition(IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier) external returns (bool success_, bytes32 partition_);
    function cancelClearingOperationByPartition(IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier) external returns (bool success_);
    function reclaimClearingOperationByPartition(IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier) external returns (bool success_);
    function isClearingActivated() external view returns (bool);
}
