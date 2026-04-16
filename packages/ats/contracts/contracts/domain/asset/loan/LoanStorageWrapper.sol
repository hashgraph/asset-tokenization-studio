// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOAN_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { ILoan } from "../../../facets/layer_2/loan/ILoan.sol";

/**
 * @title LoanStorageWrapper
 * @notice Storage wrapper for loan management operations in the Diamond Pattern
 * @dev Uses unstructured storage with fixed slot position for upgradeable loan data
 * @author Hashgraph
 */
library LoanStorageWrapper {
    struct LoanDataStorage {
        // LoanBasicData
        bytes3 currency;
        uint256 startingDate;
        uint256 maturityDate;
        uint8 loanStructureType;
        uint8 repaymentType;
        uint8 interestType;
        uint256 signingDate;
        address originatorAccount;
        address servicerAccount;
        // LoanInterestData
        uint8 baseReferenceRate;
        uint256 floorRate;
        uint256 capRate;
        uint256 rateMargin;
        uint8 dayCount;
        uint8 paymentFrequency;
        uint256 firstAccrualDate;
        uint256 prepaymentPenalty;
        uint256 commitmentFee;
        uint256 utilizationFee;
        uint8 utilizationFeeType;
        uint256 servicingFee;
        // RiskData
        string internalRiskGrade;
        uint256 defaultProbability;
        uint256 lossGivenDefault;
        // Collateral
        uint256 totalCollateralValue;
        uint256 loanToValue;
        // LoanPerformanceStatus
        uint8 performanceStatus;
        uint256 daysPastDue;
        // State
        bool initialized;
    }

    function initializeLoan(ILoan.LoanDetailsData calldata _loanDetailsData) internal {
        LoanDataStorage storage ls = _loanStorage();
        ls.initialized = true;
        _writeLoanDetails(_loanDetailsData, ls);
    }

    function setLoanDetails(ILoan.LoanDetailsData memory _loanDetails) internal {
        _writeLoanDetails(_loanDetails, _loanStorage());
        emit ILoan.LoanDetailsSet(_loanDetails);
    }

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

    function isLoanInitialized() internal view returns (bool) {
        return _loanStorage().initialized;
    }

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

    function _loanStorage() private pure returns (LoanDataStorage storage loanData_) {
        bytes32 position = _LOAN_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            loanData_.slot := position
        }
    }
}
