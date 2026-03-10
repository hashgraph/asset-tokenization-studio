// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Operations } from "../ERC3643/IERC3643Operations.sol";
import { IERC1644Base } from "../ERC1400/ERC1644/IERC1644Base.sol";
import { IERC1594 } from "../ERC1400/ERC1594/IERC1594.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../domain/asset/ERC1644StorageWrapper.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";

abstract contract ERC3643Operations is IERC3643Operations, TimestampProvider {
    function burn(address _userAddress, uint256 _amount) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1644StorageWrapper.checkControllable();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.burn(_userAddress, _amount, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1644Base.ControllerRedemption(msg.sender, _userAddress, _amount, "", "");
    }

    function mint(address _to, uint256 _amount) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        CapStorageWrapper.requireWithinMaxSupply(_amount, ERC1410StorageWrapper.totalSupply());
        ERC1594StorageWrapper.checkIdentity(address(0), _to);
        ERC1594StorageWrapper.checkCompliance(msg.sender, address(0), _to, false);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.mint(_to, _amount, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1594.Issued(msg.sender, _to, _amount, "");
    }

    function forcedTransfer(address _from, address _to, uint256 _amount) external override returns (bool) {
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        ERC1644StorageWrapper.checkControllable();
        PauseStorageWrapper.requireNotPaused();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.transfer(_from, _to, _amount, _getBlockTimestamp(), _getBlockNumber());
        emit IERC1644Base.ControllerTransfer(msg.sender, _from, _to, _amount, "", "");
        return true;
    }
}
