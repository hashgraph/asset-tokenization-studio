// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAmortization } from "./IAmortization.sol";
import { _AMORTIZATION_ROLE, _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { AMORTIZATION_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { Internals } from "../../../domain/Internals.sol";

abstract contract Amortization is IAmortization, Internals {
    function setAmortization(
        IAmortization.Amortization calldata _amortization
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyRole(_CORPORATE_ACTION_ROLE)
        validateDates(_amortization.recordDate, _amortization.executionDate)
        onlyValidTimestamp(_amortization.recordDate)
        returns (bool success_, uint256 amortizationID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, amortizationID_) = _setAmortization(_amortization);
        success_ = true;
    }

    function cancelAmortization(
        uint256 _amortizationID
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyNoActiveAmortizationHolds(_amortizationID)
    {
        _cancelAmortization(_amortizationID);
    }

    function releaseAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyRole(_AMORTIZATION_ROLE)
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
    {
        _releaseAmortizationHold(_amortizationID, _tokenHolder);
    }

    function setAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder,
        uint256 _tokenAmount
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyRole(_AMORTIZATION_ROLE)
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        onlyPositiveTokenAmount(_tokenAmount, _amortizationID)
        returns (uint256 holdId_)
    {
        return _setAmortizationHold(_amortizationID, _tokenHolder, _tokenAmount);
    }

    function getAmortization(
        uint256 _amortizationID
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        returns (RegisteredAmortization memory registeredAmortization_, bool isDisabled_)
    {
        (registeredAmortization_, , isDisabled_) = _getAmortization(_amortizationID);
    }

    function getAmortizationFor(
        uint256 _amortizationID,
        address _account
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        returns (AmortizationFor memory amortizationFor_)
    {
        return _getAmortizationFor(_amortizationID, _account);
    }

    function getAmortizationsFor(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        returns (AmortizationFor[] memory amortizationsFor_, address[] memory holders_)
    {
        return _getAmortizationsFor(_amortizationID, _pageIndex, _pageLength);
    }

    function getAmortizationsCount()
        external
        view
        override
        onlyWithoutMultiPartition
        returns (uint256 amortizationCount_)
    {
        return _getAmortizationsCount();
    }

    function getAmortizationHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        returns (address[] memory holders_)
    {
        return _getAmortizationHolders(_amortizationID, _pageIndex, _pageLength);
    }

    function getTotalAmortizationHolders(
        uint256 _amortizationID
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        returns (uint256)
    {
        return _getTotalAmortizationHolders(_amortizationID);
    }

    function getAmortizationActiveHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        returns (address[] memory holders_)
    {
        return _getAmortizationActiveHolders(_amortizationID, _pageIndex, _pageLength);
    }

    function getTotalAmortizationActiveHolders(
        uint256 _amortizationID
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        returns (uint256)
    {
        return _getTotalAmortizationActiveHolders(_amortizationID);
    }

    function getTotalHoldByAmortizationId(
        uint256 _amortizationID
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        returns (uint256)
    {
        return _getTotalHoldByAmortizationId(_amortizationID);
    }

    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override onlyWithoutMultiPartition returns (uint256[] memory activeIds_) {
        return _getActiveAmortizationIds(_pageIndex, _pageLength);
    }

    function getTotalActiveAmortizationIds() external view override onlyWithoutMultiPartition returns (uint256) {
        return _getTotalActiveAmortizationIds();
    }
}
