// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Loan
bytes32 constant RESOLVER_KEY_LOAN = 0x17c2126e932655e91a8e803b275de0a930c4b51a109b751567a95ee5d6bd6eba;

/**
 * @title  ILoan
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing on-chain loan metadata attached to a security token.
 * @dev    Stores a rich set of loan attributes (structure, interest, risk, collateral,
 *         and performance) that describe the underlying credit instrument. State-changing
 *         functions require `ROLE_LOAN_MANAGER`; initialisation requires
 *         `DEFAULT_ADMIN_ROLE` and is callable only once.
 */
interface ILoan {
    /// @notice Classifies the facility structure of the loan.
    enum LoanStructureType {
        RCF, // Revolving Credit Facility
        TERM_LOAN // Fixed-draw term loan
    }

    /// @notice Classifies how principal is repaid over the life of the loan.
    enum RepaymentType {
        BULLET, // Full principal repaid at maturity
        AMORTIZING // Principal repaid in scheduled instalments
    }

    /// @notice Classifies the interest-rate regime applied to the loan.
    enum InterestType {
        FIXED // Rate is fixed for the life of the loan
    }

    /// @notice Day-count convention used for interest accrual calculations.
    enum DayCount {
        ACTUAL360 // Actual days elapsed over a 360-day year
    }

    /// @notice Reference rate used as a base for floating-rate loans.
    enum BaseReferenceRate {
        NONE, // No external reference rate (fixed rate)
        EURIBOR, // Euro Interbank Offered Rate
        _3M // 3-month reference rate
    }

    /// @notice Frequency at which interest payments are due.
    enum PaymentFrequency {
        MONTHLY,
        QUARTERLY,
        YEARLY
    }

    /// @notice Determines whether the utilisation fee is bundled with interest or invoiced separately.
    enum UtilizationFeeType {
        EMBEDDED, // Fee included in the interest rate
        SEPARATE // Fee invoiced as a distinct line item
    }

    /// @notice Describes the current repayment performance of the loan.
    enum PerformanceStatus {
        PERFORMING, // Borrower is current on all obligations
        NON_PERFORMING, // Borrower has missed one or more payments
        DEFAULT // Borrower is in formal default
    }

    /**
     * @notice Full loan descriptor aggregating all sub-structs.
     * @param loanBasicData          Core facility and party information.
     * @param loanInterestData       Interest rate, fees, and payment schedule.
     * @param riskData               Internal credit risk metrics.
     * @param collateral             Collateral value and loan-to-value ratio.
     * @param loanPerformanceStatus  Current repayment performance classification.
     */
    struct LoanDetailsData {
        LoanBasicData loanBasicData;
        LoanInterestData loanInterestData;
        RiskData riskData;
        Collateral collateral;
        LoanPerformanceStatus loanPerformanceStatus;
    }

    /**
     * @notice Core facility terms and party identifiers.
     * @param currency           ISO 4217 alpha-3 currency code (e.g. `"EUR"`).
     * @param startingDate       Unix timestamp of the loan draw-down date.
     * @param maturityDate       Unix timestamp of the scheduled final repayment date.
     * @param loanStructureType  Facility structure (RCF or term loan).
     * @param repaymentType      Principal repayment schedule (bullet or amortizing).
     * @param interestType       Interest regime (currently only `FIXED`).
     * @param signingDate        Unix timestamp when the loan agreement was signed.
     * @param originatorAccount  Address of the entity that originated the loan.
     * @param servicerAccount    Address of the entity responsible for loan servicing.
     */
    struct LoanBasicData {
        bytes3 currency;
        uint256 startingDate;
        uint256 maturityDate;
        LoanStructureType loanStructureType;
        RepaymentType repaymentType;
        InterestType interestType;
        uint256 signingDate;
        address originatorAccount;
        address servicerAccount;
    }

