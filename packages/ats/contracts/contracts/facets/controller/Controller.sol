// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IControllerFacet } from "./IControllerFacet.sol";
import { IERC3643Types } from "../layer_1/ERC3643/IERC3643Types.sol";
import { _DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE, _AGENT_ROLE, _buildRoles } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../domain/asset/ERC1644StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { Modifiers } from "../../services/Modifiers.sol";

abstract contract Controller is IControllerFacet, Modifiers {
    /// @inheritdoc IControllerFacet
    // solhint-disable-next-line func-name-mixedcase
    function initializeController(bool _controllable) external override onlyNotControllerInitialized {
        ERC1644StorageWrapper.initializeController(_controllable);
    }

    /// @inheritdoc IControllerFacet
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
        onlyAnyRole(_buildRoles(_CONTROLLER_ROLE, _AGENT_ROLE))
    {
        TokenCoreOps.transfer(_from, _to, _value);
        emit IControllerFacet.ControllerTransfer(EvmAccessors.getMsgSender(), _from, _to, _value, _data, _operatorData);
    }

    /// @inheritdoc IControllerFacet
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
        onlyAnyRole(_buildRoles(_CONTROLLER_ROLE, _AGENT_ROLE))
    {
        TokenCoreOps.burn(_tokenHolder, _value);
        emit IControllerFacet.ControllerRedemption(
            EvmAccessors.getMsgSender(),
            _tokenHolder,
            _value,
            _data,
            _operatorData
        );
    }

    /// @inheritdoc IControllerFacet
    function finalizeControllable() external override onlyRole(_DEFAULT_ADMIN_ROLE) onlyControllable {
        ERC1644StorageWrapper.finalizeControllable();
    }

    /// @inheritdoc IControllerFacet
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
        onlyAnyRole(_buildRoles(_CONTROLLER_ROLE, _AGENT_ROLE))
        returns (bool)
    {
        TokenCoreOps.transfer(_from, _to, _amount);
        emit IControllerFacet.ControllerTransfer(EvmAccessors.getMsgSender(), _from, _to, _amount, "", "");
        return true;
    }

    /// @inheritdoc IControllerFacet
    function addAgent(address _agent) external override onlyUnpaused onlyAdminRole {
        ERC3643StorageWrapper.addAgent(_agent);
        emit IERC3643Types.AgentAdded(_agent);
    }

    /// @inheritdoc IControllerFacet
    function removeAgent(address _agent) external override onlyUnpaused onlyAdminRole {
        ERC3643StorageWrapper.removeAgent(_agent);
        emit IERC3643Types.AgentRemoved(_agent);
    }

    /// @inheritdoc IControllerFacet
    function isControllable() external view override returns (bool) {
        return ERC1644StorageWrapper.isControllable();
    }

    /// @inheritdoc IControllerFacet
    function isAgent(address _agent) external view override returns (bool) {
        return AccessControlStorageWrapper.hasRole(_AGENT_ROLE, _agent);
    }
}
