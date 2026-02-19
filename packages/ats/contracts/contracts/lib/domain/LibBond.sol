// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { bondStorage, BondDataStorage } from "../../storage/AssetStorage.sol";
import { IBondRead } from "../../facets/assetCapabilities/interfaces/bond/IBondRead.sol";
import { IBondStorageWrapper } from "../../facets/assetCapabilities/interfaces/bond/IBondStorageWrapper.sol";
import { COUPON_CORPORATE_ACTION_TYPE, SNAPSHOT_RESULT_ID, SNAPSHOT_TASK_TYPE } from "../../constants/values.sol";
import { COUPON_LISTING_TASK_TYPE } from "../../constants/values.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";
import { LibCorporateActions } from "../core/LibCorporateActions.sol";
import { LibScheduledTasks } from "./LibScheduledTasks.sol";

/// @title LibBond
/// @notice Bond storage management library for security token functionality
/// @dev Extracted from BondStorageWrapper for library-based diamond migration
///      Handles bond initialization, coupon management, maturity dates, and bond-specific queries
library LibBond {
    // ═══════════════════════════════════════════════════════════════════════════════
    // BOND INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Initializes the bond with provided details
    /// @param _bondDetailsData The bond details (currency, nominal value, dates, decimals)
    /// @return success_ True if initialization was successful
    function initializeBond(IBondRead.BondDetailsData calldata _bondDetailsData) internal returns (bool success_) {
        BondDataStorage storage bs = bondStorage();
        bs.initialized = true;
        storeBondDetails(_bondDetailsData);
        return true;
    }

    /// @notice Stores bond details in storage
    /// @param _bondDetails The bond details to store
    function storeBondDetails(IBondRead.BondDetailsData memory _bondDetails) internal {
        BondDataStorage storage bs = bondStorage();
        bs.currency = _bondDetails.currency;
        bs.nominalValue = _bondDetails.nominalValue;
        bs.nominalValueDecimals = _bondDetails.nominalValueDecimals;
        bs.startingDate = _bondDetails.startingDate;
        bs.maturityDate = _bondDetails.maturityDate;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // MATURITY DATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Sets the maturity date of the bond
    /// @param _maturityDate The new maturity date to be set
    /// @return success_ True if the maturity date was set successfully
    function setMaturityDate(uint256 _maturityDate) internal returns (bool success_) {
        bondStorage().maturityDate = _maturityDate;
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON MANAGEMENT — Creation and Storage
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Creates a coupon and registers it as a corporate action
    /// @param _coupon The coupon data to create
    /// @return corporateActionId_ The ID of the corporate action representing this coupon
    /// @return couponID_ The index of the coupon within the coupon type
    function setCoupon(
        IBondRead.Coupon memory _coupon
    ) internal returns (bytes32 corporateActionId_, uint256 couponID_) {
        bytes memory data = abi.encode(_coupon);

        (corporateActionId_, couponID_) = LibCorporateActions.addCorporateAction(COUPON_CORPORATE_ACTION_TYPE, data);

        initCoupon(corporateActionId_, _coupon);

        emit IBondStorageWrapper.CouponSet(corporateActionId_, couponID_, msg.sender, _coupon);

        return (corporateActionId_, couponID_);
    }

    /// @notice Initializes a coupon by setting up scheduled snapshots and tasks
    /// @param _actionId The corporate action ID for this coupon
    /// @param _coupon The coupon data
    function initCoupon(bytes32 _actionId, IBondRead.Coupon memory _coupon) internal {
        if (_actionId == bytes32(0)) {
            revert IBondStorageWrapper.CouponCreationFailed();
        }

        LibScheduledTasks.addScheduledCrossOrderedTask(_coupon.recordDate, abi.encode(SNAPSHOT_TASK_TYPE));
        LibScheduledTasks.addScheduledSnapshot(_coupon.recordDate, abi.encode(_actionId));
        LibScheduledTasks.addScheduledCrossOrderedTask(_coupon.fixingDate, abi.encode(COUPON_LISTING_TASK_TYPE));
        LibScheduledTasks.addScheduledCouponListing(_coupon.fixingDate, abi.encode(_actionId));
    }

    /// @notice Adds a coupon ID to the ordered list
    /// @param _couponID The coupon ID to add
    function addToCouponsOrderedList(uint256 _couponID) internal {
        bondStorage().couponsOrderedListByIds.push(_couponID);
    }

    /// @notice Updates the rate and rate decimals for a coupon
    /// @param _couponID The ID of the coupon to update
    /// @param _coupon The coupon data structure to update
    /// @param _rate The new rate value
    /// @param _rateDecimals The number of decimals for the rate
    function updateCouponRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon,
        uint256 _rate,
        uint8 _rateDecimals
    ) internal {
        bytes32 actionId = LibCorporateActions.getCorporateActionIdByTypeIndex(
            COUPON_CORPORATE_ACTION_TYPE,
            _couponID - 1
        );

        _coupon.rate = _rate;
        _coupon.rateDecimals = _rateDecimals;
        _coupon.rateStatus = IBondRead.RateCalculationStatus.SET;

        LibCorporateActions.updateCorporateActionData(actionId, abi.encode(_coupon));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON QUERIES — Data Retrieval
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Gets a registered coupon by its ID
    /// @param _couponID The coupon ID
    /// @return registeredCoupon_ The coupon data including snapshot ID
    function getCoupon(uint256 _couponID) internal view returns (IBondRead.RegisteredCoupon memory registeredCoupon_) {
        bytes32 actionId = LibCorporateActions.getCorporateActionIdByTypeIndex(
            COUPON_CORPORATE_ACTION_TYPE,
            _couponID - 1
        );

        (, , bytes memory data) = LibCorporateActions.getCorporateAction(actionId);

        if (data.length > 0) {
            (registeredCoupon_.coupon) = abi.decode(data, (IBondRead.Coupon));
        }

        registeredCoupon_.snapshotId = LibCorporateActions.getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    /// @notice Gets the total count of coupons for this bond
    /// @return couponCount_ The number of coupons
    function getCouponCount() internal view returns (uint256 couponCount_) {
        return LibCorporateActions.getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON QUERIES — Ordered List Management
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the coupon ID at a specific position in the ordered list
    /// @param _pos The position in the combined (actual + pending) coupon list
    /// @return couponID_ The coupon ID at the position
    function getCouponFromOrderedListAt(uint256 _pos, uint256 _timestamp) internal view returns (uint256 couponID_) {
        if (_pos >= getCouponsOrderedListTotalAdjustedAt(_timestamp)) return 0;

        uint256 actualOrderedListLengthTotal = getCouponsOrderedListTotal();

        if (_pos < actualOrderedListLengthTotal) {
            return bondStorage().couponsOrderedListByIds[_pos];
        }

        uint256 pendingIndexOffset = _pos - actualOrderedListLengthTotal;
        uint256 index = LibScheduledTasks.getScheduledCouponListingCount() - 1 - pendingIndexOffset;

        return LibScheduledTasks.getScheduledCouponListingIdAtIndex(index);
    }

    /// @notice Gets a paginated list of coupon IDs
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @param _timestamp The timestamp for pending task resolution
    /// @return couponIDs_ Array of coupon IDs for the page
    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength,
        uint256 _timestamp
    ) internal view returns (uint256[] memory couponIDs_) {
        (uint256 start, uint256 end) = LibPagination.getStartAndEnd(_pageIndex, _pageLength);

        couponIDs_ = new uint256[](LibPagination.getSize(start, end, getCouponsOrderedListTotalAdjustedAt(_timestamp)));

        for (uint256 i = 0; i < couponIDs_.length; i++) {
            couponIDs_[i] = getCouponFromOrderedListAt(start + i, _timestamp);
        }
    }

    /// @notice Gets the total number of coupons (actual + pending) at a specific timestamp
    /// @param _timestamp The timestamp to check pending tasks against
    /// @return total_ The adjusted total coupon count at the given timestamp
    function getCouponsOrderedListTotalAdjustedAt(uint256 _timestamp) internal view returns (uint256 total_) {
        return getCouponsOrderedListTotal() + LibScheduledTasks.getPendingScheduledCouponListingTotalAt(_timestamp);
    }

    /// @notice Gets the total number of coupons that have been confirmed
    /// @return total_ The number of actual coupons in storage
    function getCouponsOrderedListTotal() internal view returns (uint256 total_) {
        return bondStorage().couponsOrderedListByIds.length;
    }

    /// @notice Gets the coupon ID immediately before a specific coupon in the ordered list
    /// @param _couponID The coupon ID to find the predecessor of
    /// @param _timestamp The timestamp for pending task resolution
    /// @return previousCouponID_ The previous coupon ID (0 if this is the first coupon)
    function getPreviousCouponInOrderedList(
        uint256 _couponID,
        uint256 _timestamp
    ) internal view returns (uint256 previousCouponID_) {
        uint256 orderedListLength = getCouponsOrderedListTotalAdjustedAt(_timestamp);

        if (orderedListLength < 2) return 0;

        if (getCouponFromOrderedListAt(0, _timestamp) == _couponID) return 0;

        orderedListLength--;
        uint256 previousCouponId;

        for (uint256 index = 0; index < orderedListLength; index++) {
            previousCouponId = getCouponFromOrderedListAt(index, _timestamp);
            uint256 couponId = getCouponFromOrderedListAt(index + 1, _timestamp);
            if (couponId == _couponID) break;
        }

        return previousCouponId;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // BOND DETAILS QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the full bond details
    /// @return bondDetails_ The complete bond details structure
    function getBondDetails() internal view returns (IBondRead.BondDetailsData memory bondDetails_) {
        BondDataStorage storage bs = bondStorage();
        bondDetails_ = IBondRead.BondDetailsData({
            currency: bs.currency,
            nominalValue: bs.nominalValue,
            nominalValueDecimals: bs.nominalValueDecimals,
            startingDate: bs.startingDate,
            maturityDate: bs.maturityDate
        });
    }

    /// @notice Gets the currency of the bond
    /// @return currency_ The 3-byte currency code
    function getCurrency() internal view returns (bytes3 currency_) {
        return bondStorage().currency;
    }

    /// @notice Gets the nominal (face) value of the bond
    /// @return nominalValue_ The nominal value
    function getNominalValue() internal view returns (uint256 nominalValue_) {
        return bondStorage().nominalValue;
    }

    /// @notice Gets the number of decimals for the nominal value
    /// @return nominalValueDecimals_ The decimal places
    function getNominalValueDecimals() internal view returns (uint8 nominalValueDecimals_) {
        return bondStorage().nominalValueDecimals;
    }

    /// @notice Gets the starting date of the bond
    /// @return startingDate_ The bond's starting date as a timestamp
    function getStartingDate() internal view returns (uint256 startingDate_) {
        return bondStorage().startingDate;
    }

    /// @notice Checks if the bond has been initialized
    /// @return initialized_ True if the bond has been initialized
    function isBondInitialized() internal view returns (bool initialized_) {
        return bondStorage().initialized;
    }

    /// @notice Gets the current maturity date of the bond
    /// @return maturityDate_ The maturity date of the bond
    function getMaturityDate() internal view returns (uint256 maturityDate_) {
        return bondStorage().maturityDate;
    }

    /// @notice Validates that a new maturity date is after the current maturity date
    /// @param _maturityDate The maturity date to validate
    /// @return valid_ True if the date is valid (after current maturity date)
    function isValidMaturityDate(uint256 _maturityDate) internal view returns (bool valid_) {
        return _maturityDate > getMaturityDate();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // NOTE: getCouponHolders() and getTotalCouponHolders() require cross-domain
    // composition (LibSnapshots + LibERC1410) and are composed at the facet level.
}
