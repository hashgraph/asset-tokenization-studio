// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CONTROLLER_ROLE, _AGENT_ROLE } from "../../constants/roles.sol";
import { IBatchControllerFacet } from "./IBatchControllerFacet.sol";
import { IERC1644 } from "../layer_1/ERC1400/ERC1644/IERC1644.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title BatchController
 * @notice Abstract implementation of controller-only batch transfer operations.
 * @dev Shares the access-control/role semantics of `IERC1644.controllerTransfer`: the caller must
 *      hold either the controller or the agent role, the token must be controllable and operating
 *      in single-partition mode. Emits one `ControllerTransfer` event per transferred element so
 *      downstream indexers observe the same event stream as the single-shot path.
 */
abstract contract BatchController is IBatchControllerFacet, Modifiers {
    /// @inheritdoc IBatchControllerFacet
    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        override
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_fromList, _amounts)
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyControllable
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        }
        for (uint256 i = 0; i < _fromList.length; i++) {
            TokenCoreOps.transfer(_fromList[i], _toList[i], _amounts[i]);
            emit IERC1644.ControllerTransfer(
                EvmAccessors.getMsgSender(),
                _fromList[i],
                _toList[i],
                _amounts[i],
                "",
                ""
            );
        }
    }
}
