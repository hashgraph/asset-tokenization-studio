// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ThirdPartyType } from "../../domain/asset/types/ThirdPartyType.sol";

/**
 * @title IHoldTypes
 * @author Asset Tokenization Studio Team
 * @notice Single source of truth for all Hold domain types (structs, enums, events, errors).
 * @dev Inherited by writer interfaces in the hold subsystem so they share a canonical
 *      ABI for hold lifecycle data.
 */
interface IHoldTypes {
    /**
     * @notice Lifecycle operation applicable to an existing hold.
     * @dev Used by storage helpers to dispatch the appropriate event and balance update.
     * @param Execute Transfer the held amount to the hold's designated recipient.
     * @param Release Return the held amount (partially or fully) to the holder's available balance.
     * @param Reclaim Return the full held amount to the holder after the expiration timestamp has passed.
     */
    enum OperationType {
        Execute,
        Release,
        Reclaim
    }

    /**
     * @notice Composite identifier locating a single hold within partitioned storage.
     * @dev Three-tuple keyed by partition, holder, and the hold's sequence id.
     * @param partition The ERC-1410 partition byte identifier under which the hold is registered.
     * @param tokenHolder Address of the account whose balance is held.
     * @param holdId Sequence identifier assigned to the hold within the (partition, holder) scope.
     */
    struct HoldIdentifier {
        bytes32 partition;
        address tokenHolder;
        uint256 holdId;
    }

    /**
     * @notice Definition of a hold placed over part of a holder's partitioned balance.
     * @dev `expirationTimestamp` is compared against the configurable block timestamp;
     *      `escrow` is the only address authorised to execute the hold.
     * @param amount Number of tokens placed under hold.
     * @param expirationTimestamp Unix timestamp after which the hold may be reclaimed by the holder;
     *        zero means the hold never expires and can only be released or executed.
     * @param escrow Address exclusively authorised to execute the hold before expiration.
     * @param to Intended recipient of tokens when the hold is executed.
     * @param data Arbitrary payload attached to the hold by its creator.
     */
    struct Hold {
        uint256 amount;
        uint256 expirationTimestamp;
        address escrow;
        address to;
        bytes data;
    }

    /**
     * @notice Protected hold envelope authorised by an off-chain EIP-712 signature.
     * @dev `deadline` and `nonce` are validated against the holder's nonce slot.
     * @param hold The underlying hold definition (amount, escrow, recipient, expiration, data).
     * @param deadline Latest block timestamp at which the EIP-712 signature remains valid.
     * @param nonce Per-holder nonce consumed on submission to prevent signature replay.
     */
    struct ProtectedHold {
        Hold hold;
        uint256 deadline;
        uint256 nonce;
    }

    /**
     * @notice Persisted hold record carrying the dispatch tag for its originating flow.
     * @dev `thirdPartyType` selects which downstream event variant fires on creation.
     * @param id Sequence identifier of this hold record within the (partition, holder) scope.
     * @param hold The hold definition including amount, escrow, recipient, expiration, and data.
     * @param operatorData Operator-supplied metadata recorded at hold creation time.
     * @param thirdPartyType Tag identifying which originating flow created the hold,
     *        used to emit the correct event variant.
     */
    struct HoldData {
        uint256 id;
        Hold hold;
        bytes operatorData;
        ThirdPartyType thirdPartyType;
    }

