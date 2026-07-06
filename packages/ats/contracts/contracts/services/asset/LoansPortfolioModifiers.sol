// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio } from "../../facets/loansPortfolio/ILoansPortfolio.sol";
import { LoansPortfolioStorageWrapper } from "../../domain/asset/LoansPortfolioStorageWrapper.sol";

/**
 * @title  LoansPortfolioModifiers
 * @author Asset Tokenization Studio Team
 * @notice Reusable modifiers guarding loans-portfolio holdings operations.
 * @dev    Centralises the supported `HoldingsAssetType` check and the holdings-set membership
 *         guards so every writer enforces the same invariants before mutating portfolio storage.
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
     * @notice Reverts when the given asset is already registered in the portfolio.
     * @dev Delegates to `LoansPortfolioStorageWrapper.checkHoldingAssetNotExists`; guards
     *      `addHoldingsAsset` against duplicate registrations.
     * @param _assetAddress Address of the holdings asset to check.
     * @custom:error HoldingsAssetAlreadyExists If the asset address already exists in the portfolio.
     */
    modifier onlyNotExistingHoldingsAsset(address _assetAddress) {
        LoansPortfolioStorageWrapper.checkHoldingAssetNotExists(_assetAddress);
        _;
    }

    /**
     * @notice Reverts when the given asset is not registered in the portfolio.
     * @dev Delegates to `LoansPortfolioStorageWrapper.checkHoldingAssetExists`; guards
     *      `removeHoldingsAsset` against operating on an absent asset.
     * @param _assetAddress Address of the holdings asset to check.
     * @custom:error HoldingAssetNotFound If the asset address is not in the portfolio.
     */
    modifier onlyExistingHoldingsAsset(address _assetAddress) {
        LoansPortfolioStorageWrapper.checkHoldingAssetExists(_assetAddress);
        _;
    }
}
