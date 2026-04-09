// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    COUPON_CORPORATE_ACTION_TYPE,
    COUPON_LISTING_TASK_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from "../../constants/values.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { InterestRateStorageWrapper } from "./InterestRateStorageWrapper.sol";
import { KpiLinkedRateLib } from "./KpiLinkedRateLib.sol";
import { NominalValueStorageWrapper } from "./nominalValue/NominalValueStorageWrapper.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { SustainabilityPerformanceTargetRateLib } from "./SustainabilityPerformanceTargetRateLib.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _BOND_STORAGE_POSITION } from "../../constants/storagePositions.sol";

/// @title Bond Storage Wrapper
/// @notice Library for managing Bond token storage operations.
/// @dev Provides structured access to BondDataStorage with migration support for NominalValue.
library BondStorageWrapper {
    struct BondDataStorage {
        bytes3 currency;
        /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
        // solhint-disable-next-line var-name-mixedcase
        uint256 DEPRECATED_nominalValue;
        uint256 startingDate;
        uint256 maturityDate;
        bool initialized;
        /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
        // solhint-disable-next-line var-name-mixedcase
        uint8 DEPRECATED_nominalValueDecimals;
        uint256[] couponsOrderedListByIds;
    }

    // solhint-disable-next-line func-name-mixedcase
    function initialize_bond(IBondTypes.BondDetailsData calldata bondDetailsData) internal {
        BondDataStorage storage bs = _bondStorage();
        bs.initialized = true;
        bs.currency = bondDetailsData.currency;
        bs.startingDate = bondDetailsData.startingDate;
        bs.maturityDate = bondDetailsData.maturityDate;
    }

    function setCoupon(
        IBondTypes.Coupon memory newCoupon
    ) internal returns (bytes32 corporateActionId_, uint256 couponID_) {
        (corporateActionId_, couponID_) = CorporateActionsStorageWrapper.addCorporateAction(
            COUPON_CORPORATE_ACTION_TYPE,
            abi.encode(newCoupon)
        );

        initCoupon(corporateActionId_, newCoupon);

        emit IBondTypes.CouponSet(corporateActionId_, couponID_, EvmAccessors.getMsgSender(), newCoupon);
    }

    function initCoupon(bytes32 actionId, IBondTypes.Coupon memory newCoupon) internal {
        if (actionId == bytes32(0)) {
            revert IBondTypes.CouponCreationFailed();
        }

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newCoupon.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newCoupon.recordDate, actionId);

        // For fixing date rate bonds, add coupon listing task
        if (newCoupon.fixingDate == 0) return;
        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newCoupon.fixingDate, COUPON_LISTING_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledCouponListing(newCoupon.fixingDate, actionId);
    }

    function setMaturityDate(uint256 maturityDate) internal {
        _bondStorage().maturityDate = maturityDate;
    }

    function addToCouponsOrderedList(uint256 couponID) internal {
        _bondStorage().couponsOrderedListByIds.push(couponID);
    }

    function updateCouponRate(
        uint256 couponID,
        IBondTypes.Coupon memory coupon,
        uint256 rate,
        uint8 rateDecimals
    ) internal {
        coupon.rate = rate;
        coupon.rateDecimals = rateDecimals;
        coupon.rateStatus = IBondTypes.RateCalculationStatus.SET;

        CorporateActionsStorageWrapper.updateCorporateActionData(
            CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(COUPON_CORPORATE_ACTION_TYPE, couponID - 1),
            abi.encode(coupon)
        );
    }

    /// @dev DEPRECATED – MIGRATION: Remove this function and the DEPRECATED_ fields from
    /// BondDataStorage once all legacy tokens have been migrated.
    function clearNominalValue() internal {
        BondDataStorage storage $ = _bondStorage();
        $.DEPRECATED_nominalValue = 0;
        $.DEPRECATED_nominalValueDecimals = 0;
    }

    // This is for testing only
    function setDeprecatedNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        BondDataStorage storage $ = _bondStorage();
        $.DEPRECATED_nominalValue = _nominalValue;
        $.DEPRECATED_nominalValueDecimals = _nominalValueDecimals;
    }

    function getDeprecatedNominalValue() internal view returns (uint256 nominalValue_) {
        nominalValue_ = _bondStorage().DEPRECATED_nominalValue;
    }

    function getDeprecatedNominalValueDecimals() internal view returns (uint8 nominalValueDecimals_) {
        nominalValueDecimals_ = _bondStorage().DEPRECATED_nominalValueDecimals;
    }

    function getBondDetails() internal view returns (IBondTypes.BondDetailsData memory bondDetails_) {
        BondDataStorage storage bs = _bondStorage();
        bondDetails_ = IBondTypes.BondDetailsData({
            currency: bs.currency,
            nominalValue: NominalValueStorageWrapper._getNominalValue(),
            nominalValueDecimals: NominalValueStorageWrapper._getNominalValueDecimals(),
            startingDate: bs.startingDate,
            maturityDate: bs.maturityDate
        });
    }

    function getMaturityDate() internal view returns (uint256 maturityDate_) {
        return _bondStorage().maturityDate;
    }

    function getCoupon(uint256 couponID) internal view returns (IBondTypes.RegisteredCoupon memory registeredCoupon_) {
        bytes32 actionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            COUPON_CORPORATE_ACTION_TYPE,
            couponID - 1
        );

        (, , bytes memory data) = CorporateActionsStorageWrapper.getCorporateAction(actionId);

        if (data.length > 0) {
            registeredCoupon_.coupon = abi.decode(data, (IBondTypes.Coupon));
        }

        registeredCoupon_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(actionId, SNAPSHOT_RESULT_ID);

        if (
            InterestRateStorageWrapper.isFixedRateInitialized() ||
            registeredCoupon_.coupon.fixingDate == 0 ||
            registeredCoupon_.coupon.rateStatus == IBondTypes.RateCalculationStatus.SET ||
            registeredCoupon_.coupon.fixingDate > TimeTravelStorageWrapper.getBlockTimestamp()
        ) return registeredCoupon_;

        // Calculate SPT rate on-the-fly if needed (similar to _getCouponAdjustedAt pattern in inheritance-based impl)
        // This ensures the rate is available when getCoupon is called, not just during scheduled task triggers
        if (InterestRateStorageWrapper.isSustainabilityPerformanceTargetRateInitialized()) {
            (
                registeredCoupon_.coupon.rate,
                registeredCoupon_.coupon.rateDecimals
            ) = SustainabilityPerformanceTargetRateLib.calculateSustainabilityPerformanceTargetInterestRate(
                couponID,
                registeredCoupon_.coupon
            );
            registeredCoupon_.coupon.rateStatus = IBondTypes.RateCalculationStatus.SET;
            return registeredCoupon_;
        }
        // Calculate KPI Linked rate on-the-fly if needed
        (registeredCoupon_.coupon.rate, registeredCoupon_.coupon.rateDecimals) = KpiLinkedRateLib
            .calculateKpiLinkedInterestRate(couponID, registeredCoupon_.coupon);
        registeredCoupon_.coupon.rateStatus = IBondTypes.RateCalculationStatus.SET;
    }

    function getCouponFor(
        uint256 couponID,
        address account
    ) internal view returns (IBondTypes.CouponFor memory couponFor_) {
        IBondTypes.RegisteredCoupon memory registeredCoupon = getCoupon(couponID);

        couponFor_.coupon = registeredCoupon.coupon;

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return couponFor_;

        couponFor_.recordDateReached = true;

        couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
            ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(registeredCoupon.snapshotId, account)
            : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, TimeTravelStorageWrapper.getBlockTimestamp());

        couponFor_.decimals = ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    function getCouponAmountFor(
        uint256 couponID,
        address account
    ) internal view returns (IBondTypes.CouponAmountFor memory couponAmountFor_) {
        IBondTypes.CouponFor memory couponFor = getCouponFor(couponID, account);

        if (!couponFor.recordDateReached) return couponAmountFor_;

        IBondTypes.BondDetailsData memory bondDetails = getBondDetails();

        couponAmountFor_.recordDateReached = true;

        couponAmountFor_.numerator =
            couponFor.tokenBalance *
            bondDetails.nominalValue *
            couponFor.coupon.rate *
            (couponFor.coupon.endDate - couponFor.coupon.startDate);
        couponAmountFor_.denominator =
            10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals) *
            365 days;
    }

    function getPrincipalFor(address account) internal view returns (IBondTypes.PrincipalFor memory principalFor_) {
        IBondTypes.BondDetailsData memory bondDetails = getBondDetails();

        principalFor_.numerator =
            ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, TimeTravelStorageWrapper.getBlockTimestamp()) *
            bondDetails.nominalValue;
        principalFor_.denominator =
            10 **
                (ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp()) +
                    bondDetails.nominalValueDecimals);
    }

    function getCouponCount() internal view returns (uint256 couponCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    function getCouponHolders(
        uint256 couponID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        IBondTypes.RegisteredCoupon memory registeredCoupon = getCoupon(couponID);

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return holders_;

        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredCoupon.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalCouponHolders(uint256 couponID) internal view returns (uint256) {
        IBondTypes.RegisteredCoupon memory registeredCoupon = getCoupon(couponID);

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredCoupon.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function isBondInitialized() internal view returns (bool) {
        return _bondStorage().initialized;
    }

    function getCouponFromOrderedListAt(uint256 pos) internal view returns (uint256 couponID_) {
        if (pos >= getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp())) return 0;

        uint256 actualOrderedListLengthTotal = getCouponsOrderedListTotal();

        if (pos < actualOrderedListLengthTotal) return _bondStorage().couponsOrderedListByIds[pos];

        return
            ScheduledTasksStorageWrapper.getScheduledCouponListingIdAtIndex(
                ScheduledTasksStorageWrapper.getScheduledCouponListingCount() + actualOrderedListLengthTotal - 1 - pos
            );
    }

    function getCouponsOrderedList(
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (uint256[] memory couponIDs_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);

        couponIDs_ = new uint256[](
            Pagination.getSize(
                start,
                end,
                getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp())
            )
        );

        uint256 length = couponIDs_.length;
        for (uint256 i; i < length; ) {
            unchecked {
                couponIDs_[i] = getCouponFromOrderedListAt(start + i);
                ++i;
            }
        }
    }

    function getCouponsOrderedListTotalAdjustedAt(uint256 timestamp) internal view returns (uint256 total_) {
        return
            getCouponsOrderedListTotal() +
            ScheduledTasksStorageWrapper.getPendingScheduledCouponListingTotalAt(timestamp);
    }

    function getCouponsOrderedListTotal() internal view returns (uint256 total_) {
        return _bondStorage().couponsOrderedListByIds.length;
    }

    function getPreviousCouponInOrderedList(uint256 couponID) internal view returns (uint256 previousCouponID_) {
        uint256 orderedListLength = getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());

        if (orderedListLength < 2 || getCouponFromOrderedListAt(0) == couponID) return 0;

        unchecked {
            --orderedListLength;
            for (uint256 index; index < orderedListLength; ) {
                previousCouponID_ = getCouponFromOrderedListAt(index);
                if (getCouponFromOrderedListAt(++index) == couponID) return previousCouponID_;
            }
        }
    }

    function requireValidMaturityDate(uint256 maturityDate) internal view {
        if (maturityDate <= getMaturityDate()) revert IBondTypes.BondMaturityDateWrong();
    }

    function _bondStorage() private pure returns (BondDataStorage storage bondData_) {
        bytes32 position = _BOND_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            bondData_.slot := position
        }
    }
}
