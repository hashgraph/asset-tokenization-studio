// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import ContractId from "@domain/context/contract/ContractId";
import { SecurityProps } from "@domain/context/security/Security";

export class CreateLoanCommandResponse implements CommandResponse {
  public readonly securityId: ContractId;
  public readonly transactionId: string;

  constructor(securityId: ContractId, transactionId: string) {
    this.securityId = securityId;
    this.transactionId = transactionId;
  }
}

export class CreateLoanCommand extends Command<CreateLoanCommandResponse> {
  constructor(
    public readonly security: SecurityProps,
    public readonly factory: ContractId | undefined,
    public readonly resolver: ContractId | undefined,
    public readonly configId: string | undefined,
    public readonly configVersion: number | undefined,
    public readonly diamondOwnerAccount: string | undefined,
    public readonly currency: string,
    public readonly nominalValue: string,
    public readonly nominalValueDecimals: number,
    public readonly startingDate: string,
    public readonly maturityDate: string,
    public readonly loanStructureType: number,
    public readonly repaymentType: number,
    public readonly interestType: number,
    public readonly originatorAccount: string,
    public readonly servicerAccount: string,
    public readonly signingDate: string,
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
    public readonly externalPausesIds?: string[],
    public readonly externalControlListsIds?: string[],
    public readonly externalKycListsIds?: string[],
    public readonly complianceId?: string,
    public readonly identityRegistryId?: string,
  ) {
    super();
  }
}
