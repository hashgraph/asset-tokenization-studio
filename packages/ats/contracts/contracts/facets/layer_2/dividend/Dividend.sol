// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDividend } from "./IDividend.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { DIVIDEND_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { DividendStorageWrapper } from "../../../domain/asset/dividend/DividendStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";

abstract contract Dividend is IDividend, Modifiers {
    function setDividend(
        IDividend.Dividend calldata newDividend
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidDates(newDividend.recordDate, newDividend.executionDate)
        onlyValidTimestamp(newDividend.recordDate)
        returns (uint256 dividendId_)
    {
        (, dividendId_) = DividendStorageWrapper.setDividend(newDividend);
    }

    function cancelDividend(
        uint256 dividendId
    )
        external
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        returns (bool success_)
    {
        success_ = DividendStorageWrapper.cancelDividend(dividendId);
    }

    function getDividend(
        uint256 dividendId
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        returns (IDividend.RegisteredDividend memory registeredDividend_, bool isDisabled_)
    {
        (registeredDividend_, , isDisabled_) = DividendStorageWrapper.getDividend(dividendId);
    }

    function getDividendFor(
        uint256 dividendId,
        address account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        returns (IDividend.DividendFor memory dividendFor_)
    {
        return DividendStorageWrapper.getDividendFor(dividendId, account);
    }

    function getDividendAmountFor(
        uint256 dividendId,
        address account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        returns (IDividend.DividendAmountFor memory dividendAmountFor_)
    {
        return DividendStorageWrapper.getDividendAmountFor(dividendId, account);
    }

    function getDividendsCount() external view override returns (uint256 dividendCount_) {
        return DividendStorageWrapper.getDividendsCount();
    }

    function getDividendHolders(
        uint256 dividendId,
        uint256 pageIndex,
        uint256 pageLength
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1)
        returns (address[] memory holders_)
    {
        return DividendStorageWrapper.getDividendHolders(dividendId, pageIndex, pageLength);
    }

    function getTotalDividendHolders(
        uint256 dividendId
    ) external view override onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, dividendId - 1) returns (uint256) {
        return DividendStorageWrapper.getTotalDividendHolders(dividendId);
    }
}
