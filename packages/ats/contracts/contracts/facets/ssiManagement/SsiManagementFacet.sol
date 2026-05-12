// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISsiManagement } from "./ISsiManagement.sol";
import { SsiManagement } from "./SsiManagement.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
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
