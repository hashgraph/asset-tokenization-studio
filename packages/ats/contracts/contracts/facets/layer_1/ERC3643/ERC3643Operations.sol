// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _AGENT_ROLE } from "../../../constants/roles.sol";
import { IERC3643Operations } from "./IERC3643Operations.sol";
import { IERC1644 } from "../ERC1400/ERC1644/IERC1644.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ERC3643Operations
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the ERC-3643 controller operations (burn and forced
 *         transfer).
 * @dev Both entry points share the same access-control matrix (controller or agent) and emit the
 *      corresponding ERC-1644 events. Enforces unpaused, single-partition and controllable
 *      invariants via modifiers.
 */
abstract contract ERC3643Operations is IERC3643Operations, Modifiers {
    /// @inheritdoc IERC3643Operations
    function burn(
        address _userAddress,
        uint256 _amount
    ) external onlyUnpaused onlyWithoutMultiPartition onlyControllable {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        TokenCoreOps.burn(_userAddress, _amount);
        emit IERC1644.ControllerRedemption(EvmAccessors.getMsgSender(), _userAddress, _amount, "", "");
    }

    /// @inheritdoc IERC3643Operations
    function forcedTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external onlyUnpaused onlyWithoutMultiPartition onlyControllable returns (bool success_) {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        TokenCoreOps.transfer(_from, _to, _amount);
        emit IERC1644.ControllerTransfer(EvmAccessors.getMsgSender(), _from, _to, _amount, "", "");
        success_ = true;
    }
}
