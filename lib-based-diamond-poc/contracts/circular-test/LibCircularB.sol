// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LibCircularA.sol";

library LibCircularB {
    // Función que llama a LibCircularA - CIRCULAR!
    function processB(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 200;  // Base case - stops recursion
        return LibCircularA.processA(x - 1);  // B calls A!
    }
}
