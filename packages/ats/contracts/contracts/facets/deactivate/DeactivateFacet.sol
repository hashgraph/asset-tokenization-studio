// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDeactivate } from "./IDeactivate.sol";
import { Deactivate } from "./Deactivate.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _DEACTIVATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title DeactivateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the irreversible deactivation operations — `deactivate`
 *         and the `isDeactivated` query — as selectable proxy functions.
 * @dev Inherits `Deactivate` for the business logic and implements `IStaticFunctionSelectors`
 *      for the Diamond resolver pattern. The resolver key `_DEACTIVATE_RESOLVER_KEY`
 *      identifies this facet within the diamond proxy.
 */
contract DeactivateFacet is Deactivate, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _DEACTIVATE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        staticFunctionSelectors_[--selectorIndex] = this.deactivate.selector;
        staticFunctionSelectors_[--selectorIndex] = this.isDeactivated.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IDeactivate).interfaceId;
    }
}