    /**
     * @notice Emitted when a holder creates a hold over its own partitioned balance.
     * @param operator The address that initiated the hold (the holder itself).
     * @param tokenHolder The holder whose balance is being held.
     * @param partition Partition over which the hold is placed.
     * @param holdId Sequence id assigned to the hold.
     * @param hold The hold definition (escrow, recipient, expiration, amount, data).
     * @param operatorData Operator-supplied metadata.
     */
    event HeldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    /**
     * @notice Emitted when an authorised third party creates a hold on a holder's behalf.
     * @param operator The third-party caller initiating the hold.
     * @param tokenHolder The holder whose balance is being held.
     * @param partition Partition over which the hold is placed.
     * @param holdId Sequence id assigned to the hold.
     * @param hold The hold definition (escrow, recipient, expiration, amount, data).
     * @param operatorData Operator-supplied metadata.
     */
    event HeldFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    /**
     * @notice Emitted when an existing hold is executed and balance transferred to a recipient.
     * @param tokenHolder The holder whose hold was executed.
     * @param partition Partition over which the hold lived.
     * @param holdId Sequence id of the executed hold.
     * @param amount Amount released to the recipient.
     * @param to Recipient of the executed balance.
     */
    event HoldByPartitionExecuted(
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 holdId,
        uint256 amount,
        address to
    );

    /**
     * @notice Emitted when a hold is partially or fully released back to the holder.
     * @param tokenHolder The holder receiving the released balance.
     * @param partition Partition over which the hold lived.
     * @param holdId Sequence id of the released hold.
     * @param amount Amount returned to the holder's available balance.
     */
    event HoldByPartitionReleased(
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 holdId,
        uint256 amount
    );

    /**
     * @notice Emitted when an expired hold is reclaimed by the holder.
     * @param operator The address that triggered the reclaim.
     * @param tokenHolder The holder receiving the reclaimed balance.
     * @param partition Partition over which the hold lived.
     * @param holdId Sequence id of the reclaimed hold.
     * @param amount Amount returned to the holder's available balance.
     */
    event HoldByPartitionReclaimed(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 holdId,
        uint256 amount
    );

    /**
     * @notice Emitted when an ERC-1410 operator creates a hold on a holder's behalf.
     * @param operator The authorised operator initiating the hold.
     * @param tokenHolder The holder whose balance is being held.
     * @param partition Partition over which the hold is placed.
     * @param holdId Sequence id assigned to the hold.
     * @param hold The hold definition.
     * @param operatorData Operator-supplied metadata.
     */
    event OperatorHeldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    /**
     * @notice Emitted when a controller creates a hold on a holder's behalf.
     * @param operator The controller initiating the hold.
     * @param tokenHolder The holder whose balance is being held.
     * @param partition Partition over which the hold is placed.
     * @param holdId Sequence id assigned to the hold.
     * @param hold The hold definition.
     * @param operatorData Operator-supplied metadata.
     */
    event ControllerHeldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    /**
     * @notice Emitted when a protected hold authorised by an EIP-712 signature is created.
     * @param operator The address submitting the protected hold (signature relayer).
     * @param tokenHolder The holder whose balance is being held; must match the signer.
     * @param partition Partition over which the hold is placed.
     * @param holdId Sequence id assigned to the hold.
     * @param hold The hold definition.
     * @param operatorData Operator-supplied metadata.
     */
    event ProtectedHeldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    /// @notice Reverts when a reclaim is attempted before the hold's expiration timestamp.
    error HoldExpirationNotReached();
    /// @notice Reverts when the supplied hold id does not exist for the (partition, holder) pair.
    error WrongHoldId();
    /**
     * @notice Reverts when the recipient supplied to {executeHoldByPartition} mismatches the hold.
     * @param holdDestination The recipient stored on the hold.
     * @param to The recipient supplied to the execute call.
     */
    error InvalidDestinationAddress(address holdDestination, address to);
    /**
     * @notice Reverts when the requested release amount exceeds the hold's remaining balance.
     * @param holdAmount The amount still held.
     * @param amount The amount requested.
     */
    error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
    /// @notice Reverts when an operation requires an unexpired hold but the hold has expired.
    error HoldExpirationReached();
    /// @notice Reverts when a caller that is not the recorded escrow attempts to execute the hold.
    error IsNotEscrow();
    /// @notice Reverts when a hold is created with a zero or otherwise invalid amount.
    error InvalidHoldAmount();
}
