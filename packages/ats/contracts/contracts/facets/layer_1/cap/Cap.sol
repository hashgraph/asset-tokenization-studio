// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "./ICap.sol";
import { _CAP_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract Cap is ICap, TimestampProvider, PauseStorageWrapper {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external override {
        if (CapStorageWrapper.isCapInitialized()) revert AlreadyInitialized();
        CapStorageWrapper.requireValidNewMaxSupply(maxSupply, _getBlockTimestamp());
        CapStorageWrapper.initialize_Cap(maxSupply, partitionCap);
    }

    function setMaxSupply(uint256 _maxSupply) external override onlyUnpaused returns (bool success_) {
        AccessControlStorageWrapper.checkRole(_CAP_ROLE, msg.sender);
        CapStorageWrapper.requireValidNewMaxSupply(_maxSupply, _getBlockTimestamp());
        CapStorageWrapper.setMaxSupply(_maxSupply, _getBlockTimestamp());
        success_ = true;
    }

    function setMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _maxSupply
    ) external override onlyUnpaused returns (bool success_) {
        AccessControlStorageWrapper.checkRole(_CAP_ROLE, msg.sender);
        CapStorageWrapper.requireValidNewMaxSupplyByPartition(_partition, _maxSupply, _getBlockTimestamp());
        CapStorageWrapper.setMaxSupplyByPartition(_partition, _maxSupply, _getBlockTimestamp());
        success_ = true;
    }

    function getMaxSupply() external view override returns (uint256 maxSupply_) {
        return CapStorageWrapper.getMaxSupplyAdjustedAt(_getBlockTimestamp());
    }

    function getMaxSupplyByPartition(bytes32 _partition) external view override returns (uint256 maxSupply_) {
        return CapStorageWrapper.getMaxSupplyByPartitionAdjustedAt(_partition, _getBlockTimestamp());
    }
}
