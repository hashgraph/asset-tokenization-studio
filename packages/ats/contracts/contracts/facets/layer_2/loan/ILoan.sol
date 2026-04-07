// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";

interface ILoan {
    struct LoanDetailsData {
        LoanBasicData loanBasicData;
        LoanInterestData loanInterestData;
        RiskData riskData;
        Collateral collateral;
        LoanPerformanceStatus loanPerformanceStatus;
    }

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

    enum LoanStructureType {
        RCF,
        TERM_LOAN
    }

    enum RepaymentType {
        BULLET,
        AMORTIZING
    }

    enum InterestType {
        FIXED
    }

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

    enum DayCount {
        ACTUAL360
    }

    enum BaseReferenceRate {
        NONE,
        EURIBOR,
        _3M
    }

    enum PaymentFrequency {
        MONTHLY,
        QUARTERLY,
        YEARLY
    }

    enum UtilizationFeeType {
        EMBEDDED,
        SEPARATE
    }

    struct RiskData {
        string internalRiskGrade;
        uint256 defaultProbability;
        uint256 lossGivenDefault;
    }

    struct Collateral {
        uint256 totalCollateralValue;
        uint256 loanToValue;
    }

    struct LoanPerformanceStatus {
        PerformanceStatus performanceStatus;
        uint256 daysPastDue;
    }

    enum PerformanceStatus {
        PERFORMING,
        NON_PERFORMING,
        DEFAULT
    }

    event LoanDetailsSet(LoanDetailsData loanDetails);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_Loan(
        LoanDetailsData calldata _loanDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external;

    /**
     * @dev Set the loan details
     *
     * @param loanDetailsData_ the loan details to set
     */
    function setLoanDetails(LoanDetailsData calldata loanDetailsData_) external;

    /**
     * @dev Retrieves the loan details
     *
     * @return loanDetailsData_ the loan details
     */
    function getLoanDetails() external view returns (LoanDetailsData memory loanDetailsData_);
}
