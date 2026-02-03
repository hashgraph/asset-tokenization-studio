// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import ContractId from "@domain/context/contract/ContractId";
import { SecurityProps } from "@domain/context/security/Security";
import { DividendType } from "@domain/context/equity/DividendType";

export class CreateTrexSuiteEquityCommandResponse implements CommandResponse {
  public readonly securityId: ContractId;
  public readonly transactionId: string;

  constructor(securityId: ContractId, transactionId: string) {
    this.securityId = securityId;
    this.transactionId = transactionId;
  }
}

export class CreateTrexSuiteEquityCommand extends Command<CreateTrexSuiteEquityCommandResponse> {
  constructor(
    public readonly salt: string,
    public readonly owner: string,
    public readonly irs: string,
    public readonly onchainId: string,
    public readonly irAgents: string[],
    public readonly tokenAgents: string[],
    public readonly compliancesModules: string[],
    public readonly complianceSettings: string[],
    public readonly claimTopics: number[],
    public readonly issuers: string[],
    public readonly issuerClaims: number[][],

    public readonly security: SecurityProps,
    public readonly votingRight: boolean,
    public readonly informationRight: boolean,
    public readonly liquidationRight: boolean,
    public readonly subscriptionRight: boolean,
    public readonly conversionRight: boolean,
    public readonly redemptionRight: boolean,
    public readonly putRight: boolean,
    public readonly dividendRight: DividendType,
    public readonly currency: string,
    public readonly nominalValue: string,
    public readonly nominalValueDecimals: number,
    public readonly factory: ContractId,
    public readonly resolver: ContractId,
    public readonly configId: string,
    public readonly configVersion: number,
    public readonly diamondOwnerAccount: string,

    public readonly externalPauses?: string[],
    public readonly externalControlLists?: string[],
    public readonly externalKycLists?: string[],

    public readonly compliance?: string,
    public readonly identityRegistry?: string,
  ) {
    super();
  }
}
