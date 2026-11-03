// SPDX-License-Identifier: Apache-2.0

/**
 * Loan facet test data.
 *
 * The Loan asset type is no longer deployed through the production factory (BBND-1882), but the
 * LoanFacet still exists and is exercised here against the shared AssetMock mega-asset. This
 * module co-locates the loan test data with its sole consumer (`loan.test.ts`): the default loan
 * parameters and the `getLoanDetails` builder that produces `setLoanDetails` input.
 */

import { ethers } from "hardhat";
import { DeepPartial, TIME_PERIODS_S } from "@scripts";
import { DEFAULT_BOND_PARAMS, getDltTimestamp } from "@test";

/**
 * Default loan parameters used by `getLoanDetails`.
 */
export const DEFAULT_LOAN_PARAMS = {
  currency: "0x555344", // USD
  loanStructureType: 1, // TERM_LOAN
  repaymentType: 0, // BULLET
  interestType: 0, // FIXED
  baseReferenceRate: 0, // NONE
  floorRate: 0,
  capRate: 0,
  rateMargin: 0,
  dayCount: 0, // ACTUAL360
  paymentFrequency: 0, // MONTHLY
  prepaymentPenalty: 0,
  commitmentFee: 0,
  utilizationFee: 0,
  utilizationFeeType: 0, // EMBEDDED
  servicingFee: 0,
  internalRiskGrade: "test",
  defaultProbability: 0,
  lossGivenDefault: 0,
  totalCollateralValue: 0,
  loanToValue: 0,
  performanceStatus: 0, // PERFORMING
  daysPastDue: 0,
  originatorAccount: async () => {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  },
  servicerAccount: async () => {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  },
  startingDate: async () => {
    return (await getDltTimestamp()) + 3600; // block.timestamp + 1 hour
  },
} as const;

interface LoanInitData {
  // LoanBasicData
  currency: string;
  startingDate: number;
  maturityDate: number;
  loanStructureType: number;
  repaymentType: number;
  interestType: number;
  signingDate: number;
  originatorAccount: string;
  servicerAccount: string;
  // LoanInterestData
  baseReferenceRate: number;
  floorRate: number;
  capRate: number;
  rateMargin: number;
  dayCount: number;
  paymentFrequency: number;
  firstAccrualDate: number;
  prepaymentPenalty: number;
  commitmentFee: number;
  utilizationFee: number;
  utilizationFeeType: number;
  servicingFee: number;
  // RiskData
  internalRiskGrade: string;
  defaultProbability: number;
  lossGivenDefault: number;
  // Collateral
  totalCollateralValue: number;
  loanToValue: number;
  // LoanPerformanceStatus
  performanceStatus: number;
  daysPastDue: number;
}

export async function getLoanDetails(params?: DeepPartial<LoanInitData>) {
  const maturityDate =
    params?.maturityDate ??
    (params?.startingDate
      ? params.startingDate + TIME_PERIODS_S.YEAR
      : (await DEFAULT_BOND_PARAMS.startingDate()) + TIME_PERIODS_S.YEAR);
  return {
    collateral: {
      loanToValue: params?.loanToValue ?? DEFAULT_LOAN_PARAMS.loanToValue,
      totalCollateralValue: params?.totalCollateralValue ?? DEFAULT_LOAN_PARAMS.totalCollateralValue,
    },
    riskData: {
      internalRiskGrade: params?.internalRiskGrade ?? DEFAULT_LOAN_PARAMS.internalRiskGrade,
      defaultProbability: params?.defaultProbability ?? DEFAULT_LOAN_PARAMS.defaultProbability,
      lossGivenDefault: params?.lossGivenDefault ?? DEFAULT_LOAN_PARAMS.lossGivenDefault,
    },
    loanBasicData: {
      currency: params?.currency ?? DEFAULT_LOAN_PARAMS.currency,
      startingDate: params?.startingDate ?? (await DEFAULT_LOAN_PARAMS.startingDate()),
      maturityDate: maturityDate,
      loanStructureType: params?.loanStructureType ?? DEFAULT_LOAN_PARAMS.loanStructureType,
      repaymentType: params?.repaymentType ?? DEFAULT_LOAN_PARAMS.repaymentType,
      interestType: params?.interestType ?? DEFAULT_LOAN_PARAMS.interestType,
      originatorAccount: params?.originatorAccount ?? (await DEFAULT_LOAN_PARAMS.originatorAccount()),
      servicerAccount: params?.servicerAccount ?? (await DEFAULT_LOAN_PARAMS.servicerAccount()),
      signingDate:
        params?.signingDate ??
        (params?.startingDate ? params.startingDate - 1800 : await DEFAULT_LOAN_PARAMS.startingDate()),
    },
    loanInterestData: {
      baseReferenceRate: params?.baseReferenceRate ?? DEFAULT_LOAN_PARAMS.baseReferenceRate,
      floorRate: params?.floorRate ?? DEFAULT_LOAN_PARAMS.floorRate,
      capRate: params?.capRate ?? DEFAULT_LOAN_PARAMS.capRate,
      rateMargin: params?.rateMargin ?? DEFAULT_LOAN_PARAMS.rateMargin,
      dayCount: params?.dayCount ?? DEFAULT_LOAN_PARAMS.dayCount,
      paymentFrequency: params?.paymentFrequency ?? DEFAULT_LOAN_PARAMS.paymentFrequency,
      firstAccrualDate:
        params?.firstAccrualDate ??
        (params?.startingDate ? params.startingDate : await DEFAULT_LOAN_PARAMS.startingDate()),
      prepaymentPenalty: params?.prepaymentPenalty ?? DEFAULT_LOAN_PARAMS.prepaymentPenalty,
      commitmentFee: params?.commitmentFee ?? DEFAULT_LOAN_PARAMS.commitmentFee,
      utilizationFee: params?.utilizationFee ?? DEFAULT_LOAN_PARAMS.utilizationFee,
      utilizationFeeType: params?.utilizationFeeType ?? DEFAULT_LOAN_PARAMS.utilizationFeeType,
      servicingFee: params?.servicingFee ?? DEFAULT_LOAN_PARAMS.servicingFee,
    },
    loanPerformanceStatus: {
      performanceStatus: params?.performanceStatus ?? DEFAULT_LOAN_PARAMS.performanceStatus,
      daysPastDue: params?.daysPastDue ?? DEFAULT_LOAN_PARAMS.daysPastDue,
    },
  };
}
