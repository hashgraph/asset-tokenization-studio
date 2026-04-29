// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingRedeem } from "./IClearingRedeem.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { ClearingProtectedOps } from "../../../domain/orchestrator/ClearingProtectedOps.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ClearingRedeem is IClearingRedeem, Modifiers {
    function operatorClearingRedeemByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    )
        external
        override
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
    }

    function protectedClearingRedeemByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    )
        external
        override
        onlyUnpaused
        onlyProtectedPartitions
        onlyValidAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            )
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingProtectedOps.protectedClearingRedeemByPartition(
            _protectedClearingOperation,
            _amount,
            _signature
        );
    }
}
