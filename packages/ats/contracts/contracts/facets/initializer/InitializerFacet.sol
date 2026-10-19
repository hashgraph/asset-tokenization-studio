// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IInitializer, RESOLVER_KEY_INITIALIZER } from "./IInitializer.sol";
import { Initializer } from "./Initializer.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title InitializerFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that manages the per-facet initialisation registry and the
 *         operational status of the token, registered under `RESOLVER_KEY_INITIALIZER`.
 */
contract InitializerFacet is Initializer, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_INITIALIZER;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        return
            Bytes4Builder.build(
                this.initializeInitializer.selector,
                this.updateMaxInitializerFacetIndex.selector,
                this.setOperationalStatus.selector,
                this.getOperationalStatus.selector,
                this.getFacetVersionStatus.selector,
                this.getFacetLastVersion.selector,
                this.getMaxInitializerFacetIndex.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        return Bytes4Builder.build(type(IInitializer).interfaceId);
    }
}
