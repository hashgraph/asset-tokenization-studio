// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoansPortfolioStorageWrapper } from "../../../domain/asset/loansPortfolio/ILoansPortfolioStorageWrapper.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";

interface ILoansPortfolio is ILoansPortfolioStorageWrapper {
    enum PortfolioType {
        NONE,
        STATIC,
        REVOLVING,
        MANAGED,
        OPEN,
        CLOSED
    }

    enum DistributionPolicy {
        NONE,
        DIRECT_PASSTHROUGH,
        ACCRUED
    }

    enum HoldingsAssetType {
        NONE,
        LOAN,
        CASH
    }

    struct HoldingsAsset {
        address assetAddress;
        HoldingsAssetType holdingsAssetType;
        string country;
    }

    struct LoansPortfolioDetailsData {
        PortfolioType portfolioType;
        DistributionPolicy distributionPolicy;
    }

    struct GeographicalExposureData {
        string country;
        uint256 count;
    }

    event HoldingsAssetAdded(HoldingsAsset holdingsAsset);
    event HoldingsAssetRemoved(HoldingsAsset holdingsAsset);
    event LoanHoldingsAssetUpdated(address loanHoldingsAsset);
    event LoansPortfolioWithdrawn(address assetAddress, address to, uint256 amount);

    // solhint-disable-next-line func-name-mixedcase
    function initializeLoansPortfolio(
        ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external;

    function addHoldingsAsset(HoldingsAsset memory _holdingsAsset) external returns (bool success_);

    function removeHoldingsAsset(HoldingsAsset memory _holdingsAsset) external returns (bool success_);

    function notifyLoanHoldingsAssetUpdate(address _holdingsAssetAddress) external returns (bool success_);

    function loansPortfolioWithdraw(
        address _assetAddress,
        address _to,
        uint256 _amount
    ) external returns (bool success_);

    function getLoansPortfolioData() external view returns (LoansPortfolioDetailsData memory loansPortfolioData_);

    function getHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory assets_);

    function getLoanHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory assets_);

    function getHoldingsAssetOwnership(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory assets_, uint256[] memory balances_);

    function getNumberOfAssets() external view returns (uint256 numberOfAssets_);

    function getNumberOfLoans() external view returns (uint256 numberOfLoans_);

    function getNumberOfCash() external view returns (uint256 numberOfCash_);

    function getNumberOfPerformingLoans() external view returns (uint256 numberOfPerformingLoans_);

    function getNumberOfNonPerformingLoans() external view returns (uint256 numberOfNonPerformingLoans_);

    function getNumberDefaultedLoans() external view returns (uint256 numberDefaultedLoans_);

    function getSecuredLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);

    function getPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);

    function getNonPerformingLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);

    function getDefaultedLoansRatio() external view returns (uint256 numerator_, uint256 denominator_);

    function getGeographicalExposure() external view returns (GeographicalExposureData[] memory geographicalExposure_);
}
