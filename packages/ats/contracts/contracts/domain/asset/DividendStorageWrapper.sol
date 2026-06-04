// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SNAPSHOT_RESULT_ID } from "../../constants/values.sol";
import { CORPORATE_ACTION_TYPE_DIVIDEND, SCHEDULED_TASK_TYPE_SNAPSHOT } from "../../constants/dispatchTypes.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IDividend } from "../../facets/dividend/IDividend.sol";
import { IDividendTypes } from "../../facets/dividend/IDividendTypes.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
/**
 * @title Dividend Storage Wrapper Library
 * @notice Provides internal functions to manage lifecycle and queries for dividend
 *         corporate actions.
 * @dev This library encapsulates low-level storage calls for dividend-related data
 *      using the corporate actions, scheduled tasks, snapshots and ERC20/ERC1410
 *      storage wrappers. All functions are internal and intended to be used by
 *      dividend-aware contracts in the system. The library does not hold state.
 * @author Asset Tokenization Studio Team
 */
library DividendStorageWrapper {
    /**
     * @notice Creates and registers a new dividend corporate action and initialises
     *         associated scheduled tasks.
     * @dev Encodes the dividend struct, delegates creation to
     *      `CorporateActionsStorageWrapper.addCorporateAction`, then calls
     *      `initDividend` to schedule snapshot and record-date tasks. Reverts if
     *      the underlying corporate action creation fails.
     * @param newDividend The dividend parameters (record date, execution date,
     *                    amount, etc.)
     * @return corporateActionId_ The unique identifier for the created corporate
     *                            action
     * @return dividendId_ The sequential dividend identifier (1-indexed) within
     *                     the dividend type
     */
    function setDividend(
        IDividendTypes.Dividend calldata newDividend
    ) internal returns (bytes32 corporateActionId_, uint256 dividendId_) {
        bytes memory data = abi.encode(newDividend);

        (corporateActionId_, dividendId_) = CorporateActionsStorageWrapper.addCorporateAction(
            CORPORATE_ACTION_TYPE_DIVIDEND,
            data
        );

        initDividend(corporateActionId_, data);

        emit IDividend.DividendSet(
            corporateActionId_,
            dividendId_,
            EvmAccessors.getMsgSender(),
            newDividend.recordDate,
            newDividend.executionDate,
            newDividend.amount,
            newDividend.amountDecimals
        );
    }

    /**
     * @notice Cancels a pending dividend by disabling its corporate action.
     * @dev Checks that the dividend execution date is still in the future;
     *      otherwise reverts with `DividendAlreadyExecuted`. Calls
     *      `CorporateActionsStorageWrapper.cancelCorporateAction` to mark the
     *      action as disabled and emits `DividendCancelled`.
     * @param dividendId The identifier of the dividend to cancel
     * @return success_ Always true if no revert occurred
     */
    function cancelDividend(uint256 dividendId) internal returns (bool success_) {
        (IDividendTypes.RegisteredDividend memory registeredDividend, bytes32 corporateActionId, ) = getDividend(
            dividendId
        );

        if (registeredDividend.dividend.executionDate <= EvmAccessors.getBlockTimestamp()) {
            revert IDividend.DividendAlreadyExecuted(corporateActionId, dividendId);
        }

        _executeCancelDividend(corporateActionId);
        success_ = true;

        emit IDividend.DividendCancelled(dividendId, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Cancels a dividend unconditionally, bypassing the execution-date guard.
     * @dev Use when administrative override is required after the execution date has passed.
     *      Delegates to `_executeCancelDividend` directly.
     * @param dividendId The identifier of the dividend to cancel.
     * @return success_ Always true if no revert occurred.
     */
    function forceCancelDividend(uint256 dividendId) internal returns (bool success_) {
        (, bytes32 corporateActionId, ) = getDividend(dividendId);
        _executeCancelDividend(corporateActionId);
        success_ = true;
    }

    /**
     * @notice Initialises scheduled tasks for a newly created dividend corporate
     *         action.
     * @dev Decodes the dividend data from bytes and adds a scheduled cross-ordered
     *      task for the record date (snapshot trigger) and a snapshot linked to
     *      the action ID. Reverts with `DividendCreationFailed` if the action ID
     *      is zero.
     * @param actionId The corporate action identifier (must be non-zero)
     * @param data The ABI-encoded `IDividendTypes.Dividend` struct
     */
    function initDividend(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IDividend.DividendCreationFailed();
        }

        IDividendTypes.Dividend memory newDividend = abi.decode(data, (IDividendTypes.Dividend));

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newDividend.recordDate, SCHEDULED_TASK_TYPE_SNAPSHOT);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newDividend.recordDate, actionId);
    }

    /**
     * @notice Retrieves the full registered dividend record, corporate action ID,
     *         and disabled status for a given dividend.
     * @dev Obtains the corporate action identifier by index, fetches its data,
     *      decodes the dividend, and reads the associated snapshot result ID.
     *      Uses `assert` to ensure the stored data is non-empty — this will cause
     *      a panic if the corporate action data is inconsistent.
     * @param dividendId The dividend identifier (1-indexed)
     * @return registeredDividend_ The stored dividend struct and its snapshot ID
     * @return corporateActionId_ The underlying corporate action identifier
     * @return isDisabled_ Whether the dividend has been cancelled (disabled)
     */
    function getDividend(
        uint256 dividendId
    )
        internal
        view
        returns (
            IDividendTypes.RegisteredDividend memory registeredDividend_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_DIVIDEND,
            dividendId - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        assert(data.length > 0);
        (registeredDividend_.dividend) = abi.decode(data, (IDividendTypes.Dividend));

        registeredDividend_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
    }

    /**
     * @notice Retrieves dividend-related information for a specific account,
     *         including token balance and decimals at the record date.
     * @dev Calls `getDividend` to obtain the dividend record, then uses the
     *      helper `SnapshotsStorageWrapper.getSnapshotTakenBalance` to determine
     *      the holder's balance, token decimals, and whether the record date has
     *      already been reached.
     * @param dividendId The dividend identifier
     * @param account The address of the holder to query
     * @return dividendFor_ Struct containing amount, decimals, record date,
     *                      execution date, disabled flag, token balance, and
     *                      record‑date‑reached status
     */
    function getDividendFor(
        uint256 dividendId,
        address account
    ) internal view returns (IDividendTypes.DividendFor memory dividendFor_) {
        (IDividendTypes.RegisteredDividend memory registeredDividend, , bool isDisabled) = getDividend(dividendId);

        dividendFor_.amount = registeredDividend.dividend.amount;
        dividendFor_.amountDecimals = registeredDividend.dividend.amountDecimals;
        dividendFor_.recordDate = registeredDividend.dividend.recordDate;
        dividendFor_.executionDate = registeredDividend.dividend.executionDate;
        dividendFor_.isDisabled = isDisabled;

        (dividendFor_.tokenBalance, dividendFor_.decimals, dividendFor_.recordDateReached) = SnapshotsStorageWrapper
            .getSnapshotTakenBalance(registeredDividend.dividend.recordDate, registeredDividend.snapshotId, account);
    }

    /**
     * @notice Computes the exact dividend amount payable to a given account for a
     *         specific dividend.
     * @dev If the record date has not yet been reached, returns an empty struct
     *      with `recordDateReached` set to false. Otherwise sets
     *      `recordDateReached` to true and calculates the proportional amount as
     *      `tokenBalance * amount / 10^(tokenDecimals + amountDecimals)`.
     *      The numerator is staged via `Math.mulDiv(tokenBalance, amount, 10^tokenDecimals)`
     *      to avoid a direct two-value overflow: the token-decimal scale is consumed inside
     *      a 512-bit intermediate, and the denominator is reduced to `10^amountDecimals`.
     *      The resulting fraction is mathematically equivalent; intermediate products remain
     *      bounded even for large institutional balances or high-precision dividend amounts.
     * @param dividendId The dividend identifier
     * @param account The holder address
     * @return dividendAmountFor_ Struct containing the fraction (numerator,
     *                            denominator) and the record‑date‑reached flag
     * @custom:revert ICommonErrors.ExponentOverflow If `amountDecimals` is ≥ 78,
     *         making `10 ** amountDecimals` overflow `uint256`.
     */
    function getDividendAmountFor(
        uint256 dividendId,
        address account
    ) internal view returns (IDividendTypes.DividendAmountFor memory dividendAmountFor_) {
        IDividendTypes.DividendFor memory dividendFor = getDividendFor(dividendId, account);

        if (!dividendFor.recordDateReached) return dividendAmountFor_;

        dividendAmountFor_.recordDateReached = true;

        dividendAmountFor_.numerator = Math.mulDiv(
            dividendFor.tokenBalance,
            dividendFor.amount,
            DecimalsLib.pow10(dividendFor.decimals)
        );

        DecimalsLib.checkExponentOverflow(dividendFor.amountDecimals);
        dividendAmountFor_.denominator = DecimalsLib.pow10(dividendFor.amountDecimals);
    }

    /**
     * @notice Returns the total number of dividends registered under the dividend
     *         corporate action type.
     * @dev Delegates to `CorporateActionsStorageWrapper.getCorporateActionCountByType`.
     * @return dividendCount_ The current count of dividends created
     */
    function getDividendsCount() internal view returns (uint256 dividendCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(CORPORATE_ACTION_TYPE_DIVIDEND);
    }

    /**
     * @notice Retrieves a paginated list of holders for a given dividend.
     * @dev If the record date has not yet passed, returns an empty array. If a
     *      snapshot exists for this dividend, holders are fetched from that
     *      snapshot; otherwise the current token holders from ERC1410 storage are
     *      returned.
     * @param dividendId The dividend identifier
     * @param pageIndex Zero-based index of the page to retrieve
     * @param pageLength Number of holders per page
     * @return holders_ Array of holder addresses for the requested page
     */
    function getDividendHolders(
        uint256 dividendId,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        (IDividendTypes.RegisteredDividend memory registeredDividend, , ) = getDividend(dividendId);

        if (registeredDividend.dividend.recordDate >= EvmAccessors.getBlockTimestamp()) return new address[](0);

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredDividend.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    /**
     * @notice Returns the total number of holders for a given dividend.
     * @dev Same logic as `getDividendHolders` but returns the total count instead
     *      of a paginated list. If record date not reached, returns zero.
     * @param dividendId The dividend identifier
     * @return Total number of holders for the dividend
     */
    function getTotalDividendHolders(uint256 dividendId) internal view returns (uint256) {
        (IDividendTypes.RegisteredDividend memory registeredDividend, , ) = getDividend(dividendId);

        if (registeredDividend.dividend.recordDate >= EvmAccessors.getBlockTimestamp()) return 0;

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredDividend.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    /**
     * @notice Internal helper to fetch an account's token balance and decimals at
     *         a specific date, if that date has already passed.
     * @dev If the given `date` is not yet reached, returns zeros and false.
     *      Otherwise, if a snapshot ID is present, reads the balance and decimals
     *      from that snapshot; otherwise reads from the adjusted ERC20/ERC3643
     *      storage at the given date.
     * @param date The reference timestamp to compare against the current
     *             block timestamp
     * @param snapshotId The snapshot identifier (zero means no snapshot)
     * @param account The address to query
     * @return balance_ The token balance of the account at the date (or zero)
     * @return decimals_ The token decimals at the date (or zero)
     * @return dateReached_ True if the date is in the past, false otherwise
     */
    /**
     * @notice Performs the storage write that cancels a dividend corporate action.
     * @param corporateActionId The corporate-action identifier linked to the dividend.
     */
    function _executeCancelDividend(bytes32 corporateActionId) private {
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
    }
}
