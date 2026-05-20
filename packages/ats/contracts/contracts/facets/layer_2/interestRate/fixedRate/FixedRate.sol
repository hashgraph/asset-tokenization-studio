// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFixedRate } from "./IFixedRate.sol";
import { INTEREST_RATE_MANAGER_ROLE, DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { _FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

contract FixedRate is IFixedRate, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_FixedRate(
        FixedRateData calldata _initData
    ) external override onlyFacetNotRegistered(_FIXED_RATE_RESOLVER_KEY) onlyRole(DEFAULT_ADMIN_ROLE) {
        InterestRateStorageWrapper.setRate(_initData.rate, _initData.rateDecimals);
        InitializerStorageWrapper.setFacetToReady(_FIXED_RATE_RESOLVER_KEY);
        emit IFixedRate.FixedRateInitialized(EvmAccessors.getMsgSender());
    }

    function setRate(
        uint256 _newRate,
        uint8 _newRateDecimals
    ) external override onlyActivated onlyUnpaused onlyRole(INTEREST_RATE_MANAGER_ROLE) {
        InterestRateStorageWrapper.setRate(_newRate, _newRateDecimals);
        emit RateUpdated(EvmAccessors.getMsgSender(), _newRate, _newRateDecimals);
    }

    function getRate() external view override returns (uint256 rate_, uint8 decimals_) {
        return InterestRateStorageWrapper.getRate();
    }
}
