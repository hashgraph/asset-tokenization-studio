// SPDX-License-Identifier: Apache-2.0

import { LoanDetails } from "./LoanDetails";

export function toLoanDetails(data: {
  currency: string;
  startingDate: string;
  maturityDate: string;
  loanStructureType: number;
  repaymentType: number;
  interestType: number;
  signingDate: string;
  originatorAccount: string;
  servicerAccount: string;
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
  internalRiskGrade: string;
  defaultProbability: string;
  lossGivenDefault: string;
  totalCollateralValue: string;
  loanToValue: string;
  performanceStatus: number;
  daysPastDue: string;
}): LoanDetails {
  return new LoanDetails(
    data.currency,
    parseInt(data.startingDate),
    parseInt(data.maturityDate),
    data.loanStructureType,
    data.repaymentType,
    data.interestType,
    parseInt(data.signingDate),
    data.originatorAccount,
    data.servicerAccount,
    data.baseReferenceRate,
    parseInt(data.floorRate),
    parseInt(data.capRate),
    parseInt(data.rateMargin),
    data.dayCount,
    data.paymentFrequency,
    parseInt(data.firstAccrualDate),
    parseInt(data.prepaymentPenalty),
    parseInt(data.commitmentFee),
    parseInt(data.utilizationFee),
    data.utilizationFeeType,
    parseInt(data.servicingFee),
    data.internalRiskGrade,
    parseInt(data.defaultProbability),
    parseInt(data.lossGivenDefault),
    parseInt(data.totalCollateralValue),
    parseInt(data.loanToValue),
    data.performanceStatus,
    parseInt(data.daysPastDue),
  );
}
