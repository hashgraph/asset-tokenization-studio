// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LibC.sol";

library LibA {
    function doA(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 100;
        return x + 1;
    }

    function callC(uint256 x) internal pure returns (uint256) {
        return LibC.doC(x);  // A calls C
    }
}
