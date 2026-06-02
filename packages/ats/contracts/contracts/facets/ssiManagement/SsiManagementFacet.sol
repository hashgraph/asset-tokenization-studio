// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISsiManagement, RESOLVER_KEY_SSI_MANAGEMENT } from "./ISsiManagement.sol";
import { SsiManagement } from "./SsiManagement.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title SsiManagementFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes Self-Sovereign Identity (SSI) management operations —
 *         trusted issuer list and revocation registry address — as selectable proxy functions.
 * @dev Inherits `SsiManagement` for the business logic and implements `IStaticFunctionSelectors`
 *      for the Diamond resolver pattern. The resolver key `RESOLVER_KEY_SSI_MANAGEMENT`
 *      identifies this facet within the diamond proxy.
 */
contract SsiManagementFacet is SsiManagement, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_SSI_MANAGEMENT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeSsiManagement.selector,
                this.setRevocationRegistryAddress.selector,
                this.addIssuer.selector,
                this.removeIssuer.selector,
                this.isIssuer.selector,
                this.getRevocationRegistryAddress.selector,
                this.getIssuerListCount.selector,
                this.getIssuerListMembers.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ISsiManagement).interfaceId);
    }
}
