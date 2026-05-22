// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDeactivate, RESOLVER_KEY_DEACTIVATE } from "./IDeactivate.sol";
import { Deactivate } from "./Deactivate.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title DeactivateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the irreversible deactivation operations — `deactivate`
 *         and the `isDeactivated` query — as selectable proxy functions.
 * @dev Inherits `Deactivate` for the business logic and implements `IStaticFunctionSelectors`
 *      for the Diamond resolver pattern. The resolver key `RESOLVER_KEY_DEACTIVATE`
 *      identifies this facet within the diamond proxy.
 */
contract DeactivateFacet is Deactivate, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_DEACTIVATE;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.isDeactivated.selector, this.deactivate.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IDeactivate).interfaceId);
    }
}
