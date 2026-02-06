// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/circular-test/TestCircularFunctions.sol";

contract CircularFunctionsTest is Test {
    TestCircularFunctions testContract;

    function setUp() public {
        testContract = new TestCircularFunctions();
    }

    // Test mutual recursion: A → B → A → B → ... until base case
    function test_mutualRecursion_fromA() public view {
        // processA(4) → processB(3) → processA(2) → processB(1) → processA(0) → 100
        uint256 result = testContract.testFromA(4);
        assertEq(result, 100);  // Ends at A's base case
    }

    function test_mutualRecursion_fromB() public view {
        // processB(4) → processA(3) → processB(2) → processA(1) → processB(0) → 200
        uint256 result = testContract.testFromB(4);
        assertEq(result, 200);  // Ends at B's base case
    }

    function test_mutualRecursion_fromA_odd() public view {
        // processA(3) → processB(2) → processA(1) → processB(0) → 200
        uint256 result = testContract.testFromA(3);
        assertEq(result, 200);  // Ends at B's base case (odd depth)
    }

    function test_mutualRecursion_fromB_odd() public view {
        // processB(3) → processA(2) → processB(1) → processA(0) → 100
        uint256 result = testContract.testFromB(3);
        assertEq(result, 100);  // Ends at A's base case (odd depth)
    }

    // Deep recursion still works (with enough gas)
    function test_deepRecursion() public view {
        uint256 result = testContract.testFromA(100);
        // 100 levels of mutual recursion - works fine!
        assertTrue(result == 100 || result == 200);
    }
}
