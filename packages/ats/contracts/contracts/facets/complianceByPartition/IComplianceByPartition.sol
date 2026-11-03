// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey ComplianceByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_COMPLIANCE_BY_PARTITION = 0xafad2096960379c99c5eae984f0f4ceddafa69c3e08352bcaf84e804ec4135b6;

/**
 * @title IComplianceByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for partition-aware transfer-eligibility and redemption checks.
 * @dev Read-only counterpart of `IComplianceFacet` for multi-partition mode. Both methods
 *      short-circuit with the EIP-1066 PAUSED status code when the token is paused.
 */
interface IComplianceByPartition {
    /**
     * @notice Emitted once when the compliance by partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeComplianceByPartition`.
     */
    event ComplianceByPartitionInitialized();

    /**
     * @notice Initialises the compliance by partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeComplianceByPartition() external;

    /**
     * @notice Checks whether a transfer can be executed on a specific partition.
     * @dev Assumes that if the caller has an admin role the transfer will be performed using the
     *      associated method. For example, if msg.sender is an operator of `_to`, the transfer
     *      will be performed using `operatorTransferByPartition`. Using other methods can lead to
     *      inconsistent results.
     * @param _from The sender address.
     * @param _to The recipient address.
     * @param _partition The partition the transfer would happen in.
     * @param _value The amount of tokens to transfer.
     * @param _data Additional data attached to the transfer check.
     * @param _operatorData Additional data attached by the operator.
     * @return status_ True when the transfer is allowed.
     * @return code_ EIP-1066 status code describing the result.
     * @return reason_ Additional reason data tied to the status code.
     */
    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool status_, bytes1 code_, bytes32 reason_);

    /**
     * @notice Checks whether a redemption can be executed on a specific partition.
     * @dev Assumes that if the caller has an admin role the redemption will be performed using the
     *      associated method.
     * @param _from The address whose tokens would be redeemed.
     * @param _partition The partition the redemption would happen in.
     * @param _value The amount of tokens to redeem.
     * @param _data Additional data attached to the redemption check.
     * @param _operatorData Additional data attached by the operator.
     * @return status_ True when the redemption is allowed.
     * @return code_ EIP-1066 status code describing the result.
     * @return reason_ Additional reason data tied to the status code.
     */
    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool status_, bytes1 code_, bytes32 reason_);
}
