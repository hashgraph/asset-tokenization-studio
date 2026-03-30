// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { Hold, HoldIdentifier } from "./IHold.sol";
import { IHoldTokenHolder } from "./IHoldTokenHolder.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { _WILD_CARD_ROLE } from "../../../constants/roles.sol";

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
        Hold calldata _hold
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_hold.to)
        returns (bool success_, uint256 holdId_)
    {
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
        _requireUnProtectedPartitionsOrWildCardRole();
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            msg.sender,
            _hold,
            "",
            ThirdPartyType.NULL
        );

        emit HeldByPartition(msg.sender, msg.sender, _partition, holdId_, _hold, "");
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
        Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_hold.to)
        onlyUnrecoveredAddress(_from)
        returns (bool success_, uint256 holdId_)
    {
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
        _requireUnProtectedPartitionsOrWildCardRole();
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.AUTHORIZED
        );

        HoldStorageWrapper.decreaseAllowedBalanceForHold(_partition, _from, _hold.amount, holdId_);

        emit HeldFromByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
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
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) external override onlyUnpaused returns (bool success_, bytes32 partition_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        ERC1594StorageWrapper.requireIdentified(_holdIdentifier.tokenHolder, _to);
        ERC1594StorageWrapper.requireCompliant(address(0), _to, false);
        HoldStorageWrapper.requireValidHoldId(_holdIdentifier);
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
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) external override onlyUnpaused returns (bool success_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        HoldStorageWrapper.requireValidHoldId(_holdIdentifier);
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
        HoldIdentifier calldata _holdIdentifier
    ) external override onlyUnpaused returns (bool success_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        HoldStorageWrapper.requireValidHoldId(_holdIdentifier);
        uint256 amount;
        (success_, amount) = HoldStorageWrapper.reclaimHoldByPartition(_holdIdentifier);
        emit HoldByPartitionReclaimed(
            msg.sender,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            amount
        );
    }

    /**
     * @dev Internal function to check partition protection
     * Reverts if partitions are protected and caller lacks wildcard role
     */
    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
