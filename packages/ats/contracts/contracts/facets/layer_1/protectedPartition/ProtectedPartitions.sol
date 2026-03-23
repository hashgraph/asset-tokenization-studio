// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "./IProtectedPartitions.sol";
import { _PROTECTED_PARTITIONS_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { AccessControlModifiers } from "../../../infrastructure/utils/AccessControlModifiers.sol";
import { PauseModifiers } from "../../../domain/core/PauseModifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { PartitionModifiers } from "../../../infrastructure/utils/PartitionModifiers.sol";

abstract contract ProtectedPartitions is
    IProtectedPartitions,
    AccessControlModifiers,
    PauseModifiers,
    PartitionModifiers
{
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(bool _protectPartitions) external override returns (bool success_) {
        if (ProtectedPartitionsStorageWrapper.isProtectedPartitionInitialized()) revert AlreadyInitialized();
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
