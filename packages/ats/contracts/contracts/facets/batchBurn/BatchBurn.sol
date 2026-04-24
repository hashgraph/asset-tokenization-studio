// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _AGENT_ROLE } from "../../constants/roles.sol";
import { IBatchBurn } from "./IBatchBurn.sol";
import { IERC1644 } from "../layer_1/ERC1400/ERC1644/IERC1644.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title BatchBurn
 * @notice Abstract implementation of `IBatchBurn` that burns tokens from multiple addresses
 *         in a single, atomic transaction.
 * @dev Caller must hold `_CONTROLLER_ROLE` or `_AGENT_ROLE`. The token must be unpaused and
 *      configured for a single partition. Delegates burn execution to `TokenCoreOps` and
 *      emits `IERC1644.ControllerRedemption` for each address processed.
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
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        uint256 length = _userAddresses.length;
        for (uint256 i; i < length; ) {
            TokenCoreOps.burn(_userAddresses[i], _amounts[i]);
            emit IERC1644.ControllerRedemption(EvmAccessors.getMsgSender(), _userAddresses[i], _amounts[i], "", "");
            unchecked {
                ++i;
            }
        }
    }
}
