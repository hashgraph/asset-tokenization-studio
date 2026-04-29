// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingByPartition } from "./IClearingByPartition.sol";
import { CLEARING_VALIDATOR_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ClearingOps } from "../../domain/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../domain/orchestrator/ClearingReadOps.sol";
import { ClearingStorageWrapper } from "../../domain/asset/ClearingStorageWrapper.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ClearingByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of partition-aware clearing operations: approve/cancel/reclaim actions,
 *         clearing redeem and transfer creation, and clearing read queries scoped to a partition.
 * @dev Implements the partition-scoped subset of clearing functionality on top of ClearingOps,
 *      ClearingReadOps, and ClearingStorageWrapper. Intended to be inherited by ClearingByPartitionFacet.
 */
abstract contract ClearingByPartition is IClearingByPartition, Modifiers {
    /// @inheritdoc IClearingByPartition
    function approveClearingOperationByPartition(
        IClearingByPartition.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyUnpaused
        onlyRole(CLEARING_VALIDATOR_ROLE)
        onlyClearingActivated
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, false)
        onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0))
        returns (bool success_, bytes32 partition_)
    {
        bytes memory operationData;
        (success_, operationData, partition_) = ClearingOps.approveClearingOperationByPartition(
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
        onlyUnpaused
        onlyRole(CLEARING_VALIDATOR_ROLE)
        onlyClearingActivated
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, false)
        returns (bool success_)
    {
        success_ = ClearingOps.cancelClearingOperationByPartition(_clearingOperationIdentifier);
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
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyClearingActivated
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, true)
        onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0))
        returns (bool success_)
    {
        success_ = ClearingOps.reclaimClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationReclaimed(
            EvmAccessors.getMsgSender(),
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    /// @inheritdoc IClearingByPartition
    /// @dev Emits {ClearedRedeemByPartition} via ClearingOps.clearingRedeemCreation.
    function clearingRedeemByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount
    )
        external
        override
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
    /// @dev Emits {ClearedRedeemFromByPartition} via ClearingOps.clearingRedeemCreation.
    function clearingRedeemFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    )
        external
        override
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
    /// @dev Emits {ClearedTransferByPartition} via ClearingOps.clearingTransferCreation.
    function clearingTransferByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount,
        address _to
    )
        external
        override
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
    /// @dev Emits {ClearedTransferFromByPartition} via ClearingOps.clearingTransferCreation.
    function clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    )
        external
        override
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        notZeroAddress(_clearingOperationFrom.from)
        notZeroAddress(_to)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_to)
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
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

    function _clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) internal returns (bool success_, uint256 clearingId_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        ProtectedPartitionsStorageWrapper.requireUnProtectedPartitionsOrWildCardRole();
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
