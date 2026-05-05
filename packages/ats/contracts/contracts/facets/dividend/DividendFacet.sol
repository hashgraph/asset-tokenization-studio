// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Dividend } from "./Dividend.sol";
import { IDividend } from "./IDividend.sol";
import { _DIVIDEND_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title DividendFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the dividend writer surface (`setDividend`, `cancelDividend`)
 *         alongside the per-record reads (`getDividend`, `getDividendFor`,
 *         `getDividendAmountFor`, `getDividendsCount`) under `_DIVIDEND_RESOLVER_KEY`.
 * @dev Inherits the implementation from `Dividend` and satisfies `IStaticFunctionSelectors` so
 *      the Diamond resolver can register the six selectors. Carries no initialiser — dividend
 *      state is owned by `DividendStorageWrapper` and bootstrapped through the corporate-action
 *      writer path. The read-only sibling facet `DividendSecurityHoldersFacet` registers under
 *      its own resolver key and operates on the same underlying storage.
 */
contract DividendFacet is Dividend, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _DIVIDEND_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Selectors are written in reverse via `--selectorIndex` inside an `unchecked` block;
    ///      the resulting array reads in declaration order (`setDividend`, `cancelDividend`,
    ///      `getDividend`, `getDividendFor`, `getDividendAmountFor`, `getDividendsCount`).
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 6;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getDividendsCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getDividendAmountFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getDividendFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getDividend.selector;
            staticFunctionSelectors_[--selectorIndex] = this.cancelDividend.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setDividend.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IDividend).interfaceId;
    }
}
