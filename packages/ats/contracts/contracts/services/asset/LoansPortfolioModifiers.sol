// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio } from "../../facets/loansPortfolio/ILoansPortfolio.sol";

/**
 * @title  LoansPortfolioModifiers
 * @author Asset Tokenization Studio Team
 * @notice Reusable modifiers guarding loans-portfolio holdings operations.
 * @dev    Centralises the supported `HoldingsAssetType` check so every writer enforces the
 *         same allow-list (`LOAN`, `CASH`) before mutating portfolio storage.
 */
abstract contract LoansPortfolioModifiers {
    /**
     * @notice Reverts when the holdings asset is not one of the supported categories.
     * @dev Accepts only `LOAN` and `CASH`; raises `HoldingsAssetTypeNotSupported` with the
     *      offending enum value cast to `uint8` for any other variant.
     * @param _holdingsAsset The holdings asset whose `holdingsAssetType` is validated.
     */
    modifier onlySupportedHoldingsAssetType(ILoansPortfolio.HoldingsAsset memory _holdingsAsset) {
        if (
            _holdingsAsset.holdingsAssetType != ILoansPortfolio.HoldingsAssetType.LOAN &&
            _holdingsAsset.holdingsAssetType != ILoansPortfolio.HoldingsAssetType.CASH
        ) {
            revert ILoansPortfolio.HoldingsAssetTypeNotSupported(uint8(_holdingsAsset.holdingsAssetType));
        }
        _;
    }
}
