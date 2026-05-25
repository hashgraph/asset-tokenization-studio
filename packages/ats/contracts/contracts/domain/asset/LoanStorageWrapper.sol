// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "../../facets/layer_2/loan/ILoan.sol";

/// @custom:hash storage Loan
bytes32 constant STORAGE_LOCATION_LOAN = 0x2af22e338cd16bdeda633a06c0ad54c1b9d04b19487a6b1ed48b48c18d643800;

/**
 * @title LoanDataStorage
 * @notice Backing storage for a single loan instrument's full lifecycle data.
 * @dev Enum-typed fields are stored as `uint8` for tight packing in region R2; the loan
 *      facet round-trips them through their respective `ILoan` enums on read/write.
 *      Mutated only through `LoanStorageWrapper` against the deterministic ERC-7201 slot.
 * @param initialized Whether the loan data has been initialised.
 * @param currency ISO 4217 currency code of the loan principal.
 * @param loanStructureType Packed `ILoan.LoanStructureType` discriminator.
 * @param repaymentType Packed `ILoan.RepaymentType` discriminator.
 * @param interestType Packed `ILoan.InterestType` discriminator.
 * @param baseReferenceRate Packed `ILoan.BaseReferenceRate` discriminator.
 * @param dayCount Packed `ILoan.DayCount` discriminator.
 * @param paymentFrequency Packed `ILoan.PaymentFrequency` discriminator.
 * @param utilizationFeeType Packed `ILoan.UtilizationFeeType` discriminator.
 * @param performanceStatus Packed `ILoan.PerformanceStatus` discriminator.
 * @param originatorAccount Account that originated the loan.
 * @param servicerAccount Account servicing the loan.
 * @param startingDate Unix timestamp at which the loan starts accruing.
 * @param maturityDate Unix timestamp at which the loan matures.
 * @param signingDate Unix timestamp at which the loan was signed.
 * @param floorRate Lower bound applied to the variable rate calculation.
 * @param capRate Upper bound applied to the variable rate calculation.
 * @param rateMargin Margin added to the base reference rate.
 * @param firstAccrualDate Unix timestamp of the first interest accrual.
 * @param prepaymentPenalty Penalty applied on prepayment.
 * @param commitmentFee Fee charged for the unused portion of a commitment.
 * @param utilizationFee Fee charged for the utilised portion.
 * @param servicingFee Fee paid to the servicer.
 * @param internalRiskGrade Free-form internal risk grade label.
 * @param defaultProbability Probability of default (basis points or modelled units).
 * @param lossGivenDefault Loss-given-default ratio (basis points or modelled units).
 * @param totalCollateralValue Aggregate value of the collateral securing the loan.
 * @param loanToValue Loan-to-value ratio (basis points or modelled units).
 * @param daysPastDue Number of days the loan has been past due.
 * @custom:storage-location erc7201:security.token.standard.storage.Loan
 */
struct LoanDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool initialized;
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    bytes3 currency;
    uint8 loanStructureType;
    uint8 repaymentType;
    uint8 interestType;
    uint8 baseReferenceRate;
    uint8 dayCount;
    uint8 paymentFrequency;
    uint8 utilizationFeeType;
    uint8 performanceStatus;
    address originatorAccount;
    address servicerAccount;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 startingDate;
    uint256 maturityDate;
    uint256 signingDate;
    uint256 floorRate;
    uint256 capRate;
    uint256 rateMargin;
    uint256 firstAccrualDate;
    uint256 prepaymentPenalty;
    uint256 commitmentFee;
    uint256 utilizationFee;
    uint256 servicingFee;
    string internalRiskGrade;
    uint256 defaultProbability;
    uint256 lossGivenDefault;
    uint256 totalCollateralValue;
    uint256 loanToValue;
    uint256 daysPastDue;

    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title LoanStorageWrapper
 * @notice Storage wrapper for loan management operations in the Diamond Pattern
 * @dev Uses unstructured storage with fixed slot position for upgradeable loan data
 * @author Hashgraph
 */
