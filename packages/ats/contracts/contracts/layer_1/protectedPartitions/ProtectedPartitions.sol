// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../layer_0/common/Common.sol";
import { IProtectedPartitions } from "../interfaces/protectedPartitions/IProtectedPartitions.sol";
import { _CONTRACT_NAME_PROTECTEDPARTITIONS, _CONTRACT_VERSION_PROTECTEDPARTITIONS } from "../constants/values.sol";
import { _PROTECTED_PARTITIONS_ROLE } from "../constants/roles.sol";

abstract contract ProtectedPartitions is IProtectedPartitions, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProtectedPartitions(
        bool _protectPartitions
    ) external override onlyUninitialized(_protectedPartitionsStorage().initialized) returns (bool success_) {
        ProtectedPartitionsDataStorage storage protectedPartitionsStorage = _protectedPartitionsStorage();
        protectedPartitionsStorage.arePartitionsProtected = _protectPartitions;
        protectedPartitionsStorage.contractName = _CONTRACT_NAME_PROTECTEDPARTITIONS;
        protectedPartitionsStorage.contractVersion = _CONTRACT_VERSION_PROTECTEDPARTITIONS;
        protectedPartitionsStorage.initialized = true;
        success_ = true;
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
        return _getNounceFor(account);
    }

    function calculateRoleForPartition(bytes32 partition) external pure override returns (bytes32 role) {
        role = _calculateRoleForPartition(partition);
    }
}
