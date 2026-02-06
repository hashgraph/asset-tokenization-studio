// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LibA.sol";

library LibB {
    function doB(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 200;
        return x + 2;
    }

    function callA(uint256 x) internal pure returns (uint256) {
        return LibA.doA(x);  // B calls A
    }
}
