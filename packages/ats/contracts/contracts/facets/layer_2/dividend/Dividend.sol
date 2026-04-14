// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { DIVIDEND_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { IDividend } from "./IDividend.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { DividendStorageWrapper } from "../../../domain/asset/DividendStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract Dividend is IDividend, Modifiers {
    function setDividend(
        IDividend.Dividend calldata _newDividend
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidDates(_newDividend.recordDate, _newDividend.executionDate)
        onlyValidTimestamp(_newDividend.recordDate)
        returns (uint256 dividendID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, dividendID_) = DividendStorageWrapper.setDividend(_newDividend);
        emit IDividend.DividendSet(
            corporateActionID,
            dividendID_,
            EvmAccessors.getMsgSender(),
            _newDividend.recordDate,
            _newDividend.executionDate,
            _newDividend.amount,
            _newDividend.amountDecimals
        );
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
        (success_) = DividendStorageWrapper.cancelDividend(_dividendId);
        if (success_) {
            emit IDividend.DividendCancelled(_dividendId, EvmAccessors.getMsgSender());
        }
    }

    function getDividend(
        uint256 _dividendID
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (RegisteredDividend memory registeredDividend_, bool isDisabled_)
    {
        (registeredDividend_, , isDisabled_) = DividendStorageWrapper.getDividend(_dividendID);
    }

    function getDividendFor(
        uint256 _dividendID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (DividendFor memory dividendFor_)
    {
        return DividendStorageWrapper.getDividendFor(_dividendID, _account);
    }

    function getDividendAmountFor(
        uint256 _dividendID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1)
        returns (DividendAmountFor memory dividendAmountFor_)
    {
        return DividendStorageWrapper.getDividendAmountFor(_dividendID, _account);
    }

    function getDividendsCount() external view override returns (uint256 dividendCount_) {
        return DividendStorageWrapper.getDividendsCount();
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
        return DividendStorageWrapper.getDividendHolders(_dividendID, _pageIndex, _pageLength);
    }

    function getTotalDividendHolders(
        uint256 _dividendID
    ) external view override onlyMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1) returns (uint256) {
        return DividendStorageWrapper.getTotalDividendHolders(_dividendID);
    }
}
