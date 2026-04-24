// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldFacet } from "./IHoldFacet.sol";
import { Hold } from "./Hold.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _HOLD_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title HoldFacet
 * @notice Diamond facet exposing high-level hold read accessors.
 * @dev Registers two selectors: getHeldAmountFor and getHoldThirdParty. Inherits business logic
 *      from the Hold abstract contract.
 */
contract HoldFacet is Hold, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getHoldThirdParty.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getHeldAmountFor.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IHoldFacet).interfaceId;
    }
}
