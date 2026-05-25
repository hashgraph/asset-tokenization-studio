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
import { NominalValueStorageWrapper } from "./NominalValueStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/// @custom:hash storage Equity
bytes32 constant STORAGE_LOCATION_EQUITY = 0x94fe8bd2c421847f50afb78366b145478e26f82c0fba2861c4fa9ade581d5800;

/**
 * @notice Persistent storage layout for the Equity facet.
 * @dev Captures the equity rights matrix (voting, information, liquidation, subscription,
 *      conversion, redemption, put, dividend) plus the initialised flag. Currency, nominal
 *      value and nominal-value decimals are owned by {NominalValueStorageWrapper}. New
 *      fields must be appended below the marker to preserve ERC-7201 slot offsets.
 * @custom:storage-location erc7201:security.token.standard.storage.Equity
 */
struct EquityDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool initialized;
    bool votingRight;
    bool informationRight;
    bool liquidationRight;
    bool subscriptionRight;
    bool conversionRight;
    bool redemptionRight;
    bool putRight;
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    IEquity.DividendType dividendRight;

    // ─── APPEND-ONLY ZONE BELOW ───
}

/// @title Equity Storage Wrapper
/// @notice Library for managing Equity token storage operations.
/// @author Asset Tokenization Studio Team
library EquityStorageWrapper {
    /**
     * @notice Initialises the equity rights matrix from the supplied deployment data.
     * @dev Copies every right flag plus the dividend type into storage and marks the
     *      facet as initialised. Currency / nominal-value fields live in
     *      {NominalValueStorageWrapper} and are populated separately.
     * @param equityDetailsData The equity rights and dividend type supplied at deployment.
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
        $.initialized = true;
    }

    /**
     * @notice Registers a scheduled balance adjustment as a corporate action.
     * @dev Records the corporate action of type `BALANCE_ADJUSTMENT`, then schedules the
     *      cross-ordered task and the balance-adjustment entry that drive the runtime.
     * @param newBalanceAdjustment The balance-adjustment payload to schedule.
     * @return corporateActionId_ The corporate action identifier issued for the adjustment.
     * @return balanceAdjustmentID_ The one-based index of the adjustment within its type list.
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
     * @notice Cancels a previously scheduled balance adjustment that has not yet executed.
     * @dev Reverts via {BalanceAdjustmentAlreadyExecuted} if the execution date has already
     *      been reached at the current block timestamp; otherwise marks the underlying
     *      corporate action as cancelled.
     * @param balanceAdjustmentId The one-based index of the adjustment within its type list.
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
     * @notice Schedules the runtime tasks that materialise a balance adjustment.
     * @dev Reverts with {BalanceAdjustmentCreationFailed} when the corporate action
     *      identifier is zero. Otherwise registers the cross-ordered scheduled task and
     *      the balance-adjustment task at the supplied execution date.
     * @param actionId The corporate action identifier returned by the registry.
     * @param data The ABI-encoded {ScheduledBalanceAdjustment} payload.
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
     * @notice Returns the aggregated equity details, combining rights and nominal-value data.
     * @dev Reads rights and dividend type from this wrapper's storage and currency, nominal
     *      value, nominal-value decimals from {NominalValueStorageWrapper}.
     * @return equityDetails_ The equity details snapshot.
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
            currency: NominalValueStorageWrapper.getNominalValueCurrency(),
            nominalValue: NominalValueStorageWrapper.getNominalValue(),
            nominalValueDecimals: NominalValueStorageWrapper.getNominalValueDecimals()
        });
    }

    /**
     * @notice Returns a scheduled balance adjustment by its one-based identifier.
     * @dev Resolves the corporate action id via the registry, decodes the persisted bytes
     *      payload, and reports whether the corporate action has been disabled.
     *      Reverts via {_checkUnexpectedError} when the underlying payload is empty.
     * @param balanceAdjustmentID The one-based index of the adjustment within its type list.
     * @return balanceAdjustment_ The decoded scheduled balance adjustment.
     * @return corporateActionId_ The corporate action identifier that backs the adjustment.
     * @return isDisabled_ Whether the corporate action has been cancelled.
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
     * @notice Returns the total number of balance adjustments scheduled for this token.
     * @return balanceAdjustmentCount_ The count of corporate actions of type BALANCE_ADJUSTMENT.
     */
    function getScheduledBalanceAdjustmentsCount() internal view returns (uint256 balanceAdjustmentCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT);
    }

    /**
     * @notice Returns a holder's balance and the token decimals at a given date, if reached.
     * @dev When `date` is still in the future, returns zeros with `dateReached_` false; when
     *      reached, draws from the supplied snapshot (if non-zero) or from the historical
     *      ERC-3643 adjusted balance / ERC-20 adjusted decimals at that date.
     * @param date The reference timestamp.
     * @param snapshotId The snapshot identifier to read from, or zero to use the adjusted history.
     * @param account The token holder being inspected.
     * @return balance_ The holder's total balance at the reference date.
     * @return decimals_ The token decimals applicable at the reference date.
     * @return dateReached_ Whether `date` is at or before the current block timestamp.
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
     * @notice Indicates whether the equity storage has been initialised.
     * @return Whether {initializeEquityDetails} has already been executed for this token.
     */
    function isEquityInitialized() internal view returns (bool) {
        return _equityStorage().initialized;
    }

    /**
     * @notice Returns the storage reference at the ERC-7201 slot for the equity namespace.
     * @dev Resolved via inline assembly against {STORAGE_LOCATION_EQUITY}.
     * @return equityData_ The storage reference for the equity data struct.
     */
    function _equityStorage() private pure returns (EquityDataStorage storage equityData_) {
        bytes32 position = STORAGE_LOCATION_EQUITY;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }
}
