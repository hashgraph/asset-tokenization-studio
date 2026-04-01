// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { Hold, ProtectedHold } from "./IHold.sol";
import { IHoldManagement } from "./IHoldManagement.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../domain/asset/ERC1644StorageWrapper.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";

/**
 * @title HoldManagement
 * @dev Abstract contract for managing hold operations on security tokens
 *
 * This contract provides functionality for creating holds on token partitions
 * with support for operator, controller, and protected partition operations.
 * It integrates clearing, lock, ERC3643, and partition validation modifiers.
 *
 * @notice Inherit from this contract to gain access to hold management functions
 * @author Asset Tokenization Studio Team
 */
abstract contract HoldManagement is IHoldManagement, Modifiers {
    /**
     * @dev Creates a hold on behalf of an operator for a specific partition
     *
     * Requirements:
     * - Contract must not be paused
     * - Clearing must be disabled
     * - From address must be valid
     * - Escrow address must be valid
     * - Partition must be default with single partition
     * - Caller must be operator for the partition
     * - Expiration timestamp must be in the future
     * - Caller, to, and from addresses must not be recovered
     * - Partitions must not be protected OR caller has WILD_CARD_ROLE
     *
     * @param _partition The partition identifier
     * @param _from The token holder address
     * @param _hold Hold parameters including to, escrow, amount, expiration
     * @param _operatorData Additional operator data
     * @return success_ Operation success status
     * @return holdId_ The created hold identifier
     *
     * Emits OperatorHeldByPartition event on success
     */
    function operatorCreateHoldByPartition(
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
        notZeroAddress(_from)
        notZeroAddress(_hold.escrow)
        returns (bool success_, uint256 holdId_)
    {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
        ERC1410StorageWrapper.requireOperator(_partition, _from);
        _requireUnProtectedPartitionsOrWildCardRole();

        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.OPERATOR
        );

        emit OperatorHeldByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
    }

    /**
     * @dev Creates a hold on behalf of a controller for a specific partition
     *
     * Requirements:
     * - Contract must not be paused
     * - Caller must have CONTROLLER_ROLE
     * - From address must be valid
     * - Escrow address must be valid
     * - Partition must be default with single partition
     * - Expiration timestamp must be in the future
     * - Contract must be controllable
     *
     * @param _partition The partition identifier
     * @param _from The token holder address
     * @param _hold Hold parameters including to, escrow, amount, expiration
     * @param _operatorData Additional operator data
     * @return success_ Operation success status
     * @return holdId_ The created hold identifier
     *
     * Emits ControllerHeldByPartition event on success
     */
    function controllerCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyRole(_CONTROLLER_ROLE)
        notZeroAddress(_from)
        notZeroAddress(_hold.escrow)
        onlyValidExpirationTimestamp(_hold.expirationTimestamp)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyControllable
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.CONTROLLER
        );

        emit ControllerHeldByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
    }

    /**
     * @dev Creates a hold on a protected partition with signature verification
     *
     * Requirements:
     * - Contract must not be paused
     * - Caller must have partition-specific role
     * - From address must be valid
     * - Escrow address must be valid
     * - From address must not be recovered
     * - To address must not be recovered
     * - Expiration timestamp must be in the future
     * - Partitions must be protected
     * - Clearing must be disabled
     *
     * @param _partition The protected partition identifier
     * @param _from The token holder address
     * @param _protectedHold Protected hold parameters with signature
     * @param _signature Cryptographic signature for authorization
     * @return success_ Operation success status
     * @return holdId_ The created hold identifier
     *
     * Emits ProtectedHeldByPartition event on success
     */
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
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

        emit ProtectedHeldByPartition(msg.sender, _from, _partition, holdId_, _protectedHold.hold, "");
    }

    /**
     * @dev Internal function to require un-protected partitions or wildcard role
     *
     * Reverts if partitions are protected and caller does not have WILD_CARD_ROLE
     *
     * Requirements:
     * - Either partitions are not protected OR caller has WILD_CARD_ROLE
     *
     * Reverts with PartitionsAreProtectedAndNoRole if requirements not met
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
