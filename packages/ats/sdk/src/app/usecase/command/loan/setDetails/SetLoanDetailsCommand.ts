// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetLoanDetailsCommandResponse implements CommandResponse {
  public readonly transactionId: string;

  constructor(transactionId: string) {
    this.transactionId = transactionId;
  }
}

export class SetLoanDetailsCommand extends Command<SetLoanDetailsCommandResponse> {
  constructor(
    public readonly loanId: string,
    public readonly currency: string,
    public readonly startingDate: string,
    public readonly maturityDate: string,
    public readonly loanStructureType: number,
    public readonly repaymentType: number,
    public readonly interestType: number,
    public readonly signingDate: string,
    public readonly originatorAccount: string,
    public readonly servicerAccount: string,
    public readonly baseReferenceRate: number,
    public readonly floorRate: string,
    public readonly capRate: string,
    public readonly rateMargin: string,
    public readonly dayCount: number,
    public readonly paymentFrequency: number,
    public readonly firstAccrualDate: string,
    public readonly prepaymentPenalty: string,
    public readonly commitmentFee: string,
    public readonly utilizationFee: string,
    public readonly utilizationFeeType: number,
    public readonly servicingFee: string,
    public readonly internalRiskGrade: string,
    public readonly defaultProbability: string,
    public readonly lossGivenDefault: string,
    public readonly totalCollateralValue: string,
    public readonly loanToValue: string,
    public readonly performanceStatus: number,
    public readonly daysPastDue: string,
  ) {
    super();
  }
}
