// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio } from "./ILoansPortfolio.sol";
import { LoansPortfolio } from "./LoansPortfolio.sol";
import { _LOANS_PORTFOLIO_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";

contract LoansPortfolioFacet is LoansPortfolio, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOANS_PORTFOLIO_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](20);
        staticFunctionSelectors_[selectorIndex++] = this.initializeLoansPortfolio.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addHoldingsAsset.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeHoldingsAsset.selector;
        staticFunctionSelectors_[selectorIndex++] = this.notifyLoanHoldingsAssetUpdate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.loansPortfolioWithdraw.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLoansPortfolioData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldingsAssets.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLoanHoldingsAssets.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldingsAssetOwnership.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNumberOfAssets.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNumberOfLoans.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNumberOfCash.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNumberOfPerformingLoans.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNumberOfNonPerformingLoans.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNumberDefaultedLoans.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecuredLoansRatio.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPerformingLoansRatio.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNonPerformingLoansRatio.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDefaultedLoansRatio.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getGeographicalExposure.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ILoansPortfolio).interfaceId;
    }
}
