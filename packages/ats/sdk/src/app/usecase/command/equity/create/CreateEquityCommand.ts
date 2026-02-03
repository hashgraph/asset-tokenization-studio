// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import ContractId from "@domain/context/contract/ContractId";
import { DividendType } from "@domain/context/equity/DividendType";
import { SecurityProps } from "@domain/context/security/Security";

export class CreateEquityCommandResponse implements CommandResponse {
  public readonly securityId: ContractId;
  public readonly transactionId: string;

  constructor(securityId: ContractId, transactionId: string) {
    this.securityId = securityId;
    this.transactionId = transactionId;
  }
}

export class CreateEquityCommand extends Command<CreateEquityCommandResponse> {
  constructor(
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
    public readonly factory?: ContractId,
    public readonly resolver?: ContractId,
    public readonly configId?: string,
    public readonly configVersion?: number,
    public readonly diamondOwnerAccount?: string,
    public readonly externalPausesIds?: string[],
    public readonly externalControlListsIds?: string[],
    public readonly externalKycListsIds?: string[],
    public readonly complianceId?: string,
    public readonly identityRegistryId?: string,
  ) {
    super();
  }
}
