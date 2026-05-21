// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFixedRate, RESOLVER_KEY_FIXED_RATE } from "./IFixedRate.sol";
import { ROLE_INTEREST_RATE_MANAGER, DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

contract FixedRate is IFixedRate, Modifiers {
    function initializeFixedRate(
        FixedRateData calldata _initData
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_FIXED_RATE) {
        InterestRateStorageWrapper.setRate(_initData.rate, _initData.rateDecimals);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_FIXED_RATE);
        emit IFixedRate.FixedRateInitialized(_initData);
    }

    function setRate(
        uint256 _newRate,
        uint8 _newRateDecimals
    ) external override onlyActivated onlyUnpaused onlyRole(ROLE_INTEREST_RATE_MANAGER) {
        InterestRateStorageWrapper.setRate(_newRate, _newRateDecimals);
        emit RateUpdated(EvmAccessors.getMsgSender(), _newRate, _newRateDecimals);
    }

    function getRate() external view override returns (uint256 rate_, uint8 decimals_) {
        return InterestRateStorageWrapper.getRate();
    }
}
