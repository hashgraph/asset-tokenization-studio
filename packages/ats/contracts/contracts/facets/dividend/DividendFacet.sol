// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Dividend } from "./Dividend.sol";
import { IDividend } from "./IDividend.sol";
import { _DIVIDEND_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeDividend.selector,
                this.setDividend.selector,
                this.cancelDividend.selector,
                this.getDividend.selector,
                this.getDividendFor.selector,
                this.getDividendAmountFor.selector,
                this.getDividendsCount.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IDividend).interfaceId);
    }
}
