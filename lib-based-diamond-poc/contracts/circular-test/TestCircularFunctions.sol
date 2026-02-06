// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// CIRCULAR FUNCTION DEPENDENCY TEST
//
// LibCircularA.processA(x) → calls LibCircularB.processB(x-1)
// LibCircularB.processB(x) → calls LibCircularA.processA(x-1)
//
// This is MUTUAL RECURSION!

import "./LibCircularA.sol";
import "./LibCircularB.sol";

contract TestCircularFunctions {

    // Test starting from A
    // processA(3) → processB(2) → processA(1) → processB(0) → returns 200
    function testFromA(uint256 x) external pure returns (uint256) {
        return LibCircularA.processA(x);
    }

    // Test starting from B
    // processB(3) → processA(2) → processB(1) → processA(0) → returns 100
    function testFromB(uint256 x) external pure returns (uint256) {
        return LibCircularB.processB(x);
    }

    // What happens with infinite recursion? (no base case reached)
    // This would cause OUT OF GAS at runtime!
    function testInfinite() external pure returns (uint256) {
        // If we removed the base cases, this would never terminate
        // But with base cases, it works fine
        return LibCircularA.processA(5);
    }
}
