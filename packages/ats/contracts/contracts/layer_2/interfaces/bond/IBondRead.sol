// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IBondRead {
    struct BondDetailsData {
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
        uint256 startingDate;
        uint256 maturityDate;
    }

    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 rate;
        uint8 rateDecimals;
        uint256 period;
    }

    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    struct CouponFor {
        uint256 tokenBalance;
        uint256 rate;
        uint8 rateDecimals;
        uint256 recordDate;
        uint256 executionDate;
        uint256 period;
        uint8 decimals;
        bool recordDateReached;
    }

    struct CouponAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }
    /**
     * @notice Retrieves the bond details
     */
    function getBondDetails()
        external
        view
        returns (BondDetailsData memory bondDetailsData_);

    /**
     * @notice Retrieves a registered coupon by its ID
     */
    function getCoupon(
        uint256 _couponID
    ) external view returns (RegisteredCoupon memory registeredCoupon_);

    /**
     * @notice Retrieves coupon information for a specific account and coupon ID
     * @dev Return value includes user balance at cupon record date
     */
    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external view returns (CouponFor memory couponFor_);

    /**
     * @notice Retrieves coupon amount numerator and denominator for a specific account and coupon ID
     */
    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view returns (CouponAmountFor memory couponAmountFor_);

    /**
     * @notice Retrieves the total number of coupons set for the bond
     * @dev Pending coupons are included in the count
     */
    function getCouponCount() external view returns (uint256 couponCount_);

    /**
     * @notice Retrieves a paginated list of coupon holders for a specific coupon ID
     */
    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Retrieves the total number of coupon holders for a specific coupon ID
     * @dev It is the list of token holders at the snapshot taken at the record date
     */
    function getTotalCouponHolders(
        uint256 _couponID
    ) external view returns (uint256);
}