library LoanStorageWrapper {
    /**
     * @notice Initialises loan storage and writes the full loan details.
     * @dev Sets the `initialized` flag and delegates field-by-field writes to
     *      `_writeLoanDetails`. Intended to be called once per loan instrument.
     * @param _loanDetailsData The full loan details data to persist.
     */
    function initializeLoan(ILoan.LoanDetailsData calldata _loanDetailsData) internal {
        LoanDataStorage storage ls = _loanStorage();
        ls.initialized = true;
        _writeLoanDetails(_loanDetailsData, ls);
    }

    /**
     * @notice Overwrites the loan details and emits `LoanDetailsSet`.
     * @dev Used for post-initialisation updates; does not toggle the `initialized` flag.
     * @param _loanDetails The new loan details to persist.
     */
    function setLoanDetails(ILoan.LoanDetailsData memory _loanDetails) internal {
        _writeLoanDetails(_loanDetails, _loanStorage());
        emit ILoan.LoanDetailsSet(_loanDetails);
    }

    /**
     * @notice Reads the full loan details from storage and reconstructs the structured DTO.
     * @dev Re-hydrates packed `uint8` enum fields back into their `ILoan` enum counterparts.
     * @return loanDetails_ The reconstructed `ILoan.LoanDetailsData` view.
     */
    function getLoanDetails() internal view returns (ILoan.LoanDetailsData memory loanDetails_) {
        LoanDataStorage storage ls = _loanStorage();

        loanDetails_.loanBasicData = ILoan.LoanBasicData({
            currency: ls.currency,
            startingDate: ls.startingDate,
            maturityDate: ls.maturityDate,
            loanStructureType: ILoan.LoanStructureType(ls.loanStructureType),
            repaymentType: ILoan.RepaymentType(ls.repaymentType),
            interestType: ILoan.InterestType(ls.interestType),
            signingDate: ls.signingDate,
            originatorAccount: ls.originatorAccount,
            servicerAccount: ls.servicerAccount
        });

        loanDetails_.loanInterestData = ILoan.LoanInterestData({
            baseReferenceRate: ILoan.BaseReferenceRate(ls.baseReferenceRate),
            floorRate: ls.floorRate,
            capRate: ls.capRate,
            rateMargin: ls.rateMargin,
            dayCount: ILoan.DayCount(ls.dayCount),
            paymentFrequency: ILoan.PaymentFrequency(ls.paymentFrequency),
            firstAccrualDate: ls.firstAccrualDate,
            prepaymentPenalty: ls.prepaymentPenalty,
            commitmentFee: ls.commitmentFee,
            utilizationFee: ls.utilizationFee,
            utilizationFeeType: ILoan.UtilizationFeeType(ls.utilizationFeeType),
            servicingFee: ls.servicingFee
        });

        loanDetails_.riskData = ILoan.RiskData({
            internalRiskGrade: ls.internalRiskGrade,
            defaultProbability: ls.defaultProbability,
            lossGivenDefault: ls.lossGivenDefault
        });

        loanDetails_.collateral = ILoan.Collateral({
            totalCollateralValue: ls.totalCollateralValue,
            loanToValue: ls.loanToValue
        });

        loanDetails_.loanPerformanceStatus = ILoan.LoanPerformanceStatus({
            performanceStatus: ILoan.PerformanceStatus(ls.performanceStatus),
            daysPastDue: ls.daysPastDue
        });
    }

    /**
     * @notice Reports whether the loan storage has been initialised.
     * @return True once `initializeLoan` has been called, false otherwise.
     */
    function isLoanInitialized() internal view returns (bool) {
        return _loanStorage().initialized;
    }

    /**
     * @notice Persists every field of a `LoanDetailsData` DTO into storage.
     * @dev Enum-typed source fields are narrowed to `uint8` for tight packing in
     *      region R2 of the storage struct; readers re-hydrate them via casts.
     * @param _ld The loan details DTO to persist.
     * @param _ls Storage pointer to the loan storage struct.
     */
    function _writeLoanDetails(ILoan.LoanDetailsData memory _ld, LoanDataStorage storage _ls) private {
        _ls.currency = _ld.loanBasicData.currency;
        _ls.startingDate = _ld.loanBasicData.startingDate;
        _ls.maturityDate = _ld.loanBasicData.maturityDate;
        _ls.loanStructureType = uint8(_ld.loanBasicData.loanStructureType);
        _ls.repaymentType = uint8(_ld.loanBasicData.repaymentType);
        _ls.interestType = uint8(_ld.loanBasicData.interestType);
        _ls.signingDate = _ld.loanBasicData.signingDate;
        _ls.originatorAccount = _ld.loanBasicData.originatorAccount;
        _ls.servicerAccount = _ld.loanBasicData.servicerAccount;
        _ls.baseReferenceRate = uint8(_ld.loanInterestData.baseReferenceRate);
        _ls.floorRate = _ld.loanInterestData.floorRate;
        _ls.capRate = _ld.loanInterestData.capRate;
        _ls.rateMargin = _ld.loanInterestData.rateMargin;
        _ls.dayCount = uint8(_ld.loanInterestData.dayCount);
        _ls.paymentFrequency = uint8(_ld.loanInterestData.paymentFrequency);
        _ls.firstAccrualDate = _ld.loanInterestData.firstAccrualDate;
        _ls.prepaymentPenalty = _ld.loanInterestData.prepaymentPenalty;
        _ls.commitmentFee = _ld.loanInterestData.commitmentFee;
        _ls.utilizationFee = _ld.loanInterestData.utilizationFee;
        _ls.utilizationFeeType = uint8(_ld.loanInterestData.utilizationFeeType);
        _ls.servicingFee = _ld.loanInterestData.servicingFee;
        _ls.internalRiskGrade = _ld.riskData.internalRiskGrade;
        _ls.defaultProbability = _ld.riskData.defaultProbability;
        _ls.lossGivenDefault = _ld.riskData.lossGivenDefault;
        _ls.totalCollateralValue = _ld.collateral.totalCollateralValue;
        _ls.loanToValue = _ld.collateral.loanToValue;
        _ls.performanceStatus = uint8(_ld.loanPerformanceStatus.performanceStatus);
        _ls.daysPastDue = _ld.loanPerformanceStatus.daysPastDue;
    }

    /**
     * @notice Returns the storage pointer for loan data at the deterministic slot.
     * @dev Uses inline assembly to load the ERC-7201 slot from a precomputed constant.
     * @return loanData_ Storage pointer to `LoanDataStorage`.
     */
    function _loanStorage() private pure returns (LoanDataStorage storage loanData_) {
        bytes32 position = STORAGE_LOCATION_LOAN;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            loanData_.slot := position
        }
    }
}
