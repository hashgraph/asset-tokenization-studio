// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644 } from "../../interfaces/ERC1400/IERC1644.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC1644StorageWrapper } from "../../interfaces/ERC1400/IERC1644StorageWrapper.sol";
import { IControlListStorageWrapper } from "../../interfaces/controlList/IControlListStorageWrapper.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibERC1644 } from "../../../../lib/domain/LibERC1644.sol";
import { LibTokenTransfer } from "../../../../lib/orchestrator/LibTokenTransfer.sol";
import { _DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1644FacetBase is
    IERC1644,
    IStaticFunctionSelectors,
    IERC1644StorageWrapper,
    IControlListStorageWrapper
{
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
        LibTokenTransfer.transfer(_from, _to, _value, _getBlockTimestamp());
        emit IERC1644StorageWrapper.ControllerTransfer(msg.sender, _from, _to, _value, _data, _operatorData);
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
        LibTokenTransfer.burn(_tokenHolder, _value, _getBlockTimestamp());
        emit IERC1644StorageWrapper.ControllerRedemption(msg.sender, _tokenHolder, _value, _data, _operatorData);
    }

    function finalizeControllable() external override {
        LibAccess.checkRole(_DEFAULT_ADMIN_ROLE, msg.sender);
        LibERC1644.checkControllable();
        LibERC1644.finalizeControllable();
    }

    function isControllable() external view override returns (bool) {
        return LibERC1644.isControllable();
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](5);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initialize_ERC1644.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.isControllable.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.controllerTransfer.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.controllerRedeem.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.finalizeControllable.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1644).interfaceId;
    }

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
