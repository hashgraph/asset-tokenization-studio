// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "./ICap.sol";
import { CAP_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

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
        CapStorageWrapper.initialize_Cap(maxSupply, partitionCap);
    }

    function setMaxSupply(
        uint256 maxSupply
    )
        external
        override
        onlyUnpaused
        onlyRole(CAP_ROLE)
        onlyValidNewMaxSupply(maxSupply, TimeTravelStorageWrapper.getBlockTimestamp())
        returns (bool success_)
    {
        CapStorageWrapper.setMaxSupply(maxSupply, TimeTravelStorageWrapper.getBlockTimestamp());
        success_ = true;
    }

    function getMaxSupply() external view override returns (uint256 maxSupply_) {
        return CapStorageWrapper.getMaxSupplyAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }
}
