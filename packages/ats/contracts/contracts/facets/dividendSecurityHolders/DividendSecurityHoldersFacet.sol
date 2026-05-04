// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DividendSecurityHolders } from "./DividendSecurityHolders.sol";
import { IDividendSecurityHolders } from "./IDividendSecurityHolders.sol";
import { _DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title DividendSecurityHoldersFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the read-only dividend holder queries (`getDividendHolders`,
 *         `getTotalDividendHolders`) under `_DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY`.
 * @dev Inherits the implementation from `DividendSecurityHolders` and satisfies
 *      `IStaticFunctionSelectors` so the Diamond resolver can register the two selectors.
 *      Carries no initializer — the facet has no storage of its own; dividend state is
 *      maintained by `DividendStorageWrapper` and bootstrapped through the writer facet.
 */
contract DividendSecurityHoldersFacet is DividendSecurityHolders, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Selectors are written in reverse via `--selectorIndex` inside an `unchecked` block;
    ///      the resulting array reads in declaration order (`getDividendHolders` first, then
    ///      `getTotalDividendHolders`).
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalDividendHolders.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getDividendHolders.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IDividendSecurityHolders).interfaceId;
    }
}
