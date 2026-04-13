// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAmortization } from "./IAmortization.sol";
import { _AMORTIZATION_ROLE, _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { AMORTIZATION_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { AmortizationStorageWrapper } from "../../../domain/asset/amortization/AmortizationStorageWrapper.sol";
import { IAmortizationStorageWrapper } from "../../../domain/asset/amortization/IAmortizationStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../../domain/core/CorporateActionsStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";

abstract contract Amortization is IAmortization, Modifiers {
    function setAmortization(
        IAmortization.Amortization calldata _amortization
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_amortization.recordDate)
        returns (bool success_, uint256 amortizationID_)
    {
        CorporateActionsStorageWrapper.requireValidDates(_amortization.recordDate, _amortization.executionDate);
        (, amortizationID_) = AmortizationStorageWrapper.setAmortization(_amortization);
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
    {
        AmortizationStorageWrapper.checkNoActiveAmortizationHolds(_amortizationID);
        AmortizationStorageWrapper.cancelAmortization(_amortizationID);
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
        AmortizationStorageWrapper.releaseAmortizationHold(_amortizationID, _tokenHolder);
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
        returns (uint256 holdId_)
    {
        if (_tokenAmount == 0) revert IAmortizationStorageWrapper.InvalidAmortizationHoldAmount(_amortizationID);
        return AmortizationStorageWrapper.setAmortizationHold(_amortizationID, _tokenHolder, _tokenAmount);
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
        (registeredAmortization_, , isDisabled_) = AmortizationStorageWrapper.getAmortization(_amortizationID);
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
        return AmortizationStorageWrapper.getAmortizationFor(_amortizationID, _account);
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
        return AmortizationStorageWrapper.getAmortizationsFor(_amortizationID, _pageIndex, _pageLength);
    }

    function getAmortizationsCount()
        external
        view
        override
        onlyWithoutMultiPartition
        returns (uint256 amortizationCount_)
    {
        return AmortizationStorageWrapper.getAmortizationsCount();
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
        return AmortizationStorageWrapper.getAmortizationHolders(_amortizationID, _pageIndex, _pageLength);
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
        return AmortizationStorageWrapper.getTotalAmortizationHolders(_amortizationID);
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
        return AmortizationStorageWrapper.getAmortizationActiveHolders(_amortizationID, _pageIndex, _pageLength);
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
        return AmortizationStorageWrapper.getTotalAmortizationActiveHolders(_amortizationID);
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
        return AmortizationStorageWrapper.getTotalHoldByAmortizationId(_amortizationID);
    }

    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override onlyWithoutMultiPartition returns (uint256[] memory activeIds_) {
        return AmortizationStorageWrapper.getActiveAmortizationIds(_pageIndex, _pageLength);
    }

    function getTotalActiveAmortizationIds() external view override onlyWithoutMultiPartition returns (uint256) {
        return AmortizationStorageWrapper.getTotalActiveAmortizationIds();
    }
}
