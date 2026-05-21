// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SecurityHolders } from "./SecurityHolders.sol";
import { ISecurityHolders } from "./ISecurityHolders.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _SECURITYHOLDERS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title SecurityHoldersFacet
 * @notice Facet for security holder operations
 * @dev Registers function selectors for Diamond routing
 */
contract SecurityHoldersFacet is SecurityHolders, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SECURITYHOLDERS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeSecurityHolders.selector,
                this.getSecurityHolders.selector,
                this.getTotalSecurityHolders.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ISecurityHolders).interfaceId);
    }
}
