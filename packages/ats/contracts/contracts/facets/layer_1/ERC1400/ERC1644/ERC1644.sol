// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644 } from "./IERC1644.sol";
import { IERC1644StorageWrapper } from "../../../../domain/asset/ERC1400/ERC1644/IERC1644StorageWrapper.sol";
import { _DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../../domain/asset/ERC1644StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";

abstract contract ERC1644 is IERC1644 {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(bool _controllable) external override {
        if (ERC1644StorageWrapper._isERC1644Initialized()) revert AlreadyInitialized();
        ERC1644StorageWrapper._initialize_ERC1644(_controllable);
    }

    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override {
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        ERC1644StorageWrapper._requireControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper._checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.transfer(_from, _to, _value);
        emit IERC1644StorageWrapper.ControllerTransfer(msg.sender, _from, _to, _value, _data, _operatorData);
    }

    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override {
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        ERC1644StorageWrapper._requireControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper._checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.burn(_tokenHolder, _value);
        emit IERC1644StorageWrapper.ControllerRedemption(msg.sender, _tokenHolder, _value, _data, _operatorData);
    }

    function finalizeControllable() external override {
        AccessControlStorageWrapper._checkRole(_DEFAULT_ADMIN_ROLE, msg.sender);
        ERC1644StorageWrapper._requireControllable();
        ERC1644StorageWrapper._finalizeControllable();
    }

    function isControllable() external view override returns (bool) {
        return ERC1644StorageWrapper._isControllable();
    }
}
