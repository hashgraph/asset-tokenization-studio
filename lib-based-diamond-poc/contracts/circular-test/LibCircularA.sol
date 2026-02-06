// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LibCircularB.sol";

library LibCircularA {
    // Función que llama a LibCircularB
    function processA(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 100;  // Base case - stops recursion
        return LibCircularB.processB(x - 1);  // A calls B!
    }
}
