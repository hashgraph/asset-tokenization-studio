// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IComplianceByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for partition-aware transfer-eligibility and redemption checks.
 * @dev Read-only counterpart of `IComplianceFacet` for multi-partition mode. Both methods
 *      short-circuit with the EIP-1066 PAUSED status code when the token is paused.
 */
interface IComplianceByPartition {
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
     * @return status True when the transfer is allowed.
     * @return code EIP-1066 status code describing the result.
     * @return reason Additional reason data tied to the status code.
     */
    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool status, bytes1 code, bytes32 reason);

    /**
     * @notice Checks whether a redemption can be executed on a specific partition.
     * @dev Assumes that if the caller has an admin role the redemption will be performed using the
     *      associated method.
     * @param _from The address whose tokens would be redeemed.
     * @param _partition The partition the redemption would happen in.
     * @param _value The amount of tokens to redeem.
     * @param _data Additional data attached to the redemption check.
     * @param _operatorData Additional data attached by the operator.
     * @return status True when the redemption is allowed.
     * @return code EIP-1066 status code describing the result.
     * @return reason Additional reason data tied to the status code.
     */
    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view returns (bool status, bytes1 code, bytes32 reason);
}
