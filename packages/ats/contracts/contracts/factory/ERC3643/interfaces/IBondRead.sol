// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface TRexIBondRead {
    enum InterestRateTypes {
        FIXED_FOR_ALL_COUPONS,
        FIXED_PER_COUPON,
        KPI_BASED_PER_COUPON
    }

    struct BondDetailsData {
        bytes3 currency;
        uint256 nominalValue;
        uint256 startingDate;
        uint256 maturityDate;
    }

    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 startDate;
        uint256 endDate;
        uint256 fixingDate;
        uint256 rate;
        uint8 rateDecimals;
    }

    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    struct CouponFor {
        uint256 tokenBalance;
        uint8 decimals;
        bool recordDateReached;
        Coupon coupon;
    }
    /**
     * @notice Retrieves the bond details
     */
    function getBondDetails()
        external
        view
        returns (BondDetailsData memory bondDetailsData_);

    function getInterestRateType()
        external
        view
        returns (InterestRateTypes interestRateType_);

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

    function getCouponFromOrderedListAt(
        uint256 _pos
    ) external view returns (uint256 couponID_);

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_);

    function getCouponsOrderedListTotal()
        external
        view
        returns (uint256 total_);
}
