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

/**
 * @title  LoansPortfolioStorageWrapper
 * @notice Internal library providing storage operations for a loans portfolio instrument,
 *         including asset registration, multi-dimensional loan classification, geographical
 *         exposure tracking, and portfolio-level token withdrawals.
 * @dev    Anchors `LoansPortfolioDataStorage` at `_LOANS_PORTFOLIO_STORAGE_POSITION`
 *         following the ERC-2535 Diamond Storage Pattern. All functions are `internal` and
 *         intended exclusively for use within facets or other internal libraries of the
 *         same diamond.
 *
 *         Holdings assets are partitioned into two top-level categories:
 *           - Loan assets — further classified by collateral (secured / non-secured) and
 *             by performance status (performing / non-performing / defaulted).
 *           - Cash assets — tracked in a single flat set.
 *
 *         Each asset address may belong to exactly one top-level category and must not
 *         be registered twice; `addHoldingsAsset` enforces uniqueness via the global
 *         `holdingsAssets` set.
 *
 *         Loan classification sets are mutually exclusive within each dimension:
 *           - An asset is in exactly one of: `securedLoanHoldingsAssets` or
 *             `nonSecuredLoanHoldingsAssets`.
 *           - An asset is in exactly one of: `performingLoanHoldingsAssets`,
 *             `nonPerformingLoanHoldingsAssets`, or `defaultedLoanHoldingsAssets`.
 *         `notifyLoanHoldingsAssetUpdate` re-derives classification by reading live data
 *         from the loan contract via `ILoan.getLoanDetails`.
 *
 *         Geographical exposure is tracked via a `keccak256`-keyed country counter.
 *         Country sourcing is currently a placeholder using an empty string; this must
 *         be updated once the loan contract exposes a country field.
 *
 *         Ratio functions return `(numerator, denominator)` pairs where `denominator`
 *         is the total number of registered loan assets. Both are `0` when no loans are
 *         registered.
 * @author Hashgraph
 */
library LoansPortfolioStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using Pagination for EnumerableSet.AddressSet;

    /**
     * @notice Diamond Storage struct for a loans portfolio instrument.
     * @dev    Stored at `_LOANS_PORTFOLIO_STORAGE_POSITION`. All enumerable sets are
     *         maintained as mutually exclusive subsets within their respective dimensions
     *         to ensure accurate ratio and count queries. The `loanHoldingsAssetsByCountry`
     *         counter and `loanHoldingsAssetsByCountryKeys` set use a `keccak256` hash of
     *         the country name string as a key. Country name sourcing is currently a
     *         placeholder.
     * @param portfolioType
     *        Classification of the portfolio (e.g. open-end, closed-end).
     * @param distributionPolicy
     *        Policy governing distribution of returns to investors.
     * @param holdingsAssets
     *        Enumerable set of all registered asset addresses (both loan and cash).
     * @param loanHoldingsAssets
     *        Subset of `holdingsAssets` containing only loan asset addresses.
     * @param cashHoldingsAssets
     *        Subset of `holdingsAssets` containing only cash asset addresses.
     * @param securedLoanHoldingsAssets
     *        Subset of loan assets with non-zero total collateral value.
     * @param nonSecuredLoanHoldingsAssets
     *        Subset of loan assets with zero total collateral value.
     * @param performingLoanHoldingsAssets
     *        Subset of loan assets with `PerformanceStatus.PERFORMING`.
     * @param nonPerformingLoanHoldingsAssets
     *        Subset of loan assets with `PerformanceStatus.NON_PERFORMING`.
     * @param defaultedLoanHoldingsAssets
     *        Subset of loan assets with any status other than PERFORMING or
     *        NON_PERFORMING.
     * @param loanHoldingsAssetsByCountryKeys
     *        Enumerable set of `keccak256` keys for registered country strings.
     * @param countryNames
     *        Maps a country key to its human-readable string name.
     * @param loanHoldingsAssetsByCountry
     *        Maps a country key to the count of loan assets associated with that country.
     * @param initialized
     *        True once `initializeLoansPortfolio` has been called.
     */
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

    /**
     * @notice Initialises the loans portfolio storage with the provided configuration
     *         and marks the subsystem as initialised.
     * @dev    Delegates field writes to `storeLoansPortfolioDetails`. Calling this more
     *         than once silently overwrites the portfolio type and distribution policy
     *         without clearing registered assets; callers must enforce single-initialisation
     *         at the facet level.
     * @param _loansPortfolioData  Calldata struct containing portfolio type and
     *                             distribution policy to persist.
     */
    function initializeLoansPortfolio(ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData) internal {
        LoansPortfolioDataStorage storage s = _loansPortfolioStorage();
        s.initialized = true;
        storeLoansPortfolioDetails(_loansPortfolioData);
    }

    /**
     * @notice Overwrites the stored portfolio type and distribution policy.
     * @dev    Does not update `initialized`. Callers are responsible for access control.
     *         Does not affect any registered asset sets.
     * @param _loansPortfolioDetails  Memory struct containing the updated portfolio type
     *                                and distribution policy.
     */
    function storeLoansPortfolioDetails(
        ILoansPortfolio.LoansPortfolioDetailsData memory _loansPortfolioDetails
    ) internal {
        LoansPortfolioDataStorage storage s = _loansPortfolioStorage();
        s.portfolioType = _loansPortfolioDetails.portfolioType;
        s.distributionPolicy = _loansPortfolioDetails.distributionPolicy;
    }

    /**
     * @notice Registers a new holdings asset and classifies it as either a loan or cash
     *         asset, populating the appropriate sub-sets.
     * @dev    Reverts with `ILoansPortfolioStorageWrapper.HoldingsAssetAlreadyExists` if
     *         the asset address is already registered in `holdingsAssets`. For loan
     *         assets, reads live loan details from `ILoan.getLoanDetails` via
     *         `_addLoanHoldingsAsset` and classifies by collateral and performance status.
     *         Country classification currently uses an empty string placeholder.
     *         Emits: `ILoansPortfolio.HoldingsAssetAdded`.
     * @param _holdingsAsset  Memory struct containing the asset address and its type
     *                        (LOAN or CASH).
     */
    function addHoldingsAsset(ILoansPortfolio.HoldingsAsset memory _holdingsAsset) internal {
        ILoansPortfolio.HoldingsAssetType holdingsAssetType = _holdingsAsset.holdingsAssetType;
        LoansPortfolioDataStorage storage loanPortfolioStorage = _loansPortfolioStorage();
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

    /**
     * @notice Deregisters a holdings asset and removes it from all classification sets.
     * @dev    Reverts with `ILoansPortfolioStorageWrapper.HoldingAssetNotFound` if the
     *         asset is not registered. For loan assets, delegates full cleanup to
     *         `_removeLoanHoldingsAsset`, which removes the address from collateral,
     *         performance, and country sets. Country removal currently uses an empty
     *         string placeholder.
     *         Emits: `ILoansPortfolio.HoldingsAssetRemoved`.
     * @param _holdingsAsset  Memory struct containing the asset address and its type.
     */
    function removeHoldingsAsset(ILoansPortfolio.HoldingsAsset memory _holdingsAsset) internal {
        ILoansPortfolio.HoldingsAssetType holdingsAssetType = _holdingsAsset.holdingsAssetType;
        address assetAddress = _holdingsAsset.assetAddress;
        checkHoldingAssetExists(assetAddress);
        LoansPortfolioDataStorage storage loanPortfolioStorage = _loansPortfolioStorage();
        if (holdingsAssetType == ILoansPortfolio.HoldingsAssetType.LOAN) {
            _removeLoanHoldingsAsset(loanPortfolioStorage, assetAddress);
        } else {
            EnumerableSet.AddressSet storage cashAssets = loanPortfolioStorage.cashHoldingsAssets;
            cashAssets.remove(assetAddress);
        }
        loanPortfolioStorage.holdingsAssets.remove(assetAddress);
        emit ILoansPortfolio.HoldingsAssetRemoved(_holdingsAsset);
    }

    /**
     * @notice Re-derives the collateral and performance classification of a registered
     *         loan asset by reading its current state from the loan contract.
     * @dev    Reverts with `ILoansPortfolioStorageWrapper.HoldingAssetNotFound` if the
     *         asset is not registered. Removes the asset from all collateral and
     *         performance sets before re-adding it to the correct sets based on the
     *         current `ILoan.getLoanDetails` response. This function makes an external
     *         call to `ILoan(_holdingsAssetAddress).getLoanDetails`; callers should
     *         ensure the loan contract is trusted.
     *         Emits: `ILoansPortfolio.LoanHoldingsAssetUpdated`.
     * @param _holdingsAssetAddress  Address of the registered loan asset to update.
     */
    function notifyLoanHoldingsAssetUpdate(address _holdingsAssetAddress) internal {
        checkHoldingAssetExists(_holdingsAssetAddress);
        LoansPortfolioDataStorage storage loanPortfolioStorage = _loansPortfolioStorage();
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

    /**
     * @notice Initiates a transfer of `_amount` tokens from a registered holdings asset
     *         to a destination address under `_DEFAULT_PARTITION`.
     * @dev    Reverts with `IERC1410Types.ZeroValue` if `_amount` is zero. Reverts with
     *         `ILoansPortfolioStorageWrapper.HoldingAssetNotFound` if `_assetAddress` is
     *         not registered. Delegates the transfer to
     *         `IERC1410(_assetAddress).transferByPartition`; the portfolio contract must
     *         hold sufficient balance in `_DEFAULT_PARTITION` on the asset contract.
     *         Emits: `ILoansPortfolio.LoansPortfolioWithdrawn`.
     * @param _assetAddress  Address of the registered holdings asset to withdraw from.
     * @param _to            Destination address to receive the transferred tokens.
     * @param _amount        Token quantity to transfer; must be non-zero.
     * @return success_      Always `true` on successful completion.
     */
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

    /**
     * @notice Reverts if the given asset address is not registered in the portfolio.
     * @dev    Reverts with `ILoansPortfolioStorageWrapper.HoldingAssetNotFound`. Use as
     *         a guard before any operation that requires the asset to be a registered
     *         holding.
     * @param _assetAddress  Address to check for registration.
     */
    function checkHoldingAssetExists(address _assetAddress) internal view {
        if (!_loansPortfolioStorage().holdingsAssets.contains(_assetAddress)) {
            revert ILoansPortfolioStorageWrapper.HoldingAssetNotFound(_assetAddress);
        }
    }

    /**
     * @notice Returns the stored portfolio type and distribution policy.
     * @dev    Returns zero-value enum defaults if the portfolio has not been initialised.
     * @return loansPortfolioDetails_  Memory struct containing the current portfolio type
     *                                 and distribution policy.
     */
    function getLoansPortfolioDetails()
        internal
        view
        returns (ILoansPortfolio.LoansPortfolioDetailsData memory loansPortfolioDetails_)
    {
        LoansPortfolioDataStorage storage s = _loansPortfolioStorage();
        loansPortfolioDetails_ = ILoansPortfolio.LoansPortfolioDetailsData({
            portfolioType: s.portfolioType,
            distributionPolicy: s.distributionPolicy
        });
    }

    /**
     * @notice Returns the ratio of secured loans to total registered loans as a
     *         numerator/denominator pair.
     * @dev    Returns `(0, 0)` if no loan assets are registered. The denominator equals
     *         the total number of registered loan assets.
     * @return numerator_    Number of secured loan assets.
     * @return denominator_  Total number of registered loan assets.
     */
    function getSecuredLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(_loansPortfolioStorage().securedLoanHoldingsAssets);
    }

    /**
     * @notice Returns the ratio of performing loans to total registered loans as a
     *         numerator/denominator pair.
     * @dev    Returns `(0, 0)` if no loan assets are registered.
     * @return numerator_    Number of performing loan assets.
     * @return denominator_  Total number of registered loan assets.
     */
    function getPerformingLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(_loansPortfolioStorage().performingLoanHoldingsAssets);
    }

    /**
     * @notice Returns the ratio of non-performing loans to total registered loans as a
     *         numerator/denominator pair.
     * @dev    Returns `(0, 0)` if no loan assets are registered.
     * @return numerator_    Number of non-performing loan assets.
     * @return denominator_  Total number of registered loan assets.
     */
    function getNonPerformingLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(_loansPortfolioStorage().nonPerformingLoanHoldingsAssets);
    }

    /**
     * @notice Returns the ratio of defaulted loans to total registered loans as a
     *         numerator/denominator pair.
     * @dev    Returns `(0, 0)` if no loan assets are registered.
     * @return numerator_    Number of defaulted loan assets.
     * @return denominator_  Total number of registered loan assets.
     */
    function getDefaultedLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(_loansPortfolioStorage().defaultedLoanHoldingsAssets);
    }

    /**
     * @notice Returns the geographical exposure of registered loan assets, expressed as
     *         a per-country asset count.
     * @dev    Returns an empty array if no countries are registered. Gas cost scales
     *         linearly with the number of distinct countries. Country sourcing is
     *         currently a placeholder; all loans are assigned an empty-string country
     *         until the loan contract exposes a country field.
     * @return geographicalExposure_  Array of structs each containing a country name
     *                                and the count of loan assets in that country.
     */
    function getGeographicalExposure()
        internal
        view
        returns (ILoansPortfolio.GeographicalExposureData[] memory geographicalExposure_)
    {
        LoansPortfolioDataStorage storage storage_ = _loansPortfolioStorage();
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

    /**
     * @notice Returns the current count of performing loan assets.
     * @return numberOfPerformingLoans_  Number of assets in the performing set.
     */
    function getNumberOfPerformingLoans() internal view returns (uint256 numberOfPerformingLoans_) {
        numberOfPerformingLoans_ = _loansPortfolioStorage().performingLoanHoldingsAssets.length();
    }

    /**
     * @notice Returns the current count of non-performing loan assets.
     * @return numberOfNonPerformingLoans_  Number of assets in the non-performing set.
     */
    function getNumberOfNonPerformingLoans() internal view returns (uint256 numberOfNonPerformingLoans_) {
        numberOfNonPerformingLoans_ = _loansPortfolioStorage().nonPerformingLoanHoldingsAssets.length();
    }

    /**
     * @notice Returns the current count of defaulted loan assets.
     * @return numberDefaultedLoans_  Number of assets in the defaulted set.
     */
    function getNumberDefaultedLoans() internal view returns (uint256 numberDefaultedLoans_) {
        numberDefaultedLoans_ = _loansPortfolioStorage().defaultedLoanHoldingsAssets.length();
    }

    /**
     * @notice Returns the total count of all registered holdings assets (loans and cash
     *         combined).
     * @return numberOfAssets_  Total number of registered asset addresses.
     */
    function getNumberOfAssets() internal view returns (uint256 numberOfAssets_) {
        numberOfAssets_ = _loansPortfolioStorage().holdingsAssets.length();
    }

    /**
     * @notice Returns whether the loans portfolio storage has been initialised.
     * @dev    Returns `false` until `initializeLoansPortfolio` has been called.
     * @return True if initialised; false otherwise.
     */
    function isLoansPortfolioInitialized() internal view returns (bool) {
        return _loansPortfolioStorage().initialized;
    }

    /**
     * @notice Returns the total count of registered loan assets.
     * @return numberOfLoans_  Number of addresses in `loanHoldingsAssets`.
     */
    function getNumberOfLoans() internal view returns (uint256 numberOfLoans_) {
        numberOfLoans_ = _loansPortfolioStorage().loanHoldingsAssets.length();
    }

    /**
     * @notice Returns the total count of registered cash assets.
     * @return numberOfCash_  Number of addresses in `cashHoldingsAssets`.
     */
    function getNumberOfCash() internal view returns (uint256 numberOfCash_) {
        numberOfCash_ = _loansPortfolioStorage().cashHoldingsAssets.length();
    }

    /**
     * @notice Returns a paginated slice of all registered holdings asset addresses.
     * @dev    Includes both loan and cash assets. Enumeration order is not guaranteed to
     *         be stable across registrations or removals.
     * @param _pageIndex   Zero-based page number to retrieve.
     * @param _pageLength  Maximum number of addresses to return per page.
     * @return assets_  Array of registered holdings asset addresses for the requested page.
     */
    function getHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_) {
        assets_ = _loansPortfolioStorage().holdingsAssets.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns a paginated slice of registered loan holdings asset addresses.
     * @dev    Enumeration order is not guaranteed to be stable across registrations or
     *         removals.
     * @param _pageIndex   Zero-based page number to retrieve.
     * @param _pageLength  Maximum number of addresses to return per page.
     * @return assets_  Array of registered loan asset addresses for the requested page.
     */
    function getLoanHoldingsAssetsPaginated(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_) {
        assets_ = _loansPortfolioStorage().loanHoldingsAssets.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns a paginated slice of all holdings asset addresses alongside their
     *         current token balances held by this contract under `_DEFAULT_PARTITION`.
     * @dev    For each address in the page, makes an external call to
     *         `IERC1410(asset).balanceOfByPartition`. Gas cost scales with page size and
     *         the cost of each balance query. Returns zero balances for assets with no
     *         holdings. Includes both loan and cash assets.
     * @param _pageIndex    Zero-based page number to retrieve.
     * @param _pageLength   Maximum number of entries to return per page.
     * @return assets_        Array of asset addresses for the requested page.
     * @return tokenBalances_ Array of corresponding `_DEFAULT_PARTITION` balances held
     *                        by this contract on each asset.
     */
    function getHoldingsAssetBalances(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_, uint256[] memory tokenBalances_) {
        assets_ = _loansPortfolioStorage().holdingsAssets.getFromSet(_pageIndex, _pageLength);
        uint256 arraySize = assets_.length;
        tokenBalances_ = new uint256[](arraySize);
        for (uint256 i; i < arraySize; ) {
            tokenBalances_[i] = IERC1410(assets_[i]).balanceOfByPartition(_DEFAULT_PARTITION, address(this));
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Registers a loan asset in the loan set and classifies it by collateral and
     *         performance status, reading live data from the loan contract.
     * @dev    Makes an external call to `ILoan(_loanAddress).getLoanDetails`. Country
     *         classification currently uses an empty string placeholder. Callers must
     *         ensure the loan contract at `_loanAddress` is trusted.
     * @param _loanPortfolioStorage  Storage pointer to the portfolio data struct.
     * @param _loanAddress           Address of the loan asset to register.
     */
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

    /**
     * @notice Adds a loan asset to the appropriate performance status set based on the
     *         provided performance status value.
     * @dev    Exactly one of the three performance sets receives the address; any status
     *         other than `PERFORMING` or `NON_PERFORMING` is treated as defaulted.
     * @param _loanPortfolioStorage  Storage pointer to the portfolio data struct.
     * @param _loanAddress           Loan asset address to classify.
     * @param _performanceStatus     Current performance status of the loan.
     */
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

    /**
     * @notice Increments the country asset counter for the given country string,
     *         registering the country key if it has not been seen before.
     * @dev    Country keys are derived as `keccak256(abi.encodePacked(_country))`. If
     *         the key is new, it is added to `loanHoldingsAssetsByCountryKeys` and the
     *         country name is stored. Currently called with an empty string placeholder.
     * @param _loanPortfolioStorage  Storage pointer to the portfolio data struct.
     * @param _country               Human-readable country name string; currently always
     *                               empty.
     */
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

    /**
     * @notice Removes a loan asset from all loan classification sets and decrements the
     *         country counter.
     * @dev    Removes from the loan asset set, both collateral sets, all performance
     *         sets, and the country counter. Country removal currently uses an empty
     *         string placeholder. If the country counter reaches zero, the country key
     *         and name are deleted.
     * @param _loanPortfolioStorage  Storage pointer to the portfolio data struct.
     * @param _loanAddress           Loan asset address to deregister.
     */
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

    /**
     * @notice Removes a loan asset from all three performance status sets unconditionally.
     * @dev    All three removes are attempted regardless of which set the asset belongs
     *         to; enumerable set removes are silent no-ops if the element is absent.
     * @param _loanPortfolioStorage  Storage pointer to the portfolio data struct.
     * @param _loanAddress           Loan asset address to remove from performance sets.
     */
    function _removeLoanHoldingsAssetByPerformanceStatus(
        LoansPortfolioDataStorage storage _loanPortfolioStorage,
        address _loanAddress
    ) private {
        _loanPortfolioStorage.performingLoanHoldingsAssets.remove(_loanAddress);
        _loanPortfolioStorage.nonPerformingLoanHoldingsAssets.remove(_loanAddress);
        _loanPortfolioStorage.defaultedLoanHoldingsAssets.remove(_loanAddress);
    }

    /**
     * @notice Decrements the country asset counter for the given country string, removing
     *         the country entry entirely when the counter reaches zero.
     * @dev    Returns immediately if the current count is zero to prevent underflow.
     *         When the count drops to zero, deletes the counter, removes the key from
     *         the enumerable set, and deletes the country name. Currently called with an
     *         empty string placeholder.
     * @param _loanPortfolioStorage  Storage pointer to the portfolio data struct.
     * @param _country               Human-readable country name string; currently always
     *                               empty.
     */
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

    /**
     * @notice Adds a loan asset to the secured or non-secured collateral set based on
     *         whether its total collateral value is non-zero.
     * @dev    Adds to exactly one set; callers must ensure the address has been removed
     *         from both sets before calling to maintain mutual exclusivity.
     * @param _s                   Storage pointer to the portfolio data struct.
     * @param _loanAddress         Loan asset address to classify.
     * @param _totalCollateralValue  Total collateral value read from the loan contract.
     */
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

    /**
     * @notice Returns a numerator/denominator ratio for a loan sub-set relative to the
     *         total number of registered loan assets.
     * @dev    Returns `(0, 0)` if no loan assets are registered, avoiding division by
     *         zero at the call site. The denominator is always the total loan count.
     * @param _subSet       Storage reference to the loan sub-set whose count forms the
     *                      numerator.
     * @return numerator_    Size of `_subSet`.
     * @return denominator_  Total number of registered loan assets; `0` if none.
     */
    function _getLoanRatioFor(
        EnumerableSet.AddressSet storage _subSet
    ) private view returns (uint256 numerator_, uint256 denominator_) {
        denominator_ = _loansPortfolioStorage().loanHoldingsAssets.length();
        if (denominator_ == 0) return (0, 0);
        numerator_ = _subSet.length();
    }

    /**
     * @notice Returns the Diamond Storage pointer for `LoansPortfolioDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_LOANS_PORTFOLIO_STORAGE_POSITION`, following the ERC-2535
     *         Diamond Storage Pattern. Must only be called from within this library.
     * @return loansPortfolioData_  Storage pointer to the `LoansPortfolioDataStorage`
     *                              struct.
     */
    function _loansPortfolioStorage() private pure returns (LoansPortfolioDataStorage storage loansPortfolioData_) {
        bytes32 position = _LOANS_PORTFOLIO_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            loansPortfolioData_.slot := position
        }
    }
}
