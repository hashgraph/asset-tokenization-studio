// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISsiManagement } from "./ISsiManagement.sol";
import { SsiManagement } from "./SsiManagement.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _SSI_MANAGEMENT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title SsiManagementFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes Self-Sovereign Identity (SSI) management operations —
 *         trusted issuer list and revocation registry address — as selectable proxy functions.
 * @dev Inherits `SsiManagement` for the business logic and implements `IStaticFunctionSelectors`
 *      for the Diamond resolver pattern. The resolver key `_SSI_MANAGEMENT_RESOLVER_KEY`
 *      identifies this facet within the diamond proxy.
 */
contract SsiManagementFacet is SsiManagement, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SSI_MANAGEMENT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.setRevocationRegistryAddress.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addIssuer.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeIssuer.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isIssuer.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRevocationRegistryAddress.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getIssuerListCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getIssuerListMembers.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ISsiManagement).interfaceId;
    }
}
