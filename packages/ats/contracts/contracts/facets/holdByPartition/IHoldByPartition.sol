// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "../layer_1/hold/IHoldTypes.sol";
import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";

/**
 * @title IHoldByPartition
 * @notice Interface for hold operations scoped to a specific partition: creation, execution,
 *         release, reclamation, and partition-scoped read queries.
 * @dev Aggregates the holder-facing write operations (previously in IHoldTokenHolder) and
 *      the partition-scoped read operations (previously in IHoldRead) into a single interface.
 *      The two methods that remain in IHoldRead — getHeldAmountFor and getHoldThirdParty —
 *      are global (not partition-scoped) and are intentionally excluded here.
 * @author Asset Tokenization Studio Team
 */
interface IHoldByPartition is IHoldTypes {
    // ─────────────────────────────────────────────────────────────
    // Write operations
    // ─────────────────────────────────────────────────────────────

    /**
     * @notice Creates a hold on the tokens of a token holder on a specific partition.
     * @param _partition The partition on which the hold is created.
     * @param _hold The hold details.
     * @return success_ True if the hold was created successfully.
     * @return holdId_ The identifier of the created hold.
     */
    function createHoldByPartition(
        bytes32 _partition,
        IHoldTypes.Hold calldata _hold
    ) external returns (bool success_, uint256 holdId_);

    /**
     * @notice Creates a hold on the tokens of a token holder, by a third party, on a specific partition.
     * @param _partition The partition on which the hold is created.
     * @param _from The address from which the tokens will be held.
     * @param _hold The hold details.
     * @param _operatorData Additional data attached to the hold creation by the third party.
     * @return success_ True if the hold was created successfully.
     * @return holdId_ The identifier of the created hold.
     */
    function createHoldFromByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _operatorData
    ) external returns (bool success_, uint256 holdId_);

    /**
     * @notice Transfers the held tokens to the specified address.
     * @param _holdIdentifier The identifier of the hold to be executed.
     * @param _to The address to which the held tokens will be transferred.
     * @param _amount The amount of tokens to be executed from the hold.
     * @return success_ True if the hold was executed successfully.
     * @return partition_ The partition from which the tokens were transferred.
     */
    function executeHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) external returns (bool success_, bytes32 partition_);

    /**
     * @notice Releases the held tokens back to the token holder.
     * @dev Can only be called before the hold has expired.
     * @param _holdIdentifier The identifier of the hold to be released.
     * @param _amount The amount of tokens to be released from the hold.
     * @return success_ True if the hold was released successfully.
     */
    function releaseHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) external returns (bool success_);

    /**
     * @notice Reclaims the held tokens back to the token holder.
     * @dev Can only be called after the hold has expired.
     * @param _holdIdentifier The identifier of the hold to be reclaimed.
     * @return success_ True if the hold was reclaimed successfully.
     */
    function reclaimHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) external returns (bool success_);

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
    ) external view returns (uint256 amount_);

    /**
     * @notice Returns the number of active holds for a token holder on a specific partition.
     * @param _partition The partition to query.
     * @param _tokenHolder The address of the token holder.
     * @return holdCount_ The number of holds on the given partition.
     */
    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 holdCount_);

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
    ) external view returns (uint256[] memory holdsId_);

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
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartyType_
        );
}
