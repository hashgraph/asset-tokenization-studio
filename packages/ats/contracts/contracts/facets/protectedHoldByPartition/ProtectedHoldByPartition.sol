// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedHoldByPartition } from "./IProtectedHoldByPartition.sol";
import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { HoldStorageWrapper } from "../../domain/asset/HoldStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ProtectedHoldByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract facet implementation for the protected variant of partition-scoped hold
 *         creation, extracted from `HoldManagement` as part of the MAF (Modular Asset Factory)
 *         decomposition.
 * @dev Forwards write logic to `HoldStorageWrapper.protectedCreateHoldByPartition`. Authorisation
 *      is enforced by a partition-specific role obtained from `ProtectedPartitionsStorageWrapper`.
 *      Storage layout is unchanged; this contract only owns the selector exposure.
 */
abstract contract ProtectedHoldByPartition is IProtectedHoldByPartition, Modifiers {
    /// @inheritdoc IProtectedHoldByPartition
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold memory _protectedHold,
        bytes calldata _signature
    )
        external
        override
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        notZeroAddress(_from)
        notZeroAddress(_protectedHold.hold.escrow)
        onlyClearingDisabled
        onlyValidExpirationTimestamp(_protectedHold.hold.expirationTimestamp)
        onlyUnrecoveredAddress(_from)
        onlyUnrecoveredAddress(_protectedHold.hold.to)
        onlyProtectedPartitions
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldStorageWrapper.protectedCreateHoldByPartition(
            _partition,
            _from,
            _protectedHold,
            _signature
        );

        emit ProtectedHeldByPartition(EvmAccessors.getMsgSender(), _from, _partition, holdId_, _protectedHold.hold, "");
    }
}
