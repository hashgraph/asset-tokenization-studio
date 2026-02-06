// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LibB.sol";

library LibC {
    function doC(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 300;
        return x + 3;
    }

    function callB(uint256 x) internal pure returns (uint256) {
        return LibB.doB(x);  // C calls B
    }
}
