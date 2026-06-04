// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  IERC1410Types
 * @author Asset Tokenization Studio Team
 * @notice Shared structs, events, and errors for the ERC-1410 partially-fungible token
 *         standard. Imported by every facet and storage wrapper that participates in
 *         partition-based transfer, issuance, redemption, or operator management.
 */
interface IERC1410Types {
    /**
     * @notice Minimal transfer descriptor used for single-partition transfer calls.
     * @param to    Recipient address.
     * @param value Token quantity to transfer.
     */
    struct BasicTransferInfo {
        address to;
        uint256 value;
    }

    /**
     * @notice Full transfer descriptor used for operator-initiated partition transfers.
     * @param partition    Source partition the tokens are transferred from.
     * @param from         Address whose tokens are being transferred.
     * @param to           Recipient address.
     * @param value        Token quantity to transfer.
     * @param data         Caller-supplied data forwarded to the transfer hook.
     * @param operatorData Additional data supplied by the operator.
     */
    struct OperatorTransferData {
        bytes32 partition;
        address from;
        address to;
        uint256 value;
        bytes data;
        bytes operatorData;
    }

    /**
     * @notice Descriptor used for partition-based token issuance.
     * @param partition    Target partition to issue tokens into.
     * @param tokenHolder  Address receiving the newly issued tokens.
     * @param value        Token quantity to issue.
     * @param data         Caller-supplied data forwarded to the issuance hook.
     */
    struct IssueData {
        bytes32 partition;
        address tokenHolder;
        uint256 value;
        bytes data;
    }

    /**
     * @notice Emitted when tokens are transferred from one partition to another or within the same partition.
     * @param _fromPartition Source partition.
     * @param _operator      Address that initiated the transfer.
     * @param _from          Token holder whose balance decreased.
     * @param _to            Recipient whose balance increased.
     * @param _value         Token quantity transferred.
     * @param _data          Caller-supplied data.
     * @param _operatorData  Operator-supplied data.
     */
    event TransferByPartition(
        bytes32 indexed _fromPartition,
        address _operator,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    /**
     * @notice Emitted when an operator is authorised to manage all partitions of a token holder.
     * @param operator    Newly authorised operator address.
     * @param tokenHolder Token holder who granted the authorisation.
     */
    event AuthorizedOperator(address indexed operator, address indexed tokenHolder);

    /**
     * @notice Emitted when an operator's authorisation over all partitions of a token holder is revoked.
     * @param operator    Operator whose authorisation was revoked.
     * @param tokenHolder Token holder who revoked the authorisation.
     */
    event RevokedOperator(address indexed operator, address indexed tokenHolder);

    /**
     * @notice Emitted when an operator is authorised for a specific partition of a token holder.
     * @param partition   Partition the authorisation applies to.
     * @param operator    Newly authorised operator address.
     * @param tokenHolder Token holder who granted the authorisation.
     */
    event AuthorizedOperatorByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed tokenHolder
    );

    /**
     * @notice Emitted when an operator's authorisation for a specific partition of a token holder is revoked.
     * @param partition   Partition the revocation applies to.
     * @param operator    Operator whose authorisation was revoked.
     * @param tokenHolder Token holder who revoked the authorisation.
     */
    event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);

    /**
     * @notice Emitted when new tokens are issued into a partition.
     * @param partition Partition the tokens were issued into.
     * @param operator  Address that performed the issuance.
     * @param to        Recipient of the issued tokens.
     * @param value     Token quantity issued.
     * @param data      Caller-supplied data attached to the issuance.
     */
    event IssuedByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed to,
        uint256 value,
        bytes data
    );

    /**
     * @notice Emitted when tokens are redeemed from a partition.
     * @param partition    Partition the tokens were redeemed from.
     * @param operator     Address that performed the redemption.
     * @param from         Token holder whose tokens were redeemed.
     * @param value        Token quantity redeemed.
     * @param data         Caller-supplied data attached to the redemption.
     * @param operatorData Operator-supplied data attached to the redemption.
     */
    event RedeemedByPartition(
        bytes32 indexed partition,
        address indexed operator,
        address indexed from,
        uint256 value,
        bytes data,
        bytes operatorData
    );

    /// @notice Thrown when a single-partition operation is attempted on a multi-partition token.
    error NotAllowedInMultiPartitionMode();

    /**
     * @notice Thrown when a multi-partition operation specifies a partition not permitted in single-partition mode.
     * @param partition The disallowed partition supplied by the caller.
     */
    error PartitionNotAllowedInSinglePartitionMode(bytes32 partition);

    /// @notice Thrown when the zero bytes32 value is supplied as a partition identifier.
    error ZeroPartition();

    /// @notice Thrown when a zero token amount is supplied to an operation that requires a positive value.
    error ZeroValue();

    /**
     * @notice Thrown when an account does not hold or is not associated with the specified partition.
     * @param account   Address that was checked.
     * @param partition Partition that was not found for the account.
     */
    error InvalidPartition(address account, bytes32 partition);

    /**
     * @notice Thrown when the caller is not an authorised operator for the token holder on the given partition.
     * @param operator    Address that attempted the operation.
     * @param tokenHolder Token holder whose tokens were targeted.
     * @param partition   Partition on which authorisation was checked.
     */
    error Unauthorized(address operator, address tokenHolder, bytes32 partition);

    /**
     * @notice Thrown when an operation targets a token holder address that has no registered balance.
     * @param tokenHolder The address that was not found.
     */
    error TokenHolderNotFound(address tokenHolder);
}
