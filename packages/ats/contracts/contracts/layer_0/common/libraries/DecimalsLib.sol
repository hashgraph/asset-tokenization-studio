// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

library DecimalsLib {
    function calculateDecimalsAdjustment(
        uint256 _amount,
        uint8 _decimals,
        uint8 _newDecimals
    ) internal pure returns (uint256 newAmount_) {
        if (_decimals == _newDecimals) return _amount;

        if (_decimals > _newDecimals) {
            return _amount / (10 ** (_decimals - _newDecimals));
        } else {
            return _amount * (10 ** (_newDecimals - _decimals));
        }
    }
}
