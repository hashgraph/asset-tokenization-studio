import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { DividendType } from '../../../../../domain/context/equity/DividendType.js';
import { SecurityProps } from '../../../../../domain/context/security/Security.js';

export class CreateEquityCommandResponse implements CommandResponse {
  public readonly securityId: ContractId;

  constructor(securityId: ContractId) {
    this.securityId = securityId;
  }
}

export class CreateEquityCommand extends Command<CreateEquityCommandResponse> {
  constructor(
    public readonly security: SecurityProps,
    public readonly votingRight: boolean,
    public readonly informationRight: boolean,
    public readonly liquidationRight: boolean,
    public readonly subscriptionRight: boolean,
    public readonly convertionRight: boolean,
    public readonly redemptionRight: boolean,
    public readonly putRight: boolean,
    public readonly dividendRight: DividendType,
    public readonly currency: string,
    public readonly nominalValue: string,
    public readonly factory?: ContractId,
    public readonly resolver?: ContractId,
    public readonly businessLogicKeys?: string[],
    public readonly diamondOwnerAccount?: string,
  ) {
    super();
  }
}
