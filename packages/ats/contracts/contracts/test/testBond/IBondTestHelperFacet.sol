// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Bond Test Helper Facet interface
 * @notice Interface for bond-specific test helper functions
 */
interface IBondTestHelperFacet {
    /**
     * @notice Test-only helper to add a deprecated coupon ID to the internal ordered list
     * @param _couponID The coupon ID to add
     */
    function testOnlyAddDeprecatedCoupon(uint256 _couponID) external;
}
