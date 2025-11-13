// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _BOND_STORAGE_POSITION
} from '../../layer_2/constants/storagePositions.sol';
import {
    COUPON_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from '../../layer_2/constants/values.sol';
import {IBondRead} from '../../layer_2/interfaces/bond/IBondRead.sol';
import {
    IBondStorageWrapper
} from '../../layer_2/interfaces/bond/IBondStorageWrapper.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    ERC20PermitStorageWrapper
} from '../ERC1400/ERC20Permit/ERC20PermitStorageWrapper.sol';

abstract contract BondStorageWrapper is
    IBondStorageWrapper,
    ERC20PermitStorageWrapper
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct BondDataStorage {
        IBondRead.BondDetailsData bondDetail;
        bool initialized;
    }

    /**
     * @dev Modifier to ensure that the function is called only after the current maturity date.
     * @param _maturityDate The maturity date to be checked against the current maturity date.
     * Reverts with `BondMaturityDateWrong` if the provided maturity date is less than or equal
     * to the current maturity date.
     */
    modifier onlyAfterCurrentMaturityDate(uint256 _maturityDate) {
        _checkMaturityDate(_maturityDate);
        _;
    }

    function _storeBondDetails(
        IBondRead.BondDetailsData memory _bondDetails
    ) internal {
        _bondStorage().bondDetail = _bondDetails;
    }

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    )
        internal
        returns (bool success_, bytes32 corporateActionId_, uint256 couponID_)
    {
        bytes memory data = abi.encode(_newCoupon);

        (success_, corporateActionId_, couponID_) = _addCorporateAction(
            COUPON_CORPORATE_ACTION_TYPE,
            data
        );

        _initCoupon(success_, corporateActionId_, data);
    }

    function _initCoupon(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) internal {
        if (!_success) {
            revert IBondStorageWrapper.CouponCreationFailed();
        }

        IBondRead.Coupon memory newCoupon = abi.decode(
            _data,
            (IBondRead.Coupon)
        );

        _addScheduledCrossOrderedTask(
            newCoupon.recordDate,
            abi.encode(SNAPSHOT_TASK_TYPE)
        );
        _addScheduledSnapshot(newCoupon.recordDate, abi.encode(_actionId));
    }

    /**
     * @dev Internal function to set the maturity date of the bond.
     * @param _maturityDate The new maturity date to be set.
     * @return success_ True if the maturity date was set successfully.
     */
    function _setMaturityDate(
        uint256 _maturityDate
    ) internal returns (bool success_) {
        _bondStorage().bondDetail.maturityDate = _maturityDate;
        return true;
    }

    function _getBondDetails()
        internal
        view
        returns (IBondRead.BondDetailsData memory bondDetails_)
    {
        bondDetails_ = _bondStorage().bondDetail;
    }

    function _getMaturityDate() internal view returns (uint256 maturityDate_) {
        return _bondStorage().bondDetail.maturityDate;
    }

    function _getCoupon(
        uint256 _couponID
    )
        internal
        view
        returns (IBondRead.RegisteredCoupon memory registeredCoupon_)
    {
        bytes32 actionId = _corporateActionsStorage()
            .actionsByType[COUPON_CORPORATE_ACTION_TYPE]
            .at(_couponID - 1);

        (, bytes memory data) = _getCorporateAction(actionId);

        if (data.length > 0) {
            (registeredCoupon_.coupon) = abi.decode(data, (IBondRead.Coupon));
        }

        registeredCoupon_.snapshotId = _getUintResultAt(
            actionId,
            SNAPSHOT_RESULT_ID
        );
    }

    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view returns (IBondRead.CouponFor memory couponFor_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = _getCoupon(
            _couponID
        );

        couponFor_.rate = registeredCoupon.coupon.rate;
        couponFor_.rateDecimals = registeredCoupon.coupon.rateDecimals;
        couponFor_.recordDate = registeredCoupon.coupon.recordDate;
        couponFor_.executionDate = registeredCoupon.coupon.executionDate;
        couponFor_.period = registeredCoupon.coupon.period;

        if (registeredCoupon.coupon.recordDate < _blockTimestamp()) {
            couponFor_.recordDateReached = true;

            couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
                ? _getTotalBalanceOfAtSnapshot(
                    registeredCoupon.snapshotId,
                    _account
                )
                : _getTotalBalance(_account);

            couponFor_.decimals = _decimalsAdjusted();
        }
    }

    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    )
        internal
        view
        returns (IBondRead.CouponAmountFor memory couponAmountFor_)
    {
        IBondRead.CouponFor memory couponFor = _getCouponFor(
            _couponID,
            _account
        );

        if (!couponFor.recordDateReached) return couponAmountFor_;

        IBondRead.BondDetailsData memory bondDetails = _getBondDetails();

        couponAmountFor_.recordDateReached = true;

        couponAmountFor_.numerator =
            couponFor.tokenBalance *
            bondDetails.nominalValue *
            couponFor.rate *
            couponFor.period;
        couponAmountFor_.denominator =
            10 **
                (couponFor.decimals +
                    bondDetails.nominalValueDecimals +
                    couponFor.rateDecimals) *
            365 days;
    }

    function _getCouponCount() internal view returns (uint256 couponCount_) {
        return _getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = _getCoupon(
            _couponID
        );

        if (registeredCoupon.coupon.recordDate >= _blockTimestamp())
            return new address[](0);

        if (registeredCoupon.snapshotId != 0)
            return
                _tokenHoldersAt(
                    registeredCoupon.snapshotId,
                    _pageIndex,
                    _pageLength
                );

        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalCouponHolders(
        uint256 _couponID
    ) internal view returns (uint256) {
        IBondRead.RegisteredCoupon memory registeredCoupon = _getCoupon(
            _couponID
        );

        if (registeredCoupon.coupon.recordDate >= _blockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0)
            return _totalTokenHoldersAt(registeredCoupon.snapshotId);

        return _getTotalTokenHolders();
    }

    function _bondStorage()
        internal
        pure
        returns (BondDataStorage storage bondData_)
    {
        bytes32 position = _BOND_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            bondData_.slot := position
        }
    }

    function _checkMaturityDate(uint256 _maturityDate) private view {
        if (_maturityDate <= _getMaturityDate()) revert BondMaturityDateWrong();
    }
}
