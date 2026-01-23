// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import ContractId from "@domain/context/contract/ContractId";
import { SecurityProps } from "@domain/context/security/Security";

export class CreateTrexSuiteBondCommandResponse implements CommandResponse {
  public readonly securityId: ContractId;
  public readonly transactionId: string;

  constructor(securityId: ContractId, transactionId: string) {
    this.securityId = securityId;
    this.transactionId = transactionId;
  }
}

export class CreateTrexSuiteBondCommand extends Command<CreateTrexSuiteBondCommandResponse> {
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
    public readonly currency: string,
    public readonly nominalValue: string,
    public readonly nominalValueDecimals: number,
    public readonly startingDate: string,
    public readonly maturityDate: string,

    public readonly factory: ContractId,
    public readonly resolver: ContractId,
    public readonly configId: string,
    public readonly configVersion: number,
    public readonly diamondOwnerAccount: string,

    public readonly proceedRecipientsIds?: string[],
    public readonly proceedRecipientsData?: string[],

    public readonly externalPauses?: string[],
    public readonly externalControlLists?: string[],
    public readonly externalKycLists?: string[],

    public readonly compliance?: string,
    public readonly identityRegistry?: string,
  ) {
    super();
  }
}
