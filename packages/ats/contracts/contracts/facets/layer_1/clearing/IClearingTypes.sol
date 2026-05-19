// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";
import { IHoldTypes } from "../hold/IHoldTypes.sol";

/**
 * @notice Snapshot of a hold used as an event parameter in clearing operations.
 * @dev Mirrors `IHoldTypes.Hold` to avoid a circular import dependency between the
 *      clearing and hold facet modules. Keep fields in sync with `IHoldTypes.Hold`
 *      whenever that struct changes.
 * @param amount              Token quantity locked by the hold.
 * @param expirationTimestamp Unix timestamp at which the hold expires and may be
 *                            reclaimed by the token holder.
 * @param escrow              Address of the escrow agent that may execute or release
 *                            the hold.
 * @param to                  Intended recipient of the tokens if the hold is executed.
 * @param data                Arbitrary caller-supplied data attached to the hold.
 */
struct ClearingHold {
    uint256 amount;
    uint256 expirationTimestamp;
    address escrow;
    address to;
    bytes data;
}

/**
 * @title IClearingTypes
 * @author Asset Tokenization Studio Team
 * @notice Defines all shared types — enums, structs, events, and errors — for the
 *         clearing mechanism of the Asset Tokenization Studio.
 * @dev Clearing is a settlement layer that places token operations (transfers, redeems,
 *      and hold creations) in a pending state before final execution. A designated
 *      operator may then approve, cancel, or reclaim each pending operation within
 *      its expiration window.
 *
 *      This interface is inherited by every facet that participates in the clearing
 *      flow so that a single, consistent set of types and events is emitted across
 *      the diamond.
 */
interface IClearingTypes {
    // -------------------------------------------------------------------------
    // Enums
    // -------------------------------------------------------------------------

    /**
     * @notice Classifies the token operation that has been placed under clearing.
     * @dev Used as a discriminant when inspecting a stored `ClearingOperation` to
     *      determine which concrete data struct (transfer / redeem / hold-creation)
     *      accompanies it.
     */
    enum ClearingOperationType {
        Transfer,
        Redeem,
        HoldCreation
    }

    /**
     * @notice Represents the action that an authorised party may perform on a pending
     *         clearing operation.
     * @dev `Approve` finalises the underlying token operation; `Cancel` voids it while
     *      within the expiration window; `Reclaim` voids it after the window has elapsed.
     */
    enum ClearingActionType {
        Approve,
        Cancel,
        Reclaim
    }

    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------

    /**
     * @notice Lightweight summary of a clearing operation, used to avoid loading the
     *         full operation storage slot when only basic details are needed.
     * @param expirationTimestamp Unix timestamp after which the operation may be reclaimed.
     * @param amount              Token quantity covered by the operation.
     * @param destination         Address that will receive the tokens upon approval.
     */
    struct ClearingOperationBasicInfo {
        uint256 expirationTimestamp;
        uint256 amount;
        address destination;
    }

    /**
     * @notice Core descriptor of a pending clearing operation submitted by a token holder.
     * @param partition           ERC-1400 partition the tokens belong to.
     * @param expirationTimestamp Unix timestamp after which the operation expires.
     * @param data                Arbitrary caller-supplied data forwarded to the final
     *                            token operation on approval.
     */
    struct ClearingOperation {
        bytes32 partition;
        uint256 expirationTimestamp;
        bytes data;
    }

    /**
     * @notice Extends `ClearingOperation` with the originating address and optional
     *         operator data, used when a third party submits the operation on behalf of
     *         the token holder.
     * @param clearingOperation Base operation descriptor.
     * @param from              Address of the token holder on whose behalf the operation
     *                          is submitted.
     * @param operatorData      Arbitrary data provided by the calling operator, forwarded
     *                          to the underlying token operation on approval.
     */
    struct ClearingOperationFrom {
        ClearingOperation clearingOperation;
        address from;
        bytes operatorData;
    }

