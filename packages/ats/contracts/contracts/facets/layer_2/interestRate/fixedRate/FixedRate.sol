// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFixedRate } from "./IFixedRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";

contract FixedRate is IFixedRate {
    error AlreadyInitialized();
    // solhint-disable-next-line func-name-mixedcase
    function initialize_FixedRate(FixedRateData calldata _initData) external override {
        if (InterestRateStorageWrapper._fixedRateStorage().initialized) revert AlreadyInitialized();
        InterestRateStorageWrapper._setRate(_initData.rate, _initData.rateDecimals);
        InterestRateStorageWrapper._fixedRateStorage().initialized = true;
    }

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external override {
        AccessControlStorageWrapper._checkRole(_INTEREST_RATE_MANAGER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        InterestRateStorageWrapper._setRate(_newRate, _newRateDecimals);
        emit RateUpdated(msg.sender, _newRate, _newRateDecimals);
    }

    function getRate() external view override returns (uint256 rate_, uint8 decimals_) {
        return InterestRateStorageWrapper._getRate();
    }
}
