// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICoupon {
    enum RateCalculationStatus {
        PENDING,
        SET
    }

    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 startDate;
        uint256 endDate;
        uint256 fixingDate;
        uint256 rate;
        uint8 rateDecimals;
        RateCalculationStatus rateStatus;
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
        bool isDisabled;
    }

    struct CouponAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }

    event CouponSet(
        bytes32 indexed corporateActionId,
        uint256 indexed couponId,
        address indexed operator,
        Coupon coupon
    );

    event CouponCancelled(uint256 couponId, address indexed operator);

    error CouponCreationFailed();
    error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId);

    function setCoupon(Coupon calldata _newCoupon) external returns (uint256 couponID_);

    function cancelCoupon(uint256 _couponId) external returns (bool success_);

    function getCoupon(
        uint256 _couponID
    ) external view returns (RegisteredCoupon memory registeredCoupon_, bool isDisabled_);

    function getCouponFor(uint256 _couponID, address _account) external view returns (CouponFor memory couponFor_);

    function getCouponsFor(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (CouponFor[] memory couponsFor_, address[] memory accounts_);

    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view returns (CouponAmountFor memory couponAmountFor_);

    function getCouponCount() external view returns (uint256 couponCount_);

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256);

    function getCouponFromOrderedListAt(uint256 _pos) external view returns (uint256 couponID_);

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_);

    function getCouponsOrderedListTotal() external view returns (uint256 total_);
}
