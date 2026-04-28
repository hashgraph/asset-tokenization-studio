// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDividend } from "./IDividend.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { DIVIDEND_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { Internals } from "../../../domain/Internals.sol";

abstract contract Dividend is IDividend, Internals {
    function setDividend(
        IDividend.Dividend calldata _newDividend
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        validateDates(_newDividend.recordDate, _newDividend.executionDate)
        onlyValidTimestamp(_newDividend.recordDate)
        returns (uint256 dividendID_)
    {
        (, dividendID_) = _setDividend(_newDividend);
    }

    function cancelDividend(
        uint256 _dividendId
    )
        external
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendId - 1)
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        returns (bool success_)
    {
        (success_) = _cancelDividend(_dividendId);
    }

    function getDividend(
        uint256 _dividendID
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (IDividend.RegisteredDividend memory registeredDividend_, bool isDisabled_)
    {
        (registeredDividend_, , isDisabled_) = _getDividend(_dividendID);
    }

    function getDividendFor(
        uint256 _dividendID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (IDividend.DividendFor memory dividendFor_)
    {
        return _getDividendFor(_dividendID, _account);
    }

    function getDividendAmountFor(
        uint256 _dividendID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (IDividend.DividendAmountFor memory dividendAmountFor_)
    {
        return _getDividendAmountFor(_dividendID, _account);
    }

    function getDividendsCount() external view override returns (uint256 dividendCount_) {
        return _getDividendsCount();
    }

    function getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (address[] memory holders_)
    {
        return _getDividendHolders(_dividendID, _pageIndex, _pageLength);
    }

    function getTotalDividendHolders(
        uint256 _dividendID
    ) external view override onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1) returns (uint256) {
        return _getTotalDividendHolders(_dividendID);
    }
}