    /**
     * @notice EIP-712 protected variant of a clearing operation, enabling gasless or
     *         meta-transaction submission via an off-chain signature.
     * @dev `deadline` and `nonce` enforce replay protection. The signing party must be
     *      the token holder identified by `from` inside the embedded `clearingOperation`.
     * @param clearingOperation Base operation descriptor.
     * @param from              Token holder that signed the permit.
     * @param deadline          Unix timestamp before which the signature remains valid.
     * @param nonce             Holder's current nonce; incremented on each successful use.
     */
    struct ProtectedClearingOperation {
        ClearingOperation clearingOperation;
        address from;
        uint256 deadline;
        uint256 nonce;
    }

    /**
     * @notice Uniquely identifies a stored clearing operation across all operation types
     *         and partitions.
     * @param clearingOperationType Discriminant indicating the kind of pending operation.
     * @param partition             ERC-1400 partition the tokens belong to.
     * @param tokenHolder           Address of the holder whose tokens are pending.
     * @param clearingId            Sequential identifier assigned when the operation was
     *                              registered.
     */
    struct ClearingOperationIdentifier {
        ClearingOperationType clearingOperationType;
        bytes32 partition;
        address tokenHolder;
        uint256 clearingId;
    }

    /**
     * @notice Full payload for a clearing-guarded token transfer.
     * @param amount              Token quantity to transfer upon approval.
     * @param expirationTimestamp Unix timestamp after which the operation expires.
     * @param destination         Recipient address for the transferred tokens.
     * @param data                Caller-supplied data forwarded to the transfer call.
     * @param operatorData        Data provided by the operator, forwarded on approval.
     * @param operatorType        Classification of the submitting third party.
     */
    struct ClearingTransferData {
        uint256 amount;
        uint256 expirationTimestamp;
        address destination;
        bytes data;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    /**
     * @notice Full payload for a clearing-guarded token redemption.
     * @param amount              Token quantity to redeem upon approval.
     * @param expirationTimestamp Unix timestamp after which the operation expires.
     * @param data                Caller-supplied data forwarded to the redeem call.
     * @param operatorData        Data provided by the operator, forwarded on approval.
     * @param operatorType        Classification of the submitting third party.
     */
    struct ClearingRedeemData {
        uint256 amount;
        uint256 expirationTimestamp;
        bytes data;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    /**
     * @notice Full payload for a clearing-guarded hold creation.
     * @dev On approval the hold is created with the embedded hold parameters; the
     *      clearing expiration and the hold expiration are independent timestamps.
     * @param amount                  Token quantity to place under hold upon approval.
     * @param expirationTimestamp     Unix timestamp after which the clearing operation
     *                                expires and may be reclaimed.
     * @param data                    Caller-supplied data forwarded to the hold-creation
     *                                call.
     * @param holdEscrow              Escrow agent for the resulting hold.
     * @param holdExpirationTimestamp Unix timestamp at which the resulting hold expires.
     * @param holdTo                  Intended recipient if the hold is later executed.
     * @param holdData                Arbitrary data attached to the hold itself.
     * @param operatorData            Data provided by the operator, forwarded on approval.
     * @param operatorType            Classification of the submitting third party.
     */
    struct ClearingHoldCreationData {
        uint256 amount;
        uint256 expirationTimestamp;
        bytes data;
        address holdEscrow;
        uint256 holdExpirationTimestamp;
        address holdTo;
        bytes holdData;
        bytes operatorData;
        ThirdPartyType operatorType;
    }

    // -------------------------------------------------------------------------
    // Events — operation registration
    // -------------------------------------------------------------------------

