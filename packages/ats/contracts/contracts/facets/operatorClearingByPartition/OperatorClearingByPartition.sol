// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorClearingByPartition } from "./IOperatorClearingByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ClearingOps } from "../../domain/orchestrator/ClearingOps.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

abstract contract OperatorClearingByPartition is IOperatorClearingByPartition, Modifiers {
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

    function operatorClearingTransferByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    )
        external
        override
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
    }
}
