// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";
import { SecurityDate } from "@domain/context/shared/SecurityDate";
import {
  LoanBasicDataParams,
  LoanInterestDataParams,
  RiskDataParams,
  CollateralParams,
  LoanPerformanceStatusParams,
} from "./LoanRequestParams";

export default class SetLoanDetailsRequest extends ValidatedRequest<SetLoanDetailsRequest> {
  loanId: string;
  // LoanBasicData
  currency: string;
  startingDate: string;
  maturityDate: string;
  loanStructureType: number;
  repaymentType: number;
  interestType: number;
  signingDate: string;
  originatorAccount: string;
  servicerAccount: string;
  // LoanInterestData
  baseReferenceRate: number;
  floorRate: string;
  capRate: string;
  rateMargin: string;
  dayCount: number;
  paymentFrequency: number;
  firstAccrualDate: string;
  prepaymentPenalty: string;
  commitmentFee: string;
  utilizationFee: string;
  utilizationFeeType: number;
  servicingFee: string;
  // RiskData
  internalRiskGrade: string;
  defaultProbability: string;
  lossGivenDefault: string;
  // Collateral
  totalCollateralValue: string;
  loanToValue: string;
  // LoanPerformanceStatus
  performanceStatus: number;
  daysPastDue: string;

  constructor({
    loanId,
    loanBasicData,
    loanInterestData,
    riskData,
    collateral,
    loanPerformanceStatus,
  }: {
    loanId: string;
    loanBasicData: LoanBasicDataParams;
    loanInterestData: LoanInterestDataParams;
    riskData: RiskDataParams;
    collateral: CollateralParams;
    loanPerformanceStatus: LoanPerformanceStatusParams;
  }) {
    super({
      loanId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      currency: FormatValidation.checkBytes3Format(),
      startingDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(loanBasicData.maturityDate));
      },
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(loanBasicData.startingDate), undefined);
      },
      originatorAccount: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      servicerAccount: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.loanId = loanId;
    // LoanBasicData
    this.currency = loanBasicData.currency;
    this.startingDate = loanBasicData.startingDate;
    this.maturityDate = loanBasicData.maturityDate;
    this.loanStructureType = loanBasicData.loanStructureType;
    this.repaymentType = loanBasicData.repaymentType;
    this.interestType = loanBasicData.interestType;
    this.signingDate = loanBasicData.signingDate;
    this.originatorAccount = loanBasicData.originatorAccount;
    this.servicerAccount = loanBasicData.servicerAccount;
    // LoanInterestData
    this.baseReferenceRate = loanInterestData.baseReferenceRate;
    this.floorRate = loanInterestData.floorRate;
    this.capRate = loanInterestData.capRate;
    this.rateMargin = loanInterestData.rateMargin;
    this.dayCount = loanInterestData.dayCount;
    this.paymentFrequency = loanInterestData.paymentFrequency;
    this.firstAccrualDate = loanInterestData.firstAccrualDate;
    this.prepaymentPenalty = loanInterestData.prepaymentPenalty;
    this.commitmentFee = loanInterestData.commitmentFee;
    this.utilizationFee = loanInterestData.utilizationFee;
    this.utilizationFeeType = loanInterestData.utilizationFeeType;
    this.servicingFee = loanInterestData.servicingFee;
    // RiskData
    this.internalRiskGrade = riskData.internalRiskGrade;
    this.defaultProbability = riskData.defaultProbability;
    this.lossGivenDefault = riskData.lossGivenDefault;
    // Collateral
    this.totalCollateralValue = collateral.totalCollateralValue;
    this.loanToValue = collateral.loanToValue;
    // LoanPerformanceStatus
    this.performanceStatus = loanPerformanceStatus.performanceStatus;
    this.daysPastDue = loanPerformanceStatus.daysPastDue;
  }
}
