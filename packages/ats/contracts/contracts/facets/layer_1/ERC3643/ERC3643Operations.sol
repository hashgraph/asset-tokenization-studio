// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _ISSUER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";
import { IERC3643Operations } from "./IERC3643Operations.sol";
import { IERC1644StorageWrapper } from "../../../domain/asset/ERC1400/ERC1644/IERC1644StorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { CapStorageWrapper } from "../../../domain/core/CapStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC1644StorageWrapper } from "../../../domain/asset/ERC1644StorageWrapper.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC3643Operations is IERC3643Operations, TimestampProvider, Modifiers {
    function burn(
        address _userAddress,
        uint256 _amount
    ) external onlyUnpaused onlyWithoutMultiPartition onlyControllable {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.burn(_userAddress, _amount);
        emit IERC1644StorageWrapper.ControllerRedemption(msg.sender, _userAddress, _amount, "", "");
    }

    function mint(address _to, uint256 _amount) external onlyUnpaused onlyWithoutMultiPartition {
        CapStorageWrapper.requireWithinMaxSupply(_amount, _getBlockTimestamp());
        ERC1594StorageWrapper.requireIdentified(address(0), _to);
        ERC1594StorageWrapper.requireCompliant(address(0), _to, false);
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        ERC1594StorageWrapper.issue(_to, _amount, "");
    }

    function forcedTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external onlyUnpaused onlyWithoutMultiPartition onlyControllable returns (bool) {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
        }
        TokenCoreOps.transfer(_from, _to, _amount);
        emit IERC1644StorageWrapper.ControllerTransfer(msg.sender, _from, _to, _amount, "", "");
        return true;
    }
}
