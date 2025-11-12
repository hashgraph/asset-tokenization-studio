// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _BOND_STORAGE_POSITION
} from '../../layer_2/constants/storagePositions.sol';
import {
    COUPON_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from '../constants/values.sol';
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
import {LibCommon} from '../common/libraries/LibCommon.sol';

abstract contract BondStorageWrapper is
    IBondStorageWrapper,
    ERC20PermitStorageWrapper
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct BondDataStorage {
        IBondRead.BondDetailsData bondDetail;
        bool initialized;
        uint256[] counponsOrderedListByIds;
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

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_bond(
        IBondRead.BondDetailsData calldata _bondDetailsData
    )
        internal
        validateDates(
            _bondDetailsData.startingDate,
            _bondDetailsData.maturityDate
        )
        onlyValidTimestamp(_bondDetailsData.startingDate)
    {
        BondDataStorage storage bondStorage = _bondStorage();
        bondStorage.initialized = true;
        _storeBondDetails(_bondDetailsData);
    }

    function _storeBondDetails(
        IBondRead.BondDetailsData memory _bondDetails
    ) internal {
        _bondStorage().bondDetail = _bondDetails;
    }

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual returns (bytes32 corporateActionId_, uint256 couponID_) {
        bytes memory data = abi.encode(_newCoupon);

        (corporateActionId_, couponID_) = _addCorporateAction(
            COUPON_CORPORATE_ACTION_TYPE,
            data
        );

        _initCoupon(corporateActionId_, _newCoupon);
    }

    function _initCoupon(
        bytes32 _actionId,
        IBondRead.Coupon memory _newCoupon
    ) internal virtual {
        if (_actionId == bytes32(0)) {
            revert IBondStorageWrapper.CouponCreationFailed();
        }

        _addScheduledCrossOrderedTask(
            _newCoupon.recordDate,
            abi.encode(SNAPSHOT_TASK_TYPE)
        );
        _addScheduledSnapshot(_newCoupon.recordDate, abi.encode(_actionId));
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

    function _addToCouponsOrderedList(
        uint256 _couponID
    ) internal virtual override {
        _bondStorage().counponsOrderedListByIds.push(_couponID);
    }

    function _getCouponFromOrderedListAt(
        uint256 _pos
    ) internal view returns (uint256 couponID_) {
        if (_pos >= _getCouponsOrderedListTotalAdjusted()) return 0;

        uint256 actualOrderedListLengthTotal = _getCouponsOrderedListTotal();

        if (_pos < actualOrderedListLengthTotal)
            return _bondStorage().counponsOrderedListByIds[_pos];

        uint256 pendingIndexOffset = _pos - actualOrderedListLengthTotal;

        uint256 index = _getScheduledCouponListingCount() -
            1 -
            pendingIndexOffset;

        return _getScheduledCouponListingIdAtIndex(index);
    }

    function _getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory couponIDs_) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(
            _pageIndex,
            _pageLength
        );

        couponIDs_ = new uint256[](
            LibCommon.getSize(start, end, _getCouponsOrderedListTotalAdjusted())
        );

        for (uint256 i = 0; i < couponIDs_.length; i++) {
            couponIDs_[i] = _getCouponFromOrderedListAt(start + i);
        }
    }

    function _getCouponsOrderedListTotalAdjusted()
        internal
        view
        returns (uint256 total_)
    {
        return
            _getCouponsOrderedListTotal() +
            _getPendingScheduledCouponListingTotalAt(_blockTimestamp());
    }

    function _getCouponsOrderedListTotal()
        internal
        view
        override
        returns (uint256 total_)
    {
        return _bondStorage().counponsOrderedListByIds.length;
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
        bytes32 actionId = _corporateActionsStorage().actionsByType[
            COUPON_CORPORATE_ACTION_TYPE
        ][_couponID - 1];

        (, , bytes memory data) = _getCorporateAction(actionId);

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
    ) internal view virtual returns (IBondRead.CouponFor memory couponFor_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = _getCoupon(
            _couponID
        );

        couponFor_.coupon = registeredCoupon.coupon;

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
