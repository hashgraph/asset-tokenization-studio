// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import { SecurityDate } from "../shared/SecurityDate";

export class LoanDetailsData extends ValidatedDomain<LoanDetailsData> {
  public currency: string;
  public startingDate: string;
  public maturityDate: string;
  public loanStructureType: number;
  public repaymentType: number;
  public interestType: number;
  public signingDate: string;
  public originatorAccount: string;
  public servicerAccount: string;
  public baseReferenceRate: number;
  public floorRate: string;
  public capRate: string;
  public rateMargin: string;
  public dayCount: number;
  public paymentFrequency: number;
  public firstAccrualDate: string;
  public prepaymentPenalty: string;
  public commitmentFee: string;
  public utilizationFee: string;
  public utilizationFeeType: number;
  public servicingFee: string;
  public internalRiskGrade: string;
  public defaultProbability: string;
  public lossGivenDefault: string;
  public totalCollateralValue: string;
  public loanToValue: string;
  public performanceStatus: number;
  public daysPastDue: string;

  constructor(
    currency: string,
    startingDate: string,
    maturityDate: string,
    loanStructureType: number,
    repaymentType: number,
    interestType: number,
    signingDate: string,
    originatorAccount: string,
    servicerAccount: string,
    baseReferenceRate: number,
    floorRate: string,
    capRate: string,
    rateMargin: string,
    dayCount: number,
    paymentFrequency: number,
    firstAccrualDate: string,
    prepaymentPenalty: string,
    commitmentFee: string,
    utilizationFee: string,
    utilizationFeeType: number,
    servicingFee: string,
    internalRiskGrade: string,
    defaultProbability: string,
    lossGivenDefault: string,
    totalCollateralValue: string,
    loanToValue: string,
    performanceStatus: number,
    daysPastDue: string,
  ) {
    super({
      maturityDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(this.startingDate));
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

    ValidatedDomain.handleValidation(LoanDetailsData.name, this);
  }
}
