// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// CIRCULAR IMPORTS TEST
// LibA imports LibC
// LibB imports LibA
// LibC imports LibB
// A → C → B → A (CIRCULAR!)

import "./LibA.sol";
import "./LibB.sol";
import "./LibC.sol";

contract TestCircular {
    // Test direct calls
    function testA(uint256 x) external pure returns (uint256) {
        return LibA.doA(x);
    }

    function testB(uint256 x) external pure returns (uint256) {
        return LibB.doB(x);
    }

    function testC(uint256 x) external pure returns (uint256) {
        return LibC.doC(x);
    }

    // Test cross-library calls (through the circular chain)
    function testACallsC(uint256 x) external pure returns (uint256) {
        return LibA.callC(x);  // A → C
    }

    function testBCallsA(uint256 x) external pure returns (uint256) {
        return LibB.callA(x);  // B → A
    }

    function testCCallsB(uint256 x) external pure returns (uint256) {
        return LibC.callB(x);  // C → B
    }

    // Full chain test: A → C → B → A would be infinite!
    // But we can test partial chains safely
    function testChain() external pure returns (uint256, uint256, uint256) {
        uint256 a = LibA.doA(10);      // 11
        uint256 b = LibB.callA(10);    // 11 (B calls A)
        uint256 c = LibC.callB(10);    // 12 (C calls B)
        return (a, b, c);
    }
}
