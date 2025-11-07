// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../interfaces/bond/IBondRead.sol";
import { Common } from "../../layer_1/common/Common.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../constants/values.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

abstract contract BondRead is IBondRead, IStaticFunctionSelectors, Common {
    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        return _getBondDetails();
    }

    function getCoupon(
        uint256 _couponID
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (RegisteredCoupon memory registeredCoupon_)
    {
        return _getCoupon(_couponID);
    }

    function getCouponFor(
        uint256 _couponID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1)
        returns (CouponFor memory couponFor_)
    {
        return _getCouponFor(_couponID, _account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        return _getCouponCount();
    }

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return _getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256) {
        return _getTotalCouponHolders(_couponID);
    }
}
