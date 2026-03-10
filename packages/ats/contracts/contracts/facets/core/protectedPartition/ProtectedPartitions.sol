// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "../protectedPartition/IProtectedPartitions.sol";
import { _PROTECTED_PARTITIONS_ROLE } from "../../../constants/roles.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";

abstract contract ProtectedPartitions is IProtectedPartitions {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(bool _protectPartitions) external override returns (bool success_) {
        if (ProtectedPartitionsStorageWrapper.isProtectedPartitionInitialized()) revert AlreadyInitialized();
        ProtectedPartitionsStorageWrapper.initializeProtectedPartitions(_protectPartitions);
        success_ = true;
    }

    function protectPartitions() external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_PROTECTED_PARTITIONS_ROLE);
        ProtectedPartitionsStorageWrapper.setProtectedPartitions(true);
        success_ = true;
    }

    function unprotectPartitions() external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_PROTECTED_PARTITIONS_ROLE);
        ProtectedPartitionsStorageWrapper.setProtectedPartitions(false);
        success_ = true;
    }

    function arePartitionsProtected() external view override returns (bool) {
        return ProtectedPartitionsStorageWrapper.arePartitionsProtected();
    }

    function calculateRoleForPartition(bytes32 partition) external pure override returns (bytes32 role) {
        role = ProtectedPartitionsStorageWrapper.calculateRoleForPartition(partition);
    }
}
