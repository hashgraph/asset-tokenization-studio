// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio } from "../../facets/layer_2/loansPortfolio/ILoansPortfolio.sol";
import { ILoansPortfolioStorageWrapper } from "../../domain/asset/loansPortfolio/ILoansPortfolioStorageWrapper.sol";

abstract contract LoansPortfolioModifiers {
    modifier onlySupportedHoldingsAssetType(ILoansPortfolio.HoldingsAsset memory _holdingsAsset) {
        if (
            _holdingsAsset.holdingsAssetType != ILoansPortfolio.HoldingsAssetType.LOAN &&
            _holdingsAsset.holdingsAssetType != ILoansPortfolio.HoldingsAssetType.CASH
        ) {
            revert ILoansPortfolioStorageWrapper.HoldingsAssetTypeNotSupported(uint8(_holdingsAsset.holdingsAssetType));
        }
        _;
    }
}
