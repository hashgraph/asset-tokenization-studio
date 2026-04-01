// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644 } from "./IERC1644.sol";
import { IERC1644StorageWrapper } from "../../../../domain/asset/ERC1400/ERC1644/IERC1644StorageWrapper.sol";
import { _DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../../domain/asset/ERC1644StorageWrapper.sol";
import { _checkNotInitialized } from "../../../../services/InitializationErrors.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";

abstract contract ERC1644 is IERC1644, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(bool _controllable) external override {
        _checkNotInitialized(ERC1644StorageWrapper.isERC1644Initialized());
        ERC1644StorageWrapper.initialize_ERC1644(_controllable);
    }

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
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.transfer(_from, _to, _value);
        emit IERC1644StorageWrapper.ControllerTransfer(msg.sender, _from, _to, _value, _data, _operatorData);
    }

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
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.burn(_tokenHolder, _value);
        emit IERC1644StorageWrapper.ControllerRedemption(msg.sender, _tokenHolder, _value, _data, _operatorData);
    }

    function finalizeControllable() external override onlyRole(_DEFAULT_ADMIN_ROLE) onlyControllable {
        ERC1644StorageWrapper.finalizeControllable();
    }

    function isControllable() external view override returns (bool) {
        return ERC1644StorageWrapper.isControllable();
    }
}
