// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    COUPON_CORPORATE_ACTION_TYPE,
    COUPON_LISTING_TASK_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from "../../constants/values.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InterestRateStorageWrapper } from "./InterestRateStorageWrapper.sol";
import { SustainabilityPerformanceTargetRateLib } from "./SustainabilityPerformanceTargetRateLib.sol";
import { KpiLinkedRateLib } from "./KpiLinkedRateLib.sol";

library BondStorageWrapper {
    struct BondDataStorage {
        bytes3 currency;
        uint256 nominalValue;
        uint256 startingDate;
        uint256 maturityDate;
        bool initialized;
        uint8 nominalValueDecimals;
        uint256[] couponsOrderedListByIds;
    }

    // --- State Modifying Functions ---

    // solhint-disable-next-line func-name-mixedcase
    function initialize_bond(IBondTypes.BondDetailsData calldata bondDetailsData) internal {
        BondDataStorage storage bs = bondStorage();
        bs.initialized = true;
        storeBondDetails(
            IBondTypes.BondDetailsData({
                currency: bondDetailsData.currency,
                nominalValue: bondDetailsData.nominalValue,
                nominalValueDecimals: bondDetailsData.nominalValueDecimals,
                startingDate: bondDetailsData.startingDate,
                maturityDate: bondDetailsData.maturityDate
            })
        );
    }

    function storeBondDetails(IBondTypes.BondDetailsData memory bondDetails) internal {
        BondDataStorage storage bs = bondStorage();
        bs.currency = bondDetails.currency;
        bs.nominalValue = bondDetails.nominalValue;
        bs.nominalValueDecimals = bondDetails.nominalValueDecimals;
        bs.startingDate = bondDetails.startingDate;
        bs.maturityDate = bondDetails.maturityDate;
    }

    function setCoupon(
        IBondTypes.Coupon memory newCoupon
    ) internal returns (bytes32 corporateActionId_, uint256 couponID_) {
        bytes memory data = abi.encode(newCoupon);

        (corporateActionId_, couponID_) = CorporateActionsStorageWrapper.addCorporateAction(
            COUPON_CORPORATE_ACTION_TYPE,
            data
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
        if (newCoupon.fixingDate != 0) {
            ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newCoupon.fixingDate, COUPON_LISTING_TASK_TYPE);
            ScheduledTasksStorageWrapper.addScheduledCouponListing(newCoupon.fixingDate, actionId);
        }
    }

    function setMaturityDate(uint256 maturityDate) internal returns (bool success_) {
        bondStorage().maturityDate = maturityDate;
        return true;
    }

    function addToCouponsOrderedList(uint256 couponID) internal {
        bondStorage().couponsOrderedListByIds.push(couponID);
    }

    function updateCouponRate(
        uint256 couponID,
        IBondTypes.Coupon memory coupon,
        uint256 rate,
        uint8 rateDecimals
    ) internal {
        bytes32 actionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            COUPON_CORPORATE_ACTION_TYPE,
            couponID - 1
        );

        coupon.rate = rate;
        coupon.rateDecimals = rateDecimals;
        coupon.rateStatus = IBondTypes.RateCalculationStatus.SET;

        CorporateActionsStorageWrapper.updateCorporateActionData(actionId, abi.encode(coupon));
    }

    // --- View Functions ---

    function getBondDetails() internal view returns (IBondTypes.BondDetailsData memory bondDetails_) {
        BondDataStorage storage bs = bondStorage();
        bondDetails_ = IBondTypes.BondDetailsData({
            currency: bs.currency,
            nominalValue: bs.nominalValue,
            nominalValueDecimals: bs.nominalValueDecimals,
            startingDate: bs.startingDate,
            maturityDate: bs.maturityDate
        });
    }

    function getMaturityDate() internal view returns (uint256 maturityDate_) {
        return bondStorage().maturityDate;
    }

    function getCoupon(uint256 couponID) internal view returns (IBondTypes.RegisteredCoupon memory registeredCoupon_) {
        bytes32 actionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            COUPON_CORPORATE_ACTION_TYPE,
            couponID - 1
        );

        (, , bytes memory data) = CorporateActionsStorageWrapper.getCorporateAction(actionId);

        if (data.length > 0) {
            (registeredCoupon_.coupon) = abi.decode(data, (IBondTypes.Coupon));
        }

        registeredCoupon_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(actionId, SNAPSHOT_RESULT_ID);

        // Calculate SPT rate on-the-fly if needed (similar to _getCouponAdjustedAt pattern in inheritance-based impl)
        // This ensures the rate is available when getCoupon is called, not just during scheduled task triggers
        if (
            registeredCoupon_.coupon.fixingDate != 0 &&
            registeredCoupon_.coupon.rateStatus != IBondTypes.RateCalculationStatus.SET &&
            registeredCoupon_.coupon.fixingDate <= TimeTravelStorageWrapper.getBlockTimestamp() &&
            InterestRateStorageWrapper.isSustainabilityPerformanceTargetRateInitialized()
        ) {
            (
                registeredCoupon_.coupon.rate,
                registeredCoupon_.coupon.rateDecimals
            ) = SustainabilityPerformanceTargetRateLib.calculateSustainabilityPerformanceTargetInterestRate(
                couponID,
                registeredCoupon_.coupon
            );
            registeredCoupon_.coupon.rateStatus = IBondTypes.RateCalculationStatus.SET;
        }

        // Calculate KPI Linked rate on-the-fly if needed
        if (
            registeredCoupon_.coupon.fixingDate != 0 &&
            registeredCoupon_.coupon.rateStatus != IBondTypes.RateCalculationStatus.SET &&
            registeredCoupon_.coupon.fixingDate <= TimeTravelStorageWrapper.getBlockTimestamp() &&
            InterestRateStorageWrapper.isKpiLinkedRateInitialized()
        ) {
            (registeredCoupon_.coupon.rate, registeredCoupon_.coupon.rateDecimals) = KpiLinkedRateLib
                .calculateKpiLinkedInterestRate(couponID, registeredCoupon_.coupon);
            registeredCoupon_.coupon.rateStatus = IBondTypes.RateCalculationStatus.SET;
        }
    }

    function getCouponFor(
        uint256 couponID,
        address account
    ) internal view returns (IBondTypes.CouponFor memory couponFor_) {
        IBondTypes.RegisteredCoupon memory registeredCoupon = getCoupon(couponID);

        couponFor_.coupon = registeredCoupon.coupon;

        if (registeredCoupon.coupon.recordDate < TimeTravelStorageWrapper.getBlockTimestamp()) {
            couponFor_.recordDateReached = true;

            couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
                ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(registeredCoupon.snapshotId, account)
                : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(
                    account,
                    TimeTravelStorageWrapper.getBlockTimestamp()
                );

            couponFor_.decimals = ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
        }
    }

    function getCouponAmountFor(
        uint256 couponID,
        address account
    ) internal view returns (IBondTypes.CouponAmountFor memory couponAmountFor_) {
        IBondTypes.CouponFor memory couponFor = getCouponFor(couponID, account);

        if (!couponFor.recordDateReached) return couponAmountFor_;

        IBondTypes.BondDetailsData memory bondDetails = getBondDetails();

        couponAmountFor_.recordDateReached = true;

        uint256 period = couponFor.coupon.endDate - couponFor.coupon.startDate;

        couponAmountFor_.numerator = couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period;
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

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return new address[](0);

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
        return bondStorage().initialized;
    }

    function getCouponFromOrderedListAt(uint256 pos) internal view returns (uint256 couponID_) {
        if (pos >= getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp())) return 0;

        uint256 actualOrderedListLengthTotal = getCouponsOrderedListTotal();

        if (pos < actualOrderedListLengthTotal) return bondStorage().couponsOrderedListByIds[pos];

        uint256 pendingIndexOffset = pos - actualOrderedListLengthTotal;

        uint256 index = ScheduledTasksStorageWrapper.getScheduledCouponListingCount() - 1 - pendingIndexOffset;

        return ScheduledTasksStorageWrapper.getScheduledCouponListingIdAtIndex(index);
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

        for (uint256 i = 0; i < couponIDs_.length; i++) {
            couponIDs_[i] = getCouponFromOrderedListAt(start + i);
        }
    }

    function getCouponsOrderedListTotalAdjustedAt(uint256 timestamp) internal view returns (uint256 total_) {
        return
            getCouponsOrderedListTotal() +
            ScheduledTasksStorageWrapper.getPendingScheduledCouponListingTotalAt(timestamp);
    }

    function getCouponsOrderedListTotal() internal view returns (uint256 total_) {
        return bondStorage().couponsOrderedListByIds.length;
    }

    function getPreviousCouponInOrderedList(uint256 couponID) internal view returns (uint256 previousCouponID_) {
        uint256 orderedListLength = getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());

        if (orderedListLength < 2) {
            return 0;
        }

        if (getCouponFromOrderedListAt(0) == couponID) {
            return 0;
        }

        orderedListLength--;
        uint256 previousCouponId;

        for (uint256 index = 0; index < orderedListLength; index++) {
            previousCouponId = getCouponFromOrderedListAt(index);
            uint256 couponIdAtNext = getCouponFromOrderedListAt(index + 1);
            if (couponIdAtNext == couponID) {
                break;
            }
        }

        return previousCouponId;
    }

    // --- Guard functions ---

    function requireValidMaturityDate(uint256 maturityDate) internal view {
        if (maturityDate <= getMaturityDate()) revert IBondTypes.BondMaturityDateWrong();
    }

    // --- Pure Functions ---

    function bondStorage() internal pure returns (BondDataStorage storage bondData_) {
        bytes32 position = _BOND_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            bondData_.slot := position
        }
    }
}
