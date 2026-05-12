// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "./IProtectedPartitions.sol";
import { PROTECTED_PARTITIONS_ROLE, DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { _PROTECTED_PARTITIONS_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

abstract contract ProtectedPartitions is IProtectedPartitions, Modifiers {
    function initializeProtectedPartitions(
        bool _protectPartitions
    )
        external
        override
        onlyFacetNotRegistered(_PROTECTED_PARTITIONS_RESOLVER_KEY)
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bool success_)
    {
        success_ = ProtectedPartitionsStorageWrapper.initialize_ProtectedPartitions(_protectPartitions);
        InitializerStorageWrapper.setFacetToReady(_PROTECTED_PARTITIONS_RESOLVER_KEY);
    }

    /// @inheritdoc IProtectedPartitions
    function reinitializeProtectedPartitions(
        uint256[] calldata fromVersions
    )
        external
        override
        onlyFacetRegistered(_PROTECTED_PARTITIONS_RESOLVER_KEY, fromVersions)
        onlyFacetNotReady(_PROTECTED_PARTITIONS_RESOLVER_KEY)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        InitializerStorageWrapper.setFacetToReady(_PROTECTED_PARTITIONS_RESOLVER_KEY);
    }

    function protectPartitions()
        external
        override
        onlyUnpaused
        onlyRole(PROTECTED_PARTITIONS_ROLE)
        returns (bool success_)
    {
        ProtectedPartitionsStorageWrapper.setProtectedPartitions(true);
        success_ = true;
    }

    function unprotectPartitions()
        external
        override
        onlyUnpaused
        onlyRole(PROTECTED_PARTITIONS_ROLE)
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
