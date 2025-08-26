// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IInterestRateCalculator
} from '../../layer_2/interfaces/bond/IInterestRateCalculator.sol';

contract InterestRateCalculatorMock is IInterestRateCalculator {
    function calculateInterestRate(
        uint256 /* _recordDate */,
        uint256 _baseRate
    ) external pure returns (uint256 adjustedRate_) {
        adjustedRate_ = _baseRate + 1;
    }
}
