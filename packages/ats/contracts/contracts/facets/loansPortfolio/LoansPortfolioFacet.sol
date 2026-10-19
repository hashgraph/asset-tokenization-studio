// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio, RESOLVER_KEY_LOANS_PORTFOLIO } from "./ILoansPortfolio.sol";
import { LoansPortfolio } from "./LoansPortfolio.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title  LoansPortfolioFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes loans-portfolio management to the proxy.
 * @dev    Selectors exposed:
 *         - `initializeLoansPortfolio`
 *         - `addHoldingsAsset`
 *         - `removeHoldingsAsset`
 *         - `notifyLoanHoldingsAssetUpdate`
 *         - `loansPortfolioWithdraw`
 *         - `getLoansPortfolioData`
 *         - `getHoldingsAssets`
 *         - `getLoanHoldingsAssets`
 *         - `getHoldingsAssetOwnership`
 *         - `getNumberOfAssets`
 *         - `getNumberOfLoans`
 *         - `getNumberOfCash`
 *         - `getNumberOfPerformingLoans`
 *         - `getNumberOfNonPerformingLoans`
 *         - `getNumberDefaultedLoans`
 *         - `getSecuredLoansRatio`
 *         - `getPerformingLoansRatio`
 *         - `getNonPerformingLoansRatio`
 *         - `getDefaultedLoansRatio`
 *         - `getGeographicalExposure`
 */
contract LoansPortfolioFacet is LoansPortfolio, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_LOANS_PORTFOLIO;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](19);
        staticFunctionSelectors_[0] = this.initializeLoansPortfolio.selector;
        staticFunctionSelectors_[1] = this.addHoldingsAsset.selector;
        staticFunctionSelectors_[2] = this.removeHoldingsAsset.selector;
        staticFunctionSelectors_[3] = this.notifyLoanHoldingsAssetUpdate.selector;
        staticFunctionSelectors_[4] = this.loansPortfolioWithdraw.selector;
        staticFunctionSelectors_[5] = this.getLoansPortfolioData.selector;
        staticFunctionSelectors_[6] = this.getHoldingsAssets.selector;
        staticFunctionSelectors_[7] = this.getLoanHoldingsAssets.selector;
        staticFunctionSelectors_[8] = this.getHoldingsAssetOwnership.selector;
        staticFunctionSelectors_[9] = this.getNumberOfAssets.selector;
        staticFunctionSelectors_[10] = this.getNumberOfLoans.selector;
        staticFunctionSelectors_[11] = this.getNumberOfCash.selector;
        staticFunctionSelectors_[12] = this.getNumberOfPerformingLoans.selector;
        staticFunctionSelectors_[13] = this.getNumberOfNonPerformingLoans.selector;
        staticFunctionSelectors_[14] = this.getNumberDefaultedLoans.selector;
        staticFunctionSelectors_[15] = this.getSecuredLoansRatio.selector;
        staticFunctionSelectors_[16] = this.getPerformingLoansRatio.selector;
        staticFunctionSelectors_[17] = this.getNonPerformingLoansRatio.selector;
        staticFunctionSelectors_[18] = this.getDefaultedLoansRatio.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ILoansPortfolio).interfaceId;
    }
}
