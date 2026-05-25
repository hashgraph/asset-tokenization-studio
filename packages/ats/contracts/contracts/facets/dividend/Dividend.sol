// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDividend } from "./IDividend.sol";
import { IDividendTypes } from "./IDividendTypes.sol";
import { ROLE_CORPORATE_ACTION } from "../../constants/roles.sol";
import { CORPORATE_ACTION_TYPE_DIVIDEND } from "../../constants/dispatchTypes.sol";
import { DividendStorageWrapper } from "../../domain/asset/DividendStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title Dividend
 * @author Asset Tokenization Studio Team
 * @notice Abstract base providing the writer-side dividend lifecycle exposed by `DividendFacet`
 *         (`setDividend`, `cancelDividend`) plus the record/per-account read helpers consumers
 *         need before executing a dividend.
 * @dev Thin forwarder over `DividendStorageWrapper`; holds no storage of its own. All write
 *      paths are restricted to `ROLE_CORPORATE_ACTION` and gated by the unpaused state. Read
 *      paths are guarded by `onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND,
 *      dividendId - 1)` so an attacker cannot use a non-dividend corporate-action id to read
 *      dividend slots.
 */
abstract contract Dividend is IDividend, Modifiers {
    /// @inheritdoc IDividend
    /// @dev Restricted to `ROLE_CORPORATE_ACTION`; gated by `onlyUnpaused`,
    ///      `onlyValidDates(recordDate, executionDate)`, and `onlyValidTimestamp(recordDate)`.
    function setDividend(
        IDividendTypes.Dividend calldata newDividend
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION)
        onlyValidDates(newDividend.recordDate, newDividend.executionDate)
        onlyValidTimestamp(newDividend.recordDate)
        returns (uint256 dividendId_)
    {
        (, dividendId_) = DividendStorageWrapper.setDividend(newDividend);
    }

    /// @inheritdoc IDividend
    /// @dev Restricted to `ROLE_CORPORATE_ACTION`; gated by `onlyUnpaused` and
    ///      `onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)`.
    function cancelDividend(
        uint256 dividendId
    )
        external
        override
        onlyActivated
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION)
        returns (bool success_)
    {
        success_ = DividendStorageWrapper.cancelDividend(dividendId);
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)
        returns (IDividendTypes.DividendAmountFor memory dividendAmountFor_)
    {
        return DividendStorageWrapper.getDividendAmountFor(dividendId, account);
    }

    /// @inheritdoc IDividend
    function getDividendsCount() external view override returns (uint256 dividendCount_) {
        return DividendStorageWrapper.getDividendsCount();
    }
}
