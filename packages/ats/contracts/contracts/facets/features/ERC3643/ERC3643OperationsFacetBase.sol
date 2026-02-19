// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Operations } from "../interfaces/ERC3643/IERC3643Operations.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC1644StorageWrapper } from "../interfaces/ERC1400/IERC1644StorageWrapper.sol";
import { IERC1594StorageWrapper } from "../interfaces/ERC1400/IERC1594StorageWrapper.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCap } from "../../../lib/core/LibCap.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC1594 } from "../../../lib/domain/LibERC1594.sol";
import { LibERC1644 } from "../../../lib/domain/LibERC1644.sol";
import { LibTokenTransfer } from "../../../lib/orchestrator/LibTokenTransfer.sol";
import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";

abstract contract ERC3643OperationsFacetBase is IERC3643Operations, IStaticFunctionSelectors {
    function burn(address _userAddress, uint256 _amount) external override {
        LibPause.requireNotPaused();
        LibERC1644.checkControllable();
        LibERC1410.checkWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        LibTokenTransfer.burn(_userAddress, _amount, _getBlockTimestamp());
        emit IERC1644StorageWrapper.ControllerRedemption(msg.sender, _userAddress, _amount, "", "");
    }

    function mint(address _to, uint256 _amount) external override {
        LibPause.requireNotPaused();
        LibERC1410.checkWithoutMultiPartition();
        LibCap.requireWithinMaxSupply(_amount, LibERC1410.totalSupply());
        LibERC1594.checkIdentity(address(0), _to);
        LibERC1594.checkCompliance(msg.sender, address(0), _to, false);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        LibTokenTransfer.mint(_to, _amount, _getBlockTimestamp());
        emit IERC1594StorageWrapper.Issued(msg.sender, _to, _amount, "");
    }

    function forcedTransfer(address _from, address _to, uint256 _amount) external override returns (bool) {
        LibERC1410.checkWithoutMultiPartition();
        LibERC1644.checkControllable();
        LibPause.requireNotPaused();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            LibAccess.checkAnyRole(roles, msg.sender);
        }
        LibTokenTransfer.transfer(_from, _to, _amount, _getBlockTimestamp());
        emit IERC1644StorageWrapper.ControllerTransfer(msg.sender, _from, _to, _amount, "", "");
        return true;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](3);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.burn.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.mint.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forcedTransfer.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC3643Operations).interfaceId;
    }

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
