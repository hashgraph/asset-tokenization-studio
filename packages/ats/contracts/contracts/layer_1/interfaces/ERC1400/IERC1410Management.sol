// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.8.0 <0.9.0;

import { OperatorTransferData } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { IssueData } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";

/**
 * @title IERC1410Management
 * @dev Interface for the ERC1410Management contract providing all management operations
 * for ERC1410 tokens including operator management and controller functions.
 */
interface IERC1410Management {
    // Initialization function
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool _multiPartition) external;

    /**
     * @notice Forces a transfer in a partition from a token holder to a destination address
     * @dev Can only be used by the controller role
     */
    function controllerTransferByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    /**
     * @notice Forces a redeem in a partition from a token holder
     * @dev Can only be used by the controller role
     */
    function controllerRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    /**
     * @notice Transfers the ownership of tokens from a specified partition from one address to another address
     * @param _operatorTransferData contains all the information about the operator transfer
     */
    function operatorTransferByPartition(
        OperatorTransferData calldata _operatorTransferData
    ) external returns (bytes32);

    /**
     * @notice Decreases totalSupply and the corresponding amount of the specified partition of tokenHolder
     * @dev This function can only be called by the authorised operator.
     * @param _partition The partition to allocate the decrease in balance.
     * @param _tokenHolder The token holder whose balance should be decreased
     * @param _value The amount by which to decrease the balance
     * @param _data Additional data attached to the burning of tokens
     * @param _operatorData Additional data attached to the transfer of tokens by the operator
     */
    function operatorRedeemByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    /**
     * @notice Transfers tokens from the token holder to another address by presenting an off-chain signature
     * @dev Can only be called by the protected partitions role
     */
    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) external;

    /**
     * @notice Redeems tokens from the token holder by presenting an off-chain signature
     * @dev Can only be called by the protected partitions role
     */
    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) external;
}
