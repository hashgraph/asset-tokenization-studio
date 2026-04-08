// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface LoanDetailsViewModel extends QueryResponse {
  currency: string;
  startingDate: Date;
  maturityDate: Date;
  loanStructureType: number;
  repaymentType: number;
  interestType: number;
  signingDate: Date;
  originatorAccount: string;
  servicerAccount: string;
  baseReferenceRate: number;
  floorRate: string;
  capRate: string;
  rateMargin: string;
  dayCount: number;
  paymentFrequency: number;
  firstAccrualDate: Date;
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
}
