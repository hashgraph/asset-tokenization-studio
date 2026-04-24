// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _AGENT_ROLE } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IBurn } from "./IBurn.sol";
import { IController } from "../controller/IController.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ProtectedPartitionRoleValidator } from "../../infrastructure/utils/ProtectedPartitionRoleValidator.sol";

abstract contract Burn is IBurn, Modifiers, ProtectedPartitionRoleValidator {
    /// @inheritdoc IBurn
    function burn(
        address _userAddress,
        uint256 _amount
    ) external override onlyUnpaused onlyWithoutMultiPartition onlyControllable {
        address sender = EvmAccessors.getMsgSender();
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, sender);
        }
        TokenCoreOps.burn(_userAddress, _amount);
        emit IController.ControllerRedemption(sender, _userAddress, _amount, "", "");
    }

    /// @inheritdoc IBurn
    function redeem(
        uint256 _value,
        bytes memory _data
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(msg.sender, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.redeem(_value, _data);
    }

    /// @inheritdoc IBurn
    function redeemFrom(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data
    )
        external
        override
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(_tokenHolder, _DEFAULT_PARTITION, _value)
    {
        TokenCoreOps.redeemFrom(_tokenHolder, _value, _data);
    }
}
