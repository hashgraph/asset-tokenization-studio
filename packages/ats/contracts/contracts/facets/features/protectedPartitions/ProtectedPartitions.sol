// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "../interfaces/IProtectedPartitions.sol";
import { _PROTECTED_PARTITIONS_ROLE } from "../../../constants/roles.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";

abstract contract ProtectedPartitions is IProtectedPartitions {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(bool _protectPartitions) external override returns (bool success_) {
        if (LibProtectedPartitions.isProtectedPartitionInitialized()) revert AlreadyInitialized();
        LibProtectedPartitions.initializeProtectedPartitions(_protectPartitions);
        success_ = true;
    }

    function protectPartitions() external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_PROTECTED_PARTITIONS_ROLE);
        LibProtectedPartitions.setProtectedPartitions(true);
        success_ = true;
    }

    function unprotectPartitions() external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_PROTECTED_PARTITIONS_ROLE);
        LibProtectedPartitions.setProtectedPartitions(false);
        success_ = true;
    }

    function arePartitionsProtected() external view override returns (bool) {
        return LibProtectedPartitions.arePartitionsProtected();
    }

    function calculateRoleForPartition(bytes32 partition) external pure override returns (bytes32 role) {
        role = LibProtectedPartitions.calculateRoleForPartition(partition);
    }
}
