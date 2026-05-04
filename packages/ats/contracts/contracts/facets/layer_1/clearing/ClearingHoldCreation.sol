// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldCreation } from "./IClearingHoldCreation.sol";
import { IHoldTypes } from "../hold/IHoldTypes.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingProtectedOps } from "../../../domain/orchestrator/ClearingProtectedOps.sol";

abstract contract ClearingHoldCreation is IClearingHoldCreation, Modifiers {
    function protectedClearingCreateHoldByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _signature
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_protectedClearingOperation.from)
        onlyUnrecoveredAddress(_hold.to)
        onlyProtectedPartitions
        onlyValidAddress(_protectedClearingOperation.from)
        onlyWithValidExpirationTimestamp(_protectedClearingOperation.clearingOperation.expirationTimestamp)
        onlyRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            )
        )
        onlyClearingActivated
        returns (bool success_, uint256 clearingId_)
    {
        (success_, clearingId_) = ClearingProtectedOps.protectedClearingCreateHoldByPartition(
            _protectedClearingOperation,
            _hold,
            _signature
        );
    }
}
