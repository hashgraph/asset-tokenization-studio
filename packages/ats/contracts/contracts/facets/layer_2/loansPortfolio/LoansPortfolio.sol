// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio } from "./ILoansPortfolio.sol";
import { _LOANS_PORTFOLIO_MANAGER_ROLE } from "../../../constants/roles.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { LoansPortfolioStorageWrapper } from "../../../domain/asset/loansPortfolio/LoansPortfolioStorageWrapper.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";

abstract contract LoansPortfolio is ILoansPortfolio, Modifiers {
    function initializeLoansPortfolio(
        ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external onlyUninitialized(LoansPortfolioStorageWrapper.isLoansPortfolioInitialized()) {
        LoansPortfolioStorageWrapper.initializeLoansPortfolio(_loansPortfolioData);
        SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
    }

    function addHoldingsAsset(
        ILoansPortfolio.HoldingsAsset memory _holdingsAsset
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOANS_PORTFOLIO_MANAGER_ROLE)
        notZeroAddress(_holdingsAsset.assetAddress)
        onlySupportedHoldingsAssetType(_holdingsAsset)
        returns (bool success_)
    {
        LoansPortfolioStorageWrapper.addHoldingsAsset(_holdingsAsset);
        success_ = true;
    }

    function removeHoldingsAsset(
        ILoansPortfolio.HoldingsAsset memory _holdingsAsset
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOANS_PORTFOLIO_MANAGER_ROLE)
        notZeroAddress(_holdingsAsset.assetAddress)
        onlySupportedHoldingsAssetType(_holdingsAsset)
        returns (bool success_)
    {
        LoansPortfolioStorageWrapper.removeHoldingsAsset(_holdingsAsset);
        success_ = true;
    }

    function notifyLoanHoldingsAssetUpdate(
        address _holdingsAssetAddress
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOANS_PORTFOLIO_MANAGER_ROLE)
        notZeroAddress(_holdingsAssetAddress)
        returns (bool success_)
    {
        LoansPortfolioStorageWrapper.notifyLoanHoldingsAssetUpdate(_holdingsAssetAddress);
        success_ = true;
    }

    function loansPortfolioWithdraw(
        address _assetAddress,
        address _to,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOANS_PORTFOLIO_MANAGER_ROLE)
        notZeroAddress(_assetAddress)
        notZeroAddress(_to)
        returns (bool success_)
    {
        success_ = LoansPortfolioStorageWrapper.loansPortfolioWithdraw(_assetAddress, _to, _amount);
    }

    function getLoansPortfolioData()
        external
        view
        override
        returns (ILoansPortfolio.LoansPortfolioDetailsData memory loansPortfolioData_)
    {
        loansPortfolioData_ = LoansPortfolioStorageWrapper.getLoansPortfolioDetails();
    }

    function getHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_) {
        assets_ = LoansPortfolioStorageWrapper.getHoldingsAssets(_pageIndex, _pageLength);
    }

    function getLoanHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_) {
        assets_ = LoansPortfolioStorageWrapper.getLoanHoldingsAssetsPaginated(_pageIndex, _pageLength);
    }

    function getHoldingsAssetOwnership(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_, uint256[] memory balances_) {
        (assets_, balances_) = LoansPortfolioStorageWrapper.getHoldingsAssetBalances(_pageIndex, _pageLength);
    }

    function getNumberOfAssets() external view override returns (uint256 numberOfAssets_) {
        numberOfAssets_ = LoansPortfolioStorageWrapper.getNumberOfAssets();
    }

    function getNumberOfLoans() external view override returns (uint256 numberOfLoans_) {
        numberOfLoans_ = LoansPortfolioStorageWrapper.getNumberOfLoans();
    }

    function getNumberOfCash() external view override returns (uint256 numberOfCash_) {
        numberOfCash_ = LoansPortfolioStorageWrapper.getNumberOfCash();
    }

    function getNumberOfPerformingLoans() external view override returns (uint256 numberOfPerformingLoans_) {
        numberOfPerformingLoans_ = LoansPortfolioStorageWrapper.getNumberOfPerformingLoans();
    }

    function getNumberOfNonPerformingLoans() external view override returns (uint256 numberOfNonPerformingLoans_) {
        numberOfNonPerformingLoans_ = LoansPortfolioStorageWrapper.getNumberOfNonPerformingLoans();
    }

    function getNumberDefaultedLoans() external view override returns (uint256 numberDefaultedLoans_) {
        numberDefaultedLoans_ = LoansPortfolioStorageWrapper.getNumberDefaultedLoans();
    }

    function getSecuredLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = LoansPortfolioStorageWrapper.getSecuredLoansRatio();
    }

    function getPerformingLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = LoansPortfolioStorageWrapper.getPerformingLoansRatio();
    }

    function getNonPerformingLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = LoansPortfolioStorageWrapper.getNonPerformingLoansRatio();
    }

    function getDefaultedLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = LoansPortfolioStorageWrapper.getDefaultedLoansRatio();
    }

    function getGeographicalExposure()
        external
        view
        override
        returns (ILoansPortfolio.GeographicalExposureData[] memory geographicalExposure_)
    {
        geographicalExposure_ = LoansPortfolioStorageWrapper.getGeographicalExposure();
    }
}
