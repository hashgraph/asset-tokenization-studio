// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorClearingByPartition } from "./IOperatorClearingByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ClearingOps } from "../../domain/orchestrator/ClearingOps.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _OPERATOR_CLEARING_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title OperatorClearingByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing redeem and transfer clearing operations for authorised operators by partition.
 * @dev Implementation logic for operator-led clearing redemptions and transfers.
 */
abstract contract OperatorClearingByPartition is IOperatorClearingByPartition, Modifiers {
    /// @inheritdoc IOperatorClearingByPartition
    function initializeOperatorClearingByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_OPERATOR_CLEARING_BY_PARTITION_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_OPERATOR_CLEARING_BY_PARTITION_RESOLVER_KEY);
        emit OperatorClearingByPartitionInitialized();
    }

    /// @inheritdoc IOperatorClearingByPartition
    function operatorClearingRedeemByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingActivated
        onlyWithValidExpirationTimestamp(_clearingOperationFrom.clearingOperation.expirationTimestamp)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_clearingOperationFrom.from)
        notZeroAddress(_clearingOperationFrom.from)
        onlyDefaultPartitionWithSinglePartition(_clearingOperationFrom.clearingOperation.partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyOperator(_clearingOperationFrom.clearingOperation.partition, _clearingOperationFrom.from)
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );

        /// @dev ClearedOperatorRedeemByPartition event should be emitted here, and not in
        /// in the ClearingOps.clearingRedeemCreation function
    }

    /// @inheritdoc IOperatorClearingByPartition
    function operatorClearingTransferByPartition(
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
        onlyUnProtectedPartitionsOrWildCardRole
        onlyValidOperatorClearingTransferByPartition(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            EvmAccessors.getMsgSender(),
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.clearingOperation.partition
        )
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );

        /// @dev ClearedOperatorTransferByPartition event should be emitted here, and not in
        /// in the ClearingOps.clearingRedeemCreation function
    }
}
