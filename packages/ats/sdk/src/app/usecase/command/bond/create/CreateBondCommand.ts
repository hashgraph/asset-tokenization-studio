// SPDX-License-Identifier: Apache-2.0

import { Command } from '@core/command/Command';
import { CommandResponse } from '@core/command/CommandResponse';
import ContractId from '@domain/context/contract/ContractId';
import { SecurityProps } from '@domain/context/security/Security';

export class CreateBondCommandResponse implements CommandResponse {
  public readonly securityId: ContractId;
  public readonly transactionId: string;

  constructor(securityId: ContractId, transactionId: string) {
    this.securityId = securityId;
    this.transactionId = transactionId;
  }
}

export class CreateBondCommand extends Command<CreateBondCommandResponse> {
  constructor(
    public readonly security: SecurityProps,
    public readonly currency: string,
    public readonly nominalValue: string,
    public readonly nominalValueDecimals: number,
    public readonly startingDate: string,
    public readonly maturityDate: string,
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
    public readonly proceedRecipientsIds?: string[],
    public readonly proceedRecipientsData?: string[],
  ) {
    super();
  }
}
