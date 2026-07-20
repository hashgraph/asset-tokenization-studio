// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAmortization, RESOLVER_KEY_AMORTIZATION } from "./IAmortization.sol";
import {
    ROLE_AMORTIZATION,
    ROLE_CORPORATE_ACTION,
    ROLE_CORPORATE_ACTION_FORCE_CANCEL,
    DEFAULT_ADMIN_ROLE
} from "../../constants/roles.sol";
import { CORPORATE_ACTION_TYPE_AMORTIZATION } from "../../constants/dispatchTypes.sol";
import { AmortizationStorageWrapper } from "../../domain/asset/AmortizationStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Amortization
 * @author Asset Tokenization Studio Team
 * @notice Writer abstract for the amortization facet — registers, holds, releases, and cancels
 *         amortization corporate actions against a token's holder set.
 * @dev Each entry forwards to {AmortizationStorageWrapper}, which performs the state mutations
 *      and emits the canonical events declared on {IAmortization}.
 */
abstract contract Amortization is IAmortization, Modifiers {
    /// @inheritdoc IAmortization
    /// @dev Registers the amortization facet as ready and can only be executed once by an admin.
    function initializeAmortization()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_AMORTIZATION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_AMORTIZATION);
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
        onlyRole(ROLE_CORPORATE_ACTION)
        onlyValidDates(_amortization.recordDate, _amortization.executionDate)
        onlyValidTimestamp(_amortization.recordDate)
        onlyValidDates(_amortization.recordDate, _amortization.executionDate)
        returns (bool success_, uint256 amortizationID_)
    {
        bytes32 corporateActionId_;
        (corporateActionId_, amortizationID_) = AmortizationStorageWrapper.setAmortization(_amortization);
        emit IAmortization.AmortizationSet(
            corporateActionId_,
            amortizationID_,
            EvmAccessors.getMsgSender(),
            _amortization.recordDate,
            _amortization.executionDate
        );
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
        onlyRole(ROLE_CORPORATE_ACTION)
        onlyNoActiveAmortizationHolds(_amortizationID)
    {
        AmortizationStorageWrapper.cancelAmortization(_amortizationID);
        emit IAmortization.AmortizationCancelled(_amortizationID, EvmAccessors.getMsgSender());
    }

    /// @inheritdoc IAmortization
    /// @dev Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyUnpaused`,
    ///      `onlyWithoutMultiPartition`, and
    ///      `onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)`.
    function forceCancelAmortization(
        uint256 _amortizationID
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
        onlyRole(ROLE_CORPORATE_ACTION_FORCE_CANCEL)
    {
        AmortizationStorageWrapper.forceCancelAmortization(_amortizationID);
        emit IAmortization.AmortizationForceCancelled(_amortizationID, EvmAccessors.getMsgSender());
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
        onlyRole(ROLE_AMORTIZATION)
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
    {
        (bytes32 corporateActionId_, uint256 releasedHoldId_) = AmortizationStorageWrapper.releaseAmortizationHold(
            _amortizationID,
            _tokenHolder
        );
        emit IAmortization.AmortizationHoldReleased(corporateActionId_, _amortizationID, _tokenHolder, releasedHoldId_);
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
        onlyRole(ROLE_AMORTIZATION)
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
        onlyPositiveTokenAmount(_tokenAmount, _amortizationID)
        returns (uint256 holdId_)
    {
        bytes32 corporateActionId_;
        (corporateActionId_, holdId_) = AmortizationStorageWrapper.setAmortizationHold(
            _amortizationID,
            _tokenHolder,
            _tokenAmount
        );
        emit IAmortization.AmortizationHoldSet(
            corporateActionId_,
            _amortizationID,
            _tokenHolder,
            holdId_,
            _tokenAmount
        );
    }

    /// @inheritdoc IAmortization
    function getAmortization(
        uint256 _amortizationID
    )
        external
        view
        override
        onlyWithoutMultiPartition
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
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
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)
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
