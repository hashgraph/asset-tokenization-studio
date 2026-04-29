// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "./ICap.sol";
import { Cap } from "./Cap.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CAP_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CapFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes maximum supply management operations — initialisation, cap
 *         update, and cap query — as selectable proxy functions.
 * @dev Inherits `Cap` for the business logic and implements `IStaticFunctionSelectors` for the
 *      Diamond resolver pattern. The resolver key `_CAP_RESOLVER_KEY` identifies this facet
 *      within the diamond proxy.
 */
contract CapFacet is Cap, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CAP_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.initializeCap.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setMaxSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMaxSupply.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICap).interfaceId;
    }
}
