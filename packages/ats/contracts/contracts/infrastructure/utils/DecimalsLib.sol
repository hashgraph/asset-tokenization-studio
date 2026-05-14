// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../errors/ICommonErrors.sol";

library DecimalsLib {
    function calculateDecimalsAdjustment(
        uint256 _amount,
        uint8 _decimals,
        uint8 _newDecimals
    ) internal pure returns (uint256 newAmount_) {
        if (_decimals == _newDecimals) return _amount;

        if (_decimals > _newDecimals) {
            uint8 diff = _decimals - _newDecimals;
            if (diff >= 78) revert ICommonErrors.DecimalDifferenceTooLarge(_newDecimals, _decimals);
            return _amount / (10 ** diff);
        }
        uint8 diff = _newDecimals - _decimals;
        if (diff >= 78) revert ICommonErrors.DecimalDifferenceTooLarge(_decimals, _newDecimals);
        return _amount * (10 ** diff);
    }
}
