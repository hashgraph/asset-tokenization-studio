// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAmortization } from "./IAmortization.sol";
import { AMORTIZATION_ROLE, CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { AMORTIZATION_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { AmortizationStorageWrapper } from "../../../domain/asset/amortization/AmortizationStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { _AMORTIZATION_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/**
 * @title Amortization Facet
 * @notice Manages amortization corporate actions and related token holder holds.
 * @dev Implements amortization lifecycle operations through shared storage wrappers and
 *      enforces operational, activation, pause, role, date, and partition constraints.
 * @author Hashgraph
 */
abstract contract Amortization is IAmortization, Modifiers {
    /// @inheritdoc IAmortization
    /// @dev Registers the amortization facet as ready and can only be executed once by an admin.
    function initializeAmortization()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_AMORTIZATION_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_AMORTIZATION_RESOLVER_KEY);
        emit AmortizationInitialized();
    }

    /// @inheritdoc IAmortization
    /// @dev Requires an operational, activated, unpaused, single-partition token and valid dates.
    function setAmortization(
        IAmortization.Amortization calldata _amortization
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyRole(CORPORATE_ACTION_ROLE)
        onlyValidDates(_amortization.recordDate, _amortization.executionDate)
        onlyValidTimestamp(_amortization.recordDate)
        onlyValidDates(_amortization.recordDate, _amortization.executionDate)
        returns (bool success_, uint256 amortizationID_)
    {
        (, amortizationID_) = AmortizationStorageWrapper.setAmortization(_amortization);
        success_ = true;
    }

    /// @inheritdoc IAmortization
    /// @dev Requires no active amortization holds for the specified corporate action.
    function cancelAmortization(
        uint256 _amortizationID
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        onlyRole(CORPORATE_ACTION_ROLE)
        onlyNoActiveAmortizationHolds(_amortizationID)
    {
        AmortizationStorageWrapper.cancelAmortization(_amortizationID);
    }

    /// @inheritdoc IAmortization
    /// @dev Releases a holder-specific amortization hold for a valid amortization action.
    function releaseAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyRole(AMORTIZATION_ROLE)
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
    {
        AmortizationStorageWrapper.releaseAmortizationHold(_amortizationID, _tokenHolder);
    }

    /// @inheritdoc IAmortization
    /// @dev Creates or updates a positive holder-specific hold for a valid amortization action.
    function setAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder,
        uint256 _tokenAmount
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyRole(AMORTIZATION_ROLE)
        onlyMatchingActionType(AMORTIZATION_CORPORATE_ACTION_TYPE, _amortizationID - 1)
        onlyPositiveTokenAmount(_tokenAmount, _amortizationID)
        returns (uint256 holdId_)
    {
        return AmortizationStorageWrapper.setAmortizationHold(_amortizationID, _tokenHolder, _tokenAmount);
    }

    /// @inheritdoc IAmortization
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

    /// @inheritdoc IAmortization
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

    /// @inheritdoc IAmortization
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

    /// @inheritdoc IAmortization
    function getAmortizationsCount()
        external
        view
        override
        onlyWithoutMultiPartition
        returns (uint256 amortizationCount_)
    {
        return AmortizationStorageWrapper.getAmortizationsCount();
    }

    /// @inheritdoc IAmortization
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

    /// @inheritdoc IAmortization
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

    /// @inheritdoc IAmortization
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

    /// @inheritdoc IAmortization
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

    /// @inheritdoc IAmortization
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

    /// @inheritdoc IAmortization
    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override onlyWithoutMultiPartition returns (uint256[] memory activeIds_) {
        return AmortizationStorageWrapper.getActiveAmortizationIds(_pageIndex, _pageLength);
    }

    /// @inheritdoc IAmortization
    function getTotalActiveAmortizationIds() external view override onlyWithoutMultiPartition returns (uint256) {
        return AmortizationStorageWrapper.getTotalActiveAmortizationIds();
    }
}
