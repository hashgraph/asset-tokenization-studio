// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBond } from "../interfaces/bond/IBond.sol";
import { IBondRead } from "../interfaces/bond/IBondRead.sol";
import { IKyc } from "../../layer_1/interfaces/kyc/IKyc.sol";
import { Common } from "../../layer_1/common/Common.sol";
import { _CORPORATE_ACTION_ROLE, _BOND_MANAGER_ROLE, _MATURITY_REDEEMER_ROLE } from "../../layer_1/constants/roles.sol";

abstract contract Bond is IBond, Common {
    function redeemAtMaturityByPartition(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        validateAddress(_tokenHolder)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyListedAllowed(_tokenHolder)
        onlyRole(_MATURITY_REDEEMER_ROLE)
        onlyClearingDisabled
        onlyUnProtectedPartitionsOrWildCardRole
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyAfterCurrentMaturityDate(_blockTimestamp())
    {
        _redeemByPartition(_partition, _tokenHolder, _msgSender(), _amount, "", "");
    }

    function setCoupon(
        IBondRead.Coupon calldata _newCoupon
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        validateDates(_newCoupon.startDate, _newCoupon.endDate)
        validateDates(_newCoupon.recordDate, _newCoupon.executionDate)
        validateDates(_newCoupon.fixingDate, _newCoupon.executionDate)
        onlyValidTimestamp(_newCoupon.recordDate)
        onlyValidTimestamp(_newCoupon.fixingDate)
        returns (uint256 couponID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, couponID_) = _setCoupon(_newCoupon);
        emit CouponSet(corporateActionID, couponID_, _msgSender(), _newCoupon);
    }

    function updateMaturityDate(
        uint256 _newMaturityDate
    )
        external
        override
        onlyUnpaused
        onlyRole(_BOND_MANAGER_ROLE)
        onlyAfterCurrentMaturityDate(_newMaturityDate)
        returns (bool success_)
    {
        emit MaturityDateUpdated(address(this), _newMaturityDate, _getMaturityDate());
        success_ = _setMaturityDate(_newMaturityDate);
        return success_;
    }
}
