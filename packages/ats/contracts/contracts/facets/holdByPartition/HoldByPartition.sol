// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldStorageWrapper } from "../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";
import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { IHoldByPartition } from "./IHoldByPartition.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title HoldByPartition
 * @notice Abstract contract implementing all hold operations scoped to a specific partition.
 * @dev Combines the write operations from the former HoldTokenHolder (create, execute, release,
 *      reclaim) with the partition-scoped read operations from the former HoldRead
 *      (getHeldAmountForByPartition, getHoldCountForByPartition, getHoldsIdForByPartition,
 *      getHoldForByPartition). All write methods delegate to HoldStorageWrapper via HoldOps.
 * @author Asset Tokenization Studio Team
 */
abstract contract HoldByPartition is IHoldByPartition, Modifiers {
    // ─────────────────────────────────────────────────────────────
    // Write operations
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Creates a hold on the tokens of a token holder on a specific partition.
     * @dev Validates partition, expiration timestamp, address recovery status, and partition
     *      protection. Emits {HeldByPartition}.
     * @param _partition The partition on which the hold is created.
     * @param _hold Hold data structure containing escrow, destination, amount, and expiration.
     * @return success_ True if the hold was created successfully.
     * @return holdId_ The identifier of the created hold.
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
     * @notice Creates a hold on the tokens of a token holder, by a third party, on a specific partition.
     * @dev Validates partition, expiration timestamp, all involved addresses, and partition
     *      protection. Decreases the third party's allowed balance for the hold. Emits {HeldFromByPartition}.
     * @param _partition The partition on which the hold is created.
     * @param _from The address from which the tokens will be held.
     * @param _hold Hold data structure.
     * @param _operatorData Additional data attached by the third party.
     * @return success_ True if the hold was created successfully.
     * @return holdId_ The identifier of the created hold.
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
     * @notice Transfers the held tokens to the specified address.
     * @dev Validates partition, hold ID, address identification, and compliance. Emits {HoldByPartitionExecuted}.
     * @param _holdIdentifier The identifier of the hold to be executed.
     * @param _to The address to which the held tokens will be transferred.
     * @param _amount The amount of tokens to execute from the hold.
     * @return success_ True if the hold was executed successfully.
     * @return partition_ The partition from which the tokens were transferred.
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
     * @notice Releases the held tokens back to the token holder.
     * @dev Callable only before the hold has expired. Emits {HoldByPartitionReleased}.
     * @param _holdIdentifier The identifier of the hold to be released.
     * @param _amount The amount of tokens to release from the hold.
     * @return success_ True if the hold was released successfully.
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
     * @notice Reclaims the held tokens back to the token holder.
     * @dev Callable only after the hold has expired. Emits {HoldByPartitionReclaimed}.
     * @param _holdIdentifier The identifier of the hold to be reclaimed.
     * @return success_ True if the hold was reclaimed successfully.
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

    // ─────────────────────────────────────────────────────────────
    // Read operations (partition-scoped)
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Returns the total amount of tokens held for a token holder on a specific partition.
     * @param _partition The partition to query.
     * @param _tokenHolder The address of the token holder.
     * @return amount_ The total held amount on the given partition.
     */
    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return
            HoldStorageWrapper.getHeldAmountForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }

    /**
     * @notice Returns the number of active holds for a token holder on a specific partition.
     * @param _partition The partition to query.
     * @param _tokenHolder The address of the token holder.
     * @return holdCount_ The number of holds on the given partition.
     */
    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 holdCount_) {
        return HoldStorageWrapper.getHoldCountForByPartition(_partition, _tokenHolder);
    }

    /**
     * @notice Returns a paginated list of hold IDs for a token holder on a specific partition.
     * @param _partition The partition to query.
     * @param _tokenHolder The address of the token holder.
     * @param _pageIndex The zero-based index of the page to retrieve.
     * @param _pageLength The maximum number of hold IDs to return.
     * @return holdsId_ The array of hold IDs for the given page.
     */
    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory holdsId_) {
        return HoldStorageWrapper.getHoldsIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    /**
     * @notice Returns the details of a specific hold identified by its hold identifier.
     * @param _holdIdentifier The identifier of the hold.
     * @return amount_ The amount of tokens held.
     * @return expirationTimestamp_ The expiration timestamp of the hold.
     * @return escrow_ The escrow address associated with the hold.
     * @return destination_ The destination address for execution.
     * @return data_ Additional data attached to the hold.
     * @return operatorData_ Additional data attached by the operator.
     * @return thirdPartyType_ The type of third party associated with the hold.
     */
    function getHoldForByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    )
        external
        view
        override
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartyType_
        )
    {
        return
            HoldStorageWrapper.getHoldForByPartitionAdjustedAt(
                _holdIdentifier,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
