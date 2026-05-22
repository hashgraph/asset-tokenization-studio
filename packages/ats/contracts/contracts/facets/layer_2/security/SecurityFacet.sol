// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurity, RESOLVER_KEY_SECURITY } from "./ISecurity.sol";
import { Security } from "./Security.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";

import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title SecurityFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the security regulation capability (`ISecurity`) on a token.
 * @dev Implements `IStaticFunctionSelectors` so the BusinessLogicResolver can register the facet's
 *      selectors against the deterministic `RESOLVER_KEY_SECURITY` declared in `ISecurity.sol`.
 */
contract SecurityFacet is Security, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_SECURITY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = Bytes4Builder.build(
            this.initializeSecurity.selector,
            this.getSecurityRegulationData.selector
        );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = Bytes4Builder.build(type(ISecurity).interfaceId);
    }
}
