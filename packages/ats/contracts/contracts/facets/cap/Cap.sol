// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "./ICap.sol";
import { CAP_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title Cap
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing maximum supply management for a security token, both
 *         globally and per partition.
 * @dev Implements `ICap`. Cap state is stored at `_CAP_STORAGE_POSITION` via
 *      `CapStorageWrapper`. All timestamp-sensitive operations delegate to
 *      `TimeTravelStorageWrapper.getBlockTimestamp()` so the same code path is exercisable in
 *      test environments. `setMaxSupply` and `getMaxSupply` use the adjusted supply
 *      (`AdjustBalancesStorageWrapper`) to account for pending scheduled balance adjustments.
 *      Intended to be inherited exclusively by `CapFacet`.
 */
abstract contract Cap is ICap, Modifiers {
    /// @inheritdoc ICap
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

    /// @inheritdoc ICap
    /// @dev Requires the token to be unpaused and `CAP_ROLE`. Cap validation and event emission
    ///      are handled inside `CapStorageWrapper.setMaxSupply`.
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

    /// @inheritdoc ICap
    function getMaxSupply() external view override returns (uint256 maxSupply_) {
        return CapStorageWrapper.getMaxSupplyAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }
}
