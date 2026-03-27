// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "./IProtectedPartitions.sol";
import { _PROTECTED_PARTITIONS_ROLE } from "../../../constants/roles.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";

abstract contract ProtectedPartitions is IProtectedPartitions, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(
        bool _protectPartitions
    ) external override onlyNotProtectedPartitionInitialized returns (bool success_) {
        success_ = ProtectedPartitionsStorageWrapper.initialize_ProtectedPartitions(_protectPartitions);
    }

    function protectPartitions()
        external
        override
        onlyUnpaused
        onlyRole(_PROTECTED_PARTITIONS_ROLE)
        returns (bool success_)
    {
        ProtectedPartitionsStorageWrapper.setProtectedPartitions(true);
        success_ = true;
    }

    function unprotectPartitions()
        external
        override
        onlyUnpaused
        onlyRole(_PROTECTED_PARTITIONS_ROLE)
        returns (bool success_)
    {
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
