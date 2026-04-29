// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICapByPartition } from "./ICapByPartition.sol";
import { CAP_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title CapByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `ICapByPartition` providing per-partition maximum supply
 *         cap management.
 * @dev Delegates persistence to {CapStorageWrapper} and resolves the active timestamp via
 *      {TimeTravelStorageWrapper}. The setter is gated by `onlyUnpaused`, `onlyRole(CAP_ROLE)`
 *      and `onlyValidNewMaxSupplyByPartition`; the latter enforces the partition-vs-global
 *      relationship and rejects values below the partition's adjusted total supply. Intended
 *      to be inherited by `CapByPartitionFacet`.
 */
abstract contract CapByPartition is ICapByPartition, Modifiers {
    /// @inheritdoc ICapByPartition
    function setMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _maxSupply
    )
        external
        override
        onlyUnpaused
        onlyRole(CAP_ROLE)
        onlyValidNewMaxSupplyByPartition(_partition, _maxSupply, TimeTravelStorageWrapper.getBlockTimestamp())
        returns (bool success_)
    {
        CapStorageWrapper.setMaxSupplyByPartition(_partition, _maxSupply, TimeTravelStorageWrapper.getBlockTimestamp());
        success_ = true;
    }

    /// @inheritdoc ICapByPartition
    function getMaxSupplyByPartition(bytes32 _partition) external view override returns (uint256 maxSupply_) {
        return
            CapStorageWrapper.getMaxSupplyByPartitionAdjustedAt(
                _partition,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
