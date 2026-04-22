// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "./ICap.sol";
import { _CAP_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

abstract contract Cap is ICap, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(
        uint256 maxSupply,
        PartitionCap[] calldata partitionCap
    )
        external
        override
        onlyNotCapInitialized
        onlyValidNewMaxSupply(maxSupply, TimeTravelStorageWrapper.getBlockTimestamp())
    {
        CapStorageWrapper.initializeCap(maxSupply, partitionCap);
    }

    function setMaxSupply(
        uint256 maxSupply
    )
        external
        override
        onlyUnpaused
        onlyRole(_CAP_ROLE)
        onlyValidNewMaxSupply(maxSupply, TimeTravelStorageWrapper.getBlockTimestamp())
        returns (bool success_)
    {
        CapStorageWrapper.setMaxSupply(maxSupply, TimeTravelStorageWrapper.getBlockTimestamp());
        success_ = true;
    }

    function setMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _maxSupply
    )
        external
        override
        onlyUnpaused
        onlyRole(_CAP_ROLE)
        onlyValidNewMaxSupplyByPartition(_partition, _maxSupply, TimeTravelStorageWrapper.getBlockTimestamp())
        returns (bool success_)
    {
        CapStorageWrapper.setMaxSupplyByPartition(_partition, _maxSupply, TimeTravelStorageWrapper.getBlockTimestamp());
        success_ = true;
    }

    function getMaxSupply() external view override returns (uint256 maxSupply_) {
        return CapStorageWrapper.getMaxSupplyAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    function getMaxSupplyByPartition(bytes32 _partition) external view override returns (uint256 maxSupply_) {
        return
            CapStorageWrapper.getMaxSupplyByPartitionAdjustedAt(
                _partition,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
