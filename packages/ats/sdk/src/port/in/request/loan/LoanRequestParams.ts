// SPDX-License-Identifier: Apache-2.0

export interface LoanBasicDataParams {
  currency: string;
  startingDate: string;
  maturityDate: string;
  loanStructureType: number;
  repaymentType: number;
  interestType: number;
  signingDate: string;
  originatorAccount: string;
  servicerAccount: string;
}

export interface LoanInterestDataParams {
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
}

export interface RiskDataParams {
  internalRiskGrade: string;
  defaultProbability: string;
  lossGivenDefault: string;
}

export interface CollateralParams {
  totalCollateralValue: string;
  loanToValue: string;
}

export interface LoanPerformanceStatusParams {
  performanceStatus: number;
  daysPastDue: string;
}
