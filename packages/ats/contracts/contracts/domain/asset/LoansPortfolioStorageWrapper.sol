// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { ILoan } from "../../facets/loan/ILoan.sol";
import { IERC1410Types } from "../../facets/commonTypes/IERC1410Types.sol";
import { ILoansPortfolio } from "../../facets/loansPortfolio/ILoansPortfolio.sol";
import { ITransferByPartition } from "../../facets/transferByPartition/ITransferByPartition.sol";
import { IBalanceTrackerByPartition } from "../../facets/balanceTrackerByPartition/IBalanceTrackerByPartition.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ScheduledTasksOps } from "../orchestrator/ScheduledTasksOps.sol";

/// @custom:hash storage LoansPortfolio
bytes32 constant STORAGE_LOCATION_LOANS_PORTFOLIO = 0x5981f3997a6cf8235e2e8b5dd35e430c9a70b916501c3c7672c830ad91b0d400;

/**
 * @title LoansPortfolioDataStorage
 * @notice Data structure representing the entire loans portfolio storage.
 * @dev Backing storage for the loans portfolio facet. Loan classification sets
 *      (secured / non-secured, performing / non-performing / defaulted)
 *      are maintained in lockstep with the master `loanHoldingsAssets` set;
 *      mutations must keep all derived sets consistent.
 * @param portfolioType The type of the portfolio (e.g., SECURED, UNSECURED).
 * @param distributionPolicy The distribution policy applied to the portfolio (e.g., PRO_RATA).
 * @param holdingsAssets Set of all holding asset addresses (loans and cash).
 * @param loanHoldingsAssets Set of all loan holding asset addresses.
 * @param cashHoldingsAssets Set of all cash holding asset addresses.
 * @param securedLoanHoldingsAssets Set of loan addresses that are collateralised.
 * @param nonSecuredLoanHoldingsAssets Set of loan addresses that are not collateralised.
 * @param performingLoanHoldingsAssets Set of loan addresses currently performing.
 * @param nonPerformingLoanHoldingsAssets Set of loan addresses currently non-performing.
 * @param defaultedLoanHoldingsAssets Set of loan addresses that have defaulted.
 * @custom:storage-location erc7201:security.token.standard.storage.LoansPortfolio
 */
struct LoansPortfolioDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    ILoansPortfolio.PortfolioType portfolioType;
    ILoansPortfolio.DistributionPolicy distributionPolicy;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    EnumerableSet.AddressSet holdingsAssets;
    EnumerableSet.AddressSet loanHoldingsAssets;
    EnumerableSet.AddressSet cashHoldingsAssets;
    EnumerableSet.AddressSet securedLoanHoldingsAssets;
    EnumerableSet.AddressSet nonSecuredLoanHoldingsAssets;
    EnumerableSet.AddressSet performingLoanHoldingsAssets;
    EnumerableSet.AddressSet nonPerformingLoanHoldingsAssets;
    EnumerableSet.AddressSet defaultedLoanHoldingsAssets;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title LoansPortfolioStorageWrapper
 * @notice Library providing storage management and query functions for a loans portfolio.
 * @dev Manages the storage layout of a loans portfolio via a predefined storage slot.
 *      Handles both loan and cash holdings asset sets, and classifies loans by collateral
 *      and performance status. Uses EnumerableSet
 *      for gas-efficient membership checks and iteration.
 * @author Asset Tokenization Studio Team
 */
library LoansPortfolioStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.AddressSet;

    /**
     * @notice Initialises the loans portfolio storage with the provided details.
     * @dev Stores the portfolio type and distribution policy.
     * @param _loansPortfolioData The portfolio details containing type and distribution policy.
     */
    function initializeLoansPortfolio(ILoansPortfolio.LoansPortfolioDetailsData calldata _loansPortfolioData) internal {
        storeLoansPortfolioDetails(_loansPortfolioData);
    }

    /**
     * @notice Stores or updates the portfolio type and distribution policy in storage.
     * @dev Overwrites the portfolio type and distribution policy directly in storage.
     * @param _loansPortfolioDetails Memory struct containing the new portfolio type and distribution policy.
     */
    function storeLoansPortfolioDetails(
        ILoansPortfolio.LoansPortfolioDetailsData memory _loansPortfolioDetails
    ) internal {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        LoansPortfolioDataStorage storage s = loansPortfolioStorage();
        s.portfolioType = _loansPortfolioDetails.portfolioType;
        s.distributionPolicy = _loansPortfolioDetails.distributionPolicy;
    }

    /**
     * @notice Adds a holding asset (loan or cash) to the portfolio.
     * @dev Reverts if the asset already exists in the holdings set. If the asset type is LOAN,
     *      it is classified by collateral and performance status; otherwise it is added to cash holdings.
     *      Emits a `HoldingsAssetAdded` event.
     * @param _holdingsAsset The holding asset structure including address and type.
     * @custom:error HoldingsAssetAlreadyExists If the asset address already exists in the portfolio.
     */
    function addHoldingsAsset(ILoansPortfolio.HoldingsAsset memory _holdingsAsset) internal {
        ILoansPortfolio.HoldingsAssetType holdingsAssetType = _holdingsAsset.holdingsAssetType;
        LoansPortfolioDataStorage storage loanPortfolioStorage = loansPortfolioStorage();
        if (loanPortfolioStorage.holdingsAssets.contains(_holdingsAsset.assetAddress)) {
            revert ILoansPortfolio.HoldingsAssetAlreadyExists(_holdingsAsset.assetAddress);
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
     * @notice Removes a holding asset from the portfolio.
     * @dev Checks that the asset exists, then removes it from the appropriate subsets
     *      (loan or cash) and from the master holdings set. Emits a `HoldingsAssetRemoved` event.
     * @param _holdingsAsset The holding asset structure to remove.
     * @custom:error HoldingAssetNotFound If the asset address is not present in the portfolio.
     */
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

    /**
     * @notice Updates the classification of a loan holding asset after its details change.
     * @dev Reclassifies the loan based on its current collateral and performance status.
     *      Removes the loan from all collateral and performance subsets before re-adding.
     *      Emits a `LoanHoldingsAssetUpdated` event.
     * @param _holdingsAssetAddress The address of the loan to reclassify.
     * @custom:error HoldingAssetNotFound If the asset address is not in the portfolio.
     */
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

    /**
     * @notice Withdraws a specified amount of a holding asset from the portfolio.
     * @dev Uses the `transferByPartition` function on the target ERC1410 token.
     *      Reverts if the amount is zero or if the asset does not exist in the portfolio.
     *      Emits a `LoansPortfolioWithdrawn` event.
     * @param _assetAddress The ERC1410 token address to withdraw.
     * @param _to The recipient address.
     * @param _amount The amount to withdraw (must be > 0).
     * @return success_ True if the withdrawal succeeded.
     * @custom:error ZeroValue If `_amount` is zero.
     * @custom:error HoldingAssetNotFound If the asset address is not in the portfolio.
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
        ITransferByPartition(_assetAddress).transferByPartition(_DEFAULT_PARTITION, transferInfo, "");
        emit ILoansPortfolio.LoansPortfolioWithdrawn(_assetAddress, _to, _amount);
        success_ = true;
    }

    /**
     * @notice Checks whether a given asset address exists in the holdings set.
     * @dev Reverts with `HoldingAssetNotFound` if the asset is not present.
     * @param _assetAddress The address to check.
     * @custom:error HoldingAssetNotFound If the asset address is missing from the holdings set.
     */
    function checkHoldingAssetExists(address _assetAddress) internal view {
        if (!loansPortfolioStorage().holdingsAssets.contains(_assetAddress)) {
            revert ILoansPortfolio.HoldingAssetNotFound(_assetAddress);
        }
    }

    /**
     * @notice Returns the stored portfolio type and distribution policy.
     * @return loansPortfolioDetails_ A struct containing the portfolio type and distribution policy.
     */
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

    /**
     * @notice Returns the ratio of secured loans to total loans.
     * @dev The ratio is expressed as a numerator (number of secured loans) and denominator (total loans).
     * @return numerator_ Number of secured loans.
     * @return denominator_ Total number of loans in the portfolio.
     */
    function getSecuredLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(loansPortfolioStorage().securedLoanHoldingsAssets);
    }

    /**
     * @notice Returns the ratio of performing loans to total loans.
     * @dev The ratio is expressed as a numerator (number of performing loans) and denominator (total loans).
     * @return numerator_ Number of performing loans.
     * @return denominator_ Total number of loans in the portfolio.
     */
    function getPerformingLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(loansPortfolioStorage().performingLoanHoldingsAssets);
    }

    /**
     * @notice Returns the ratio of non-performing loans to total loans.
     * @dev The ratio is expressed as a numerator (number of non-performing loans) and denominator (total loans).
     * @return numerator_ Number of non-performing loans.
     * @return denominator_ Total number of loans in the portfolio.
     */
    function getNonPerformingLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(loansPortfolioStorage().nonPerformingLoanHoldingsAssets);
    }

    /**
     * @notice Returns the ratio of defaulted loans to total loans.
     * @dev The ratio is expressed as a numerator (number of defaulted loans) and denominator (total loans).
     * @return numerator_ Number of defaulted loans.
     * @return denominator_ Total number of loans in the portfolio.
     */
    function getDefaultedLoansRatio() internal view returns (uint256 numerator_, uint256 denominator_) {
        return _getLoanRatioFor(loansPortfolioStorage().defaultedLoanHoldingsAssets);
    }

    /**
     * @notice Returns the number of performing loans in the portfolio.
     * @return numberOfPerformingLoans_ Count of performing loan holdings.
     */
    function getNumberOfPerformingLoans() internal view returns (uint256 numberOfPerformingLoans_) {
        numberOfPerformingLoans_ = loansPortfolioStorage().performingLoanHoldingsAssets.length();
    }

    /**
     * @notice Returns the number of non-performing loans in the portfolio.
     * @return numberOfNonPerformingLoans_ Count of non-performing loan holdings.
     */
    function getNumberOfNonPerformingLoans() internal view returns (uint256 numberOfNonPerformingLoans_) {
        numberOfNonPerformingLoans_ = loansPortfolioStorage().nonPerformingLoanHoldingsAssets.length();
    }

    /**
     * @notice Returns the number of defaulted loans in the portfolio.
     * @return numberDefaultedLoans_ Count of defaulted loan holdings.
     */
    function getNumberDefaultedLoans() internal view returns (uint256 numberDefaultedLoans_) {
        numberDefaultedLoans_ = loansPortfolioStorage().defaultedLoanHoldingsAssets.length();
    }

    /**
     * @notice Returns the total number of assets (loans and cash) in the portfolio.
     * @return numberOfAssets_ Count of all holding assets.
     */
    function getNumberOfAssets() internal view returns (uint256 numberOfAssets_) {
        numberOfAssets_ = loansPortfolioStorage().holdingsAssets.length();
    }

    /**
     * @notice Returns the number of loan holding assets in the portfolio.
     * @return numberOfLoans_ Count of loan holdings.
     */
    function getNumberOfLoans() internal view returns (uint256 numberOfLoans_) {
        numberOfLoans_ = loansPortfolioStorage().loanHoldingsAssets.length();
    }

    /**
     * @notice Returns the number of cash holding assets in the portfolio.
     * @return numberOfCash_ Count of cash holdings.
     */
    function getNumberOfCash() internal view returns (uint256 numberOfCash_) {
        numberOfCash_ = loansPortfolioStorage().cashHoldingsAssets.length();
    }

    /**
     * @notice Returns a paginated list of all holding asset addresses.
     * @dev Uses the `Pagination` library to slice the `holdingsAssets` set.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Number of elements per page.
     * @return assets_ Array of asset addresses for the requested page.
     */
    function getHoldingsAssets(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_) {
        assets_ = loansPortfolioStorage().holdingsAssets.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns a paginated list of loan holding asset addresses.
     * @dev Uses the `Pagination` library to slice the `loanHoldingsAssets` set.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Number of elements per page.
     * @return assets_ Array of loan asset addresses for the requested page.
     */
    function getLoanHoldingsAssetsPaginated(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_) {
        assets_ = loansPortfolioStorage().loanHoldingsAssets.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns a paginated list of holding asset addresses along with their token balances.
     * @dev For each asset, retrieves the balance of the `_DEFAULT_PARTITION` partition held by this contract.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Number of elements per page.
     * @return assets_ Array of asset addresses for the requested page.
     * @return tokenBalances_ Array of corresponding token balances.
     */
    function getHoldingsAssetBalances(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory assets_, uint256[] memory tokenBalances_) {
        assets_ = loansPortfolioStorage().holdingsAssets.getFromSet(_pageIndex, _pageLength);
        uint256 arraySize = assets_.length;
        tokenBalances_ = new uint256[](arraySize);
        for (uint256 i; i < arraySize; ) {
            tokenBalances_[i] = IBalanceTrackerByPartition(assets_[i]).balanceOfByPartition(
                _DEFAULT_PARTITION,
                address(this)
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Returns the storage slot for the loans portfolio data.
     * @dev Uses inline assembly to load the storage pointer from the constant position
     *      `STORAGE_LOCATION_LOANS_PORTFOLIO`.
     * @return loansPortfolioData_ Reference to the `LoansPortfolioDataStorage` struct in storage.
     */
    function loansPortfolioStorage() internal pure returns (LoansPortfolioDataStorage storage loansPortfolioData_) {
        bytes32 position = STORAGE_LOCATION_LOANS_PORTFOLIO;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            loansPortfolioData_.slot := position
        }
    }

    /**
     * @notice Adds a loan asset to the loan holdings set and classifies it by collateral and performance.
     * @dev Fetches loan details, adds the address to the loan set, classifies by collateral,
     *      then by performance status.
     * @param _loanPortfolioStorage Reference to the portfolio storage struct.
     * @param _loanAddress Address of the loan contract.
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
    }

    /**
     * @notice Inserts a loan address into the appropriate performance-status set.
     * @dev Based on `PerformanceStatus`: `PERFORMING` → `performingLoanHoldingsAssets`,
     *      `NON_PERFORMING` → `nonPerformingLoanHoldingsAssets`, else `defaultedLoanHoldingsAssets`.
     * @param _loanPortfolioStorage Reference to the portfolio storage struct.
     * @param _loanAddress Address of the loan contract.
     * @param _performanceStatus The current performance status of the loan.
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
     * @notice Removes a loan asset from all loan‑related sets.
     * @dev Removes the address from the main loan holdings set, the collateral sets,
     *      and the performance status sets.
     * @param _loanPortfolioStorage Reference to the portfolio storage struct.
     * @param _loanAddress Address of the loan contract to remove.
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
    }

    /**
     * @notice Removes a loan address from all three performance-status sets.
     * @dev Safe to call even if the address is not present in a given set.
     * @param _loanPortfolioStorage Reference to the portfolio storage struct.
     * @param _loanAddress Address of the loan contract.
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
     * @notice Classifies a loan as secured or non-secured based on total collateral value.
     * @dev If `_totalCollateralValue > 0`, adds the loan to `securedLoanHoldingsAssets`;
     *      otherwise to `nonSecuredLoanHoldingsAssets`.
     * @param _s Reference to the portfolio storage struct.
     * @param _loanAddress Address of the loan contract.
     * @param _totalCollateralValue The total collateral value of the loan.
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
     * @notice Computes the ratio of a subset to the total number of loan holdings.
     * @dev Returns (0,0) if the total number of loan holdings is zero to avoid division by zero.
     * @param _subSet The subset of loan holdings (e.g., secured, performing).
     * @return numerator_ Cardinality of the subset.
     * @return denominator_ Cardinality of the total loan holdings set.
     */
    function _getLoanRatioFor(
        EnumerableSet.AddressSet storage _subSet
    ) private view returns (uint256 numerator_, uint256 denominator_) {
        denominator_ = loansPortfolioStorage().loanHoldingsAssets.length();
        if (denominator_ == 0) return (0, 0);
        numerator_ = _subSet.length();
    }
}
