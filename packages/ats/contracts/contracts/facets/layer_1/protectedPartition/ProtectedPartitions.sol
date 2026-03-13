// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "./IProtectedPartitions.sol";
import { _PROTECTED_PARTITIONS_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";

abstract contract ProtectedPartitions is IProtectedPartitions {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(bool _protectPartitions) external override returns (bool success_) {
        if (ProtectedPartitionsStorageWrapper._isProtectedPartitionInitialized()) revert AlreadyInitialized();
        success_ = ProtectedPartitionsStorageWrapper._initialize_ProtectedPartitions(_protectPartitions);
    }

    function protectPartitions() external override returns (bool success_) {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_PROTECTED_PARTITIONS_ROLE, msg.sender);
        ProtectedPartitionsStorageWrapper._setProtectedPartitions(true);
        success_ = true;
    }

    function unprotectPartitions() external override returns (bool success_) {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_PROTECTED_PARTITIONS_ROLE, msg.sender);
        ProtectedPartitionsStorageWrapper._setProtectedPartitions(false);
        success_ = true;
    }

    function arePartitionsProtected() external view override returns (bool) {
        return ProtectedPartitionsStorageWrapper._arePartitionsProtected();
    }

    function calculateRoleForPartition(bytes32 partition) external pure override returns (bytes32 role) {
        role = ProtectedPartitionsStorageWrapper._calculateRoleForPartition(partition);
    }
}
