// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BasicTransferInfo } from "./IERC1410Types.sol";

/**
 * @title IERC1410TokenHolder
 * @dev Interface for the ERC1410TokenHolder contract providing all transfer operations
 * for ERC1410 tokens including transfers, operator transfers, redemptions, and issuance.
 */
interface IERC1410TokenHolder {
    /**
     * @notice Transfers the ownership of tokens from a specified partition from one address to another address
     * @param _partition The partition from which to transfer tokens
     * @param _basicTransferInfo The address to which to transfer tokens to and the amount
     * @param _data Additional data attached to the transfer of tokens
     * @return The partition to which the transferred tokens were allocated for the _to address
     */
    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    ) external returns (bytes32);

    /**
     * @notice Decreases totalSupply and the corresponding amount of the specified partition of _msgSender()
     * @param _partition The partition to allocate the decrease in balance
     * @param _value The amount by which to decrease the balance
     * @param _data Additional data attached to the burning of tokens
     */
    function redeemByPartition(bytes32 _partition, uint256 _value, bytes calldata _data) external;

    /**
     * @notice Triggers any pending scheduled tasks and records user balance if needed
     */
    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external;

    /**
     * @notice Authorises an operator for all partitions of `msg.sender`
     * @param _operator An address which is being authorised
     */
    function authorizeOperator(address _operator) external;

    /**
     * @notice Revokes authorisation of an operator previously given for all partitions of `msg.sender`
     * @param _operator An address which is being de-authorised
     */
    function revokeOperator(address _operator) external;

    /**
     * @notice Authorises an operator for a given partition of `msg.sender`
     * @param _partition The partition to which the operator is authorised
     * @param _operator An address which is being authorised
     */
    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external;

    /**
     * @notice Revokes authorisation of an operator previously given for a specified partition of `msg.sender`
     * @param _partition The partition to which the operator is de-authorised
     * @param _operator An address which is being de-authorised
     */
    function revokeOperatorByPartition(bytes32 _partition, address _operator) external;
}
