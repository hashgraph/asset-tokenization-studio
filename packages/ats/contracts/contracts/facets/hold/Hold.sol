// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldFacet, RESOLVER_KEY_HOLD } from "./IHoldFacet.sol";
import { IHoldTypes } from "./IHoldTypes.sol";
import { HoldStorageWrapper } from "../../domain/asset/HoldStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Hold
 * @notice Abstract implementation of high-level hold read operations.
 * @dev Exposes read accessors that do not depend on a specific partition and reads the current
 *      block timestamp through `TimeTravelStorageWrapper` so the returned values remain
 *      consistent with partition-scoped queries under time-travel tests.
 */
abstract contract Hold is IHoldFacet, Modifiers {
    /// @inheritdoc IHoldFacet
    function initializeHold() external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_HOLD) {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_HOLD);
        emit HoldInitialized();
    }

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
