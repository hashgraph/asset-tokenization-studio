// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTransfer } from "./IClearingTransfer.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingProtectedOps } from "../../../domain/orchestrator/ClearingProtectedOps.sol";

abstract contract ClearingTransfer is IClearingTransfer, Modifiers {
    function protectedClearingTransferByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    )
        external
        override
        onlyUnpaused
        onlyProtectedPartitions
        notZeroAddress(_protectedClearingOperation.from)
        notZeroAddress(_to)
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_to)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            )
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingProtectedOps.protectedClearingTransferByPartition(
            _protectedClearingOperation,
            _amount,
            _to,
            _signature
        );
    }
}
