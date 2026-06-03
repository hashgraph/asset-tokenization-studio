// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";

/// @custom:hash resolverKey OperatorByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_OPERATOR_BY_PARTITION = 0xfd060cda1c9927203f3914aa0d5916e4c5971977dec4026418bc4fff6d25b277;

/**
 * @title  IOperatorByPartition
 * @notice Interface for per-partition operator management: authorise, revoke, and query
 *         operators scoped to individual token partitions, and execute operator-initiated
 *         transfers and redemptions on those partitions.
 * @dev    All storage reads and writes delegate to `ERC1410StorageWrapper`. Events
 *         (`AuthorizedOperatorByPartition`, `RevokedOperatorByPartition`,
 *         `TransferByPartition`, `RedeemedByPartition`) are inherited from `IERC1410Types`
 *         and emitted by the storage wrapper or `TokenCoreOps` respectively.
 * @author Asset Tokenization Studio Team
 */
interface IOperatorByPartition is IERC1410Types {
    /**
     * @notice Emitted once when the operator-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeOperatorByPartition`.
     */
    event OperatorByPartitionInitialized();

    /**
     * @notice Emitted once when the operator-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeOperatorByPartition`.
     */
    event TestoperatorByPartitionInitialized();

    /**
     * @notice Initialises the operator-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeOperatorByPartition() external;

    /**
     * @notice Authorises an operator to manage a specific partition of `msg.sender`'s tokens.
     * @dev    The token must not be paused. Both `msg.sender` and `_operator` must pass
     *         compliance checks. Reverts when the partition is incompatible with the token's
     *         partition mode (single-partition tokens only accept the default partition).
     *         Emits {AuthorizedOperatorByPartition} via
     *         `ERC1410StorageWrapper.authorizeOperatorByPartition`.
     * @param _partition  The partition the operator is authorised for.
     * @param _operator   The address being authorised as operator.
     */
    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external;

    /**
     * @notice Revokes a previously authorised operator from a specific partition of
     *         `msg.sender`'s tokens.
     * @dev    The token must not be paused. `msg.sender` and `_operator` must be identified
     *         addresses and both must pass compliance checks. Reverts when the partition is
     *         incompatible with the token's partition mode.
     *         Emits {RevokedOperatorByPartition} via
     *         `ERC1410StorageWrapper.revokeOperatorByPartition`.
     * @param _partition  The partition from which the operator is de-authorised.
     * @param _operator   The address being de-authorised.
     */
    function revokeOperatorByPartition(bytes32 _partition, address _operator) external;

    /**
     * @notice Transfers tokens on behalf of a token holder from a specified partition to
     *         another address.
     * @dev    The caller must be an authorised operator for `_operatorTransferData.partition`
     *         of `_operatorTransferData.from`. Enforces partition-mode rules,
     *         unprotected-partition restrictions, and transfer-eligibility checks.
     *         Emits {TransferByPartition} via `TokenCoreOps.operatorTransferByPartition`.
     * @param _operatorTransferData  Struct containing partition, from, to, value, data, and
     *                               operatorData.
     * @return The partition to which the transferred tokens were allocated for the recipient.
     */
    function operatorTransferByPartition(
        OperatorTransferData calldata _operatorTransferData
    ) external returns (bytes32);

    /**
     * @notice Decreases the total supply and the partition balance of a token holder on
     *         behalf of an authorised operator.
     * @dev    The caller must be an authorised operator for `_partition` of `_tokenHolder`.
     *         Enforces partition-mode rules, unprotected-partition restrictions, and
     *         redemption-eligibility checks.
     *         Emits {RedeemedByPartition} via `TokenCoreOps.redeemByPartition`.
     * @param _partition      The partition from which tokens are redeemed.
     * @param _tokenHolder    The address whose tokens are redeemed.
     * @param _value          The number of tokens to redeem.
     * @param _data           Additional data attached to the redemption (passed to hooks).
     * @param _operatorData   Additional data attached by the operator.
     */
    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    /**
     * @notice Returns whether `_operator` is an authorised operator for a specific partition
     *         of `_tokenHolder`.
     * @dev    Returns `true` if `_operator` has been authorised for all partitions of
     *         `_tokenHolder` (via `authorizeOperator`) OR has explicit per-partition approval
     *         (via `authorizeOperatorByPartition`). Read-only; no access control applied.
     * @param _partition    The partition to query.
     * @param _operator     The operator address to check.
     * @param _tokenHolder  The token holder whose partition is being queried.
     * @return bool `true` if `_operator` is authorised for `_partition` of `_tokenHolder`.
     */
    function isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) external view returns (bool);
}
