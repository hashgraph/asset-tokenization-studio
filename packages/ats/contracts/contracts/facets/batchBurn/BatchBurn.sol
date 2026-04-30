// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CONTROLLER_ROLE, AGENT_ROLE, _buildRoles } from "../../constants/roles.sol";
import { IBatchBurn } from "./IBatchBurn.sol";
import { IController } from "../controller/IController.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title BatchBurn
 * @notice Abstract implementation of `IBatchBurn` that burns tokens from multiple addresses
 *         in a single, atomic transaction.
 * @dev Caller must hold `CONTROLLER_ROLE` or `AGENT_ROLE`. The token must be unpaused and
 *      configured for a single partition. Delegates burn execution to `TokenCoreOps` and
 *      emits `IController.ControllerRedemption` for each address processed.
 *      Intended to be inherited by `BatchBurnFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract BatchBurn is IBatchBurn, Modifiers {
    /// @inheritdoc IBatchBurn
    function batchBurn(
        address[] calldata _userAddresses,
        uint256[] calldata _amounts
    )
        external
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_userAddresses, _amounts)
        onlyWithoutMultiPartition
        onlyControllable
        onlyAnyRole(_buildRoles(CONTROLLER_ROLE, AGENT_ROLE))
    {
        uint256 length = _userAddresses.length;
        address sender = EvmAccessors.getMsgSender();
        for (uint256 i; i < length; ) {
            TokenCoreOps.burn(_userAddresses[i], _amounts[i]);
            emit IController.ControllerRedemption(sender, _userAddresses[i], _amounts[i], "", "");
            unchecked {
                ++i;
            }
        }
    }
}
