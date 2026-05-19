// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IControllerHoldByPartition,
    RESOLVER_KEY_CONTROLLER_HOLD_BY_PARTITION
} from "./IControllerHoldByPartition.sol";
import { ControllerHoldByPartition } from "./ControllerHoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title Controller Hold by Partition Facet
 * @notice Provides the diamond facet interface for partition-based hold control operations
 *         within the controller system.
 * @dev This contract implements the static function selector and interface identification logic required for
 *      diamond proxy integration.
 *      It ensures correct registration of the controller's entrypoint function and interface identifier with
 *      the associated resolver key.
 * @author Asset Tokenization Studio Team
 */
contract ControllerHoldByPartitionFacet is ControllerHoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CONTROLLER_HOLD_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.controllerCreateHoldByPartition.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IControllerHoldByPartition).interfaceId);
    }
}
