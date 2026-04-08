// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import { SecurityDate } from "../shared/SecurityDate";

export class LoanDetails extends ValidatedDomain<LoanDetails> {
  // LoanBasicData
  currency: string;
  startingDate: number;
  maturityDate: number;
  loanStructureType: LoanStructureType;
  repaymentType: RepaymentType;
  interestType: InterestType;
  signingDate: number;
  originatorAccount: string;
  servicerAccount: string;
  // LoanInterestData
  baseReferenceRate: BaseReferenceRate;
  floorRate: number;
  capRate: number;
  rateMargin: number;
  dayCount: DayCount;
  paymentFrequency: PaymentFrequency;
  firstAccrualDate: number;
  prepaymentPenalty: number;
  commitmentFee: number;
  utilizationFee: number;
  utilizationFeeType: UtilizationFeeType;
  servicingFee: number;
  // RiskData
  internalRiskGrade: string;
  defaultProbability: number;
  lossGivenDefault: number;
  // Collateral
  totalCollateralValue: number;
  loanToValue: number;
  // LoanPerformanceStatus
  performanceStatus: PerformanceStatus;
  daysPastDue: number;

  constructor(
    currency: string,
    startingDate: number,
    maturityDate: number,
    loanStructureType: LoanStructureType,
    repaymentType: RepaymentType,
    interestType: InterestType,
    signingDate: number,
    originatorAccount: string,
    servicerAccount: string,
    baseReferenceRate: BaseReferenceRate,
    floorRate: number,
    capRate: number,
    rateMargin: number,
    dayCount: DayCount,
    paymentFrequency: PaymentFrequency,
    firstAccrualDate: number,
    prepaymentPenalty: number,
    commitmentFee: number,
    utilizationFee: number,
    utilizationFeeType: UtilizationFeeType,
    servicingFee: number,
    internalRiskGrade: string,
    defaultProbability: number,
    lossGivenDefault: number,
    totalCollateralValue: number,
    loanToValue: number,
    performanceStatus: PerformanceStatus,
    daysPastDue: number,
  ) {
    super({
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(val, this.startingDate);
      },
    });

    this.currency = currency;
    this.startingDate = startingDate;
    this.maturityDate = maturityDate;
    this.loanStructureType = loanStructureType;
    this.repaymentType = repaymentType;
    this.interestType = interestType;
    this.signingDate = signingDate;
    this.originatorAccount = originatorAccount;
    this.servicerAccount = servicerAccount;
    this.baseReferenceRate = baseReferenceRate;
    this.floorRate = floorRate;
    this.capRate = capRate;
    this.rateMargin = rateMargin;
    this.dayCount = dayCount;
    this.paymentFrequency = paymentFrequency;
    this.firstAccrualDate = firstAccrualDate;
    this.prepaymentPenalty = prepaymentPenalty;
    this.commitmentFee = commitmentFee;
    this.utilizationFee = utilizationFee;
    this.utilizationFeeType = utilizationFeeType;
    this.servicingFee = servicingFee;
    this.internalRiskGrade = internalRiskGrade;
    this.defaultProbability = defaultProbability;
    this.lossGivenDefault = lossGivenDefault;
    this.totalCollateralValue = totalCollateralValue;
    this.loanToValue = loanToValue;
    this.performanceStatus = performanceStatus;
    this.daysPastDue = daysPastDue;

    ValidatedDomain.handleValidation(LoanDetails.name, this);
  }
}

export enum LoanStructureType {
  RCF = 0,
  TERM_LOAN = 1,
}

export enum RepaymentType {
  BULLET = 0,
  AMORTIZING = 1,
}

export enum InterestType {
  FIXED = 0,
}

export enum DayCount {
  ACTUAL360 = 0,
}

export enum BaseReferenceRate {
  NONE = 0,
  EURIBOR = 1,
  _3M = 2,
}

export enum PaymentFrequency {
  MONTHLY = 0,
  QUARTERLY = 1,
  YEARLY = 2,
}

export enum UtilizationFeeType {
  EMBEDDED = 0,
  SEPARATE = 1,
}

export enum PerformanceStatus {
  PERFORMING = 0,
  NON_PERFORMING = 1,
  DEFAULT = 2,
}
