// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KPI_EQUITY_BALANCE_ADJ } from "../../constants/values.sol";
import {
    CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT,
    SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT
} from "../../constants/dispatchTypes.sol";
import { IEquity } from "../../facets/layer_2/equity/IEquity.sol";
import { IScheduledBalanceAdjustment } from "../../facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { NominalValueStorageWrapper } from "./nominalValue/NominalValueStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/// @custom:hash storage Equity
bytes32 constant STORAGE_LOCATION_EQUITY = 0x94fe8bd2c421847f50afb78366b145478e26f82c0fba2861c4fa9ade581d5800;

/**
 * @notice Diamond-storage layout for equity-specific rights and configuration.
 * @dev Stored at `_EQUITY_STORAGE_POSITION` via `EquityStorageWrapper._equityStorage()`.
 *      `initialized` guards against re-initialisation. Rights flags and `currency` are
 *      set once at token deployment by `EquityStorageWrapper.initializeEquityDetails`.
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
    bool initialized;
}

/// @title Equity Storage Wrapper
/// @notice Library for managing Equity token storage operations.
/// @author Asset Tokenization Studio Team
library EquityStorageWrapper {
    /**
     * @notice Writes the equity rights and configuration flags into diamond storage.
     * @dev Intended to be called once at token deployment. Does not enforce
     *      non-re-initialisation internally — callers must check `isEquityInitialized`
     *      beforehand. Sets `initialized` to `true` on completion.
     * @param equityDetailsData Struct containing voting, information, liquidation, subscription,
     *                          conversion, redemption, and put rights, dividend type, and currency.
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
     * @notice Creates a new scheduled balance adjustment corporate action.
     * @dev Encodes `newBalanceAdjustment`, delegates creation to
     *      `CorporateActionsStorageWrapper.addCorporateAction`, and calls `initBalanceAdjustment`
     *      to schedule the execution task.
     * @param newBalanceAdjustment     The balance adjustment parameters including execution date.
     * @return corporateActionId_      Identifier of the underlying corporate action.
     * @return balanceAdjustmentID_    One-indexed identifier of the newly created adjustment.
     */
    function setScheduledBalanceAdjustment(
        IScheduledBalanceAdjustment.ScheduledBalanceAdjustment calldata newBalanceAdjustment
    ) internal returns (bytes32 corporateActionId_, uint256 balanceAdjustmentID_) {
        bytes memory data = abi.encode(newBalanceAdjustment);

        (corporateActionId_, balanceAdjustmentID_) = CorporateActionsStorageWrapper.addCorporateAction(
            CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT,
            data
        );

        initBalanceAdjustment(corporateActionId_, data);
    }

    /**
     * @notice Cancels a pending scheduled balance adjustment, enforcing that the execution date
     *         has not yet been reached.
     * @dev Validates the action type via `requireMatchingActionType`, then reverts with
     *      `IScheduledBalanceAdjustment.BalanceAdjustmentAlreadyExecuted` if the execution date
     *      is in the past. Delegates the cancellation to
     *      `CorporateActionsStorageWrapper.cancelCorporateAction`.
     * @param balanceAdjustmentId The identifier of the balance adjustment to cancel.
     */
    function cancelScheduledBalanceAdjustment(uint256 balanceAdjustmentId) internal {
        CorporateActionsStorageWrapper.requireMatchingActionType(
            CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT,
            balanceAdjustmentId - 1
        );
        IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory balanceAdjustment;
        bytes32 corporateActionId;
        (balanceAdjustment, corporateActionId, ) = getScheduledBalanceAdjustment(balanceAdjustmentId);
        if (balanceAdjustment.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IScheduledBalanceAdjustment.BalanceAdjustmentAlreadyExecuted(corporateActionId, balanceAdjustmentId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
    }

    /**
     * @notice Cancels a scheduled balance adjustment unconditionally, bypassing the
     *         already-executed guard.
     * @dev Use when administrative override is required after the execution date has passed.
     *      Delegates to `CorporateActionsStorageWrapper.cancelCorporateAction` directly.
     * @param balanceAdjustmentId The identifier of the balance adjustment to cancel.
     */
    function forceCancelScheduledBalanceAdjustment(uint256 balanceAdjustmentId) internal {
        bytes32 corporateActionId;
        (, corporateActionId, ) = getScheduledBalanceAdjustment(balanceAdjustmentId);
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
    }

    /**
     * @notice Schedules the execution task for a newly created balance adjustment corporate
     *         action.
     * @dev Decodes `data` into `IScheduledBalanceAdjustment.ScheduledBalanceAdjustment` and
     *      registers a cross-ordered balance-adjustment task at `executionDate` via
     *      `ScheduledTasksStorageWrapper`. Reverts with
     *      `IScheduledBalanceAdjustment.BalanceAdjustmentCreationFailed` if `actionId` is zero.
     * @param actionId The corporate action identifier (must be non-zero).
     * @param data     ABI-encoded `IScheduledBalanceAdjustment.ScheduledBalanceAdjustment` struct.
     */
    function initBalanceAdjustment(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IScheduledBalanceAdjustment.BalanceAdjustmentCreationFailed();
        }

        IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory newBalanceAdjustment = abi.decode(
            data,
            (IScheduledBalanceAdjustment.ScheduledBalanceAdjustment)
        );

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(
            newBalanceAdjustment.executionDate,
            SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT
        );
        ScheduledTasksStorageWrapper.addScheduledBalanceAdjustment(newBalanceAdjustment.executionDate, actionId);
    }

    /**
     * @notice Returns the full equity rights and configuration record from storage.
     * @dev Assembles `IEquity.EquityDetailsData` from individual storage flags and appends the
     *      live nominal value from `NominalValueStorageWrapper`.
     * @return equityDetails_ Struct containing all equity rights flags, dividend type, currency,
     *                        nominal value, and nominal value decimals.
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
            nominalValue: NominalValueStorageWrapper.getNominalValue(),
            nominalValueDecimals: NominalValueStorageWrapper.getNominalValueDecimals()
        });
    }

    /**
     * @notice Retrieves the full balance adjustment record, corporate action ID, and disabled
     *         status.
     * @dev Resolves the corporate action ID by type index, fetches and decodes the stored bytes.
     *      Uses `_checkUnexpectedError` (panic guard) to assert data is non-empty.
     * @param balanceAdjustmentID     The one-indexed identifier of the adjustment.
     * @return balanceAdjustment_     Decoded balance adjustment struct.
     * @return corporateActionId_     Underlying corporate action identifier.
     * @return isDisabled_            True if the adjustment has been cancelled.
     */
    function getScheduledBalanceAdjustment(
        uint256 balanceAdjustmentID
    )
        internal
        view
        returns (
            IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory balanceAdjustment_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT,
            balanceAdjustmentID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        _checkUnexpectedError(data.length == 0, KPI_EQUITY_BALANCE_ADJ);
        (balanceAdjustment_) = abi.decode(data, (IScheduledBalanceAdjustment.ScheduledBalanceAdjustment));
    }

    /**
     * @notice Returns the total number of scheduled balance adjustment corporate actions ever
     *         created.
     * @dev Delegates to `CorporateActionsStorageWrapper.getCorporateActionCountByType`.
     * @return balanceAdjustmentCount_ Total count of registered balance adjustments.
     */
    function getScheduledBalanceAdjustmentsCount() internal view returns (uint256 balanceAdjustmentCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT);
    }

    /**
     * @notice Returns a holder's token balance and decimals at `date`, if `date` has already
     *         passed.
     * @dev Returns zeros and `false` when `date` is still in the future. Balance and decimals are
     *      sourced from the bound snapshot (if `snapshotId != 0`) or from ABAF-adjusted ERC3643
     *      and ERC20 storage at `date`.
     * @param date       The reference timestamp to compare against the current block.
     * @param snapshotId Snapshot identifier (zero means no snapshot is bound).
     * @param account    The holder address to query.
     * @return balance_     Token balance of `account` at `date`, or zero.
     * @return decimals_    Token decimals at `date`, or zero.
     * @return dateReached_ True if `date` is in the past.
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
            : TokenCoreOps.getTotalBalanceForAdjustedAt(account, date);

        decimals_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.decimalsAtSnapshot(snapshotId)
            : ERC20StorageWrapper.decimalsAdjustedAt(date);
    }

    /**
     * @notice Returns whether the equity storage has been initialised.
     * @dev Reads the `initialized` flag from `EquityDataStorage`. Use as a guard before calling
     *      `initializeEquityDetails`.
     * @return True if equity details have already been set; false otherwise.
     */
    function isEquityInitialized() internal view returns (bool) {
        return _equityStorage().initialized;
    }

    /**
     * @notice Returns a storage pointer to `EquityDataStorage` at the dedicated slot.
     * @dev Uses inline assembly with the diamond-storage pattern to load the struct pointer at
     *      `_EQUITY_STORAGE_POSITION`.
     * @return equityData_ Storage reference to the equity data layout.
     */
    function _equityStorage() private pure returns (EquityDataStorage storage equityData_) {
        bytes32 position = STORAGE_LOCATION_EQUITY;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }
}
