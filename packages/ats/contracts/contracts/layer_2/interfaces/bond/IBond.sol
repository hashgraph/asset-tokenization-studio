// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {IBondRead} from './IBondRead.sol';
interface IBond {
    /**
     * @notice Redeems a specified amount of bonds at maturity from a token holder from a specific partition
     * @param _tokenHolder The address of the token holder redeeming the bonds.
     * @param _partition The partition from which the bonds are being redeemed.
     * @param _amount The amount of bonds to be redeemed.
     */
    function redeemAtMaturityByPartition(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _amount
    ) external;

    /**
     * @notice Sets a new coupon for the bond
     * @param _newCoupon The new coupon to be set
     */
    function setCoupon(
        IBondRead.Coupon calldata _newCoupon
    ) external returns (bool success_, uint256 couponID_);

    /**
     * @notice Updates the maturity date of the bond.
     * @param _maturityDate The new maturity date to be set.
     */
    function updateMaturityDate(
        uint256 _maturityDate
    ) external returns (bool success_);
}
