// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";

contract DecimalsLibMock {
    function calculateDecimalsAdjustment(
        uint256 _amount,
        uint8 _decimals,
        uint8 _newDecimals
    ) external pure returns (uint256) {
        return DecimalsLib.calculateDecimalsAdjustment(_amount, _decimals, _newDecimals);
    }
}
