// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CONTROLLER_ROLE, AGENT_ROLE, _buildRoles } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IBurn } from "./IBurn.sol";
import { IController } from "../controller/IController.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ProtectedPartitionRoleValidator } from "../../infrastructure/utils/ProtectedPartitionRoleValidator.sol";
import { ITransfer } from "../transfer/ITransfer.sol";

/**
 * @title Burn
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the ERC-1594 redemption and ERC-3643 burn surfaces.
 *         Exposes three entry points: `burn` (controller/agent-initiated), `redeem`
 *         (self-redemption by the caller) and `redeemFrom` (operator-initiated on behalf
 *         of a token holder). All operations are restricted to single-partition mode.
 */
abstract contract Burn is IBurn, Modifiers, ProtectedPartitionRoleValidator {
    /// @inheritdoc IBurn
    /// @dev Captures the operator via `EvmAccessors.getMsgSender()` instead of `msg.sender`
    ///      to support meta-transaction contexts when emitting `ControllerRedemption`.
    function burn(
        address _userAddress,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyControllable
        onlyAnyRole(_buildRoles(CONTROLLER_ROLE, AGENT_ROLE))
    {
        address sender = EvmAccessors.getMsgSender();
        TokenCoreOps.burn(_userAddress, _amount);
        emit ITransfer.Transfer(_userAddress, address(0), _amount);
        emit IController.ControllerRedemption(sender, _userAddress, _amount, "", "");
    }

    /// @inheritdoc IBurn
    function redeem(
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(msg.sender, _DEFAULT_PARTITION, _value)
    {
        address sender = EvmAccessors.getMsgSender();
        TokenCoreOps.redeem(_value);
        emit ITransfer.Transfer(sender, address(0), _value);
        emit IBurn.Redeemed(address(0), sender, _value, _data);
    }

    /// @inheritdoc IBurn
    function redeemFrom(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyUnrecoveredAddress(msg.sender)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(_tokenHolder, _DEFAULT_PARTITION, _value)
    {
        address sender = EvmAccessors.getMsgSender();
        TokenCoreOps.redeemFrom(_tokenHolder, _value);
        emit ITransfer.Transfer(_tokenHolder, address(0), _value);
        emit IBurn.Redeemed(sender, _tokenHolder, _value, _data);
    }
}
