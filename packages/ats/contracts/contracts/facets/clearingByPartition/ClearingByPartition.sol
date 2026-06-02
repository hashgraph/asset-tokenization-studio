// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IClearingByPartition, RESOLVER_KEY_CLEARING_BY_PARTITION } from "./IClearingByPartition.sol";
import { ROLE_CLEARING_VALIDATOR } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ClearingOps } from "../../domain/orchestrator/ClearingOps.sol";
import { ClearingLifecycleOps } from "../../domain/orchestrator/ClearingLifecycleOps.sol";
import { ClearingReadOps } from "../../domain/orchestrator/ClearingReadOps.sol";
import { ClearingStorageWrapper } from "../../domain/asset/ClearingStorageWrapper.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ClearingByPartition
 * @notice Provides partition-scoped clearing lifecycle, creation, and query operations.
 * @dev Implements `IClearingByPartition` through shared clearing orchestrators and facet
 *      initialisation storage. Mutating entry points depend on operational, activation,
 *      pause, partition, identity, recovery, role, and clearing-state modifiers.
 * @author Asset Tokenization Studio Team
 */
abstract contract ClearingByPartition is IClearingByPartition, Modifiers {
    /// @inheritdoc IClearingByPartition
    function initializeClearingByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_CLEARING_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_CLEARING_BY_PARTITION);
        emit ClearingByPartitionInitialized();
    }

    /// @inheritdoc IClearingByPartition
    function approveClearingOperationByPartition(
        IClearingByPartition.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CLEARING_VALIDATOR)
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, false)
        onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0))
        returns (bool success_, bytes32 partition_)
    {
        bytes memory operationData;
        (success_, operationData, partition_) = ClearingLifecycleOps.approveClearingOperationByPartition(
            _clearingOperationIdentifier
        );
        emit ClearingOperationApproved(
            EvmAccessors.getMsgSender(),
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType,
            operationData
        );
    }

    /// @inheritdoc IClearingByPartition
    function cancelClearingOperationByPartition(
        IClearingByPartition.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CLEARING_VALIDATOR)
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, false)
        returns (
            //TODO: add onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0)) if needed
            bool success_
        )
    {
        success_ = ClearingLifecycleOps.cancelClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationCanceled(
            EvmAccessors.getMsgSender(),
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    /// @inheritdoc IClearingByPartition
    function reclaimClearingOperationByPartition(
        IClearingByPartition.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, true)
        onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0))
        returns (bool success_)
    {
        success_ = ClearingLifecycleOps.reclaimClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationReclaimed(
            EvmAccessors.getMsgSender(),
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    /// @inheritdoc IClearingByPartition
    /// @dev Requires clearing to be active and records the caller as the token holder.
    function clearingRedeemByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyDefaultPartitionWithSinglePartition(_clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperation,
            _amount,
            EvmAccessors.getMsgSender(),
            "",
            ThirdPartyType.NULL
        );
    }

    /// @inheritdoc IClearingByPartition
    /// @dev Requires clearing allowance and decreases it after creating the redeem request.
    function clearingRedeemFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        notZeroAddress(_clearingOperationFrom.from)
        onlyDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );
        ClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.Redeem,
            _clearingOperationFrom.from,
            _amount
        );
    }

    /// @inheritdoc IClearingByPartition
    /// @dev Requires clearing to be active and records the caller as the token holder.
    function clearingTransferByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount,
        address _to
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_to)
        notZeroAddress(_to)
        onlyDefaultPartitionWithSinglePartition(_clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperation,
            _amount,
            _to,
            EvmAccessors.getMsgSender(),
            "",
            ThirdPartyType.NULL
        );
    }

    /// @inheritdoc IClearingByPartition
    /// @dev Requires clearing allowance and decreases it in the private helper.
    function clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        notZeroAddress(_clearingOperationFrom.from)
        notZeroAddress(_to)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_to)
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        onlyDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 clearingId_)
    {
        return _clearingTransferFromByPartition(_clearingOperationFrom, _amount, _to);
    }

    /// @inheritdoc IClearingByPartition
    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingRedeemData memory clearingRedeemData_) {
        return
            ClearingReadOps.getClearingRedeemForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }

    /// @inheritdoc IClearingByPartition
    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingTransferData memory clearingTransferData_) {
        return
            ClearingReadOps.getClearingTransferForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }

    /// @inheritdoc IClearingByPartition
    function getClearedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return
            ClearingReadOps.getClearedAmountForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }

    /// @inheritdoc IClearingByPartition
    function getClearingCountForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType
    ) external view override returns (uint256 clearingCount_) {
        return ClearingStorageWrapper.getClearingCountForByPartition(_partition, _tokenHolder, _clearingOperationType);
    }

    /// @inheritdoc IClearingByPartition
    function getClearingsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        ClearingOperationType _clearingOperationType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory clearingsId_) {
        return
            ClearingStorageWrapper.getClearingsIdForByPartition(
                _partition,
                _tokenHolder,
                _clearingOperationType,
                _pageIndex,
                _pageLength
            );
    }

    /**
     * @notice Creates a clearing transfer entry on behalf of an authorised operator.
     * @dev Dispatches into {ClearingOps.clearingTransferCreation} with the
     *      {ThirdPartyType.AUTHORIZED} tag and reduces the operator's clearing allowance.
     * @param _clearingOperationFrom Operator envelope (clearing operation, holder, operator data).
     * @param _amount Amount to clear for transfer.
     * @param _to Destination address that will receive the cleared transfer.
     * @return success_ True when the clearing entry was created.
     * @return clearingId_ Identifier assigned to the new clearing record.
     */
    function _clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) private returns (bool success_, uint256 clearingId_) {
        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );
        ClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.Transfer,
            _clearingOperationFrom.from,
            _amount
        );
    }
}
