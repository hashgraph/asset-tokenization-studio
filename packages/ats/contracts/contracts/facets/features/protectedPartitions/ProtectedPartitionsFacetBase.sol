// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions } from "../interfaces/protectedPartitions/IProtectedPartitions.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _PROTECTED_PARTITIONS_ROLE } from "../../../constants/roles.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";

abstract contract ProtectedPartitionsFacetBase is IProtectedPartitions, IStaticFunctionSelectors {
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

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ProtectedPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.unprotectPartitions.selector;
        staticFunctionSelectors_[selectorIndex++] = this.arePartitionsProtected.selector;
        staticFunctionSelectors_[selectorIndex++] = this.calculateRoleForPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IProtectedPartitions).interfaceId;
    }
}
