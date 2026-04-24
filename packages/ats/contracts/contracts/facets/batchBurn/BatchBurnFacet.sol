// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchBurn } from "./IBatchBurn.sol";
import { BatchBurn } from "./BatchBurn.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _BATCH_BURN_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BatchBurnFacet
 * @notice Diamond facet that exposes the batch burn capability through the `IBatchBurn`
 *         interface, registered under `_BATCH_BURN_RESOLVER_KEY`.
 * @dev Inherits burn logic from `BatchBurn` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes one selector:
 *      `batchBurn`.
 * @author Asset Tokenization Studio Team
 */
contract BatchBurnFacet is BatchBurn, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BATCH_BURN_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.batchBurn.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IBatchBurn).interfaceId;
        }
    }
}
