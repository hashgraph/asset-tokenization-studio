// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFixedRate, RESOLVER_KEY_FIXED_RATE } from "./IFixedRate.sol";
import { ROLE_INTEREST_RATE_MANAGER, DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Fixed Rate
 * @notice Manages a fixed interest rate and its decimal precision for an asset.
 * @dev Uses shared storage wrappers and lifecycle modifiers to initialise and update the rate.
 * @author Hashgraph
 */
contract FixedRate is IFixedRate, Modifiers {
    /// @inheritdoc IFixedRate
    /// @dev Registers the fixed-rate facet as ready after storing the initial rate configuration.
    function initializeFixedRate(
        FixedRateData calldata _initData
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_FIXED_RATE) {
        InterestRateStorageWrapper.setRate(_initData.rate, _initData.rateDecimals);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_FIXED_RATE);
        emit IFixedRate.FixedRateInitialized(_initData);
    }

    /// @inheritdoc IFixedRate
    /// @dev Requires an operational, activated, unpaused asset and the interest rate manager role.
    function setRate(
        uint256 _newRate,
        uint8 _newRateDecimals
    ) external override onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_INTEREST_RATE_MANAGER) {
        InterestRateStorageWrapper.setRate(_newRate, _newRateDecimals);
        emit RateUpdated(EvmAccessors.getMsgSender(), _newRate, _newRateDecimals);
    }

    /// @inheritdoc IFixedRate
    function getRate() external view override returns (uint256 rate_, uint8 decimals_) {
        return InterestRateStorageWrapper.getRate();
    }
}
