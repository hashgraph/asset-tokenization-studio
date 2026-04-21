// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _EQUITY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE,
    KPI_EQUITY_BALANCE_ADJ
} from "../../constants/values.sol";
import { IEquity } from "../../facets/layer_2/equity/IEquity.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { NominalValueStorageWrapper } from "./nominalValue/NominalValueStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @notice Diamond Storage struct for equity token rights, instrument metadata, and
 *         legacy nominal value data.
 * @dev    Stored at `_EQUITY_STORAGE_POSITION`. `DEPRECATED_nominalValue` and
 *         `DEPRECATED_nominalValueDecimals` are retained solely for storage layout
 *         compatibility with pre-migration tokens; once all legacy tokens have been
 *         migrated via `clearNominalValue`, these fields should be treated as zero.
 *         The canonical nominal value is held in `NominalValueStorageWrapper`.
 *         The field ordering must not be altered without a corresponding storage
 *         migration, as it would corrupt the Diamond Storage layout.
 * @param votingRight                    True if token holders are entitled to vote.
 * @param informationRight               True if token holders have information rights.
 * @param liquidationRight               True if token holders have liquidation
 *                                       preference rights.
 * @param subscriptionRight              True if token holders have subscription rights.
 * @param conversionRight                True if token holders have conversion rights.
 * @param redemptionRight                True if token holders have redemption rights.
 * @param putRight                       True if token holders have put rights.
 * @param dividendRight                  Classification of the dividend entitlement type.
 * @param currency                       ISO 4217 three-byte currency code used for
 *                                       nominal value and dividend denominations.
 * @param DEPRECATED_nominalValue        Legacy nominal value; superseded by
 *                                       `NominalValueStorageWrapper`. Must be zero
 *                                       after migration.
 * @param initialized                    True once `initializeEquityDetails` has been
 *                                       called.
 * @param DEPRECATED_nominalValueDecimals  Legacy decimal precision for the nominal
 *                                       value; superseded by `NominalValueStorageWrapper`.
 *                                       Must be zero after migration.
 */
struct EquityDataStorage {
    bool votingRight;
    bool informationRight;
    bool liquidationRight;
    bool subscriptionRight;
    bool conversionRight;
    bool redemptionRight;
    bool putRight;
    IEquity.DividendType dividendRight;
    bytes3 currency;
    /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
    // solhint-disable-next-line var-name-mixedcase
    uint256 DEPRECATED_nominalValue;
    bool initialized;
    /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
    // solhint-disable-next-line var-name-mixedcase
    uint8 DEPRECATED_nominalValueDecimals;
}

/**
 * @title  EquityStorageWrapper
 * @notice Internal library for managing equity token storage operations, including
 *         rights initialisation, scheduled balance adjustment lifecycle, legacy nominal
 *         value migration, and balance snapshot resolution.
 * @dev    Anchors `EquityDataStorage` at `_EQUITY_STORAGE_POSITION` following the
 *         ERC-2535 Diamond Storage Pattern. All functions are `internal` and intended
 *         exclusively for use within facets or other internal libraries of the same
 *         diamond.
 *
 *         Balance adjustments are registered as corporate actions of type
 *         `BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE` via `CorporateActionsStorageWrapper`
 *         and additionally scheduled via `ScheduledTasksStorageWrapper`. Adjustment IDs
 *         are one-based sequential indices within the balance-adjustment action type;
 *         callers must never pass `0` as a balance adjustment ID.
 *
 *         The `DEPRECATED_nominalValue` and `DEPRECATED_nominalValueDecimals` fields are
 *         retained for storage layout compatibility only. The migration path requires
 *         calling `clearNominalValue` after the canonical values have been written to
 *         `NominalValueStorageWrapper`. The `setDeprecatedNominalValue` function is
 *         provided exclusively for testing and must not be used in production flows.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 * @author Hashgraph
 */
