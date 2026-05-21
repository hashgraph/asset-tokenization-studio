// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDividend } from "./IDividend.sol";
import { IDividendTypes } from "./IDividendTypes.sol";
import { CORPORATE_ACTION_ROLE, CORPORATE_ACTION_CANCEL_ADMIN_ROLE } from "../../constants/roles.sol";
import { DIVIDEND_CORPORATE_ACTION_TYPE } from "../../constants/values.sol";
import { DividendStorageWrapper } from "../../domain/asset/dividend/DividendStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Dividend
 * @author Asset Tokenization Studio Team
 * @notice Abstract base providing the writer-side dividend lifecycle exposed by `DividendFacet`
 *         (`setDividend`, `cancelDividend`) plus the record/per-account read helpers consumers
 *         need before executing a dividend.
 * @dev Thin forwarder over `DividendStorageWrapper`; holds no storage of its own. All write
 *      paths are restricted to `CORPORATE_ACTION_ROLE` and gated by the unpaused state. Read
 *      paths are guarded by `onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE,
 *      dividendId - 1)` so an attacker cannot use a non-dividend corporate-action id to read
 *      dividend slots.
 */
abstract contract Dividend is IDividend, Modifiers {
    /// @inheritdoc IDividend
    /// @dev Restricted to `CORPORATE_ACTION_ROLE`; gated by `onlyUnpaused`,
    ///      `onlyValidDates(recordDate, executionDate)`, and `onlyValidTimestamp(recordDate)`.
    function setDividend(
        IDividendTypes.Dividend calldata newDividend
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(CORPORATE_ACTION_ROLE)
        onlyValidDates(newDividend.recordDate, newDividend.executionDate)
        onlyValidTimestamp(newDividend.recordDate)
        returns (uint256 dividendId_)
    {
        (, dividendId_) = DividendStorageWrapper.setDividend(newDividend);
    }

    /// @inheritdoc IDividend
    /// @dev Restricted to `CORPORATE_ACTION_ROLE`; gated by `onlyUnpaused` and
    ///      `onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)`.
    function cancelDividend(
        uint256 dividendId
    )
        external
        override
        onlyActivated
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        onlyUnpaused
        onlyRole(CORPORATE_ACTION_ROLE)
        returns (bool success_)
    {
        success_ = DividendStorageWrapper.cancelDividend(dividendId);
    }

    /// @inheritdoc IDividend
    /// @dev Restricted to `CORPORATE_ACTION_CANCEL_ADMIN_ROLE`; gated by `onlyUnpaused` and
    ///      `onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)`.
    function forceCancelDividend(
        uint256 dividendId
    )
        external
        override
        onlyActivated
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        onlyUnpaused
        onlyRole(CORPORATE_ACTION_CANCEL_ADMIN_ROLE)
        returns (bool success_)
    {
        success_ = DividendStorageWrapper.forceCancelDividend(dividendId);
        emit IDividend.DividendForceCancelled(dividendId, EvmAccessors.getMsgSender());
    }

    /// @inheritdoc IDividend
    /// @dev Reverts via `onlyMatchingActionType` if `dividendId` does not match the dividend
    ///      corporate-action type at index `dividendId - 1`.
    function getDividend(
        uint256 dividendId
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        returns (IDividendTypes.RegisteredDividend memory registeredDividend_, bool isDisabled_)
    {
        (registeredDividend_, , isDisabled_) = DividendStorageWrapper.getDividend(dividendId);
    }

    /// @inheritdoc IDividend
    /// @dev Reverts via `onlyMatchingActionType` if `dividendId` does not match the dividend
    ///      corporate-action type at index `dividendId - 1`.
    function getDividendFor(
        uint256 dividendId,
        address account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        returns (IDividendTypes.DividendFor memory dividendFor_)
    {
        return DividendStorageWrapper.getDividendFor(dividendId, account);
    }

    /// @inheritdoc IDividend
    /// @dev Reverts via `onlyMatchingActionType` if `dividendId` does not match the dividend
    ///      corporate-action type at index `dividendId - 1`.
    function getDividendAmountFor(
        uint256 dividendId,
        address account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        returns (IDividendTypes.DividendAmountFor memory dividendAmountFor_)
    {
        return DividendStorageWrapper.getDividendAmountFor(dividendId, account);
    }

    /// @inheritdoc IDividend
    function getDividendsCount() external view override returns (uint256 dividendCount_) {
        return DividendStorageWrapper.getDividendsCount();
    }
}
