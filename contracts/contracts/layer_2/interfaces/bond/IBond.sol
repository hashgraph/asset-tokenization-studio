// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IBond {
    struct BondDetailsData {
        bytes3 currency;
        uint256 nominalValue;
        uint256 startingDate;
        uint256 maturityDate;
    }

    struct CouponDetailsData {
        uint256 couponFrequency;
        uint256 couponRate;
        uint256 firstCouponDate;
    }

    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 rate;
    }

    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    struct CouponFor {
        uint256 tokenBalance;
        uint256 rate;
        uint256 recordDate;
        uint256 executionDate;
        bool recordDateReached;
    }

    function getBondDetails()
        external
        view
        returns (BondDetailsData memory bondDetailsData_);

    function setCoupon(
        Coupon calldata _newCoupon
    ) external returns (bool success_, uint256 couponID_);

    function getCouponDetails()
        external
        view
        returns (CouponDetailsData memory couponDetails_);

    function getCoupon(
        uint256 _couponID
    ) external view returns (RegisteredCoupon memory registeredCoupon_);

    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external view returns (CouponFor memory couponFor_);

    function getCouponCount() external view returns (uint256 couponCount_);
}
