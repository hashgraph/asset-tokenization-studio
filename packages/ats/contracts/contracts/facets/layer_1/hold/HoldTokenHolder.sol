// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { IHoldTypes } from "./IHoldTypes.sol";
import { IHoldTokenHolder } from "./IHoldTokenHolder.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title HoldTokenHolder
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract for hold token holder operations
 *
 * Provides functionality for creating and managing holds on tokens
 * with partition support. Inherits modifiers from multiple concerns:
 * - ClearingModifiers: clearing-related validations
 * - ERC3643Modifiers: ERC3643 compliance checks
 * - LockModifiers: lock expiration validation
 * - PartitionModifiers: partition protection checks
 */
abstract contract HoldTokenHolder is IHoldTokenHolder, Modifiers {
    /**
     * @notice Create a hold by partition
     * @dev Validates partition, expiration timestamp, and address recovery status
     *
     * Requirements:
     * - Partition must be valid and single
     * - Expiration timestamp must be in the future
     * - Addresses must not be recovered
     * - Partitions must not be protected or caller must have wildcard role
     *
     * @param _partition The partition identifier
     * @param _hold Hold data structure with escrow, to, amount, expirationTimestamp
     * @return success_ Boolean indicating success
     * @return holdId_ The created hold identifier
     */
    function createHoldByPartition(
        bytes32 _partition,
        IHoldTypes.Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyUnrecoveredAddress(EvmAccessors.getMsgSender())
        onlyUnrecoveredAddress(_hold.to)
        notZeroAddress(_hold.escrow)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            EvmAccessors.getMsgSender(),
            _hold,
            "",
            ThirdPartyType.NULL
        );

        emit HeldByPartition(EvmAccessors.getMsgSender(), EvmAccessors.getMsgSender(), _partition, holdId_, _hold, "");
    }

    /**
     * @notice Create a hold from address by partition
     * @dev Validates partition, expiration timestamp, and all addresses
     *
     * Requirements:
     * - Partition must be valid and single
     * - Expiration timestamp must be in the future
     * - All addresses (sender, to, from) must not be recovered
     * - Partitions must not be protected or caller must have wildcard role
     *
     * @param _partition The partition identifier
     * @param _from The address to hold from
     * @param _hold Hold data structure
     * @param _operatorData Additional operator data
     * @return success_ Boolean indicating success
     * @return holdId_ The created hold identifier
     */
    function createHoldFromByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyUnProtectedPartitionsOrWildCardRole
        onlyValidCreateHoldFromByPartition(
            _hold.expirationTimestamp,
            EvmAccessors.getMsgSender(),
            _hold.to,
            _from,
            _hold.escrow,
            _partition
        )
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.AUTHORIZED
        );

        HoldStorageWrapper.decreaseAllowedBalanceForHold(_partition, _from, _hold.amount, holdId_);

        emit HeldFromByPartition(EvmAccessors.getMsgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }

    /**
     * @notice Execute hold by partition
     * @dev Transfers held amount to specified address
     *
     * Requirements:
     * - Partition must be valid and single
     * - Hold ID must be valid
     * - Addresses must be identified and compliant
     *
     * @param _holdIdentifier Hold identifier structure
     * @param _to The address to transfer to
     * @param _amount The amount to transfer
     * @return success_ Boolean indicating success
     * @return partition_ The partition identifier
     */
    function executeHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyIdentifiedAddresses(_holdIdentifier.tokenHolder, _to)
        onlyCompliant(address(0), _to, false)
        onlyValidHoldId(_holdIdentifier)
        returns (bool success_, bytes32 partition_)
    {
        (success_, partition_) = HoldStorageWrapper.executeHoldByPartition(_holdIdentifier, _to, _amount);

        emit HoldByPartitionExecuted(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount,
            _to
        );
    }

    /**
     * @notice Release hold by partition
     * @dev Releases held tokens back to holder
     *
     * Requirements:
     * - Partition must be valid and single
     * - Hold ID must be valid
     *
     * @param _holdIdentifier Hold identifier structure
     * @param _amount The amount to release
     * @return success_ Boolean indicating success
     */
    function releaseHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyValidHoldId(_holdIdentifier)
        returns (bool success_)
    {
        success_ = HoldStorageWrapper.releaseHoldByPartition(_holdIdentifier, _amount);
        emit HoldByPartitionReleased(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount
        );
    }

    /**
     * @notice Reclaim hold by partition
     * @dev Reclaims held tokens to original holder
     *
     * Requirements:
     * - Partition must be valid and single
     * - Hold ID must be valid
     *
     * @param _holdIdentifier Hold identifier structure
     * @return success_ Boolean indicating success
     */
    function reclaimHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_holdIdentifier.partition)
        onlyValidHoldId(_holdIdentifier)
        returns (bool success_)
    {
        uint256 amount;
        (success_, amount) = HoldStorageWrapper.reclaimHoldByPartition(_holdIdentifier);
        emit HoldByPartitionReclaimed(
            EvmAccessors.getMsgSender(),
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            amount
        );
    }
}
