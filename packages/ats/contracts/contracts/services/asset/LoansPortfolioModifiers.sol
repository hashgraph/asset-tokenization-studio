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
     * @dev Delegates the membership check to
     *      `LoansPortfolioStorageWrapper._checkHoldingAssetAlreadyExists`. Use on any
     *      writer that requires the asset to be present before mutating it (e.g. remove,
     *      update). Raises `HoldingAssetNotFound` with the offending address.
     * @param _holdingsAssetAddress The holdings asset address whose presence is required.
     */
    modifier onlyAlreadyExistingHoldingsAsset(address _holdingsAssetAddress) {
        if (!LoansPortfolioStorageWrapper._checkHoldingAssetAlreadyExists(_holdingsAssetAddress)) {
            revert ILoansPortfolio.HoldingAssetNotFound(_holdingsAssetAddress);
        }
        _;
    }

    /**
     * @notice Reverts when `_holdingsAssetAddress` is already registered in the portfolio.
     * @dev Delegates the membership check to
     *      `LoansPortfolioStorageWrapper._checkHoldingAssetAlreadyExists`. Use on any
     *      writer that must not register the same asset twice (e.g. add). Raises
     *      `HoldingsAssetAlreadyExists` with the offending address.
     * @param _holdingsAssetAddress The holdings asset address that must not yet exist.
     */
    modifier onlyNotExistingHoldingsAsset(address _holdingsAssetAddress) {
        if (LoansPortfolioStorageWrapper._checkHoldingAssetAlreadyExists(_holdingsAssetAddress)) {
            revert ILoansPortfolio.HoldingsAssetAlreadyExists(_holdingsAssetAddress);
        }
        _;
    }

    /**
     * @notice Reverts when `_country` is not a well-formed ISO 3166-1 alpha-2 code.
     * @dev Delegates the format check to `LoansPortfolioStorageWrapper.checkCountryCode`, which
     *      requires exactly two uppercase ASCII letters followed by two null bytes. The zero value
     *      (`bytes4(0)`) is also rejected. Raises `WrongCountryCode` with the offending value.
     * @param _countryCode The country code to validate before the body executes.
     */
    modifier onlyValidCountryCode(bytes4 _countryCode) {
        LoansPortfolioStorageWrapper.checkCountryCode(_countryCode);
        _;
    }
}
