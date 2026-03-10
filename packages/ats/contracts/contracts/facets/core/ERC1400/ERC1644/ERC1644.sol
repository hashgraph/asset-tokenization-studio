// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644 } from "../../ERC1400/ERC1644/IERC1644.sol";
import { IERC1644Base } from "../../ERC1400/ERC1644/IERC1644Base.sol";
import { IControlListBase } from "../../controlList/IControlListBase.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../../domain/asset/ERC1644StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";
import { _DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1644 is IERC1644, IControlListBase, TimestampProvider {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(bool _controllable) external override {
        if (ERC1644StorageWrapper.isInitialized()) revert AlreadyInitialized();
        ERC1644StorageWrapper.initialize(_controllable);
    }

    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ERC1644StorageWrapper.checkControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.transfer(_from, _to, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1644Base.ControllerTransfer(msg.sender, _from, _to, _value, _data, _operatorData);
    }

    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ERC1644StorageWrapper.checkControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.burn(_tokenHolder, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1644Base.ControllerRedemption(msg.sender, _tokenHolder, _value, _data, _operatorData);
    }

    function finalizeControllable() external override {
        AccessStorageWrapper.checkRole(_DEFAULT_ADMIN_ROLE, msg.sender);
        ERC1644StorageWrapper.checkControllable();
        ERC1644StorageWrapper.finalizeControllable();
    }

    function isControllable() external view override returns (bool) {
        return ERC1644StorageWrapper.isControllable();
    }
}
