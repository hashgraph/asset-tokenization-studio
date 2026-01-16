// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "contracts/layer_0/Internals.sol";
import { IProtectedPartitions } from "../interfaces/protectedPartitions/IProtectedPartitions.sol";
import { _PROTECTED_PARTITIONS_ROLE } from "../constants/roles.sol";

abstract contract ProtectedPartitions is IProtectedPartitions, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(
        bool _protectPartitions
    ) external override onlyUninitialized(_isProtectedPartitionInitialized()) returns (bool success_) {
        _initialize_ProtectedPartitions(_protectPartitions);
    }

    function protectPartitions()
        external
        override
        onlyUnpaused
        onlyRole(_PROTECTED_PARTITIONS_ROLE)
        returns (bool success_)
    {
        _setProtectedPartitions(true);
        success_ = true;
    }

    function unprotectPartitions()
        external
        override
        onlyUnpaused
        onlyRole(_PROTECTED_PARTITIONS_ROLE)
        returns (bool success_)
    {
        _setProtectedPartitions(false);
        success_ = true;
    }

    function arePartitionsProtected() external view override returns (bool) {
        return _arePartitionsProtected();
    }

    function getNounceFor(address account) external view override returns (uint256) {
        return _getNonceFor(account);
    }

    function calculateRoleForPartition(bytes32 partition) external pure override returns (bytes32 role) {
        role = _calculateRoleForPartition(partition);
    }
}
