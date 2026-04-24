// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldFacet } from "./IHoldFacet.sol";
import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { HoldStorageWrapper } from "../../domain/asset/HoldStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title Hold
 * @notice Abstract implementation of high-level hold read operations.
 * @dev Exposes read accessors that do not depend on a specific partition and reads the current
 *      block timestamp through `TimeTravelStorageWrapper` so the returned values remain
 *      consistent with partition-scoped queries under time-travel tests.
 */
abstract contract Hold is IHoldFacet {
    /// @inheritdoc IHoldFacet
    function getHeldAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return
            HoldStorageWrapper.getHeldAmountForAdjustedAt(_tokenHolder, TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /// @inheritdoc IHoldFacet
    function getHoldThirdParty(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) external view override returns (address) {
        return HoldStorageWrapper.getHoldThirdParty(_holdIdentifier);
    }
}
