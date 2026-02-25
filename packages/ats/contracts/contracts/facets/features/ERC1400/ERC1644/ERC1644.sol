// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644 } from "../../interfaces/ERC1400/IERC1644.sol";
import { IERC1644Base } from "../../interfaces/ERC1400/IERC1644Base.sol";
import { IControlListBase } from "../../interfaces/controlList/IControlListBase.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibERC1644 } from "../../../../lib/domain/LibERC1644.sol";
import { LibTokenTransfer } from "../../../../lib/orchestrator/LibTokenTransfer.sol";
import { TimestampProvider } from "../../../../infrastructure/lib/TimestampProvider.sol";
import { _DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1644 is IERC1644, IControlListBase, TimestampProvider {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(bool _controllable) external override {
        if (LibERC1644.isInitialized()) revert AlreadyInitialized();
        LibERC1644.initialize(_controllable);
    }

    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override {
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        LibERC1644.checkControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        LibTokenTransfer.transfer(_from, _to, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1644Base.ControllerTransfer(msg.sender, _from, _to, _value, _data, _operatorData);
    }

    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override {
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        LibERC1644.checkControllable();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        LibTokenTransfer.burn(_tokenHolder, _value, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1644Base.ControllerRedemption(msg.sender, _tokenHolder, _value, _data, _operatorData);
    }

    function finalizeControllable() external override {
        LibAccess.checkRole(_DEFAULT_ADMIN_ROLE, msg.sender);
        LibERC1644.checkControllable();
        LibERC1644.finalizeControllable();
    }

    function isControllable() external view override returns (bool) {
        return LibERC1644.isControllable();
    }
}
