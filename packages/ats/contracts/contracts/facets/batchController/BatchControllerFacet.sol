// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchControllerFacet } from "./IBatchControllerFacet.sol";
import { BatchController } from "./BatchController.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _BATCH_CONTROLLER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BatchControllerFacet
 * @notice Diamond facet exposing controller-only batch transfer operations.
 * @dev Registers the `batchForcedTransfer` selector. Inherits business logic from the
 *      `BatchController` abstract contract.
 */
contract BatchControllerFacet is BatchController, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BATCH_CONTROLLER_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.batchForcedTransfer.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IBatchControllerFacet).interfaceId;
    }
}
