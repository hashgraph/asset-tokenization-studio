// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "./IHoldTypes.sol";
import { IHoldManagement } from "./IHoldManagement.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

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
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyValidOperatorCreateHoldByPartition(
            _hold.expirationTimestamp,
            EvmAccessors.getMsgSender(),
            _hold.to,
            _from,
            _hold.escrow,
            _partition
        )
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.OPERATOR
        );

        emit OperatorHeldByPartition(EvmAccessors.getMsgSender(), _from, _partition, holdId_, _hold, _operatorData);
    }
}