    /**
     * @notice Emitted when a token holder registers a clearing-guarded redemption on a
     *         partition.
     * @param operator       Address that submitted the clearing operation.
     * @param tokenHolder    Address of the holder whose tokens are pending redemption.
     * @param partition      ERC-1400 partition the tokens belong to.
     * @param clearingId     Sequential identifier for the registered operation.
     * @param amount         Token quantity pending redemption.
     * @param expirationDate Unix timestamp after which the operation may be reclaimed.
     * @param data           Caller-supplied data attached to the operation.
     * @param operatorData   Data provided by the operator.
     */
    event ClearedRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when a clearing-guarded redemption is registered on behalf of a
     *         token holder via `redeemFromByPartition`.
     * @param operator       Address that submitted the clearing operation on behalf of
     *                       the holder.
     * @param tokenHolder    Address of the holder whose tokens are pending redemption.
     * @param partition      ERC-1400 partition the tokens belong to.
     * @param clearingId     Sequential identifier for the registered operation.
     * @param amount         Token quantity pending redemption.
     * @param expirationDate Unix timestamp after which the operation may be reclaimed.
     * @param data           Caller-supplied data attached to the operation.
     * @param operatorData   Data provided by the operator.
     */
    event ClearedRedeemFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when an operator registers a clearing-guarded redemption using
     *         operator-level permissions.
     * @param operator       Authorised operator that submitted the clearing operation.
     * @param tokenHolder    Address of the holder whose tokens are pending redemption.
     * @param partition      ERC-1400 partition the tokens belong to.
     * @param clearingId     Sequential identifier for the registered operation.
     * @param amount         Token quantity pending redemption.
     * @param expirationDate Unix timestamp after which the operation may be reclaimed.
     * @param data           Caller-supplied data attached to the operation.
     * @param operatorData   Data provided by the operator.
     */
    event ClearedOperatorRedeemByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when a token holder registers a clearing-guarded hold creation on
     *         a partition.
     * @param operator       Address that submitted the clearing operation.
     * @param tokenHolder    Address of the holder whose tokens are to be placed under
     *                       hold.
     * @param partition      ERC-1400 partition the tokens belong to.
     * @param clearingId     Sequential identifier for the registered operation.
     * @param hold           Hold parameters that will be used on approval.
     * @param expirationDate Unix timestamp after which the clearing operation may be
     *                       reclaimed.
     * @param data           Caller-supplied data attached to the operation.
     * @param operatorData   Data provided by the operator.
     */
    event ClearedHoldByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldTypes.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when a clearing-guarded hold creation is registered on behalf of a
     *         token holder via `holdFromByPartition`.
     * @param operator       Address that submitted the clearing operation on behalf of
     *                       the holder.
     * @param tokenHolder    Address of the holder whose tokens are to be placed under
     *                       hold.
     * @param partition      ERC-1400 partition the tokens belong to.
     * @param clearingId     Sequential identifier for the registered operation.
     * @param hold           Hold parameters that will be used on approval.
     * @param expirationDate Unix timestamp after which the clearing operation may be
     *                       reclaimed.
     * @param data           Caller-supplied data attached to the operation.
     * @param operatorData   Data provided by the operator.
     */
    event ClearedHoldFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 partition,
        uint256 clearingId,
        IHoldTypes.Hold hold,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when a token holder registers a clearing-guarded transfer on a
     *         partition.
     * @param operator       Address that submitted the clearing operation.
     * @param tokenHolder    Address of the holder whose tokens are pending transfer.
     * @param to             Intended recipient of the tokens upon approval.
     * @param partition      ERC-1400 partition the tokens belong to.
     * @param clearingId     Sequential identifier for the registered operation.
     * @param amount         Token quantity pending transfer.
     * @param expirationDate Unix timestamp after which the operation may be reclaimed.
     * @param data           Caller-supplied data attached to the operation.
     * @param operatorData   Data provided by the operator.
     */
    event ClearedTransferByPartition(
        address indexed operator,
        address indexed tokenHolder,
        address indexed to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when a clearing-guarded transfer is registered on behalf of a
     *         token holder via `transferFromByPartition`.
     * @param operator       Address that submitted the clearing operation on behalf of
     *                       the holder.
     * @param tokenHolder    Address of the holder whose tokens are pending transfer.
     * @param to             Intended recipient of the tokens upon approval.
     * @param partition      ERC-1400 partition the tokens belong to.
     * @param clearingId     Sequential identifier for the registered operation.
     * @param amount         Token quantity pending transfer.
     * @param expirationDate Unix timestamp after which the operation may be reclaimed.
     * @param data           Caller-supplied data attached to the operation.
     * @param operatorData   Data provided by the operator.
     */
    event ClearedTransferFromByPartition(
        address indexed operator,
        address indexed tokenHolder,
        address indexed to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    /**
     * @notice Emitted when an operator registers a clearing-guarded transfer using
     *         operator-level permissions.
     * @param operator       Authorised operator that submitted the clearing operation.
     * @param tokenHolder    Address of the holder whose tokens are pending transfer.
     * @param to             Intended recipient of the tokens upon approval.
     * @param partition      ERC-1400 partition the tokens belong to.
     * @param clearingId     Sequential identifier for the registered operation.
     * @param amount         Token quantity pending transfer.
     * @param expirationDate Unix timestamp after which the operation may be reclaimed.
     * @param data           Caller-supplied data attached to the operation.
     * @param operatorData   Data provided by the operator.
     */
    event ClearedOperatorTransferByPartition(
        address indexed operator,
        address indexed tokenHolder,
        address indexed to,
        bytes32 partition,
        uint256 clearingId,
        uint256 amount,
        uint256 expirationDate,
        bytes data,
        bytes operatorData
    );

    // -------------------------------------------------------------------------
    // Events — feature lifecycle
    // -------------------------------------------------------------------------

    /**
     * @notice Emitted when the clearing feature is enabled for the token.
     * @param operator Address of the administrator that activated clearing.
     */
    event ClearingActivated(address indexed operator);

    /**
     * @notice Emitted when the clearing feature is disabled for the token.
     * @param operator Address of the administrator that deactivated clearing.
     */
    event ClearingDeactivated(address indexed operator);

    // -------------------------------------------------------------------------
    // Events — operation lifecycle
    // -------------------------------------------------------------------------

    /**
     * @notice Emitted when a pending clearing operation is approved and the underlying
     *         token operation is executed.
     * @param operator              Address that approved the operation.
     * @param tokenHolder           Address of the holder whose tokens were pending.
     * @param partition             ERC-1400 partition the tokens belong to.
     * @param clearingId            Sequential identifier of the approved operation.
     * @param clearingOperationType Discriminant indicating the kind of operation approved.
     * @param operationData         Encoded data forwarded to the underlying token call.
     */
    event ClearingOperationApproved(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        ClearingOperationType clearingOperationType,
        bytes operationData
    );

    /**
     * @notice Emitted when a pending clearing operation is cancelled before it expires.
     * @param operator              Address that cancelled the operation.
     * @param tokenHolder           Address of the holder whose tokens were pending.
     * @param partition             ERC-1400 partition the tokens belong to.
     * @param clearingId            Sequential identifier of the cancelled operation.
     * @param clearingOperationType Discriminant indicating the kind of operation cancelled.
     */
    event ClearingOperationCanceled(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        ClearingOperationType clearingOperationType
    );

    /**
     * @notice Emitted when an expired clearing operation is reclaimed, releasing the
     *         locked tokens back to the holder.
     * @param operator              Address that reclaimed the operation.
     * @param tokenHolder           Address of the holder whose tokens were pending.
     * @param partition             ERC-1400 partition the tokens belong to.
     * @param clearingId            Sequential identifier of the reclaimed operation.
     * @param clearingOperationType Discriminant indicating the kind of operation reclaimed.
     */
    event ClearingOperationReclaimed(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 clearingId,
        ClearingOperationType clearingOperationType
    );

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    /**
     * @notice Thrown when the supplied `clearingId` does not correspond to an existing
     *         or active clearing operation for the given holder and partition.
     */
    error WrongClearingId();

    /**
     * @notice Thrown when a clearing-dependent operation is attempted while the clearing
     *         feature is disabled on the token.
     */
    error ClearingIsDisabled();

    /**
     * @notice Thrown when an administration action requires clearing to be inactive but
     *         it is currently enabled.
     */
    error ClearingIsActivated();

    /**
     * @notice Thrown when an action requires the clearing operation to still be within
     *         its validity window but its expiration timestamp has already passed.
     */
    error ExpirationDateReached();

    /**
     * @notice Thrown when an action requires the clearing operation to have expired
     *         (e.g., a reclaim attempt) but the expiration timestamp has not yet passed.
     */
    error ExpirationDateNotReached();

    /**
     * @notice Thrown when the token amount supplied for a clearing operation is invalid
     *         (e.g., zero or exceeding the holder's available balance).
     */
    error InvalidClearingAmount();
}
