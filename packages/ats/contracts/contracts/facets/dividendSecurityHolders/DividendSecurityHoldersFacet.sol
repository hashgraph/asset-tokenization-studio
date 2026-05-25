// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DividendSecurityHolders } from "./DividendSecurityHolders.sol";
import { IDividendSecurityHolders, RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS } from "./IDividendSecurityHolders.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title DividendSecurityHoldersFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the read-only dividend holder queries (`getDividendHolders`,
 *         `getTotalDividendHolders`) under `RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS`.
 * @dev Inherits the implementation from `DividendSecurityHolders` and satisfies
 *      `IStaticFunctionSelectors` so the Diamond resolver can register the two selectors.
 *      Carries no initializer — the facet has no storage of its own; dividend state is
 *      maintained by `DividendStorageWrapper` and bootstrapped through the writer facet.
 */
contract DividendSecurityHoldersFacet is DividendSecurityHolders, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.getDividendHolders.selector, this.getTotalDividendHolders.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IDividendSecurityHolders).interfaceId);
    }
}
