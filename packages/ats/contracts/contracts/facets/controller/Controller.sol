// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControllerFacet } from "./IControllerFacet.sol";
import { IERC3643Types } from "../layer_1/ERC3643/IERC3643Types.sol";
import { _DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE, _AGENT_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../domain/asset/ERC1644StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title Controller
 * @notice Abstract implementation of ERC-1644 forced-transfer operations and ERC-3643 agent management.
 * @dev Consolidates `controllerTransfer`, `controllerRedeem`, `forcedTransfer`, `finalizeControllable`,
 *      `addAgent`, `removeAgent`, `isControllable`, `isAgent`, and the `initialize_Controller` initializer
 *      in a single abstract contract. Forced-transfer functions are restricted to single-partition mode
 *      and require the caller to hold either `_CONTROLLER_ROLE` or `_AGENT_ROLE`. Agent management
 *      functions require the role-admin of `_AGENT_ROLE`.
 */
abstract contract Controller is IControllerFacet, Modifiers {
    /**
     * @notice Initialises the ERC-1644 controllability flag for the token.
     * @param _controllable True to enable the controller feature, false to disable it from the start.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Controller(bool _controllable) external override onlyNotControllerInitialized {
        ERC1644StorageWrapper.initialize_Controller(_controllable);
    }

    /**
     * @notice Transfers tokens between any two holders on behalf of a controller.
     * @dev Caller must hold `_CONTROLLER_ROLE` or `_AGENT_ROLE`. Only available in single-partition mode.
     * @param _from The address to transfer tokens from.
     * @param _to The address to transfer tokens to.
     * @param _value The amount of tokens to transfer.
     * @param _data Optional data for transfer validation.
     * @param _operatorData Optional data attached by the controller for event attribution.
     */
    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyUnpaused onlyControllable onlyWithoutMultiPartition {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        TokenCoreOps.transfer(_from, _to, _value);
        emit IControllerFacet.ControllerTransfer(EvmAccessors.getMsgSender(), _from, _to, _value, _data, _operatorData);
    }

    /**
     * @notice Redeems (burns) tokens from any holder on behalf of a controller.
     * @dev Caller must hold `_CONTROLLER_ROLE` or `_AGENT_ROLE`. Only available in single-partition mode.
     * @param _tokenHolder The account whose tokens will be redeemed.
     * @param _value The amount of tokens to redeem.
     * @param _data Optional data for redemption validation.
     * @param _operatorData Optional data attached by the controller for event attribution.
     */
    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyUnpaused onlyControllable onlyWithoutMultiPartition {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        TokenCoreOps.burn(_tokenHolder, _value);
        emit IControllerFacet.ControllerRedemption(
            EvmAccessors.getMsgSender(),
            _tokenHolder,
            _value,
            _data,
            _operatorData
        );
    }

    /**
     * @notice Permanently disables the controller feature for the token.
     * @dev Can only be called by the `_DEFAULT_ADMIN_ROLE`. Irreversible.
     */
    function finalizeControllable() external override onlyRole(_DEFAULT_ADMIN_ROLE) onlyControllable {
        ERC1644StorageWrapper.finalizeControllable();
    }

    /**
     * @notice Performs a forced transfer of tokens from one holder to another.
     * @dev Caller must hold `_CONTROLLER_ROLE` or `_AGENT_ROLE`. Only available in single-partition mode.
     * @param _from The address to transfer tokens from.
     * @param _to The address to transfer tokens to.
     * @param _amount The amount of tokens to transfer.
     * @return True if the transfer was successful.
     */
    function forcedTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external override onlyUnpaused onlyWithoutMultiPartition onlyControllable returns (bool) {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        TokenCoreOps.transfer(_from, _to, _amount);
        emit IControllerFacet.ControllerTransfer(EvmAccessors.getMsgSender(), _from, _to, _amount, "", "");
        return true;
    }

    /**
     * @notice Grants the agent role to an account.
     * @dev Caller must be the role-admin of `_AGENT_ROLE`.
     * @param _agent The address to grant the agent role to.
     */
    function addAgent(
        address _agent
    ) external override onlyUnpaused onlyRole(AccessControlStorageWrapper.getRoleAdmin(_AGENT_ROLE)) {
        ERC3643StorageWrapper.addAgent(_agent);
        emit IERC3643Types.AgentAdded(_agent);
    }

    /**
     * @notice Revokes the agent role from an account.
     * @dev Caller must be the role-admin of `_AGENT_ROLE`.
     * @param _agent The address to revoke the agent role from.
     */
    function removeAgent(
        address _agent
    ) external override onlyUnpaused onlyRole(AccessControlStorageWrapper.getRoleAdmin(_AGENT_ROLE)) {
        ERC3643StorageWrapper.removeAgent(_agent);
        emit IERC3643Types.AgentRemoved(_agent);
    }

    /**
     * @notice Returns whether the token has the controller feature enabled.
     * @return True if the token is controllable, false otherwise.
     */
    function isControllable() external view override returns (bool) {
        return ERC1644StorageWrapper.isControllable();
    }

    /**
     * @notice Returns whether an account holds the agent role.
     * @param _agent The address to check.
     * @return True if the account has the agent role, false otherwise.
     */
    function isAgent(address _agent) external view override returns (bool) {
        return AccessControlStorageWrapper.hasRole(_AGENT_ROLE, _agent);
    }
}