library EquityStorageWrapper {
    /**
     * @notice Writes all equity rights and instrument metadata fields to storage and
     *         marks the equity subsystem as initialised.
     * @dev    Overwrites all rights flags, dividend type, and currency in a single
     *         storage pointer pass. Calling this more than once silently overwrites all
     *         previously stored rights; callers must enforce single-initialisation at the
     *         facet level. Does not write nominal value fields; use
     *         `NominalValueStorageWrapper` for that.
     * @param equityDetailsData  Struct containing all equity rights flags, dividend type,
     *                           and currency to persist.
     */
    function initializeEquityDetails(IEquity.EquityDetailsData memory equityDetailsData) internal {
        EquityDataStorage storage $ = _equityStorage();
        $.votingRight = equityDetailsData.votingRight;
        $.informationRight = equityDetailsData.informationRight;
        $.liquidationRight = equityDetailsData.liquidationRight;
        $.subscriptionRight = equityDetailsData.subscriptionRight;
        $.conversionRight = equityDetailsData.conversionRight;
        $.redemptionRight = equityDetailsData.redemptionRight;
        $.putRight = equityDetailsData.putRight;
        $.dividendRight = equityDetailsData.dividendRight;
        $.currency = equityDetailsData.currency;
        $.initialized = true;
    }

    /**
     * @notice Registers a new scheduled balance adjustment as a corporate action and
     *         schedules its execution task, returning the assigned identifiers.
     * @dev    ABI-encodes `newBalanceAdjustment` and passes it to
     *         `CorporateActionsStorageWrapper.addCorporateAction` under
     *         `BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE`. A duplicate submission
     *         (identical encoded payload) returns `(bytes32(0), 0)` without reverting;
     *         callers should check for zero returns if idempotency is required.
     *         Scheduling side-effects are applied via `initBalanceAdjustment`.
     * @param newBalanceAdjustment  Calldata struct containing the balance adjustment
     *                              parameters, including the execution date.
     * @return corporateActionId_    Diamond-level corporate action identifier.
     * @return balanceAdjustmentID_  One-based sequential balance adjustment ID within
     *                               the balance-adjustment action type.
     */
    function setScheduledBalanceAdjustment(
        IEquity.ScheduledBalanceAdjustment calldata newBalanceAdjustment
    ) internal returns (bytes32 corporateActionId_, uint256 balanceAdjustmentID_) {
        bytes memory data = abi.encode(newBalanceAdjustment);
        (corporateActionId_, balanceAdjustmentID_) = CorporateActionsStorageWrapper.addCorporateAction(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            data
        );
        initBalanceAdjustment(corporateActionId_, data);
    }

    /**
     * @notice Marks a pending scheduled balance adjustment as cancelled, provided its
     *         execution date has not yet passed.
     * @dev    Resolves the corporate action ID via `getScheduledBalanceAdjustment`, then
     *         compares `executionDate` against the current block timestamp from
     *         `TimeTravelStorageWrapper`. Reverts with
     *         `IEquity.BalanceAdjustmentAlreadyExecuted` if the execution date has
     *         already passed or is equal to the current timestamp. Delegates cancellation
     *         to `CorporateActionsStorageWrapper.cancelCorporateAction`, which sets
     *         `isDisabled = true` irreversibly at the storage layer.
     * @param balanceAdjustmentId  One-based sequential ID of the balance adjustment to
     *                             cancel.
     * @return success_  Always `true` on successful cancellation.
     */
    function cancelScheduledBalanceAdjustment(uint256 balanceAdjustmentId) internal returns (bool success_) {
        IEquity.ScheduledBalanceAdjustment memory balanceAdjustment;
        bytes32 corporateActionId;
        (balanceAdjustment, corporateActionId, ) = getScheduledBalanceAdjustment(balanceAdjustmentId);
        if (balanceAdjustment.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IEquity.BalanceAdjustmentAlreadyExecuted(corporateActionId, balanceAdjustmentId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
    }

    /**
     * @notice Schedules the execution task for a newly registered balance adjustment
     *         corporate action.
     * @dev    Reverts with `IEquity.BalanceAdjustmentCreationFailed` if `actionId` is
     *         `bytes32(0)`, indicating a duplicate registration was silently rejected
     *         upstream. Decodes `data` to extract `executionDate`, then registers a
     *         cross-ordered task of type `BALANCE_ADJUSTMENT_TASK_TYPE` and a scheduled
     *         balance adjustment entry via `ScheduledTasksStorageWrapper`. Must only be
     *         called immediately after a successful `addCorporateAction` invocation;
     *         calling it independently with an arbitrary `actionId` creates orphaned
     *         scheduled tasks.
     * @param actionId  Corporate action ID returned by the upstream registration call;
     *                  must be non-zero.
     * @param data      ABI-encoded `IEquity.ScheduledBalanceAdjustment` providing the
     *                  execution date for task scheduling.
     */
    function initBalanceAdjustment(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquity.BalanceAdjustmentCreationFailed();
        }
        IEquity.ScheduledBalanceAdjustment memory newBalanceAdjustment = abi.decode(
            data,
            (IEquity.ScheduledBalanceAdjustment)
        );
        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(
            newBalanceAdjustment.executionDate,
            BALANCE_ADJUSTMENT_TASK_TYPE
        );
        ScheduledTasksStorageWrapper.addScheduledBalanceAdjustment(newBalanceAdjustment.executionDate, actionId);
    }

    /**
     * @notice Clears the legacy `DEPRECATED_nominalValue` and
     *         `DEPRECATED_nominalValueDecimals` fields from storage as part of the
     *         migration to `NominalValueStorageWrapper`.
     * @dev    Must be called after the canonical nominal value has been written to
     *         `NominalValueStorageWrapper`. Once cleared, the deprecated fields should
     *         remain zero permanently. This function and the deprecated fields should be
     *         removed from `EquityDataStorage` once all legacy tokens have been migrated.
     */
    function clearNominalValue() internal {
        EquityDataStorage storage $ = _equityStorage();
        $.DEPRECATED_nominalValue = 0;
        $.DEPRECATED_nominalValueDecimals = 0;
    }

    /**
     * @notice Writes test values directly to the deprecated nominal value storage fields.
     * @dev    Intended exclusively for use in test environments to simulate pre-migration
     *         storage state. Must not be called in production deployments. Writing
     *         non-zero values here will cause `getDeprecatedNominalValue` and
     *         `getDeprecatedNominalValueDecimals` to return those values until
     *         `clearNominalValue` is called.
     * @param _nominalValue          Nominal value to write to the deprecated field.
     * @param _nominalValueDecimals  Decimal precision to write to the deprecated field.
     */
    function setDeprecatedNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        EquityDataStorage storage $ = _equityStorage();
        $.DEPRECATED_nominalValue = _nominalValue;
        $.DEPRECATED_nominalValueDecimals = _nominalValueDecimals;
    }

    /**
     * @notice Returns the raw value of the deprecated `DEPRECATED_nominalValue` field
     *         without clearing it.
     * @dev    A non-zero return indicates the legacy nominal value has not yet been
     *         migrated to `NominalValueStorageWrapper`. Used as a migration status signal.
     * @return nominalValue_  Raw value of `DEPRECATED_nominalValue`; zero if migrated.
     */
    function getDeprecatedNominalValue() internal view returns (uint256 nominalValue_) {
        nominalValue_ = _equityStorage().DEPRECATED_nominalValue;
    }

    /**
     * @notice Returns the raw value of the deprecated `DEPRECATED_nominalValueDecimals`
     *         field without clearing it.
     * @dev    A non-zero return indicates the legacy decimal precision has not yet been
     *         migrated to `NominalValueStorageWrapper`. Used as a migration status signal.
     * @return nominalValueDecimals_  Raw value of `DEPRECATED_nominalValueDecimals`; zero
     *                                if migrated.
     */
    function getDeprecatedNominalValueDecimals() internal view returns (uint8 nominalValueDecimals_) {
        nominalValueDecimals_ = _equityStorage().DEPRECATED_nominalValueDecimals;
    }

    /**
     * @notice Returns the full equity details struct, sourcing the canonical nominal
     *         value and its decimal precision from `NominalValueStorageWrapper`.
     * @dev    All rights flags, dividend type, and currency are read directly from
     *         `EquityDataStorage`. Nominal value fields are sourced exclusively from
     *         `NominalValueStorageWrapper`; the deprecated storage fields are not read
     *         here. Callers that need to check for pre-migration state must use
     *         `getDeprecatedNominalValue` separately.
     * @return equityDetails_  Struct containing all equity rights, instrument metadata,
     *                         and the current canonical nominal value.
     */
    function getEquityDetails() internal view returns (IEquity.EquityDetailsData memory equityDetails_) {
        equityDetails_ = IEquity.EquityDetailsData({
            votingRight: _equityStorage().votingRight,
            informationRight: _equityStorage().informationRight,
            liquidationRight: _equityStorage().liquidationRight,
            subscriptionRight: _equityStorage().subscriptionRight,
            conversionRight: _equityStorage().conversionRight,
            redemptionRight: _equityStorage().redemptionRight,
            putRight: _equityStorage().putRight,
            dividendRight: _equityStorage().dividendRight,
            currency: _equityStorage().currency,
            nominalValue: NominalValueStorageWrapper._getNominalValue(),
            nominalValueDecimals: NominalValueStorageWrapper._getNominalValueDecimals()
        });
    }

    /**
     * @notice Returns the full data record for a scheduled balance adjustment identified
     *         by its one-based sequential ID.
     * @dev    Resolves the corporate action ID using `balanceAdjustmentID - 1` as the
     *         zero-based type index within `BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE`.
     *         Triggers `_checkUnexpectedError` with `KPI_EQUITY_BALANCE_ADJ` if no data
     *         is stored for the resolved ID, indicating an unexpected system state rather
     *         than a user-facing revert.
     * @param balanceAdjustmentID  One-based sequential balance adjustment ID to retrieve.
     * @return balanceAdjustment_   Decoded `ScheduledBalanceAdjustment` struct.
     * @return corporateActionId_   Underlying corporate action identifier.
     * @return isDisabled_          True if the balance adjustment has been cancelled.
     */
    function getScheduledBalanceAdjustment(
        uint256 balanceAdjustmentID
    )
        internal
        view
        returns (
            IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            balanceAdjustmentID - 1
        );
        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);
        _checkUnexpectedError(data.length == 0, KPI_EQUITY_BALANCE_ADJ);
        (balanceAdjustment_) = abi.decode(data, (IEquity.ScheduledBalanceAdjustment));
    }

    /**
     * @notice Returns the total number of scheduled balance adjustments registered under
     *         the balance-adjustment corporate action type.
     * @dev    Delegates to `CorporateActionsStorageWrapper.getCorporateActionCountByType`;
     *         O(1) gas cost.
     * @return balanceAdjustmentCount_  Total count of registered balance adjustments,
     *                                  including cancelled ones.
     */
    function getScheduledBalanceAdjustmentsCount() internal view returns (uint256 balanceAdjustmentCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE);
    }

    /**
     * @notice Returns the token balance, decimal precision, and a date-reached flag for
     *         an account at a given date, using snapshot data if available.
     * @dev    Returns zero values and `dateReached_ = false` if `date` has not yet passed
     *         relative to `TimeTravelStorageWrapper.getBlockTimestamp`. When the date has
     *         passed, balance resolution depends on `snapshotId`:
     *           - Non-zero: reads the historical snapshot balance and decimals from
     *             `SnapshotsStorageWrapper`.
     *           - Zero: reads the live adjusted balance via `ERC3643StorageWrapper` and
     *             the adjusted decimal precision via `ERC20StorageWrapper` at `date`.
     *         The `snapshotId == 0` path may reflect subsequent balance changes after
     *         `date`; prefer a non-zero snapshot for a precise point-in-time view.
     * @param date        Unix timestamp of the reference date to evaluate.
     * @param snapshotId  Snapshot ID recorded at `date`; `0` if no snapshot was taken.
     * @param account     Address whose balance is queried.
     * @return balance_      Token balance at `date`; `0` if `date` has not passed.
     * @return decimals_     Token decimal precision at `date`; `0` if `date` has not
     *                       passed.
     * @return dateReached_  True if `date` has passed relative to the current block
     *                       timestamp.
     */
    function getSnapshotBalanceForIfDateReached(
        uint256 date,
        uint256 snapshotId,
        address account
    ) internal view returns (uint256 balance_, uint8 decimals_, bool dateReached_) {
        if (date >= TimeTravelStorageWrapper.getBlockTimestamp()) return (balance_, decimals_, dateReached_);
        dateReached_ = true;
        balance_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(snapshotId, account)
            : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, date);
        decimals_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.decimalsAtSnapshot(snapshotId)
            : ERC20StorageWrapper.decimalsAdjustedAt(date);
    }

    /**
     * @notice Returns whether the equity subsystem has been initialised.
     * @dev    Returns `false` until `initializeEquityDetails` has been called. A `false`
     *         return indicates that rights flags, dividend type, and currency fields are
     *         in their default uninitialised state.
     * @return True if `initializeEquityDetails` has been called at least once; false
     *         otherwise.
     */
    function isEquityInitialized() internal view returns (bool) {
        return _equityStorage().initialized;
    }

    /**
     * @notice Returns the Diamond Storage pointer for `EquityDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_EQUITY_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Slot isolation prevents collisions with other facet
     *         storage structs in the same proxy. Must only be called from within this
     *         library.
     * @return equityData_  Storage pointer to the `EquityDataStorage` struct.
     */
    function _equityStorage() private pure returns (EquityDataStorage storage equityData_) {
        bytes32 position = _EQUITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }
}
