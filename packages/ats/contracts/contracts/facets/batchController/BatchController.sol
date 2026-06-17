// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_CONTROLLER, ROLE_AGENT, DEFAULT_ADMIN_ROLE, _buildRoles } from "../../constants/roles.sol";
import { IBatchController, RESOLVER_KEY_BATCH_CONTROLLER } from "./IBatchController.sol";
import { IControllerTypes } from "../controller/IControllerTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BatchController
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of controller-only batch transfer operations.
 * @dev Shares the access-control/role semantics of `IERC1644.controllerTransfer`: the caller must
 *      hold either the controller or the agent role, the token must be controllable and operating
 *      in single-partition mode. Emits one `ControllerTransfer` event per transferred element so
 *      downstream indexers observe the same event stream as the single-shot path.
 */
abstract contract BatchController is IBatchController, Modifiers {
    /// @inheritdoc IBatchController
    function initializeBatchController()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_BATCH_CONTROLLER)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_BATCH_CONTROLLER);
        emit IBatchController.BatchControllerInitialized();
    }

    /// @inheritdoc IBatchController
    function batchForcedTransfer(
        address[] calldata _fromList,
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyValidInputAmountsArrayLength(_fromList, _amounts)
        onlyValidInputAmountsArrayLength(_toList, _amounts)
        onlyWithoutMultiPartition
        onlyControllable
        onlyAnyRole(_buildRoles(ROLE_CONTROLLER, ROLE_AGENT))
    {
        address operator = EvmAccessors.getMsgSender();
        uint256 length = _fromList.length;
        for (uint256 i; i < length; ) {
            TokenCoreOps.transfer(_fromList[i], _toList[i], _amounts[i]);
            emit IControllerTypes.ControllerTransfer(operator, _fromList[i], _toList[i], _amounts[i], "", "");
            unchecked {
                ++i;
            }
        }
    }
}
