// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "./IBondRead.sol";
interface IBond {
    // Events from IERC1410 that are emitted by this facet
    event RedeemedByPartition(
        bytes32 indexed partition,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data
    );

    /**
     * @notice Emitted when a coupon is created or updated for a bond or corporate action.
     * @param corporateActionId Unique identifier grouping related corporate actions or coupons.
     * @param couponId Identifier of the created or updated coupon.
     * @param operator Address that performed the operation.
     * @param coupon Coupon struct containing recordDate, executionDate, rate, and period.
     */
    event CouponSet(bytes32 corporateActionId, uint256 couponId, address indexed operator, IBondRead.Coupon coupon);

    event MaturityDateUpdated(
        address indexed bondId,
        uint256 indexed maturityDate,
        uint256 indexed previousMaturityDate
    );

    /**
     * @notice Coupon creation failed due to an internal failure.
     */
    error CouponCreationFailed();

    /**
     * @notice Provided maturity date is invalid (e.g. in the past or before issuance).
     */
    error BondMaturityDateWrong();

    /**
     * @notice Redeems all bonds at maturity from a token holder (all partitions considered)
     * @param _tokenHolder The address of the token holder redeeming the bonds.
     */
    function fullRedeemAtMaturity(address _tokenHolder) external;

    /**
     * @notice Redeems a specified amount of bonds at maturity from a token holder from a specific partition
     * @param _tokenHolder The address of the token holder redeeming the bonds.
     * @param _partition The partition from which the bonds are being redeemed.
     * @param _amount The amount of bonds to be redeemed.
     */
    function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external;

    /**
     * @notice Sets a new coupon for the bond
     * @param _newCoupon The new coupon to be set
     */
    function setCoupon(IBondRead.Coupon calldata _newCoupon) external returns (uint256 couponID_);

    /**
     * @notice Updates the maturity date of the bond.
     * @param _maturityDate The new maturity date to be set.
     */
    function updateMaturityDate(uint256 _maturityDate) external returns (bool success_);
}