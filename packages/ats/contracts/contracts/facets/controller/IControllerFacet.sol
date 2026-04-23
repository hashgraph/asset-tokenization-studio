// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Types } from "../layer_1/ERC3643/IERC3643Types.sol";

/**
 * @title IControllerFacet
 * @notice Interface for the ControllerFacet, grouping all controller and agent management operations.
 * @dev Combines ERC-1644 forced-transfer / controllability lifecycle with ERC-3643 agent role
 *      management. Inherits `AgentAdded` and `AgentRemoved` events from `IERC3643Types`.
 */
interface IControllerFacet is IERC3643Types {
    /// @notice Emitted when the controller feature is permanently disabled for a token.
    event FinalizedControllerFeature(address operator);

    /**
     * @notice Emitted when an authorised controller transfers tokens between two holders.
     * @param _controller The address of the controller that initiated the transfer.
     * @param _from The address tokens are transferred from.
     * @param _to The address tokens are transferred to.
     * @param _value The amount of tokens transferred.
     * @param _data Optional data attached to the transfer for validation.
     * @param _operatorData Optional data attached by the controller for event attribution.
     */
    event ControllerTransfer(
        address _controller,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );
    /**
     * @notice Emitted when an authorised controller redeems (burns) tokens on behalf of a holder.
     * @param _controller The address of the controller that initiated the redemption.
     * @param _tokenHolder The account whose tokens are redeemed.
     * @param _value The amount of tokens redeemed.
     * @param _data Optional data attached to the redemption for validation.
     * @param _operatorData Optional data attached by the controller for event attribution.
     */
    event ControllerRedemption(
        address _controller,
        address indexed _tokenHolder,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    /// @notice Thrown when an operation requires the token to be controllable but it is not.
    error TokenIsNotControllable();

    /**
     * @dev Initial configuration
     * @param _isControllable true is controllable, false is not controllable
     */
    // solhint-disable-next-line func-name-mixedcase
    function initializeController(bool _isControllable) external;

    /**
     * @notice This function allows an authorised address to transfer tokens between any two token holders.
     * @dev This function can only be executed by the `controller` or `agent` address.
     * @param _from Address The address which you want to send tokens from
     * @param _to Address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @param _data data to validate the transfer
     * @param _operatorData data attached to the transfer by controller to emit in event
     */
    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    /**
     * @notice This function allows an authorised address to redeem tokens for any token holder.
     * @dev This function can only be executed by the `controller` or `agent` address.
     * @param _tokenHolder The account whose tokens will be redeemed.
     * @param _value uint256 the amount of tokens need to be redeemed.
     * @param _data data to validate the transfer
     * @param _operatorData data attached to the transfer by controller to emit in event
     */
    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    /**
     * @dev Performs a forced transfer of `_amount` tokens from `_from` to `_to`.
     * @dev This function should only be callable by an authorized entity.
     * Returns `true` if the transfer was successful.
     * Emits a ControllerTransfer event.
     */
    function forcedTransfer(address _from, address _to, uint256 _amount) external returns (bool);

    /**
     * @notice Gives an account the agent role
     * @notice Granting an agent role allows the account to perform multiple ERC-1400 actions
     * @dev Can only be called by the role admin
     */
    function addAgent(address _agent) external;

    /**
     * @notice Revokes an account the agent role
     * @dev Can only be called by the role admin
     */
    function removeAgent(address _agent) external;

    /**
     * @notice It is used to end the controller feature from the token
     * @dev It only be called by the `owner/issuer` of the token
     */
    function finalizeControllable() external;

    /**
     * @notice In order to provide transparency over whether `controllerTransfer` / `controllerRedeem` are useable
     * or not `isControllable` function will be used.
     * @return bool `true` when controller address is non-zero otherwise return `false`.
     */
    function isControllable() external view returns (bool);

    /**
     * @dev Checks if an account has the agent role
     */
    function isAgent(address _agent) external view returns (bool);
}
