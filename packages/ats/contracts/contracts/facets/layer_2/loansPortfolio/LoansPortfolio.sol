// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio, RESOLVER_KEY_LOANS_PORTFOLIO } from "./ILoansPortfolio.sol";
import { ROLE_LOANS_PORTFOLIO_MANAGER, DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { LoansPortfolioStorageWrapper } from "../../../domain/asset/LoansPortfolioStorageWrapper.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/// @title LoansPortfolio
/// @author Asset Tokenization Studio Team
/// @notice Abstract facet implementing the loans-portfolio lifecycle: initialisation,
///         holdings registration, notifications and withdrawals.
/// @dev Delegates persistence to `LoansPortfolioStorageWrapper` and security regulation
///      to `SecurityStorageWrapper`; writers are gated by `ROLE_LOANS_PORTFOLIO_MANAGER`
///      plus the global activation, pause, and zero-address invariants.
abstract contract LoansPortfolio is ILoansPortfolio, Modifiers {
    /// @inheritdoc ILoansPortfolio
    /// @dev Initialises both the portfolio configuration and the security regulation
    ///      payload in a single atomic call; guarded by `onlyUninitialized` against the
    ///      portfolio's initialisation flag so repeat invocations revert.
    function initializeLoansPortfolio(
        ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_LOANS_PORTFOLIO) {
        LoansPortfolioStorageWrapper.initializeLoansPortfolio(_loansPortfolioData);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_LOANS_PORTFOLIO);
        emit ILoansPortfolio.LoansPortfolioInitialized(_loansPortfolioData);
    }

    /// @inheritdoc ILoansPortfolio
    function addHoldingsAsset(
        ILoansPortfolio.HoldingsAsset memory _holdingsAsset
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOANS_PORTFOLIO_MANAGER)
        notZeroAddress(_holdingsAsset.assetAddress)
        onlySupportedHoldingsAssetType(_holdingsAsset)
        returns (bool success_)
    {
        LoansPortfolioStorageWrapper.addHoldingsAsset(_holdingsAsset);
        success_ = true;
    }

    /// @inheritdoc ILoansPortfolio
    function removeHoldingsAsset(
        ILoansPortfolio.HoldingsAsset memory _holdingsAsset
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOANS_PORTFOLIO_MANAGER)
        notZeroAddress(_holdingsAsset.assetAddress)
        onlySupportedHoldingsAssetType(_holdingsAsset)
        returns (bool success_)
    {
        LoansPortfolioStorageWrapper.removeHoldingsAsset(_holdingsAsset);
        success_ = true;
    }

    /// @inheritdoc ILoansPortfolio
    function notifyLoanHoldingsAssetUpdate(
        address _holdingsAssetAddress
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOANS_PORTFOLIO_MANAGER)
        notZeroAddress(_holdingsAssetAddress)
        returns (bool success_)
    {
        LoansPortfolioStorageWrapper.notifyLoanHoldingsAssetUpdate(_holdingsAssetAddress);
        success_ = true;
    }

    /// @inheritdoc ILoansPortfolio
    function loansPortfolioWithdraw(
        address _assetAddress,
        address _to,
        uint256 _amount
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOANS_PORTFOLIO_MANAGER)
        notZeroAddress(_assetAddress)
        notZeroAddress(_to)
        returns (bool success_)
    {
        success_ = LoansPortfolioStorageWrapper.loansPortfolioWithdraw(_assetAddress, _to, _amount);
    }

    /// @inheritdoc ILoansPortfolio
    function getLoansPortfolioData()
        external
        view
        override
        returns (ILoansPortfolio.LoansPortfolioDetailsData memory loansPortfolioData_)
    {
        loansPortfolioData_ = LoansPortfolioStorageWrapper.getLoansPortfolioDetails();
    }

    /// @inheritdoc ILoansPortfolio
    function getHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_) {
        assets_ = LoansPortfolioStorageWrapper.getHoldingsAssets(_pageIndex, _pageLength);
    }

    /// @inheritdoc ILoansPortfolio
    function getLoanHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_) {
        assets_ = LoansPortfolioStorageWrapper.getLoanHoldingsAssetsPaginated(_pageIndex, _pageLength);
    }

    /// @inheritdoc ILoansPortfolio
    function getHoldingsAssetOwnership(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_, uint256[] memory balances_) {
        (assets_, balances_) = LoansPortfolioStorageWrapper.getHoldingsAssetBalances(_pageIndex, _pageLength);
    }

    /// @inheritdoc ILoansPortfolio
    function getNumberOfAssets() external view override returns (uint256 numberOfAssets_) {
        numberOfAssets_ = LoansPortfolioStorageWrapper.getNumberOfAssets();
    }

    /// @inheritdoc ILoansPortfolio
    function getNumberOfLoans() external view override returns (uint256 numberOfLoans_) {
        numberOfLoans_ = LoansPortfolioStorageWrapper.getNumberOfLoans();
    }

    /// @inheritdoc ILoansPortfolio
    function getNumberOfCash() external view override returns (uint256 numberOfCash_) {
        numberOfCash_ = LoansPortfolioStorageWrapper.getNumberOfCash();
    }

    /// @inheritdoc ILoansPortfolio
    function getNumberOfPerformingLoans() external view override returns (uint256 numberOfPerformingLoans_) {
        numberOfPerformingLoans_ = LoansPortfolioStorageWrapper.getNumberOfPerformingLoans();
    }

    /// @inheritdoc ILoansPortfolio
    function getNumberOfNonPerformingLoans() external view override returns (uint256 numberOfNonPerformingLoans_) {
        numberOfNonPerformingLoans_ = LoansPortfolioStorageWrapper.getNumberOfNonPerformingLoans();
    }

    /// @inheritdoc ILoansPortfolio
    function getNumberDefaultedLoans() external view override returns (uint256 numberDefaultedLoans_) {
        numberDefaultedLoans_ = LoansPortfolioStorageWrapper.getNumberDefaultedLoans();
    }

    /// @inheritdoc ILoansPortfolio
    function getSecuredLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = LoansPortfolioStorageWrapper.getSecuredLoansRatio();
    }

    /// @inheritdoc ILoansPortfolio
    function getPerformingLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = LoansPortfolioStorageWrapper.getPerformingLoansRatio();
    }

    /// @inheritdoc ILoansPortfolio
    function getNonPerformingLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = LoansPortfolioStorageWrapper.getNonPerformingLoansRatio();
    }

    /// @inheritdoc ILoansPortfolio
    function getDefaultedLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = LoansPortfolioStorageWrapper.getDefaultedLoansRatio();
    }

    /// @inheritdoc ILoansPortfolio
    function getGeographicalExposure()
        external
        view
        override
        returns (ILoansPortfolio.GeographicalExposureData[] memory geographicalExposure_)
    {
        geographicalExposure_ = LoansPortfolioStorageWrapper.getGeographicalExposure();
    }
}
