// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DIVIDEND_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { IDividend } from "./IDividend.sol";
import { Dividend } from "./Dividend.sol";

contract DividendFacet is Dividend, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _DIVIDEND_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.setDividend.selector;
        staticFunctionSelectors_[selectorIndex++] = this.cancelDividend.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividend.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividendFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividendAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividendsCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividendHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalDividendHolders.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IDividend).interfaceId;
    }
}
