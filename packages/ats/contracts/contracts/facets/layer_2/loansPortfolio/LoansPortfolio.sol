// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolio } from "./ILoansPortfolio.sol";
import { _LOANS_PORTFOLIO_MANAGER_ROLE } from "../../../constants/roles.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";
import { Internals } from "../../../domain/Internals.sol";

abstract contract LoansPortfolio is ILoansPortfolio, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_LoansPortfolio(
        ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external onlyUninitialized(_isLoansPortfolioInitialized()) {
        _initialize_LoansPortfolio(_loansPortfolioData);
        _initializeSecurity(_regulationData, _additionalSecurityData);
    }

    function addHoldingsAsset(
        ILoansPortfolio.HoldingsAsset memory _holdingsAsset
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOANS_PORTFOLIO_MANAGER_ROLE)
        validateAddress(_holdingsAsset.assetAddress)
        onlySupportedHoldingsAssetType(_holdingsAsset)
        returns (bool success_)
    {
        _addHoldingsAsset(_holdingsAsset);
        emit HoldingsAssetAdded(_holdingsAsset);
        success_ = true;
    }

    function removeHoldingsAsset(
        ILoansPortfolio.HoldingsAsset memory _holdingsAsset
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOANS_PORTFOLIO_MANAGER_ROLE)
        validateAddress(_holdingsAsset.assetAddress)
        onlySupportedHoldingsAssetType(_holdingsAsset)
        returns (bool success_)
    {
        _removeHoldingsAsset(_holdingsAsset);
        emit HoldingsAssetRemoved(_holdingsAsset);
        success_ = true;
    }

    function notifyLoanHoldingsAssetUpdate(
        address _holdingsAssetAddress
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOANS_PORTFOLIO_MANAGER_ROLE)
        validateAddress(_holdingsAssetAddress)
        returns (bool success_)
    {
        _notifyLoanHoldingsAssetUpdate(_holdingsAssetAddress);
        emit LoanHoldingsAssetUpdated(_holdingsAssetAddress);
        success_ = true;
    }

    function loansPortfolioWithdraw(
        address assetAddress,
        address to,
        uint256 amount
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOANS_PORTFOLIO_MANAGER_ROLE)
        validateAddress(assetAddress)
        validateAddress(to)
        returns (bool success_)
    {
        _loansPortfolioWithdraw(assetAddress, to, amount);
        emit LoansPortfolioWithdrawn(assetAddress, to, amount);
        success_ = true;
    }

    function getLoansPortfolioData()
        external
        view
        override
        returns (ILoansPortfolio.LoansPortfolioDetailsData memory loansPortfolioData_)
    {
        loansPortfolioData_ = _getLoansPortfolioDetails();
    }

    function getHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_) {
        assets_ = _getHoldingsAssets(_pageIndex, _pageLength);
    }

    function getLoanHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_) {
        assets_ = _getLoanHoldingsAssetsPaginated(_pageIndex, _pageLength);
    }

    function getHoldingsAssetOwnership(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory assets_, uint256[] memory balances_) {
        (assets_, balances_) = _getHoldingsAssetBalances(_pageIndex, _pageLength);
    }

    function getNumberOfAssets() external view override returns (uint256 numberOfAssets_) {
        numberOfAssets_ = _getNumberOfAssets();
    }

    function getNumberOfLoans() external view override returns (uint256 numberOfLoans_) {
        numberOfLoans_ = _getNumberOfLoans();
    }

    function getNumberOfCash() external view override returns (uint256 numberOfCash_) {
        numberOfCash_ = _getNumberOfCash();
    }

    function getNumberOfPerformingLoans() external view override returns (uint256 numberOfPerformingLoans_) {
        numberOfPerformingLoans_ = _getNumberOfPerformingLoans();
    }

    function getNumberOfNonPerformingLoans() external view override returns (uint256 numberOfNonPerformingLoans_) {
        numberOfNonPerformingLoans_ = _getNumberOfNonPerformingLoans();
    }

    function getNumberDefaultedLoans() external view override returns (uint256 numberDefaultedLoans_) {
        numberDefaultedLoans_ = _getNumberDefaultedLoans();
    }

    function getSecuredLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = _getSecuredLoansRatio();
    }

    function getPerformingLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = _getPerformingLoansRatio();
    }

    function getNonPerformingLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = _getNonPerformingLoansRatio();
    }

    function getDefaultedLoansRatio() external view override returns (uint256 numerator_, uint256 denominator_) {
        (numerator_, denominator_) = _getDefaultedLoansRatio();
    }

    function getGeographicalExposure()
        external
        view
        override
        returns (ILoansPortfolio.GeographicalExposureData[] memory geographicalExposure_)
    {
        geographicalExposure_ = _getGeographicalExposure();
    }
}
