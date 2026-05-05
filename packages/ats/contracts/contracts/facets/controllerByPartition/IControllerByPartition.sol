// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";

/**
 * @title IControllerByPartition
 * @notice Interface for controller-initiated forced transfers and redemptions on a specific partition.
 * @dev Exposes two write methods that allow an authorised controller or agent to forcibly transfer
 *      or redeem tokens from any token holder's balance on a given partition. Both operations
 *      require the token to be controllable and not paused, and are restricted to single-partition
 *      mode with the default partition.
 */
interface IControllerByPartition is IERC1410Types {
    /**
     * @notice Forces a transfer in a partition from a token holder to a destination address.
     * @dev Can only be called by a user with the controller or agent role. The contract must be
     *      controllable and not paused. Only valid in single-partition mode with the default partition.
     * @param _partition The partition from which tokens are transferred.
     * @param _from The address from which tokens are transferred.
     * @param _to The address to which tokens are transferred.
     * @param _value The amount of tokens to transfer.
     * @param _data Additional data attached to the transfer.
     * @param _operatorData Additional data attached to the transfer by the operator.
     * @return The partition from which the tokens were transferred.
     */
    function controllerTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external returns (bytes32);

    /**
     * @notice Forces a redemption in a partition from a token holder.
     * @dev Can only be called by a user with the controller or agent role. The contract must be
     *      controllable and not paused. Only valid in single-partition mode with the default partition.
     * @param _partition The partition from which tokens are redeemed.
     * @param _tokenHolder The address whose tokens are redeemed.
     * @param _value The amount of tokens to redeem.
     * @param _data Additional data attached to the redemption.
     * @param _operatorData Additional data attached to the redemption by the operator.
     */
    function controllerRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;
}
