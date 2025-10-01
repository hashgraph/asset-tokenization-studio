// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../../../layer_1/common/Common.sol';
import {
    IFixedRate
} from '../../interfaces/interestRates/fixedRate/IFixedRate.sol';
import {_INTEREST_RATE_MANAGER_ROLE} from '../../constants/roles.sol';

contract FixedRate is IFixedRate, Common {
    function initialize_FixedRate(
        uint256 _initialRate,
        uint8 _initialRateDecimals
    ) external override onlyUninitialized(_erc1410BasicStorage().initialized) {
        _setRate(_initialRate, _initialRateDecimals);
        _fixedRateStorage().initialized = true;
    }

    function setRate(
        uint256 _newRate,
        uint8 _newRateDecimals
    ) external override onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyUnpaused {
        _setRate(_newRate, _newRateDecimals);
        emit RateUpdated(_msgSender(), _newRate, _newRateDecimals);
    }

    function getRate()
        external
        view
        override
        returns (uint256 rate_, uint8 decimals_)
    {
        return _getRate();
    }
}
