// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_STORAGE_POSITION } from "../../layer_2/constants/storagePositions.sol";
import { COUPON_CORPORATE_ACTION_TYPE, SNAPSHOT_RESULT_ID, SNAPSHOT_TASK_TYPE } from "../constants/values.sol";
import { IBondRead } from "../../layer_2/interfaces/bond/IBondRead.sol";
import { IBondStorageWrapper } from "../../layer_2/interfaces/bond/IBondStorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ERC20PermitStorageWrapper } from "../ERC1400/ERC20Permit/ERC20PermitStorageWrapper.sol";
import { LibCommon } from "../common/libraries/LibCommon.sol";

abstract contract BondStorageWrapper is IBondStorageWrapper, ERC20PermitStorageWrapper {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct BondDataStorage {
        bytes3 currency;
        uint256 nominalValue;
        uint256 startingDate;
        uint256 maturityDate;
        bool initialized;
        uint8 nominalValueDecimals;
        uint256[] couponsOrderedListByIds;
    }

    /**
     * @dev Modifier to ensure that the function is called only after the current maturity date.
     * @param _maturityDate The maturity date to be checked against the current maturity date.
     * Reverts with `BondMaturityDateWrong` if the provided maturity date is less than or equal
     * to the current maturity date.
     */
    modifier onlyAfterCurrentMaturityDate(uint256 _maturityDate) override {
        _checkMaturityDate(_maturityDate);
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_bond(
        IBondRead.BondDetailsData calldata _bondDetailsData
    )
        internal
        override
        validateDates(_bondDetailsData.startingDate, _bondDetailsData.maturityDate)
        onlyValidTimestamp(_bondDetailsData.startingDate)
    {
        BondDataStorage storage bondStorage = _bondStorage();
        bondStorage.initialized = true;
        _storeBondDetails(_bondDetailsData);
    }

    function _storeBondDetails(IBondRead.BondDetailsData memory _bondDetails) internal override {
        _bondStorage().currency = _bondDetails.currency;
        _bondStorage().nominalValue = _bondDetails.nominalValue;
        _bondStorage().nominalValueDecimals = _bondDetails.nominalValueDecimals;
        _bondStorage().startingDate = _bondDetails.startingDate;
        _bondStorage().maturityDate = _bondDetails.maturityDate;
    }

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override returns (bytes32 corporateActionId_, uint256 couponID_) {
        bytes memory data = abi.encode(_newCoupon);

        (corporateActionId_, couponID_) = _addCorporateAction(COUPON_CORPORATE_ACTION_TYPE, data);

        _initCoupon(corporateActionId_, _newCoupon);

        emit CouponSet(corporateActionId_, couponID_, _msgSender(), _newCoupon);
    }

    function _initCoupon(bytes32 _actionId, IBondRead.Coupon memory _newCoupon) internal virtual override {
        if (_actionId == bytes32(0)) {
            revert IBondStorageWrapper.CouponCreationFailed();
        }

        _addScheduledCrossOrderedTask(_newCoupon.recordDate, SNAPSHOT_TASK_TYPE);
        _addScheduledSnapshot(_newCoupon.recordDate, _actionId);
    }

    /**
     * @dev Internal function to set the maturity date of the bond.
     * @param _maturityDate The new maturity date to be set.
     * @return success_ True if the maturity date was set successfully.
     */
    function _setMaturityDate(uint256 _maturityDate) internal override returns (bool success_) {
        _bondStorage().maturityDate = _maturityDate;
        return true;
    }

    function _addToCouponsOrderedList(uint256 _couponID) internal virtual override {
        _bondStorage().couponsOrderedListByIds.push(_couponID);
    }

    function _updateCouponRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon,
        uint256 _rate,
        uint8 _rateDecimals
    ) internal virtual override {
        bytes32 actionId = _getCorporateActionIdByTypeIndex(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);

        _coupon.rate = _rate;
        _coupon.rateDecimals = _rateDecimals;
        _coupon.rateStatus = IBondRead.RateCalculationStatus.SET;

        _updateCorporateActionData(actionId, abi.encode(_coupon));
    }

    function _getCouponFromOrderedListAt(uint256 _pos) internal view override returns (uint256 couponID_) {
        if (_pos >= _getCouponsOrderedListTotalAdjustedAt(_blockTimestamp())) return 0;

        uint256 actualOrderedListLengthTotal = _getCouponsOrderedListTotal();

        if (_pos < actualOrderedListLengthTotal) return _bondStorage().couponsOrderedListByIds[_pos];

        uint256 pendingIndexOffset = _pos - actualOrderedListLengthTotal;

        uint256 index = _getScheduledCouponListingCount() - 1 - pendingIndexOffset;

        return _getScheduledCouponListingIdAtIndex(index);
    }

    function _getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (uint256[] memory couponIDs_) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);

        couponIDs_ = new uint256[](
            LibCommon.getSize(start, end, _getCouponsOrderedListTotalAdjustedAt(_blockTimestamp()))
        );

        for (uint256 i = 0; i < couponIDs_.length; i++) {
            couponIDs_[i] = _getCouponFromOrderedListAt(start + i);
        }
    }

    function _getCouponsOrderedListTotalAdjustedAt(uint256 _timestamp) internal view override returns (uint256 total_) {
        return _getCouponsOrderedListTotal() + _getPendingScheduledCouponListingTotalAt(_timestamp);
    }

    function _getCouponsOrderedListTotal() internal view override returns (uint256 total_) {
        return _bondStorage().couponsOrderedListByIds.length;
    }

    function _getPreviousCouponInOrderedList(
        uint256 _couponID
    ) internal view override returns (uint256 previousCouponID_) {
        uint256 orderedListLength = _getCouponsOrderedListTotalAdjustedAt(_blockTimestamp());

        if (orderedListLength < 2) return (0);

        if (_getCouponFromOrderedListAt(0) == _couponID) return (0);

        orderedListLength--;
        uint256 previousCouponId;

        for (uint256 index = 0; index < orderedListLength; index++) {
            previousCouponId = _getCouponFromOrderedListAt(index);
            uint256 couponId = _getCouponFromOrderedListAt(index + 1);
            if (couponId == _couponID) break;
        }

        return previousCouponId;
    }

    function _getBondDetails() internal view override returns (IBondRead.BondDetailsData memory bondDetails_) {
        bondDetails_ = IBondRead.BondDetailsData({
            currency: _bondStorage().currency,
            nominalValue: _bondStorage().nominalValue,
            nominalValueDecimals: _bondStorage().nominalValueDecimals,
            startingDate: _bondStorage().startingDate,
            maturityDate: _bondStorage().maturityDate
        });
    }

    function _getMaturityDate() internal view override returns (uint256 maturityDate_) {
        return _bondStorage().maturityDate;
    }

    function _getCoupon(
        uint256 _couponID
    ) internal view virtual override returns (IBondRead.RegisteredCoupon memory registeredCoupon_) {
        bytes32 actionId = _getCorporateActionIdByTypeIndex(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);

        (, , bytes memory data) = _getCorporateAction(actionId);

        if (data.length > 0) {
            (registeredCoupon_.coupon) = abi.decode(data, (IBondRead.Coupon));
        }

        registeredCoupon_.snapshotId = _getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view override returns (IBondRead.CouponFor memory couponFor_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = _getCoupon(_couponID);

        couponFor_.coupon = registeredCoupon.coupon;

        if (registeredCoupon.coupon.recordDate < _blockTimestamp()) {
            couponFor_.recordDateReached = true;

            couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
                ? _getTotalBalanceOfAtSnapshot(registeredCoupon.snapshotId, _account)
                : _getTotalBalanceForAdjustedAt(_account, _blockTimestamp());

            couponFor_.decimals = _decimalsAdjustedAt(_blockTimestamp());
        }
    }

    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) internal view override returns (IBondRead.CouponAmountFor memory couponAmountFor_) {
        IBondRead.CouponFor memory couponFor = _getCouponFor(_couponID, _account);

        if (!couponFor.recordDateReached) return couponAmountFor_;

        IBondRead.BondDetailsData memory bondDetails = _getBondDetails();

        couponAmountFor_.recordDateReached = true;

        uint256 period = couponFor.coupon.endDate - couponFor.coupon.startDate;

        couponAmountFor_.numerator = couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period;
        couponAmountFor_.denominator =
            10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals) *
            365 days;
    }

    function _getPrincipalFor(
        address _account
    ) internal view override returns (IBondRead.PrincipalFor memory principalFor_) {
        IBondRead.BondDetailsData memory bondDetails = _getBondDetails();

        principalFor_.numerator = _balanceOfAdjustedAt(_account, _blockTimestamp()) * bondDetails.nominalValue;
        principalFor_.denominator = 10 ** (_decimalsAdjustedAt(_blockTimestamp()) + bondDetails.nominalValueDecimals);
    }

    function _getCouponCount() internal view override returns (uint256 couponCount_) {
        return _getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory holders_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = _getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _blockTimestamp()) return new address[](0);

        if (registeredCoupon.snapshotId != 0)
            return _tokenHoldersAt(registeredCoupon.snapshotId, _pageIndex, _pageLength);

        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalCouponHolders(uint256 _couponID) internal view override returns (uint256) {
        IBondRead.RegisteredCoupon memory registeredCoupon = _getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _blockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0) return _totalTokenHoldersAt(registeredCoupon.snapshotId);

        return _getTotalTokenHolders();
    }

    function _isBondInitialized() internal view override returns (bool) {
        return _bondStorage().initialized;
    }

    function _bondStorage() internal pure returns (BondDataStorage storage bondData_) {
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
