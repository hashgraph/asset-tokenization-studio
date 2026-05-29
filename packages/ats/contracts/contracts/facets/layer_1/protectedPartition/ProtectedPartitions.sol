// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions, RESOLVER_KEY_PROTECTED_PARTITIONS } from "./IProtectedPartitions.sol";
import { ROLE_PROTECTED_PARTITIONS, DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";

abstract contract ProtectedPartitions is IProtectedPartitions, Modifiers {
    /// @inheritdoc IProtectedPartitions
    function initializeProtectedPartitions(
        bool _protectPartitions
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_PROTECTED_PARTITIONS)
        returns (bool success_)
    {
        success_ = ProtectedPartitionsStorageWrapper.initializeProtectedPartitions(_protectPartitions);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PROTECTED_PARTITIONS);
        emit IProtectedPartitions.ProtectedPartitionsInitialized(_protectPartitions);
    }

    /// @inheritdoc IProtectedPartitions
    function protectPartitions()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PROTECTED_PARTITIONS)
        returns (bool success_)
    {
        ProtectedPartitionsStorageWrapper.setProtectedPartitions(true);
        success_ = true;
    }

    /// @inheritdoc IProtectedPartitions
    function unprotectPartitions()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PROTECTED_PARTITIONS)
        returns (bool success_)
    {
        ProtectedPartitionsStorageWrapper.setProtectedPartitions(false);
        success_ = true;
    }

    /// @inheritdoc IProtectedPartitions
    function arePartitionsProtected() external view override returns (bool) {
        return ProtectedPartitionsStorageWrapper.arePartitionsProtected();
    }

    /// @inheritdoc IProtectedPartitions
    function calculateRoleForPartition(bytes32 partition) external pure override returns (bytes32 role) {
        role = ProtectedPartitionsStorageWrapper.calculateRoleForPartition(partition);
    }
}
