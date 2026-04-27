// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IController } from "./IController.sol";
import { IERC3643Types } from "../layer_1/ERC3643/IERC3643Types.sol";
import { DEFAULT_ADMIN_ROLE, CONTROLLER_ROLE, AGENT_ROLE, _buildRoles } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../domain/asset/ERC1644StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title Controller
 * @notice Implementation of the Controller domain. Delegates into the existing storage wrappers so
 *         semantics match `ERC1644` / `ERC3643Management` exactly.
 */
abstract contract Controller is IController, Modifiers {
    /// @inheritdoc IController
    function initializeController(bool _controllable) external override onlyNotControllerInitialized {
        ERC1644StorageWrapper.initializeController(_controllable);
    }

    /// @inheritdoc IController
    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyControllable
        onlyWithoutMultiPartition
        onlyAnyRole(_buildRoles(CONTROLLER_ROLE, AGENT_ROLE))
    {
        TokenCoreOps.transfer(_from, _to, _value);
        emit IController.ControllerTransfer(EvmAccessors.getMsgSender(), _from, _to, _value, _data, _operatorData);
    }

    /// @inheritdoc IController
    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    )
        external
        override
        onlyUnpaused
        onlyControllable
        onlyWithoutMultiPartition
        onlyAnyRole(_buildRoles(CONTROLLER_ROLE, AGENT_ROLE))
    {
        TokenCoreOps.burn(_tokenHolder, _value);
        emit IController.ControllerRedemption(EvmAccessors.getMsgSender(), _tokenHolder, _value, _data, _operatorData);
    }

    /// @inheritdoc IController
    function finalizeControllable() external override onlyRole(DEFAULT_ADMIN_ROLE) onlyControllable {
        ERC1644StorageWrapper.finalizeControllable();
    }

    /// @inheritdoc IController
    function forcedTransfer(
        address _from,
        address _to,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyControllable
        onlyAnyRole(_buildRoles(CONTROLLER_ROLE, AGENT_ROLE))
        returns (bool)
    {
        TokenCoreOps.transfer(_from, _to, _amount);
        emit IController.ControllerTransfer(EvmAccessors.getMsgSender(), _from, _to, _amount, "", "");
        return true;
    }

    /// @inheritdoc IController
    function addAgent(address _agent) external override onlyUnpaused onlyAdminRole {
        ERC3643StorageWrapper.addAgent(_agent);
        emit IERC3643Types.AgentAdded(_agent);
    }

    /// @inheritdoc IController
    function removeAgent(address _agent) external override onlyUnpaused onlyAdminRole {
        ERC3643StorageWrapper.removeAgent(_agent);
        emit IERC3643Types.AgentRemoved(_agent);
    }

    /// @inheritdoc IController
    function isControllable() external view override returns (bool) {
        return ERC1644StorageWrapper.isControllable();
    }

    /// @inheritdoc IController
    function isAgent(address _agent) external view override returns (bool) {
        return AccessControlStorageWrapper.hasRole(AGENT_ROLE, _agent);
    }
}
