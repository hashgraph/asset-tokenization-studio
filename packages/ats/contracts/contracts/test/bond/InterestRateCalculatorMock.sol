// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IInterestRateCalculator
} from '../../layer_2/interfaces/bond/IInterestRateCalculator.sol';
import {
    IBondStorageWrapper
} from '../../layer_2/interfaces/bond/IBondStorageWrapper.sol';

contract InterestRateCalculatorMock is IInterestRateCalculator {
    error InterestRateCalculatorMock_Error();

    bool private revertFlag;

    function setRevertFlag(bool _revertFlag) external {
        revertFlag = _revertFlag;
    }

    function calculateInterestRate(
        uint256 /* _recordDate */,
        uint256 _baseRate
    ) external view returns (uint256 adjustedRate_) {
        if (revertFlag) {
            revert InterestRateCalculatorMock_Error();
        }
        adjustedRate_ = _baseRate + 1;
    }
}