    /**
     * @notice Interest rate parameters, fee schedule, and payment cadence.
     * @param baseReferenceRate  External reference rate index (or `NONE` for fixed).
     * @param floorRate          Minimum effective interest rate (scaled integer).
     * @param capRate            Maximum effective interest rate (scaled integer).
     * @param rateMargin         Spread added to the base reference rate (scaled integer).
     * @param dayCount           Day-count convention for accrual calculations.
     * @param paymentFrequency   How often interest payments are due.
     * @param firstAccrualDate   Unix timestamp of the first interest accrual date.
     * @param prepaymentPenalty  Fee charged on early repayment (scaled integer).
     * @param commitmentFee      Fee on undrawn RCF capacity (scaled integer).
     * @param utilizationFee     Fee on drawn capacity (scaled integer).
     * @param utilizationFeeType Whether the utilisation fee is embedded or separate.
     * @param servicingFee       Fee charged by the servicer (scaled integer).
     */
    struct LoanInterestData {
        BaseReferenceRate baseReferenceRate;
        uint256 floorRate;
        uint256 capRate;
        uint256 rateMargin;
        DayCount dayCount;
        PaymentFrequency paymentFrequency;
        uint256 firstAccrualDate;
        uint256 prepaymentPenalty;
        uint256 commitmentFee;
        uint256 utilizationFee;
        UtilizationFeeType utilizationFeeType;
        uint256 servicingFee;
    }

    /**
     * @notice Internal credit risk assessment metrics.
     * @param internalRiskGrade   Lender-assigned risk grade string.
     * @param defaultProbability  Probability of default (scaled integer).
     * @param lossGivenDefault    Expected loss fraction if default occurs (scaled integer).
     */
    struct RiskData {
        string internalRiskGrade;
        uint256 defaultProbability;
        uint256 lossGivenDefault;
    }

    /**
     * @notice Collateral coverage metrics for the loan.
     * @param totalCollateralValue Aggregate market value of pledged collateral (scaled integer).
     * @param loanToValue          Ratio of outstanding principal to collateral value (scaled integer).
     */
    struct Collateral {
        uint256 totalCollateralValue;
        uint256 loanToValue;
    }

    /**
     * @notice Current repayment performance classification.
     * @param performanceStatus Current `PerformanceStatus` of the loan.
     * @param daysPastDue       Number of calendar days since the earliest missed payment.
     */
    struct LoanPerformanceStatus {
        PerformanceStatus performanceStatus;
        uint256 daysPastDue;
    }

    /// @notice Emitted once when the Loan capability is initialised on a token.
    /// @dev Fires exclusively from `initializeLoan` after the storage write succeeds.
    /// @param loanDetailsData The full loan descriptor written at initialisation.
    event LoanInitialized(LoanDetailsData loanDetailsData);

    /**
     * @notice Emitted when the loan details are updated by an authorised manager.
     * @param loanDetails The updated loan descriptor.
     */
    event LoanDetailsSet(LoanDetailsData loanDetails);

    /**
     * @notice Initialises the loan capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     *      Reverts if `startingDate` is invalid or `startingDate >= maturityDate`.
     * @param _loanDetailsData Full loan descriptor to persist at initialisation.
     */
    function initializeLoan(LoanDetailsData calldata _loanDetailsData) external;

    /**
     * @notice Updates the loan details.
     * @dev Requires `ROLE_LOAN_MANAGER`. Token must be operational, activated, and unpaused.
     *      All timestamps are validated; `originatorAccount` and `servicerAccount` must be
     *      non-zero. Emits {LoanDetailsSet} on success.
     * @param _loanDetailsData Updated loan descriptor to persist.
     */
    function setLoanDetails(LoanDetailsData calldata _loanDetailsData) external;

    /**
     * @notice Returns the current loan details.
     * @return loanDetailsData_ The full loan descriptor currently stored on the token.
     */
    function getLoanDetails() external view returns (LoanDetailsData memory loanDetailsData_);
}
