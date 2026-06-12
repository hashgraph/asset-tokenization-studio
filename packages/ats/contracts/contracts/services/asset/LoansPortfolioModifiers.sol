// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio } from "../../facets/loansPortfolio/ILoansPortfolio.sol";
import { LoansPortfolioStorageWrapper } from "../../domain/asset/LoansPortfolioStorageWrapper.sol";

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

    /**
     * @notice Reverts when `_holdingsAssetAddress` is not registered in the portfolio.
     * @dev Delegates to `LoansPortfolioStorageWrapper._checkAlreadyExistingHoldingsAsset`.
     *      Apply on writers that require the asset to be present before mutating it
     *      (e.g. remove, update). Reverts with `HoldingAssetNotFound`.
     * @param _holdingsAssetAddress The holdings asset address whose presence is required.
     */
    modifier onlyAlreadyExistingHoldingsAsset(address _holdingsAssetAddress) {
        LoansPortfolioStorageWrapper._checkAlreadyExistingHoldingsAsset(_holdingsAssetAddress);
        _;
    }

    /**
     * @notice Reverts when `_holdingsAssetAddress` is already registered in the portfolio.
     * @dev Delegates to `LoansPortfolioStorageWrapper._checkNotExistingHoldingsAsset`.
     *      Apply on writers that must not register the same asset twice (e.g. add).
     *      Reverts with `HoldingsAssetAlreadyExists`.
     * @param _holdingsAssetAddress The holdings asset address that must not yet exist.
     */
    modifier onlyNotExistingHoldingsAsset(address _holdingsAssetAddress) {
        LoansPortfolioStorageWrapper._checkNotExistingHoldingsAsset(_holdingsAssetAddress);
        _;
    }
}
