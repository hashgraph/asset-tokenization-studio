// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldFacet } from "./IHoldFacet.sol";
import { Hold } from "./Hold.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.getHeldAmountFor.selector, this.getHoldThirdParty.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IHoldFacet).interfaceId);
    }
}
