// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _LOANS_PORTFOLIO_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { ILoansPortfolioStorageWrapper } from "./ILoansPortfolioStorageWrapper.sol";
import { ILoansPortfolio } from "../../../facets/layer_2/loansPortfolio/ILoansPortfolio.sol";

import { ILoan } from "../../../facets/layer_2/loan/ILoan.sol";
import { IERC1410Types } from "../../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IERC1410 } from "../../../facets/layer_1/ERC1400/ERC1410/IERC1410.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";

library LoansPortfolioStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using Pagination for EnumerableSet.AddressSet;

    struct LoansPortfolioDataStorage {
        ILoansPortfolio.PortfolioType portfolioType;
        ILoansPortfolio.DistributionPolicy distributionPolicy;
        EnumerableSet.AddressSet holdingsAssets;
        EnumerableSet.AddressSet loanHoldingsAssets;
        EnumerableSet.AddressSet cashHoldingsAssets;
        EnumerableSet.AddressSet securedLoanHoldingsAssets;
        EnumerableSet.AddressSet nonSecuredLoanHoldingsAssets;
        EnumerableSet.AddressSet performingLoanHoldingsAssets;
        EnumerableSet.AddressSet nonPerformingLoanHoldingsAssets;
        EnumerableSet.AddressSet defaultedLoanHoldingsAssets;
        EnumerableSet.Bytes32Set loanHoldingsAssetsByCountryKeys;
        mapping(bytes32 => string) countryNames;
        mapping(bytes32 => uint256) loanHoldingsAssetsByCountry;
        bool initialized;
    }

    function initializeLoansPortfolio(ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData) internal {
        LoansPortfolioDataStorage storage s = loansPortfolioStorage();
        s.initialized = true;
        storeLoansPortfolioDetails(_loansPortfolioData);
    }

    function storeLoansPortfolioDetails(
        ILoansPortfolio.LoansPortfolioDetailsData memory _loansPortfolioDetails
    ) internal {
        LoansPortfolioDataStorage storage s = loansPortfolioStorage();
        s.portfolioType = _loansPortfolioDetails.portfolioType;
        s.distributionPolicy = _loansPortfolioDetails.distributionPolicy;
    }

    function addHoldingsAsset(ILoansPortfolio.HoldingsAsset memory _holdingsAsset) internal {
        ILoansPortfolio.HoldingsAssetType holdingsAssetType = _holdingsAsset.holdingsAssetType;
        LoansPortfolioDataStorage storage loanPortfolioStorage = loansPortfolioStorage();

        if (loanPortfolioStorage.holdingsAssets.contains(_holdingsAsset.assetAddress)) {
            revert ILoansPortfolioStorageWrapper.HoldingsAssetAlreadyExists(_holdingsAsset.assetAddress);
        }

        if (holdingsAssetType == ILoansPortfolio.HoldingsAssetType.LOAN) {
            _addLoanHoldingsAsset(loanPortfolioStorage, _holdingsAsset.assetAddress);
        } else {
            loanPortfolioStorage.cashHoldingsAssets.add(_holdingsAsset.assetAddress);
        }

        loanPortfolioStorage.holdingsAssets.add(_holdingsAsset.assetAddress);
        emit ILoansPortfolio.HoldingsAssetAdded(_holdingsAsset);
    }

    function removeHoldingsAsset(ILoansPortfolio.HoldingsAsset memory _holdingsAsset) internal {
        ILoansPortfolio.HoldingsAssetType holdingsAssetType = _holdingsAsset.holdingsAssetType;
        address assetAddress = _holdingsAsset.assetAddress;
        checkHoldingAssetExists(assetAddress);

        LoansPortfolioDataStorage storage loanPortfolioStorage = loansPortfolioStorage();

        if (holdingsAssetType == ILoansPortfolio.HoldingsAssetType.LOAN) {
            _removeLoanHoldingsAsset(loanPortfolioStorage, assetAddress);
        } else {
            EnumerableSet.AddressSet storage cashAssets = loanPortfolioStorage.cashHoldingsAssets;
            cashAssets.remove(assetAddress);
        }

        loanPortfolioStorage.holdingsAssets.remove(assetAddress);
        emit ILoansPortfolio.HoldingsAssetRemoved(_holdingsAsset);
    }

    function notifyLoanHoldingsAssetUpdate(address _holdingsAssetAddress) internal {
        checkHoldingAssetExists(_holdingsAssetAddress);
        LoansPortfolioDataStorage storage loanPortfolioStorage = loansPortfolioStorage();

        ILoan.LoanDetailsData memory loanDetails = ILoan(_holdingsAssetAddress).getLoanDetails();

        loanPortfolioStorage.securedLoanHoldingsAssets.remove(_holdingsAssetAddress);
        loanPortfolioStorage.nonSecuredLoanHoldingsAssets.remove(_holdingsAssetAddress);

        _classifyByCollateral(loanPortfolioStorage, _holdingsAssetAddress, loanDetails.collateral.totalCollateralValue);

        loanPortfolioStorage.performingLoanHoldingsAssets.remove(_holdingsAssetAddress);
        loanPortfolioStorage.nonPerformingLoanHoldingsAssets.remove(_holdingsAssetAddress);
        loanPortfolioStorage.defaultedLoanHoldingsAssets.remove(_holdingsAssetAddress);

        _addLoanHoldingsAssetByPerformanceStatus(
            loanPortfolioStorage,
            _holdingsAssetAddress,
            loanDetails.loanPerformanceStatus.performanceStatus
        );
        emit ILoansPortfolio.LoanHoldingsAssetUpdated(_holdingsAssetAddress);
    }

    function loansPortfolioWithdraw(
        address _assetAddress,
        address _to,
        uint256 _amount
    ) internal returns (bool success_) {
        if (_amount == 0) {
            revert IERC1410Types.ZeroValue();
        }

        checkHoldingAssetExists(_assetAddress);

        IERC1410Types.BasicTransferInfo memory transferInfo = IERC1410Types.BasicTransferInfo({
            to: _to,
            value: _amount
        });

        IERC1410(_assetAddress).transferByPartition(_DEFAULT_PARTITION, transferInfo, "");

        emit ILoansPortfolio.LoansPortfolioWithdrawn(_assetAddress, _to, _amount);
        success_ = true;
    }

    function checkHoldingAssetExists(address _assetAddress) internal view {
        if (!loansPortfolioStorage().holdingsAssets.contains(_assetAddress)) {
            revert ILoansPortfolioStorageWrapper.HoldingAssetNotFound(_assetAddress);
        }
    }
    function getLoansPortfolioDetails()
        internal
        view
        returns (ILoansPortfolio.LoansPortfolioDetailsData memory loansPortfolioDetails_)
    {
        LoansPortfolioDataStorage storage s = loansPortfolioStorage();
        loansPortfolioDetails_ = ILoansPortfolio.LoansPortfolioDetailsData({
            portfolioType: s.portfolioType,
            distributionPolicy: s.distributionPolicy
        });
    }

    function getSecuredLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(loansPortfolioStorage().securedLoanHoldingsAssets);
    }

    function getPerformingLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(loansPortfolioStorage().performingLoanHoldingsAssets);
    }

    function getNonPerformingLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(loansPortfolioStorage().nonPerformingLoanHoldingsAssets);
    }

    function getDefaultedLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(loansPortfolioStorage().defaultedLoanHoldingsAssets);
    }

    function getGeographicalExposure()
        internal
        view
        returns (ILoansPortfolio.GeographicalExposureData[] memory geographicalExposure_)
    {
        LoansPortfolioDataStorage storage storage_ = loansPortfolioStorage();
        uint256 countryCount = storage_.loanHoldingsAssetsByCountryKeys.length();

        if (countryCount == 0) {
            return new ILoansPortfolio.GeographicalExposureData[](0);
        }

        geographicalExposure_ = new ILoansPortfolio.GeographicalExposureData[](countryCount);

        for (uint256 i; i < countryCount; ) {
            bytes32 key = storage_.loanHoldingsAssetsByCountryKeys.at(i);
            geographicalExposure_[i] = ILoansPortfolio.GeographicalExposureData({
                country: storage_.countryNames[key],
                count: storage_.loanHoldingsAssetsByCountry[key]
            });

            unchecked {
                ++i;
            }
        }
    }

    function getNumberOfPerformingLoans() internal view returns (uint256 numberOfPerformingLoans_) {
        numberOfPerformingLoans_ = loansPortfolioStorage().performingLoanHoldingsAssets.length();
    }

    function getNumberOfNonPerformingLoans() internal view returns (uint256 numberOfNonPerformingLoans_) {
        numberOfNonPerformingLoans_ = loansPortfolioStorage().nonPerformingLoanHoldingsAssets.length();
    }

    function getNumberDefaultedLoans() internal view returns (uint256 numberDefaultedLoans_) {
        numberDefaultedLoans_ = loansPortfolioStorage().defaultedLoanHoldingsAssets.length();
    }

    function getNumberOfAssets() internal view returns (uint256 numberOfAssets_) {
        numberOfAssets_ = loansPortfolioStorage().holdingsAssets.length();
    }

    function isLoansPortfolioInitialized() internal view returns (bool) {
        return loansPortfolioStorage().initialized;
    }

    function getNumberOfLoans() internal view returns (uint256 numberOfLoans_) {
        numberOfLoans_ = loansPortfolioStorage().loanHoldingsAssets.length();
    }

    function getNumberOfCash() internal view returns (uint256 numberOfCash_) {
        numberOfCash_ = loansPortfolioStorage().cashHoldingsAssets.length();
    }

    function getHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_) {
        assets_ = loansPortfolioStorage().holdingsAssets.getFromSet(_pageIndex, _pageLength);
    }

    function getLoanHoldingsAssetsPaginated(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_) {
        assets_ = loansPortfolioStorage().loanHoldingsAssets.getFromSet(_pageIndex, _pageLength);
    }

    function getHoldingsAssetBalances(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_, uint256[] memory tokenBalances_) {
        assets_ = loansPortfolioStorage().holdingsAssets.getFromSet(_pageIndex, _pageLength);
        uint256 arraySize = assets_.length;
        tokenBalances_ = new uint256[](arraySize);

        for (uint256 i; i < arraySize; ) {
            tokenBalances_[i] = IERC1410(assets_[i]).balanceOfByPartition(_DEFAULT_PARTITION, address(this));
            unchecked {
                ++i;
            }
        }
    }

    function loansPortfolioStorage() internal pure returns (LoansPortfolioDataStorage storage loansPortfolioData_) {
        bytes32 position = _LOANS_PORTFOLIO_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            loansPortfolioData_.slot := position
        }
    }

    function _addLoanHoldingsAsset(
        LoansPortfolioDataStorage storage _loanPortfolioStorage,
        address _loanAddress
    ) private {
        ILoan.LoanDetailsData memory loanDetails = ILoan(_loanAddress).getLoanDetails();

        _loanPortfolioStorage.loanHoldingsAssets.add(_loanAddress);

        _classifyByCollateral(_loanPortfolioStorage, _loanAddress, loanDetails.collateral.totalCollateralValue);

        _addLoanHoldingsAssetByPerformanceStatus(
            _loanPortfolioStorage,
            _loanAddress,
            loanDetails.loanPerformanceStatus.performanceStatus
        );

        // TODO: Get country from loan - implement when loan has country field or find the correct source
        // string memory country = loanDetails.loanBasicData.country;
        // _addLoanHoldingsAssetByCountry(_loanPortfolioStorage, country);

        // Placeholder for now - use empty string to avoid breaking
        _addLoanHoldingsAssetByCountry(_loanPortfolioStorage, "");
    }

    function _addLoanHoldingsAssetByPerformanceStatus(
        LoansPortfolioDataStorage storage _loanPortfolioStorage,
        address _loanAddress,
        ILoan.PerformanceStatus _performanceStatus
    ) private {
        if (_performanceStatus == ILoan.PerformanceStatus.PERFORMING) {
            _loanPortfolioStorage.performingLoanHoldingsAssets.add(_loanAddress);
        } else if (_performanceStatus == ILoan.PerformanceStatus.NON_PERFORMING) {
            _loanPortfolioStorage.nonPerformingLoanHoldingsAssets.add(_loanAddress);
        } else {
            _loanPortfolioStorage.defaultedLoanHoldingsAssets.add(_loanAddress);
        }
    }

    function _addLoanHoldingsAssetByCountry(
        LoansPortfolioDataStorage storage _loanPortfolioStorage,
        string memory _country
    ) private {
        EnumerableSet.Bytes32Set storage loanHoldingsAssetsByCountryKeys = _loanPortfolioStorage
            .loanHoldingsAssetsByCountryKeys;
        bytes32 key = keccak256(abi.encodePacked(_country));
        if (!loanHoldingsAssetsByCountryKeys.contains(key)) {
            loanHoldingsAssetsByCountryKeys.add(key);
            _loanPortfolioStorage.countryNames[key] = _country;
        }
        _loanPortfolioStorage.loanHoldingsAssetsByCountry[key] += 1;
    }

    function _removeLoanHoldingsAsset(
        LoansPortfolioDataStorage storage _loanPortfolioStorage,
        address _loanAddress
    ) private {
        EnumerableSet.AddressSet storage loanAssets = _loanPortfolioStorage.loanHoldingsAssets;

        loanAssets.remove(_loanAddress);
        _loanPortfolioStorage.securedLoanHoldingsAssets.remove(_loanAddress);
        _loanPortfolioStorage.nonSecuredLoanHoldingsAssets.remove(_loanAddress);
        _removeLoanHoldingsAssetByPerformanceStatus(_loanPortfolioStorage, _loanAddress);

        // TODO: Get country from loan - implement when loan has country field or find the correct source
        // string memory country = ILoan(_loanAddress).getLoanDetails().loanBasicData.country;
        // _removeHoldingsAssetByCountry(_loanPortfolioStorage, country);

        // Placeholder for now - use empty string to avoid breaking
        _removeHoldingsAssetByCountry(_loanPortfolioStorage, "");
    }

    function _removeLoanHoldingsAssetByPerformanceStatus(
        LoansPortfolioDataStorage storage _loanPortfolioStorage,
        address _loanAddress
    ) private {
        _loanPortfolioStorage.performingLoanHoldingsAssets.remove(_loanAddress);
        _loanPortfolioStorage.nonPerformingLoanHoldingsAssets.remove(_loanAddress);
        _loanPortfolioStorage.defaultedLoanHoldingsAssets.remove(_loanAddress);
    }

    function _removeHoldingsAssetByCountry(
        LoansPortfolioDataStorage storage _loanPortfolioStorage,
        string memory _country
    ) private {
        bytes32 key = keccak256(abi.encodePacked(_country));
        uint256 current = _loanPortfolioStorage.loanHoldingsAssetsByCountry[key];

        if (current == 0) {
            return;
        }

        uint256 newCount = current - 1;

        if (newCount == 0) {
            delete _loanPortfolioStorage.loanHoldingsAssetsByCountry[key];
            _loanPortfolioStorage.loanHoldingsAssetsByCountryKeys.remove(key);
            delete _loanPortfolioStorage.countryNames[key];
        } else {
            _loanPortfolioStorage.loanHoldingsAssetsByCountry[key] = newCount;
        }
    }

    function _classifyByCollateral(
        LoansPortfolioDataStorage storage _s,
        address _loanAddress,
        uint256 _totalCollateralValue
    ) private {
        if (_totalCollateralValue > 0) {
            _s.securedLoanHoldingsAssets.add(_loanAddress);
        } else {
            _s.nonSecuredLoanHoldingsAssets.add(_loanAddress);
        }
    }

    function _getLoanRatioFor(
        EnumerableSet.AddressSet storage _subSet
    ) private view returns (uint256 numerator_, uint256 denominator_) {
        denominator_ = loansPortfolioStorage().loanHoldingsAssets.length();
        if (denominator_ == 0) return (0, 0);
        numerator_ = _subSet.length();
    }
}
