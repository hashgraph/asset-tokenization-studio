// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBond } from "../interfaces/bond/IBond.sol";
import { IBondRead } from "../interfaces/bond/IBondRead.sol";
import { IKyc } from "../../layer_1/interfaces/kyc/IKyc.sol";
import { Common } from "../../layer_1/common/Common.sol";
import { _CORPORATE_ACTION_ROLE, _BOND_MANAGER_ROLE, _MATURITY_REDEEMER_ROLE } from "../../layer_1/constants/roles.sol";

abstract contract Bond is IBond, Common {
    function fullRedeemAtMaturity(
        address _tokenHolder
    )
        external
        override
        onlyUnpaused
        validateAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyRole(_MATURITY_REDEEMER_ROLE)
        onlyClearingDisabled
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyAfterCurrentMaturityDate(_blockTimestamp())
    {
        bytes32[] memory partitions = _partitionsOf(_tokenHolder);
        for (uint256 i = 0; i < partitions.length; i++) {
            bytes32 partition = partitions[i];
            uint256 balance = _balanceOfByPartition(partition, _tokenHolder);
            if (balance > 0) {
                _redeemByPartition(partition, _tokenHolder, _msgSender(), balance, "", "");
            }
        }
    }

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
        validateDates(_newCoupon.recordDate, _newCoupon.executionDate)
        onlyValidTimestamp(_newCoupon.recordDate)
        returns (bool success_, uint256 couponID_)
    {
        bytes32 corporateActionID;
        (success_, corporateActionID, couponID_) = _setCoupon(_newCoupon);
        emit CouponSet(
            corporateActionID,
            couponID_,
            _msgSender(),
            _newCoupon.recordDate,
            _newCoupon.executionDate,
            _newCoupon.rate,
            _newCoupon.rateDecimals,
            _newCoupon.period
        );
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

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_bond(
        IBondRead.BondDetailsData calldata _bondDetailsData
    )
        internal
        validateDates(_bondDetailsData.startingDate, _bondDetailsData.maturityDate)
        onlyValidTimestamp(_bondDetailsData.startingDate)
    {
        BondDataStorage storage bondStorage = _bondStorage();
        bondStorage.initialized = true;
        _storeBondDetails(_bondDetailsData);
    }
}
